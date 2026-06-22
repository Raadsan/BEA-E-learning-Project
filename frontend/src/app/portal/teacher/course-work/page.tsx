"use client";

import { useState, useMemo } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useToast } from "@/components/Toast";
import {
    useGetAssignmentsQuery,
    useGetAssignmentSubmissionsQuery,
    useGradeSubmissionMutation,
    useCreateAssignmentMutation,
    useUpdateAssignmentMutation,
    useDeleteAssignmentMutation
} from "@/lib/api/assignmentApi";
import { useGetCurrentUserQuery } from "@/lib/api/authApi";
import { useGetTeacherClassesQuery } from "@/lib/api/teacherApi";
import { resolveSubmissionFileUrl } from "@/constants";

import DataTable from "@/components/DataTable";
import { useAssignmentNow } from "@/hooks/useAssignmentNow";
import {
    getAssignmentWindowStatus,
    getWindowStatusLabel,
    getWindowStatusBadgeClass,
    canOpenAssignmentWindow,
    formatAssignmentCountdown,
} from "@/utils/assignmentTime";

export default function CourseWorkPage() {
    const { isDark } = useDarkMode();
    const { showToast } = useToast();
    const now = useAssignmentNow();

    const [selectedClassId, setSelectedClassId] = useState("");
    const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
    const [gradingSubmission, setGradingSubmission] = useState(null);
    const [gradeData, setGradeData] = useState({ score: "", feedback: "" });
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [view, setView] = useState("list");
    const [editingAssignment, setEditingAssignment] = useState(null);
    const [createFormData, setCreateFormData] = useState({
        title: "",
        description: "",
        program_id: "",
        subprogram_id: "",
        class_id: "",
        unit: "",
        start_date: "",
        due_date: "",
        status: "active",
        total_points: "100" // Default marks
    });
    const [isEditing, setIsEditing] = useState(false);

    // Queries
    const { data: currentUser } = useGetCurrentUserQuery();
    const { data: classes, isLoading: isLoadingClasses } = useGetTeacherClassesQuery();

    // Derived Data for Cascading Dropdowns (subprogram → class)
    const teacherSubprograms = useMemo(() => {
        if (!classes) return [];
        const subprograms = new Map();
        classes.forEach(c => {
            const spId = c.subprogram_id || c.subprograms?.id;
            const spName = c.subprogram_name || c.subprograms?.subprogram_name;
            if (spId && spName) subprograms.set(spId, { id: spId, title: spName });
        });
        return Array.from(subprograms.values());
    }, [classes]);

    const formClasses = useMemo(() => {
        if (!classes || !createFormData.subprogram_id) return [];
        return classes.filter(c => {
            const spId = c.subprogram_id || c.subprograms?.id;
            return spId == createFormData.subprogram_id;
        });
    }, [classes, createFormData.subprogram_id]);

    const { data: assignments, isLoading: isLoadingAssignments, refetch: refetchAssignments } = useGetAssignmentsQuery({
        type: 'course_work',
        class_id: selectedClassId || undefined,
        created_by: currentUser?.id
    }, { skip: !currentUser?.id });

    const selectedAssignment = assignments?.find(a => a.id == selectedAssignmentId);

    const { data: submissions, isLoading: isLoadingSubmissions } = useGetAssignmentSubmissionsQuery({
        id: selectedAssignmentId,
        type: 'course_work'
    }, { skip: !selectedAssignmentId });

    // Mutations
    const [gradeSubmission] = useGradeSubmissionMutation();
    const [createAssignment, { isLoading: isCreating }] = useCreateAssignmentMutation();
    const [updateAssignment, { isLoading: isUpdating }] = useUpdateAssignmentMutation();
    const [deleteAssignment] = useDeleteAssignmentMutation();

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteAssignment({ id: deleteId, type: 'course_work' }).unwrap();
            showToast("Course work deleted successfully", "success");
            setShowDeleteModal(false);
            setDeleteId(null);
            if (selectedAssignmentId === String(deleteId)) setSelectedAssignmentId("");
            refetchAssignments();
        } catch (err) {
            showToast("Failed to delete course work", "error");
        }
    };

    const handleCreateDataChange = (e) => {
        const { name, value } = e.target;
        setCreateFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'subprogram_id') {
            setCreateFormData(prev => ({ ...prev, subprogram_id: value, class_id: "", program_id: "" }));
        } else if (name === 'class_id') {
            const classInfo = classes?.find(c => c.id == value);
            const programId = classInfo?.program_id || classInfo?.subprograms?.program_id || "";
            setCreateFormData(prev => ({ ...prev, class_id: value, program_id: String(programId) }));
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
            unit: "",
            start_date: "",
            due_date: "",
            status: "active",
            total_points: "100"
        });
        setIsCreateModalOpen(true);
    };

    const handleEditClick = (assignment) => {
        if (!assignment) return;
        setEditingAssignment(assignment);
        setSelectedAssignmentId(String(assignment.id));

        const classInfo = classes?.find(c => c.id == assignment.class_id);
        const spId = classInfo?.subprogram_id || classInfo?.subprograms?.id || assignment.subprogram_id || "";
        const programId = classInfo?.program_id || classInfo?.subprograms?.program_id || "";

        setCreateFormData({
            title: assignment.title,
            description: assignment.description || "",
            program_id: programId ? String(programId) : "",
            subprogram_id: spId ? String(spId) : "",
            class_id: assignment.class_id,
            unit: assignment.unit || "",
            start_date: assignment.start_date ? new Date(assignment.start_date).toISOString().slice(0, 16) : "",
            due_date: assignment.due_date ? new Date(assignment.due_date).toISOString().slice(0, 16) : "",
            status: assignment.status || "active",
            total_points: assignment.total_points || "100"
        });
        setIsEditing(true);
        setIsCreateModalOpen(true);
    };

    const handleViewSubmissions = (assignment) => {
        const windowStatus = getAssignmentWindowStatus(assignment, now);
        if (!canOpenAssignmentWindow(windowStatus)) {
            showToast("This coursework is pending. Submissions open when the start time is reached.", "info");
            return;
        }
        setSelectedAssignmentId(String(assignment.id));
        setView("submissions");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!createFormData.subprogram_id) {
            showToast("Please select a subprogram", "error");
            return;
        }
        if (!createFormData.class_id) {
            showToast("Please select a class", "error");
            return;
        }

        const classInfo = classes?.find(c => c.id == createFormData.class_id);
        const payload = {
            ...createFormData,
            program_id: classInfo?.program_id || classInfo?.subprograms?.program_id || createFormData.program_id,
        };

        try {
            if (isEditing && editingAssignment) {
                await updateAssignment({
                    id: editingAssignment.id,
                    ...payload,
                    type: 'course_work'
                }).unwrap();
                showToast("Course work updated successfully!", "success");
            } else {
                await createAssignment({
                    ...payload,
                    type: 'course_work',
                    questions: [],
                    submission_format: 'text'
                }).unwrap();
                showToast("Course work created successfully!", "success");
            }

            setIsCreateModalOpen(false);
            setEditingAssignment(null);
            setCreateFormData({
                title: "",
                description: "",
                program_id: "",
                subprogram_id: "",
                class_id: "",
                unit: "",
                start_date: "",
                due_date: "",
                status: "active",
                total_points: "100"
            });
            setIsEditing(false);
            refetchAssignments();
        } catch (err) {
            showToast(err.data?.error || `Failed to ${isEditing ? 'update' : 'create'} course work`, "error");
        }
    };

    const handleGradeClick = (submission) => {
        setGradingSubmission(submission);
        setGradeData({
            score: submission.score !== null && submission.score !== undefined ? String(submission.score) : "",
            feedback: submission.feedback || ""
        });
        setView("grading");
    };

    const handleGradeSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('score', gradeData.score);
            formData.append('feedback', gradeData.feedback);
            formData.append('type', 'course_work');

            await gradeSubmission({
                id: gradingSubmission.id,
                formData: formData
            }).unwrap();
            showToast("Submission graded successfully!", "success");
            setGradingSubmission(null);
            setView("submissions");
        } catch (err) {
            showToast("Failed to grade submission", "error");
        }
    };

    const renderSubmissionContent = () => {
        if (!gradingSubmission) return null;
        if (gradingSubmission.file_url) {
            return (
                <div className="space-y-4">
                    <a
                        href={resolveSubmissionFileUrl(gradingSubmission.file_url) || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 px-4 py-3 rounded-lg border bg-white dark:bg-gray-900 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-gray-900 dark:text-white">View Submitted File</p>
                            <p className="text-xs text-gray-500">Click to open or download</p>
                        </div>
                    </a>
                    {gradingSubmission.content && gradingSubmission.content !== "File submission" && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs font-bold uppercase opacity-50 mb-2">Additional Note:</p>
                            <p>{gradingSubmission.content}</p>
                        </div>
                    )}
                </div>
            );
        }
        if (gradingSubmission.content) {
            if (typeof gradingSubmission.content === 'string' && gradingSubmission.content.startsWith('{')) {
                return (
                    <div className="space-y-4">
                        {Object.entries(JSON.parse(gradingSubmission.content)).map(([key, val], idx) => (
                            <div key={idx} className="flex gap-4 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                                <span className="opacity-40 font-bold">{parseInt(key) + 1}.</span>
                                <span>{val as string}</span>
                            </div>
                        ))}
                    </div>
                );
            }
            return gradingSubmission.content;
        }
        return "No content provided.";
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
            key: "id",
            label: "Actions",
            render: (_, row) => (
                <button
                    onClick={() => handleGradeClick(row)}
                    className="px-4 py-2 bg-[#010080] text-white font-bold rounded-lg text-xs hover:bg-blue-800 transition-all active:scale-95 shadow-sm"
                >
                    Grade Now
                </button>
            ),
        },
    ];

    if (view === "submissions") {
        return (
            <div className="space-y-6 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setView("list")}
                        className={`p-2 rounded-lg border transition-all ${isDark ? "bg-gray-800 border-gray-700 hover:bg-gray-700 text-white" : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"}`}
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
        );
    }

    if (view === "grading" && gradingSubmission) {
        return (
            <div className="space-y-8 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setView("submissions")}
                        className={`p-2 rounded-lg border transition-all ${isDark ? "bg-gray-800 border-gray-700 hover:bg-gray-700 text-white" : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Grade Student Submission</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{gradingSubmission.student_name} — {selectedAssignment?.title}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-6">
                        <div className={`p-4 rounded-xl border text-sm ${isDark ? "bg-gray-800/60 border-gray-700" : "bg-blue-50/50 border-blue-100"}`}>
                            <div className="flex flex-wrap gap-4">
                                <div>
                                    <span className="text-xs font-bold uppercase text-gray-500">Submitted At</span>
                                    <p className="font-semibold">{gradingSubmission.submission_date ? new Date(gradingSubmission.submission_date).toLocaleString() : "N/A"}</p>
                                </div>
                            </div>
                        </div>
                        <div className={`p-6 rounded-xl border shadow-sm ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                            <h2 className="text-lg font-bold mb-4">Submitted Course Work</h2>
                            <div className={`p-6 rounded-lg border leading-relaxed overflow-auto whitespace-pre-wrap ${isDark ? "bg-gray-900 border-gray-700 text-gray-300" : "bg-gray-50 border-gray-200 text-gray-700"}`} style={{ minHeight: "300px" }}>
                                {renderSubmissionContent()}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        <div className={`p-6 rounded-xl border shadow-sm ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                            <h2 className="text-lg font-bold mb-4">Grading & Feedback</h2>
                            <form onSubmit={handleGradeSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Score</label>
                                    <input
                                        type="number"
                                        required
                                        value={gradeData.score}
                                        onChange={(e) => setGradeData({ ...gradeData, score: e.target.value })}
                                        className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                                        placeholder={`Marks out of ${selectedAssignment?.total_points || 100}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Feedback (Optional)</label>
                                    <textarea
                                        rows={4}
                                        value={gradeData.feedback}
                                        onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                                        className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                                        placeholder="Enter constructive feedback..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-3 bg-[#010080] hover:bg-blue-800 text-white font-bold rounded-xl transition-all active:scale-95 shadow-md shadow-blue-900/10"
                                >
                                    Grade Submission
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold uppercase tracking-tight text-gray-900 dark:text-white">Course Work</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and grade coursework assigned to your students.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        className={`px-4 py-2.5 rounded-xl border outline-none font-bold text-xs uppercase transition-all ${
                            isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-700"
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
                        <span>Add Course Work</span>
                    </button>
                </div>
            </div>

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
                                    submissionsDisabled ? "opacity-80" : "hover:shadow-xl hover:border-blue-200"
                                } ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? "bg-blue-900/20 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                        </div>
                                        <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full border ${getWindowStatusBadgeClass(windowStatus)}`}>
                                            {getWindowStatusLabel(windowStatus)}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold mb-1 truncate">{assignment.title}</h3>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-4 uppercase tracking-wider">
                                        {assignment.class_name || "General Class"}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 mb-3 pb-3 border-b border-gray-100 dark:border-gray-700/50">
                                        <div className="flex flex-col min-w-0">
                                            <span className={`text-[10px] uppercase font-bold opacity-60 mb-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Program</span>
                                            <span className={`text-sm font-semibold truncate ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                                {assignment.program_name || "N/A"}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end text-right min-w-0">
                                            <span className={`text-[10px] uppercase font-bold opacity-60 mb-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Subprogram</span>
                                            <span className={`text-sm font-semibold truncate w-full ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                                {assignment.subprogram_name || "N/A"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="flex flex-col items-start text-left">
                                            <span className={`text-[10px] uppercase font-bold opacity-60 mb-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Start Date</span>
                                            <span className={`text-xs font-medium ${assignment.start_date ? (isDark ? "text-gray-300" : "text-gray-600") : "text-gray-400 italic"}`}>
                                                {assignment.start_date ? new Date(assignment.start_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Not set"}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end text-right">
                                            <span className={`text-[10px] uppercase font-bold opacity-60 mb-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Due Date</span>
                                            <span className={`text-xs font-semibold ${assignment.due_date ? (isDark ? "text-gray-200" : "text-gray-700") : "text-gray-400 italic font-normal"}`}>
                                                {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Not set"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mb-4 space-y-2 opacity-70">
                                        <div className="flex justify-between text-xs">
                                            <span>Unit:</span>
                                            <span className="font-bold">{assignment.unit || "N/A"}</span>
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
                                                ? "bg-gray-400 text-white cursor-not-allowed opacity-70"
                                                : "bg-[#010080] hover:bg-blue-800 text-white"
                                        }`}
                                    >
                                        {windowStatus === "pending" ? "Not Open Yet" : "View Submissions"}
                                    </button>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleEditClick(assignment)}
                                            className={`p-3 rounded-xl border transition-all hover:bg-gray-100 dark:hover:bg-gray-700 ${isDark ? "border-gray-700" : "border-gray-200"}`}
                                            title="Edit"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(assignment.id)}
                                            className="p-3 rounded-xl border border-rose-100 text-rose-500 transition-all hover:bg-rose-50 dark:border-rose-900/30 dark:bg-rose-900/10"
                                            title="Delete"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {assignments?.length === 0 && (
                        <div className="col-span-full py-20 text-center opacity-40">
                            No course work found for this class. Click &quot;Add Course Work&quot; to create one.
                        </div>
                    )}
                </div>
            )}

            {/* Create / Edit Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                    <div className={`relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl shadow-2xl overflow-hidden border ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-100 text-gray-900"}`}>
                        <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? "bg-gray-800/50 border-gray-700" : "bg-gray-50/50 border-gray-200"}`}>
                            <h2 className="text-xl font-bold">
                                {isEditing ? "Edit Course Work" : "Create New Course Work"}
                            </h2>
                            <button
                                onClick={() => {
                                    setIsCreateModalOpen(false);
                                    setEditingAssignment(null);
                                    setIsEditing(false);
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
                            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">

                                {/* Subprogram & Class Selection */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5 opacity-80">Subprogram</label>
                                        <select
                                            name="subprogram_id"
                                            value={createFormData.subprogram_id}
                                            onChange={handleCreateDataChange}
                                            className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`}
                                        >
                                            <option value="">Select Subprogram</option>
                                            {teacherSubprograms.map(sp => (
                                                <option key={sp.id} value={sp.id}>{sp.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5 opacity-80">Class</label>
                                        <select
                                            name="class_id"
                                            value={createFormData.class_id}
                                            onChange={handleCreateDataChange}
                                            disabled={!createFormData.subprogram_id}
                                            className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'} ${!createFormData.subprogram_id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <option value="">Select Class</option>
                                            {formClasses.map(c => (
                                                <option key={c.id} value={c.id}>{c.class_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Unit */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-1.5 opacity-80">Unit</label>
                                        <input
                                            type="text"
                                            name="unit"
                                            value={createFormData.unit}
                                            onChange={handleCreateDataChange}
                                            placeholder="e.g. Unit 1"
                                            className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`}
                                        />
                                    </div>
                                </div>

                                {/* Title & Marks */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5 opacity-80">Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={createFormData.title}
                                            onChange={handleCreateDataChange}
                                            placeholder="e.g. Unit 3 Course Work"
                                            className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5 opacity-80">Total Marks</label>
                                        <input
                                            type="number"
                                            name="total_points"
                                            value={createFormData.total_points}
                                            onChange={handleCreateDataChange}
                                            className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`}
                                            required
                                        />
                                    </div>
                                </div>

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

                            <div className={`px-6 py-4 border-t flex justify-end gap-3 ${isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50/50"}`}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCreateModalOpen(false);
                                        setEditingAssignment(null);
                                        setIsEditing(false);
                                    }}
                                    className={`px-4 py-2 rounded-lg font-semibold border transition-all ${isDark ? "border-gray-600 text-gray-400 hover:bg-gray-700" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating || isUpdating}
                                    className="px-6 py-2 rounded-lg bg-[#010080] hover:bg-blue-800 text-white font-semibold transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isCreating ? "Creating..." : isUpdating ? "Updating..." : isEditing ? "Update Course Work" : "Create Course Work"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
                    <div className={`relative w-full max-w-sm rounded-2xl shadow-2xl p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center">
                                <svg className="w-7 h-7 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <div>
                                <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Delete Course Work?</h3>
                                <p className="text-sm text-gray-500">This will permanently delete this course work and all its student submissions. This action cannot be undone.</p>
                            </div>
                            <div className="flex gap-3 w-full mt-2">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className={`flex-1 py-2.5 rounded-xl border font-semibold transition-all ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all active:scale-95"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
