"use client";

import { useState, useEffect } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useGetAttendanceStatsQuery } from "@/redux/api/attendanceApi";
import { useGetLearningHoursSummaryQuery } from "@/redux/api/learningHoursApi";
import { useGetTopStudentsQuery, useGetStudentProgressQuery } from "@/redux/api/studentApi";
import { useGetSubprogramsByProgramIdQuery } from "@/redux/api/subprogramApi";
import { useGetProgramQuery } from "@/redux/api/programApi";
import { useGetStudentPlacementResultsQuery } from "@/redux/api/placementTestApi";
import { useGetStudentProficiencyResultsQuery } from "@/redux/api/proficiencyTestApi";
import { useGetIeltsToeflStudentQuery } from "@/redux/api/ieltsToeflApi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UpcomingEventsList from "@/components/UpcomingEventsList";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ProficiencyDashboard = ({ user, results, timeLeft, isDark, router }) => {
    const hasCompleted = results && results.length > 0;
    const latestResult = hasCompleted ? results[0] : null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Simple Welcome Header */}
            <div>
                <h1 className={`text-3xl font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Welcome back, {user?.full_name || 'Student'}!
                </h1>
                <p className={`text-sm font-medium opacity-50 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Proficiency Test Portal
                </p>
            </div>

            {/* Main Action Card - Simplified */}
            <div className={`rounded-2xl p-8 ${isDark ? 'bg-blue-900/20 border border-blue-800/50' : 'bg-blue-50 border border-blue-100'} relative overflow-hidden`}>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <h2 className={`text-2xl font-semibold mb-3 tracking-tight ${isDark ? 'text-white' : 'text-blue-900'}`}>
                            Your Professional Evaluation
                        </h2>
                        <p className={`text-sm mb-6 max-w-lg font-medium leading-relaxed ${isDark ? 'text-blue-200/70' : 'text-blue-700/70'}`}>
                            Assess your English proficiency and earn your certificate. You can start the test at any time.
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            <button
                                onClick={() => router.push('/portal/student/proficiency-test')}
                                className="px-8 py-3 bg-[#010080] hover:bg-blue-800 text-white rounded-xl font-semibold transition-all active:scale-95 text-sm"
                            >
                                {hasCompleted ? "Retake Test" : "Start Test Now"}
                            </button>
                            {hasCompleted && (
                                <button
                                    onClick={() => router.push('/portal/student/my-certification')}
                                    className={`px-8 py-3 rounded-xl font-semibold transition-all active:scale-95 text-sm border ${isDark ? 'border-gray-700 text-white hover:bg-gray-800' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                                >
                                    View Certificate
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Simple Info Grid */}
                    <div className="grid grid-cols-2 gap-4 min-w-[240px]">
                        <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-100'}`}>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                            <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {user?.status || 'Pending'}
                            </p>
                        </div>
                        <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-100'}`}>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Score</p>
                            <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {hasCompleted ? `${Math.round(latestResult.percentage)}%` : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Links - Clean Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Result Card */}
                <div
                    onClick={() => router.push('/portal/student/proficiency-test')}
                    className={`group cursor-pointer p-6 rounded-2xl border transition-all hover:border-blue-400 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
                        }`}
                >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h3 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Test Results</h3>
                    <p className={`text-xs font-medium opacity-60 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Review your proficiency test performance and feedback.
                    </p>
                </div>

                {/* Certificate Card */}
                <div
                    onClick={() => router.push('/portal/student/my-certification')}
                    className={`group cursor-pointer p-6 rounded-2xl border transition-all hover:border-orange-400 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
                        }`}
                >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isDark ? 'bg-orange-900/30' : 'bg-orange-50'}`}>
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                    </div>
                    <h3 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>My Certificate</h3>
                    <p className={`text-xs font-medium opacity-60 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Download your official BEA English certificate.
                    </p>
                </div>

                {/* Support Card */}
                <div
                    onClick={() => router.push('/portal/student/student-support')}
                    className={`group cursor-pointer p-6 rounded-2xl border transition-all hover:border-green-400 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
                        }`}
                >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isDark ? 'bg-green-900/30' : 'bg-green-50'}`}>
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <h3 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Student Support</h3>
                    <p className={`text-xs font-medium opacity-60 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Need help? Connect with our support team.
                    </p>
                </div>
            </div>

            {/* Event List - Standard Style */}
            <div className="max-w-2xl">
                <UpcomingEventsList />
            </div>
        </div>
    );
};

export default function StudentDashboard() {
    const router = useRouter();
    const { isDark } = useDarkMode();
    const { data: user, isLoading: userLoading } = useGetCurrentUserQuery();
    const [approvalStatus, setApprovalStatus] = useState('pending');
    const [isPaid, setIsPaid] = useState(true);
    const [timeLeftProficiency, setTimeLeftProficiency] = useState({ minutes: 0, seconds: 0, isExpired: false });

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

    const { data: subprograms = [] } = useGetSubprogramsByProgramIdQuery(
        user?.chosen_program,
        { skip: !user?.chosen_program }
    );

    // Fetch Program Details for Information/Download
    const { data: programDetails } = useGetProgramQuery(user?.chosen_program, {
        skip: !user?.chosen_program
    });

    // EXACT Mapping Logic from Curriculum Image
    const getAssessmentType = () => {
        const prog = user?.chosen_program?.toString().toLowerCase() || "";
        const sub = user?.chosen_subprogram_name?.toString().toLowerCase() || ""; // Assuming name is available or we check ID

        // 1. Placement Test Required
        if (prog.includes("general english") || prog.includes("gep")) return "placement";
        if (prog.includes("academic writing") && sub.includes("level 1")) return "placement";

        // 2. Proficiency Test Required
        if (prog.includes("specific purposes") || prog.includes("esp")) return "proficiency";
        if (prog.includes("ielts") || prog.includes("toefl")) return "proficiency";
        if (prog.includes("academic writing") && (sub.includes("level 2") || sub.includes("level 3"))) return "proficiency";

        // 3. No Test Required
        if (prog.includes("soft skills") || prog.includes("workplace training")) return "none";
        if (prog.includes("digital literacy") || prog.includes("virtual communication")) return "none";

        // Default Fallback
        return "none";
    };

    const assessmentType = getAssessmentType();

    // Fetch Assessment Results for Pending State
    const { data: placementResults } = useGetStudentPlacementResultsQuery(user?.id || user?.student_id, {
        skip: !user || approvalStatus === 'approved'
    });
    const { data: results } = useGetStudentProficiencyResultsQuery(user?.id || user?.student_id, {
        skip: !user || approvalStatus === 'approved'
    });

    const { data: ieltsInfo } = useGetIeltsToeflStudentQuery(user?.id || user?.student_id, {
        skip: !user || assessmentType !== 'proficiency' || approvalStatus === 'approved'
    });

    const hasCompletedPlacement = placementResults && placementResults.length > 0;
    const hasCompletedProficiency = results && results.length > 0;
    // Determine what to show in the pending block
    const getPendingInfo = () => {
        // 24-Hour Expiry Logic (with 5-minute grace period)
        const getSafeDate = (dateStr) => {
            if (!dateStr) return null;
            // Ensure ISO format with Z if missing, to treat as UTC from backend
            const isoStr = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
            const finalStr = isoStr.includes('Z') || isoStr.includes('+') ? isoStr : `${isoStr}Z`;
            return new Date(finalStr);
        };

        const student = ieltsInfo?.student;
        const expiryDate = student?.expiry_date ? new Date(student.expiry_date) : null;
        const now = new Date();
        // A student is blocked/expired ONLY if the expiry date has passed.
        // We removed (!student.is_extended) because new students are not extended yet but should have access.
        const isExpired = expiryDate ? now > expiryDate : true;

        if (assessmentType === "placement") {
            // ... (keep placement logic same or update if needed)
            if (hasCompletedPlacement) {
                return {
                    title: "Placement Test Completed",
                    description: "Thank you for completing your placement test. Our academic team is reviewing your results to assign you to the correct level.",
                    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                    type: "completed"
                };
            }
            return {
                title: "Placement Test Required",
                description: "To finalize your registration, please complete the Official BEA Placement Test.",
                link: "/portal/student/placement-test",
                btnText: "Start Placement Test",
                icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
                type: "action"
            };
        }

        if (assessmentType === "proficiency") {
            if (hasCompletedProficiency) {
                return {
                    title: "Proficiency Test Completed",
                    description: "Your proficiency results are under review. You will be notified once your program enrollment is finalized.",
                    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                    type: "completed"
                };
            }

            if (isExpired) {
                return {
                    title: "Proficiency Test Window Expired",
                    description: "Your authorized window to enter the exam has closed. Please contact administration if you need extra time to start.",
                    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
                    type: "blocked"
                };
            }

            return {
                title: `Proficiency Test Required`,
                description: "Initial registration requires you to complete the Proficiency Test. Click here to start before your window expires.",
                link: "/portal/student/proficiency-test",
                icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                type: "action",
                isCountdown: true
            };
        }

        // Default Pending Case
        return {
            title: "Registration Pending Approval",
            description: "Thank you for registering! Your account is currently under review by our administrators. You will have full access once approved.",
            icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
            type: "pending"
        };
    };

    // Proficiency Countdown Timer
    useEffect(() => {
        const student = ieltsInfo?.student;
        if (assessmentType === 'proficiency' && !hasCompletedProficiency && student?.expiry_date) {
            const updateTimer = () => {
                // Robust date parsing (assume UTC from backend)
                const dateStr = student.expiry_date;
                const isoStr = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
                const finalStr = isoStr.includes('Z') || isoStr.includes('+') ? isoStr : `${isoStr}Z`;
                const expiry = new Date(finalStr);

                const now = new Date();
                const diffMs = expiry - now;
                const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));

                setTimeLeftProficiency({
                    minutes: Math.floor(totalSeconds / 60),
                    seconds: totalSeconds % 60,
                    isExpired: totalSeconds <= 0
                });
            };

            updateTimer();
            const interval = setInterval(updateTimer, 1000);
            return () => clearInterval(interval);
        }
    }, [ieltsInfo, assessmentType, hasCompletedProficiency]);

    const pendingInfo = getPendingInfo();

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

    const isProficiencyOnly = (user?.chosen_program || user?.program || "").toString().toLowerCase().trim() === 'proficiency test' || user?.role === 'proficiency_student';

    if (userLoading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                    <p className="text-xl font-semibold">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-colors pt-12 w-full px-6 sm:px-10 pb-20 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="w-full">
                {isProficiencyOnly ? (
                    <ProficiencyDashboard
                        user={user}
                        results={results}
                        timeLeft={timeLeftProficiency}
                        isDark={isDark}
                        router={router}
                    />
                ) : (
                    <>
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
                                        onClick={() => pendingInfo.link && router.push(pendingInfo.link)}
                                        className={`p-5 rounded-2xl flex items-start gap-4 transition-all ${pendingInfo.type === 'action'
                                            ? isDark ? 'bg-blue-600/10 border-2 border-blue-500/50 hover:bg-blue-600/20 cursor-pointer' : 'bg-blue-50 border-2 border-blue-100 hover:bg-blue-100 cursor-pointer'
                                            : pendingInfo.type === 'blocked'
                                                ? 'bg-red-600/10 border-2 border-red-500/50'
                                                : isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-50 border border-gray-100'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${pendingInfo.type === 'action' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                            : pendingInfo.type === 'blocked' ? 'bg-red-600 text-white shadow-lg shadow-red-500/30'
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                            }`}>
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={pendingInfo.icon} />
                                            </svg>
                                        </div>
                                        <div className="flex-1 pr-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h2 className={`text-lg font-bold ${pendingInfo.type === 'blocked' ? 'text-red-500' : isDark ? "text-white" : "text-gray-900"} mb-1`}>
                                                        {pendingInfo.title}
                                                    </h2>
                                                    <p className={`text-sm font-medium leading-relaxed ${pendingInfo.type === 'blocked' ? 'text-red-400' : isDark ? "text-gray-300" : "text-gray-600"}`}>
                                                        {pendingInfo.description}
                                                    </p>
                                                </div>
                                                {pendingInfo.isCountdown && (
                                                    <div className="text-right">
                                                        <div className={`text-2xl font-black ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                                            {timeLeftProficiency.minutes}m {timeLeftProficiency.seconds}s
                                                        </div>
                                                        <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">Time Left to Enter</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {pendingInfo.type === 'completed' && (
                                            <div className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest self-center">
                                                Submitted
                                            </div>
                                        )}
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
                                {/* Program Curriculum Download Section */}
                                {programDetails?.curriculum_file && (
                                    <div className={`p-6 rounded-2xl border transition-all shadow-md ${isDark ? 'bg-blue-900/10 border-blue-800' : 'bg-blue-50 border-blue-200'
                                        }`}>
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-600 text-white'
                                                    }`}>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                                                    Program Curriculum
                                                </h3>
                                            </div>
                                            <p className={`text-xs font-medium leading-relaxed ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                                Download the official program guide and curriculum for {programDetails.title}.
                                            </p>
                                            <a
                                                href={`http://localhost:5000${programDetails.curriculum_file}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 ${isDark
                                                    ? 'bg-blue-600 text-white hover:bg-blue-500'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                                    }`}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                Download Program Guide
                                            </a>
                                        </div>
                                    </div>
                                )}
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
                    </>
                )}
            </div>
        </div>
    );
}

