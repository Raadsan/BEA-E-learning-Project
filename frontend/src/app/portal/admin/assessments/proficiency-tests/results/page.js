"use client";

import { useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import { useDarkMode } from "@/context/ThemeContext";

export default function ProficiencyTestResultsPage() {
    const { isDark } = useDarkMode();
    const [selectedTest, setSelectedTest] = useState("all");

    // Mock data - will be replaced with real API data
    const results = [
        {
            id: 1,
            studentName: "Ahmed Mohamed",
            studentEmail: "ahmed@example.com",
            testTitle: "English Proficiency Test - Intermediate",
            score: 85,
            totalPoints: 100,
            percentage: 85,
            status: "graded",
            submittedAt: "2025-12-15 10:30 AM",
            gradedAt: "2025-12-15 02:45 PM"
        },
        {
            id: 2,
            studentName: "Fatima Hassan",
            studentEmail: "fatima@example.com",
            testTitle: "English Proficiency Test - Intermediate",
            score: null,
            totalPoints: 100,
            percentage: null,
            status: "pending",
            submittedAt: "2025-12-16 09:15 AM",
            gradedAt: null
        },
        {
            id: 3,
            studentName: "Omar Ali",
            studentEmail: "omar@example.com",
            testTitle: "English Proficiency Test - Advanced",
            score: 92,
            totalPoints: 100,
            percentage: 92,
            status: "graded",
            submittedAt: "2025-12-14 03:20 PM",
            gradedAt: "2025-12-14 05:30 PM"
        }
    ];

    const getStatusBadge = (status) => {
        const styles = {
            pending: isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
            graded: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700',
            reviewed: isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const getScoreBadge = (percentage) => {
        if (percentage === null) return null;

        let colorClass;
        if (percentage >= 90) colorClass = isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700';
        else if (percentage >= 75) colorClass = isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700';
        else if (percentage >= 60) colorClass = isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700';
        else colorClass = isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700';

        return (
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${colorClass}`}>
                {percentage}%
            </span>
        );
    };

    return (
        <div className={`flex-1 min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <AdminHeader />
            <main className="flex-1 overflow-y-auto mt-6">
                <div className="w-full px-8 py-6">
                    {/* Header */}
                    <div className="mb-8 pt-20">
                        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Proficiency Test Results
                        </h1>
                        <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            View and manage student proficiency test submissions and scores
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className={`rounded-xl shadow-md p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Submissions</p>
                                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{results.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className={`rounded-xl shadow-md p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-yellow-100 rounded-lg">
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Pending Review</p>
                                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {results.filter(r => r.status === 'pending').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={`rounded-xl shadow-md p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Graded</p>
                                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {results.filter(r => r.status === 'graded').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={`rounded-xl shadow-md p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                                <div>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Average Score</p>
                                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {Math.round(results.filter(r => r.score !== null).reduce((acc, r) => acc + r.percentage, 0) / results.filter(r => r.score !== null).length) || 0}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Table */}
                    <div className={`rounded-xl shadow-md overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Student Submissions
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className={isDark ? 'bg-gray-750' : 'bg-gray-50'}>
                                    <tr>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Student
                                        </th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Test
                                        </th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Score
                                        </th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Status
                                        </th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Submitted
                                        </th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                                    {results.map((result) => (
                                        <tr key={result.id} className={isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                        {result.studentName}
                                                    </div>
                                                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        {result.studentEmail}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                    {result.testTitle}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {result.score !== null ? (
                                                    <div className="flex flex-col gap-1">
                                                        {getScoreBadge(result.percentage)}
                                                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            {result.score}/{result.totalPoints}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        Not graded
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(result.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    {result.submittedAt}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button className="text-blue-600 hover:text-blue-700 font-medium">
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {results.length === 0 && (
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className={`mt-2 text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    No test results yet
                                </h3>
                                <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Student submissions will appear here once they complete proficiency tests.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
