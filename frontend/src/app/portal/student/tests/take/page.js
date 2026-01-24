"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDarkMode } from "@/context/ThemeContext";
import Loader from "@/components/Loader";
import { useGetAssignmentsQuery, useSubmitAssignmentMutation } from "@/redux/api/assignmentApi";
import { useToast } from "@/components/Toast";

export default function TakeTestPage() {
    const { isDark } = useDarkMode();
    const router = useRouter();
    const { showToast } = useToast();
    const searchParams = useSearchParams();
    const testId = searchParams.get("id");

    const [submitAssignment, { isLoading: isSubmitting }] = useSubmitAssignmentMutation();
    const { data: assignments, isLoading: testsLoading } = useGetAssignmentsQuery({
        type: 'test'
    });

    const assignment = useMemo(() => {
        return assignments?.find(a => a.id === parseInt(testId));
    }, [assignments, testId]);

    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [isTimeUp, setIsTimeUp] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);

    const user = useMemo(() => {
        if (typeof window !== "undefined") {
            try {
                return JSON.parse(localStorage.getItem("user") || "{}");
            } catch (e) {
                return {};
            }
        }
        return {};
    }, []);

    const questions = useMemo(() => {
        if (!assignment) return [];
        let fetchedQuestions = typeof assignment.questions === "string"
            ? JSON.parse(assignment.questions)
            : assignment.questions || [];

        if (!Array.isArray(fetchedQuestions)) return [];

        const questionsWithKeys = fetchedQuestions.map((q, idx) => ({
            ...q,
            stableKey: q.id || `q-${idx}`,
            part: q.part || 1
        }));

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
            if (!str) return 0;
            const s = str.toString();
            for (let i = 0; i < s.length; i++) {
                hash = (hash << 5) - hash + s.charCodeAt(i);
                hash |= 0;
            }
            return Math.abs(hash);
        };

        const baseSeed = studentIdHash(user.id || user.student_id || "guest");

        const parts = {};
        questionsWithKeys.forEach(q => {
            if (!parts[q.part]) parts[q.part] = [];
            parts[q.part].push(q);
        });

        const sortedPartKeys = Object.keys(parts).sort((a, b) => Number(a) - Number(b));
        const finalQuestions = [];

        sortedPartKeys.forEach(pKey => {
            const partQuestions = parts[pKey];
            const shuffledPart = deterministicShuffle([...partQuestions], baseSeed + Number(pKey));

            const processedPart = shuffledPart.map((q, idx) => {
                if (q.type === 'mcq' && Array.isArray(q.options)) {
                    return {
                        ...q,
                        options: deterministicShuffle([...q.options], baseSeed + Number(pKey) * 100 + idx)
                    };
                }
                return q;
            });

            finalQuestions.push(...processedPart);
        });

        return finalQuestions;
    }, [assignment, user.id, user.student_id]);

    useEffect(() => {
        if (assignment?.student_content) {
            const initial = typeof assignment.student_content === 'string'
                ? JSON.parse(assignment.student_content)
                : assignment.student_content;
            setAnswers(initial || {});
        }
    }, [assignment]);

    useEffect(() => {
        if (assignment?.duration && timeRemaining === null) {
            setTimeRemaining(assignment.duration * 60);
        }
    }, [assignment, timeRemaining]);

    useEffect(() => {
        if (timeRemaining === null || timeRemaining <= 0) return;
        const timer = setInterval(() => setTimeRemaining(p => p - 1), 1000);
        return () => clearInterval(timer);
    }, [timeRemaining]);

    useEffect(() => {
        if (timeRemaining === 0 && !isTimeUp) {
            setIsTimeUp(true);
            handleFinalSubmit(true);
        }
    }, [timeRemaining, isTimeUp]);

    const handleFinalSubmit = async (auto = false) => {
        try {
            await submitAssignment({
                assignment_id: parseInt(testId),
                content: answers,
                type: "test"
            }).unwrap();
            router.push(`/portal/student/tests/results?id=${testId}`);
            showToast(auto ? "Time's up! Test auto-submitted." : "Test submitted successfully!", "success");
        } catch (err) {
            showToast(err.data?.error || "Failed to submit test", "error");
        } finally {
            setShowSubmitModal(false);
        }
    };

    const handleAnswerChange = (qId, value) => {
        setAnswers(prev => ({ ...prev, [qId]: value }));
    };

    const formatTime = (s) => {
        if (s === null) return "00:00";
        const m = Math.floor(s / 60);
        return `${m}:${(s % 60).toString().padStart(2, "0")}`;
    };

    if (testsLoading || !assignment) return <Loader fullPage />;

    const currentQ = questions[currentQuestionIdx];
    if (!currentQ) return <Loader fullPage />;

    const isFirst = currentQuestionIdx === 0;
    const isLast = currentQuestionIdx === questions.length - 1;
    const hasAnsweredCurrent = answers[currentQ?.stableKey] !== undefined && answers[currentQ?.stableKey] !== "";

    const handleNext = () => {
        const nextIdx = currentQuestionIdx + 1;
        if (nextIdx >= questions.length) return;

        const currentPart = currentQ.part;
        const nextPart = questions[nextIdx].part;

        if (nextPart !== currentPart) {
            const currentPartQuestions = questions.filter(q => q.part === currentPart);
            const isComplete = currentPartQuestions.every(q => answers[q.stableKey]);

            if (!isComplete) {
                alert(`Please answer all questions in Part ${currentPart} before proceeding to Part ${nextPart}.`);
                return;
            }
        }

        setCurrentQuestionIdx(nextIdx);
    };

    const cardBg = isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow-sm";
    const textColor = isDark ? "text-white" : "text-gray-900";
    const secondaryText = isDark ? "text-gray-400" : "text-gray-600";

    return (
        <div className={`min-h-screen transition-colors duration-300 py-10 px-4 sm:px-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-[900px] mx-auto">
                {/* Header */}
                <div className={`p-6 rounded-2xl border mb-6 flex justify-between items-center ${cardBg}`}>
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push('/portal/student/tests')} className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${secondaryText}`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <div>
                            <h1 className={`text-xl font-bold ${textColor}`}>{assignment.title}</h1>
                            <p className={`text-xs ${secondaryText}`}>Progress: {Math.round(((currentQuestionIdx) / questions.length) * 100)}%</p>
                        </div>
                    </div>
                    <div className={`px-4 py-2 rounded-xl font-mono text-lg font-bold border transition-colors ${timeRemaining < 300 ? "text-red-500 border-red-500 bg-red-50 animate-pulse" : "text-blue-600 border-blue-200 bg-blue-50"
                        }`}>
                        {formatTime(timeRemaining)}
                    </div>
                </div>

                {/* Question Card */}
                <div className={`p-10 rounded-3xl border min-h-[500px] flex flex-col ${cardBg}`}>
                    <div className="flex justify-between items-center mb-10 pb-4 border-b dark:border-gray-700">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-500 opacity-60">Part {currentQ.part}</span>
                            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Question {questions.filter(q => q.part === currentQ.part).findIndex(q => q.stableKey === currentQ.stableKey) + 1} of {questions.filter(q => q.part === currentQ.part).length}</span>
                        </div>
                        <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase bg-blue-100 text-blue-600 self-start">
                            {currentQ.type?.toUpperCase()}
                        </span>
                    </div>

                    <div className="flex-1">
                        <h2 className={`text-xl font-semibold leading-relaxed mb-8 ${textColor}`}>{currentQ.questionText || currentQ.question}</h2>

                        {currentQ.type === 'mcq' && (
                            <div className="space-y-4">
                                {currentQ.options?.map((opt, i) => (
                                    <label key={i} className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer group ${answers[currentQ.stableKey] === opt ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'border-gray-50 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800'}`}>
                                        <input type="radio" checked={answers[currentQ.stableKey] === opt} onChange={() => handleAnswerChange(currentQ.stableKey, opt)} className="w-5 h-5 accent-blue-600" />
                                        <span className={`text-base font-medium transition-colors ${answers[currentQ.stableKey] === opt ? 'text-blue-700 dark:text-blue-400' : secondaryText}`}>{opt}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {currentQ.type === 'essay' && (
                            <textarea
                                value={answers[currentQ.stableKey] || ""}
                                onChange={(e) => handleAnswerChange(currentQ.stableKey, e.target.value)}
                                className={`w-full p-6 rounded-2xl border-2 min-h-[350px] outline-none transition-all text-base ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-600'}`}
                                placeholder="Type your answer here..."
                            />
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center mt-12 pt-8 border-t dark:border-gray-700">
                        <button
                            onClick={() => setCurrentQuestionIdx(p => Math.max(0, p - 1))}
                            disabled={isFirst}
                            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${isFirst ? 'opacity-0 cursor-default' : `hover:bg-gray-100 dark:hover:bg-gray-700 ${secondaryText}`}`}
                        >
                            ← Back
                        </button>

                        <div className="flex gap-4">
                            {!isLast ? (
                                <button
                                    onClick={handleNext}
                                    disabled={!hasAnsweredCurrent}
                                    className={`px-10 py-3 rounded-xl text-sm font-bold shadow-lg transition-all ${!hasAnsweredCurrent ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98]'}`}
                                >
                                    Continue →
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowSubmitModal(true)}
                                    disabled={!hasAnsweredCurrent || isSubmitting}
                                    className="bg-green-600 text-white px-12 py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-green-700 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                >
                                    {isSubmitting ? "Finalizing..." : "Submit Test"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Submit Modal */}
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
                            <button onClick={() => handleFinalSubmit(false)} disabled={isSubmitting} className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-900/20">{isSubmitting ? "Submitting..." : "Yes, Submit"}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
