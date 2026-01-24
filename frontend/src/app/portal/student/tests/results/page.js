"use client";

import React, { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDarkMode } from "@/context/ThemeContext";
import Loader from "@/components/Loader";
import { useGetAssignmentsQuery } from "@/redux/api/assignmentApi";

export default function TestResultsPage() {
    const { isDark } = useDarkMode();
    const router = useRouter();
    const searchParams = useSearchParams();
    const testId = searchParams.get("id");

    const { data: assignments, isLoading: testsLoading } = useGetAssignmentsQuery({
        type: 'test'
    });

    const assignment = useMemo(() => {
        return assignments?.find(a => a.id === parseInt(testId));
    }, [assignments, testId]);

    if (testsLoading || !assignment) return <Loader fullPage />;

    const isGraded = assignment.submission_status === 'graded';
    const isSubmitted = assignment.submission_status === 'submitted' || isGraded;

    const cardBg = isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow-xl";
    const textColor = isDark ? "text-white" : "text-gray-900";
    const secondaryText = isDark ? "text-gray-400" : "text-gray-600";

    return (
        <div className={`min-h-screen transition-colors duration-300 py-20 px-4 sm:px-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-[700px] mx-auto text-center">
                <div className={`p-12 rounded-[40px] border ${cardBg}`}>
                    <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h1 className={`text-4xl font-extrabold mb-3 tracking-tight ${textColor}`}>Assessment Finalized</h1>
                    <p className={`text-lg mb-10 ${secondaryText}`}>Your responses for <span className="font-bold text-blue-600">{assignment.title}</span> have been recorded successfully.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                        <div className={`p-6 rounded-3xl border ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest block mb-2">Performance Score</span>
                            {isGraded ? (
                                <div className="text-4xl font-black text-blue-600 dark:text-blue-400">
                                    {assignment.score} <span className="text-xl opacity-40">/ {assignment.total_points}</span>
                                </div>
                            ) : (
                                <div className="text-sm font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 py-2 rounded-lg">Evaluation Pending</div>
                            )}
                        </div>
                        <div className={`p-6 rounded-3xl border ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest block mb-2">Completion Date</span>
                            <div className={`text-lg font-bold ${textColor}`}>
                                {new Date().toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    {assignment.feedback && (
                        <div className={`mb-10 p-8 rounded-3xl border text-left ${isDark ? 'bg-blue-900/10 border-blue-900/30' : 'bg-blue-50/50 border-blue-100'}`}>
                            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" /></svg>
                                Instructor Feedback
                            </h3>
                            <p className={`text-base leading-relaxed italic ${secondaryText}`}>"{assignment.feedback}"</p>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => router.push('/portal/student/tests')}
                            className="px-10 py-4 bg-[#010080] hover:bg-blue-900 text-white rounded-2xl font-bold transition-all shadow-lg active:scale-[0.98]"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>

                <p className={`mt-8 text-[10px] uppercase tracking-widest font-bold opacity-30 ${textColor}`}>BEA E-Learning Assessment Authority</p>
            </div>
        </div>
    );
}
