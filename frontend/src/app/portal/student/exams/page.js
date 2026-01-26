"use client";

import { useState, useEffect, useMemo } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetAssignmentsQuery, useSubmitAssignmentMutation } from "@/redux/api/assignmentApi";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useToast } from "@/components/Toast";
import Loader from "@/components/Loader";
import { useRouter } from "next/navigation";

export default function ExamsPage() {
  const { isDark } = useDarkMode();
  const { showToast } = useToast();
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useGetCurrentUserQuery();
  // Use localStorage as a fallback for user data to avoid blocking the UI
  const localUser = useMemo(() => {
    if (typeof window !== "undefined") {
      try {
        return JSON.parse(localStorage.getItem("user") || "{}");
      } catch (e) {
        return null;
      }
    }
    return null;
  }, []);

  // Prepare query parameters - Memoized to prevent render loops
  const queryParams = useMemo(() => {
    const activeUser = user || localUser;
    if (!activeUser || !activeUser.id) return null;

    const params = {
      class_id: activeUser.class_id,
      subprogram_id: activeUser.chosen_subprogram ? Number(activeUser.chosen_subprogram) : undefined,
      type: "exam"
    };

    if (activeUser.chosen_program && !isNaN(Number(activeUser.chosen_program))) {
      params.program_id = Number(activeUser.chosen_program);
    }

    return params;
  }, [user, localUser]);

  const { data: tests, isLoading: testsLoading, error } = useGetAssignmentsQuery(
    queryParams,
    { skip: !queryParams }
  );

  useEffect(() => {
    if (error) {
      console.error("Error fetching exams:", error);
      showToast("Failed to load exams", "error");
    }
  }, [error, showToast]);

  const [submitAssignment] = useSubmitAssignmentMutation();
  const [selectedTest, setSelectedTest] = useState(null);

  const handleOpenTest = (test) => {
    if (test.submission_status === 'submitted' || test.submission_status === 'graded') {
      router.push(`/portal/student/exams/results?id=${test.id}`);
    } else {
      router.push(`/portal/student/exams/take?id=${test.id}`);
    }
  };

  return (
    <div className={`min-h-screen transition-colors pt-4 w-full px-6 sm:px-10 pb-20 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Exams
        </h1>
        <p className={`text-sm opacity-60 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Access your exams assignments and submit your work.
        </p>
      </div>

      {/* Main Content Area */}
      {testsLoading && !tests ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mb-4"></div>
          <p className="text-sm font-bold text-blue-600 uppercase tracking-widest animate-pulse">Loading Assessments...</p>
        </div>
      ) : (!tests || tests.filter(t => t.status !== 'inactive').length === 0) ? (
        <div className={`p-16 rounded-xl border-2 border-dashed text-center ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <svg className={`w-10 h-10 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No Active Exams</h3>
          <p className="text-gray-400">No active exams assignments yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.filter(t => t.status !== 'inactive').map((test) => {
            const isGraded = test.submission_status === 'graded';
            const isSubmitted = test.submission_status === 'submitted';
            const isPending = !isSubmitted && !isGraded;

            return (
              <div
                key={test.id}
                onClick={() => handleOpenTest(test)}
                className={`relative p-6 rounded-xl border transition-all cursor-pointer hover:shadow-lg group ${isDark
                  ? 'bg-gray-800 border-gray-700 hover:border-blue-500'
                  : 'bg-white border-gray-200 hover:border-blue-400'
                  }`}
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isGraded
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                    : isSubmitted
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                    }`}>
                    {isGraded ? 'Graded' : isSubmitted ? 'Submitted' : 'Pending'}
                  </span>
                </div>

                {/* Test Icon */}
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'
                  }`}>
                  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>

                {/* Test Title */}
                <h3 className={`text-xl font-bold mb-3 line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {test.title}
                </h3>

                {/* Test Info */}
                <div className="space-y-2 mb-4">
                  {test.program_name && (
                    <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span className="font-medium">{test.program_name}</span>
                    </div>
                  )}

                  {test.subprogram_name && (
                    <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span>{test.subprogram_name}</span>
                    </div>
                  )}

                  {test.duration && (
                    <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{test.duration} minutes</span>
                    </div>
                  )}
                </div>

                {/* Date Range */}
                <div className={`pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                  {test.start_date && test.end_date ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          Start Date
                        </div>
                        <div className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {new Date(test.start_date).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          End Date
                        </div>
                        <div className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {new Date(test.end_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ) : test.due_date ? (
                    <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Due: {new Date(test.due_date).toLocaleDateString()}</span>
                    </div>
                  ) : (
                    <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No due date</div>
                  )}
                </div>

                {/* Score Display */}
                {isGraded && (
                  <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Your Score
                      </span>
                      <span className="text-xl font-bold text-green-600 dark:text-green-400">
                        {test.score} / {test.total_points}
                      </span>
                    </div>
                  </div>
                )}

                {/* Points Display for Pending/Submitted */}
                {!isGraded && (
                  <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total Points
                      </span>
                      <span className={`text-lg font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                        {test.total_points}
                      </span>
                    </div>
                  </div>
                )}

                {/* Hover Effect Arrow */}
                <div className={`absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
