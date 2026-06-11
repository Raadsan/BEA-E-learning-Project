"use client";

import { useState, useEffect, useMemo } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";
import {
    useGetAssignmentsQuery,
    useGetAssignmentSubmissionsQuery,
    useGradeSubmissionMutation,
    useUpdateAssignmentMutation,
    useDeleteAssignmentMutation
} from "@/lib/api/assignmentApi";
import { useGetCurrentUserQuery } from "@/lib/api/authApi";
import { useGetTeacherClassesQuery } from "@/lib/api/teacherApi";
import { API_BASE_URL } from "@/constants";

import DataTable from "@/components/DataTable";
import { useAssignmentNow } from "@/hooks/useAssignmentNow";
import {
    getAssignmentWindowStatus,
    getWindowStatusLabel,
    getWindowStatusBadgeClass,
    canOpenAssignmentWindow,
    formatAssignmentCountdown,
} from "@/utils/assignmentTime";

export default function ExamsPage() {
    const router = useRouter();
    const { isDark } = useDarkMode();
    const { showToast } = useToast();
    const now = useAssignmentNow();

    // State
    const [selectedClassId, setSelectedClassId] = useState("");
    const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
    const [gradingSubmission, setGradingSubmission] = useState(null);
    const [gradeData, setGradeData] = useState({ score: "", feedback: "" });
    const [manualMarks, setManualMarks] = useState<Record<string, any>>({});
    const [gradingAudioUrl, setGradingAudioUrl] = useState("");
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [view, setView] = useState("list"); // 'list', 'submissions', 'grading'

    // Queries
    const { data: currentUser } = useGetCurrentUserQuery();
    const { data: classes, isLoading: isLoadingClasses } = useGetTeacherClassesQuery();

    const { data: assignments, isLoading: isLoadingAssignments, refetch: refetchAssignments } = useGetAssignmentsQuery({
        type: 'exam',
        class_id: selectedClassId || undefined,
        created_by: currentUser?.id
    }, { skip: !currentUser?.id });

    const selectedAssignment = assignments?.find(a => a.id == selectedAssignmentId);

    const { data: submissions, isLoading: isLoadingSubmissions } = useGetAssignmentSubmissionsQuery({
        id: selectedAssignmentId,
        type: 'exam'
    }, { skip: !selectedAssignmentId });

    // Mutations
    const [gradeSubmission] = useGradeSubmissionMutation();
    const [updateAssignment] = useUpdateAssignmentMutation();
    const [deleteAssignment] = useDeleteAssignmentMutation();

    // Handle tokenized audio playback for Speaking paper
    useEffect(() => {
        const fetchAudio = async () => {
            if (!gradingSubmission?.file_url) return;
            setIsLoadingAudio(true);
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`${API_BASE_URL}/files/download/${gradingSubmission.file_url}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    setGradingAudioUrl(url);
                }
            } catch (err) {
                console.error("Audio retrieval error:", err);
            } finally {
                setIsLoadingAudio(false);
            }
        };
        fetchAudio();
        return () => {
            if (gradingAudioUrl) {
                window.URL.revokeObjectURL(gradingAudioUrl);
                setGradingAudioUrl("");
            }
        };
    }, [gradingSubmission]);

    // Automatically sum MCQ + True/False grades and allow manual essay inputs
    useEffect(() => {
        if (!selectedAssignment || !gradingSubmission) return;

        let autoScore = 0;
        let questions = [];
        try {
            questions = typeof selectedAssignment.questions === 'string'
                ? JSON.parse(selectedAssignment.questions)
                : (selectedAssignment.questions || []);

            if (questions && !Array.isArray(questions) && typeof questions === 'object') {
                questions = Object.values(questions);
            }
        } catch (e) {
            questions = [];
        }

        let studentAnswers = {};
        try {
            studentAnswers = typeof gradingSubmission.content === 'string'
                ? JSON.parse(gradingSubmission.content)
                : (gradingSubmission.content || {});
        } catch (e) {
            studentAnswers = {};
        }

        const normalize = (val) => String(val || "").trim().toLowerCase();

        // Recursively check all questions
        const processQuestion = (q, idx, prefix = "") => {
            const isPaper = typeof q === 'object' && !q.type && (q.editing || q.essay || q.questions || q.passage);
            if (isPaper) {
                const paperPrefix = prefix || (idx === 0 ? "p1" : idx === 1 ? "p2" : idx === 2 ? "p3" : idx === 3 ? "p4" : `paper${idx + 1}`);
                if (q.editing) {
                    q.editing.forEach((item, eIdx) => processQuestion(item, eIdx, `${paperPrefix}_editing_${item.id || eIdx}`));
                }
                if (q.questions) {
                    q.questions.forEach((item, qIdx) => processQuestion(item, qIdx, `${paperPrefix}_q_${item.id || qIdx}`));
                }
                return;
            }

            const qId = prefix || q.id || idx;
            const studentAnsRaw = studentAnswers[qId] !== undefined ? studentAnswers[qId] : studentAnswers[String(qId)];
            const studentAns = typeof studentAnsRaw === "object" && studentAnsRaw?.value != null
                ? studentAnsRaw.value
                : studentAnsRaw;
            const correctAns = q.options && q.correctOption !== undefined
                ? q.options[q.correctOption]
                : (q.correctAnswer || q.answer || q.correction);

            const isAutoGradable = q.type === 'mcq' || q.type === 'true_false' || q.type === 'short_answer' || !q.type || q.type === 'multiple_choice' || prefix?.includes('editing');

            if (isAutoGradable && normalize(studentAns) === normalize(correctAns)) {
                autoScore += parseInt(q.points || 1);
            }
        };

        questions.forEach((q, idx) => processQuestion(q, idx));

        // Add manual essay and oral scores from form state
        let manualSum = 0;
        Object.entries(manualMarks).forEach(([key, val]) => {
            if (val) manualSum += Number(val) || 0;
        });

        setGradeData(prev => ({
            ...prev,
            score: String(autoScore + manualSum)
        }));
    }, [manualMarks, selectedAssignment, gradingSubmission]);

    const handleStatusToggle = async (exam) => {
        const newStatus = exam.status === 'draft' ? 'active' : (exam.status === 'inactive' ? 'active' : 'inactive');
        try {
            const formattedDate = exam.due_date
                ? new Date(exam.due_date).toISOString().split('T')[0]
                : null;

            await updateAssignment({
                id: exam.id,
                type: 'exam',
                title: exam.title,
                description: exam.description,
                class_id: exam.class_id,
                program_id: exam.program_id,
                due_date: formattedDate,
                total_points: exam.total_points,
                status: newStatus,
                duration: exam.duration,
                questions: exam.questions
            }).unwrap();
            showToast(`Exam is now ${newStatus}`, "success");
            refetchAssignments();
        } catch (err) {
            showToast(err?.data?.error || "Failed to update status", "error");
        }
    };

    const handleEditClick = (exam) => {
        router.push(`/portal/teacher/exams/create?id=${exam.id}`);
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteAssignment({ id: deleteId, type: 'exam' }).unwrap();
            showToast("Exam deleted successfully", "success");
            setShowDeleteModal(false);
            setDeleteId(null);
            refetchAssignments();
        } catch (err) {
            showToast("Failed to delete exam", "error");
        }
    };

    const handleViewSubmissions = (exam) => {
        const windowStatus = getAssignmentWindowStatus(exam, now);
        if (!canOpenAssignmentWindow(windowStatus)) {
            showToast("This exam is pending. Submissions open when the start time is reached.", "info");
            return;
        }
        setSelectedAssignmentId(exam.id);
        setView("submissions");
    };

    const handleGradeClick = (submission) => {
        setGradingSubmission(submission);

        // Prepopulate teacher grades if already graded
        setGradeData({
            score: submission.score !== null ? String(submission.score) : "",
            feedback: submission.feedback || ""
        });

        let parsedManualMarks = {};
        if (submission.essay_marks) {
            try {
                parsedManualMarks = typeof submission.essay_marks === 'string'
                    ? JSON.parse(submission.essay_marks)
                    : submission.essay_marks;
            } catch (e) {
                parsedManualMarks = {};
            }
        }
        setManualMarks(parsedManualMarks);
        setView("grading");
    };

    const handleGradeSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('id', gradingSubmission.id);
            formData.append('type', 'exam');
            formData.append('score', gradeData.score);
            formData.append('feedback', gradeData.feedback);

            const essayMarks = { ...manualMarks };
            let oralMarks = 0;
            Object.keys(essayMarks).forEach(key => {
                if (key.endsWith('_oral')) {
                    oralMarks = essayMarks[key];
                }
            });

            formData.append('essay_marks', JSON.stringify(essayMarks));
            formData.append('oral_marks', String(oralMarks));

            await gradeSubmission({ id: gradingSubmission.id, formData }).unwrap();
            showToast("Exam graded successfully!", "success");
            setGradingSubmission(null);
            setView("submissions");
        } catch (err) {
            showToast("Failed to grade exam", "error");
        }
    };

    const handleDownloadDoc = (title, studentAns) => {
        const date = new Date().toLocaleDateString();
        const studentName = gradingSubmission?.student_name || "Student";

        const htmlReport = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>Essay Question Response</title></head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px;">
                <h1 style="color: #010080; font-size: 24px;">Essay Submission</h1>
                <p><strong>Student Name:</strong> ${studentName}</p>
                <p><strong>Date:</strong> ${date}</p>
                <hr/>
                <h2 style="font-size: 16px; color: #333;">${title}</h2>
                <br/>
                <h3>Student Answer:</h3>
                <div style="background-color: #f9f9f9; padding: 15px; border: 1px solid #ddd; white-space: pre-wrap;">${studentAns}</div>
            </body>
            </html>
        `;
        const blob = new Blob([htmlReport], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${studentName.replace(/\s+/g, '_')}_Essay.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const getSubmissionColumns = () => [
        {
            header: "Student Name",
            accessor: "student_name",
            render: (value) => <span className="font-semibold text-gray-900 dark:text-white">{value}</span>
        },
        {
            header: "Status",
            accessor: "status",
            render: (value) => (
                <span className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-full border ${
                    value === 'graded'
                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800'
                        : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800'
                }`}>
                    {value || 'pending'}
                </span>
            )
        },
        {
            header: "Score",
            accessor: "score",
            render: (value, row) => (
                <span className="font-semibold text-sm">
                    {value !== null ? `${value} / ${selectedAssignment?.total_points}` : <span className="text-gray-400 font-normal italic">Ungraded</span>}
                </span>
            )
        },
        {
            header: "Submission Date",
            accessor: "submission_date",
            render: (value) => <span>{value ? new Date(value).toLocaleString() : 'N/A'}</span>
        },
        {
            header: "Actions",
            accessor: "id",
            render: (value, row) => (
                <button
                    onClick={() => handleGradeClick(row)}
                    className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs hover:bg-blue-700 transition-all active:scale-95 shadow-sm"
                >
                    Grade Now
                </button>
            )
        }
    ];

    if (view === 'submissions') {
        return (
            <div className="space-y-6 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setView("list")}
                        className={`p-2 rounded-lg border transition-all ${isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-white' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Submissions: {selectedAssignment?.title}</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider mt-1">{selectedAssignment?.class_name}</p>
                    </div>
                </div>

                <DataTable
                    columns={getSubmissionColumns()}
                    data={submissions || []}
                    isLoading={isLoadingSubmissions}
                    title="Student Submissions"
                />
            </div>
        );
    }

    if (view === 'grading') {
        let questions = [];
        try {
            questions = typeof selectedAssignment?.questions === 'string'
                ? JSON.parse(selectedAssignment.questions)
                : (selectedAssignment?.questions || []);

            if (questions && !Array.isArray(questions) && typeof questions === 'object') {
                questions = Object.values(questions);
            }
        } catch (e) {
            questions = [];
        }

        let studentAnswers = {};
        try {
            studentAnswers = typeof gradingSubmission?.content === 'string'
                ? JSON.parse(gradingSubmission.content)
                : (gradingSubmission?.content || {});
        } catch (e) {
            studentAnswers = {};
        }

        const normalize = (val) => String(val || "").trim().toLowerCase();

        return (
            <div className="space-y-8 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setView("submissions")}
                            className={`p-2 rounded-lg border transition-all ${isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-white' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Grade Exam Submission</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{gradingSubmission?.student_name} — {selectedAssignment?.title}</p>
                        </div>
                    </div>

                    <div className={`p-4 rounded-xl border font-bold text-lg flex items-center gap-2 ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800'}`}>
                        <span>Calculated Grade:</span>
                        <span className="text-blue-600 dark:text-blue-400">{gradeData.score || 0}</span>
                        <span className="opacity-55">/ {selectedAssignment?.total_points}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Exam Sections */}
                    <div className="lg:col-span-8 space-y-6">
                        {questions.map((paper, idx) => {
                            const paperPrefix = idx === 0 ? "p1" : idx === 1 ? "p2" : idx === 2 ? "p3" : idx === 3 ? "p4" : `paper${idx + 1}`;
                            return (
                                <div key={idx} className={`p-6 rounded-2xl border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                                    <h2 className="text-xl font-bold border-b pb-3 mb-6 text-blue-600 dark:text-blue-400">{paper.title || `Paper ${idx + 1}`}</h2>

                                    {/* Reading Passage */}
                                    {paper.passage && (
                                        <div className={`p-5 rounded-xl border mb-6 bg-gray-50/50 dark:bg-gray-900/50 italic text-sm leading-relaxed border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400`}>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Reading Passage:</p>
                                            {paper.passage}
                                        </div>
                                    )}

                                    {/* Audio File */}
                                    {paper.audioUrl && (
                                        <div className="mb-6 p-4 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
                                            <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Listening Track:</p>
                                            <audio controls src={paper.audioUrl} className="w-full" />
                                        </div>
                                    )}

                                    {/* Oral Instructions & Voice Recording Playback */}
                                    {paper.instructions && (
                                        <div className="mb-6 space-y-4">
                                            <div className="p-4 bg-yellow-50/50 dark:bg-yellow-950/20 border border-yellow-100 dark:border-yellow-900/50 rounded-xl">
                                                <div className="flex items-center justify-between mb-4 pb-4 border-b border-yellow-100 dark:border-yellow-900/30">
                                                    <p className="text-sm font-bold uppercase tracking-wider text-yellow-800 dark:text-yellow-400">Oral/Speaking Assessment</p>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={20}
                                                            placeholder="0"
                                                            className={`w-16 p-2 text-sm border rounded-lg text-center font-bold outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                                            value={manualMarks[`${paperPrefix}_oral`] || ""}
                                                            onChange={(e) => setManualMarks(prev => ({ ...prev, [`${paperPrefix}_oral`]: e.target.value }))}
                                                        />
                                                        <span className="text-[10px] font-bold text-yellow-800 dark:text-yellow-400">/ 20 PTS</span>
                                                    </div>
                                                </div>
                                                <p className="text-sm">{paper.instructions}</p>
                                            </div>

                                            {gradingSubmission?.file_url && (
                                                <div className="p-5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl">
                                                    <p className="text-xs font-bold uppercase tracking-wider mb-3">Student Voice Submission:</p>
                                                    {isLoadingAudio ? (
                                                        <div className="flex items-center gap-2 text-gray-500">
                                                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                                            <span className="text-xs">Loading speaking file...</span>
                                                        </div>
                                                    ) : gradingAudioUrl ? (
                                                        <audio controls src={gradingAudioUrl} className="w-full" />
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">No audio loaded</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Standalone questions inside Paper */}
                                    <div className="space-y-6">
                                        {paper.editing && paper.editing.map((item, eIdx) => {
                                            const qId = `${paperPrefix}_editing_${item.id || eIdx}`;
                                            const studAnsRaw = studentAnswers[qId];
                                            const studAns = typeof studAnsRaw === "object" && studAnsRaw?.value != null
                                                ? studAnsRaw.value
                                                : studAnsRaw;
                                            const corrAns = item.options?.length && item.correctOption !== undefined
                                                ? item.options[item.correctOption]
                                                : item.correction;
                                            const isCorrect = normalize(studAns) === normalize(corrAns);
                                            const optionLabels = ["A", "B", "C", "D"];

                                            return (
                                                <div key={eIdx} className="p-4 rounded-xl border bg-gray-50/30 dark:bg-gray-900/30">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-600 dark:bg-blue-900/20 px-2 py-0.5 rounded">Grammar {eIdx + 1}</span>
                                                        <span className={`text-[10px] font-bold uppercase ${isCorrect ? 'text-green-600' : 'text-rose-600'}`}>{isCorrect ? `Correct (+${item.points || 1} PTS)` : 'Incorrect (0 PTS)'}</span>
                                                    </div>
                                                    <p className="text-sm font-semibold mb-3">{item.text}</p>
                                                    {item.options?.length ? (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                                                            {item.options.map((opt, optIdx) => (
                                                                <div
                                                                    key={optIdx}
                                                                    className={`text-xs px-3 py-2 rounded-lg border ${optIdx === item.correctOption ? "bg-green-50 border-green-300 text-green-800" : "bg-white border-gray-200 text-gray-600"}`}
                                                                >
                                                                    <span className="font-bold mr-1">{optionLabels[optIdx]}.</span> {opt}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : null}
                                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                                        <div>
                                                            <p className="opacity-60 mb-1 font-bold">Student Answer:</p>
                                                            <p className={`p-2 rounded font-semibold ${isCorrect ? 'bg-green-50 text-green-700 dark:bg-green-950/20' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20'}`}>{studAns || "Blank"}</p>
                                                        </div>
                                                        <div>
                                                            <p className="opacity-60 mb-1 font-bold">Correct Answer:</p>
                                                            <p className="p-2 bg-gray-100 dark:bg-gray-800 rounded font-semibold">{corrAns}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {paper.questions && paper.questions.map((item, qIdx) => {
                                            const qId = `${paperPrefix}_q_${item.id || qIdx}`;
                                            const studAns = studentAnswers[qId];
                                            const corrAns = item.options && item.correctOption !== undefined ? item.options[item.correctOption] : item.correctAnswer;
                                            const isCorrect = normalize(studAns) === normalize(corrAns);

                                            return (
                                                <div key={qIdx} className="p-4 rounded-xl border bg-gray-50/30 dark:bg-gray-900/30">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-[10px] font-bold uppercase bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 px-2 py-0.5 rounded">{item.type || 'MCQ'} Question {qIdx + 1}</span>
                                                        <span className={`text-[10px] font-bold uppercase ${isCorrect ? 'text-green-600' : 'text-rose-600'}`}>{isCorrect ? `Correct (+${item.points || 1} PTS)` : 'Incorrect (0 PTS)'}</span>
                                                    </div>
                                                    <p className="text-sm font-semibold mb-3">{item.questionText || item.question}</p>
                                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                                        <div>
                                                            <p className="opacity-60 mb-1 font-bold">Student Answer:</p>
                                                            <p className={`p-2 rounded font-semibold ${isCorrect ? 'bg-green-50 text-green-700 dark:bg-green-950/20' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20'}`}>{studAns || "Blank"}</p>
                                                        </div>
                                                        <div>
                                                            <p className="opacity-60 mb-1 font-bold">Correct Answer:</p>
                                                            <p className="p-2 bg-gray-100 dark:bg-gray-800 rounded font-semibold">{corrAns}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {paper.essay && (
                                            <div className="p-5 border border-blue-100 dark:border-blue-900/50 rounded-xl bg-blue-50/10 dark:bg-blue-950/10 space-y-4">
                                                <div className="flex justify-between items-center pb-4 border-b border-blue-100 dark:border-blue-900/30">
                                                    <div>
                                                        <span className="text-[10px] font-bold uppercase bg-blue-600 text-white px-2 py-0.5 rounded">Essay Question</span>
                                                        <h3 className="text-lg font-bold mt-2">{paper.essay.title || "Paper 1 Writing Prompt"}</h3>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={paper.essay.points || 30}
                                                            placeholder="0"
                                                            className={`w-16 p-2 text-sm border rounded-lg text-center font-bold outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                                            value={manualMarks[`${paperPrefix}_essay`] || ""}
                                                            onChange={(e) => setManualMarks(prev => ({ ...prev, [`${paperPrefix}_essay`]: e.target.value }))}
                                                        />
                                                        <span className="text-[10px] font-bold">/ {paper.essay.points || 30} PTS</span>
                                                    </div>
                                                </div>
                                                <p className="text-sm font-semibold opacity-85 mb-1">{paper.essay.prompt}</p>
                                                {paper.essay.wordCount && (
                                                    <p className="text-xs font-bold text-[#010080] mb-3">
                                                        Required length: up to {paper.essay.wordCount} words
                                                    </p>
                                                )}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-xs font-bold uppercase opacity-65">
                                                            Student Essay Response
                                                            {studentAnswers[`${paperPrefix}_essay`] && (
                                                                <span className="ml-2 normal-case text-gray-500">
                                                                    ({String(studentAnswers[`${paperPrefix}_essay`] || "").trim().split(/\s+/).filter(Boolean).length} words)
                                                                </span>
                                                            )}
                                                            :
                                                        </p>
                                                        <button
                                                            onClick={() => handleDownloadDoc(paper.essay.prompt, studentAnswers[`${paperPrefix}_essay`] || "No response.")}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border dark:bg-gray-800 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
                                                            <span>Word doc</span>
                                                        </button>
                                                    </div>
                                                    <div className="p-4 rounded-xl border bg-white dark:bg-gray-900 text-sm leading-relaxed min-h-[150px] whitespace-pre-wrap">
                                                        {studentAnswers[`${paperPrefix}_essay`] || <span className="italic opacity-40">No response submitted.</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Right: Feedback & Grading Submission */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className={`p-6 rounded-xl border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                            <h2 className="text-lg font-bold mb-4">Complete Grade Submission</h2>
                            <form onSubmit={handleGradeSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold opacity-75 mb-1.5">Total Calculated Marks</label>
                                    <input
                                        type="number"
                                        disabled
                                        value={gradeData.score}
                                        className={`w-full px-3 py-3 rounded-lg border text-center font-bold text-2xl bg-gray-50/50 dark:bg-gray-900/50 outline-none`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold opacity-75 mb-1.5">Feedback / Comments</label>
                                    <textarea
                                        rows={4}
                                        required
                                        value={gradeData.feedback}
                                        onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                                        className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                        placeholder="Add descriptive feedback..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-3 bg-[#010080] hover:bg-blue-800 text-white font-bold rounded-xl transition-all active:scale-95 shadow-md shadow-blue-900/10"
                                >
                                    Submit Final Grade
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6 md:p-8">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold uppercase tracking-tight text-gray-900 dark:text-white">Exams</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage, activate, and grade student paper exams and multi-part questions.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        className={`px-4 py-2.5 rounded-xl border outline-none font-bold text-xs uppercase transition-all ${
                            isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-700'
                        }`}
                    >
                        <option value="">All Classes</option>
                        {classes?.map(c => (
                            <option key={c.id} value={c.id}>{c.class_name || c.name}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => router.push('/portal/teacher/exams/create')}
                        className="px-5 py-2.5 bg-[#010080] hover:bg-blue-800 text-white font-bold rounded-xl text-xs uppercase transition-all shadow-lg shadow-blue-900/10 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        <span>Add Exam</span>
                    </button>
                </div>
            </div>

            {/* List cards view */}
            {isLoadingAssignments ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {assignments?.map((exam) => {
                        const windowStatus = getAssignmentWindowStatus(exam, now);
                        const submissionsDisabled = !canOpenAssignmentWindow(windowStatus);

                        return (
                        <div
                            key={exam.id}
                            className={`group p-6 rounded-2xl border shadow-sm transition-all duration-300 flex flex-col justify-between ${
                                submissionsDisabled ? 'opacity-80' : 'hover:shadow-xl hover:border-blue-200'
                            } ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    </div>
                                    <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full border ${getWindowStatusBadgeClass(windowStatus)}`}>
                                        {getWindowStatusLabel(windowStatus)}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold mb-1 truncate">{exam.title}</h3>
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-4 uppercase tracking-wider">
                                    {exam.class_name || "General Class"}
                                </p>

                                {/* Program | Subprogram (Parallel) */}
                                <div className="grid grid-cols-2 gap-4 mb-3 pb-3 border-b border-gray-100 dark:border-gray-700/50">
                                    <div className="flex flex-col min-w-0">
                                        <span className={`text-[10px] uppercase font-bold opacity-60 mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Program</span>
                                        <span className={`text-sm font-semibold truncate ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {exam.program_name || "N/A"}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end text-right min-w-0">
                                        <span className={`text-[10px] uppercase font-bold opacity-60 mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Subprogram</span>
                                        <span className={`text-sm font-semibold truncate w-full ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {exam.subprogram_name || "N/A"}
                                        </span>
                                    </div>
                                </div>

                                {/* Start Date | Due Date (Parallel) */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="flex flex-col items-start text-left">
                                        <span className={`text-[10px] uppercase font-bold opacity-60 mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Start Date</span>
                                        <span className={`text-xs font-medium ${exam.start_date ? (isDark ? 'text-gray-300' : 'text-gray-600') : 'text-gray-400 italic'}`}>
                                            {exam.start_date ? new Date(exam.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not set'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end text-right">
                                        <span className={`text-[10px] uppercase font-bold opacity-60 mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Due Date</span>
                                        <span className={`text-xs font-semibold ${exam.due_date || exam.end_date ? (isDark ? 'text-gray-200' : 'text-gray-700') : 'text-gray-400 italic font-normal'}`}>
                                            {(exam.due_date || exam.end_date)
                                                ? new Date(exam.due_date || exam.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                                : 'Not set'}
                                        </span>
                                    </div>
                                </div>

                                {/* Duration and marks */}
                                <div className="mb-4 space-y-2 opacity-70">
                                    <div className="flex justify-between text-xs">
                                        <span>Duration:</span>
                                        <span className="font-bold">{exam.duration ? `${exam.duration} Minutes` : "Unlimited"}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span>Marks Weight:</span>
                                        <span className="font-bold">{exam.total_points} Points</span>
                                    </div>
                                </div>

                                {windowStatus === "pending" && exam.start_date && (
                                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">
                                        Opens in {formatAssignmentCountdown(exam.start_date, now)}
                                    </p>
                                )}
                                {windowStatus === "active" && (exam.due_date || exam.end_date) && (
                                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2">
                                        Completes in {formatAssignmentCountdown(exam.due_date || exam.end_date, now)}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                                <button
                                    onClick={() => handleViewSubmissions(exam)}
                                    disabled={submissionsDisabled}
                                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                                        submissionsDisabled
                                            ? 'bg-gray-400 text-white cursor-not-allowed opacity-70'
                                            : 'bg-[#010080] hover:bg-blue-800 text-white'
                                    }`}
                                >
                                    {windowStatus === "pending" ? "Not Open Yet" : "View Submissions"}
                                </button>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleEditClick(exam)}
                                        className={`p-3 rounded-xl border transition-all hover:bg-gray-100 dark:hover:bg-gray-700 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                                        title="Edit"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(exam.id)}
                                        className={`p-3 rounded-xl border border-rose-100 text-rose-500 transition-all hover:bg-rose-50 dark:border-rose-900/30 dark:bg-rose-900/10`}
                                        title="Delete"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );})}

                    {assignments?.length === 0 && (
                        <div className="col-span-full py-20 text-center opacity-40">
                            No exams found for this class. Click "Add Exam" to schedule a comprehensive test.
                        </div>
                    )}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                    <div className={`relative w-full max-w-md p-6 rounded-xl shadow-2xl border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                        <h3 className="text-lg font-bold mb-2">Delete Exam</h3>
                        <p className="text-sm opacity-75 mb-6">Are you sure you want to delete this exam? This action cannot be undone.</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className={`px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 font-semibold transition-all active:scale-95"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
