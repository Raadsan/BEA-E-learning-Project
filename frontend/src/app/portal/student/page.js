"use client";

import { useState, useEffect } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useGetStudentAttendanceQuery } from "@/redux/api/attendanceApi";
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
import { useGetTimelinesQuery } from "@/redux/api/courseTimelineApi";
import { useGetClassQuery } from "@/redux/api/classApi";
import StudentReviewForm from "@/components/ReviewFlows/StudentReviewForm";
import DashboardTermCounter from "./components/DashboardTermCounter";

const ProficiencyDashboard = ({ user, results, timeLeft, isExpired, isDark, router }) => {
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
            <div className={`rounded-2xl p-8 ${isDark ? 'bg-[#0f172a] border border-gray-800' : 'bg-blue-50 border border-blue-100'} relative overflow-hidden`}>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <h2 className={`text-2xl font-semibold mb-3 tracking-tight ${isDark ? 'text-white' : 'text-blue-900'}`}>
                            Your Professional Evaluation
                        </h2>
                        <p className={`text-sm mb-6 max-w-lg font-medium leading-relaxed ${isDark ? 'text-blue-200/70' : 'text-blue-700/70'}`}>
                            Assess your English proficiency and earn your certificate. You can start the test at any time.
                        </p>

                        {!hasCompleted && timeLeft && !isExpired && (
                            <div className={`mb-6 inline-flex items-center gap-3 px-4 py-2 rounded-xl ${isDark ? 'bg-blue-600/20 border border-blue-500/30' : 'bg-white shadow-sm border border-blue-100'}`}>
                                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className={`text-sm font-black ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                        {timeLeft.hours > 0 && `${timeLeft.hours}h `}{timeLeft.minutes}m {timeLeft.seconds}s
                                    </div>
                                    <div className="text-[9px] font-bold uppercase tracking-widest opacity-40">Entry Window Remaining</div>
                                </div>
                            </div>
                        )}
                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            <button
                                onClick={() => router.push('/portal/student/proficiency-test')}
                                disabled={isExpired}
                                className={`px-8 py-3 rounded-xl font-semibold transition-all active:scale-95 text-sm ${isExpired
                                    ? 'bg-red-950/20 text-red-400 border border-red-900/10 cursor-not-allowed'
                                    : 'bg-[#010080] hover:bg-blue-800 text-white'}`}
                            >
                                {isExpired ? "Window Expired" : hasCompleted ? "Retake Test" : "Start Test Now"}
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
                        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0b0f19] border-gray-800' : 'bg-white border-gray-100'}`}>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                            <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {user?.status || 'Pending'}
                            </p>
                        </div>
                        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0b0f19] border-gray-800' : 'bg-white border-gray-100'}`}>
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
                    onClick={() => {
                        if (isExpired) return;
                        router.push('/portal/student/proficiency-test');
                    }}
                    className={`group cursor-pointer p-6 rounded-2xl border transition-all hover:border-blue-400 ${isDark ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200 shadow-sm'
                        } ${isExpired ? 'opacity-80 grayscale-[0.5]' : ''}`}
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
                    className={`group cursor-pointer p-6 rounded-2xl border transition-all hover:border-orange-400 ${isDark ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200 shadow-sm'
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
                    className={`group cursor-pointer p-6 rounded-2xl border transition-all hover:border-green-400 ${isDark ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200 shadow-sm'
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
    const isProficiencyOnly = (user?.chosen_program || user?.program || "").toString().toLowerCase().trim() === 'proficiency test' || user?.role === 'proficiency_student';

    const [approvalStatus, setApprovalStatus] = useState('pending');
    const [isPaid, setIsPaid] = useState(true);
    const [timeUntilExpiry, setTimeUntilExpiry] = useState({ hours: 0, minutes: 0, seconds: 0, isExpired: false });

    // Fetch Attendance Stats
    const { data: studentAttendance, isLoading: attendanceLoading } = useGetStudentAttendanceQuery(
        user?.id || user?.student_id,
        { skip: !user?.id && !user?.student_id }
    );

    // Fetch Learning Hours Summary
    const { data: learningSummary, isLoading: learningLoading } = useGetLearningHoursSummaryQuery(
        {
            class_id: user?.class_id,
            student_id: user?.student_id || user?.id,
            subprogram_name: user?.chosen_subprogram
        },
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

    // Review System Hooks (Moved to top level)
    const { data: timelines = [] } = useGetTimelinesQuery();
    const { data: studentClassData } = useGetClassQuery(user?.class_id, { skip: !user?.class_id || isProficiencyOnly });

    const today = new Date();
    const eligibleTerm = timelines.find(t => {
        const endDate = new Date(t.end_date);
        return today > endDate;
    });

    const showReviewBanner = !isProficiencyOnly && eligibleTerm && studentClassData && studentClassData.teacher_id;

    // EXACT Mapping Logic from Curriculum Image
    const getAssessmentType = () => {
        if (!user) return null;
        if (user.program_test_required && user.program_test_required !== 'none') {
            return user.program_test_required;
        }
        // Fallback for older data or specific cases
        if (user.chosen_program?.toLowerCase().includes('ielts') || user.chosen_program?.toLowerCase().includes('toefl')) {
            return 'proficiency';
        }
        return 'none';
    };

    const assessmentType = getAssessmentType();
    console.log('🔍 Student Dashboard Debug:', {
        chosen_program: user?.chosen_program,
        programTitle: programDetails?.title,
        assessmentType
    });

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
        const getParsedExpiry = (dateStr) => {
            if (!dateStr) return null;
            if (dateStr instanceof Date) return dateStr;
            const isoStr = dateStr.toString().includes('T') ? dateStr.toString() : dateStr.toString().replace(' ', 'T');
            const finalStr = isoStr.includes('Z') || isoStr.includes('+') ? isoStr : `${isoStr}Z`;
            const d = new Date(finalStr);
            return isNaN(d.getTime()) ? null : d;
        };

        const expiryDate = getParsedExpiry(user?.expiry_date);
        const now = new Date();
        const isExpired = timeUntilExpiry.isExpired;

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
            if (isExpired) {
                return {
                    title: "Placement Test Window Expired",
                    description: "Your 24-hour window to enter the placement test has closed. Please contact administration for an extension.",
                    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
                    type: "blocked"
                };
            }

            return {
                title: "Placement Test Required",
                description: "To finalize your registration, please complete the Official BEA Placement Test before your window expires.",
                link: "/portal/student/placement-test",
                btnText: "Start Placement Test",
                icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
                type: "action",
                isCountdown: true
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
                icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
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

    // Assessment Expiry Countdown Timer
    useEffect(() => {
        const expiryDateStr = user?.expiry_date;
        // Skip countdown for Proficiency-Only students (they have 100yr window)
        if (isProficiencyOnly) {
            setTimeUntilExpiry({ hours: 0, minutes: 0, seconds: 0, isExpired: false });
            return;
        }

        if ((assessmentType === 'proficiency' && !hasCompletedProficiency) || (assessmentType === 'placement' && !hasCompletedPlacement)) {
            if (!expiryDateStr) return;

            const updateTimer = () => {
                const getParsedExpiry = (dateVal) => {
                    if (!dateVal) return null;
                    if (dateVal instanceof Date) return dateVal;
                    const dStr = dateVal.toString();
                    const isoStr = dStr.includes('T') ? dStr : dStr.replace(' ', 'T');
                    const finalStr = isoStr.includes('Z') || isoStr.includes('+') ? isoStr : `${isoStr}Z`;
                    return new Date(finalStr);
                };

                const expiry = getParsedExpiry(expiryDateStr);
                const now = new Date();

                if (expiry && !isNaN(expiry.getTime())) {
                    const diffMs = expiry - now;
                    const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));

                    console.log('⏰ Timer Debug:', {
                        expiryStr: expiryDateStr,
                        parsedExpiry: expiry.toISOString(),
                        browserNow: now.toISOString(),
                        diffMs,
                        totalSeconds
                    });

                    setTimeUntilExpiry({
                        hours: Math.floor(totalSeconds / 3600),
                        minutes: Math.floor((totalSeconds % 3600) / 60),
                        seconds: totalSeconds % 60,
                        isExpired: totalSeconds <= 0
                    });
                } else {
                    console.warn('⏰ Timer Debug: Invalid Expiry Date', { expiryDateStr });
                }
            };

            updateTimer();
            const interval = setInterval(updateTimer, 1000);
            return () => clearInterval(interval);
        }
    }, [user, assessmentType, hasCompletedProficiency, hasCompletedPlacement]);

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

    // Process attendance for chart (Last 4 weeks)
    const processAttendanceData = () => {
        if (!studentAttendance?.records || !Array.isArray(studentAttendance.records)) {
            return [
                { week: "Week 1", value: 0 },
                { week: "Week 2", value: 0 },
                { week: "Week 3", value: 0 },
                { week: "Week 4", value: 0 },
            ];
        }

        // Group by week (simple 5-session windows)
        const records = [...studentAttendance.records].reverse(); // Oldest first
        const weeks = [];

        for (let i = 0; i < 4; i++) {
            const weekRecords = records.slice(i * 5, (i + 1) * 5);
            if (weekRecords.length === 0) {
                weeks.push({ week: `Week ${4 - i}`, value: 0 });
                continue;
            }

            const attended = weekRecords.reduce((acc, r) => acc + (r.hour1 === 1 ? 1 : 0) + (r.hour2 === 1 ? 1 : 0), 0);
            const total = weekRecords.length * 2;
            weeks.push({
                week: `Week ${4 - i}`,
                value: Math.round((attended / total) * 100)
            });
        }

        return weeks.reverse();
    };

    const attendanceData = processAttendanceData();
    const maxAttendance = Math.max(...attendanceData.map(d => d.value), 100);

    const stats = {
        coursesCompleted: user?.completed_courses_count || 0,
        certificatesEarned: user?.certificates_count || 0,
        hoursLearned: learningSummary?.total_hours || 0,
        currentLevel: user?.chosen_subprogram_name || user?.chosen_subprogram || "Level 1",
    };


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
        <div className={`min-h-screen transition-colors pt-12 w-full px-6 sm:px-10 pb-20 ${isDark ? 'bg-[#0b0f19]' : 'bg-gray-50'}`}>
            <div className="w-full">
                {isProficiencyOnly ? (
                    <ProficiencyDashboard
                        user={user}
                        results={results}
                        timeLeft={timeUntilExpiry}
                        isExpired={timeUntilExpiry.isExpired}
                        isDark={isDark}
                        router={router}
                    />
                ) : (
                    <>
                        {/* Welcome Header (Simple Text) */}
                        <div className="mb-6">
                            <h1 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}!
                            </h1>
                            <p className={`text-sm font-medium opacity-60 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Here's what's happening this term.
                            </p>
                        </div>

                        {/* 1. Ready to Keep Learning (Banner) - MOVED TO TOP */}
                        {isPaid ? (
                            <div className={`mb-8 rounded-xl p-8 bg-[#010080] text-white relative overflow-hidden`}>
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
                                        {/* <Link href="/portal/student/browse-courses" className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors">
                                            Explore New Courses
                                        </Link> */}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className={`mb-8 rounded-xl p-8 bg-gradient-to-br from-[#f6d365] to-[#fda085] text-gray-900 relative overflow-hidden shadow-2xl border border-white/20`}>
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

                        {/* 2. Term Cycle & Download Grid Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            <div className="lg:col-span-2">
                                <DashboardTermCounter isDark={isDark} user={user} />
                            </div>
                            <div className="lg:col-span-1">
                                {programDetails?.curriculum_file && (
                                    <div className={`h-full p-6 rounded-2xl border transition-all shadow-md flex flex-col justify-center gap-4 ${isDark ? 'bg-blue-900/10 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-600 text-white'}`}>
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
                                )}
                            </div>
                        </div>

                        {/* Term End Review Section */}
                        {showReviewBanner && (
                            <div className={`mb-8 p-6 rounded-2xl border-2 border-dashed flex flex-col md:flex-row items-center justify-between gap-6 transition-all animate-in fade-in slide-in-from-top-4 duration-500 ${isDark ? 'bg-indigo-900/10 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'}`}>
                                <div className="flex items-center gap-5 text-center md:text-left">
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-indigo-900'}`}>Qiimeey Barahaaga!</h3>
                                        <p className={`text-sm font-medium mt-1 ${isDark ? 'text-indigo-200/70' : 'text-indigo-700/70'}`}>
                                            Term-ka <strong>{eligibleTerm.term_serial}</strong> waa dhammaaday. Fadlan qiimeyn ka bixi barahaaga.
                                        </p>
                                    </div>
                                </div>
                                <StudentReviewForm
                                    teacher={{ id: studentClassData.teacher_id, full_name: studentClassData.teacher_name || "Barahaaga" }}
                                    classId={user.class_id}
                                    termSerial={eligibleTerm.term_serial}
                                />
                            </div>
                        )}

                        {/* Header Section (Welcome Box) - Commented out as per request "ardayga box kasar" */}
                        {/* <div className={`mb-8 p-8 rounded-2xl ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} shadow-sm border`}>
                            <h1 className={`text-4xl font-bold mb-2 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Welcome, {user?.full_name || 'Student'}!
                            </h1>
                            <p className={`text-lg font-medium opacity-60 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Dashboard Overview
                            </p>
                            {approvalStatus !== 'approved' && (
                                <div className="mt-4">
                                    <div
                                        onClick={() => {
                                            if (pendingInfo.type === 'blocked') return;
                                            if (pendingInfo.link) router.push(pendingInfo.link);
                                        }}
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
                                                            {timeUntilExpiry.hours > 0 && `${timeUntilExpiry.hours}h `}{timeUntilExpiry.minutes}m {timeUntilExpiry.seconds}s
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

                        </div> */}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Content Area */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* "Ready to keep learning" Logic MOVED UP - Replaced here with emptiness or preserved if structure needs it. 
                                    Since we moved the entire logic block up, we just clear this space so Summary Cards are next. 
                                */}

                                {/* Summary Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {/* Courses Completed */}
                                    <div className={`rounded-xl p-6 ${isDark ? 'bg-[#0f172a] border border-gray-800 shadow-none' : 'bg-white shadow-md'}`}>
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
                                    <div className={`rounded-xl p-6 ${isDark ? 'bg-[#0f172a] border border-gray-800 shadow-none' : 'bg-white shadow-md'}`}>
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
                                    <div className={`rounded-xl p-6 ${isDark ? 'bg-[#0f172a] border border-gray-800 shadow-none' : 'bg-white shadow-md'}`}>
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

                                    {/* Current Level */}
                                    <div className={`rounded-xl p-6 ${isDark ? 'bg-[#0f172a] border border-gray-800 shadow-none' : 'bg-white shadow-md'}`}>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
                                                </svg>
                                            </div>
                                            <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                Current Level
                                            </span>
                                        </div>
                                        <p className={`text-2xl font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {stats.currentLevel}
                                        </p>
                                    </div>
                                </div>

                                {/* Analytical Charts Section */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className={`p-6 rounded-2xl shadow-sm border ${isDark ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-100'}`}>
                                        <h3 className={`text-sm font-bold uppercase tracking-widest mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            My Attendance Trends
                                        </h3>
                                        <div className="h-64 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={attendanceData}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#374151' : '#E5E7EB'} />
                                                    <XAxis
                                                        dataKey="week"
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fontSize: 12, fill: isDark ? '#9CA3AF' : '#6B7280' }}
                                                    />
                                                    <YAxis
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fontSize: 12, fill: isDark ? '#9CA3AF' : '#6B7280' }}
                                                        domain={[0, 100]}
                                                    />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                                                            borderColor: isDark ? '#374151' : '#E5E7EB',
                                                            borderRadius: '12px'
                                                        }}
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="value"
                                                        stroke="#010080"
                                                        strokeWidth={3}
                                                        dot={{ r: 4, fill: '#010080' }}
                                                        activeDot={{ r: 6 }}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className={`p-6 rounded-2xl shadow-sm border ${isDark ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-100'}`}>
                                        <h3 className={`text-sm font-bold uppercase tracking-widest mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Performance Analysis
                                        </h3>
                                        <div className="h-64 w-full flex items-center justify-center">
                                            <div className="text-center">
                                                <div className={`text-3xl font-black mb-1 ${isDark ? 'text-white' : 'text-[#010080]'}`}>
                                                    {learningSummary?.total_sessions || 0}
                                                </div>
                                                <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">Total Sessions Active</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Star Students (Top 5) */}
                                <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
                                                </svg>
                                            </div>
                                            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Star Students</h3>
                                        </div>
                                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${isDark ? 'bg-[#0b0f19] text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                                            Top 5 Performers
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        {leaderboardLoading ? (
                                            [1, 2, 3].map(i => <div key={i} className="h-16 w-full animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl"></div>)
                                        ) : leaderboardData?.students?.length > 0 ? (
                                            leaderboardData.students.slice(0, 5).map((student, index) => (
                                                <div key={student.student_id} className={`flex items-center justify-between p-4 rounded-xl transition-all hover:translate-x-1 ${isDark ? 'hover:bg-[#1a2035]' : 'hover:bg-gray-50'}`}>
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-inner ${index === 0 ? 'bg-yellow-400 text-white shadow-yellow-200' :
                                                            index === 1 ? 'bg-slate-300 text-white shadow-slate-200' :
                                                                index === 2 ? 'bg-amber-600/50 text-white shadow-amber-300' :
                                                                    'bg-gray-100 text-gray-500'
                                                            }`}>
                                                            {index + 1}
                                                        </div>
                                                        <div>
                                                            <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                                {student.full_name}
                                                            </div>
                                                            <div className={`text-[10px] font-medium opacity-50 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                {student.class_name || "General Class"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={`text-sm font-black ${isDark ? 'text-blue-400' : 'text-[#010080]'}`}>
                                                            {student.attendance_rate}%
                                                        </div>
                                                        <div className="text-[10px] font-bold uppercase tracking-widest opacity-30">Attendance</div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 opacity-40">No data available yet</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Sidebar */}
                            <div className="space-y-6">
                                {/* Program Curriculum Download - MOVED UP NEXT TO TERM CYCLE */}
                                {/* Attendance Chart */}
                                <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            My Weekly Attendance
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

