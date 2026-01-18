"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    useGetProficiencyTestByIdQuery,
    useSubmitProficiencyTestMutation,
    useGetStudentProficiencyResultsQuery
} from "@/redux/api/proficiencyTestApi";
import { toast, Toaster } from 'react-hot-toast';

export default function TakeProficiencyTestPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const testId = searchParams.get("id");

    const { data: test, isLoading: testLoading } = useGetProficiencyTestByIdQuery(testId, {
        skip: !testId,
    });
    const [submitTest, { isLoading: isSubmitting }] = useSubmitProficiencyTestMutation();

    const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
    const { data: results, isLoading: resultsLoading } = useGetStudentProficiencyResultsQuery(user.id || user.student_id, {
        skip: !user.id && !user.student_id,
    });

    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [currentSubQuestionIdx, setCurrentSubQuestionIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [showSubmitModal, setShowSubmitModal] = useState(false);

    // Parse and shuffle questions
    const questions = useMemo(() => {
        if (!test) return [];
        let fetchedQuestions = typeof test.questions === "string" ? JSON.parse(test.questions) : test.questions;
        if (!Array.isArray(fetchedQuestions)) return [];

        // Deterministic shuffle helper (same as placement test)
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
            for (let i = 0; i < str.toString().length; i++) {
                hash = (hash << 5) - hash + str.toString().charCodeAt(i);
                hash |= 0;
            }
            return Math.abs(hash);
        };

        const baseSeed = studentIdHash(user.id || user.student_id || "guest");

        // Group by part
        const parts = { 1: [], 2: [], 3: [], 4: [] };
        fetchedQuestions.forEach(q => {
            const p = q.part || 1;
            if (parts[p]) parts[p].push(q);
            else parts[1].push(q); // fallback
        });

        // Shuffle each part and flatten
        const shuffled = [];
        [1, 2, 3, 4].forEach(p => {
            if (parts[p].length > 0) {
                const shuffledPart = deterministicShuffle([...parts[p]], baseSeed + p);

                const finalPart = shuffledPart.map((q, idx) => {
                    if ((q.type === 'mcq' || q.type === 'multiple_choice') && Array.isArray(q.options)) {
                        const optionsSeed = baseSeed + (p * 100) + idx;
                        return {
                            ...q,
                            options: deterministicShuffle([...q.options], optionsSeed)
                        };
                    }
                    if (q.type === 'passage' && Array.isArray(q.subQuestions)) {
                        const subSeed = baseSeed + (p * 200) + idx;
                        const shuffledSubs = deterministicShuffle([...q.subQuestions], subSeed);
                        const finalSubQuestions = shuffledSubs.map((sq, sqIdx) => {
                            if (Array.isArray(sq.options)) {
                                return {
                                    ...sq,
                                    options: deterministicShuffle([...sq.options], subSeed + sqIdx)
                                };
                            }
                            return sq;
                        });
                        return { ...q, subQuestions: finalSubQuestions };
                    }
                    return q;
                });

                shuffled.push(...finalPart);
            }
        });

        return shuffled;
    }, [test, user.id, user.student_id]);

    useEffect(() => {
        if (results && testId) {
            const alreadyTaken = results.find(r => r.test_id === parseInt(testId));
            if (alreadyTaken) router.replace(`/portal/student/proficiency-test/results?id=${alreadyTaken.id}`);
        }
    }, [results, testId, router]);

    useEffect(() => {
        if (test && test.duration_minutes && timeRemaining === null) {
            setTimeRemaining(test.duration_minutes * 60);
        }
    }, [test, timeRemaining]);

    useEffect(() => {
        if (timeRemaining === null || timeRemaining <= 0) return;
        const timer = setInterval(() => setTimeRemaining(p => p - 1), 1000);
        return () => clearInterval(timer);
    }, [timeRemaining]);

    const handleAnswerChange = (qId, value) => {
        setAnswers(prev => ({ ...prev, [qId]: value }));
    };

    const handleSubmit = async () => {
        if (!user) return;

        // Validation: Check if all questions are answered
        const unanswered = questions.filter(q => !answers[q.id]);
        if (unanswered.length > 0) {
            toast.error(`Please answer all questions before submitting. (${unanswered.length} remaining)`);
            return;
        }

        setShowSubmitModal(true);
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
            alert(err.data?.error || "Failed to submit. Please try again.");
        }
        setShowSubmitModal(false);
    };

    if (testLoading || !test) return <div className="h-screen flex items-center justify-center font-medium text-[#010080]">Loading Test...</div>;

    const currentQ = questions[currentQuestionIdx];
    const isLast = currentQuestionIdx === questions.length - 1;
    const currentPart = currentQ?.part || 1;
    const currentPartQuestions = questions.filter(q => (q.part || 1) === currentPart);
    const currentQuestionInPartIdx = currentPartQuestions.findIndex(q => q.id === currentQ.id) + 1;

    const handleNext = () => {
        // PASSAGE SUB-QUESTION NAVIGATION
        if (currentQ?.type === 'passage' && Array.isArray(currentQ.subQuestions)) {
            if (currentSubQuestionIdx < currentQ.subQuestions.length - 1) {
                setCurrentSubQuestionIdx(prev => prev + 1);
                return;
            }
        }

        const nextIdx = currentQuestionIdx + 1;
        if (nextIdx >= questions.length) return;

        const nextPart = questions[nextIdx].part || 1;

        // Check boundary crossing
        if (nextPart !== currentPart) {
            const isComplete = currentPartQuestions.every(q => {
                if (q.type === 'passage' && Array.isArray(q.subQuestions)) {
                    return q.subQuestions.every(sq => answers[sq.id]);
                }
                return answers[q.id];
            });

            if (!isComplete) {
                alert(`Please answer all questions in Part ${currentPart} before proceeding to Part ${nextPart}.`);
                return;
            }
        }

        setCurrentQuestionIdx(nextIdx);
        setCurrentSubQuestionIdx(0);
    };

    const handlePrevious = () => {
        if (currentQ?.type === 'passage' && currentSubQuestionIdx > 0) {
            setCurrentSubQuestionIdx(prev => prev - 1);
            return;
        }

        const prevIdx = currentQuestionIdx - 1;
        if (prevIdx < 0) return;

        const prevQ = questions[prevIdx];
        setCurrentQuestionIdx(prevIdx);
        if (prevQ.type === 'passage' && Array.isArray(prevQ.subQuestions)) {
            setCurrentSubQuestionIdx(prevQ.subQuestions.length - 1);
        } else {
            setCurrentSubQuestionIdx(0);
        }
    };

    const formatTime = (s) => {
        if (s === null) return "00:00";
        const m = Math.floor(s / 60);
        return `${m}:${(s % 60).toString().padStart(2, "0")}`;
    };

    // Helper to get essay/question description if available or just title
    const getQuestionText = (q) => q.questionText || q.question || q.title;

    return (
        <main className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="w-full px-8">
                <div className="bg-white p-8 rounded-xl border border-gray-200 mb-6 flex justify-between items-center shadow-sm">
                    <div className="space-y-1">
                        <h1 className="text-xl font-semibold text-gray-900">{test.title}</h1>
                        <p className="text-sm text-gray-500">{test.description}</p>
                    </div>
                    <div className="bg-[#010080] text-white px-5 py-2 rounded-lg font-mono text-lg font-semibold min-w-[100px] text-center">
                        {formatTime(timeRemaining)}
                    </div>
                </div>

                <div className="bg-white p-10 rounded-xl border border-gray-200 min-h-[450px] shadow-sm">
                    <div className="flex justify-between items-center mb-10 pb-4 border-b">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                            Part {currentPart}: Question {currentQuestionInPartIdx} of {currentPartQuestions.length}
                        </span>
                        <span className="text-[10px] font-bold text-[#010080] bg-blue-50 px-3 py-1 rounded uppercase">{currentQ?.type === 'multiple_choice' ? 'MCQ' : currentQ?.type}</span>
                    </div>

                    {(currentQ?.type === "mcq" || currentQ?.type === "multiple_choice") && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-gray-800 leading-relaxed">{currentQ.questionText || currentQ.question}</h2>
                            <div className="space-y-3 pt-2">
                                {currentQ.options.map((opt, i) => (
                                    <label key={i} className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${answers[currentQ.id] === opt ? 'border-[#010080] bg-blue-50/20' : 'border-gray-100 hover:border-gray-200'}`}>
                                        <input type="radio" checked={answers[currentQ.id] === opt} onChange={() => handleAnswerChange(currentQ.id, opt)} className="w-4 h-4 accent-[#010080]" />
                                        <span className={`text-sm font-medium ${answers[currentQ.id] === opt ? 'text-[#010080]' : 'text-gray-600'}`}>{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {currentQ?.type === "passage" && (
                        <div className="flex flex-col gap-8">
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-sm text-gray-700 leading-relaxed font-normal">
                                {currentQ.passageText}
                            </div>
                            <div className="space-y-10">
                                {(() => {
                                    const sq = currentQ.subQuestions[currentSubQuestionIdx];
                                    if (!sq) return null;

                                    return (
                                        <div key={currentSubQuestionIdx} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                            <p className="text-base font-semibold text-gray-900">
                                                {currentSubQuestionIdx + 1}. {sq.questionText}
                                            </p>
                                            <div className="space-y-2">
                                                {sq.options.map((opt, oi) => (
                                                    <label key={oi} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${answers[sq.id] === opt ? 'border-[#010080] bg-blue-50/20' : 'border-gray-50 hover:bg-gray-50'}`}>
                                                        <input type="radio" checked={answers[sq.id] === opt} onChange={() => handleAnswerChange(sq.id, opt)} className="accent-[#010080] w-4 h-4" />
                                                        <span className="text-sm font-medium text-gray-600">{opt}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            <div className="flex justify-between items-center pt-4">
                                                <span className="text-xs text-gray-400 font-medium">
                                                    Sub-question {currentSubQuestionIdx + 1} of {currentQ.subQuestions.length}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    )}

                    {currentQ?.type === "essay" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900">{getQuestionText(currentQ)}</h2>
                            <p className="text-sm text-gray-600 font-medium leading-relaxed">{currentQ.description}</p>
                            <textarea
                                value={answers[currentQ.id] || ""}
                                onChange={e => handleAnswerChange(currentQ.id, e.target.value)}
                                className="w-full p-6 border rounded-xl min-h-[400px] focus:border-[#010080] outline-none bg-gray-50 focus:bg-white transition-all text-sm font-normal"
                                placeholder="Type your response here..."
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center mt-12 mb-20 px-2">
                    <button
                        onClick={handlePrevious}
                        disabled={currentQuestionIdx === 0 && currentSubQuestionIdx === 0}
                        className="px-8 py-2.5 text-sm font-medium text-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        ← Previous
                    </button>

                    <div className="flex gap-4">
                        {!isLast ? (
                            <button
                                onClick={handleNext}
                                className="bg-[#010080] text-white px-10 py-3 rounded-xl text-sm font-semibold shadow-md transition-all hover:bg-[#000060]"
                            >
                                Continue
                            </button>
                        ) : (
                            <button
                                onClick={() => handleSubmit()}
                                disabled={isSubmitting}
                                className="bg-green-600 text-white px-12 py-3 rounded-xl text-sm font-semibold shadow-lg hover:bg-green-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {isSubmitting ? "Finalizing..." : "Submit Test"}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {showSubmitModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform scale-100 animate-in zoom-in-95 duration-200">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-[#010080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Submit Test?</h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to submit your answers? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowSubmitModal(false)}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmSubmit}
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2.5 bg-[#010080] hover:bg-[#000060] text-white rounded-xl font-semibold transition-colors shadow-lg shadow-blue-900/20"
                                >
                                    {isSubmitting ? "Submitting..." : "Yes, Submit"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
