"use client";

import { useState, useEffect, useMemo } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";
import {
    useGetAssignmentsQuery,
    useGetAssignmentSubmissionsQuery,
    useGradeSubmissionMutation,
    useCreateAssignmentMutation,
    useUpdateAssignmentMutation,
    useDeleteAssignmentMutation,
    useReopenSubmissionMutation
} from "@/lib/api/assignmentApi";
import { useGetCurrentUserQuery } from "@/lib/api/authApi";
import { useGetTeacherClassesQuery } from "@/lib/api/teacherApi";
import { DIRECT_API_URL } from "@/constants";
import { openSubmissionFile, downloadSubmissionFile } from "@/utils/submissionFiles";
import { parseWritingTaskRequirements } from "@/utils/writingTaskMeta";

import DataTable from "@/components/DataTable";
import { useAssignmentNow } from "@/hooks/useAssignmentNow";
import {
    getAssignmentWindowStatus,
    getWindowStatusLabel,
    getWindowStatusBadgeClass,
    canOpenAssignmentWindow,
    formatAssignmentCountdown,
} from "@/utils/assignmentTime";
import {
    formatDatetimeLocalValue,
    syncAssignmentSchedule,
    splitDurationMinutes
} from "@/utils/assignmentSchedule";

export default function WritingTasksPage() {
    const router = useRouter();
    const { isDark } = useDarkMode();
    const { showToast } = useToast();
    const now = useAssignmentNow();

    // State
    const [selectedClassId, setSelectedClassId] = useState("");
    const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
    const [gradingSubmission, setGradingSubmission] = useState(null);
    const [gradeData, setGradeData] = useState({ score: "", feedback: "" });
    const [feedbackFile, setFeedbackFile] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createFormData, setCreateFormData] = useState({
        title: "",
        description: "",
        program_id: "",
        subprogram_id: "",
        class_id: "",
        word_count: "",
        requirements: "",
        start_date: "",
        due_date: "",
        duration: "",
        duration_hours: "",
        duration_minutes: "",
        status: "active",
        total_points: "100" // Default marks
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [showReopenModal, setShowReopenModal] = useState(false);
    const [reopenTarget, setReopenTarget] = useState(null);
    const [reopenFormData, setReopenFormData] = useState({ start_date: "", end_date: "" });
    const [attachmentUrl, setAttachmentUrl] = useState("");
    const [attachmentName, setAttachmentName] = useState("");
    const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
    const [view, setView] = useState("list"); // 'list', 'submissions', 'grading'

    // Queries
    const { data: currentUser } = useGetCurrentUserQuery();
    const { data: classes, isLoading: isLoadingClasses } = useGetTeacherClassesQuery();

    // Derived Data for Cascading Dropdowns
    const uniquePrograms = useMemo(() => {
        if (!classes) return [];
        const programs = new Map();
        classes.forEach(c => {
            const pId = c.program_id || c.subprograms?.program_id;
            const pName = c.program_name || c.subprograms?.programs?.title;
            if (pId && pName) {
                programs.set(pId, { id: pId, title: pName });
            }
        });
        return Array.from(programs.values());
    }, [classes]);

    const filteredSubprograms = useMemo(() => {
        if (!classes || !createFormData.program_id) return [];
        const subprograms = new Map();
        classes.forEach(c => {
            const spId = c.subprogram_id || c.subprograms?.id;
            const spName = c.subprogram_name || c.subprograms?.subprogram_name;
            const pId = c.program_id || c.subprograms?.program_id;
            if (pId == createFormData.program_id && spId && spName) {
                subprograms.set(spId, { id: spId, title: spName });
            }
        });
        return Array.from(subprograms.values());
    }, [classes, createFormData.program_id]);

    const filteredClasses = useMemo(() => {
        if (!classes || !createFormData.subprogram_id) return [];
        return classes.filter(c => {
            const spId = c.subprogram_id || c.subprograms?.id;
            return spId == createFormData.subprogram_id;
        });
    }, [classes, createFormData.subprogram_id]);

    const { data: assignments, isLoading: isLoadingAssignments, refetch: refetchAssignments } = useGetAssignmentsQuery({
        type: 'writing_task',
        class_id: selectedClassId || undefined,
        created_by: currentUser?.id
    }, { skip: !currentUser?.id });

    const selectedAssignment = assignments?.find(a => a.id == selectedAssignmentId);

    const { data: submissions, isLoading: isLoadingSubmissions } = useGetAssignmentSubmissionsQuery({
        id: selectedAssignmentId,
        type: 'writing_task'
    }, { skip: !selectedAssignmentId });

    // Mutations
    const [gradeSubmission] = useGradeSubmissionMutation();
    const [createAssignment, { isLoading: isCreating }] = useCreateAssignmentMutation();
    const [updateAssignment, { isLoading: isUpdating }] = useUpdateAssignmentMutation();
    const [deleteAssignment] = useDeleteAssignmentMutation();
    const [reopenSubmission] = useReopenSubmissionMutation();

    const handleCreateDataChange = (e) => {
        const { name, value } = e.target;

        if (["start_date", "due_date", "duration", "duration_hours", "duration_minutes"].includes(name)) {
            setCreateFormData((prev) => syncAssignmentSchedule(prev, name, value, "due_date") as typeof prev);
            return;
        }

        setCreateFormData(prev => ({ ...prev, [name]: value }));

        // Reset dependent fields
        if (name === 'program_id') {
            setCreateFormData(prev => ({ ...prev, program_id: value, subprogram_id: "", class_id: "" }));
        } else if (name === 'subprogram_id') {
            setCreateFormData(prev => ({ ...prev, subprogram_id: value, class_id: "" }));
        }
    };

    const handleOpenCreate = () => {
        setIsEditing(false);
        setEditingAssignment(null);
        setCreateFormData({
            title: "",
            description: "",
            program_id: "",
            subprogram_id: "",
            class_id: "",
            word_count: "",
            requirements: "",
            start_date: "",
            due_date: "",
            duration: "",
            duration_hours: "",
            duration_minutes: "",
            status: "active",
            total_points: "100"
        });
        setAttachmentUrl("");
        setAttachmentName("");
        setIsCreateModalOpen(true);
    };

    const handleEditClick = (assignment) => {
        setIsEditing(true);
        setEditingAssignment(assignment);

        const classInfo = classes?.find(c => c.id == assignment.class_id);
        const requirementsMeta = parseWritingTaskRequirements(
            assignment.requirements,
            assignment.submission_format || assignment.attachment_url
        );

        setCreateFormData({
            title: assignment.title,
            description: assignment.description || "",
            program_id: classInfo?.program_id || assignment.program_id || "",
            subprogram_id: classInfo?.subprogram_id || "",
            class_id: assignment.class_id,
            word_count: assignment.word_count || "",
            requirements: requirementsMeta.text || "",
            start_date: assignment.start_date ? formatDatetimeLocalValue(new Date(assignment.start_date)) : "",
            due_date: assignment.due_date ? formatDatetimeLocalValue(new Date(assignment.due_date)) : "",
            duration: assignment.duration || "",
            duration_hours: String(splitDurationMinutes(assignment.duration).hours),
            duration_minutes: String(splitDurationMinutes(assignment.duration).minutes),
            status: assignment.status || "active",
            total_points: assignment.total_points || "100"
        });
        setAttachmentUrl(requirementsMeta.attachment_url || "");
        setAttachmentName(requirementsMeta.attachment_name || "");
        setIsCreateModalOpen(true);
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteAssignment({ id: deleteId, type: 'writing_task' }).unwrap();
            showToast("Writing Task deleted successfully", "success");
            setShowDeleteModal(false);
            setDeleteId(null);
            refetchAssignments();
        } catch (err) {
            showToast("Failed to delete writing task", "error");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { duration_hours, duration_minutes, ...formRest } = createFormData;
            const payload = {
                ...formRest,
                type: 'writing_task',
                word_count: createFormData.word_count ? parseInt(createFormData.word_count) : null,
                duration: createFormData.duration ? parseInt(createFormData.duration) : null,
                requirements: createFormData.requirements,
                attachment_url: attachmentUrl || null,
                attachment_name: attachmentName || null,
            };

            if (isEditing && editingAssignment) {
                await updateAssignment({ id: editingAssignment.id, ...payload }).unwrap();
                showToast("Writing Task updated successfully!", "success");
            } else {
                await createAssignment(payload).unwrap();
                showToast("Writing Task created successfully!", "success");
            }
            setIsCreateModalOpen(false);
            refetchAssignments();
        } catch (err) {
            showToast(err?.data?.message || "Something went wrong", "error");
        }
    };

    const handleViewSubmissions = (assignment) => {
        const windowStatus = getAssignmentWindowStatus(assignment, now);
        if (!canOpenAssignmentWindow(windowStatus)) {
            showToast("This task is pending. Submissions open when the start time is reached.", "info");
            return;
        }
        setSelectedAssignmentId(assignment.id);
        setView("submissions");
    };

    const handleGradeClick = (submission) => {
        setGradingSubmission(submission);
        setGradeData({
            score: submission.score !== null ? String(submission.score) : "",
            feedback: submission.feedback || ""
        });
        setFeedbackFile(null);
        setView("grading");
    };

    const handleGradeSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('id', gradingSubmission.id);
            formData.append('type', 'writing_task');
            formData.append('score', gradeData.score);
            formData.append('feedback', gradeData.feedback);
            if (feedbackFile) {
                formData.append('feedbackFile', feedbackFile);
            }

            await gradeSubmission({ id: gradingSubmission.id, formData }).unwrap();
            showToast("Submission graded successfully!", "success");
            setGradingSubmission(null);
            setView("submissions");
        } catch (err) {
            showToast(err?.data?.error || "Failed to grade submission", "error");
        }
    };

    const handleOpenSubmissionFile = async (fileUrl) => {
        if (!fileUrl) return;
        try {
            await openSubmissionFile(fileUrl);
        } catch {
            showToast("Could not open this file.", "error");
        }
    };

    const handleDownloadSubmissionFile = async (fileUrl, downloadName) => {
        if (!fileUrl) return;
        try {
            await downloadSubmissionFile(fileUrl, downloadName);
            showToast("Download started", "success");
        } catch {
            showToast("Could not download this file. Ask the student to submit again.", "error");
        }
    };

    const handleAttachmentUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowed = /\.(pdf|doc|docx)$/i.test(file.name);
        if (!allowed) {
            showToast("Please upload a PDF or Word document.", "error");
            return;
        }

        const uploadData = new FormData();
        uploadData.append("file", file);

        try {
            setIsUploadingAttachment(true);
            const token = localStorage.getItem("token");
            const res = await fetch(`${DIRECT_API_URL}/uploads`, {
                method: "POST",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: uploadData,
            });
            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();
            setAttachmentUrl(data.url);
            setAttachmentName(file.name);
            showToast("Attachment uploaded successfully!", "success");
        } catch {
            showToast("Failed to upload attachment.", "error");
        } finally {
            setIsUploadingAttachment(false);
        }
    };

    const handleReopenSubmission = (submission) => {
        setReopenTarget(submission);
        setReopenFormData({
            start_date: selectedAssignment?.start_date ? formatDatetimeLocalValue(new Date(selectedAssignment.start_date)) : "",
            end_date: selectedAssignment?.due_date ? formatDatetimeLocalValue(new Date(selectedAssignment.due_date)) : "",
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
                type: "writing_task",
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

    const getSubmissionTextContent = (submission) => {
        if (!submission?.content) return "";
        try {
            const parsed = JSON.parse(submission.content);
            if (parsed?.reopened_for_resubmission) return "";
        } catch {
            // plain text submission
        }
        return String(submission.content);
    };

    const handleDownloadTextContent = () => {
        const studentName = gradingSubmission?.student_name || "Student";
        const taskTitle = selectedAssignment?.title || "Writing Task";
        const content = getSubmissionTextContent(gradingSubmission) || "No content submitted.";
        const date = gradingSubmission?.submission_date
            ? new Date(gradingSubmission.submission_date).toLocaleString()
            : new Date().toLocaleString();

        const htmlReport = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>${taskTitle}</title></head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px;">
                <h1 style="color: #010080; font-size: 24px;">Writing Task Submission</h1>
                <p><strong>Student Name:</strong> ${studentName}</p>
                <p><strong>Task:</strong> ${taskTitle}</p>
                <p><strong>Submitted:</strong> ${date}</p>
                <hr/>
                <div style="white-space: pre-wrap;">${content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
            </body>
            </html>
        `;
        const blob = new Blob([htmlReport], { type: "application/msword" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${studentName.replace(/\s+/g, "_")}_${taskTitle.replace(/\s+/g, "_")}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast("Download started", "success");
    };

    const renderFileActions = (fileUrl, downloadName) => {
        if (!fileUrl) {
            return <span className="text-xs text-gray-400 italic">No file</span>;
        }

        return (
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => handleOpenSubmissionFile(fileUrl)}
                    className="px-3 py-2 rounded-lg border text-xs font-bold transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                >
                    View
                </button>
                <button
                    type="button"
                    onClick={() => handleDownloadSubmissionFile(fileUrl, downloadName)}
                    className="px-3 py-2 rounded-lg border text-xs font-bold transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                >
                    Download
                </button>
            </div>
        );
    };

    const renderReopenModal = () => {
        if (!showReopenModal) return null;

        return (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowReopenModal(false); setReopenTarget(null); setReopenFormData({ start_date: "", end_date: "" }); }} />
                <div className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                            <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 005.582 9m0 0H9m11 11v-5h-.581m0 0A8.003 8.003 0 016.228 15M15 15h-4v-4" />
                            </svg>
                        </div>
                        <div>
                            <h3 className={`text-lg font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>Reopen Submission?</h3>
                            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                Reopen submission for <span className="font-semibold">{reopenTarget?.student_name || "this student"}</span>? This will clear the current work so the student can submit again.
                            </p>
                        </div>
                        <div className="w-full space-y-3 text-left">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Resubmit From</label>
                                <input
                                    type="datetime-local"
                                    value={reopenFormData.start_date}
                                    onChange={(e) => setReopenFormData((prev) => ({ ...prev, start_date: e.target.value }))}
                                    className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Resubmit Until</label>
                                <input
                                    type="datetime-local"
                                    value={reopenFormData.end_date}
                                    onChange={(e) => setReopenFormData((prev) => ({ ...prev, end_date: e.target.value }))}
                                    className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 w-full">
                            <button
                                type="button"
                                onClick={() => { setShowReopenModal(false); setReopenTarget(null); setReopenFormData({ start_date: "", end_date: "" }); }}
                                className={`flex-1 py-2.5 rounded-lg border font-bold text-sm ${isDark ? "border-gray-600 text-gray-300" : "border-gray-300 text-gray-600"}`}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmReopenSubmission}
                                className="flex-1 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm"
                            >
                                Reopen
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const getSubmissionColumns = () => [
        {
            key: "student_name",
            label: "Student Name",
            render: (value) => (
                <span className="font-semibold text-gray-900 dark:text-white">{value || "Unknown Student"}</span>
            ),
        },
        {
            key: "status",
            label: "Status",
            render: (value) => (
                <span className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-full border ${
                    value === "graded"
                        ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800"
                        : "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800"
                }`}>
                    {value || "pending"}
                </span>
            ),
        },
        {
            key: "score",
            label: "Score",
            render: (value) => {
                const totalPoints = selectedAssignment?.total_points || 100;
                return (
                    <span className="font-semibold text-sm">
                        {value !== null && value !== undefined ? (
                            `${value} / ${totalPoints}`
                        ) : (
                            <span className="text-gray-400 font-normal italic">Ungraded</span>
                        )}
                    </span>
                );
            },
        },
        {
            key: "submission_date",
            label: "Submitted At",
            render: (value) => <span>{value ? new Date(value).toLocaleString() : "N/A"}</span>,
        },
        {
            key: "is_auto_submit",
            label: "How Submitted",
            render: (value) => (
                <span className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-full border ${
                    value
                        ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800"
                        : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800"
                }`}>
                    {value ? "Auto (Time Expired)" : "Manual Submit"}
                </span>
            ),
        },
        {
            key: "id",
            label: "Actions",
            render: (_, row) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleGradeClick(row)}
                        className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs hover:bg-blue-700 transition-all active:scale-95 shadow-sm"
                    >
                        Grade Now
                    </button>
                    <button
                        type="button"
                        onClick={() => handleReopenSubmission(row)}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-amber-200 text-amber-600 hover:text-amber-800 hover:bg-amber-50 dark:border-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/20 transition-colors"
                        title="Reopen for resubmission"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 005.582 9m0 0H9m11 11v-5h-.581m0 0A8.003 8.003 0 016.228 15M15 15h-4v-4" />
                        </svg>
                    </button>
                </div>
            ),
        },
    ];

    if (view === 'submissions') {
        return (
            <>
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
                    searchKey="student_name"
                />
                </div>
                {renderReopenModal()}
            </>
        );
    }

    if (view === 'grading') {
        return (
            <>
            <div className="space-y-8 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setView("submissions")}
                        className={`p-2 rounded-lg border transition-all ${isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-white' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Grade Student Submission</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{gradingSubmission?.student_name} — {selectedAssignment?.title}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Student Submission */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className={`p-4 rounded-xl border text-sm ${isDark ? 'bg-gray-800/60 border-gray-700' : 'bg-blue-50/50 border-blue-100'}`}>
                            <div className="flex flex-wrap gap-4">
                                <div>
                                    <span className="text-xs font-bold uppercase text-gray-500">Submitted At</span>
                                    <p className="font-semibold">{gradingSubmission?.submission_date ? new Date(gradingSubmission.submission_date).toLocaleString() : "N/A"}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-bold uppercase text-gray-500">Submission Type</span>
                                    <p className="font-semibold">{gradingSubmission?.is_auto_submit ? "Auto-submit (time expired)" : "Manual submit"}</p>
                                </div>
                            </div>
                        </div>
                        <div className={`p-6 rounded-xl border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                                <h2 className="text-lg font-bold">Submitted Essay / Writing Content</h2>
                                {gradingSubmission?.file_url ? (
                                    renderFileActions(gradingSubmission.file_url, `${gradingSubmission.student_name || "student"}_writing`)
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleDownloadTextContent}
                                        disabled={!getSubmissionTextContent(gradingSubmission)}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-bold transition-all disabled:opacity-50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Download Writing
                                    </button>
                                )}
                            </div>
                            {gradingSubmission.file_url ? (
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    The student submitted a file. Use View or Download above to open their work.
                                </p>
                            ) : (
                                <div className={`p-6 rounded-lg border leading-relaxed overflow-auto whitespace-pre-wrap ${isDark ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`} style={{ minHeight: '300px' }}>
                                    {getSubmissionTextContent(gradingSubmission) || "No text content submitted."}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Grading Form */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className={`p-6 rounded-xl border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                            <h2 className="text-lg font-bold mb-4">Grading & Feedback</h2>
                            <form onSubmit={handleGradeSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Score</label>
                                    <input
                                        type="number"
                                        required
                                        value={gradeData.score}
                                        onChange={(e) => setGradeData({ ...gradeData, score: e.target.value })}
                                        className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                        placeholder={`Marks out of ${selectedAssignment?.total_points || 100}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Feedback (Optional)</label>
                                    <textarea
                                        rows={4}
                                        value={gradeData.feedback}
                                        onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                                        className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                        placeholder="Enter constructive feedback..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Feedback File (Optional)</label>
                                    <input
                                        type="file"
                                        onChange={(e) => setFeedbackFile(e.target.files[0])}
                                        className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-3 bg-[#010080] hover:bg-blue-800 text-white font-bold rounded-xl transition-all active:scale-95 shadow-md shadow-blue-900/10"
                                >
                                    Grade Submission
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleReopenSubmission(gradingSubmission)}
                                    className="w-full py-3 border border-amber-300 text-amber-700 dark:text-amber-400 dark:border-amber-800 font-bold rounded-xl transition-all hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                >
                                    Reopen for Resubmission
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            {renderReopenModal()}
            </>
        );
    }

    return (
        <div className="space-y-8 p-6 md:p-8">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold uppercase tracking-tight text-gray-900 dark:text-white">Writing Tasks</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and grade descriptive and essays tasks assigned to students.</p>
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
                        onClick={handleOpenCreate}
                        className="px-5 py-2.5 bg-[#010080] hover:bg-blue-800 text-white font-bold rounded-xl text-xs uppercase transition-all shadow-lg shadow-blue-900/10 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        <span>Add Writing Task</span>
                    </button>
                </div>
            </div>

            {/* List cards view */}
            {isLoadingAssignments ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
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

                                {/* Essay specifics */}
                                <div className="mb-4 space-y-2 opacity-70">
                                    <div className="flex justify-between text-xs">
                                        <span>Duration:</span>
                                        <span className="font-bold">{assignment.duration ? `${assignment.duration} min` : "No limit"}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span>Word Count Limit:</span>
                                        <span className="font-bold">{assignment.word_count || "Unlimited"}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span>Points Weight:</span>
                                        <span className="font-bold">{assignment.total_points} Points</span>
                                    </div>
                                </div>

                                {windowStatus === "pending" && assignment.start_date && (
                                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">
                                        Opens in {formatAssignmentCountdown(assignment.start_date, now)}
                                    </p>
                                )}
                                {windowStatus === "active" && assignment.due_date && (
                                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2">
                                        Completes in {formatAssignmentCountdown(assignment.due_date, now)}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
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
                            No writing tasks found for this class. Click "Add Writing Task" to create one.
                        </div>
                    )}
                </div>
            )}

            {/* Create / Edit Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                    <div className={`relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl shadow-2xl overflow-hidden border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-900'}`}>
                        <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50/50 border-gray-200'}`}>
                            <h2 className="text-xl font-bold">
                                {isEditing ? 'Edit Writing Task' : 'Create New Writing Task'}
                            </h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
                            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
                                {/* Program */}
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 opacity-80">Program</label>
                                    <select
                                        required
                                        name="program_id"
                                        value={createFormData.program_id}
                                        onChange={handleCreateDataChange}
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
                                        name="subprogram_id"
                                        value={createFormData.subprogram_id}
                                        onChange={handleCreateDataChange}
                                        disabled={!createFormData.program_id}
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
                                        name="class_id"
                                        value={createFormData.class_id}
                                        onChange={handleCreateDataChange}
                                        disabled={!createFormData.subprogram_id}
                                        className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`}
                                    >
                                        <option value="">Select Class</option>
                                        {filteredClasses.map(c => (
                                            <option key={c.id} value={c.id}>{c.class_name || c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Essay Name & Marks */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5 opacity-80">Essay Name</label>
                                        <input
                                            type="text"
                                            required
                                            name="title"
                                            value={createFormData.title}
                                            onChange={handleCreateDataChange}
                                            className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5 opacity-80">Marks</label>
                                        <input
                                            type="number"
                                            required
                                            name="total_points"
                                            value={createFormData.total_points}
                                            onChange={handleCreateDataChange}
                                            className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`}
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 opacity-80">Description</label>
                                    <textarea
                                        name="description"
                                        value={createFormData.description}
                                        onChange={handleCreateDataChange}
                                        rows={4}
                                        className={`w-full px-3 py-2 rounded-lg border outline-none transition-all resize-none ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`}
                                    />
                                </div>

                                {/* Word Count & Requirements */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5 opacity-80">Word Count Limit</label>
                                        <input
                                            type="number"
                                            name="word_count"
                                            placeholder="e.g. 500"
                                            value={createFormData.word_count}
                                            onChange={handleCreateDataChange}
                                            className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5 opacity-80">Requirements</label>
                                        <input
                                            type="text"
                                            name="requirements"
                                            placeholder="Requirements summary..."
                                            value={createFormData.requirements}
                                            onChange={handleCreateDataChange}
                                            className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1.5 opacity-80">Teacher Attachment (PDF / Word)</label>
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                        onChange={handleAttachmentUpload}
                                        disabled={isUploadingAttachment}
                                        className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                    {attachmentUrl ? (
                                        <div className="mt-2 flex items-center justify-between gap-3 p-3 rounded-lg border text-sm">
                                            <span className="truncate font-medium">{attachmentName || "Attached file"}</span>
                                            <button
                                                type="button"
                                                onClick={() => { setAttachmentUrl(""); setAttachmentName(""); }}
                                                className="text-rose-600 text-xs font-bold"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : null}
                                    <p className="text-xs text-gray-400 mt-1">Students will see and can download this file on the writing task page.</p>
                                </div>

                                {/* Parallel Date Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5 opacity-80">Start Date & Time</label>
                                        <input
                                            type="datetime-local"
                                            name="start_date"
                                            value={createFormData.start_date}
                                            onChange={handleCreateDataChange}
                                            className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5 opacity-80">Due Date & Time</label>
                                        <input
                                            type="datetime-local"
                                            name="due_date"
                                            value={createFormData.due_date}
                                            onChange={handleCreateDataChange}
                                            className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`}
                                        />
                                    </div>
                                </div>

                                {/* Duration */}
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 opacity-80">
                                        Duration (Hours & Minutes)
                                        <span className="text-gray-400 font-normal"> — auto-filled from start/end</span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="number"
                                            name="duration_hours"
                                            placeholder="Hours"
                                            value={createFormData.duration_hours ?? ""}
                                            readOnly
                                            className={`w-full px-3 py-2 rounded-lg border cursor-not-allowed transition-all ${isDark ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-600'}`}
                                        />
                                        <input
                                            type="number"
                                            name="duration_minutes"
                                            placeholder="Minutes"
                                            value={createFormData.duration_minutes ?? ""}
                                            readOnly
                                            className={`w-full px-3 py-2 rounded-lg border cursor-not-allowed transition-all ${isDark ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-600'}`}
                                        />
                                    </div>
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 opacity-80">Status</label>
                                    <select
                                        name="status"
                                        value={createFormData.status}
                                        onChange={handleCreateDataChange}
                                        className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className={`px-6 py-4 border-t flex justify-end gap-3 ${isDark ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50/50'}`}>
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className={`px-4 py-2 rounded-lg font-semibold border transition-all ${isDark ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating || isUpdating}
                                    className="px-6 py-2 rounded-lg bg-[#010080] hover:bg-blue-800 text-white font-semibold shadow-md transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isCreating || isUpdating ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                    <div className={`relative w-full max-w-md p-6 rounded-xl shadow-2xl border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                        <h3 className="text-lg font-bold mb-2">Delete Writing Task</h3>
                        <p className="text-sm opacity-75 mb-6">Are you sure you want to delete this writing task? This action cannot be undone.</p>
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
