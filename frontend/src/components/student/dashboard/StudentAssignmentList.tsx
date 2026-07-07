"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetAssignmentsQuery, useSubmitAssignmentMutation } from "@/lib/api/assignmentApi";
import { useGetCurrentUserQuery } from "@/lib/api/authApi";
import { resolveSubmissionFileUrl, resolveSubmissionDownloadUrl, API_URL } from "@/constants";
import { openSubmissionFile, downloadSubmissionFile } from "@/utils/submissionFiles";
import {
    parseEmbeddedFeedbackFile,
    resolveFeedbackFileUrl,
    isPdfFileUrl,
    openOrDownloadFeedbackFile,
} from "@/utils/feedbackFiles";
import { parseWritingTaskRequirements } from "@/utils/writingTaskMeta";
import { useToast } from "@/components/Toast";
import {
    getAssignmentTimeStatus,
    getAssignmentTimeStatusBadgeClass,
    getAssignmentTimeStatusLabel,
    getAssignmentTimeButtonLabel,
    isAssignmentTimeActionDisabled,
    formatAssignmentDateTime,
    formatAssignmentCountdown,
} from "@/utils/assignmentTime";
import {
    getAssignmentTimerTargetMs,
    getOralSubmissionAccept,
    isAllowedOralSubmissionFile,
    getOralSubmissionLabel,
    splitDurationMinutes,
} from "@/utils/assignmentSchedule";
import StudentPageHeader from "@/components/student/StudentPageHeader";
import AudioRecorderPanel from "@/components/student/AudioRecorderPanel";


export default function StudentAssignmentList({ type, title, externalAssignment = null, onLeaveWorkspace = undefined }) {
    const router = useRouter();
    const { isDark } = useDarkMode();
    const { showToast } = useToast();
    const { data: user } = useGetCurrentUserQuery();
    const [now, setNow] = useState(() => new Date());
    const { data: assignments, isLoading } = useGetAssignmentsQuery({
        class_id: user?.class_id,
        type: type
    }, { skip: !user?.class_id });

    const [submitAssignment] = useSubmitAssignmentMutation();

    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [view, setView] = useState("list"); // "list", "start", "workspace"
    const [submissionContent, setSubmissionContent] = useState("");
    const [quizAnswers, setQuizAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showTimeUpModal, setShowTimeUpModal] = useState(false);
    const timerRef = useRef(null);
    const autoSubmittingRef = useRef(false);

    // Oral assignment state
    const [uploadedFile, setUploadedFile] = useState(null);
    const [filePreviewUrl, setFilePreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const isWritingWindowClosed = (assignment) => {
        if (!assignment?.due_date) return false;
        return now > new Date(assignment.due_date);
    };

    const getStudentKey = () => user?.id || user?.student_id;

    const assignmentHasTimer = (assignment) =>
        !!(assignment?.duration || assignment?.due_date || assignment?.end_date);

    const isSubmissionLocked = (assignment) =>
        assignment?.submission_status === "submitted" || assignment?.submission_status === "graded";

    const clearAssignmentTimer = (assignmentId) => {
        const studentKey = getStudentKey();
        if (!studentKey || !assignmentId) return;
        localStorage.removeItem(`assignment_timer_${studentKey}_${assignmentId}`);
    };

    const ensureTimerTarget = (assignment) => {
        const studentKey = getStudentKey();
        if (!studentKey || !assignment || isSubmissionLocked(assignment)) return null;

        const timerKey = `assignment_timer_${studentKey}_${assignment.id}`;
        const savedTarget = localStorage.getItem(timerKey);
        if (savedTarget) {
            return { timerKey, targetMs: parseInt(savedTarget, 10) };
        }

        const targetMs = getAssignmentTimerTargetMs(assignment, Date.now());
        if (!targetMs) return null;

        localStorage.setItem(timerKey, String(targetMs));
        return { timerKey, targetMs };
    };

    const isTimedWritingSession = () =>
        view === "workspace" &&
        type === "writing_task" &&
        assignmentHasTimer(selectedAssignment) &&
        selectedAssignment.submission_status !== "submitted" &&
        selectedAssignment.submission_status !== "graded" &&
        timeLeft > 0;

    const handleBackToList = () => {
        if (isTimedWritingSession()) {
            showToast("The timer is still running. You cannot leave until you submit or time runs out.", "warning");
            return;
        }
        if (onLeaveWorkspace) {
            onLeaveWorkspace();
            setView("list");
            setSelectedAssignment(null);
            return;
        }
        setView("list");
    };

    // Warn if the student tries to close the tab during a timed writing task
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = "";
        };
        if (isTimedWritingSession()) {
            window.addEventListener("beforeunload", handleBeforeUnload);
        }
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [view, type, selectedAssignment, timeLeft, submitting]);

    // Initialize/read persistent timer when workspace view is activated
    useEffect(() => {
        if (
            view !== "workspace" ||
            type === "exam" ||
            !assignmentHasTimer(selectedAssignment) ||
            !getStudentKey() ||
            isSubmissionLocked(selectedAssignment)
        ) {
            return;
        }

        const timerInfo = ensureTimerTarget(selectedAssignment);
        if (!timerInfo) return;

        const remaining = Math.max(0, Math.floor((timerInfo.targetMs - Date.now()) / 1000));
        setTimeLeft(remaining);

        if (remaining <= 0) {
            handleFinalSubmit(true);
        }
    }, [view, selectedAssignment, user, type]);

    // Timer countdown loop
    useEffect(() => {
        if (
            view !== "workspace" ||
            type === "exam" ||
            !assignmentHasTimer(selectedAssignment) ||
            timeLeft === null ||
            !getStudentKey() ||
            submitting ||
            isSubmissionLocked(selectedAssignment)
        ) {
            clearInterval(timerRef.current);
            return;
        }
        const timerKey = `assignment_timer_${getStudentKey()}_${selectedAssignment.id}`;
        timerRef.current = setInterval(() => {
            const savedTarget = localStorage.getItem(timerKey);
            if (savedTarget) {
                const targetTime = parseInt(savedTarget, 10);
                const remaining = Math.max(0, Math.floor((targetTime - Date.now()) / 1000));
                setTimeLeft(remaining);
                if (remaining <= 0) {
                    clearInterval(timerRef.current);
                    handleFinalSubmit(true);
                }
            } else {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        handleFinalSubmit(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [view, selectedAssignment, timeLeft, user, submitting, type]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const getWordCount = (text) => {
        return text.trim() ? text.trim().split(/\s+/).length : 0;
    };

    const handleOpenWorkspace = (assignment) => {
        const timeStatus = getAssignmentTimeStatus(assignment, now);
        if (timeStatus === "upcoming") {
            showToast("This task is not open yet. Please wait until the start time.", "info");
            return;
        }
        if (timeStatus === "complete") {
            showToast("This task is complete.", "warning");
            return;
        }

        if (isSubmissionLocked(assignment)) {
            clearAssignmentTimer(assignment.id);
            setSelectedAssignment(assignment);
            startWorkspace(assignment);
            return;
        }

        setSelectedAssignment(assignment);
        if (assignmentHasTimer(assignment)) {
            // Check if timer was already started (key exists in localStorage)
            const timerKey = `assignment_timer_${getStudentKey()}_${assignment.id}`;
            const savedTarget = typeof window !== 'undefined' ? localStorage.getItem(timerKey) : null;
            if (savedTarget) {
                // Timer already running — go straight to workspace (don't reset)
                startWorkspace(assignment);
            } else {
                setView("start");
            }
        } else {
            startWorkspace(assignment);
        }
    };

    useEffect(() => {
        if (!externalAssignment) return;
        handleOpenWorkspace(externalAssignment);
    }, [externalAssignment?.id]);

    const startWorkspace = (assignment) => {
        if (assignment.questions) {
            const initialAnswers = assignment.student_content ?
                (typeof assignment.student_content === 'string' ? JSON.parse(assignment.student_content) : assignment.student_content)
                : {};
            setQuizAnswers(initialAnswers);
        } else {
            setSubmissionContent(assignment.student_content || "");
        }

        if (assignmentHasTimer(assignment) && !isSubmissionLocked(assignment)) {
            const timerInfo = ensureTimerTarget(assignment);
            if (timerInfo) {
                const remaining = Math.max(0, Math.floor((timerInfo.targetMs - Date.now()) / 1000));
                setTimeLeft(remaining);
            } else {
                setTimeLeft(assignment.duration ? assignment.duration * 60 : 0);
            }
        } else {
            setTimeLeft(null);
        }
        // Reset upload state
        setUploadedFile(null);
        if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
        setFilePreviewUrl(null);

        setView("workspace");
    };

    const oralAllowsAudioRecording = (submissionType) =>
        !submissionType || submissionType === "audio" || submissionType === "both" || submissionType === "all";

    const handleOralSubmissionFile = (file) => {
        if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
        if (!file) {
            setUploadedFile(null);
            setFilePreviewUrl(null);
            return;
        }
        if (file.size > 50 * 1024 * 1024) {
            showToast("File is too large. Max size is 50MB.", "error");
            return;
        }
        const submissionType = selectedAssignment?.submission_type || "audio";
        if (!isAllowedOralSubmissionFile(file, submissionType)) {
            showToast(`Please select a valid ${getOralSubmissionLabel(submissionType)}.`, "error");
            return;
        }
        setUploadedFile(file);
        setFilePreviewUrl(URL.createObjectURL(file));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) handleOralSubmissionFile(file);
    };

    const removeUploadedFile = () => {
        handleOralSubmissionFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleFinalSubmit = async (options: boolean | { auto?: boolean; skipConfirm?: boolean } = false) => {
        const auto = typeof options === "object" && options !== null ? !!options.auto : !!options;
        const skipConfirm = typeof options === "object" && options !== null ? !!options.skipConfirm : !!options;

        if (autoSubmittingRef.current || submitting) return;

        if (isSubmissionLocked(selectedAssignment)) return;

        const isQuiz = !!selectedAssignment?.questions;
        const contentToSubmit = isQuiz ? quizAnswers : submissionContent;
        const hasOralFile = type === "oral_assignment" && !!uploadedFile;

        if (type === "oral_assignment" && !uploadedFile && !auto) {
            const needsRecording = oralAllowsAudioRecording(selectedAssignment?.submission_type);
            showToast(
                needsRecording
                    ? "Please record your answer before submitting."
                    : `Please upload a ${getOralSubmissionLabel(selectedAssignment?.submission_type)} before submitting.`,
                "error"
            );
            return;
        }

        if (!auto && !isQuiz && !hasOralFile && !String(contentToSubmit || "").trim()) {
            showToast("Please write something before submitting.", "error");
            return;
        }

        if (!skipConfirm && !auto) {
            setShowConfirmModal(true);
            return;
        }

        if (!auto && isQuiz) {
            const questions = typeof selectedAssignment.questions === 'string'
                ? JSON.parse(selectedAssignment.questions)
                : selectedAssignment.questions;

            if (Object.keys(quizAnswers).length < questions.length) {
                if (!window.confirm("You haven't answered all questions. Submit anyway?")) return;
            }
        }

        try {
            if (auto) autoSubmittingRef.current = true;
            setSubmitting(true);

            const formData = new FormData();
            formData.append('assignment_id', selectedAssignment.id);
            formData.append('type', type);
            formData.append('is_auto_submit', auto ? 'true' : 'false');

            if (type === 'oral_assignment' && uploadedFile) {
                formData.append('file', uploadedFile);
                formData.append(
                    'content',
                    JSON.stringify({
                        submissionKind: uploadedFile.type.startsWith("video/")
                            ? "video"
                            : uploadedFile.type.startsWith("image/")
                                ? "image"
                                : "audio",
                        originalName: uploadedFile.name,
                        mimeType: uploadedFile.type,
                    })
                );
            } else {
                const contentPayload = typeof contentToSubmit === "object"
                    ? JSON.stringify(contentToSubmit)
                    : String(contentToSubmit ?? "");
                formData.append("content", contentPayload);
            }

            await submitAssignment(formData).unwrap();

            const studentKey = getStudentKey();
            if (studentKey && selectedAssignment?.id) {
                const timerKey = `assignment_timer_${studentKey}_${selectedAssignment.id}`;
                localStorage.removeItem(timerKey);
            }

            if (type === "oral_assignment" && onLeaveWorkspace) {
                onLeaveWorkspace();
            }
            setSelectedAssignment(null);
            setView("list");
            setSubmissionContent("");
            setQuizAnswers({});
            if (auto) {
                showToast("Time is up! Your work was saved and submitted automatically.", "success");
                setShowTimeUpModal(true);
            } else {
                showToast(
                    type === "oral_assignment"
                        ? "Oral assignment submitted successfully!"
                        : "Work submitted successfully!",
                    "success"
                );
                if (type === "oral_assignment") {
                    router.push("/portal/student/oral-assignment");
                }
            }
        } catch (err) {
            if (auto) autoSubmittingRef.current = false;
            showToast(err.data?.error || "Failed to submit work", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDownloadEssay = () => {
        if (!submissionContent) return;

        const date = new Date().toLocaleDateString();
        const studentName = user?.name || "Student";

        // Create doc content (HTML structure) matching placement test style
        const htmlContent = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>Essay Response</title></head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h1 style="color: #010080;">${selectedAssignment?.title || 'Essay Submission'} - My Response</h1>
                <p><strong>Student:</strong> ${studentName}</p>
                <p><strong>Date:</strong> ${date}</p>
                <hr/>
                <h2 style="font-size: 16px;">Assignment: ${selectedAssignment?.title}</h2>
                <br/>
                <h3>My Answer:</h3>
                <div style="white-space: pre-wrap;">${submissionContent}</div>
            </body>
            </html>
        `;

        const blob = new Blob(['\ufeff', htmlContent], {
            type: 'application/msword'
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${studentName.replace(/\s+/g, '_')}_Essay_Submission.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleDownloadFeedbackFile = async (fileUrl, fileName) => {
        if (!fileUrl) return;
        try {
            const action = await openOrDownloadFeedbackFile(fileUrl, fileName);
            showToast(action === "open" ? "Opening file in browser..." : "Downloading file...", "success");
        } catch (error) {
            console.error("Feedback file error:", error);
            showToast("Could not open the feedback file. Please try again.", "error");
        }
    };

    const renderFeedbackFileActions = (fileUrl, fileName) => {
        if (!fileUrl) return null;
        const label = isPdfFileUrl(fileUrl) ? "Open in Browser" : "Download";
        return (
            <div className="pt-2">
                <button
                    type="button"
                    onClick={() => handleDownloadFeedbackFile(fileUrl, fileName)}
                    className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all
                        ${isDark
                            ? 'bg-blue-600/10 border-blue-500/20 text-blue-400 hover:bg-blue-600/20'
                            : 'bg-white border-blue-100 text-blue-600 hover:bg-blue-50 shadow-sm'
                        }`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isPdfFileUrl(fileUrl) ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        )}
                    </svg>
                    {label} Feedback File
                </button>
            </div>
        );
    };

    const handleAnswerChange = (qIndex, option) => {
        setQuizAnswers(prev => ({
            ...prev,
            [qIndex]: option
        }));
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (view === "start") {
        const questions = selectedAssignment.questions ? (typeof selectedAssignment.questions === 'string'
            ? JSON.parse(selectedAssignment.questions)
            : selectedAssignment.questions) : [];

        return (
            <div className={`min-h-screen flex items-center justify-center p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
                <div className={`max-w-2xl w-full p-10 rounded-3xl shadow-xl border transition-all ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="text-center mb-8">
                        <div className="inline-block p-4 bg-blue-50 dark:bg-blue-900/40 rounded-2xl mb-6">
                            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold mb-12 tracking-tight text-blue-600">{selectedAssignment.title}</h1>
                        <p className="text-slate-500 font-semibold uppercase tracking-widest text-[10px]">Assessment Induction</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Duration</span>
                            <span className="text-xl font-bold">
                                {(() => {
                                    const parts = splitDurationMinutes(selectedAssignment.duration);
                                    if (parts.hours > 0 && parts.minutes > 0) return `${parts.hours}h ${parts.minutes}m`;
                                    if (parts.hours > 0) return `${parts.hours}h`;
                                    return `${parts.minutes || selectedAssignment.duration || 0}`;
                                })()}
                                {!splitDurationMinutes(selectedAssignment.duration).hours && (
                                    <span className="text-xs opacity-50"> MIN</span>
                                )}
                            </span>
                        </div>
                        <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">{selectedAssignment.questions ? 'Questions' : 'Points'}</span>
                            <span className="text-xl font-bold">{selectedAssignment.questions ? questions.length : selectedAssignment.total_points}</span>
                        </div>
                    </div>

                    <div className={`p-6 rounded-2xl mb-8 border ${isDark ? 'bg-gray-900/30 border-gray-700 text-gray-400' : 'bg-blue-50/30 border-blue-100 text-slate-600'}`}>
                        <h3 className="font-bold text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2 text-blue-600">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" /></svg>
                            Instructions
                        </h3>
                        <ul className="text-sm space-y-2 font-medium">
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                Ensure a stable internet connection.
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                The timer begins immediately upon clicking "Begin".
                            </li>
                            <li className="flex items-center gap-2 text-rose-500">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                                Automatic submission occurs when the session expires.
                            </li>
                        </ul>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={handleBackToList}
                            className={`flex-1 py-4 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200 text-slate-600'}`}
                        >
                            Go Back
                        </button>
                        <button
                            onClick={() => startWorkspace(selectedAssignment)}
                            className="flex-[2] py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase text-[10px] tracking-widest transition-all shadow-md active:scale-[0.98]"
                        >
                            Begin Assessment
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (view === "workspace") {


        const isWindowClosed = type === "writing_task" && isWritingWindowClosed(selectedAssignment);
        const isClosed = selectedAssignment.submission_status === "submitted" || selectedAssignment.submission_status === "graded" || isWindowClosed;
        const writingTaskMeta = type === "writing_task"
            ? parseWritingTaskRequirements(
                selectedAssignment?.requirements,
                selectedAssignment?.submission_format
            )
            : null;
        const teacherAttachmentUrl = selectedAssignment?.attachment_url || writingTaskMeta?.attachment_url || null;
        const teacherAttachmentName = selectedAssignment?.attachment_name || writingTaskMeta?.attachment_name || "Teacher file";
        const guidelinesText = type === "writing_task"
            ? (selectedAssignment?.requirements_text || writingTaskMeta?.text || selectedAssignment?.description || "Follow the standard submission procedures.")
            : type === "oral_assignment"
                ? (selectedAssignment?.requirements || "Read the passage below and record your voice.")
                : (selectedAssignment?.requirements || selectedAssignment?.description || "Follow the standard submission procedures.");

        const handleOpenTeacherAttachment = async () => {
            if (!teacherAttachmentUrl) return;
            try {
                if (isPdfFileUrl(teacherAttachmentUrl)) {
                    await openSubmissionFile(teacherAttachmentUrl);
                } else {
                    await downloadSubmissionFile(teacherAttachmentUrl, teacherAttachmentName);
                }
            } catch {
                showToast("Could not open the teacher file. Please try again.", "error");
            }
        };

        const embeddedFeedback = parseEmbeddedFeedbackFile(selectedAssignment?.feedback);
        const feedbackFileUrl = resolveFeedbackFileUrl(
            selectedAssignment?.feedback,
            selectedAssignment?.feedback_file_url
        );
        const feedbackText = embeddedFeedback.text || (feedbackFileUrl ? "" : (selectedAssignment?.feedback || ""));
        const feedbackFileName = embeddedFeedback.fileName || feedbackFileUrl?.split("/").pop() || "feedback";

        return (
            <div className={`transition-colors w-full p-6 md:p-8 pb-12 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
                {/* Header & Back Button */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleBackToList}
                            className={`p-2 rounded-xl transition-all ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50 border border-gray-200'}`}
                        >
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{selectedAssignment.title}</h1>
                            <p className={`text-xs font-semibold opacity-60 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                {type.replace('_', ' ').toUpperCase()} WORKSPACE
                            </p>
                        </div>
                    </div>

                    {assignmentHasTimer(selectedAssignment) && !isClosed && timeLeft > 0 && (
                        <div className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border transition-all ${timeLeft < 300 ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse' : 'bg-blue-50 border-blue-200 text-blue-600'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xl font-bold tabular-nums">{formatTime(timeLeft)}</span>
                        </div>
                    )}
                </div>

                {/* Top Section: Instructions & Details */}
                <div className="flex flex-col gap-6 mb-8 mt-2">
                    <div className={`p-6 rounded-2xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                        <div className="flex flex-wrap justify-between items-start gap-6">
                            <div className="flex-1 min-w-[300px]">
                                <h3 className="text-lg font-bold mb-3 flex items-center gap-2 uppercase tracking-wide text-xs opacity-50">
                                    Guidelines
                                </h3>
                                <p className={`text-base leading-relaxed whitespace-pre-wrap font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {guidelinesText}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <div className={`px-4 py-2 rounded-xl text-center border ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                                    <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Potential</div>
                                    <div className="font-bold">{selectedAssignment.total_points} PTS</div>
                                </div>
                                <div className={`px-4 py-2 rounded-xl text-center border ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                                    <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Due At</div>
                                    <div className="font-bold">{selectedAssignment.due_date ? new Date(selectedAssignment.due_date).toLocaleDateString() : "N/A"}</div>
                                </div>
                            </div>
                        </div>

                        {type === 'writing_task' && teacherAttachmentUrl && (
                            <div className={`mt-6 p-5 rounded-xl border ${isDark ? 'bg-blue-950/30 border-blue-800' : 'bg-blue-50/80 border-blue-200'}`}>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-[#010080] dark:text-blue-300">
                                            Teacher Attached File
                                        </h3>
                                        <p className={`mt-1 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {teacherAttachmentName}
                                        </p>
                                        <p className={`mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                            Open the file in your browser to read the teacher&apos;s instructions or materials.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            type="button"
                                            onClick={handleOpenTeacherAttachment}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#010080] hover:bg-blue-800 text-white text-sm font-bold transition-all"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                {isPdfFileUrl(teacherAttachmentUrl) ? (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                ) : (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                )}
                                            </svg>
                                            {isPdfFileUrl(teacherAttachmentUrl) ? "Open in Browser" : "Download"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedAssignment.submission_status === 'submitted' && (
                            <div className={`mt-6 p-4 rounded-xl border text-sm font-medium ${isDark ? 'bg-indigo-900/20 border-indigo-800 text-indigo-200' : 'bg-indigo-50 border-indigo-200 text-indigo-800'}`}>
                                Your work has been submitted and is waiting for the teacher to grade it.
                            </div>
                        )}

                        {selectedAssignment.submission_status === 'graded' && (
                            <div className={`mt-6 p-6 rounded-2xl border ${isDark ? 'bg-gray-800/40 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                                <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-100 dark:border-gray-700/50">
                                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Assessment Results</h4>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Earned Score:</span>
                                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                            {selectedAssignment.score} / {selectedAssignment.total_points}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {feedbackText && (
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Instructor Feedback</span>
                                            <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                {feedbackText}
                                            </p>
                                        </div>
                                    )}

                                    {renderFeedbackFileActions(feedbackFileUrl, feedbackFileName)}
                                </div>
                            </div>
                        )}
                    </div>


                </div>

                {/* Content Area: Questions / Oral / Writing */}
                <div className="w-full">
                    {type === 'oral_assignment' ? (
                        <div className="space-y-6">
                            {/* Reading Passage Section */}
                            <div className={`p-8 rounded-2xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
                                <span className={`text-xs font-semibold uppercase tracking-wider mb-4 block ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    Reading Passage
                                </span>
                                <div className={`text-lg leading-relaxed whitespace-pre-wrap font-normal ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                    {selectedAssignment.description}
                                </div>
                            </div>

                            {/* File Upload Section */}
                            <div className={`p-8 rounded-2xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-50'}`}>
                                <span className={`text-xs font-semibold uppercase tracking-wider mb-6 block ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    Your Submission
                                </span>

                                {isClosed ? (
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-2 text-emerald-500 text-sm font-medium">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            Submission Completed
                                        </div>
                                        {selectedAssignment.file_url ? (
                                            selectedAssignment.file_url.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i) ? (
                                                <img className="w-full max-h-96 object-contain rounded-lg" src={resolveSubmissionFileUrl(selectedAssignment.file_url) || ""} alt="Submission" />
                                            ) : selectedAssignment.file_url.match(/\.(mp4|webm|mov|avi)$/i) ? (
                                                <video controls className="w-full rounded-lg" src={resolveSubmissionFileUrl(selectedAssignment.file_url) || ""} />
                                            ) : (
                                                <audio controls className="w-full" src={resolveSubmissionFileUrl(selectedAssignment.file_url) || ""} />
                                            )
                                        ) : (
                                            <p className="text-sm italic opacity-50">No file submitted.</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {oralAllowsAudioRecording(selectedAssignment?.submission_type) && (
                                            <AudioRecorderPanel
                                                isDark={isDark}
                                                maxSizeMb={50}
                                                onFileReady={handleOralSubmissionFile}
                                                activeFile={uploadedFile}
                                                activePreviewUrl={filePreviewUrl}
                                            />
                                        )}

                                        {!oralAllowsAudioRecording(selectedAssignment?.submission_type) && !uploadedFile && (
                                            <label className={`flex flex-col items-center justify-center w-full p-12 border-2 border-dashed rounded-xl cursor-pointer transition-all ${isDark ? 'bg-gray-800/20 border-gray-700 hover:border-gray-600' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}>
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                                    <p className="mb-2 text-sm text-gray-500 font-normal">
                                                        Click to upload your {getOralSubmissionLabel(selectedAssignment?.submission_type)}
                                                    </p>
                                                    <p className="text-xs text-gray-400 font-normal">
                                                        {selectedAssignment?.submission_type === 'video' ? 'MP4, WEBM, or MOV (MAX. 50MB)' :
                                                            selectedAssignment?.submission_type === 'image' ? 'JPG, PNG, or WEBP (MAX. 50MB)' :
                                                                'Audio, video, or image files (MAX. 50MB)'}
                                                    </p>
                                                </div>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept={getOralSubmissionAccept(selectedAssignment?.submission_type)}
                                                    onChange={handleFileChange}
                                                    ref={fileInputRef}
                                                />
                                            </label>
                                        )}

                                        {uploadedFile && !oralAllowsAudioRecording(selectedAssignment?.submission_type) && (
                                            <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800/40 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center">
                                                            {uploadedFile.type.startsWith('video/') ? (
                                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                            ) : uploadedFile.type.startsWith('image/') ? (
                                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                            ) : (
                                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-normal truncate max-w-xs">{uploadedFile.name}</span>
                                                            <span className="text-[10px] text-gray-400 uppercase font-normal">
                                                                {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • {uploadedFile.type.startsWith('video/') ? 'Video' : uploadedFile.type.startsWith('image/') ? 'Image' : 'Audio'} File
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button onClick={removeUploadedFile} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 transition-colors">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </div>
                                                {uploadedFile.type.startsWith('video/') ? (
                                                    <video controls className="w-full rounded-lg" src={filePreviewUrl} />
                                                ) : uploadedFile.type.startsWith('image/') ? (
                                                    <img className="w-full max-h-96 object-contain rounded-lg" src={filePreviewUrl} alt="Preview" />
                                                ) : (
                                                    <audio controls className="w-full" src={filePreviewUrl} />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (selectedAssignment.questions && (typeof selectedAssignment.questions === 'string' ? (selectedAssignment.questions !== '[]' && selectedAssignment.questions !== '{}') : selectedAssignment.questions.length > 0)) ? (
                        <div className="space-y-6">
                            {(typeof selectedAssignment.questions === 'string' ? JSON.parse(selectedAssignment.questions) : selectedAssignment.questions).map((q, idx) => (
                                <div key={idx} className={`p-8 rounded-2xl shadow-sm border transition-all ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                    <div className="flex justify-between items-start mb-6">
                                        <h3 className="text-lg font-bold flex gap-3">
                                            <span className="opacity-30">#{idx + 1}</span>
                                            {q.questionText}
                                        </h3>
                                        <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-lg ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                            {q.points || 1} Points
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {q.options.map((opt, oIdx) => (
                                            <label
                                                key={oIdx}
                                                className={`flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${quizAnswers[idx] === opt
                                                    ? 'border-blue-500 bg-blue-500/5 dark:bg-blue-500/10'
                                                    : (isDark ? 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600' : 'bg-gray-50 border-gray-50 text-gray-600 hover:border-gray-200')
                                                    } ${isClosed ? 'cursor-not-allowed opacity-80' : ''}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`q-${idx}`}
                                                    value={opt}
                                                    checked={quizAnswers[idx] === opt}
                                                    onChange={() => !isClosed && handleAnswerChange(idx, opt)}
                                                    className="hidden"
                                                    disabled={isClosed}
                                                />
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${quizAnswers[idx] === opt
                                                    ? 'border-blue-500 bg-blue-500'
                                                    : 'border-gray-300'
                                                    }`}>
                                                    {quizAnswers[idx] === opt && (
                                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                                    )}
                                                </div>
                                                <span className={`font-bold ${quizAnswers[idx] === opt ? 'text-blue-600 dark:text-blue-400' : ''}`}>{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="relative">
                            {/* Word Count & Download Row */}
                            <div className="flex justify-between items-center mb-4">
                                <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${getWordCount(submissionContent) < (selectedAssignment?.word_count || 0)
                                    ? (isDark ? 'bg-amber-900/40 text-amber-400' : 'bg-amber-100 text-amber-700')
                                    : (isDark ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-100 text-emerald-700')
                                    }`}>
                                    {getWordCount(submissionContent)} Words
                                    {selectedAssignment?.word_count ? <span className="opacity-60 ml-1">/ {selectedAssignment.word_count}</span> : ''}
                                </div>
                            </div>

                            <textarea
                                className={`w-full h-[500px] p-6 border rounded-lg focus:outline-none focus:border-blue-500 transition-all resize-none ${isDark ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                                placeholder="Write your response here..."
                                value={submissionContent}
                                onChange={(e) => !isClosed && setSubmissionContent(e.target.value)}
                                readOnly={isClosed}
                                spellCheck={false}
                                autoComplete="off"
                                autoCorrect="off"
                                onPaste={(e) => !isClosed && e.preventDefault()}
                                onCopy={(e) => e.preventDefault()}
                                onCut={(e) => !isClosed && e.preventDefault()}
                            />
                        </div>
                    )}
                </div>

                {isWindowClosed && !selectedAssignment.submission_status?.match(/submitted|graded/) && (
                    <div className={`mt-6 p-4 rounded-lg border text-sm font-medium ${isDark ? 'bg-red-900/20 border-red-800 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
                        This task is complete. You can no longer submit your work.
                    </div>
                )}

                {!isClosed && (
                    <div className="flex justify-end mt-6">
                        <button
                            onClick={() => setShowConfirmModal(true)}
                            className={`px-8 py-3 rounded-lg font-semibold text-sm transition-colors ${submitting || (type === 'oral_assignment' && !uploadedFile)
                                ? 'bg-gray-400 cursor-not-allowed text-white'
                                : 'bg-[#010080] hover:bg-blue-800 text-white'
                                }`}
                            disabled={submitting || (type === 'oral_assignment' && !uploadedFile)}
                        >
                            {submitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                )}

                {/* Confirmation Modal */}
                {showConfirmModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)} />
                        <div className={`relative w-full max-w-md rounded-lg shadow-2xl p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
                            <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Confirm Submission</h3>
                            <p className={`text-sm mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                Are you sure you want to submit your work? You won't be able to edit it after submission.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setShowConfirmModal(false);
                                        handleFinalSubmit({ auto: false, skipConfirm: true });
                                    }}
                                    className="px-4 py-2 rounded-lg bg-[#010080] hover:bg-blue-800 text-white font-semibold text-sm transition-colors"
                                >
                                    Yes, Submit
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        );
    }

    if (externalAssignment && view === "list") {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-colors pt-4 w-full px-6 sm:px-10 pb-20 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {showTimeUpModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                    <div className={`relative w-full max-w-md rounded-lg shadow-2xl p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
                        <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Time Expired</h3>
                        <p className={`text-sm mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            Your writing time has ended. Whatever you wrote has been saved and submitted automatically.
                            Click <strong>View Submission</strong> on the task card to see your work, the teacher&apos;s file, and your grade when ready.
                        </p>
                        <button
                            onClick={() => setShowTimeUpModal(false)}
                            className="w-full px-4 py-2 rounded-lg bg-[#010080] hover:bg-blue-800 text-white font-semibold text-sm"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
            <StudentPageHeader
                title={title}
                description={`View your ${title.toLowerCase()}. Tasks open at the start time and complete when the end time is reached.`}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(() => {
                const visibleTasks = assignments?.filter(t => t.status !== 'inactive') || [];

                if (visibleTasks.length === 0) {
                    return (
                        <div className="col-span-full py-20 text-center opacity-50">
                            <p className="text-xl">No {title.toLowerCase()} assigned yet.</p>
                        </div>
                    );
                }

                return visibleTasks.map((task) => {
                            const timeStatus = getAssignmentTimeStatus(task, now);
                            const isGraded = timeStatus === 'graded';
                            const isSubmitted = timeStatus === 'submitted';
                            const isUpcoming = timeStatus === 'upcoming';
                            const isActive = timeStatus === 'active';
                            const isDisabled = isAssignmentTimeActionDisabled(timeStatus);
                            const endDate = task.due_date || task.end_date;

                            const statusLabel = getAssignmentTimeStatusLabel(timeStatus);
                            const buttonLabel = getAssignmentTimeButtonLabel(timeStatus, {
                                scoreText: isGraded ? `${task.score}/${task.total_points}` : undefined,
                                activeLabel: type === 'oral_assignment' ? 'Start Assignment' : 'Start Task',
                            });

                            const handleBtnClick = () => {
                                if (timeStatus === 'upcoming') {
                                    showToast("This assignment is not open yet. Please wait until the start time.", "info");
                                    return;
                                }
                                if (timeStatus === 'complete') {
                                    showToast("This assignment is complete.", "warning");
                                    return;
                                }
                                handleOpenWorkspace(task);
                            };

                            return (
                                <div
                                    key={task.id}
                                    className={`flex flex-col rounded-lg p-5 border transition-all ${
                                        isDisabled ? 'opacity-70' : ''
                                    } ${isDark ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-blue-300'}`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={`text-xs font-bold uppercase tracking-wide opacity-50 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {type === 'writing_task' ? 'Writing Task' : type === 'oral_assignment' ? 'Oral Assignment' : 'Assignment'}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getAssignmentTimeStatusBadgeClass(timeStatus)}`}>
                                            {statusLabel}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold mb-1.5 line-clamp-1">{task.title}</h3>
                                    <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {task.description || "No description provided."}
                                    </p>

                                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-3">
                                        <div className={`flex items-center justify-between text-xs font-medium opacity-70 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            <div className="flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                                                <span>{task.total_points || 0} Marks</span>
                                            </div>
                                            {isGraded && (
                                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                                    {task.score}/{task.total_points}
                                                </span>
                                            )}
                                        </div>

                                        <div className={`text-xs space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            <div className="flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                <span>Starts: {formatAssignmentDateTime(task.start_date)}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                <span>Ends: {formatAssignmentDateTime(endDate)}</span>
                                            </div>
                                            {isUpcoming && task.start_date && (
                                                <p className="text-blue-600 dark:text-blue-400 font-semibold pt-1">
                                                    Opens in {formatAssignmentCountdown(task.start_date, now)}
                                                </p>
                                            )}
                                            {isActive && endDate && (
                                                <p className="text-amber-600 dark:text-amber-400 font-semibold pt-1">
                                                    Completes in {formatAssignmentCountdown(endDate, now)}
                                                </p>
                                            )}
                                        </div>

                                        <button
                                            onClick={handleBtnClick}
                                            disabled={isDisabled}
                                            className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all ${
                                                isGraded || isSubmitted
                                                    ? isDark
                                                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                                    : isDisabled
                                                        ? 'bg-gray-400 cursor-not-allowed text-white opacity-70'
                                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                            }`}
                                        >
                                            {buttonLabel}
                                        </button>
                                    </div>
                                </div>
                            );
                        });
            })()}
            </div>
        </div>
    );
}
