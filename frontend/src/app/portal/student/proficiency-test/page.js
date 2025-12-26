"use client";

import StudentHeader from "../StudentHeader";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProficiencyTestIntroPage() {
    const router = useRouter();
    const [isStarting, setIsStarting] = useState(false);

    const handleStartTest = () => {
        setIsStarting(true);
        router.push("/portal/student/proficiency-test/take");
    };

    return (
        <>
            <StudentHeader />
            <main className="flex-1 overflow-y-auto bg-gray-50">
                <div className="w-full px-8 pt-6 pb-6 flex items-center justify-center min-h-full">
                    <div className="bg-white rounded-xl shadow-md p-8 max-w-2xl w-full border border-gray-100">
                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
                            English Proficiency Test
                        </h1>

                        {/* Description */}
                        <p className="text-gray-600 text-center mb-8">
                            This comprehensive test will assess your English language proficiency across multiple skill areas including grammar, vocabulary, and writing.
                        </p>

                        {/* Test Details */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-gray-50 rounded-lg p-4 text-center">
                                <p className="text-gray-600 text-sm font-medium mb-2">Questions</p>
                                <p className="text-2xl font-bold text-gray-900">Varies</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 text-center">
                                <p className="text-gray-600 text-sm font-medium mb-2">Duration</p>
                                <p className="text-2xl font-bold text-gray-900">45 minutes</p>
                            </div>
                        </div>

                        {/* Test Instructions */}
                        <div className="bg-purple-50 rounded-lg p-6 mb-8">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Test Instructions</h2>
                            <ul className="space-y-2 text-gray-700">
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-600 mt-1">•</span>
                                    <span>Read each question carefully before answering</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-600 mt-1">•</span>
                                    <span>The test includes multiple choice, direct answer, and essay questions</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-600 mt-1">•</span>
                                    <span>You can navigate between questions using the navigation buttons</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-600 mt-1">•</span>
                                    <span>Make sure to answer all questions before submitting</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-600 mt-1">•</span>
                                    <span>The test must be completed in one session</span>
                                </li>
                            </ul>
                        </div>

                        {/* Start Button */}
                        <div className="flex justify-center">
                            <button
                                onClick={handleStartTest}
                                disabled={isStarting}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isStarting ? "Starting..." : "Start Proficiency Test"}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
