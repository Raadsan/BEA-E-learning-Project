"use client";

import { useState, useEffect, useMemo } from "react";
import DataTable from "@/components/DataTable";
import { useDarkMode } from "@/context/ThemeContext";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";
import {
    useGetAssignmentsQuery,
    useCreateAssignmentMutation,
    useUpdateAssignmentMutation,
    useDeleteAssignmentMutation,
    useGetAssignmentSubmissionsQuery,
    useGradeSubmissionMutation,
    useReopenSubmissionMutation
} from "@/lib/api/assignmentApi";
import { useGetCurrentUserQuery } from "@/lib/api/authApi";
import { useGetTeacherClassesQuery } from "@/lib/api/teacherApi";
import { resolveSubmissionFileUrl } from "@/constants";
import { downloadSubmissionFile, openSubmissionFile } from "@/utils/submissionFiles";
import { formatDatetimeLocalValue } from "@/utils/assignmentSchedule";
import { useAssignmentNow } from "@/hooks/useAssignmentNow";
import {
    getAssignmentWindowStatus,
    getWindowStatusLabel,
    getWindowStatusBadgeClass,
    canOpenAssignmentWindow,
    formatAssignmentCountdown,
} from "@/utils/assignmentTime";

export default function OralAssignmentPage() {
    const type = "oral_assignment";
    const title = "Oral Assignment";
    const description = "Manage speaking tasks and oral assessments. Evaluate students' verbal communication and fluency.";

    const router = useRouter();
    const { isDark } = useDarkMode();
    const { showToast } = useToast();
    const now = useAssignmentNow();
    const { data: currentUser } = useGetCurrentUserQuery();

    const [view, setView] = useState("list"); // 'list', 'submissions', 'grading'
    const [isAdding, setIsAdding] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState(null);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [gradingSubmission, setGradingSubmission] = useState(null);
    const [gradeData, setGradeData] = useState({ score: "", feedback: "" });
    const [feedbackFile, setFeedbackFile] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [showReopenModal, setShowReopenModal] = useState(false);
    const [reopenTarget, setReopenTarget] = useState(null);
    const [reopenFormData, setReopenFormData] = useState({ start_date: "", end_date: "" });

    const [gradingAudioUrl, setGradingAudioUrl] = useState(null);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);

    const getSubmissionMediaMeta = (submission) => {
        if (!submission) return { kind: null, name: null };

        if (submission.file_url) {
            if (/\.(mp4|webm|mov|avi)$/i.test(submission.file_url)) {
                return { kind: "video", name: submission.file_url.split("/").pop() };
            }
            if (/\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(submission.file_url)) {
                return { kind: "image", name: submission.file_url.split("/").pop() };
            }
            return { kind: "audio", name: submission.file_url.split("/").pop() };
        }

        try {
            const parsed = typeof submission.content === "string" ? JSON.parse(submission.content) : submission.content;
            return {
                kind: parsed?.submissionKind || null,
                name: parsed?.originalName || null,
            };
        } catch {
            return { kind: null, name: null };
        }
    };

    // Fetch audio for playback in grading view
    useEffect(() => {
        if (view === "grading" && gradingSubmission?.file_url) {
            setGradingAudioUrl(resolveSubmissionFileUrl(gradingSubmission.file_url));
            setIsLoadingAudio(false);
        } else {
            setGradingAudioUrl(null);
        }
    }, [view, gradingSubmission]);

    // Scroll Lock when Modal is open
    useEffect(() => {
        if (isAdding) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isAdding]);

    const [formData, setFormData] = useState({
        title: "",
        description: "", // Used for Passage / Text
        class_id: "",
        program_id: "",
        subprogram_id: "",
        start_date: "",
        due_date: "",
        total_points: 100,
        status: "active",
        duration: "",
        submission_type: "audio", // Audio, video, or both
    });

    // Queries
    const { data: assignments, isLoading } = useGetAssignmentsQuery({
        type,
        created_by: currentUser?.id
    });
    const { data: classes } = useGetTeacherClassesQuery();

    // Cascading Dropdown Logic
    const uniquePrograms = useMemo(() => {
        if (!classes) return [];
        const programsMap = new Map();
        classes.forEach(c => {
            const pId = c.program_id || c.subprograms?.program_id;
            const pName = c.program_name || c.subprograms?.programs?.title;
            if (pId && pName) {
                programsMap.set(pId, { id: pId, title: pName });
            }
        });
        return Array.from(programsMap.values());
    }, [classes]);

    const filteredSubprograms = useMemo(() => {
        if (!classes || !formData.program_id) return [];
        const subprogramsMap = new Map();
        classes.forEach(c => {
            const spId = c.subprogram_id || c.subprograms?.id;
            const spName = c.subprogram_name || c.subprograms?.subprogram_name;
            const pId = c.program_id || c.subprograms?.program_id;
            if (pId == formData.program_id && spId && spName) {
                subprogramsMap.set(spId, { id: spId, title: spName });
            }
        });
        return Array.from(subprogramsMap.values());
    }, [classes, formData.program_id]);

    const filteredClasses = useMemo(() => {
        if (!classes || !formData.subprogram_id) return [];
        return classes.filter(c => {
            const spId = c.subprogram_id || c.subprograms?.id;
            return spId == formData.subprogram_id;
        });
    }, [classes, formData.subprogram_id]);

    // Fetch submissions for selected assignment
    const { data: submissions, isLoading: isLoadingSubmissions } = useGetAssignmentSubmissionsQuery(
        { id: selectedAssignment?.id, type },
        { skip: !selectedAssignment }
    );

    // Mutations
    const [createAssignment] = useCreateAssignmentMutation();
    const [updateAssignment] = useUpdateAssignmentMutation();
    const [deleteAssignment] = useDeleteAssignmentMutation();
    const [gradeSubmission] = useGradeSubmissionMutation();
    const [reopenSubmission] = useReopenSubmissionMutation();

    const handleAddClick = () => {
        setEditingAssignment(null);
        setFormData({
            title: "",
            description: "",
            class_id: "",
            program_id: "",
            subprogram_id: "",
            start_date: "",
            due_date: "",
            total_points: 100,
            status: "active",
            duration: "",
            submission_type: "audio",
        });
        setIsAdding(!isAdding);
    };

    const handleEditClick = (assignment) => {
        setEditingAssignment(assignment);
        const classInfo = classes?.find(c => c.id == assignment.class_id);
        setFormData({
            title: assignment.title,
            description: assignment.description,
            class_id: assignment.class_id,
            program_id: classInfo?.program_id || assignment.program_id || "",
            subprogram_id: classInfo?.subprogram_id || "",
            start_date: assignment.start_date ? formatDatetimeLocalValue(new Date(assignment.start_date)) : "",
            due_date: assignment.due_date ? formatDatetimeLocalValue(new Date(assignment.due_date)) : "",
            total_points: assignment.total_points,
            status: assignment.status || "active",
            duration: assignment.duration || "",
            submission_type: assignment.submission_type || "audio",
        });
        setIsAdding(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteAssignment({ id: deleteId, type }).unwrap();
            showToast("Assignment deleted successfully", "success");
            setShowDeleteModal(false);
            setDeleteId(null);
        } catch (err) {
            showToast("Failed to delete", "error");
        }
    };

    const handleStatusToggle = async (assignment) => {
        const newStatus = assignment.status === 'inactive' ? 'active' : 'inactive';
        try {
            const formattedDate = assignment.due_date
                ? new Date(assignment.due_date).toISOString().split('T')[0]
                : null;

            const updatePayload = {
                id: assignment.id,
                type: type,
                title: assignment.title,
                description: assignment.description,
                class_id: assignment.class_id,
                program_id: assignment.program_id,
                due_date: formattedDate,
                total_points: assignment.total_points,
                status: newStatus,
                duration: assignment.duration,
            };

            await updateAssignment(updatePayload).unwrap();
            showToast(`Assignment is now ${newStatus}`, "success");
        } catch (err) {
            console.error("Status update error details:", err);
            showToast(err.data?.error || "Failed to update status", "error");
        }
    };

    const handleViewSubmissions = (assignment) => {
        const windowStatus = getAssignmentWindowStatus(assignment, now);
        if (!canOpenAssignmentWindow(windowStatus)) {
            showToast("This assignment is pending. Submissions open when the start time is reached.", "info");
            return;
        }
        setSelectedAssignment(assignment);
        setView("submissions");
        setGradingSubmission(null);
    };

    const handleGradeClick = (submission) => {
        setGradingSubmission(submission);
        setGradeData({
            score: submission.score || "",
            feedback: submission.feedback || ""
        });
        setView("grading");
    };

    const handleGradeSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('id', gradingSubmission.id);
            formData.append('type', type);
            formData.append('score', gradeData.score);
            formData.append('feedback', gradeData.feedback);

            if (feedbackFile) {
                formData.append('feedbackFile', feedbackFile);
            }

            await gradeSubmission({ id: gradingSubmission.id, formData }).unwrap();
            showToast("Submission graded successfully!", "success");
            setView("submissions");
            setGradingSubmission(null);
            setFeedbackFile(null);
        } catch (err) {
            showToast("Failed to grade submission", "error");
        }
    };

    const handleReopenSubmission = (submission) => {
        setReopenTarget(submission);
        setReopenFormData({
            start_date: selectedAssignment?.start_date ? formatDatetimeLocalValue(new Date(selectedAssignment.start_date)) : "",
            end_date: (selectedAssignment?.due_date || selectedAssignment?.end_date)
                ? formatDatetimeLocalValue(new Date(selectedAssignment?.due_date || selectedAssignment?.end_date))
                : "",
        });
        setShowReopenModal(true);
    };

    const confirmReopenSubmission = async () => {
        if (!reopenTarget) return;
        if (reopenFormData.start_date && reopenFormData.end_date && new Date(reopenFormData.end_date) <= new Date(reopenFormData.start_date)) {
            showToast("End date and time must be after start date and time.", "error");
            return;
        }
        try {
            await reopenSubmission({
                id: reopenTarget.id,
                type,
                start_date: reopenFormData.start_date || null,
                end_date: reopenFormData.end_date || null,
            }).unwrap();
            if (gradingSubmission?.id === reopenTarget.id) {
                setGradingSubmission(null);
                setView("submissions");
            }
            setShowReopenModal(false);
            setReopenTarget(null);
            setReopenFormData({ start_date: "", end_date: "" });
            showToast("Submission reopened. Student can submit again.", "success");
        } catch (err) {
            showToast(err?.data?.error || "Failed to reopen submission", "error");
        }
    };

    const handleDownloadFile = async (fileUrl) => {
        if (!fileUrl) return;
        try {
            await downloadSubmissionFile(fileUrl);
            showToast("Download started", "success");
        } catch (error) {
            console.error("Download error:", error);
            showToast("Failed to download file. Please try again.", "error");
        }
    };

    const handleOpenFile = async (fileUrl) => {
        if (!fileUrl) return;
        try {
            await openSubmissionFile(fileUrl);
        } catch (error) {
            console.error("Open file error:", error);
            showToast("Could not open this file.", "error");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAssignment) {
                await updateAssignment({ id: editingAssignment.id, ...formData, type }).unwrap();
                showToast(`${title} updated successfully!`, "success");
            } else {
                await createAssignment({ ...formData, type }).unwrap();
                showToast(`${title} created successfully!`, "success");
            }
            setIsAdding(false);
            setEditingAssignment(null);
        } catch (err) {
            showToast(`Error saving ${title.toLowerCase()}`, "error");
        }
    };

    const getColumns = () => [
        {
            key: "title",
            label: "Assignment Title",
            render: (_, row) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 dark:text-white">{row.title}</span>
                    <span className="text-[11px] text-gray-500 uppercase">{row.class_name || "General"}</span>
                </div>
            )
        },
        {
            key: "program",
            label: "Program",
            render: (_, row) => <span className="text-sm opacity-80">{row.program_name || "N/A"}</span>
        },
        {
            key: "subprogram",
            label: "Subprogram",
            render: (_, row) => <span className="text-sm opacity-80">{row.subprogram_name || "N/A"}</span>
        },
        { label: "Duration", key: "duration" },
        {
            label: "Due Date",
            render: (_, row) => {
                const due = row.due_date ? new Date(row.due_date).toLocaleDateString() : null;
                return <span className="text-sm text-gray-600 dark:text-gray-400">{due || "N/A"}</span>;
            }
        },
        {
            label: "Points",
            render: (_, row) => <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{row.total_points}</span>
        },
        {
            label: "Status",
            render: (_, row) => (
                <span className={`px-2.5 py-1 text-[11px] font-medium rounded-full border ${row.status === 'inactive'
                    ? 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                    : 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                    }`}>
                    {(row.status || 'active').charAt(0).toUpperCase() + (row.status || 'active').slice(1)}
                </span>
            )
        },
        {
            label: "Actions",
            render: (_, row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleStatusToggle(row)}
                        className={`p-1.5 rounded-lg transition-all ${row.status === 'inactive'
                            ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                            : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                            }`}
                        title={row.status === 'inactive' ? "Activate" : "Deactivate"}
                    >
                        <div className={`w-3 h-3 rounded-full ${row.status === 'inactive' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                    </button>
                    <button
                        onClick={() => handleViewSubmissions(row)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="View Students"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => handleEditClick(row)}
                        className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/20"
                        title="Edit"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => handleDeleteClick(row.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            )
        }
    ];

    const getSubmissionColumns = () => [
        {
            key: "student_name",
            label: "Student Name",
            render: (value, row) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 dark:text-white">{value || 'N/A'}</span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">{row?.student_id || ''}</span>
                </div>
            )
        },
        {
            label: "Class Name",
            render: () => <span className="font-medium opacity-60">{selectedAssignment?.class_name || "N/A"}</span>
        },
        {
            label: "Submitted",
            render: (_, row) => {
                if (!row) return "N/A";
                return row.submission_date ? new Date(row.submission_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "N/A";
            }
        },
        {
            label: "Submission File",
            render: (_, row) => {
                if (!row) return "No File";
                return row.file_url ? (
                    <button
                        onClick={() => handleOpenFile(row.file_url)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 underline text-sm"
                    >
                        {row.file_url.match(/\.(mp4|webm|mov|avi)$/i) ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                        )}
                        {row.file_url.match(/\.(mp4|webm|mov|avi)$/i) ? 'View / Download Video' : 'Listen / Download Audio'}
                    </button>
                ) : "No File";
            }
        },
        {
            label: "Grade",
            render: (_, row) => {
                if (!row) return <span className="text-gray-400 italic">Pending</span>;
                return row.status === 'graded' ? (
                    <span className="font-bold text-green-600">{row.score} / {selectedAssignment?.total_points}</span>
                ) : (
                    <span className="text-gray-400 italic">Pending</span>
                );
            }
        },
        {
            label: "Status",
            render: (_, row) => {
                if (!row) return <span className="text-gray-400 italic">Unknown</span>;
                return (
                    <span className={`px-2.5 py-1 text-[11px] font-medium rounded-full border ${row.status === 'graded'
                        ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                        : 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
                        }`}>
                        {(row.status || 'pending').charAt(0).toUpperCase() + (row.status || 'pending').slice(1)}
                    </span>
                );
            }
        },
        {
            label: "Actions",
            render: (_, row) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handleGradeClick(row)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="View & Grade"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => handleReopenSubmission(row)}
                        className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 transition-colors p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20"
                        title="Reopen for resubmission"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 005.582 9m0 0H9m11 11v-5h-.581m0 0A8.003 8.003 0 016.228 15M15 15h-4v-4" />
                        </svg>
                    </button>
                </div>
            )
        }
    ];

    const renderContent = () => {
        if (view === 'submissions') {
            return (
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setView('list')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight leading-tight">
                                    Submissions: {selectedAssignment?.title}
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider font-semibold">
                                    {selectedAssignment?.class_name || "General Class"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <DataTable
                        columns={getSubmissionColumns()}
                        data={submissions || []}
                        isLoading={isLoadingSubmissions}
                        title="Student Submissions"
                    />
                </div>
            )
        }

        if (view === 'grading') {
            return (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setView("submissions")}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold">Grade Submission</h1>
                            <p className="text-sm opacity-60 font-normal">{gradingSubmission?.student_name} — {selectedAssignment?.title}</p>
                        </div>
                    </div>

                    {/* Single Column Layout */}
                    <div className="space-y-8">
                        {/* Reading Passage */}
                        <div className={`p-8 rounded-2xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
                            <span className="text-xs font-semibold uppercase tracking-wider text-blue-500 mb-4 block">Reading Passage</span>
                            <div className={`text-lg leading-relaxed whitespace-pre-wrap font-normal ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                {selectedAssignment?.description}
                            </div>
                        </div>

                        {/* Student Audio/Video Playback */}
                        <div className={`p-8 rounded-2xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-6 block">Student Submission</span>
                            {gradingSubmission.file_url ? (
                                <div className="space-y-6">
                                    <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'} flex flex-col items-center gap-4`}>
                                        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                                            {isLoadingAudio ? (
                                                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            ) : gradingSubmission.file_url.match(/\.(mp4|webm|mov|avi)$/i) ? (
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                            ) : (
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            )}
                                        </div>
                                        {gradingAudioUrl ? (
                                            gradingSubmission.file_url.match(/\.(mp4|webm|mov|avi)$/i) ? (
                                                <video
                                                    controls
                                                    autoPlay={false}
                                                    className="w-full rounded-lg"
                                                    src={gradingAudioUrl}
                                                />
                                            ) : (
                                                <audio
                                                    controls
                                                    autoPlay={false}
                                                    className="w-full"
                                                    src={gradingAudioUrl}
                                                />
                                            )
                                        ) : (
                                            <p className="text-sm opacity-50 italic">Loading media player...</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleDownloadFile(gradingSubmission.file_url)}
                                        className="flex items-center gap-2 text-sm text-blue-600 hover:underline font-normal"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                        Download {gradingSubmission.file_url.match(/\.(mp4|webm|mov|avi)$/i) ? 'Video' : 'Audio'} for Offline Review
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-12 opacity-50">
                                    {(() => {
                                        const mediaMeta = getSubmissionMediaMeta(gradingSubmission);
                                        return (
                                            <>
                                                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                                <p className="italic">
                                                    {mediaMeta.kind
                                                        ? `Student submitted a ${mediaMeta.kind} file${mediaMeta.name ? ` (${mediaMeta.name})` : ""}, but the media link was not saved.`
                                                        : "No file submitted."}
                                                </p>
                                            </>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>

                        {/* Grading Form */}
                        <form onSubmit={handleGradeSubmit} className={`p-8 rounded-2xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                            <h3 className="text-lg font-bold mb-6">Evaluation</h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2 opacity-70">Score (Max: {selectedAssignment?.total_points} points)</label>
                                    <input
                                        type="number"
                                        max={selectedAssignment?.total_points}
                                        value={gradeData.score}
                                        onChange={(e) => setGradeData({ ...gradeData, score: e.target.value })}
                                        placeholder="Enter mark"
                                        className={`w-full p-4 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-xl font-bold ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 opacity-70">Feedback & Remarks</label>
                                    <textarea
                                        rows={8}
                                        value={gradeData.feedback}
                                        onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                                        placeholder="Great pronunciation, try to focus more on..."
                                        className={`w-full p-4 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none font-normal ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                                    />
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="w-full py-4 rounded-xl bg-[#010080] hover:bg-blue-800 text-white font-bold shadow-lg shadow-blue-900/20 transition-all active:scale-95 text-lg"
                                    >
                                        Submit Grade
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )
        }

        return (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight leading-tight">{title}</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2 md:line-clamp-none">{description}</p>
                    </div>
                    <button
                        onClick={handleAddClick}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#010080] text-white rounded-xl font-semibold hover:bg-blue-800 shadow-lg shadow-blue-900/20 transition-all active:scale-95 text-sm md:text-base"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Add New {title}</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {assignments?.map((assignment) => {
                        const windowStatus = getAssignmentWindowStatus(assignment, now);
                        const submissionsDisabled = !canOpenAssignmentWindow(windowStatus);

                        return (
                        <div
                            key={assignment.id}
                            className={`group p-6 rounded-2xl border shadow-sm transition-all duration-300 flex flex-col justify-between ${
                                submissionsDisabled ? 'opacity-80' : 'hover:shadow-xl hover:border-blue-200'
                            } ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                    </div>
                                    <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full border ${getWindowStatusBadgeClass(windowStatus)}`}>
                                        {getWindowStatusLabel(windowStatus)}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold mb-1 truncate">{assignment.title}</h3>
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-4 uppercase tracking-wider">
                                    {assignment.class_name || "General Class"}
                                </p>

                                {/* Program | Subprogram (Parallel) */}
                                <div className="grid grid-cols-2 gap-4 mb-3 pb-3 border-b border-gray-100 dark:border-gray-700/50">
                                    <div className="flex flex-col min-w-0">
                                        <span className={`text-[10px] uppercase font-bold opacity-60 mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Program</span>
                                        <span className={`text-sm font-semibold truncate ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {assignment.program_name || "N/A"}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end text-right min-w-0">
                                        <span className={`text-[10px] uppercase font-bold opacity-60 mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Subprogram</span>
                                        <span className={`text-sm font-semibold truncate w-full ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {assignment.subprogram_name || "N/A"}
                                        </span>
                                    </div>
                                </div>

                                {/* Start Date | Due Date (Parallel) */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="flex flex-col items-start text-left">
                                        <span className={`text-[10px] uppercase font-bold opacity-60 mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Start Date</span>
                                        <span className={`text-xs font-medium ${assignment.start_date ? (isDark ? 'text-gray-300' : 'text-gray-600') : 'text-gray-400 italic'}`}>
                                            {assignment.start_date ? new Date(assignment.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not set'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end text-right">
                                        <span className={`text-[10px] uppercase font-bold opacity-60 mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Due Date</span>
                                        <span className={`text-xs font-semibold ${assignment.due_date || assignment.end_date ? (isDark ? 'text-gray-200' : 'text-gray-700') : 'text-gray-400 italic font-normal'}`}>
                                            {(assignment.due_date || assignment.end_date)
                                                ? new Date(assignment.due_date || assignment.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                                : 'Not set'}
                                        </span>
                                    </div>
                                </div>

                                {/* Total Points */}
                                <div className="mb-4 flex justify-between items-center opacity-70">
                                    <span className="text-xs font-bold uppercase">Total Points</span>
                                    <span className="text-sm font-bold">{assignment.total_points} Points</span>
                                </div>

                                {windowStatus === "pending" && assignment.start_date && (
                                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                        Opens in {formatAssignmentCountdown(assignment.start_date, now)}
                                    </p>
                                )}
                                {windowStatus === "active" && assignment.due_date && (
                                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                                        Completes in {formatAssignmentCountdown(assignment.due_date, now)}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleViewSubmissions(assignment)}
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
                                        onClick={() => handleEditClick(assignment)}
                                        className={`p-3 rounded-xl border transition-all hover:bg-gray-100 dark:hover:bg-gray-700 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                                        title="Edit"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(assignment.id)}
                                        className={`p-3 rounded-xl border border-rose-100 text-rose-500 transition-all hover:bg-rose-50 ${isDark ? 'border-rose-900/30 dark:bg-rose-900/10' : ''}`}
                                        title="Delete"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );})}

                    {assignments?.length === 0 && !isLoading && (
                        <div className="col-span-full py-20 text-center opacity-40">
                            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0l-8 8-8-8" /></svg>
                            <p className="text-lg">No oral assignments found for your classes.</p>
                        </div>
                    )}
                </div>
            </div>
        )
    };

    return (
        <div className={`min-h-screen transition-colors ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
            <main className="flex-1 overflow-y-auto p-4 lg:p-10 bg-gray-100 dark:bg-gray-900 transition-colors">
                <div className="max-w-[1600px] mx-auto">
                    {renderContent()}
                </div>
                {/* Modal for adding/editing */}
                {isAdding && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <div className={`relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl shadow-2xl overflow-hidden border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                            <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50/50 border-gray-200'}`}>
                                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                    {editingAssignment ? `Update ${title}` : `Create New ${title}`}
                                </h2>
                                <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
                                <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
                                    {/* Program */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5 opacity-80">Program</label>
                                        <select
                                            required
                                            value={formData.program_id}
                                            onChange={(e) => setFormData({ ...formData, program_id: e.target.value, subprogram_id: "", class_id: "" })}
                                            className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`}
                                        >
                                            <option value="">Select Program</option>
                                            {uniquePrograms.map(p => (
                                                <option key={p.id} value={p.id}>{p.title}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Subprogram */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5 opacity-80">Subprogram</label>
                                        <select
                                            required
                                            value={formData.subprogram_id}
                                            onChange={(e) => setFormData({ ...formData, subprogram_id: e.target.value, class_id: "" })}
                                            disabled={!formData.program_id}
                                            className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`}
                                        >
                                            <option value="">Select Subprogram</option>
                                            {filteredSubprograms.map(sp => (
                                                <option key={sp.id} value={sp.id}>{sp.title}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Class */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5 opacity-80">Class</label>
                                        <select
                                            required
                                            value={formData.class_id}
                                            onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                                            disabled={!formData.subprogram_id}
                                            className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`}
                                        >
                                            <option value="">Select Class</option>
                                            {filteredClasses.map(c => (
                                                <option key={c.id} value={c.id}>{c.class_name || c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Submission Type */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5 opacity-80">Student Upload Type</label>
                                        <select
                                            value={formData.submission_type}
                                            onChange={(e) => setFormData({ ...formData, submission_type: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`}
                                        >
                                            <option value="audio">Audio Only</option>
                                            <option value="video">Video Only</option>
                                            <option value="image">Image Only</option>
                                            <option value="both">Both (Audio or Video)</option>
                                            <option value="all">Audio, Video & Image</option>
                                        </select>
                                    </div>

                                    {/* Assignment Title & Points */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5 opacity-80">Assignment Title</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5 opacity-80">Total Points</label>
                                            <input
                                                type="number"
                                                required
                                                value={formData.total_points}
                                                onChange={(e) => setFormData({ ...formData, total_points: Number(e.target.value) || 0 })}
                                                className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`}
                                            />
                                        </div>
                                    </div>

                                    {/* Passage / Text */}
                                    <div>
                                        <label className="block text-sm font-bold mb-1.5 text-blue-600 dark:text-blue-400">
                                            Reading Passage / Text
                                        </label>
                                        <p className="text-xs mb-2 opacity-60">Enter the text or passage the student needs to read/respond to.</p>
                                        <textarea
                                            rows={6}
                                            required
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Enter the passage here..."
                                            className={`w-full px-3 py-2 rounded-lg border outline-none transition-all resize-none ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`}
                                        />
                                    </div>

                                    {/* Duration & Dates */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5 opacity-80">Recording Duration (Minutes)</label>
                                            <input
                                                type="number"
                                                placeholder="Optional"
                                                value={formData.duration}
                                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5 opacity-80">Start Date & Time</label>
                                            <input
                                                type="datetime-local"
                                                value={formData.start_date}
                                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5 opacity-80">Due Date & Time</label>
                                            <input
                                                type="datetime-local"
                                                required
                                                value={formData.due_date}
                                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                                className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`}
                                            />
                                        </div>
                                    </div>



                                    {/* Status */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5 opacity-80">Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`}
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                                <div className={`p-6 border-t flex justify-end gap-3 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50/50 border-gray-200'}`}>
                                    <button
                                        type="button"
                                        onClick={() => setIsAdding(false)}
                                        className={`px-5 py-2.5 rounded-lg font-normal border ${isDark ? 'text-gray-300 border-gray-600 bg-gray-700' : 'text-gray-700 border-gray-300 bg-white'}`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 rounded-lg bg-[#010080] text-white font-normal border border-[#010080]"
                                    >
                                        {editingAssignment ? 'Update Assignment' : 'Create Assignment'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
                        <div className={`relative w-full max-w-sm rounded-xl shadow-2xl p-6 ${isDark ? 'bg-gray-800 border-[0.5px] border-gray-700' : 'bg-white'}`}>
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </div>
                                <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Delete Assignment?</h3>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Are you sure you want to delete this assignment? This action cannot be undone.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowDeleteModal(false)} className={`flex-1 py-2.5 rounded-lg font-semibold ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>Cancel</button>
                                <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-lg font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30">Delete</button>
                            </div>
                        </div>
                    </div>
                )}

                {showReopenModal && (
                    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowReopenModal(false); setReopenTarget(null); }} />
                        <div className={`relative w-full max-w-md rounded-xl shadow-2xl p-6 ${isDark ? 'bg-gray-800 border-[0.5px] border-gray-700' : 'bg-white'}`}>
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 005.582 9m0 0H9m11 11v-5h-.581m0 0A8.003 8.003 0 016.228 15M15 15h-4v-4" /></svg>
                                </div>
                                <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Reopen Submission?</h3>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Reopen submission for <span className="font-semibold">{reopenTarget?.student_name || "this student"}</span>? This will clear the current submitted file/content so the student can submit again.
                                </p>
                                <div className={`mt-4 rounded-lg border p-3 text-left ${isDark ? 'bg-gray-900/50 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold mb-1">Start Date & Time</label>
                                            <input
                                                type="datetime-local"
                                                value={reopenFormData.start_date}
                                                onChange={(e) => setReopenFormData((prev) => ({ ...prev, start_date: e.target.value }))}
                                                className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold mb-1">End Date & Time</label>
                                            <input
                                                type="datetime-local"
                                                value={reopenFormData.end_date}
                                                onChange={(e) => setReopenFormData((prev) => ({ ...prev, end_date: e.target.value }))}
                                                className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setShowReopenModal(false); setReopenTarget(null); setReopenFormData({ start_date: "", end_date: "" }); }}
                                    className={`flex-1 py-2.5 rounded-lg font-semibold ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmReopenSubmission}
                                    className="flex-1 py-2.5 rounded-lg font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/30"
                                >
                                    Reopen
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
