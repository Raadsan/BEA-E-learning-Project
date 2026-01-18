"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useGetProficiencyTestsQuery, useGetStudentProficiencyResultsQuery } from "@/redux/api/proficiencyTestApi";
import StudentHeader from "../StudentHeader";

export default function ProficiencyTestPage() {
    const router = useRouter();
    const { data: tests, isLoading: testsLoading } = useGetProficiencyTestsQuery();

    const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
    const { data: results, isLoading: resultsLoading } = useGetStudentProficiencyResultsQuery(user.id || user.student_id, {
        skip: !user.id && !user.student_id,
    });

    // Determine the active test
    const activeTest = React.useMemo(() => {
        if (!tests || tests.length === 0) return null;
        const activeTests = tests.filter(t => t.status === 'active');
        if (activeTests.length === 0) return tests[0];

        // Pick first active test
        return activeTests[0];
    }, [tests]);

    const hasTakenTest = results?.find(r => r.test_id === activeTest?.id);

    React.useEffect(() => {
        if (hasTakenTest) {
            router.replace(`/portal/student/proficiency-test/results?id=${hasTakenTest.id}`);
        }
    }, [hasTakenTest, router]);

    const isLoading = testsLoading || resultsLoading || (hasTakenTest && true);

    if (isLoading) {
        return (
            <>
                <StudentHeader />
                <div className="flex h-screen items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
                </div>
            </>
        );
    }

    if (!activeTest) {
        return (
            <>
                <StudentHeader />
                <div className="flex h-screen items-center justify-center p-8">
                    <div className="p-8 rounded-xl border text-center max-w-lg w-full bg-white border-gray-200 text-gray-900">
                        <p className="text-lg">No active proficiency tests found. Please contact support.</p>
                    </div>
                </div>
            </>
        );
    }

    // Parse questions if they are a string
    const questionsList = typeof activeTest.questions === 'string' ? JSON.parse(activeTest.questions) : activeTest.questions;

    return (
        <>
            <StudentHeader />
            <main className="flex-1 overflow-y-auto bg-gray-50">
                <div className="w-full px-8 pt-6 pb-6 flex items-center justify-center min-h-full">
                    <div className="rounded-3xl shadow-lg p-12 max-w-2xl w-full border bg-white border-gray-100">

                        {/* Header Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-purple-50 rounded-2xl flex items-center justify-center">
                                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold text-center mb-4 text-gray-900">
                            {activeTest.title}
                        </h1>

                        <p className="text-center mb-10 leading-relaxed text-gray-600">
                            {activeTest.description || "This comprehensive test will assess your English language proficiency across multiple skill areas including grammar, vocabulary, and writing."}
                        </p>

                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div className="p-6 rounded-2xl flex flex-col items-center justify-center bg-gray-50">
                                <span className="text-sm mb-1 text-gray-500">Questions</span>
                                <span className="text-2xl font-bold text-gray-900">{questionsList?.length || 0}</span>
                            </div>
                            <div className="p-6 rounded-2xl flex flex-col items-center justify-center bg-gray-50">
                                <span className="text-sm mb-1 text-gray-500">Duration</span>
                                <span className="text-2xl font-bold text-gray-900">{activeTest.duration_minutes} minutes</span>
                            </div>
                        </div>

                        {/* Test Instructions */}
                        <div className="p-8 rounded-2xl mb-10 bg-purple-50/50">
                            <h2 className="text-lg font-bold mb-4 text-gray-900">
                                Test Instructions
                            </h2>
                            <ul className="space-y-3 text-sm text-gray-600">
                                <li className="flex items-start gap-3">
                                    <span className="text-purple-600 mt-1">•</span>
                                    <span>Read each question carefully before answering</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-purple-600 mt-1">•</span>
                                    <span>You can navigate between questions using the navigation buttons</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-purple-600 mt-1">•</span>
                                    <span>Make sure to answer all questions before submitting</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-purple-600 mt-1">•</span>
                                    <span>The test must be completed in one session</span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex flex-col items-center justify-center gap-4">
                            {hasTakenTest ? (
                                <>
                                    <div className="text-center p-3 rounded-lg border bg-green-50 border-green-200 text-green-700 w-full">
                                        You have already completed this proficiency test.
                                    </div>
                                    <button
                                        onClick={() => router.push(`/portal/student/proficiency-test/results?id=${hasTakenTest.id}`)}
                                        className="px-12 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-green-500/20 w-full max-w-xs"
                                    >
                                        View My Results
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => router.push(`/portal/student/proficiency-test/take?id=${activeTest.id}`)}
                                    className="px-12 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-purple-900/20 w-full max-w-xs"
                                >
                                    Start Proficiency Test
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
