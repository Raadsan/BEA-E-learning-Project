"use client";

import { useState, useEffect, useMemo } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetCurrentUserQuery } from "@/lib/api/authApi";
import { resolveMediaUrl } from "@/constants";
import { useGetStudentAttendanceQuery } from "@/lib/api/attendanceApi";
import { useGetLearningHoursSummaryQuery } from "@/lib/api/learningHoursApi";
import { useGetTopStudentsQuery, useGetStudentProgressQuery } from "@/lib/api/studentApi";
import { useGetSubprogramsByProgramIdQuery } from "@/lib/api/subprogramApi";
import { useGetProgramQuery } from "@/lib/api/programApi";
import { isProficiencyOnlyStudent } from "@/utils/programCatalog";
import { isStudentSubscriptionActive } from "@/utils/studentPayment";
import { useGetStudentPlacementResultsQuery } from "@/lib/api/placementTestApi";
import { useGetStudentProficiencyResultsQuery } from "@/lib/api/proficiencyTestApi";
import { useGetIeltsToeflStudentQuery } from "@/lib/api/ieltsToeflApi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UpcomingEventsList from "@/components/UpcomingEventsList";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DashboardTermCounter from "@/components/student/dashboard/DashboardTermCounter";
import DataTable from "@/components/DataTable";

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

const parseApiDate = (dateVal) => {
    if (!dateVal) return null;
    if (dateVal instanceof Date) return dateVal;
    const dStr = dateVal.toString();
    const isoStr = dStr.includes("T") ? dStr : dStr.replace(" ", "T");
    const finalStr = isoStr.includes("Z") || isoStr.includes("+") ? isoStr : `${isoStr}Z`;
    const d = new Date(finalStr);
    return isNaN(d.getTime()) ? null : d;
};

/** Clamp legacy 45-day expiry to 24h from registration */
const getEffectiveTestExpiry = (user) => {
    const expiry = parseApiDate(user?.expiry_date);
    if (!expiry) return null;
    const created = parseApiDate(user?.created_at);
    if (created) {
        const windowEnd = new Date(created.getTime() + TWENTY_FOUR_HOURS_MS);
        return expiry.getTime() > windowEnd.getTime() ? windowEnd : expiry;
    }
    return expiry;
};

const formatCountdownHHMMSS = (hours, minutes, seconds) => {
    const total = Math.max(0, hours * 3600 + minutes * 60 + seconds);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

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
                                    <div className={`text-2xl font-black tabular-nums ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                        {formatCountdownHHMMSS(timeLeft.hours, timeLeft.minutes, timeLeft.seconds)}
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
                <UpcomingEventsList limit={5} viewAllHref="/portal/student/news" />
            </div>
        </div>
    );
};

export default function StudentDashboard() {
    const router = useRouter();
    const { isDark } = useDarkMode();
    const { data: user, isLoading: userLoading } = useGetCurrentUserQuery();
    const isProficiencyOnly = isProficiencyOnlyStudent(user);

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
            class_id: user?.class_id || undefined,
            student_id: user?.student_id || user?.id,
            subprogram_name: user?.chosen_subprogram
        },
        { skip: !user?.id && !user?.student_id }
    );

    // Fetch Leaderboard (Top Students in student's course/program)
    const { data: leaderboardData = [], isLoading: leaderboardLoading } = useGetTopStudentsQuery({
        limit: 10,
        program_id: user?.chosen_program || undefined,
        class_id: user?.class_id ? String(user.class_id) : undefined
    }, { skip: !user?.student_id && !user?.id });

    const rankedStarStudents = useMemo(() => {
        const list = Array.isArray(leaderboardData) ? leaderboardData : (leaderboardData?.students || []);
        return list.map((student: any, idx: number) => ({
            ...student,
            rank: idx + 1
        }));
    }, [leaderboardData]);

    const getStarRankBadge = (rank: number) => {
        switch (rank) {
            case 1:
                return <span className="bg-yellow-100 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-300 text-xs font-bold px-2.5 py-1 rounded-md border border-yellow-300 dark:border-yellow-700/50 inline-flex items-center gap-1 shadow-xs">🥇 1st</span>;
            case 2:
                return <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-600 inline-flex items-center gap-1 shadow-xs">🥈 2nd</span>;
            case 3:
                return <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-bold px-2.5 py-1 rounded-md border border-amber-300 dark:border-amber-700/50 inline-flex items-center gap-1 shadow-xs">🥉 3rd</span>;
            default:
                return <span className="bg-blue-50 dark:bg-blue-950/30 text-[#010080] dark:text-blue-300 text-xs font-bold px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-800 inline-flex items-center justify-center min-w-[42px] shadow-xs">{rank}th</span>;
        }
    };

    const starStudentColumns = [
        {
            label: "Rank",
            key: "rank",
            width: "90px",
            render: (value: any, row: any, globalIndex: number) => {
                const rankNum = row.rank || (typeof globalIndex === 'number' ? globalIndex + 1 : 1);
                return getStarRankBadge(rankNum);
            }
        },
        {
            label: "Student Name",
            key: "full_name",
            render: (value: any, row: any) => (
                <div className="flex flex-col">
                    <span className="text-black dark:text-white font-medium">{value || row.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{row.email || row.student_id}</span>
                </div>
            )
        },
        {
            label: "Program / Class",
            key: "program_name",
            render: (value: any, row: any) => (
                <div className="flex flex-col">
                    <span className="text-black dark:text-gray-200">{value || user?.chosen_program || '-'}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{row.class_name || row.subprogram_name || '-'}</span>
                </div>
            )
        },
        {
            label: "Attendance",
            key: "attendance_rate",
            className: "text-center",
            render: (value: any) => {
                const num = Number(value || 0);
                const display = num % 1 === 0 ? num.toFixed(0) : num.toFixed(1);
                return (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                        ${num >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300' :
                            num >= 75 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300' : 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300'}`}>
                        {display}%
                    </span>
                );
            }
        },
        {
            label: "Avg. Score",
            key: "avg_assignment_score",
            className: "text-center",
            render: (value: any, row: any) => {
                const num = value !== undefined && value !== null ? Number(value) : Number(row.average_score || 0);
                const display = num % 1 === 0 ? num.toFixed(0) : num.toFixed(1);
                return (
                    <span className="font-bold text-[#010080] dark:text-blue-400">
                        {display}%
                    </span>
                );
            }
        }
    ];

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
        // Check if admin has granted exam access (expiry_date is in the future)
        const isExamActive = expiryDate ? expiryDate.getTime() > now.getTime() : false;

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

            // Certificate student handling
            const isCertStudent = (ieltsInfo?.student?.verification_method || user?.verification_method || "").toLowerCase().includes("certificate");
            if (isCertStudent) {
                if (isExamActive) {
                    return {
                        title: "Proficiency Test Access Granted",
                        description: "Administration has authorized you to take the Proficiency Test. Please start and complete your test before your window expires.",
                        link: "/portal/student/proficiency-test",
                        btnText: "Start Test",
                        icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
                        type: "action",
                        isCountdown: true
                    };
                }
                return {
                    title: "Pending for Approval",
                    description: "Your application is pending review by the administration. You submitted a certificate during registration and do not need to take any exam. You will be notified once your application is approved.",
                    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
                    type: "pending"
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

    // Assessment Expiry Countdown Timer (24h window, HH:MM:SS)
    useEffect(() => {
        if (isProficiencyOnly) {
            setTimeUntilExpiry({ hours: 0, minutes: 0, seconds: 0, isExpired: false });
            return;
        }

        if ((assessmentType === 'proficiency' && !hasCompletedProficiency) || (assessmentType === 'placement' && !hasCompletedPlacement)) {
            const updateTimer = () => {
                const expiry = getEffectiveTestExpiry(user);
                if (!expiry) return;

                const diffMs = expiry.getTime() - Date.now();
                const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));

                setTimeUntilExpiry({
                    hours: Math.floor(totalSeconds / 3600),
                    minutes: Math.floor((totalSeconds % 3600) / 60),
                    seconds: totalSeconds % 60,
                    isExpired: totalSeconds <= 0
                });
            };

            updateTimer();
            const interval = setInterval(updateTimer, 1000);
            return () => clearInterval(interval);
        }
    }, [user, assessmentType, hasCompletedProficiency, hasCompletedPlacement, isProficiencyOnly]);

    const pendingInfo = getPendingInfo();
    const assessmentComplete =
        assessmentType === "placement"
            ? hasCompletedPlacement
            : assessmentType === "proficiency"
              ? hasCompletedProficiency
              : true;
    const showPendingDashboard = approvalStatus !== "approved";

    useEffect(() => {
        if (user && user.approval_status) {
            setApprovalStatus(user.approval_status);
            setIsPaid(isStudentSubscriptionActive(user));
        }
    }, [user]);

    // Map progress data to find active course
    const activeCourse = Array.isArray(progressData)
        ? progressData.find(p => p.student_id === user?.id && p.progress < 100) || progressData[0]
        : null;    // Fallback dynamic hours and active sessions calculation from studentAttendance
    const calculatedHoursLearned = (studentAttendance?.records && Array.isArray(studentAttendance.records))
        ? studentAttendance.records.reduce((acc, r) => acc + (r.hour1 || 0) + (r.hour2 || 0), 0)
        : 0;

    const calculatedActiveSessions = (studentAttendance?.records && Array.isArray(studentAttendance.records))
        ? new Set(studentAttendance.records.filter(r => (r.hour1 || 0) + (r.hour2 || 0) > 0).map(r => `${r.class_id}_${r.date}`)).size
        : 0;

    const hoursLearned = (learningSummary?.total_hours !== undefined && learningSummary?.total_hours > 0)
        ? learningSummary.total_hours
        : calculatedHoursLearned;

    const totalSessionsActive = (learningSummary?.total_sessions !== undefined && learningSummary?.total_sessions > 0)
        ? learningSummary.total_sessions
        : calculatedActiveSessions;

    // Process attendance for chart (Dynamic active term / calendar weeks)
    const processAttendanceData = () => {
        const defaultWeeks = [
            { week: "Week 1", value: 0, attended: 0, excused: 0, absent: 0, total: 0 },
            { week: "Week 2", value: 0, attended: 0, excused: 0, absent: 0, total: 0 },
            { week: "Week 3", value: 0, attended: 0, excused: 0, absent: 0, total: 0 },
            { week: "Week 4", value: 0, attended: 0, excused: 0, absent: 0, total: 0 },
        ];

        const records = studentAttendance?.records;
        if (!records || !Array.isArray(records) || records.length === 0) {
            return defaultWeeks;
        }

        const sorted = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const oneWeekMs = 7 * 24 * 60 * 60 * 1000;

        const earliestTime = new Date(sorted[0].date).getTime();
        const latestTime = new Date(sorted[sorted.length - 1].date).getTime();
        const spanMs = latestTime - earliestTime;

        let baseStart;
        if (spanMs <= 28 * 24 * 60 * 60 * 1000) {
            baseStart = new Date(earliestTime);
            baseStart.setHours(0, 0, 0, 0);
        } else {
            const latestEnd = new Date(latestTime);
            latestEnd.setHours(23, 59, 59, 999);
            baseStart = new Date(latestEnd.getTime() - 4 * oneWeekMs);
            baseStart.setHours(0, 0, 0, 0);
        }

        const weeks = [];
        for (let i = 0; i < 4; i++) {
            const weekStart = new Date(baseStart.getTime() + i * oneWeekMs);
            const weekEnd = new Date(baseStart.getTime() + (i + 1) * oneWeekMs);

            const weekRecords = sorted.filter(r => {
                if (!r.date) return false;
                const d = new Date(r.date);
                return d >= weekStart && d < weekEnd;
            });

            const weekLabel = `Week ${i + 1}`;

            if (weekRecords.length === 0) {
                weeks.push({ week: weekLabel, value: 0, attended: 0, excused: 0, absent: 0, total: 0 });
            } else {
                const attended = weekRecords.reduce((acc, r) => acc + (r.hour1 === 1 ? 1 : 0) + (r.hour2 === 1 ? 1 : 0), 0);
                const excused = weekRecords.reduce((acc, r) => acc + (r.hour1 === 2 ? 1 : 0) + (r.hour2 === 2 ? 1 : 0), 0);
                const absent = weekRecords.reduce((acc, r) => acc + (r.hour1 === 0 ? 1 : 0) + (r.hour2 === 0 ? 1 : 0), 0);
                const total = attended + excused + absent;
                const rate = total > 0 ? Math.round((attended / total) * 100) : 0;
                weeks.push({ week: weekLabel, value: rate, attended, excused, absent, total });
            }
        }

        return weeks;
    };

    const attendanceData = processAttendanceData();
    const maxAttendance = Math.max(...attendanceData.map(d => d.value), 100);

    const stats = {
        coursesCompleted: user?.completed_courses_count || 0,
        certificatesEarned: user?.certificates_count || 0,
        hoursLearned: hoursLearned,
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
        <div className={`min-h-screen transition-colors pt-4 w-full px-6 sm:px-10 pb-20 ${isDark ? 'bg-[#0b0f19]' : 'bg-gray-50'}`}>
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
                ) : showPendingDashboard ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div>
                            <h1 className={`text-3xl font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Welcome, {user?.full_name?.split(' ')[0] || 'Student'}!
                            </h1>
                            <p className={`text-sm font-medium opacity-50 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Complete your assessment to finalize registration
                            </p>
                        </div>

                        <div
                            onClick={() => {
                                if (pendingInfo.type === 'blocked') return;
                                if (pendingInfo.link) router.push(pendingInfo.link);
                            }}
                            className={`rounded-2xl p-8 border-2 transition-all ${pendingInfo.type === 'action'
                                ? isDark ? 'bg-blue-600/10 border-blue-500/50 hover:bg-blue-600/20 cursor-pointer' : 'bg-blue-50 border-blue-200 hover:bg-blue-100 cursor-pointer'
                                : pendingInfo.type === 'blocked'
                                    ? isDark ? 'bg-red-600/10 border-red-500/50' : 'bg-red-50 border-red-200'
                                    : pendingInfo.type === 'completed'
                                        ? isDark ? 'bg-green-600/10 border-green-500/50' : 'bg-green-50 border-green-200'
                                        : isDark ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'
                                }`}
                        >
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                <div className="flex items-start gap-4">
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${pendingInfo.type === 'action' ? 'bg-blue-600 text-white'
                                        : pendingInfo.type === 'blocked' ? 'bg-red-600 text-white'
                                            : pendingInfo.type === 'completed' ? 'bg-green-600 text-white'
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                        }`}>
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={pendingInfo.icon} />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className={`text-xl font-bold mb-2 ${pendingInfo.type === 'blocked' ? 'text-red-500' : isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {pendingInfo.title}
                                        </h2>
                                        <p className={`text-sm font-medium leading-relaxed max-w-xl ${pendingInfo.type === 'blocked' ? 'text-red-400' : isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                            {pendingInfo.description}
                                        </p>
                                        {pendingInfo.type === 'action' && pendingInfo.link && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); router.push(pendingInfo.link); }}
                                                className="mt-4 px-6 py-2.5 bg-[#010080] hover:bg-blue-800 text-white rounded-xl text-sm font-semibold transition-all"
                                            >
                                                {pendingInfo.btnText || 'Start Test'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {pendingInfo.isCountdown && !assessmentComplete && (
                                    <div className={`text-center md:text-right px-6 py-4 rounded-xl ${isDark ? 'bg-[#0b0f19] border border-gray-800' : 'bg-white border border-gray-100 shadow-sm'}`}>
                                        <div className={`text-3xl font-black tabular-nums tracking-wider ${timeUntilExpiry.isExpired ? 'text-red-500' : isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                            {formatCountdownHHMMSS(timeUntilExpiry.hours, timeUntilExpiry.minutes, timeUntilExpiry.seconds)}
                                        </div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-1">
                                            Hours : Minutes : Seconds (24h Window)
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {pendingInfo.type === 'completed' && (
                            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
                                <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Your account is pending admin approval. You will get full dashboard access once approved.
                                </p>
                            </div>
                        )}
                    </div>
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
                            <div className="lg:col-span-1 space-y-6">
                                <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-sm`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>My Weekly Attendance</h3>
                                            <p className="text-[10px] text-gray-400 font-medium">Presence rate by week</p>
                                        </div>
                                        {attendanceLoading && <span className="animate-spin h-4 w-4 border-2 border-[#010080] border-t-transparent rounded-full"></span>}
                                    </div>
                                    <div className="space-y-4">
                                        {attendanceData.map((item) => {
                                            const totalHrs = item.total || 0;
                                            const attPercent = totalHrs > 0 ? (item.attended / totalHrs) * 100 : 0;
                                            const excPercent = totalHrs > 0 ? (item.excused / totalHrs) * 100 : 0;
                                            const absPercent = totalHrs > 0 ? (item.absent / totalHrs) * 100 : 0;

                                            return (
                                                <div key={item.week} className="space-y-1.5">
                                                    <div className="flex items-center justify-between text-xs font-bold">
                                                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{item.week}</span>
                                                        <span className={item.value > 75 ? 'text-green-600' : item.value > 40 ? 'text-amber-600' : 'text-gray-400'}>
                                                            {item.value}%
                                                        </span>
                                                    </div>
                                                    {/* Multi-segment visual bar */}
                                                    <div className={`h-3 rounded-full overflow-hidden flex ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                                        {attPercent > 0 && (
                                                            <div style={{ width: `${attPercent}%` }} className="bg-emerald-500 h-full" title={`Present: ${item.attended} hrs`} />
                                                        )}
                                                        {excPercent > 0 && (
                                                            <div style={{ width: `${excPercent}%` }} className="bg-amber-500 h-full" title={`Excused: ${item.excused} hrs`} />
                                                        )}
                                                        {absPercent > 0 && (
                                                            <div style={{ width: `${absPercent}%` }} className="bg-red-500 h-full" title={`Absent: ${item.absent} hrs`} />
                                                        )}
                                                        {totalHrs === 0 && (
                                                            <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />
                                                        )}
                                                    </div>
                                                    {totalHrs > 0 && (
                                                        <div className="flex justify-between text-[9px] text-gray-400">
                                                            <span className="text-emerald-600 font-semibold">{item.attended}h Present</span>
                                                            {item.excused > 0 && <span className="text-amber-600 font-semibold">{item.excused}h Excused</span>}
                                                            {item.absent > 0 && <span className="text-red-500 font-semibold">{item.absent}h Absent</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-[10px] text-gray-400 font-bold">
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Present</span>
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Excused</span>
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Absent</span>
                                    </div>
                                </div>
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
                                            href={resolveMediaUrl(programDetails.curriculum_file) || "#"}
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
                                                    {totalSessionsActive}
                                                </div>
                                                <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">Total Sessions Active</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* Right Sidebar */}
                            <div className="space-y-6">
                                {/* Upcoming Events & News */}
                                <UpcomingEventsList limit={5} viewAllHref="/portal/student/news" />
                            </div>
                        </div>

                        {/* Full Width Star Students Table (Identical to Admin Dashboard Design) */}
                        <div className="w-full mt-8">
                            <DataTable
                                title="🌟 Star Students"
                                columns={starStudentColumns}
                                data={rankedStarStudents}
                                isLoading={leaderboardLoading}
                                showAddButton={false}
                                rowsPerPage={5}
                                emptyMessage="No top performers found in your course yet."
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

