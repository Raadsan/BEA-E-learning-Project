"use client";

import { useState, useEffect, useRef } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetAssignmentsQuery, useSubmitAssignmentMutation } from "@/redux/api/assignmentApi";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useToast } from "@/components/Toast";


export default function StudentAssignmentList({ type, title }) {
    const { isDark } = useDarkMode();
    const { showToast } = useToast();
    const { data: user } = useGetCurrentUserQuery();
    const { data: assignments, isLoading } = useGetAssignmentsQuery({
        class_id: user?.class_id,
        program_id: user?.chosen_program,
        subprogram_id: user?.chosen_subprogram,
        type: type
    }, { skip: !user });

    const [submitAssignment] = useSubmitAssignmentMutation();

    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [view, setView] = useState("list"); // "list", "start", "workspace"
    const [submissionContent, setSubmissionContent] = useState("");
    const [quizAnswers, setQuizAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const timerRef = useRef(null);

    // Oral assignment state
    const [uploadedFile, setUploadedFile] = useState(null);
    const [filePreviewUrl, setFilePreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    // Timer logic
    useEffect(() => {
        // For 'exam' type, the StudentTestWorkspace handles the timer internally to match placement test logic
        if (view === "workspace" && timeLeft > 0 && !submitting && type !== 'exam') {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        handleFinalSubmit(true); // Auto-submit when time is up
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }

        return () => clearInterval(timerRef.current);
    }, [view, timeLeft, submitting, type]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const getWordCount = (text) => {
        return text.trim() ? text.trim().split(/\s+/).length : 0;
    };

    const handleOpenWorkspace = (assignment) => {
        setSelectedAssignment(assignment);
        if (assignment.duration && assignment.submission_status !== 'submitted' && assignment.submission_status !== 'graded') {
            setView("start");
        } else {
            startWorkspace(assignment);
        }
    };

    const startWorkspace = (assignment) => {
        if (assignment.questions) {
            const initialAnswers = assignment.student_content ?
                (typeof assignment.student_content === 'string' ? JSON.parse(assignment.student_content) : assignment.student_content)
                : {};
            setQuizAnswers(initialAnswers);
        } else {
            setSubmissionContent(assignment.student_content || "");
        }

        if (assignment.duration) {
            setTimeLeft(assignment.duration * 60);
        }
        // Reset upload state
        setUploadedFile(null);
        if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
        setFilePreviewUrl(null);

        setView("workspace");
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
           if (file.size > 50 * 1024 * 1024) { // 50MB limit
    showToast("File is too large. Max size is 50MB.", "error");
    return;
}

            // Get submission type from assignment
            const submissionType = selectedAssignment?.submission_type || 'audio';
            const fileType = file.type;
            const isAudio = fileType.startsWith('audio/');
            const isVideo = fileType.startsWith('video/');

            // Validate based on submission type
            if (submissionType === 'audio' && !isAudio) {
                showToast("Please select an audio file.", "error");
                return;
            }
            if (submissionType === 'video' && !isVideo) {
                showToast("Please select a video file.", "error");
                return;
            }
            if (submissionType === 'both' && !isAudio && !isVideo) {
                showToast("Please select an audio or video file.", "error");
                return;
            }

            setUploadedFile(file);
            const url = URL.createObjectURL(file);
            setFilePreviewUrl(url);
        }
    };

    const removeUploadedFile = () => {
        setUploadedFile(null);
        if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
        setFilePreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleFinalSubmit = async (auto = false, overrideContent = null) => {
        const isQuiz = !!selectedAssignment?.questions;
        const contentToSubmit = overrideContent || (isQuiz ? quizAnswers : submissionContent);

        if (!auto && !isQuiz && !contentToSubmit && !submissionContent.trim()) {
            showToast("Please write something before submitting.", "error");
            return;
        }

        // Show confirmation modal for manual submissions
        if (!auto) {
            setShowConfirmModal(true);
            return;
        }

        if (!auto && isQuiz && !overrideContent) {
            const questions = typeof selectedAssignment.questions === 'string'
                ? JSON.parse(selectedAssignment.questions)
                : selectedAssignment.questions;

            if (Object.keys(quizAnswers).length < questions.length) {
                if (!window.confirm("You haven't answered all questions. Submit anyway?")) return;
            }
        } else if (!auto && !window.confirm("Are you sure you want to submit your work?")) {
            return;
        }

        try {
            setSubmitting(true);

            const formData = new FormData();
            formData.append('assignment_id', selectedAssignment.id);
            formData.append('type', type);

            if (type === 'oral_assignment' && uploadedFile) {
                formData.append('file', uploadedFile);
                formData.append('content', 'Audio File Upload');
            } else {
                formData.append('content', typeof contentToSubmit === 'object' ? JSON.stringify(contentToSubmit) : contentToSubmit);
            }

            await submitAssignment(formData).unwrap();
            setView("list");
            setSubmissionContent("");
            setQuizAnswers({});
            showToast(auto ? "Time's up! Work auto-submitted." : "Work submitted successfully!", "success");
        } catch (err) {
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

    const handleDownloadFeedbackFile = async (fileUrl) => {
        if (!fileUrl) return;
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/files/download/${fileUrl}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error("Failed to download file");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            // Extract original filename if possible (after the unique suffix)
            const fileNameParts = fileUrl.split('-');
            const displayFileName = fileNameParts.length > 2 ? fileNameParts.slice(2).join('-') : fileUrl;

            a.download = displayFileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showToast("Download started", "success");
        } catch (error) {
            console.error("Download error:", error);
            showToast("Failed to download file. Please try again.", "error");
        }
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
                        <h1 className="text-3xl font-bold mb-2 tracking-tight text-blue-600">{selectedAssignment.title}</h1>
                        <p className="text-slate-500 font-semibold uppercase tracking-widest text-[10px]">Assessment Induction</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Duration</span>
                            <span className="text-xl font-bold">{selectedAssignment.duration} <span className="text-xs opacity-50">MIN</span></span>
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
                            onClick={() => setView("list")}
                            className={`flex-1 py-4 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200 text-slate-600'}`}
                        >
                            Return Late
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


        const isClosed = selectedAssignment.submission_status === "submitted" || selectedAssignment.submission_status === "graded";

        return (
            <div className={`min-h-screen transition-colors pt-6 w-full px-8 pb-12 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
                {/* Header & Back Button */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setView("list")}
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

                    {selectedAssignment.duration && !isClosed && (
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
                                    {type === 'oral_assignment'
                                        ? (selectedAssignment?.requirements || "Read the passage below and record your voice.")
                                        : (selectedAssignment?.requirements || selectedAssignment?.description || "Follow the standard submission procedures.")}
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
                                    {selectedAssignment.feedback && (
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Instructor Feedback</span>
                                            <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                {selectedAssignment.feedback}
                                            </p>
                                        </div>
                                    )}

                                    {selectedAssignment.feedback_file_url && (
                                        <div className="pt-2">
                                            <button
                                                onClick={() => handleDownloadFeedbackFile(selectedAssignment.feedback_file_url)}
                                                className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all
                                                    ${isDark
                                                        ? 'bg-blue-600/10 border-blue-500/20 text-blue-400 hover:bg-blue-600/20'
                                                        : 'bg-white border-blue-100 text-blue-600 hover:bg-blue-50 shadow-sm'
                                                    }`}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Download Feedback Document
                                            </button>
                                        </div>
                                    )}
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
                                            selectedAssignment.file_url.match(/\.(mp4|webm|mov|avi)$/i) ? (
                                                <video controls className="w-full rounded-lg" src={`${API_URL}/files/download/${selectedAssignment.file_url}`} />
                                            ) : (
                                                <audio controls className="w-full" src={`${API_URL}/files/download/${selectedAssignment.file_url}`} />
                                            )
                                        ) : (
                                            <p className="text-sm italic opacity-50">No file submitted.</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {!uploadedFile ? (
                                            <label className={`flex flex-col items-center justify-center w-full p-12 border-2 border-dashed rounded-xl cursor-pointer transition-all ${isDark ? 'bg-gray-800/20 border-gray-700 hover:border-gray-600' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}>
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                                    <p className="mb-2 text-sm text-gray-500 font-normal">
                                                        Click to upload your {selectedAssignment?.submission_type === 'audio' ? 'audio recording' : selectedAssignment?.submission_type === 'video' ? 'video recording' : 'audio or video recording'}
                                                    </p>
                                                    <p className="text-xs text-gray-400 font-normal">
                                                        {selectedAssignment?.submission_type === 'audio' ? 'MP3, WAV, or WEBM (MAX. 20MB)' :
                                                            selectedAssignment?.submission_type === 'video' ? 'MP4, WEBM, or MOV (MAX. 20MB)' :
                                                                'Audio or Video Files (MAX. 20MB)'}
                                                    </p>
                                                </div>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept={selectedAssignment?.submission_type === 'audio' ? 'audio/*' :
                                                        selectedAssignment?.submission_type === 'video' ? 'video/*' :
                                                            'audio/*,video/*'}
                                                    onChange={handleFileChange}
                                                    ref={fileInputRef}
                                                />
                                            </label>
                                        ) : (
                                            <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800/40 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center">
                                                            {uploadedFile.type.startsWith('video/') ? (
                                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                            ) : (
                                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-normal truncate max-w-xs">{uploadedFile.name}</span>
                                                            <span className="text-[10px] text-gray-400 uppercase font-normal">{(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • {uploadedFile.type.startsWith('video/') ? 'Video' : 'Audio'} File</span>
                                                        </div>
                                                    </div>
                                                    <button onClick={removeUploadedFile} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 transition-colors">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </div>
                                                {uploadedFile.type.startsWith('video/') ? (
                                                    <video controls className="w-full rounded-lg" src={filePreviewUrl} />
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
                                        handleFinalSubmit(true);
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

    return (
        <div className={`min-h-screen transition-colors p-8 pt-24 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="mb-8">
                <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {title}
                </h1>
                <p className={`text-sm opacity-60 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Access your {title.toLowerCase()} assignments and submit your work.
                </p>
            </div>

            {!assignments || assignments.filter(t => t.status !== 'inactive').length === 0 ? (
                <div className={`p-16 rounded-lg border-2 border-dashed text-center ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <p className="text-lg text-gray-400">No active {title.toLowerCase()} assignments yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {assignments.filter(t => t.status !== 'inactive').map((task) => {
                        const isGraded = task.submission_status === 'graded';
                        const isSubmitted = task.submission_status === 'submitted';

                        return (
                            <div
                                key={task.id}
                                onClick={() => handleOpenWorkspace(task)}
                                className={`p-5 rounded-lg border transition-all cursor-pointer flex flex-col ${isDark ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-blue-300'
                                    }`}
                            >
                                {/* Header */}
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`text-xs font-medium uppercase tracking-wide opacity-50 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {type === 'writing_task' ? 'Writing Task' : type === 'oral_assignment' ? 'Oral Assignment' : 'Assignment'}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isGraded ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' :
                                        isSubmitted ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' :
                                            'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                                        }`}>
                                        {task.submission_status || 'Pending'}
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 className={`text-lg font-bold mb-3 line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {task.title}
                                </h3>

                                {/* Meta Info */}
                                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
                                    <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        <span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No Due Date'}</span>
                                    </div>

                                    {isGraded ? (
                                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" /></svg>
                                            <span>Score: {task.score}/{task.total_points}</span>
                                        </div>
                                    ) : (
                                        <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                                            <span>{task.total_points} Points</span>
                                        </div>
                                    )}
                                </div>

                                {/* Action Button */}
                                <button className={`mt-4 w-full py-2 rounded-lg text-xs font-semibold transition-colors ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                                    {isGraded ? 'View Results' : isSubmitted ? 'View Submission' : 'Start Task'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div >
    );
}
