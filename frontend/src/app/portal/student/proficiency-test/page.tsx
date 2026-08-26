"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useDarkMode } from "@/context/ThemeContext";
import { useToast } from "@/components/Toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useGetProficiencyTestsQuery, useGetStudentProficiencyResultsQuery, useStartProficiencyTestMutation } from "@/lib/api/proficiencyTestApi";
import { isProficiencyOnlyStudent } from "@/utils/programCatalog";
import { useGetIeltsToeflStudentQuery } from "@/lib/api/ieltsToeflApi";
import { useGetCurrentUserQuery } from "@/lib/api/authApi";

export default function ProficiencyTestPage() {
    const router = useRouter();
    const { isDark } = useDarkMode();
    const { showToast } = useToast();
    const { data: tests, isLoading: testsLoading } = useGetProficiencyTestsQuery();

    const { data: user, isLoading: userLoading } = useGetCurrentUserQuery();
    const [startProficiencyTest, { isLoading: isStarting }] = useStartProficiencyTestMutation();
    const studentId = user?.id || user?.student_id;

    const { data: results, isLoading: resultsLoading } = useGetStudentProficiencyResultsQuery(studentId, {
        skip: !studentId,
    });

    const { data: studentInfo, isLoading: studentLoading } = useGetIeltsToeflStudentQuery(studentId, {
        skip: !studentId,
    });

    const [windowTimeLeft, setWindowTimeLeft] = React.useState<number | null>(null);

    // Entry window countdown logic
    React.useEffect(() => {
        const expiryDateStr = studentInfo?.student?.expiry_date || user?.expiry_date;
        if (!expiryDateStr) return;

        const calculateTime = () => {
            const getParsedExpiry = (dateVal: any) => {
                if (!dateVal) return null;
                if (dateVal instanceof Date) return dateVal;
                const dStr = dateVal.toString();
                const isoStr = dStr.includes('T') ? dStr : dStr.replace(' ', 'T');
                const finalStr = isoStr.includes('Z') || isoStr.includes('+') ? isoStr : `${isoStr}Z`;
                return new Date(finalStr);
            };

            const expiry = getParsedExpiry(expiryDateStr);
            if (!expiry || isNaN(expiry.getTime())) return;

            const now = new Date();
            const diff = Math.max(0, Math.floor((expiry.getTime() - now.getTime()) / 1000));
            setWindowTimeLeft(diff);
        };

        calculateTime();
        const timer = setInterval(calculateTime, 1000);
        return () => clearInterval(timer);
    }, [studentInfo, user]);

    // Determine the active test
    const activeTest = React.useMemo(() => {
        if (!tests || tests.length === 0) return null;
        const activeTests = tests.filter(t => t.status === 'active');
        if (activeTests.length === 0) return null;

        // Each eligible student receives one stable, random active proficiency test.
        // It changes only if the available active-test list changes.
        const seed = String(studentId || "guest");
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = (hash << 5) - hash + seed.charCodeAt(i);
            hash |= 0;
        }
        return activeTests[Math.abs(hash) % activeTests.length];
    }, [tests, studentId]);

    const isProficiencyOnly = isProficiencyOnlyStudent(user);
    const hasTakenTest = results?.find(r => r.test_id === activeTest?.id);

    React.useEffect(() => {
        if (hasTakenTest && !isProficiencyOnly) {
            router.replace(`/portal/student/proficiency-test/results?id=${hasTakenTest.id}`);
        }
    }, [hasTakenTest, router, isProficiencyOnly]);

    const isWindowExpired = (windowTimeLeft !== null && windowTimeLeft <= 0) && !isProficiencyOnly;
    const prevExpiredRef = React.useRef(isWindowExpired);

    React.useEffect(() => {
        if (prevExpiredRef.current === true && isWindowExpired === false) {
            showToast("Extra time granted! You can now start your proficiency test.", 'success');
        }
        prevExpiredRef.current = isWindowExpired;
    }, [isWindowExpired, showToast]);

    const isLoading = testsLoading || resultsLoading || studentLoading || userLoading || (hasTakenTest && true);

    const handleStartTest = async () => {
        if (!activeTest || !studentId || isWindowExpired) return;
        try {
            await startProficiencyTest({ test_id: activeTest.id, student_id: studentId }).unwrap();
            router.push(`/portal/student/proficiency-test/take?id=${activeTest.id}`);
        } catch (err: any) {
            showToast(err?.data?.error || "Unable to start the proficiency test.", 'error');
            if (err?.data?.result?.id) {
                router.push(`/portal/student/proficiency-test/results?id=${err.data.result.id}`);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (!activeTest) {
        return (
            <div className="flex h-screen items-center justify-center p-8">
                <div className={`p-8 rounded-xl border text-center max-w-lg w-full ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                    <p className="text-lg">No active proficiency tests found. Please contact support.</p>
                </div>
            </div>
        );
    }

    const questionsList = typeof activeTest.questions === 'string' ? JSON.parse(activeTest.questions) : activeTest.questions;

    const formatWindowTime = (seconds: number | null) => {
        if (seconds === null) return "Calculating...";
        if (seconds <= 0) return "Expired";
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hrs > 0) {
            return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
        }
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const isCertificateStudent = (studentInfo?.student?.verification_method || user?.verification_method || "").toLowerCase().includes("certificate");

    return (
        <main className={`flex-1 overflow-y-auto ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="w-full px-8 pt-4 pb-6 flex items-center justify-center min-h-full">
                <div className={`rounded-3xl shadow-lg p-12 max-w-2xl w-full border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>

                    {/* Window Status Banner */}
                    {!isProficiencyOnly && (
                        <div className={`mb-8 p-4 rounded-2xl flex items-center justify-between border-2 transition-all ${isWindowExpired
                            ? 'bg-red-50 border-red-100 text-red-600'
                            : (windowTimeLeft !== null && windowTimeLeft < 120)
                                ? 'bg-amber-50 border-amber-100 text-amber-600 animate-pulse'
                                : 'bg-green-50 border-green-100 text-green-600'
                            }`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isWindowExpired ? 'bg-red-100' : 'bg-white/50'}`}>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Entry Window</p>
                                    <p className="text-sm font-bold">{isWindowExpired ? (isCertificateStudent ? "Pending Review" : "Access Blocked") : "Time to Start"}</p>
                                </div>
                            </div>
                            <div className="text-xl font-mono font-black">
                                {formatWindowTime(windowTimeLeft)}
                            </div>
                        </div>
                    )}

                    {/* Header Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                    </div>

                    <h1 className={`text-4xl font-bold text-center mb-4 ${isDark ? 'text-white' : 'text-[#010080]'}`}>
                        {activeTest.title}
                    </h1>

                    <p className={`text-lg text-center mb-10 leading-relaxed ${isDark ? 'text-gray-400' : 'text-black'}`}>
                        {activeTest.description || "This comprehensive test will assess your English language proficiency across multiple skill areas including grammar, vocabulary, and writing."}
                    </p>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div className={`p-6 rounded-2xl flex flex-col items-center justify-center ${isDark ? 'bg-gray-750' : 'bg-gray-50'}`}>
                            <span className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Questions</span>
                            <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{questionsList?.length || 0}</span>
                        </div>
                        <div className={`p-6 rounded-2xl flex flex-col items-center justify-center ${isDark ? 'bg-gray-750' : 'bg-gray-50'}`}>
                            <span className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Duration</span>
                            <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {activeTest.duration_minutes >= 60 && activeTest.duration_minutes % 60 === 0
                                    ? `${activeTest.duration_minutes / 60} Hours`
                                    : `${activeTest.duration_minutes || 60} mins`}
                            </span>
                        </div>
                    </div>

                    {/* Test Instructions */}
                    <div className={`p-8 rounded-2xl mb-10 ${isDark ? 'bg-blue-900/10' : 'bg-blue-50/50'}`}>
                        <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Test Instructions
                        </h2>
                        <ul className={`space-y-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {isWindowExpired ? (
                                isCertificateStudent ? (
                                    <li className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 font-bold">
                                        <svg className="w-5 h-5 flex-shrink-0 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        <span>CERTIFICATE UNDER REVIEW (PENDING): You submitted a certificate during registration. Your application is currently pending admin review. You do not need to take this exam unless Admin grants you 24-hour exam access.</span>
                                    </li>
                                ) : (
                                    <li className="flex items-start gap-3 p-4 bg-red-100 rounded-xl text-red-700 font-bold">
                                        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        <span>YOUR ENTRY WINDOW HAS EXPIRED. YOU CANNOT START THE TEST NOW. PLEASE CONTACT ADMINISTRATION FOR EXTRA TIME.</span>
                                    </li>
                                )
                            ) : (
                                <>
                                    <li className="flex items-start gap-3">
                                        <span className="text-blue-600 mt-1">•</span>
                                        <span>Read each question carefully before answering</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-blue-600 mt-1">•</span>
                                        <span>You can navigate between questions using the navigation buttons</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-blue-600 mt-1">•</span>
                                        <span>Make sure to answer all questions before submitting</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-blue-600 mt-1">•</span>
                                        <span>The test must be completed in one session</span>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-4">
                        {hasTakenTest ? (
                            <>
                                <div className={`text-center p-3 rounded-lg border ${isDark ? 'bg-green-900/20 border-green-800 text-green-400' : 'bg-green-50 border-green-200 text-green-700'} w-full`}>
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
                                onClick={handleStartTest}
                                disabled={isWindowExpired || isStarting}
                                className={`px-12 py-3 font-bold rounded-xl transition-all shadow-lg w-full max-w-xs ${isWindowExpired
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                                    : 'bg-[#010080] hover:bg-[#000060] text-white hover:shadow-blue-900/20 active:scale-95'
                                    }`}
                            >
                                {isWindowExpired
                                    ? (isCertificateStudent ? "Pending Certificate Review" : "Entry Blocked")
                                    : isStarting ? "Starting..." : "Start Proficiency Test"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
