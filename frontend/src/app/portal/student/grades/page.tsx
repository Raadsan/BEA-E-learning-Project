"use client";

import { useState, useEffect, useMemo } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetCurrentUserQuery } from "@/lib/api/authApi";
import { useGetMyClassesQuery } from "@/lib/api/studentApi";
import { useToast } from "@/components/Toast";
import DataTable from "@/components/DataTable";
import StudentPageHeader from "@/components/student/StudentPageHeader";
import { API_URL } from "@/constants";
import { openOrDownloadFeedbackFile, parseEmbeddedFeedbackFile, resolveFeedbackFileUrl, isPdfFileUrl } from "@/utils/feedbackFiles";
import { getAssignmentWindowStatus } from "@/utils/assignmentTime";

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
          subprogram_id: cls.subprogram_id,
          subprogram_name: cls.subprogram_name,
          program_name: cls.program_name,
          class_id: cls.class_id,
        });
      }
      return acc;
    }, []) || [];
  }, [myClasses]);

  const selectedLevel = useMemo(
    () => levels.find((l) => l.subprogram_name === selectedSubprogramName),
    [levels, selectedSubprogramName]
  );

  const belongsToStudentClass = (assignment, level, studentClassId) => {
    if (!assignment) return false;

    const classId = level?.class_id || studentClassId;
    if (classId) {
      if (assignment.class_id) {
        return Number(assignment.class_id) === Number(classId);
      }
      // Program-wide exams for this subprogram still belong to the class level
      if (level?.subprogram_id && assignment.subprogram_id) {
        return Number(assignment.subprogram_id) === Number(level.subprogram_id);
      }
      return false;
    }

    if (level?.subprogram_id && assignment.subprogram_id) {
      return Number(assignment.subprogram_id) === Number(level.subprogram_id);
    }

    return assignment.subprogram_name === level?.subprogram_name;
  };

  // Auto-select current level (prefer student's enrolled subprogram)
  useEffect(() => {
    if (levels.length > 0 && !selectedSubprogramName) {
      const currentLevel = levels.find(
        (level) =>
          level.subprogram_name === user?.chosen_subprogram_name ||
          String(level.subprogram_id) === String(user?.chosen_subprogram)
      );
      setSelectedSubprogramName(currentLevel?.subprogram_name || levels[0].subprogram_name);
    }
  }, [levels, user?.chosen_subprogram, user?.chosen_subprogram_name, selectedSubprogramName]);

  // Fetch assignments for selected level using subprogram_id
  useEffect(() => {
    if (!selectedSubprogramName) return;

    const fetchAssignments = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");

        // Get the subprogram_id for the selected level
        const level = levels.find(l => l.subprogram_name === selectedSubprogramName);

        if (!level) {
          setIsLoading(false);
          return;
        }

        const params = new URLSearchParams();
        if (level.subprogram_id) {
          params.set("subprogram_id", String(level.subprogram_id));
        }
        if (level.class_id) {
          params.set("class_id", String(level.class_id));
        } else if (user?.class_id) {
          params.set("class_id", String(user.class_id));
        }

        const url = `${API_URL}/assignments?${params.toString()}`;

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
  }, [selectedSubprogramName, levels, user?.class_id]);

  // All assignments for the student's class / selected level only
  const grades = useMemo(() => {
    return (assignments || [])
      .filter((a) => belongsToStudentClass(a, selectedLevel, user?.class_id))
      .map((a, index) => ({
        ...a,
        _id: a.id ? `${a.type || "item"}-${a.id}` : `grade-${index}`,
      }));
  }, [assignments, selectedLevel, user?.class_id]);

  const gradeMetrics = useMemo(() => {
    const now = new Date();

    // Real grade: count every assigned task except those not yet open (upcoming).
    // Earned marks come only from graded submissions; unsubmitted tasks count as 0.
    const accountable = grades.filter((g) => {
      const windowStatus = getAssignmentWindowStatus(g, now);
      return windowStatus !== "pending";
    });

    const gradedRecords = accountable.filter((g) => g.submission_status === "graded");

    const totalEarnedMarks = accountable.reduce((sum, g) => {
      if (g.submission_status === "graded") {
        return sum + (Number(g.score) || 0);
      }
      return sum;
    }, 0);

    const totalPossibleMarks = accountable.reduce(
      (sum, g) => sum + (Number(g.total_points) || 100),
      0
    );

    const successRate =
      totalPossibleMarks > 0
        ? Math.round((totalEarnedMarks / totalPossibleMarks) * 100)
        : 0;

    return {
      accountable,
      gradedRecords,
      totalEarnedMarks,
      totalPossibleMarks,
      successRate,
      gradedCount: gradedRecords.length,
      accountableCount: accountable.length,
    };
  }, [grades]);

  const {
    gradedRecords,
    totalEarnedMarks,
    totalPossibleMarks,
    successRate,
    gradedCount,
    accountableCount,
  } = gradeMetrics;

  const getSubmissionLabel = (row) => {
    if (row.submission_status === "graded") {
      return `${row.score} / ${row.total_points || 100}`;
    }
    if (row.submission_status === "submitted") {
      return "pending";
    }
    if (getAssignmentWindowStatus(row, new Date()) === "complete") {
      return "missed";
    }
    return "open";
  };

  const handleDownloadFeedbackFile = async (fileUrl, fileName) => {
    if (!fileUrl) return;
    try {
      const action = await openOrDownloadFeedbackFile(fileUrl, fileName);
      showToast(action === "open" ? "Opening file in browser..." : "Downloading file...", "success");
    } catch {
      showToast("Could not open the feedback file", "error");
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
        const label = getSubmissionLabel(row);

        if (label !== "pending" && label !== "missed" && label !== "open") {
          return <div className={isDark ? "text-white" : "text-gray-900"}>{label}</div>;
        }

        const badgeClass =
          label === "pending"
            ? "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30"
            : label === "missed"
              ? "text-red-600 bg-red-100 dark:bg-red-900/30"
              : "text-gray-500 bg-gray-100 dark:bg-gray-800";

        const badgeText =
          label === "pending"
            ? "Pending Grading"
            : label === "missed"
              ? "Not Submitted (Closed)"
              : "Not Submitted";

        return (
          <div className={isDark ? "text-white" : "text-gray-900"}>
            <span className={`text-xs uppercase font-bold px-2 py-1 rounded ${badgeClass}`}>
              {badgeText}
            </span>
          </div>
        );
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
    <div className={`min-h-screen transition-colors px-6 pt-4 pb-10 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="w-full max-w-full mx-auto">
        <StudentPageHeader
          title="My Academic Grades"
          description="Track your progress and review instructor feedback."
        />

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
                {accountableCount > 0 ? totalEarnedMarks : "0"}
              </span>
              <span className="text-sm font-medium opacity-40">/ {accountableCount > 0 ? totalPossibleMarks : "0"}</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              {gradedCount} graded of {accountableCount} due
            </p>
          </div>

          {/* Success Rate */}
          <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Success Rate</span>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {accountableCount > 0 ? `${successRate}%` : "0%"}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Based on submitted &amp; closed tasks</p>
          </div>
        </div>


        <div className={`rounded-3xl border shadow-sm overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold">Academic Records</h2>
          </div>
          <DataTable
            columns={columns}
            data={grades}
            getRowId={(row) => row._id || `${row.type || "item"}-${row.id}`}
            isLoading={isLoading}
            showAddButton={false}
            emptyMessage="No assignments found for your class yet."
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

                  {(() => {
                    const embedded = parseEmbeddedFeedbackFile(selectedGrade.feedback);
                    const fileUrl = resolveFeedbackFileUrl(selectedGrade.feedback, selectedGrade.feedback_file);
                    const feedbackText = embedded.text || (fileUrl ? "" : (selectedGrade.feedback || ""));

                    return (
                      <>
                        {feedbackText && (
                          <div>
                            <h3 className={`text-sm uppercase tracking-wide mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Instructor Feedback</h3>
                            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                              <p className={`whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{feedbackText}</p>
                            </div>
                          </div>
                        )}

                        {fileUrl && (
                          <div>
                            <h3 className={`text-sm uppercase tracking-wide mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Attached Feedback File</h3>
                            <button
                              onClick={() => handleDownloadFeedbackFile(fileUrl, embedded.fileName)}
                              className={`px-4 py-2 rounded-lg transition-all ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                            >
                              {isPdfFileUrl(fileUrl) ? "Open in Browser" : "Download"} Feedback File
                            </button>
                          </div>
                        )}
                      </>
                    );
                  })()}

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
