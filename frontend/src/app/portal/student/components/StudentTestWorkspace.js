"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useDarkMode } from "@/context/ThemeContext";

export default function StudentTestWorkspace({ assignment, onBack, onSubmit, submitting }) {
    const { isDark } = useDarkMode();

    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [isTimeUp, setIsTimeUp] = useState(false);

    const questions = useMemo(() => {
        if (!assignment) return [];
        return typeof assignment.questions === "string"
            ? JSON.parse(assignment.questions)
            : assignment.questions || [];
    }, [assignment]);

    // Initial answers population if resuming
    useEffect(() => {
        if (assignment.student_content) {
            const initial = typeof assignment.student_content === 'string'
                ? JSON.parse(assignment.student_content)
                : assignment.student_content;
            setAnswers(initial || {});
        }
    }, [assignment]);

    // Timer Setup
    useEffect(() => {
        if (assignment.duration && timeRemaining === null) {
            setTimeRemaining(assignment.duration * 60);
        }
    }, [assignment, timeRemaining]);

    useEffect(() => {
        if (timeRemaining === null) return;

        if (timeRemaining <= 0) {
            if (!isTimeUp) {
                setIsTimeUp(true);
                // Auto submit logic handled by parent via handleAutoSubmit call if needed, 
                // but here we just call onSubmit immediately
                onSubmit(answers, true); // true for auto-submit
            }
            return;
        }

        const timer = setInterval(() => {
            setTimeRemaining((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining, isTimeUp, answers, onSubmit]);

    const handleAnswerChange = (idx, value) => {
        setAnswers((prev) => ({
            ...prev,
            [idx]: value,
        }));
    };

    const formatTime = (seconds) => {
        if (seconds === null) return "--:--";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const currentQuestion = questions[currentQuestionIdx];
    const isLastQuestion = currentQuestionIdx === questions.length - 1;
    const hasAnsweredCurrent = answers[currentQuestionIdx] !== undefined;

    const bg = isDark ? "bg-gray-50" : "bg-gray-50";

    const containerBg = isDark ? "bg-gray-900" : "bg-gray-50";
    const cardBg = isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
    const textColor = isDark ? "text-white" : "text-[#202124]";
    const secondaryText = isDark ? "text-gray-400" : "text-gray-600";

    const isSubmitted = assignment.submission_status === 'submitted' || assignment.submission_status === 'graded';

    const handleSubmitClick = () => {
        if (window.confirm("Are you sure you want to submit your test?")) {
            onSubmit(answers, false);
        }
    };

    if (isSubmitted) {
        return (
            <div className={`min-h-screen w-full py-8 px-4 font-sans ${containerBg} ${textColor} transition-colors`}>
                <div className="max-w-[770px] mx-auto space-y-4">
                    <button
                        onClick={onBack}
                        className={`flex items-center gap-2 mb-4 text-sm font-medium ${secondaryText} hover:text-[#673ab7] transition-colors`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to List
                    </button>

                    <div className={`rounded-xl shadow-md overflow-hidden border ${cardBg} p-12 text-center`}>
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Test Completed</h2>
                        <p className={`${secondaryText} mb-8`}>You have already submitted this test.</p>

                        {assignment.score !== null && assignment.score !== undefined && (
                            <div className="inline-block px-6 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                                <span className="block text-xs font-bold uppercase tracking-widest text-blue-500 mb-1">Your Score</span>
                                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{assignment.score} / {assignment.total_points}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen w-full py-8 px-4 font-sans ${containerBg} ${textColor} transition-colors`}>
            <div className="max-w-[770px] mx-auto space-y-4">

                {/* Header / Back */}
                <button
                    onClick={onBack}
                    className={`flex items-center gap-2 mb-4 text-sm font-medium ${secondaryText} hover:text-[#673ab7] transition-colors`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to List
                </button>

                {/* Header Card */}
                <div className={`rounded-xl shadow-md overflow-hidden border ${cardBg}`}>
                    <div className="h-2.5 bg-[#673ab7] w-full" />
                    <div className="p-8">
                        <div className="flex justify-between items-start mb-2">
                            <h1 className="text-3xl font-medium">{assignment.title}</h1>
                            {/* Timer */}
                            {timeRemaining !== null && (
                                <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${timeRemaining < 300
                                    ? "text-red-600 border-red-200 animate-pulse bg-red-50"
                                    : `text-[#673ab7] border-purple-100 ${isDark ? 'bg-purple-900/20' : 'bg-purple-50'}`
                                    }`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-bold font-mono">{formatTime(timeRemaining)}</span>
                                </div>
                            )}
                        </div>

                        <p className={`text-sm mb-6 ${secondaryText}`}>
                            {assignment.description || "Answer all questions to the best of your ability."}
                        </p>

                        <div className={`flex items-center justify-between border-t pt-4 text-xs font-medium uppercase tracking-wider ${secondaryText}`}>
                            <div className="flex items-center gap-2">
                                <span className="text-red-500">* Indicates required question</span>
                            </div>
                            <div>
                                {assignment.total_points && (
                                    <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">{assignment.total_points} Total Points</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Card */}
                <div className={`rounded-lg p-4 shadow-sm border flex items-center justify-between ${cardBg}`}>
                    <span className={`text-sm font-medium ${secondaryText}`}>
                        Question {currentQuestionIdx + 1} of {questions.length}
                    </span>
                    <div className="w-48 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#673ab7] transition-all duration-300"
                            style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Question Card */}
                {currentQuestion && (
                    <div className={`rounded-xl shadow-sm p-8 border relative group transition-all hover:shadow-md ${cardBg}`}>
                        <div className="mb-6 flex justify-between items-start">
                            <div className="flex items-start gap-1 w-full">
                                <span className="text-base font-medium min-w-[24px]">{currentQuestionIdx + 1}.</span>
                                <h2 className="text-base leading-relaxed whitespace-pre-wrap flex-1">
                                    {currentQuestion.questionText || currentQuestion.question}
                                    <span className="text-red-500 ml-1">*</span>
                                </h2>
                            </div>
                            {(currentQuestion.points) && (
                                <span className={`text-xs font-medium whitespace-nowrap ml-4 ${secondaryText}`}>
                                    {currentQuestion.points} points
                                </span>
                            )}
                        </div>

                        <div className="space-y-4 ml-6">
                            {currentQuestion.options?.map((option, idx) => (
                                <label key={idx} className="flex items-center gap-3 group cursor-pointer">
                                    <div className="relative flex items-center justify-center">
                                        <input
                                            type="radio"
                                            name={`q-${currentQuestionIdx}`}
                                            value={option}
                                            checked={answers[currentQuestionIdx] === option}
                                            onChange={() => handleAnswerChange(currentQuestionIdx, option)}
                                            className="appearance-none w-5 h-5 border-2 border-gray-300 rounded-full checked:border-[#673ab7] transition-all cursor-pointer"
                                        />
                                        {answers[currentQuestionIdx] === option && (
                                            <div className="absolute w-2.5 h-2.5 bg-[#673ab7] rounded-full" />
                                        )}
                                    </div>
                                    <span className={`text-sm font-normal group-hover:text-[#673ab7] transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {option}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Navigation Section */}
                <div className="flex items-center justify-between pt-4">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setCurrentQuestionIdx((prev) => Math.max(0, prev - 1))}
                            disabled={currentQuestionIdx === 0}
                            className={`px-6 py-2 rounded font-medium text-sm transition-all ${currentQuestionIdx === 0
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-[#673ab7] hover:bg-[#673ab7]/10"
                                }`}
                        >
                            Back
                        </button>

                        {!isLastQuestion ? (
                            <button
                                onClick={() => setCurrentQuestionIdx((prev) => prev + 1)}
                                disabled={!hasAnsweredCurrent}
                                className={`px-6 py-2 rounded font-medium text-sm transition-all shadow ${!hasAnsweredCurrent
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none dark:bg-gray-800"
                                    : "bg-[#673ab7] text-white hover:bg-[#5e35b1]"
                                    }`}
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmitClick}
                                disabled={!hasAnsweredCurrent || submitting}
                                className={`px-8 py-2 rounded font-medium text-sm transition-all shadow ${!hasAnsweredCurrent || submitting
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none dark:bg-gray-800"
                                    : "bg-[#673ab7] text-white hover:bg-[#5e35b1]"
                                    }`}
                            >
                                {submitting ? "Submitting..." : "Submit"}
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => setAnswers({ ...answers, [currentQuestionIdx]: undefined })}
                        className={`text-xs hover:text-red-500 transition-colors ${secondaryText}`}
                    >
                        Clear selection
                    </button>
                </div>

                {/* Mandatory Warning */}
                {!hasAnsweredCurrent && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-lg animate-fade-in flex items-center gap-3">
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span className="text-xs text-red-500 font-medium">This is a required question</span>
                    </div>
                )}

                <footer className={`pt-10 pb-20 text-center text-xs ${secondaryText}`}>
                    BEA E-Learning System • Secure Assessment Environment
                </footer>
            </div>
        </div>
    );
}
