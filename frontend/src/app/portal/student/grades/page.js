"use client";

import { useState, useEffect, useMemo } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useGetMyClassesQuery } from "@/redux/api/studentApi";
import { useToast } from "@/components/Toast";
import DataTable from "@/components/DataTable";

export default function GradesPage() {
  const { isDark } = useDarkMode();
  const { showToast } = useToast();
  const { data: user } = useGetCurrentUserQuery();
  const { data: myClasses, isLoading: classesLoading } = useGetMyClassesQuery();
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedSubprogramName, setSelectedSubprogramName] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Extract unique levels from myClasses using useMemo to prevent recalculation
  const levels = useMemo(() => {
    return myClasses?.reduce((acc, cls) => {
      if (cls.subprogram_name && !acc.find(l => l.subprogram_name === cls.subprogram_name)) {
        acc.push({
          subprogram_id: cls.subprogram_id, // Use actual subprogram_id from class data
          subprogram_name: cls.subprogram_name,
          program_name: cls.program_name
        });
      }
      return acc;
    }, []) || [];
  }, [myClasses]);

  // Auto-select current level
  useEffect(() => {
    if (levels.length > 0 && !selectedSubprogramName) {
      setSelectedSubprogramName(levels[0].subprogram_name);
    }
  }, [levels.length, selectedSubprogramName]);

  // Fetch assignments for selected level using subprogram_id
  useEffect(() => {
    if (!selectedSubprogramName) return;

    const fetchAssignments = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");

        // Get the subprogram_id for the selected level
        const selectedLevel = levels.find(l => l.subprogram_name === selectedSubprogramName);

        if (!selectedLevel) {
          setIsLoading(false);
          return;
        }

        // Fetch assignments using subprogram_id parameter
        const url = `http://localhost:5000/api/assignments?subprogram_id=${selectedLevel.subprogram_id}`;

        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        let assignmentsList = [];
        if (Array.isArray(data)) {
          assignmentsList = data;
        } else if (data.success && Array.isArray(data.assignments)) {
          assignmentsList = data.assignments;
        } else if (data.assignments) {
          assignmentsList = data.assignments;
        }

        setAssignments(assignmentsList);
      } catch (error) {
        console.error("Error fetching assignments:", error);
        setAssignments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, [selectedSubprogramName]);

  // Show ALL assignments returned by the API
  const grades = (assignments || []).filter(a => a).map((a, index) => ({
    ...a,
    _id: a.id ? `${a.type || 'item'}-${a.id}` : `grade-${index}`
  }));

  // Calculate metrics
  const totalEarnedMarks = grades.reduce((sum, g) => sum + (Number(g?.score) || 0), 0);
  const totalPossibleMarks = grades.reduce((sum, g) => sum + (Number(g?.total_points) || 0), 0);
  const successRate = totalPossibleMarks > 0 ? Math.round((totalEarnedMarks / totalPossibleMarks) * 100) : 0;

  const handleDownloadFeedbackFile = async (fileUrl) => {
    if (!fileUrl) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/files/download/${fileUrl}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileUrl.split('/').pop();
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      showToast("Failed to download file", "error");
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Assignment Title',
      render: (_, row) => {
        if (!row) return null;
        return (
          <div>
            <div className={isDark ? 'text-white' : 'text-gray-900'}>{row?.title}</div>
            <div className="text-xs text-gray-500">{row?.type}</div>
          </div>
        )
      }
    },
    {
      key: 'score',
      label: 'Grade / Marks',
      render: (_, row) => {
        if (!row) return null;
        return (
          <div className={isDark ? 'text-white' : 'text-gray-900'}>
            {row.submission_status === 'graded'
              ? `${row.score} / ${row.total_points || 100}`
              : <span className={`text-xs uppercase font-bold px-2 py-1 rounded ${!row.submission_status ? 'text-gray-500 bg-gray-100 dark:bg-gray-800' :
                row.submission_status === 'submitted' ? 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30' :
                  'text-blue-500 bg-blue-100 dark:bg-blue-900/30'
                }`}>
                {!row.submission_status ? 'Not Submitted' :
                  row.submission_status === 'submitted' ? 'Pending Grading' :
                    row.submission_status}
              </span>
            }
          </div>
        )
      }
    },
    {
      key: 'graded_at',
      label: 'Date',
      render: (_, row) => {
        if (!row) return null;
        return (
          <div className={isDark ? 'text-white' : 'text-gray-900'}>
            {row.graded_at || row.submission_date
              ? new Date(row.graded_at || row.submission_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
              : <span className="text-gray-400 text-xs italic">Pending</span>}
          </div>
        )
      }
    },
    {
      key: 'actions',
      label: 'Action',
      render: (_, row) => {
        if (!row) return null;
        return (
          <button
            onClick={() => setSelectedGrade(row)}
            className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isDark
              ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
          >
            <span>View Report</span>
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )
      }
    }
  ];

  return (
    <div className={`min-h-screen transition-colors px-6 pt-8 pb-10 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="w-full max-w-full mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">My Academic Grades</h1>
          <p className="text-gray-500 dark:text-gray-400">Track your progress and review instructor feedback.</p>
        </div>

        {/* Academic Summary Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Level Selection */}
          <div className={`col-span-1 p-4 rounded-xl border transition-all ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Select Level</label>
            <div className="relative">
              <select
                value={selectedSubprogramName}
                onChange={(e) => setSelectedSubprogramName(e.target.value)}
                className={`w-full appearance-none pl-3 pr-8 py-2 rounded-lg border text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all ${isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
              >
                <option value="">{classesLoading ? "Loading..." : "Select Level"}</option>
                {levels?.map(level => (
                  <option key={level.subprogram_name} value={level.subprogram_name}>
                    {level.subprogram_name}
                  </option>
                ))}
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {/* Program Info */}
          <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Program</span>
            <div className={`text-sm font-medium line-clamp-1 ${isDark ? 'text-white' : 'text-black'}`}>
              {user?.chosen_program || user?.exam_type || "General Program"}
            </div>
          </div>

          {/* Cumulative Marks */}
          <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Marks</span>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {grades.length > 0 ? totalEarnedMarks : "000"}
              </span>
              <span className="text-sm font-medium opacity-40">/ {totalPossibleMarks || "000"}</span>
            </div>
          </div>

          {/* Success Rate */}
          <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Success Rate</span>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {grades.length > 0 ? `${successRate}%` : "0%"}
            </div>
          </div>
        </div>


        <div className={`rounded-3xl border shadow-sm overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold">Academic Records</h2>
          </div>
          <DataTable
            columns={columns}
            data={grades}
            isLoading={isLoading}
            showAddButton={false}
            emptyMessage="No assignments found for this level yet."
            headerClassName="hidden"
          />
        </div>
      </div >

      {/* View Modal */}
      {
        selectedGrade && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedGrade(null)} />
            <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border flex flex-col max-h-[90vh] ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              {/* Modal Header */}
              <div className={`px-8 py-6 border-b flex items-center justify-between ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'}`}>
                <div>
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedGrade.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                      {selectedGrade.type}
                    </span>
                    <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {selectedGrade.graded_at || selectedGrade.submission_date ? new Date(selectedGrade.graded_at || selectedGrade.submission_date).toLocaleDateString() : ''}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedGrade(null)} className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className={`flex-1 overflow-y-auto px-8 py-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="space-y-6">
                  {/* Score Section */}
                  <div>
                    <h3 className={`text-sm uppercase tracking-wide mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Your Score</h3>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{selectedGrade.score}</span>
                      <span className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>/ {selectedGrade.total_points || 100}</span>
                      <span className={`ml-4 text-2xl ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        ({Math.round((selectedGrade.score / (selectedGrade.total_points || 100)) * 100)}%)
                      </span>
                    </div>
                  </div>

                  {/* Feedback Section */}
                  {selectedGrade.feedback && (
                    <div>
                      <h3 className={`text-sm uppercase tracking-wide mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Instructor Feedback</h3>
                      <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                        <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>{selectedGrade.feedback}</p>
                      </div>
                    </div>
                  )}

                  {/* Feedback File */}
                  {selectedGrade.feedback_file && (
                    <div>
                      <h3 className={`text-sm uppercase tracking-wide mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Attached Feedback File</h3>
                      <button
                        onClick={() => handleDownloadFeedbackFile(selectedGrade.feedback_file)}
                        className={`px-4 py-2 rounded-lg transition-all ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                      >
                        Download Feedback File
                      </button>
                    </div>
                  )}

                  {/* Graded Date */}
                  <div>
                    <h3 className={`text-sm uppercase tracking-wide mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Graded On</h3>
                    <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      {selectedGrade.graded_at ? new Date(selectedGrade.graded_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className={`px-8 py-4 border-t ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50/50'}`}>
                <button
                  onClick={() => setSelectedGrade(null)}
                  className={`w-full px-4 py-2 rounded-lg transition-all ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
