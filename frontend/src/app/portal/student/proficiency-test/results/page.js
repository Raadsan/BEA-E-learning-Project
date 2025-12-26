"use client";

import StudentHeader from "../../StudentHeader";
import { useRouter } from "next/navigation";

export default function ProficiencyTestResultsPage() {
    const router = useRouter();

    // In a real app, this would come from the backend
    const results = {
        score: 85,
        totalPoints: 100,
        percentage: 85,
        status: "Passed",
        submittedAt: new Date().toLocaleString(),
    };

    return (
        <>
            <StudentHeader />
            <main className="flex-1 overflow-y-auto bg-gray-50">
                <div className="w-full px-8 pt-6 pb-6 flex items-center justify-center min-h-full">
                    <div className="bg-white rounded-xl shadow-md p-8 max-w-2xl w-full border border-gray-100">
                        {/* Success Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
                            Test Submitted Successfully!
                        </h1>

                        {/* Description */}
                        <p className="text-gray-600 text-center mb-8">
                            Your proficiency test has been submitted and is being reviewed.
                        </p>

                        {/* Results Summary */}
                        <div className="bg-purple-50 rounded-lg p-6 mb-8">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Test Summary</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-700">Submitted At:</span>
                                    <span className="font-semibold text-gray-900">{results.submittedAt}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-700">Status:</span>
                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                                        Under Review
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Information Box */}
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-blue-700">
                                        Your test responses have been saved. Essay questions will be manually graded by an instructor. You will be notified once your results are ready.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => router.push("/portal/student/dashboard")}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                            >
                                Return to Dashboard
                            </button>
                            <button
                                onClick={() => router.push("/portal/student/proficiency-test")}
                                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                            >
                                View Test Information
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
