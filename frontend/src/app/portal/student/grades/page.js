"use client";

import { useState, useEffect } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetAssignmentsQuery } from "@/redux/api/assignmentApi";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useGetClassesQuery } from "@/redux/api/classApi";
import { useToast } from "@/components/Toast";
import DataTable from "@/components/DataTable";

export default function GradesPage() {
  const { isDark } = useDarkMode();
  const { showToast } = useToast();
  const { data: user } = useGetCurrentUserQuery();
  const { data: classes } = useGetClassesQuery();
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState("");

  // Default to student's current class
  useEffect(() => {
    if (user?.class_id && !selectedClassId) {
      setSelectedClassId(user.class_id);
    }
  }, [user, selectedClassId]);

  // Fetch assignments for the selected class
  const { data: allAssignments, isLoading } = useGetAssignmentsQuery({
    class_id: selectedClassId
  }, { skip: !selectedClassId });

  // Filter for graded assignments
  const grades = allAssignments?.filter(a => a.submission_status === 'graded') || [];

  const handleDownloadFeedbackFile = async (fileUrl) => {
    if (!fileUrl) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/files/download/${fileUrl}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Failed to download file");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileNameParts = fileUrl.split('-');
      const displayFileName = fileNameParts.length > 2 ? fileNameParts.slice(2).join('-') : fileUrl;

      a.download = displayFileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast("Download started", "success");
    } catch (error) {
      console.error("Download error:", error);
      showToast("Failed to download file. Please try again.", "error");
    }
  };

  const columns = [
    {
      key: "title",
      label: "Assignment Title",
      width: "300px",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 dark:text-white">{row.title}</span>
          {row.unit && <span className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-bold tracking-tighter">Unit: {row.unit}</span>}
        </div>
      )
    },
    {
      key: "type",
      label: "Type",
      width: "150px",
      render: (row) => {
        const types = {
          test: { label: "Test", class: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800" },
          course_work: { label: "Course Work", class: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800" },
          writing_task: { label: "Writing Task", class: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800" }
        };
        const config = types[row.type] || { label: row.type, class: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700" };
        return (
          <span className={`px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-full border ${config.class}`}>
            {config.label}
          </span>
        );
      }
    },
    {
      key: "score",
      label: "Grade / Marks",
      width: "150px",
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{row.score}</span>
          <span className="text-[10px] font-medium text-gray-400">/ {row.total_points || 100}</span>
        </div>
      )
    },
    {
      key: "submission_date",
      label: "Date Graded",
      width: "180px",
      render: (row) => (
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {row.submission_date ? new Date(row.submission_date).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', year: 'numeric'
          }) : "N/A"}
        </span>
      )
    },
    {
      key: "actions",
      label: "View Report",
      width: "120px",
      render: (row) => (
        <button
          onClick={() => setSelectedGrade(row)}
          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-all active:scale-95"
          title="View Detailed Report"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      )
    }
  ];

  return (
    <div className={`min-h-screen transition-colors px-10 py-10 pt-24 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="w-full max-w-full mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold uppercase tracking-tight">MY ACADEMIC GRADES</h1>
          <p className="text-sm text-gray-500 mt-1">Review your performance and instructor feedback across all academic levels.</p>
        </div>

        {/* Level Selection Box */}
        <div className={`p-5 rounded-2xl border mb-8 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="max-w-xs">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Select Your Level / Class</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
            >
              <option value="">Select Level</option>
              {classes?.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.class_name}</option>
              ))}
            </select>
          </div>
        </div>

        <DataTable
          title="Graded Assessments"
          columns={columns}
          data={grades}
          isLoading={isLoading}
          showAddButton={false}
          emptyMessage={!selectedClassId ? "Please select a level to view your grades." : "You don't have any graded assessments for this level."}
        />
      </div>

      {/* View Modal */}
      {selectedGrade && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedGrade(null)} />
          <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border flex flex-col max-h-[90vh] ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            {/* Modal Header */}
            <div className={`px-8 py-6 border-b flex items-center justify-between ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50/50'}`}>
              <div>
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedGrade.title}</h2>
                <p className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-bold tracking-widest mt-0.5">Assessment Result Details</p>
              </div>
              <button onClick={() => setSelectedGrade(null)} className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Score Highlights */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-6 rounded-2xl border ${isDark ? 'bg-blue-600/5 border-blue-500/10' : 'bg-blue-50 border-blue-100'}`}>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-2">Earned Marks</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">{selectedGrade.score}</span>
                    <span className="text-sm font-semibold opacity-40">/ {selectedGrade.total_points || 100}</span>
                  </div>
                </div>
                <div className={`p-6 rounded-2xl border ${isDark ? 'bg-green-600/5 border-green-500/10' : 'bg-green-50 border-green-100'}`}>
                  <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-widest block mb-2">Percentage</span>
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                    {Math.round((selectedGrade.score / (selectedGrade.total_points || 100)) * 100)}%
                  </div>
                </div>
              </div>

              {/* Feedback Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-blue-600 rounded-full" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Instructor Feedback</h3>
                </div>

                <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-900/30 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                  {selectedGrade.feedback ? (
                    <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {selectedGrade.feedback}
                    </p>
                  ) : (
                    <p className="text-sm italic opacity-40">No written feedback provided.</p>
                  )}

                  {selectedGrade.feedback_file_url && (
                    <button
                      onClick={() => handleDownloadFeedbackFile(selectedGrade.feedback_file_url)}
                      className={`mt-6 inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl border text-sm font-bold transition-all
                                                ${isDark
                          ? 'bg-blue-600/10 border-blue-500/20 text-blue-400 hover:bg-blue-600/20'
                          : 'bg-white border-blue-100 text-blue-600 hover:bg-blue-50 shadow-sm'
                        }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Feedback Document
                    </button>
                  )}
                </div>
              </div>

              {/* Submission Content */}
              {selectedGrade.content && (
                <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-blue-600 rounded-full" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Submitted Content</h3>
                  </div>
                  <div className={`p-6 rounded-2xl border text-sm leading-relaxed whitespace-pre-wrap ${isDark ? 'bg-gray-900/50 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                    {selectedGrade.content}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className={`px-8 py-5 border-t flex justify-end ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50/50'}`}>
              <button
                onClick={() => setSelectedGrade(null)}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
