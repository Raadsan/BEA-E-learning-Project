"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDarkMode } from "@/context/ThemeContext";
import Loader from "@/components/Loader";
import { resolveMediaUrl } from "@/constants";
import {
    useGetProficiencyTestByIdQuery,
    useSubmitProficiencyTestMutation,
    useGetStudentProficiencyResultsQuery
} from "@/lib/api/proficiencyTestApi";
import { useGetIeltsToeflStudentQuery } from "@/lib/api/ieltsToeflApi";
import { useSendTestReminderEmailMutation } from "@/lib/api/notificationApi";
import { ensureQuestionNumbers } from "@/utils/testQuestions";
import SectionInformation, { buildSectionInformation } from "@/components/assessments/SectionInformation";
import RichTextContent from "@/components/assessments/RichTextContent";

const PROFICIENCY_MAX_PART = 4;

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
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const [reminderSent, setReminderSent] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [sendReminderEmail] = useSendTestReminderEmailMutation();

    const questions = useMemo(() => {
        if (!test) return [];
        let fetchedQuestions = typeof test.questions === "string" ? JSON.parse(test.questions) : test.questions;
        if (!Array.isArray(fetchedQuestions)) return [];
        return ensureQuestionNumbers(fetchedQuestions, PROFICIENCY_MAX_PART);
    }, [test]);

    const { data: studentInfo } = useGetIeltsToeflStudentQuery(user.id || user.student_id, {
        skip: !user.id && !user.student_id,
    });

    useEffect(() => {
        const student = studentInfo?.student;
        if (results && testId && student) {
            const alreadyTaken = results.find((r: any) => r.test_id === parseInt(testId));
            if (alreadyTaken) router.replace(`/portal/student/proficiency-test/results?id=${alreadyTaken.id}`);

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

        if (timeRemaining === 359 && !reminderSent && user.email) {
            sendReminderEmail({
                email: user.email,
                testTitle: test?.title,
                studentName: user.full_name || user.first_name,
                remainingTime: "5:59"
            }).unwrap().then(() => setReminderSent(true)).catch(err => console.error("Failed to send reminder:", err));
        }

        const timer = setInterval(() => setTimeRemaining(p => (p !== null ? p - 1 : null)), 1000);
        return () => clearInterval(timer);
    }, [timeRemaining, reminderSent, user, test, sendReminderEmail]);

    const handleAnswerChange = (qId: string, value: any) => {
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

    const currentQ = questions[currentQuestionIdx] || {};
    const currentPart = currentQ.part || 1;
    const currentPartQuestions = questions.filter(q => q.part === currentPart);
    const displayQuestionNumber = currentQ.questionNumber || currentQuestionIdx + 1;
    const isLast = currentQuestionIdx === questions.length - 1;

    const formatTime = (seconds: number | null) => {
        if (seconds === null) return "--:--";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const countWords = (str: string = "") => {
        return str.trim().split(/\s+/).filter(Boolean).length;
    };

    const handleNext = () => {
        if (currentQ.type === 'passage' && Array.isArray(currentQ.subQuestions) && currentSubQuestionIdx < currentQ.subQuestions.length - 1) {
            setCurrentSubQuestionIdx(prev => prev + 1);
            return;
        }

        const nextIdx = currentQuestionIdx + 1;
        if (nextIdx >= questions.length) return;

        setCurrentQuestionIdx(nextIdx);
        setCurrentSubQuestionIdx(0);
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
            setCurrentSubQuestionIdx(prevQ.type === 'passage' && Array.isArray(prevQ.subQuestions) ? prevQ.subQuestions.length - 1 : 0);
        }
    };

    const textColor = isDark ? "text-white" : "text-gray-900";
    const secondaryText = isDark ? "text-gray-400" : "text-gray-500";
    const cardBg = isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow-sm";

    return (
        <div className={`min-h-screen transition-colors duration-300 py-8 px-4 sm:px-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-[960px] mx-auto">
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
                    <div className={`px-4 py-2 rounded-xl font-mono text-lg font-bold border transition-colors ${timeRemaining && timeRemaining < 300 ? "text-red-500 border-red-500 bg-red-50 animate-pulse" : "text-[#010080] border-blue-200 bg-blue-50"}`}>
                        {formatTime(timeRemaining)}
                    </div>
                </div>

                <div className="sticky top-2 z-20 mb-4">
                    <SectionInformation
                        meta={buildSectionInformation(
                            currentPartQuestions,
                            `Part ${currentPart}`
                        )}
                    />
                </div>

                {/* Main Assessment Question Card */}
                <div className={`p-8 sm:p-10 rounded-3xl border min-h-[520px] flex flex-col ${cardBg}`}>
                    <div className="flex justify-between items-center mb-8 pb-4 border-b dark:border-gray-700">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#010080] opacity-70">
                                Section {currentPart === 1 ? 'A (Listening)' : currentPart === 2 ? 'B (Reading)' : currentPart === 3 ? 'C (Writing)' : 'D (Speaking)'}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                Item {displayQuestionNumber} of {currentPartQuestions.length}
                            </span>
                        </div>
                        <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase bg-blue-50 text-[#010080] border border-blue-100 self-start">
                            {currentQ.type ? currentQ.type.replace("-", " ").toUpperCase() : "QUESTION"}
                        </span>
                    </div>

                    <div className="flex-1">
                        {/* 1. MCQ TYPE */}
                        {(currentQ.type === "mcq" || currentQ.type === "multiple_choice") && (
                            <div className="space-y-6">
                                <h2 className={`text-xl font-semibold leading-relaxed mb-6 ${textColor}`}>
                                    {displayQuestionNumber}. {currentQ.questionText || currentQ.question}
                                </h2>
                                <div className="space-y-3">
                                    {(currentQ.options || []).map((opt: string, i: number) => {
                                        const letters = ["A", "B", "C", "D", "E"];
                                        const isSelected = answers[currentQ.id] === opt;
                                        return (
                                            <label key={i} className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${isSelected ? 'border-[#010080] bg-blue-50/50 dark:bg-blue-900/20' : 'border-gray-100 dark:border-gray-700 hover:border-blue-200'}`}>
                                                <input type="radio" checked={isSelected} onChange={() => handleAnswerChange(currentQ.id, opt)} className="w-4 h-4 accent-[#010080]" />
                                                <span className="text-xs font-bold text-gray-400">{letters[i]}.</span>
                                                <span className={`text-sm font-medium ${isSelected ? 'text-[#010080] font-bold dark:text-blue-400' : secondaryText}`}>{opt}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 2. PASSAGE WITH MULTI-TYPE SUB-QUESTIONS */}
                        {currentQ.type === "passage" && (
                            <div className="flex flex-col gap-6">
                                {/* Passage Header & Timing/Guidance */}
                                {currentQ.title && (
                                    <div className="pb-2 border-b border-gray-100 dark:border-gray-700">
                                        <h2 className="text-lg font-black text-[#010080] tracking-tight">{currentQ.title}</h2>
                                        {currentQ.instructions && (
                                            <p className="text-xs italic text-gray-500 mt-0.5">{currentQ.instructions}</p>
                                        )}
                                    </div>
                                )}

                                {/* Scrollable Passage Reader Box */}
                                <div className={`p-6 sm:p-8 rounded-2xl border leading-relaxed text-sm max-h-[320px] overflow-y-auto ${isDark ? 'bg-gray-700/30 border-gray-600 text-gray-200' : 'bg-blue-50/30 border-blue-100 text-gray-800'}`}>
                                    <RichTextContent html={currentQ.passageText} />
                                </div>

                                {/* Active Sub Question */}
                                {(() => {
                                    const subs = currentQ.subQuestions || [];
                                    const sq = subs[currentSubQuestionIdx];
                                    if (!sq) return null;
                                    const sqType = sq.type || "mcq";
                                    const sqKey = sq.id || `${currentQ.id}_sub_${currentSubQuestionIdx}`;

                                    return (
                                        <div className="space-y-5 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xs animate-in fade-in slide-in-from-right-3 duration-200">
                                            {/* Group Instruction Header if present */}
                                            {sq.groupInstruction && (
                                                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-400 rounded-r-lg text-xs font-semibold text-amber-900 dark:text-amber-200">
                                                    {sq.groupInstruction}
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between">
                                                <h3 className={`text-base font-bold ${textColor}`}>
                                                    Question {currentSubQuestionIdx + 1}: {sq.questionText}
                                                </h3>
                                                <span className="text-[10px] uppercase font-bold text-gray-400">
                                                    {currentSubQuestionIdx + 1} of {subs.length}
                                                </span>
                                            </div>

                                            {/* Sub MCQ */}
                                            {sqType === "mcq" && (
                                                <div className="space-y-2.5">
                                                    {(sq.options || []).map((opt: string, oi: number) => {
                                                        const letters = ["A", "B", "C", "D", "E"];
                                                        const isSelected = answers[sqKey] === opt;
                                                        return (
                                                            <label key={oi} className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-[#010080] bg-blue-50/50' : 'border-gray-100 dark:border-gray-700 hover:border-blue-100'}`}>
                                                                <input type="radio" checked={isSelected} onChange={() => handleAnswerChange(sqKey, opt)} className="w-4 h-4 accent-[#010080]" />
                                                                <span className="text-xs font-bold text-gray-400">{letters[oi]}.</span>
                                                                <span className={`text-xs font-medium ${isSelected ? 'text-[#010080] font-bold' : secondaryText}`}>{opt}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* Sub TFNG */}
                                            {sqType === "tfng" && (
                                                <div className="flex flex-wrap gap-3 pt-2">
                                                    {(["TRUE", "FALSE", "NOT GIVEN"] as const).map((choice) => (
                                                        <button
                                                            key={choice}
                                                            type="button"
                                                            onClick={() => handleAnswerChange(sqKey, choice)}
                                                            className={`px-6 py-3 rounded-xl text-xs font-black border transition-all ${answers[sqKey] === choice ? 'bg-[#010080] text-white border-[#010080] shadow-sm' : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 hover:border-[#010080]'}`}
                                                        >
                                                            {choice}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Sub Fill in Blanks */}
                                            {sqType === "fill_blank" && (
                                                <div className="space-y-2">
                                                    <label className="block text-xs font-bold text-gray-600">Your Answer:</label>
                                                    <input
                                                        type="text"
                                                        value={answers[sqKey] || ""}
                                                        onChange={e => handleAnswerChange(sqKey, e.target.value)}
                                                        placeholder="Type missing word/phrase..."
                                                        className="w-full sm:w-80 text-sm font-semibold px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-gray-100 focus:border-[#010080] outline-none"
                                                    />
                                                </div>
                                            )}

                                            {/* Sub Summary Word Box */}
                                            {sqType === "word_box_fill" && (
                                                <div className="space-y-4">
                                                    {sq.wordBank && (
                                                        <div className="p-3 bg-blue-50/60 dark:bg-gray-700/50 rounded-xl border border-dashed border-blue-200 dark:border-gray-600">
                                                            <span className="text-[10px] uppercase font-bold text-[#010080] block mb-1">Word Bank:</span>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {sq.wordBank.split(/\s+/).filter(Boolean).map((word: string, wi: number) => (
                                                                    <span key={wi} className="px-2.5 py-1 rounded bg-white dark:bg-gray-800 text-xs font-mono font-bold text-gray-800 dark:text-gray-200 border border-gray-200 shadow-2xs">
                                                                        {word}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {sq.summaryText && (
                                                        <p className="text-xs leading-relaxed text-gray-700 dark:text-gray-300 italic">
                                                            {sq.summaryText}
                                                        </p>
                                                    )}
                                                    <div className="space-y-2 pt-2">
                                                        {(sq.wordBoxAnswers || [{ number: 1 }]).map((item: any, ai: number) => {
                                                            const itemKey = `${sqKey}_gap_${item.number || ai + 1}`;
                                                            return (
                                                                <div key={ai} className="flex items-center gap-3">
                                                                    <span className="text-xs font-bold text-gray-500 w-10">({item.number || ai + 1}):</span>
                                                                    <input
                                                                        type="text"
                                                                        value={answers[itemKey] || ""}
                                                                        onChange={e => handleAnswerChange(itemKey, e.target.value)}
                                                                        placeholder="Word from box..."
                                                                        className="w-full sm:w-60 text-xs font-semibold px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-gray-100 focus:border-[#010080] outline-none"
                                                                    />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Sub Heading Match */}
                                            {sqType === "heading_match" && (
                                                <div className="space-y-3">
                                                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                                                        <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">List of Headings:</span>
                                                        <ul className="text-xs space-y-1 text-gray-700 dark:text-gray-300 font-medium">
                                                            {(sq.headingsList || []).map((h: string, hi: number) => (
                                                                <li key={hi}><strong className="text-[#010080]">i{hi + 1}.</strong> {h}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-bold text-gray-700">{sq.paragraphLabel || `Paragraph`}:</span>
                                                        <select
                                                            value={answers[sqKey] ?? ""}
                                                            onChange={e => handleAnswerChange(sqKey, e.target.value)}
                                                            className="text-xs font-bold px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-gray-800 dark:text-gray-100 focus:border-[#010080] outline-none"
                                                        >
                                                            <option value="">-- Choose Heading --</option>
                                                            {(sq.headingsList || []).map((_: any, hi: number) => (
                                                                <option key={hi} value={hi}>i{hi + 1}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        {/* 3. FORM FILL (Listening Part 1) */}
                        {currentQ.type === "form-fill" && (
                            <div className="space-y-6">
                                {currentQ.title && (
                                    <div className="p-4 bg-blue-50/50 dark:bg-gray-800 rounded-2xl border border-blue-100 dark:border-gray-700">
                                        <h2 className="text-base font-black text-[#010080] uppercase tracking-wide">{currentQ.title}</h2>
                                        {currentQ.instructions && <p className="text-xs text-gray-500 mt-1">{currentQ.instructions}</p>}
                                    </div>
                                )}
                                <div className="space-y-3 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                                    {(currentQ.fields || []).map((field: any, fi: number) => {
                                        const fKey = `${currentQ.id}_field_${fi}`;
                                        return (
                                            <div key={fi} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                                                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                                                    ({fi + 1}) {field.label}:
                                                </span>
                                                <input
                                                    type="text"
                                                    value={answers[fKey] || ""}
                                                    onChange={e => handleAnswerChange(fKey, e.target.value)}
                                                    placeholder="Type answer..."
                                                    className="w-full sm:w-64 text-xs font-semibold px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-[#010080]"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 4. SENTENCE COMPLETION */}
                        {currentQ.type === "sentence-completion" && (
                            <div className="space-y-6">
                                {currentQ.instructions && (
                                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-400 rounded-r-lg text-xs font-semibold text-amber-900 dark:text-amber-200">
                                        {currentQ.instructions}
                                    </div>
                                )}
                                <div className="space-y-4">
                                    {(currentQ.sentences || []).map((s: any, si: number) => {
                                        const sKey = `${currentQ.id}_sent_${si}`;
                                        return (
                                            <div key={si} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 space-y-2">
                                                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                                                    <span className="w-5 h-5 rounded-full bg-[#010080] text-white text-[10px] font-bold inline-flex items-center justify-center mr-2">{si + 1}</span>
                                                    {s.stem}
                                                </p>
                                                <input
                                                    type="text"
                                                    value={answers[sKey] || ""}
                                                    onChange={e => handleAnswerChange(sKey, e.target.value)}
                                                    placeholder="Your answer..."
                                                    className="w-full sm:w-72 text-xs font-bold px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-gray-100 outline-none focus:border-[#010080]"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 5. TABLE + ESSAY (Writing Task 1) */}
                        {currentQ.type === "table-essay" && (
                            <div className="space-y-6">
                                {currentQ.title && <h2 className={`text-lg font-bold ${textColor}`}>{currentQ.title}</h2>}
                                {currentQ.instructions && (
                                    <p className="text-xs italic text-gray-500">{currentQ.instructions}</p>
                                )}
                                {currentQ.tableHeaders && currentQ.tableRows && (
                                    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-[#010080] text-white font-bold">
                                                <tr>
                                                    {currentQ.tableHeaders.map((th: string, ti: number) => (
                                                        <th key={ti} className="px-4 py-2.5 border-r border-blue-900/40 last:border-0">{th}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                                {currentQ.tableRows.map((row: string[], ri: number) => (
                                                    <tr key={ri}>
                                                        {row.map((cell: string, ci: number) => (
                                                            <td key={ci} className="px-4 py-2 text-gray-800 dark:text-gray-200 border-r border-gray-100 dark:border-gray-700 last:border-0">{cell}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                        <span>Write at least {currentQ.minWords || 150} words:</span>
                                        <span className={`font-bold ${countWords(answers[currentQ.id]) < (currentQ.minWords || 150) ? 'text-amber-600' : 'text-green-600'}`}>
                                            Word Count: {countWords(answers[currentQ.id])}
                                        </span>
                                    </div>
                                    <textarea
                                        value={answers[currentQ.id] || ""}
                                        onChange={e => handleAnswerChange(currentQ.id, e.target.value)}
                                        className={`w-full p-5 rounded-2xl border-2 min-h-[300px] text-sm outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-600'}`}
                                        placeholder="Summarise the information by selecting and reporting the main features, and make comparisons where relevant..."
                                    />
                                </div>
                            </div>
                        )}

                        {/* 6. ESSAY / AUDIO (Writing Task 2 & Speaking) */}
                        {(currentQ.type === "essay" || currentQ.type === "audio") && (
                            <div className="space-y-6">
                                <h2 className={`text-xl font-bold ${textColor}`}>{displayQuestionNumber}: {currentQ.title || "Subjective / Writing Task"}</h2>
                                {currentQ.type === "audio" && currentQ.audioUrl && (
                                    <div className={`p-4 rounded-2xl flex items-center gap-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                        <audio controls className="w-full h-10">
                                            <source src={resolveMediaUrl(currentQ.audioUrl) || ""} />
                                        </audio>
                                    </div>
                                )}
                                <RichTextContent html={currentQ.description} className={`text-sm font-medium leading-relaxed ${secondaryText}`} />
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                        <span>Type your complete answer:</span>
                                        <span className="font-bold text-gray-700 dark:text-gray-300">
                                            Word Count: {countWords(answers[currentQ.id])}
                                        </span>
                                    </div>
                                    <textarea
                                        value={answers[currentQ.id] || ""}
                                        onChange={e => handleAnswerChange(currentQ.id, e.target.value)}
                                        className={`w-full p-6 rounded-2xl border-2 min-h-[320px] text-sm outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-600'}`}
                                        placeholder="Type your response here..."
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center mt-12 pt-8 border-t dark:border-gray-700">
                        <button
                            onClick={handlePrevious}
                            disabled={currentQuestionIdx === 0 && currentSubQuestionIdx === 0}
                            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${currentQuestionIdx === 0 && currentSubQuestionIdx === 0 ? 'opacity-0 cursor-default' : `hover:bg-gray-100 dark:hover:bg-gray-700 ${secondaryText}`}`}
                        >
                            ← Previous
                        </button>

                        <div className="flex gap-4">
                            {!isLast || (currentQ.type === 'passage' && Array.isArray(currentQ.subQuestions) && currentSubQuestionIdx < currentQ.subQuestions.length - 1) ? (
                                <button
                                    onClick={handleNext}
                                    className="bg-[#010080] text-white px-8 py-3 rounded-xl text-xs font-bold shadow-md hover:bg-[#000066] active:scale-95 transition-all"
                                >
                                    Continue →
                                </button>
                            ) : (
                                <button
                                    onClick={() => performSubmit()}
                                    disabled={isSubmitting}
                                    className="bg-green-600 text-white px-10 py-3 rounded-xl text-xs font-bold shadow-md hover:bg-green-700 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                                >
                                    {isSubmitting ? "Finalizing..." : "Submit Test"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showSubmitModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className={`rounded-3xl shadow-2xl max-w-md w-full p-8 text-center animate-in zoom-in-95 duration-200 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-[#010080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className={`text-xl font-bold mb-2 ${textColor}`}>Submit Proficiency Test?</h3>
                        <p className={`${secondaryText} text-xs mb-6`}>Are you sure you want to finalize and submit your assessment booklet? This cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowSubmitModal(false)} className={`flex-1 py-3 rounded-xl text-xs font-bold ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'}`}>Cancel</button>
                            <button onClick={handleConfirmSubmit} disabled={isSubmitting} className="flex-1 py-3 bg-[#010080] hover:bg-[#000066] text-white rounded-xl text-xs font-bold shadow-md">{isSubmitting ? "Submitting..." : "Yes, Submit"}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
