"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDarkMode } from "@/context/ThemeContext";
import Loader from "@/components/Loader";
import { API_BASE_URL } from "@/constants";
import {
    useGetProficiencyTestByIdQuery,
    useSubmitProficiencyTestMutation,
    useGetStudentProficiencyResultsQuery
} from "@/redux/api/proficiencyTestApi";
import { useGetIeltsToeflStudentQuery } from "@/redux/api/ieltsToeflApi";
import { useSendTestReminderEmailMutation } from "@/redux/api/notificationApi";

export default function TakeProficiencyTestPage() {
    const { isDark } = useDarkMode();
    const router = useRouter();
    const searchParams = useSearchParams();
    const testId = searchParams.get("id");

    const { data: test, isLoading: testLoading } = useGetProficiencyTestByIdQuery(testId, {
        skip: !testId,
    });
    const [submitTest, { isLoading: isSubmitting }] = useSubmitProficiencyTestMutation();

    const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
    const { data: results } = useGetStudentProficiencyResultsQuery(user.id || user.student_id, {
        skip: !user.id && !user.student_id,
    });

    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [currentSubQuestionIdx, setCurrentSubQuestionIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [reminderSent, setReminderSent] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [sendReminderEmail] = useSendTestReminderEmailMutation();

    const questions = useMemo(() => {
        if (!test) return [];
        let fetchedQuestions = typeof test.questions === "string" ? JSON.parse(test.questions) : test.questions;
        if (!Array.isArray(fetchedQuestions)) return [];

        const deterministicShuffle = (array, seed) => {
            let m = array.length, t, i;
            while (m) {
                i = Math.floor(Math.abs(Math.sin(seed++)) * m--);
                t = array[m];
                array[m] = array[i];
                array[i] = t;
            }
            return array;
        };

        const studentIdHash = (str) => {
            let hash = 0;
            const s = str?.toString() || "guest";
            for (let i = 0; i < s.length; i++) {
                hash = (hash << 5) - hash + s.charCodeAt(i);
                hash |= 0;
            }
            return Math.abs(hash);
        };

        const baseSeed = studentIdHash(user.id || user.student_id || "guest");

        const parts = { 1: [], 2: [], 3: [], 4: [] };
        fetchedQuestions.forEach(q => {
            const p = q.part || 1;
            if (parts[p]) parts[p].push(q);
            else parts[1].push(q);
        });

        const shuffled = [];
        [1, 2, 3, 4].forEach(p => {
            if (parts[p].length > 0) {
                const shuffledPart = deterministicShuffle([...parts[p]], baseSeed + p);
                const finalPart = shuffledPart.map((q, idx) => {
                    const optionsSeed = baseSeed + (p * 100) + idx;
                    if ((q.type === 'mcq' || q.type === 'multiple_choice') && Array.isArray(q.options)) {
                        return { ...q, options: deterministicShuffle([...q.options], optionsSeed) };
                    }
                    if (q.type === 'passage' && Array.isArray(q.subQuestions)) {
                        const subSeed = baseSeed + (p * 200) + idx;
                        const shuffledSubs = deterministicShuffle([...q.subQuestions], subSeed);
                        const finalSubQuestions = shuffledSubs.map((sq, sqIdx) => ({
                            ...sq,
                            options: Array.isArray(sq.options) ? deterministicShuffle([...sq.options], subSeed + sqIdx) : sq.options
                        }));
                        return { ...q, subQuestions: finalSubQuestions };
                    }
                    return q;
                });
                shuffled.push(...finalPart);
            }
        });
        return shuffled;
    }, [test, user.id, user.student_id]);

    const { data: studentInfo, isLoading: studentLoading } = useGetIeltsToeflStudentQuery(user.id || user.student_id, {
        skip: !user.id && !user.student_id,
    });

    useEffect(() => {
        const student = studentInfo?.student;
        if (results && testId && student) {
            const alreadyTaken = results.find(r => r.test_id === parseInt(testId));
            if (alreadyTaken) router.replace(`/portal/student/proficiency-test/results?id=${alreadyTaken.id}`);

            // Enforced Entry Window Protection (Uses IELTSTOEFL.expiry_date)
            if (student.expiry_date && !alreadyTaken) {
                const now = new Date();
                const expiry = new Date(student.expiry_date);
                if (now > expiry) {
                    alert("Your test entry window has expired. Please contact administration for extra time.");
                    router.replace("/portal/student");
                }
            }
        }
    }, [results, testId, router, studentInfo]);

    useEffect(() => {
        if (test?.duration_minutes && timeRemaining === null) {
            setTimeRemaining(test.duration_minutes * 60);
        }
    }, [test, timeRemaining]);

    useEffect(() => {
        if (timeRemaining === 0) performSubmit(true);
        if (timeRemaining === null || timeRemaining <= 0) return;

        // Send email reminder when 5 minutes 59 seconds remain (359 seconds)
        if (timeRemaining === 359 && !reminderSent && user.email) {
            sendReminderEmail({
                email: user.email,
                testTitle: test?.title,
                studentName: user.full_name || user.first_name,
                remainingTime: "5:59"
            }).unwrap().then(() => setReminderSent(true)).catch(err => console.error("Failed to send reminder:", err));
        }

        const timer = setInterval(() => setTimeRemaining(p => p - 1), 1000);
        return () => clearInterval(timer);
    }, [timeRemaining, reminderSent, user, test, sendReminderEmail]);

    const handleAnswerChange = (qId, value) => {
        setAnswers(prev => ({ ...prev, [qId]: value }));
    };

    const performSubmit = async (silent = false) => {
        if (!silent) {
            setShowSubmitModal(true);
            return;
        }
        await handleConfirmSubmit();
    };

    const handleConfirmSubmit = async () => {
        try {
            const result = await submitTest({
                test_id: testId,
                student_id: user.id || user.student_id,
                answers: answers,
            }).unwrap();
            router.push(`/portal/student/proficiency-test/results?id=${result.id}`);
        } catch (err) {
            alert("Failed to submit. Please try again.");
        }
        setShowSubmitModal(false);
    };

    if (testLoading || !test) return <Loader fullPage />;

    const currentQ = questions[currentQuestionIdx];
    if (!currentQ) return <Loader fullPage />;

    const isLast = currentQuestionIdx === questions.length - 1;
    const currentPart = currentQ.part || 1;
    const currentPartQuestions = questions.filter(q => (q.part || 1) === currentPart);
    const currentQuestionInPartIdx = currentPartQuestions.findIndex(q => q.id === currentQ.id) + 1;

    const formatTime = (s) => {
        if (s === null) return "00:00:00";
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    };

    const cardBg = isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow-sm";
    const textColor = isDark ? "text-white" : "text-gray-900";
    const secondaryText = isDark ? "text-gray-400" : "text-gray-600";

    const handleNext = () => {
        if (currentQ.type === 'passage' && currentSubQuestionIdx < currentQ.subQuestions.length - 1) {
            setCurrentSubQuestionIdx(prev => prev + 1);
            return;
        }
        if (currentQuestionIdx < questions.length - 1) {
            setCurrentQuestionIdx(prev => prev + 1);
            setCurrentSubQuestionIdx(0);
        }
    };

    const handlePrevious = () => {
        if (currentQ.type === 'passage' && currentSubQuestionIdx > 0) {
            setCurrentSubQuestionIdx(prev => prev - 1);
            return;
        }
        if (currentQuestionIdx > 0) {
            const prevIdx = currentQuestionIdx - 1;
            const prevQ = questions[prevIdx];
            setCurrentQuestionIdx(prevIdx);
            setCurrentSubQuestionIdx(prevQ.type === 'passage' ? prevQ.subQuestions.length - 1 : 0);
        }
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 py-10 px-4 sm:px-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-[900px] mx-auto">
                {/* Header */}
                <div className={`p-6 rounded-2xl border mb-6 flex justify-between items-center ${cardBg}`}>
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${secondaryText}`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <div>
                            <h1 className={`text-xl font-bold ${textColor}`}>{test.title}</h1>
                            <p className={`text-xs ${secondaryText}`}>Progress: {Math.round(((currentQuestionIdx) / questions.length) * 100)}%</p>
                        </div>
                    </div>
                    <div className={`px-4 py-2 rounded-xl font-mono text-lg font-bold border transition-colors ${timeRemaining < 300 ? "text-red-500 border-red-500 bg-red-50 animate-pulse" : "text-blue-600 border-blue-200 bg-blue-50"
                        }`}>
                        {formatTime(timeRemaining)}
                    </div>
                </div>

                {/* Main Card */}
                <div className={`p-10 rounded-3xl border min-h-[500px] flex flex-col ${cardBg}`}>
                    <div className="flex justify-between items-center mb-10 pb-4 border-b dark:border-gray-700">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-500 opacity-60">Part {currentPart}</span>
                            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Question {currentQuestionInPartIdx} of {currentPartQuestions.length}</span>
                        </div>
                        <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase bg-blue-100 text-blue-600 self-start">
                            {currentQ.type === 'multiple_choice' ? 'MCQ' : currentQ.type.toUpperCase()}
                        </span>
                    </div>

                    <div className="flex-1">
                        {(currentQ.type === "mcq" || currentQ.type === "multiple_choice") && (
                            <div className="space-y-6">
                                <h2 className={`text-xl font-semibold leading-relaxed mb-8 ${textColor}`}>{currentQ.questionText || currentQ.question}</h2>
                                <div className="space-y-4">
                                    {currentQ.options.map((opt, i) => (
                                        <label key={i} className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer group ${answers[currentQ.id] === opt ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'border-gray-50 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800'}`}>
                                            <input type="radio" checked={answers[currentQ.id] === opt} onChange={() => handleAnswerChange(currentQ.id, opt)} className="w-5 h-5 accent-blue-600" />
                                            <span className={`text-base font-medium transition-colors ${answers[currentQ.id] === opt ? 'text-blue-700 dark:text-blue-400' : secondaryText}`}>{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {currentQ.type === "passage" && (
                            <div className="flex flex-col gap-8">
                                <div className={`p-8 rounded-2xl border leading-relaxed text-base italic ${isDark ? 'bg-gray-700/30 border-gray-600 text-gray-300' : 'bg-blue-50/30 border-blue-100 text-gray-700'}`}>
                                    {currentQ.passageText}
                                </div>
                                {(() => {
                                    const sq = currentQ.subQuestions[currentSubQuestionIdx];
                                    if (!sq) return null;
                                    return (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                            <h3 className={`text-lg font-bold ${textColor}`}>Q{currentSubQuestionIdx + 1}. {sq.questionText}</h3>
                                            <div className="space-y-3">
                                                {sq.options.map((opt, oi) => (
                                                    <label key={oi} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${answers[sq.id] === opt ? 'border-blue-600 bg-blue-50/50' : 'border-gray-50 dark:border-gray-700 hover:border-blue-100'}`}>
                                                        <input type="radio" checked={answers[sq.id] === opt} onChange={() => handleAnswerChange(sq.id, opt)} className="w-4 h-4 accent-blue-600" />
                                                        <span className={`text-sm font-medium ${answers[sq.id] === opt ? 'text-blue-700' : secondaryText}`}>{opt}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            <p className="text-[10px] uppercase font-bold text-gray-400">Sub-question {currentSubQuestionIdx + 1} of {currentQ.subQuestions.length}</p>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        {(currentQ.type === "essay" || currentQ.type === "audio") && (
                            <div className="space-y-6">
                                <h2 className={`text-xl font-bold ${textColor}`}>{currentQ.title || "Subjective and Writing"}</h2>
                                {currentQ.type === "audio" && (
                                    <div className={`p-4 rounded-2xl flex items-center gap-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                        <audio controls className="w-full h-10">
                                            <source src={currentQ.audioUrl?.startsWith('http') ? currentQ.audioUrl : `${API_BASE_URL}${currentQ.audioUrl}`} />
                                        </audio>
                                    </div>
                                )}
                                <p className={`text-sm font-medium leading-relaxed italic ${secondaryText}`}>{currentQ.description}</p>
                                <textarea
                                    value={answers[currentQ.id] || ""}
                                    onChange={e => handleAnswerChange(currentQ.id, e.target.value)}
                                    className={`w-full p-6 rounded-2xl border-2 min-h-[350px] outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-600'}`}
                                    placeholder="Type your response here..."
                                />
                            </div>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center mt-12 pt-8 border-t dark:border-gray-700">
                        <button
                            onClick={handlePrevious}
                            disabled={currentQuestionIdx === 0 && currentSubQuestionIdx === 0}
                            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${currentQuestionIdx === 0 && currentSubQuestionIdx === 0 ? 'opacity-0 cursor-default' : `hover:bg-gray-100 dark:hover:bg-gray-700 ${secondaryText}`}`}
                        >
                            ← Back
                        </button>

                        <div className="flex gap-4">
                            {!isLast || (currentQ.type === 'passage' && currentSubQuestionIdx < currentQ.subQuestions.length - 1) ? (
                                <button
                                    onClick={handleNext}
                                    className="bg-blue-600 text-white px-10 py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    Continue →
                                </button>
                            ) : (
                                <button
                                    onClick={() => performSubmit()}
                                    disabled={isSubmitting}
                                    className="bg-green-600 text-white px-12 py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-green-700 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                >
                                    {isSubmitting ? "Finalizing..." : "Submit Test"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showSubmitModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className={`rounded-3xl shadow-2xl max-w-md w-full p-8 text-center animate-in zoom-in-95 duration-200 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className={`text-2xl font-bold mb-2 ${textColor}`}>Finish Test?</h3>
                        <p className={`${secondaryText} mb-8`}>Are you sure you want to submit your answers? This cannot be undone.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setShowSubmitModal(false)} className={`flex-1 py-4 rounded-2xl font-bold ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>Cancel</button>
                            <button onClick={handleConfirmSubmit} disabled={isSubmitting} className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-900/20">{isSubmitting ? "Submitting..." : "Yes, Submit"}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
