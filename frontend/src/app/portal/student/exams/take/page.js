"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDarkMode } from "@/context/ThemeContext";
import Loader from "@/components/Loader";
import { useGetAssignmentsQuery, useSubmitAssignmentMutation } from "@/redux/api/assignmentApi";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useToast } from "@/components/Toast";

export default function TakeExamPage() {
    const { isDark } = useDarkMode();
    const router = useRouter();
    const { showToast } = useToast();
    const searchParams = useSearchParams();
    const testId = searchParams.get("id");

    const [submitAssignment, { isLoading: isSubmitting }] = useSubmitAssignmentMutation();
    const { data: assignments, isLoading: testsLoading } = useGetAssignmentsQuery({ type: 'exam' });
    const { data: user } = useGetCurrentUserQuery();

    const assignment = useMemo(() => assignments?.find(a => a.id === parseInt(testId)), [assignments, testId]);

    // Redirect if already submitted
    useEffect(() => {
        if (assignment && (assignment.submission_status === 'submitted' || assignment.submission_status === 'graded')) {
            router.replace(`/portal/student/exams/results?id=${testId}`);
        }
    }, [assignment, testId, router]);

    // Deterministic Shuffle Helper
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

    const strHash = (str) => {
        let hash = 0;
        const s = str?.toString() || "guest";
        for (let i = 0; i < s.length; i++) {
            hash = (hash << 5) - hash + s.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash);
    };

    // Flattening Logic
    const flattenedSteps = useMemo(() => {
        if (!assignment?.questions || !user?.id) return [];
        try {
            const raw = typeof assignment.questions === 'string' ? JSON.parse(assignment.questions) : assignment.questions;
            const seed = strHash(user.id);
            const steps = [];

            // Paper 1: Writing
            if (raw.paper1) {
                const editingItems = deterministicShuffle([...(raw.paper1.editing || [])], seed + 1);
                editingItems.forEach((item, idx) => {
                    steps.push({
                        id: `p1_editing_${item.id}`,
                        part: 1,
                        type: "editing",
                        questionText: item.text,
                        badge: "Grammar"
                    });
                });
                if (raw.paper1.essay) {
                    steps.push({
                        id: `p1_essay`,
                        part: 1,
                        type: "essay",
                        questionText: raw.paper1.essay.prompt, // Matching placement search title
                        title: "Writing Task",
                        description: raw.paper1.essay.prompt,
                        badge: "Essay"
                    });
                }
            }

            // Paper 2: Reading
            if (raw.paper2) {
                const readingQs = deterministicShuffle([...(raw.paper2.questions || [])], seed + 2);
                readingQs.forEach((q, idx) => {
                    steps.push({
                        id: `p2_q_${q.id}`,
                        part: 2,
                        type: "reading_mcq",
                        passage: raw.paper2.passage,
                        questionText: q.questionText,
                        options: deterministicShuffle([...(q.options || [])], seed + 20 + idx),
                        badge: "Reading"
                    });
                });
            }

            // Paper 3: Listening
            if (raw.paper3) {
                const listeningQs = deterministicShuffle([...(raw.paper3.questions || [])], seed + 3);
                listeningQs.forEach((q, idx) => {
                    steps.push({
                        id: `p3_q_${q.id}`,
                        part: 3,
                        type: "listening_mcq",
                        audioUrl: raw.paper3.audioUrl,
                        questionText: q.questionText,
                        options: deterministicShuffle([...(q.options || [])], seed + 30 + idx),
                        badge: "Listening"
                    });
                });
            }

            // Paper 4: Oral
            if (raw.paper4) {
                steps.push({
                    id: `p4_oral`,
                    part: 4,
                    type: "oral",
                    passage: raw.paper4.passage,
                    instructions: raw.paper4.instructions,
                    badge: "Oral"
                });
            }

            return steps;
        } catch (e) { return []; }
    }, [assignment, user]);

    const [currentStepIdx, setCurrentStepIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [showSubmitModal, setShowSubmitModal] = useState(false);

    useEffect(() => {
        if (assignment?.duration && timeRemaining === null) {
            setTimeRemaining(assignment.duration * 60);
        }
    }, [assignment]);

    useEffect(() => {
        if (timeRemaining === 0) handleFinalSubmit(true);
        if (timeRemaining === null || timeRemaining <= 0) return;
        const timer = setInterval(() => setTimeRemaining(p => p - 1), 1000);
        return () => clearInterval(timer);
    }, [timeRemaining]);

    const handleAnswerChange = (key, value) => {
        setAnswers(prev => ({ ...prev, [key]: value }));
    };

    const handleFinalSubmit = async (auto = false) => {
        try {
            await submitAssignment({
                assignment_id: parseInt(testId),
                content: answers,
                type: "exam"
            }).unwrap();
            router.push(`/portal/student/exams/results?id=${testId}`);
            showToast(auto ? "Time's up! Exam auto-submitted." : "Exam submitted successfully!", "success");
        } catch (err) {
            showToast(err.data?.error || "Failed to submit exam", "error");
        }
    };

    if (testsLoading || !assignment || flattenedSteps.length === 0) return <Loader fullPage />;

    const currentStep = flattenedSteps[currentStepIdx];
    const isFirst = currentStepIdx === 0;
    const isLast = currentStepIdx === flattenedSteps.length - 1;

    const currentPart = currentStep.part;
    const partSteps = flattenedSteps.filter(s => s.part === currentPart);
    const stepInPartIdx = partSteps.findIndex(s => s.id === currentStep.id) + 1;

    const formatTime = (s) => {
        if (s === null) return "00:00";
        const m = Math.floor(s / 60);
        return `${m}:${(s % 60).toString().padStart(2, "0")}`;
    };

    const handleNext = () => {
        if (isLast) { setShowSubmitModal(true); return; }

        const nextStep = flattenedSteps[currentStepIdx + 1];
        if (nextStep.part !== currentStep.part) {
            const allInPartDone = partSteps.every(s => answers[s.id]);
            if (!allInPartDone) {
                showToast(`Please answer all questions in Part ${currentPart} before proceeding.`, "warning");
                return;
            }
        }
        setCurrentStepIdx(prev => prev + 1);
    };

    return (
        <main className={`min-h-screen py-10 px-4 sm:px-10 transition-colors ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="max-w-7xl mx-auto">

                {/* Placement Test Exact Header Design */}
                <div className={`p-8 rounded-xl border border-gray-200 mb-6 flex justify-between items-center shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                    <div className="space-y-1">
                        <h1 className="text-xl font-semibold">{assignment.title}</h1>
                        <p className="text-sm text-gray-500 font-medium">Exam Authority • Standard Academic Cycle</p>
                    </div>
                    <div className="bg-[#010080] text-white px-5 py-2 rounded-lg font-mono text-lg font-semibold min-w-[100px] text-center shadow-sm">
                        {formatTime(timeRemaining)}
                    </div>
                </div>

                {/* Main Question Card Design - Placement Test Replica */}
                <div className={`p-10 rounded-xl border border-gray-200 min-h-[450px] shadow-sm relative ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                            Part {currentStep.part}: Question {stepInPartIdx} of {partSteps.length}
                        </span>
                        <span className="text-[10px] font-bold text-[#010080] bg-blue-50 px-3 py-1 rounded uppercase">
                            {currentStep.badge}
                        </span>
                    </div>

                    <div className="w-full h-[1px] bg-gray-100 mb-10" />

                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        {/* MCQ / Editing Types */}
                        {(currentStep.type === "editing" || currentStep.type === "reading_mcq" || currentStep.type === "listening_mcq") && (
                            <div className="space-y-6">
                                {currentStep.type === "reading_mcq" && (
                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-sm text-gray-700 leading-relaxed font-normal mb-8 max-h-[300px] overflow-y-auto">
                                        {currentStep.passage}
                                    </div>
                                )}
                                {currentStep.type === "listening_mcq" && (
                                    <div className="bg-blue-50/20 p-6 rounded-xl border border-blue-100 mb-8">
                                        <audio controls className="w-full h-10">
                                            <source src={currentStep.audioUrl?.startsWith('http') ? currentStep.audioUrl : `http://localhost:5000/uploads/${currentStep.audioUrl}`} />
                                        </audio>
                                    </div>
                                )}

                                <h2 className="text-lg font-semibold text-gray-800 leading-relaxed dark:text-gray-100">
                                    {currentStep.type === "editing" ? `Correct the following sentence: "${currentStep.questionText}"` : currentStep.questionText}
                                </h2>

                                {currentStep.type === "editing" ? (
                                    <input
                                        type="text"
                                        placeholder="Type correctly..."
                                        value={answers[currentStep.id] || ""}
                                        onChange={(e) => handleAnswerChange(currentStep.id, e.target.value)}
                                        className="w-full p-4 h-14 rounded-xl border border-gray-100 focus:border-[#010080] outline-none text-sm font-normal bg-gray-50 focus:bg-white transition-all mt-4"
                                    />
                                ) : (
                                    <div className="space-y-3 pt-2">
                                        {currentStep.options?.map((opt, i) => (
                                            <label key={i} className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${answers[currentStep.id] === opt ? 'border-[#010080] bg-blue-50/20' : 'border-gray-50 hover:border-gray-100 dark:border-gray-700'}`}>
                                                <input type="radio" checked={answers[currentStep.id] === opt} onChange={() => handleAnswerChange(currentStep.id, opt)} className="w-4 h-4 accent-[#010080]" />
                                                <span className={`text-sm font-medium ${answers[currentStep.id] === opt ? 'text-[#010080]' : 'text-gray-600 dark:text-gray-400'}`}>{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Essay Type */}
                        {currentStep.type === "essay" && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{currentStep.title}</h2>
                                <p className="text-sm text-gray-600 font-medium leading-relaxed dark:text-gray-400">{currentStep.description}</p>
                                <textarea
                                    value={answers[currentStep.id] || ""}
                                    onChange={(e) => handleAnswerChange(currentStep.id, e.target.value)}
                                    className="w-full p-6 border border-gray-100 rounded-xl min-h-[400px] focus:border-[#010080] outline-none bg-gray-50 focus:bg-white transition-all text-sm font-normal dark:bg-gray-900/40 dark:border-gray-700"
                                    placeholder="Type your response here..."
                                />
                            </div>
                        )}

                        {/* Oral Type - Same as Placement Passage Logic */}
                        {currentStep.type === "oral" && (
                            <div className="flex flex-col gap-8">
                                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-sm text-gray-700 leading-relaxed font-normal dark:bg-gray-900/40 dark:border-gray-700 dark:text-gray-300">
                                    {currentStep.passage}
                                </div>
                                <div className="p-1 border-t border-gray-50 pt-6">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Instructions</p>
                                    <p className="text-sm font-medium text-gray-600 italic dark:text-gray-400">{currentStep.instructions}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Nav - Placement Test Style */}
                <div className="flex justify-between items-center mt-12 mb-20 px-2">
                    <button
                        onClick={() => setCurrentStepIdx(prev => Math.max(0, prev - 1))}
                        disabled={isFirst}
                        className={`text-sm font-medium transition-all ${isFirst ? 'opacity-0 cursor-default' : 'text-gray-400 hover:text-gray-900'}`}
                    >
                        ← Previous
                    </button>
                    <button
                        onClick={handleNext}
                        className="bg-[#010080] hover:bg-[#000060] text-white px-10 py-3 rounded-xl text-sm font-semibold shadow-sm transition-all"
                    >
                        {isLast ? "Submit Exam" : "Continue"}
                    </button>
                </div>
            </div>

            {/* Modal - Placement Test Style */}
            {showSubmitModal && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
                    <div className={`p-6 bg-white rounded-2xl shadow-2xl max-w-md w-full text-center dark:bg-gray-800`}>
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-blue-900/20">
                            <svg className="w-8 h-8 text-[#010080]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Submit Exam?</h3>
                        <p className="text-gray-600 text-sm mb-6 dark:text-gray-400">Are you sure you want to finish your assessment? This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowSubmitModal(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors">Cancel</button>
                            <button onClick={() => handleFinalSubmit(false)} disabled={isSubmitting} className="flex-1 py-2.5 bg-[#010080] hover:bg-[#000060] text-white rounded-xl font-semibold transition-colors">{isSubmitting ? "Submitting..." : "Yes, Submit"}</button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
