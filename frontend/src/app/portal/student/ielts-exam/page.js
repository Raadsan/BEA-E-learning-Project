"use client";

import { useDarkMode } from "@/context/ThemeContext";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useGetProficiencyTestsQuery, useGetStudentProficiencyResultsQuery } from "@/redux/api/proficiencyTestApi";
import Loader from "@/components/Loader";
import { useRouter } from "next/navigation";

export default function IeltsProficiencyExamPage() {
    const { isDark } = useDarkMode();
    const router = useRouter();
    const { data: user, isLoading: userLoading } = useGetCurrentUserQuery();
    const { data: tests, isLoading: testsLoading } = useGetProficiencyTestsQuery();
    const { data: results } = useGetStudentProficiencyResultsQuery(user?.id || user?.student_id, {
        skip: !user
    });

    if (userLoading || testsLoading) return <Loader fullPage />;

    // Filter tests that match the user's program or are general
    const availableTests = tests?.filter(t =>
        !user?.chosen_program ||
        t.program_id == user.chosen_program ||
        t.title.toLowerCase().includes(user.chosen_program.toLowerCase())
    ) || [];

    const hasTakenAny = results && results.length > 0;

    // 24-Hour Expiry Logic (with 5-minute grace period)
    const regDate = user?.created_at ? new Date(user.created_at) : null;
    const now = new Date();
    const hoursSinceReg = regDate ? (now - regDate) / (1000 * 60 * 60) : 0;
    const isExpired = hoursSinceReg > 24.0833 && !hasTakenAny;

    const cardBg = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-xl';
    const textColor = isDark ? 'text-white' : 'text-gray-900';

    return (
        <div className={`min-h-screen pt-20 px-6 sm:px-10 pb-20 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-5xl mx-auto">
                {/* Hero section */}
                <div className="mb-12">
                    <h1 className={`text-4xl font-bold mb-4 tracking-tight ${textColor}`}>
                        Assessment Center
                    </h1>
                    <p className={`text-lg font-medium opacity-60 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Welcome back, <span className="text-blue-600">{user?.full_name}</span>. Complete your proficiency evaluation to finalize your academic placement.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Instructions Card */}
                    <div className={`lg:col-span-2 p-8 rounded-3xl border ${cardBg}`}>
                        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100 dark:border-gray-700">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className={`text-xl font-bold ${textColor}`}>Examination Guidelines</h3>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">Please read carefully before starting</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-gray-700 flex items-center justify-center shrink-0 text-blue-600 font-bold text-sm">1</div>
                                <div>
                                    <h4 className={`font-bold mb-1 ${textColor}`}>Timed Session</h4>
                                    <p className="text-sm text-gray-500 leading-relaxed font-medium">Once started, the timer cannot be paused. Ensure you have at least 60-90 minutes of uninterrupted time.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-gray-700 flex items-center justify-center shrink-0 text-blue-600 font-bold text-sm">2</div>
                                <div>
                                    <h4 className={`font-bold mb-1 ${textColor}`}>Automatic Submission</h4>
                                    <p className="text-sm text-gray-500 leading-relaxed font-medium">If the timer expires, your current progress will be automatically saved and submitted for evaluation.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-gray-700 flex items-center justify-center shrink-0 text-blue-600 font-bold text-sm">3</div>
                                <div>
                                    <h4 className={`font-bold mb-1 ${textColor}`}>Strict Integrity</h4>
                                    <p className="text-sm text-gray-500 leading-relaxed font-medium">Our system monitors tab switching. Navigating away from the exam page may lead to automatic disqualification.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Test Selection Sidebar */}
                    <div className="space-y-6">
                        <div className={`p-6 rounded-3xl border ${cardBg}`}>
                            <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${textColor}`}>
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                Available Programs
                            </h3>

                            <div className="space-y-3">
                                {isExpired ? (
                                    <div className="text-center py-8 px-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
                                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <h4 className="text-red-600 font-bold mb-2">Access Expired</h4>
                                        <p className="text-xs text-red-500 font-medium leading-relaxed">
                                            The 24-hour window for this proficiency test has closed. Please contact administration to request a reset.
                                        </p>
                                        <button
                                            onClick={() => router.push('/portal/student')}
                                            className="mt-4 text-xs font-bold text-red-700 underline"
                                        >
                                            Return to Dashboard
                                        </button>
                                    </div>
                                ) : availableTests.length > 0 ? (
                                    availableTests.map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => router.push(`/portal/student/proficiency-test/take?id=${t.id}`)}
                                            className={`w-full p-4 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${isDark ? 'bg-gray-900 border-gray-700 hover:border-blue-500' : 'bg-gray-50 border-gray-100 hover:border-blue-200'
                                                }`}
                                        >
                                            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">{t.duration_minutes} Minutes</p>
                                            <h4 className={`font-bold text-sm ${textColor}`}>{t.title}</h4>
                                        </button>
                                    ))
                                ) : (
                                    <div className="text-center py-6">
                                        <p className="text-sm text-gray-400 italic">No specific tests assigned yet. Contact your coordinator.</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your Status</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${hasTakenAny ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {hasTakenAny ? 'Enrolled' : 'Pending'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
