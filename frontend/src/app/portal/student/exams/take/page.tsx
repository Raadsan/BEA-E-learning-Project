"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDarkMode } from "@/context/ThemeContext";
import Loader from "@/components/Loader";
import { useGetAssignmentsQuery, useSubmitAssignmentMutation } from "@/lib/api/assignmentApi";
import { useGetCurrentUserQuery } from "@/lib/api/authApi";
import { useToast } from "@/components/Toast";
import { API_URL, resolveMediaUrl } from "@/constants";
import { getAssignmentTimerTargetMs } from "@/utils/assignmentSchedule";
import AudioRecorderPanel from "@/components/student/AudioRecorderPanel";
import RichTextContent from "@/components/assessments/RichTextContent";

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

    const getShuffledOptions = (q, optionsSeed) => {
        if (q?.type === "true_false") return ["True", "False"];
        if (q?.type === "short_answer") return [];
        const opts = (q?.options || []).filter((o) => String(o || "").trim());
        if (!opts.length) return [];
        return deterministicShuffle([...opts], optionsSeed);
    };

    const shufflePart = (items, partSeed) => deterministicShuffle([...items], partSeed);

    // Flattening Logic — random order within each part; display numbers 1→N follow shuffled order
    const flattenedSteps = useMemo(() => {
        const studentId = user?.id || user?.student_id;
        if (!assignment?.questions || !studentId) return [];
        try {
            const raw = typeof assignment.questions === 'string' ? JSON.parse(assignment.questions) : assignment.questions;
            const seed = strHash(studentId);
            const steps = [];

            // Case A: Standard object format { paper1, paper2, paper3, paper4 }
            if (raw && !Array.isArray(raw)) {
                // Paper 1: Grammar + Essay (shuffled together within part)
                if (raw.paper1) {
                    const paper1Items = [
                        ...(raw.paper1.editing || []).map((item) => ({ kind: "editing", data: item })),
                        ...(raw.paper1.essay?.prompt ? [{ kind: "essay", data: raw.paper1.essay }] : []),
                    ];
                    const p1Meta = raw.paper1.sectionMeta || { sectionName: "Paper 1: Writing & Grammar" };
                    const p1Inst = raw.paper1.instructions || p1Meta.instructions || assignment.instructions || "";
                    shufflePart(paper1Items, seed + 1).forEach((item, idx) => {
                        const optionsSeed = seed + 100 + idx;
                        if (item.kind === "editing") {
                            const editing = item.data;
                            const options = editing.options?.length
                                ? getShuffledOptions({ type: "mcq", options: editing.options }, optionsSeed)
                                : editing.correction
                                    ? [editing.correction]
                                    : [];
                            steps.push({
                                id: `p1_editing_${editing.id || idx}`,
                                part: 1,
                                type: "editing",
                                questionText: editing.text || editing.questionText,
                                options,
                                badge: "Grammar",
                                sectionMeta: p1Meta,
                                instructions: p1Inst
                            });
                        } else {
                            const essay = item.data;
                            steps.push({
                                id: `p1_essay`,
                                part: 1,
                                type: "essay",
                                questionText: essay.prompt || essay.title,
                                title: essay.title || "Writing Task",
                                description: essay.prompt || essay.description,
                                wordCount: essay.wordCount || 300,
                                badge: "Essay",
                                sectionMeta: p1Meta,
                                instructions: p1Inst
                            });
                        }
                    });
                }

                // Paper 2: Reading
                if (raw.paper2?.questions?.length) {
                    const p2Meta = raw.paper2.sectionMeta || { sectionName: "Paper 2: Reading Comprehension" };
                    const p2Inst = raw.paper2.instructions || p2Meta.instructions || assignment.instructions || "";
                    shufflePart(raw.paper2.questions, seed + 2).forEach((q, idx) => {
                        const optionsSeed = seed + 200 + idx;
                        steps.push({
                            id: `p2_q_${q.id || idx}`,
                            part: 2,
                            type: q.type === "short_answer" ? "reading_short" : "reading_mcq",
                            passage: raw.paper2.passage,
                            questionText: q.questionText || q.question,
                            options: getShuffledOptions(q, optionsSeed),
                            questionType: q.type || "mcq",
                            badge: "Reading",
                            sectionMeta: p2Meta,
                            instructions: p2Inst
                        });
                    });
                }

                // Paper 3: Listening
                if (raw.paper3?.questions?.length) {
                    const p3Meta = raw.paper3.sectionMeta || { sectionName: "Paper 3: Listening Comprehension" };
                    const p3Inst = raw.paper3.instructions || p3Meta.instructions || assignment.instructions || "";
                    shufflePart(raw.paper3.questions, seed + 3).forEach((q, idx) => {
                        const optionsSeed = seed + 300 + idx;
                        steps.push({
                            id: `p3_q_${q.id || idx}`,
                            part: 3,
                            type: q.type === "short_answer" ? "listening_short" : "listening_mcq",
                            audioUrl: raw.paper3.audioUrl,
                            questionText: q.questionText || q.question,
                            options: getShuffledOptions(q, optionsSeed),
                            questionType: q.type || "mcq",
                            badge: "Listening",
                            sectionMeta: p3Meta,
                            instructions: p3Inst
                        });
                    });
                }

                // Paper 4: Oral
                if (raw.paper4?.passage?.trim() || raw.paper4?.instructions?.trim()) {
                    const p4Meta = raw.paper4.sectionMeta || { sectionName: "Paper 4: Oral Reading / Speaking" };
                    const p4Inst = raw.paper4.instructions || p4Meta.instructions || assignment.instructions || "";
                    steps.push({
                        id: `p4_oral`,
                        part: 4,
                        type: "oral",
                        passage: raw.paper4.passage,
                        instructions: p4Inst,
                        sectionMeta: p4Meta,
                        badge: "Oral"
                    });
                }
            } else if (Array.isArray(raw)) {
                // Case B: Array of Papers or Array of Questions
                raw.forEach((paperOrQ, pIdx) => {
                    const partNum = pIdx + 1;
                    const secMeta = paperOrQ.sectionMeta || { sectionName: paperOrQ.title || `Part ${partNum}` };
                    const secInst = paperOrQ.instructions || secMeta.instructions || assignment.instructions || "";

                    if (paperOrQ.questions && Array.isArray(paperOrQ.questions)) {
                        paperOrQ.questions.forEach((q, qIdx) => {
                            const optionsSeed = seed + (partNum * 100) + qIdx;
                            steps.push({
                                id: `p${partNum}_q_${q.id || qIdx}`,
                                part: partNum,
                                type: q.type === "short_answer" ? "reading_short" : (paperOrQ.audioUrl ? "listening_mcq" : "reading_mcq"),
                                passage: paperOrQ.passage,
                                audioUrl: paperOrQ.audioUrl,
                                questionText: q.questionText || q.question || q.text,
                                options: getShuffledOptions(q, optionsSeed),
                                questionType: q.type || "mcq",
                                badge: paperOrQ.audioUrl ? "Listening" : paperOrQ.passage ? "Reading" : "Question",
                                sectionMeta: secMeta,
                                instructions: secInst
                            });
                        });
                    } else if (paperOrQ.editing && Array.isArray(paperOrQ.editing)) {
                        paperOrQ.editing.forEach((ed, eIdx) => {
                            const optionsSeed = seed + (partNum * 100) + eIdx;
                            steps.push({
                                id: `p${partNum}_editing_${ed.id || eIdx}`,
                                part: partNum,
                                type: "editing",
                                questionText: ed.text || ed.questionText,
                                options: ed.options?.length ? getShuffledOptions({ type: "mcq", options: ed.options }, optionsSeed) : (ed.correction ? [ed.correction] : []),
                                badge: "Grammar",
                                sectionMeta: secMeta,
                                instructions: secInst
                            });
                        });
                    } else if (paperOrQ.essay) {
                        steps.push({
                            id: `p${partNum}_essay`,
                            part: partNum,
                            type: "essay",
                            questionText: paperOrQ.essay.prompt || paperOrQ.essay.title,
                            title: paperOrQ.essay.title || "Writing Task",
                            description: paperOrQ.essay.prompt || paperOrQ.essay.description,
                            wordCount: paperOrQ.essay.wordCount || 300,
                            badge: "Essay",
                            sectionMeta: secMeta,
                            instructions: secInst
                        });
                    } else if (paperOrQ.questionText || paperOrQ.question) {
                        const optionsSeed = seed + (partNum * 100);
                        steps.push({
                            id: `q_${paperOrQ.id || pIdx}`,
                            part: 1,
                            type: paperOrQ.type === "short_answer" ? "reading_short" : "reading_mcq",
                            questionText: paperOrQ.questionText || paperOrQ.question,
                            options: getShuffledOptions(paperOrQ, optionsSeed),
                            questionType: paperOrQ.type || "mcq",
                            badge: "Question",
                            sectionMeta: secMeta,
                            instructions: secInst
                        });
                    }
                });
            }

            return steps;
        } catch (e) { return []; }
    }, [assignment, user]);

    const [currentStepIdx, setCurrentStepIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);
    const [uploadedOralFile, setUploadedOralFile] = useState(null);
    const [oralFilePreviewUrl, setOralFilePreviewUrl] = useState(null);

    // Persistent Timer Key
    const timerKey = useMemo(() => {
        if (user?.id && testId) {
            return `exam_timer_${user.id}_${testId}`;
        }
        return null;
    }, [user?.id, testId]);

    const [isExamStarted, setIsExamStarted] = useState(false);

    // Initialize/read persistent timer when exam is opened
    useEffect(() => {
        const hasTimer = assignment?.duration || assignment?.end_date || assignment?.due_date;
        if (!hasTimer || !timerKey || timeRemaining !== null) return;

        const savedTarget = localStorage.getItem(timerKey);
        if (savedTarget) {
            setIsExamStarted(true);
            const targetTime = parseInt(savedTarget, 10);
            const remaining = Math.max(0, Math.floor((targetTime - Date.now()) / 1000));
            setTimeRemaining(remaining);
            if (remaining <= 0) {
                handleFinalSubmit(true);
            }
        }
    }, [assignment, timerKey, timeRemaining]);

    const startExamNow = () => {
        if (!timerKey || !assignment) return;
        const targetTime = getAssignmentTimerTargetMs(assignment, Date.now());
        if (targetTime) {
            localStorage.setItem(timerKey, targetTime.toString());
            const remaining = Math.max(0, Math.floor((targetTime - Date.now()) / 1000));
            setTimeRemaining(remaining);
        }
        setIsExamStarted(true);
    };

    // Timer countdown loop
    useEffect(() => {
        if (timeRemaining === null || !timerKey) return;

        if (timeRemaining <= 0) {
            handleFinalSubmit(true);
            return;
        }

        const timer = setInterval(() => {
            const savedTarget = localStorage.getItem(timerKey);
            if (savedTarget) {
                const targetTime = parseInt(savedTarget, 10);
                const remaining = Math.max(0, Math.floor((targetTime - Date.now()) / 1000));
                setTimeRemaining(remaining);
                if (remaining <= 0) {
                    clearInterval(timer);
                    handleFinalSubmit(true);
                }
            } else {
                setTimeRemaining(p => {
                    if (p <= 1) {
                        clearInterval(timer);
                        handleFinalSubmit(true);
                        return 0;
                    }
                    return p - 1;
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining, timerKey]);

    const countWords = (text) => {
        const trimmed = String(text || "").trim();
        return trimmed ? trimmed.split(/\s+/).length : 0;
    };

    const limitToWordCount = (text, maxWords) => {
        const trimmed = String(text || "").trim();
        if (!trimmed || !maxWords) return text;
        const words = trimmed.split(/\s+/);
        if (words.length <= maxWords) return text;
        return words.slice(0, maxWords).join(" ");
    };

    const handleAnswerChange = (key, value) => {
        setAnswers(prev => ({ ...prev, [key]: value }));
    };

    const handleEssayChange = (key, value, maxWords) => {
        handleAnswerChange(key, limitToWordCount(value, maxWords));
    };

    const handleOralFileReady = (file) => {
        if (oralFilePreviewUrl) URL.revokeObjectURL(oralFilePreviewUrl);
        if (!file) {
            setUploadedOralFile(null);
            setOralFilePreviewUrl(null);
            return;
        }
        if (file.size > 20 * 1024 * 1024) {
            showToast("Recording exceeds 20MB limit.", "error");
            return;
        }
        setUploadedOralFile(file);
        setOralFilePreviewUrl(URL.createObjectURL(file));
    };

    const hasOralStep = flattenedSteps.some((s) => s.type === "oral");

    // Audio via S3 stream proxy
    useEffect(() => {
        const currentStep = flattenedSteps[currentStepIdx];
        if (currentStep?.type?.startsWith("listening") && currentStep.audioUrl) {
            setAudioUrl(resolveMediaUrl(currentStep.audioUrl));
            setIsLoadingAudio(false);
            return;
        }
        setAudioUrl(null);
    }, [currentStepIdx, flattenedSteps]);

    const handleFinalSubmit = async (auto = false) => {
        try {
            // Process answers to ensure only values are sent, even if UI tracks with metadata
            const processedAnswers = {};
            Object.keys(answers).forEach(key => {
                const ans = answers[key];
                processedAnswers[key] = (ans && typeof ans === 'object' && ans.hasOwnProperty('value'))
                    ? ans.value
                    : ans;
            });

            let submitData;
            if (uploadedOralFile) {
                const formData = new FormData();
                formData.append('assignment_id', testId || "");
                formData.append('type', "exam");
                formData.append('content', JSON.stringify(processedAnswers));
                formData.append('file', uploadedOralFile);
                submitData = formData;
            } else {
                submitData = {
                    assignment_id: parseInt(testId || "0", 10),
                    content: processedAnswers,
                    type: "exam"
                };
            }

            await submitAssignment(submitData).unwrap();
            if (timerKey) {
                localStorage.removeItem(timerKey);
            }
            router.push(`/portal/student/exams/results?id=${testId}`);
            showToast(auto ? "Time's up! Exam auto-submitted." : "Exam submitted successfully!", "success");
        } catch (err) {
            showToast(err.data?.error || "Failed to submit exam", "error");
        }
    };

    if (testsLoading || !assignment || flattenedSteps.length === 0) return <Loader fullPage />;

    // Exam Instructions / Overview Start Screen
    if (!isExamStarted) {
        return (
            <main className={`min-h-screen py-10 px-4 sm:px-10 transition-colors flex items-center justify-center ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
                <div className={`p-8 sm:p-12 rounded-3xl border border-gray-200 shadow-xl max-w-3xl w-full ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                    </div>

                    <h1 className={`text-3xl font-bold text-center mb-2 ${isDark ? 'text-white' : 'text-[#010080]'}`}>
                        {assignment.title}
                    </h1>
                    <p className="text-center text-sm text-gray-500 mb-8">Official BEA Assessment • Exam Portal</p>

                    {assignment.instructions && (
                        <div className={`p-6 rounded-2xl mb-4 border ${isDark ? 'bg-gray-750 border-gray-700' : 'bg-blue-50/50 border-blue-100'}`}>
                            <h3 className="font-bold text-sm text-blue-900 dark:text-blue-300 uppercase tracking-wider mb-2">📋 Exam Instructions</h3>
                            <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{assignment.instructions}</div>
                        </div>
                    )}

                    {assignment.description && (
                        <div className={`p-6 rounded-2xl mb-8 border ${isDark ? 'bg-gray-750 border-gray-700' : 'bg-blue-50/50 border-blue-100'}`}>
                            <h3 className="font-bold text-sm text-blue-900 dark:text-blue-300 uppercase tracking-wider mb-2">Notes</h3>
                            <RichTextContent html={assignment.description} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed" />
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className={`p-4 rounded-xl text-center border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-100'}`}>
                            <span className="block text-xs text-gray-400 font-bold uppercase mb-1">Time Limit</span>
                            <span className="text-xl font-extrabold text-[#010080] dark:text-blue-400">{assignment.duration || 60} mins</span>
                        </div>
                        <div className={`p-4 rounded-xl text-center border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-100'}`}>
                            <span className="block text-xs text-gray-400 font-bold uppercase mb-1">Questions</span>
                            <span className="text-xl font-extrabold text-[#010080] dark:text-blue-400">{flattenedSteps.length}</span>
                        </div>
                        <div className={`p-4 rounded-xl text-center border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-100'}`}>
                            <span className="block text-xs text-gray-400 font-bold uppercase mb-1">Total Marks</span>
                            <span className="text-xl font-extrabold text-[#010080] dark:text-blue-400">{assignment.total_points || 100} pts</span>
                        </div>
                    </div>

                    <div className={`p-6 rounded-2xl mb-8 border ${isDark ? 'bg-amber-900/20 border-amber-800/40 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                        <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            Exam Rules
                        </h4>
                        <ul className="text-xs space-y-1.5 list-disc list-inside opacity-90">
                            <li>Once you click <strong>Start Exam</strong>, the countdown timer will begin immediately.</li>
                            <li>Do not refresh or close the browser tab during the exam.</li>
                            <li>Answer all questions carefully before the time runs out.</li>
                        </ul>
                    </div>

                    <button
                        onClick={startExamNow}
                        className="w-full py-4 bg-[#010080] hover:bg-blue-900 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-[0.99]"
                    >
                        Start Exam Now
                    </button>
                </div>
            </main>
        );
    }

    const currentStep = flattenedSteps[currentStepIdx];
    const isFirst = currentStepIdx === 0;
    const isLast = currentStepIdx === flattenedSteps.length - 1;

    const currentPart = currentStep.part;
    const partSteps = flattenedSteps.filter(s => s.part === currentPart);
    const displayQuestionNumber = partSteps.findIndex((s) => s.id === currentStep.id) + 1;

    const formatTime = (s) => {
        if (s === null) return "00:00";
        const m = Math.floor(s / 60);
        return `${m}:${(s % 60).toString().padStart(2, "0")}`;
    };

    const handleNext = () => {
        if (isLast) {
            if (hasOralStep && !uploadedOralFile) {
                showToast("Please record your oral answer before submitting.", "warning");
                return;
            }
            setShowSubmitModal(true);
            return;
        }

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

                {/* Section Information & Instructions Banner */}
                {(currentStep.sectionMeta || currentStep.instructions || assignment.instructions) && (
                    <div className={`p-5 rounded-2xl border mb-6 shadow-xs transition-colors ${isDark ? 'bg-blue-950/30 border-blue-900/50' : 'bg-blue-50/60 border-blue-100'}`}>
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2.5">
                                <span className="px-3 py-1 rounded-lg text-xs font-black bg-[#010080] text-white tracking-wide shadow-xs">
                                    PART {currentStep.part}
                                </span>
                                <h2 className="text-base font-bold text-[#010080] dark:text-blue-300">
                                    {currentStep.sectionMeta?.sectionName || `Part ${currentStep.part}: ${currentStep.badge || 'Assessment'}`}
                                </h2>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                {currentStep.sectionMeta?.format && (
                                    <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 font-medium">
                                        Format: <strong className="font-bold text-[#010080] dark:text-blue-400">{currentStep.sectionMeta.format}</strong>
                                    </span>
                                )}
                                {currentStep.sectionMeta?.marks && (
                                    <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 font-medium">
                                        Marks: <strong className="font-bold text-[#010080] dark:text-blue-400">{currentStep.sectionMeta.marks} pts</strong>
                                    </span>
                                )}
                                {currentStep.sectionMeta?.skillsAssessed && (
                                    <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 font-medium hidden sm:inline">
                                        Skills: <strong className="font-bold text-[#010080] dark:text-blue-400">{currentStep.sectionMeta.skillsAssessed}</strong>
                                    </span>
                                )}
                            </div>
                        </div>
                        {(currentStep.instructions || currentStep.sectionMeta?.instructions || assignment.instructions) && (
                            <div className="text-xs text-gray-700 dark:text-gray-300 mt-2 leading-relaxed border-t border-blue-100 dark:border-blue-900/40 pt-2 flex items-start gap-1.5">
                                <span className="font-bold text-[#010080] dark:text-blue-400 shrink-0">📋 Instructions:</span>
                                <p className="font-medium">{currentStep.instructions || currentStep.sectionMeta?.instructions || assignment.instructions}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Main Question Card Design - Placement Test Replica */}
                <div className={`p-10 rounded-xl border border-gray-200 min-h-[450px] shadow-sm relative ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                            Part {currentStep.part}: Question {displayQuestionNumber} of {partSteps.length}
                        </span>
                        <span className="text-[10px] font-bold text-[#010080] bg-blue-50 px-3 py-1 rounded uppercase">
                            {currentStep.badge}
                        </span>
                    </div>

                    <div className="w-full h-[1px] bg-gray-100 mb-10" />

                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        {/* MCQ / Editing Types */}
                        {(currentStep.type === "editing" || currentStep.type === "reading_mcq" || currentStep.type === "listening_mcq" || currentStep.type === "reading_short" || currentStep.type === "listening_short") && (
                            <div className="space-y-6">
                                {(currentStep.type === "reading_mcq" || currentStep.type === "reading_short") && (
                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-sm text-gray-700 leading-relaxed font-normal mb-8 max-h-[300px] overflow-y-auto whitespace-pre-wrap text-left">
                                        <RichTextContent html={currentStep.passage} />
                                    </div>
                                )}
                                {(currentStep.type === "listening_mcq" || currentStep.type === "listening_short") && (
                                    <div className="bg-blue-50/20 p-6 rounded-xl border border-blue-100 mb-8">
                                        {isLoadingAudio ? (
                                            <div className="flex items-center gap-3 text-[#010080] font-medium">
                                                <div className="w-5 h-5 border-2 border-[#010080] border-t-transparent rounded-full animate-spin" />
                                                <span>Loading audio...</span>
                                            </div>
                                        ) : audioUrl ? (
                                            <audio controls className="w-full h-10">
                                                <source src={audioUrl} />
                                            </audio>
                                        ) : (
                                            <div className="text-rose-500 text-sm font-medium">
                                                Failed to load audio. Please check your connection.
                                            </div>
                                        )}
                                    </div>
                                )}

                                <h2 className="text-lg font-semibold text-gray-800 leading-relaxed dark:text-gray-100">
                                    {displayQuestionNumber}: {currentStep.questionText}
                                </h2>

                                <div className="space-y-3 pt-2">
                                    {(currentStep.type === "reading_short" || currentStep.type === "listening_short") ? (
                                        <input
                                            type="text"
                                            placeholder="Type your answer..."
                                            value={answers[currentStep.id] || ""}
                                            onChange={(e) => handleAnswerChange(currentStep.id, e.target.value)}
                                            className="w-full p-4 h-14 rounded-xl border border-gray-100 focus:border-[#010080] outline-none text-sm font-normal bg-gray-50 focus:bg-white transition-all"
                                        />
                                    ) : currentStep.options?.map((opt, i) => {
                                        const optionLabels = ["A", "B", "C", "D"];
                                        const isChecked = answers[currentStep.id]?.index === i || answers[currentStep.id] === opt;
                                        return (
                                            <label key={i} className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${isChecked ? 'border-[#010080] bg-blue-50/20' : 'border-gray-50 hover:border-gray-100 dark:border-gray-700'}`}>
                                                <input
                                                    type="radio"
                                                    name={currentStep.id}
                                                    checked={isChecked}
                                                    onChange={() => handleAnswerChange(currentStep.id, { value: opt, index: i })}
                                                    className="w-4 h-4 accent-[#010080]"
                                                />
                                                <span className={`text-xs font-bold uppercase shrink-0 w-6 ${isChecked ? 'text-[#010080]' : 'text-gray-400'}`}>
                                                    {optionLabels[i] || i + 1}.
                                                </span>
                                                <span className={`text-sm font-medium flex-1 ${isChecked ? 'text-[#010080]' : 'text-gray-600 dark:text-gray-400'}`}>{opt}</span>
                                            </label>
                                        );
                                    })}
                                    {currentStep.type === "editing" && (!currentStep.options || currentStep.options.length === 0) && (
                                        <input
                                            type="text"
                                            placeholder="Type correctly..."
                                            value={answers[currentStep.id] || ""}
                                            onChange={(e) => handleAnswerChange(currentStep.id, e.target.value)}
                                            className="w-full p-4 h-14 rounded-xl border border-gray-100 focus:border-[#010080] outline-none text-sm font-normal bg-gray-50 focus:bg-white transition-all"
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Essay Type */}
                        {currentStep.type === "essay" && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{displayQuestionNumber}: {currentStep.title}</h2>
                                <p className="text-sm text-gray-600 font-medium leading-relaxed dark:text-gray-400">{currentStep.description}</p>
                                <div className="flex items-center justify-between gap-3">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-[#010080] text-xs font-bold border border-blue-100">
                                        Write up to {currentStep.wordCount || 300} words only
                                    </span>
                                    <span className={`text-xs font-bold ${countWords(answers[currentStep.id]) >= (currentStep.wordCount || 300) ? "text-rose-600" : "text-gray-500"}`}>
                                        {countWords(answers[currentStep.id])} / {currentStep.wordCount || 300} words
                                    </span>
                                </div>
                                <textarea
                                    value={answers[currentStep.id] || ""}
                                    onChange={(e) => handleEssayChange(currentStep.id, e.target.value, currentStep.wordCount || 300)}
                                    onPaste={(e) => e.preventDefault()}
                                    onCopy={(e) => e.preventDefault()}
                                    onCut={(e) => e.preventDefault()}
                                    spellCheck="false"
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                    autoComplete="off"
                                    className="w-full p-6 border border-gray-100 rounded-xl min-h-[400px] focus:border-[#010080] outline-none bg-gray-50 focus:bg-white transition-all text-sm font-normal dark:bg-gray-900/40 dark:border-gray-700"
                                    placeholder={`Type your essay here (maximum ${currentStep.wordCount || 300} words)...`}
                                />
                            </div>
                        )}

                        {/* Oral Type - Same as Placement Passage Logic */}
                        {currentStep.type === "oral" && (
                            <div className="flex flex-col gap-8">
                                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-sm text-gray-700 leading-relaxed font-normal dark:bg-gray-900/40 dark:border-gray-700 dark:text-gray-300 whitespace-pre-wrap text-left">
                                    <RichTextContent html={currentStep.passage} />
                                </div>
                                <div className="p-1 border-t border-gray-50 pt-6">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Instructions</p>
                                    <p className="text-sm font-medium text-gray-600 italic dark:text-gray-400">{currentStep.instructions}</p>
                                </div>

                                {/* Voice recording */}
                                <div className={`p-8 rounded-2xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-50'}`}>
                                    <span className={`text-xs font-semibold uppercase tracking-wider mb-6 block ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                        Your Oral Answer
                                    </span>

                                    <AudioRecorderPanel
                                        isDark={isDark}
                                        maxSizeMb={20}
                                        onFileReady={handleOralFileReady}
                                        activeFile={uploadedOralFile}
                                        activePreviewUrl={oralFilePreviewUrl}
                                    />
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
