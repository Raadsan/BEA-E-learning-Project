"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetStudentDetailedReportQuery } from "@/redux/api/reportApi";
import Link from "next/link";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function StudentDetailedReportPage() {
    const { isDark } = useDarkMode();
    const params = useParams();
    const router = useRouter();
    const studentId = params.id;

    const { data: reportData, isLoading, error } = useGetStudentDetailedReportQuery(studentId);

    const student = reportData?.student || {};
    const attendance = reportData?.attendance || [];
    const assignments = reportData?.assignments || [];
    const performanceTrends = reportData?.performance_trends || [];

    // Calculate overall stats
    const totalAttendanceDays = attendance.reduce((sum, m) => sum + (m.total_days || 0), 0);
    const totalPresentDays = attendance.reduce((sum, m) => sum + (m.present_days || 0), 0);
    const overallAttendanceRate = totalAttendanceDays > 0 ? Math.round((totalPresentDays / totalAttendanceDays) * 100) : 0;

    const gradedAssignments = assignments.filter(a => a.status === 'graded');
    const avgScore = gradedAssignments.length > 0
        ? Math.round(gradedAssignments.reduce((sum, a) => sum + (a.percentage || 0), 0) / gradedAssignments.length)
        : 0;

    // Chart Theme
    const chartTheme = {
        background: 'transparent',
        text: isDark ? '#9CA3AF' : '#4B5563',
        grid: isDark ? '#374151' : '#E5E7EB',
        tooltip: {
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
            border: isDark ? '1px solid #374151' : '1px solid #E5E7EB',
            color: isDark ? '#F3F4F6' : '#111827'
        }
    };

    // Print function
    const handlePrint = () => {
        window.print();
    };

    if (isLoading) {
        return (
            <div className={`flex-1 min-w-0 flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Loading student report...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !student.student_id) {
        return (
            <div className={`flex-1 min-w-0 flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="text-center">
                    <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Student Not Found
                    </p>
                    <p className="text-gray-500 mb-6">
                        The requested student report could not be loaded.
                    </p>
                    <Link
                        href="/portal/admin/reports/students"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Reports
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex-1 min-w-0 flex flex-col px-4 sm:px-8 py-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-[1600px] mx-auto w-full space-y-8">
                {/* Header with Actions */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className={`p-3 rounded-lg transition-colors ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <div>
                            <h1 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Student Detailed Report
                            </h1>
                            <p className={`text-sm font-medium mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Comprehensive performance and attendance analysis
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handlePrint}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
                    >
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print Report
                        </div>
                    </button>
                </div>

                {/* Student Info Card */}
                <div className={`p-8 rounded-2xl border shadow-sm ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-shrink-0">
                            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-5xl font-black shadow-xl">
                                {student.full_name?.charAt(0) || 'S'}
                            </div>
                        </div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h2 className={`text-2xl font-black mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {student.full_name}
                                </h2>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {student.email}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {student.phone || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                        </svg>
                                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            ID: {student.student_id}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Academic Information
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Program</p>
                                        <p className={`text-sm font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {student.chosen_program || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Subprogram/Level</p>
                                        <p className={`text-sm font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {student.chosen_subprogram || student.subprogram_name || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Class</p>
                                        <p className={`text-sm font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {student.class_name || 'Unassigned'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Status</p>
                                        <span className={`inline-flex mt-1 px-3 py-1 rounded-lg text-xs font-black ${student.approval_status === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                student.approval_status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                            }`}>
                                            {student.approval_status || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className={`text-4xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {overallAttendanceRate}%
                                </p>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mt-1">
                                    Attendance Rate
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div>
                                <p className={`text-4xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {avgScore}%
                                </p>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mt-1">
                                    Average Score
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            </div>
                            <div>
                                <p className={`text-4xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {gradedAssignments.length}
                                </p>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mt-1">
                                    Completed Assignments
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance Trends Chart */}
                {performanceTrends.length > 0 && (
                    <div className={`p-8 rounded-2xl border shadow-sm ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'}`}>
                        <h3 className={`text-xl font-extrabold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Performance Trends
                        </h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={performanceTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: chartTheme.text }}
                                        dy={10}
                                    />
                                    <YAxis
                                        domain={[0, 100]}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: chartTheme.text }}
                                    />
                                    <Tooltip
                                        contentStyle={chartTheme.tooltip}
                                        labelStyle={{ color: chartTheme.text }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="avg_score"
                                        name="Average Score"
                                        stroke="#2563EB"
                                        strokeWidth={3}
                                        dot={{ fill: '#2563EB', r: 4 }}
                                        activeDot={{ r: 8 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Attendance Details */}
                {attendance.length > 0 && (
                    <div className={`p-8 rounded-2xl border shadow-sm ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'}`}>
                        <h3 className={`text-xl font-extrabold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Monthly Attendance Breakdown
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {attendance.map((month, index) => {
                                const rate = month.total_days > 0 ? Math.round((month.present_days / month.total_days) * 100) : 0;

                                return (
                                    <div key={index} className={`p-6 rounded-xl border ${isDark ? 'bg-gray-900/40 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {month.month}
                                            </h4>
                                            <span className={`text-2xl font-black ${rate >= 80 ? 'text-emerald-600' :
                                                    rate >= 60 ? 'text-amber-600' :
                                                        'text-red-600'
                                                }`}>
                                                {rate}%
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Present:</span>
                                                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                    {month.present_days} days
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Absent:</span>
                                                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                    {month.absent_days} days
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Recent Assignments */}
                {assignments.length > 0 && (
                    <div className={`p-8 rounded-2xl border shadow-sm ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'}`}>
                        <h3 className={`text-xl font-extrabold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Recent Assignment Submissions
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                        <th className={`text-left py-4 px-4 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Assignment</th>
                                        <th className={`text-left py-4 px-4 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Type</th>
                                        <th className={`text-center py-4 px-4 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Score</th>
                                        <th className={`text-center py-4 px-4 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Status</th>
                                        <th className={`text-left py-4 px-4 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Submitted</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-100'}`}>
                                    {assignments.map((assignment, index) => (
                                        <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="py-4 px-4">
                                                <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                    {assignment.title}
                                                </p>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                                                    {assignment.type}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                {assignment.status === 'graded' ? (
                                                    <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-black ${(assignment.percentage || 0) >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                            (assignment.percentage || 0) >= 60 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                        }`}>
                                                        {Math.round(assignment.percentage || 0)}% ({assignment.marks}/{assignment.total_marks})
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-500 text-sm">-</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold ${assignment.status === 'graded' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                        assignment.status === 'submitted' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                            'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                                    }`}>
                                                    {assignment.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {assignment.submitted_at ? new Date(assignment.submitted_at).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
