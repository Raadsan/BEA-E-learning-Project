"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetStudentPlacementResultsQuery } from "@/redux/api/placementTestApi";

export default function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resultId = searchParams.get("id");

  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
  const { data: results, isLoading, error } = useGetStudentPlacementResultsQuery(user.id || user.student_id, {
    skip: !user.id && !user.student_id,
  });

  // Find the specific result by ID
  const result = results?.find((r) => r.id.toString() === resultId) || results?.[0];

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f0ebf8]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#673ab7]"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f0ebf8] p-4">
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-gray-900 font-medium mb-2">No result data found.</p>
          <p className="text-sm text-gray-500 mb-6">We couldn't locate your test submission. Please try again or contact support.</p>
          <button onClick={() => router.push("/portal/student/placement-test")} className="w-full py-2 bg-[#673ab7] text-white rounded-lg font-medium hover:bg-[#5e35b1] transition-colors shadow">
            Back to Placement Test
          </button>
        </div>
      </div>
    );
  }

  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'advanced': return "text-purple-600 bg-purple-50 border border-purple-100";
      case 'intermediate': return "text-blue-600 bg-blue-50 border border-blue-100";
      default: return "text-green-600 bg-green-50 border border-green-100";
    }
  };

  const getLevelMessage = (level) => {
    switch (level?.toLowerCase()) {
      case 'advanced': return "Excellent work! You have shown a strong command of the language and are ready for Advanced English.";
      case 'intermediate': return "Good job! You have a solid foundation and are ready for Intermediate English.";
      default: return "Welcome! You've shown a great start and are ready for Beginner English.";
    }
  };

  const displayLevel = result.recommended_level || (
    result.percentage >= 80 ? "Advanced" :
      result.percentage >= 50 ? "Intermediate" :
        "Beginner"
  );

  return (
    <main className="flex-1 min-h-screen bg-gray-50 flex flex-col py-10 px-4 font-sans text-[#202124]">
      <div className="max-w-[770px] mx-auto w-full space-y-4">

        {/* Results Header Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <div className="h-2.5 bg-[#673ab7] w-full" />
          <div className="p-10 text-center">
            {/* Success Checkmark */}
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-3xl font-medium mb-2">Test Completed!</h1>
            <p className="text-sm text-gray-600">Your response has been recorded and scored.</p>

            <div className="mt-8 pt-8 border-t border-gray-100 flex flex-wrap justify-center gap-4">
              <div className="px-6 py-4 rounded-xl bg-gray-50 border border-gray-100">
                <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Score</span>
                <span className="text-2xl font-black text-gray-900">{result.score} <span className="text-sm font-normal text-gray-400">/ {result.total_questions}</span></span>
              </div>
              <div className="px-6 py-4 rounded-xl bg-gray-50 border border-gray-100">
                <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Percentage</span>
                <span className="text-2xl font-black text-gray-900">{Math.round(result.percentage)}%</span>
              </div>
              <div className="px-6 py-4 rounded-xl bg-gray-50 border border-gray-100 min-w-[120px]">
                <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Recommended Level</span>
                <span className={`inline-block mt-1 px-4 py-1 rounded-full text-xs font-bold ${getLevelColor(displayLevel)}`}>
                  {displayLevel}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendation Card */}
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
          <h2 className="text-base font-medium mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#673ab7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recommendation
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {getLevelMessage(displayLevel)} Our academic team will review your results further and contact you regarding your enrollment in the {displayLevel} English course.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-6">
          <div className="flex gap-3">
            
            <button
              onClick={() => router.push("/portal/student/dashboard")}
              className="px-6 py-2 bg-[#673ab7] text-white rounded font-medium text-sm hover:bg-[#5e35b1] shadow transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        </div>

        <footer className="pt-10 pb-20 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} BEA E-Learning. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
