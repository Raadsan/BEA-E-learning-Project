"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetPlacementTestsQuery, useGetStudentPlacementResultsQuery } from "@/redux/api/placementTestApi";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";

export default function PlacementTestPage() {
  const router = useRouter();
  const { isDark } = useDarkMode();
  const { data: tests, isLoading: testsLoading, error } = useGetPlacementTestsQuery();

  const { data: user, isLoading: userLoading } = useGetCurrentUserQuery();
  const studentIdForResults = user?.id || user?.student_id;
  const { data: results, isLoading: resultsLoading } = useGetStudentPlacementResultsQuery(studentIdForResults, {
    skip: !studentIdForResults,
  });

  // Determine the active test (deterministically random for each student)
  const activeTest = React.useMemo(() => {
    if (!tests || tests.length === 0) return null;
    const activeTests = tests.filter(t => t.status === 'active');
    if (activeTests.length === 0) return tests[0];

    // Simple deterministic hash based on student_id to pick a test
    const studentId = user.id || user.student_id || "guest";
    let hash = 0;
    for (let i = 0; i < studentId.toString().length; i++) {
      hash = (hash << 5) - hash + studentId.toString().charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }

    const index = Math.abs(hash) % activeTests.length;
    return activeTests[index];
  }, [tests, user.id, user.student_id]);

  const hasTakenTest = results?.find(r => r.student_id === (user.id || user.student_id)); // Check for any placement test taken by this student

  React.useEffect(() => {
    if (hasTakenTest) {
      router.replace(`/portal/student/placement-test/results?id=${hasTakenTest.id}`);
    }
  }, [hasTakenTest, router]);

  // Check if 24-hour window has expired
  const isExpired = React.useMemo(() => {
    if (!user?.expiry_date) return false;

    const getParsedExpiry = (dateVal) => {
      if (!dateVal) return null;
      if (dateVal instanceof Date) return dateVal;
      const dStr = dateVal.toString();
      const isoStr = dStr.includes('T') ? dStr : dStr.replace(' ', 'T');
      const finalStr = isoStr.includes('Z') || isoStr.includes('+') ? isoStr : `${isoStr}Z`;
      const d = new Date(finalStr);
      return isNaN(d.getTime()) ? null : d;
    };

    const expiry = getParsedExpiry(user.expiry_date);
    if (!expiry) return false;
    return new Date() > expiry;
  }, [user?.expiry_date]);

  const isLoading = testsLoading || resultsLoading || userLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isExpired && !hasTakenTest) {
    return (
      <div className="flex h-screen items-center justify-center p-8">
        <div className={`p-12 rounded-3xl border shadow-xl text-center max-w-lg w-full ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Entry Window Expired</h2>
          <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Your 24-hour window to enter the placement test has closed. To ensure fairness and security, tests must be taken within the authorized timeframe after registration.
          </p>
          <button
            onClick={() => router.push('/portal/student')}
            className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-xl transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!activeTest) {
    return (
      <div className="flex h-screen items-center justify-center p-8">
        <div className={`p-8 rounded-xl border text-center max-w-lg w-full ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
          <p className="text-lg">No active placement tests found. Please contact support.</p>
        </div>
      </div>
    );
  }

  // Parse questions if they are a string
  const questionsList = typeof activeTest.questions === 'string' ? JSON.parse(activeTest.questions) : activeTest.questions;

  return (
    <main className={`flex-1 overflow-y-auto ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="w-full px-8 pt-6 pb-6 flex items-center justify-center min-h-full">
        <div className={`rounded-3xl shadow-lg p-12 max-w-2xl w-full border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>

          {/* Header Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>

          <h1 className={`text-3xl font-bold text-center mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {activeTest.title}
          </h1>

          <p className={`text-center mb-10 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {activeTest.description || "This test will help us determine your current English proficiency level and recommend the most suitable course for you."}
          </p>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className={`p-6 rounded-2xl flex flex-col items-center justify-center ${isDark ? 'bg-gray-750' : 'bg-gray-50'}`}>
              <span className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Questions</span>
              <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{questionsList?.length || 0}</span>
            </div>
            <div className={`p-6 rounded-2xl flex flex-col items-center justify-center ${isDark ? 'bg-gray-750' : 'bg-gray-50'}`}>
              <span className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Duration</span>
              <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{activeTest.duration_minutes} minutes</span>
            </div>
          </div>

          {/* Test Instructions */}
          <div className={`p-8 rounded-2xl mb-10 ${isDark ? 'bg-blue-900/10' : 'bg-blue-50/50'}`}>
            <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Test Instructions
            </h2>
            <ul className={`space-y-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 mt-1">•</span>
                <span>Read each question carefully before answering</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 mt-1">•</span>
                <span>You can navigate between questions using the navigation buttons</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 mt-1">•</span>
                <span>Make sure to answer all questions before submitting</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 mt-1">•</span>
                <span>The test must be completed in one session</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center justify-center gap-4">
            {hasTakenTest ? (
              <>
                <div className={`text-center p-3 rounded-lg border ${isDark ? 'bg-green-900/20 border-green-800 text-green-400' : 'bg-green-50 border-green-200 text-green-700'} w-full`}>
                  You have already completed this placement test.
                </div>
                <button
                  onClick={() => router.push(`/portal/student/placement-test/results?id=${hasTakenTest.id}`)}
                  className="px-12 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-green-500/20 w-full max-w-xs"
                >
                  View My Results
                </button>
              </>
            ) : (
              <button
                onClick={() => router.push(`/portal/student/placement-test/take?id=${activeTest.id}`)}
                className="px-12 py-3 bg-[#010080] hover:bg-[#000060] text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-blue-900/20 w-full max-w-xs"
              >
                Start Placement Test
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
