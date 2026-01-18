"use client";

import { useState, useEffect } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useGetAttendanceStatsQuery } from "@/redux/api/attendanceApi";
import { useGetLearningHoursSummaryQuery } from "@/redux/api/learningHoursApi";
import { useGetTopStudentsQuery, useGetStudentProgressQuery } from "@/redux/api/studentApi";
import { useGetSubprogramsByProgramIdQuery } from "@/redux/api/subprogramApi";
import Link from "next/link";
import UpcomingEventsList from "@/components/UpcomingEventsList";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StudentDashboard() {
    const { isDark } = useDarkMode();
    const { data: user, isLoading: userLoading } = useGetCurrentUserQuery();
    const [approvalStatus, setApprovalStatus] = useState('pending');
    const [isPaid, setIsPaid] = useState(true);

    // Fetch Attendance Stats
    const { data: attendanceStats, isLoading: attendanceLoading } = useGetAttendanceStatsQuery(
        { class_id: user?.class_id, timeFrame: 'Weekly' },
        { skip: !user?.class_id }
    );

    // Fetch Learning Hours Summary
    const { data: learningSummary, isLoading: learningLoading } = useGetLearningHoursSummaryQuery(
        { class_id: user?.class_id },
        { skip: !user?.class_id }
    );

    // Fetch Leaderboard (Top Students)
    const { data: leaderboardData = [], isLoading: leaderboardLoading } = useGetTopStudentsQuery({ limit: 5 });

    // Fetch Student Progress for "Continue Learning"
    const { data: progressData, isLoading: progressLoading } = useGetStudentProgressQuery();

    // Fetch Subprograms to potentially recommend (For You)
    const { data: subprograms = [] } = useGetSubprogramsByProgramIdQuery(
        user?.chosen_program,
        { skip: !user?.chosen_program }
    );

    useEffect(() => {
        if (user && user.approval_status) {
            setApprovalStatus(user.approval_status);

            // Check payment status
            if (user.approval_status === 'approved' && user.paid_until) {
                const expiryDate = new Date(user.paid_until);
                const today = new Date();
                expiryDate.setHours(0, 0, 0, 0);
                today.setHours(0, 0, 0, 0);
                setIsPaid(expiryDate >= today);
            } else if (user.approval_status !== 'approved') {
                setIsPaid(true); // Don't show expiration if not even approved yet
            }
        }
    }, [user]);

    // Map progress data to find active course
    const activeCourse = Array.isArray(progressData)
        ? progressData.find(p => p.student_id === user?.id && p.progress < 100) || progressData[0]
        : null;

    // Process attendance for chart
    const processAttendanceData = () => {
        if (!attendanceStats || !Array.isArray(attendanceStats)) {
            return [
                { week: "W1", value: 0 },
                { week: "W2", value: 0 },
                { week: "W3", value: 0 },
                { week: "W4", value: 0 },
            ];
        }
        // Simple mapping - adapt based on actual API response structure
        return attendanceStats.slice(-4).map((stat, index) => ({
            week: `W${index + 1}`,
            value: stat.percentage || stat.attendance_rate || 0
        }));
    };

    const attendanceData = processAttendanceData();
    const maxAttendance = Math.max(...attendanceData.map(d => d.value), 100);

    const stats = {
        coursesCompleted: user?.completed_courses_count || 0,
        certificatesEarned: user?.certificates_count || 0,
        hoursLearned: learningSummary?.total_hours || 0,
        streakDays: user?.login_streak || 0,
    };

    if (userLoading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
                <p className="text-xl font-semibold">Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-colors pt-12 w-full px-6 sm:px-10 pb-20 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="w-full">
                {/* Header Section */}
                <div className={`mb-8 p-8 rounded-2xl ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} shadow-sm border`}>
                    <h1 className={`text-4xl font-bold mb-2 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Welcome, {user?.full_name || 'Student'}!
                    </h1>
                    <p className={`text-lg font-medium opacity-60 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Dashboard Overview
                    </p>
                    {approvalStatus !== 'approved' && (
                        <div className="mt-4">
                            <div
                                className={`p-4 rounded-lg flex items-start gap-3 ${approvalStatus === "pending" || approvalStatus === "Pending"
                                    ? isDark
                                        ? "bg-blue-900/30 border border-blue-700"
                                        : "bg-blue-50 border border-blue-200"
                                    : isDark
                                        ? "bg-red-900/30 border border-red-700"
                                        : "bg-red-50 border border-red-200"
                                    }`}
                            >
                                <svg
                                    className={`w-8 h-8 ${approvalStatus === "pending" || approvalStatus === "Pending"
                                        ? "text-blue-600"
                                        : "text-red-600"
                                        }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d={
                                            approvalStatus === "pending" || approvalStatus === "Pending"
                                                ? "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                : "M6 18L18 6M6 6l12 12"
                                        }
                                    />
                                </svg>
                                <div className="flex-1">
                                    <h2 className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                                        {approvalStatus === "pending" || approvalStatus === "Pending"
                                            ? "Your registration is pending approval"
                                            : "Account access is restricted"}
                                    </h2>
                                    <p className={`text-sm mt-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                                        {user?.is_ielts ? (
                                            user.verification_method === 'Certificate' ? (
                                                "Thank you for uploading your certificate. Our academic team is currently verifying it. You will be notified once your placement is confirmed."
                                            ) : (
                                                <div className="space-y-3">
                                                    <p>You have selected to take a proficiency exam. Please complete the assessment to finalize your registration.</p>
                                                    <Link href="/portal/student/ielts-exam" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-bold">
                                                        Start Proficiency Exam
                                                    </Link>
                                                </div>
                                            )
                                        ) : (
                                            approvalStatus === "pending" || approvalStatus === "Pending"
                                                ? "Thank you for registering! Your account is under review by our administrators. You will be notified once it has been approved and full features are unlocked."
                                                : "Your registration has been reviewed. Please contact the administration team for more information about your account status."
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Conditional Learning/Expiry Banner */}
                        {isPaid ? (
                            <div className={`rounded-xl p-8 bg-[#010080] text-white relative overflow-hidden`}>
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute top-4 right-4 w-16 h-16 bg-white rounded-lg"></div>
                                    <div className="absolute top-20 right-20 w-12 h-12 bg-white rounded-full"></div>
                                    <div className="absolute bottom-8 left-8 w-20 h-20 bg-white rounded-lg"></div>
                                    <div className="absolute bottom-20 left-24 w-14 h-14 bg-white rounded-full"></div>
                                    <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white rounded-lg"></div>
                                </div>
                                <div className="relative z-10">
                                    <h2 className="text-3xl font-bold mb-3">Ready to keep learning?</h2>
                                    <p className="text-blue-100 mb-6 max-w-2xl">
                                        Master your skills with BEA E-learning. Your progress is saved and waiting for you to continue your journey.
                                    </p>
                                    <div className="flex gap-4">
                                        <Link href="/portal/student/my-courses" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors">
                                            Resume Last Course
                                        </Link>
                                        <Link href="/portal/student/browse-courses" className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors">
                                            Explore New Courses
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className={`rounded-xl p-8 bg-gradient-to-br from-[#f6d365] to-[#fda085] text-gray-900 relative overflow-hidden shadow-2xl border border-white/20`}>
                                <div className="absolute top-0 right-0 p-4 opacity-20">
                                    <svg className="w-48 h-48 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                    </svg>
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="bg-white/40 px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-widest border border-white/50 shadow-sm text-amber-900">Urgent: Account Locked</span>
                                    </div>
                                    <h2 className="text-3xl font-bold mb-3 text-gray-900 tracking-tight">Access Period Expired</h2>
                                    <p className="text-gray-800 mb-8 max-w-2xl text-lg font-medium leading-relaxed opacity-90">
                                        Your premium access has ended. Renew your subscription now to unlock your courses and continue your learning journey.
                                    </p>
                                    <Link
                                        href="/portal/student/payments/upgrade"
                                        className="inline-flex items-center gap-2 px-10 py-4 bg-[#010080] text-white hover:bg-blue-900 rounded-xl font-normal transition-all transform hover:scale-105 shadow-xl uppercase tracking-wider text-sm border-b-4 border-blue-900 active:border-b-0 active:translate-y-1"
                                    >
                                        <span>Upgrade & Continue</span>
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Courses Completed */}
                            <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Courses Completed
                                    </span>
                                </div>
                                <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {stats.coursesCompleted}
                                </p>
                            </div>

                            {/* Certificates Earned */}
                            <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                        </svg>
                                    </div>
                                    <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Certificates Earned
                                    </span>
                                </div>
                                <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {stats.certificatesEarned}
                                </p>
                            </div>

                            {/* Hours Learned */}
                            <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Hours Learned
                                    </span>
                                </div>
                                <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {learningLoading ? "..." : stats.hoursLearned}h
                                </p>
                            </div>

                            {/* Streak */}
                            <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Streak (Days)
                                    </span>
                                </div>
                                <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {stats.streakDays}
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        {/* Attendance Chart */}
                        <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Weekly Attendance
                                </h3>
                                {attendanceLoading && <span className="animate-spin h-4 w-4 border-2 border-[#010080] border-t-transparent rounded-full"></span>}
                            </div>
                            <div className="space-y-3">
                                {attendanceData.map((item, index) => (
                                    <div key={item.week} className="flex items-center gap-3">
                                        <span className={`text-sm font-medium w-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {item.week}
                                        </span>
                                        <div className="flex-1 relative">
                                            <div className={`h-6 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                                <div
                                                    className={`h-full rounded transition-all duration-1000 ${item.value > 80 ? 'bg-green-500' : item.value > 50 ? 'bg-blue-600' : 'bg-orange-500'
                                                        }`}
                                                    style={{ width: `${(item.value / maxAttendance) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-medium w-12 text-right ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {item.value}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Upcoming Events & News */}
                        <UpcomingEventsList />
                    </div>
                </div>
            </div>
        </div>
    );
}

