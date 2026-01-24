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
    useGradeSubmissionMutation
} from "@/redux/api/assignmentApi";
import { useGetClassesQuery } from "@/redux/api/classApi";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";


export default function AssignmentManager({ type, title, description }) {
    const router = useRouter();
    const { isDark } = useDarkMode();
    const { showToast } = useToast();
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
        description: "",
        class_id: "",
        program_id: "",
        subprogram_id: "",
        due_date: "",
        total_points: 100,
        status: "active",
        word_count: "",
        duration: "",
        submission_format: "",
        requirements: ""
    });

    // Queries
    const { data: assignments, isLoading } = useGetAssignmentsQuery({
        type,
        created_by: currentUser?.id
    });
    const { data: classes } = useGetClassesQuery();
    const { data: programs } = useGetProgramsQuery();

    // Cascading Dropdown Logic for writing_task
    const uniquePrograms = useMemo(() => {
        if (!classes || type !== 'writing_task') return [];
        const programsMap = new Map();
        classes.forEach(c => {
            if (c.program_id && c.program_name) {
                programsMap.set(c.program_id, { id: c.program_id, title: c.program_name });
            }
        });
        return Array.from(programsMap.values());
    }, [classes, type]);

    const filteredSubprograms = useMemo(() => {
        if (!classes || !formData.program_id || type !== 'writing_task') return [];
        const subprogramsMap = new Map();
        classes.forEach(c => {
            if (c.program_id == formData.program_id && c.subprogram_id && c.subprogram_name) {
                subprogramsMap.set(c.subprogram_id, { id: c.subprogram_id, title: c.subprogram_name });
            }
        });
        return Array.from(subprogramsMap.values());
    }, [classes, formData.program_id, type]);

    const filteredClasses = useMemo(() => {
        if (!classes || !formData.subprogram_id || type !== 'writing_task') return [];
        return classes.filter(c => c.subprogram_id == formData.subprogram_id);
    }, [classes, formData.subprogram_id, type]);

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

    const handleAddClick = () => {
        if (type === 'course_work') {
            router.push('/portal/teacher/assessments/course-work/create');
            return;
        }
        if (type === 'test') {
            router.push('/portal/teacher/assessments/tests/create');
            return;
        }
        if (type === 'oral_assignment') {
            router.push('/portal/teacher/assessments/oral-assignment/create');
            return;
        }
        setEditingAssignment(null);
        setFormData({
            title: "",
            description: "",
            class_id: "",
            program_id: "",
            subprogram_id: "",
            due_date: "",
            total_points: 100,
            status: "active",
            word_count: "",
            duration: "",
            submission_format: "",
            requirements: ""
        });
        setIsAdding(!isAdding);
    };

    const handleEditClick = (assignment) => {
        if (type === 'course_work') {
            router.push(`/portal/teacher/assessments/course-work/create?id=${assignment.id}`);
            return;
        }
        if (type === 'test') {
            router.push(`/portal/teacher/assessments/tests/update/${assignment.id}`);
            return;
        }
        if (type === 'oral_assignment') {
            router.push(`/portal/teacher/assessments/oral-assignment/create?id=${assignment.id}`);
            return;
        }
        setEditingAssignment(assignment);
        const classInfo = classes?.find(c => c.id == assignment.class_id);
        setFormData({
            title: assignment.title,
            description: assignment.description,
            class_id: assignment.class_id,
            program_id: classInfo?.program_id || assignment.program_id || "",
            subprogram_id: classInfo?.subprogram_id || "",
            due_date: assignment.due_date ? new Date(assignment.due_date).toISOString().split('T')[0] : "",
            total_points: assignment.total_points,
            status: assignment.status || "active",
            word_count: assignment.word_count || "",
            duration: assignment.duration || "",
            submission_format: assignment.submission_format || "",
            requirements: assignment.requirements || ""
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
            // Ensure due_date is in YYYY-MM-DD format for the backend/MySQL
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
                word_count: assignment.word_count,
                duration: assignment.duration,
                submission_format: assignment.submission_format,
                requirements: assignment.requirements,
                questions: assignment.questions
            };

            await updateAssignment(updatePayload).unwrap();
            showToast(`Assignment is now ${newStatus}`, "success");
        } catch (err) {
            console.error("Status update error details:", err);
            showToast(err.data?.error || "Failed to update status", "error");
        }
    };

    const handleViewSubmissions = (assignment) => {
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
            // Use 'id' for the submission ID as expected by the mutation
            formData.append('id', gradingSubmission.id);
            formData.append('type', type);
            formData.append('score', gradeData.score);
            formData.append('feedback', gradeData.feedback);

            if (feedbackFile) {
                formData.append('feedbackFile', feedbackFile);
            }

            await gradeSubmission({ id: gradingSubmission.id, formData }).unwrap();
            showToast("Submission graded successfully!", "success");
            setView("submissions"); // Go back to table after grading
            setGradingSubmission(null);
            setFeedbackFile(null);
        } catch (err) {
            showToast("Failed to grade submission", "error");
        }
    };

    const handleDownloadEssay = () => {
        if (!gradingSubmission || !gradingSubmission.content) return;

        const content = gradingSubmission.content;
        const studentName = gradingSubmission.student_name || "Student";
        const date = new Date(gradingSubmission.submission_date || new Date()).toLocaleDateString();

        // Create doc content (HTML structure) matching placement test style
        const htmlContent = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>Essay Response</title></head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h1 style="color: #010080;">${selectedAssignment?.title || 'Essay Submission'} - Response</h1>
                <p><strong>Student:</strong> ${studentName}</p>
                <p><strong>Date:</strong> ${date}</p>
                <hr/>
                <h2 style="font-size: 16px;">Assignment: ${selectedAssignment?.title}</h2>
                <br/>
                <h3>Student Answer:</h3>
                <div style="white-space: pre-wrap;">${content}</div>
            </body>
            </html>
        `;

        const blob = new Blob(['\ufeff', htmlContent], {
            type: 'application/msword'
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${studentName.replace(/\s+/g, '_')}_Essay.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleDownloadFile = async (fileUrl) => {
        if (!fileUrl) return;
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:5000/api/files/download/${fileUrl}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error("Failed to download file");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
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

    const getColumns = () => {
        const baseColumns = [
            {
                key: "title",
                label: "Assignment Title",
                render: (row) => (
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 dark:text-white">{row.title}</span>
                        <span className="text-[11px] text-gray-500 uppercase">{row.class_name || "General"}</span>
                    </div>
                )
            },
            {
                key: "program",
                label: "Program",
                render: (row) => <span className="text-sm opacity-80">{row.program_name || "N/A"}</span>
            },
            {
                key: "subprogram",
                label: "Subprogram",
                render: (row) => <span className="text-sm opacity-80">{row.subprogram_name || "N/A"}</span>
            },
        ];

        if (type === 'writing_task') {
            baseColumns.push({ label: "Words", key: "word_count" });
        } else if (type === 'test' || type === 'oral_assignment') {
            baseColumns.push({ label: "Duration", key: "duration" });
        }

        baseColumns.push(
            {
                label: "Date Range/Due",
                render: (row) => {
                    const start = row.start_date ? new Date(row.start_date).toLocaleDateString() : null;
                    const end = row.end_date ? new Date(row.end_date).toLocaleDateString() : null;
                    const due = row.due_date ? new Date(row.due_date).toLocaleDateString() : null;

                    if (start && end) {
                        return (
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-500">From: {start}</span>
                                <span className="text-xs font-semibold text-gray-500">To: {end}</span>
                            </div>
                        );
                    }
                    return <span className="text-sm text-gray-600 dark:text-gray-400">{due || "N/A"}</span>;
                }
            },
            {
                label: "Points",
                render: (row) => <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{row.total_points}</span>
            },
            {
                label: "Status",
                render: (row) => (
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
                render: (row) => (
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
        );

        return baseColumns;
    };

    const getSubmissionColumns = () => [
        {
            key: "student_name",
            label: "Student Name",
            render: (row) => <span className="font-semibold text-gray-900 dark:text-white">{row.student_name}</span>
        },
        {
            label: "Class Name",
            render: () => <span className="font-medium opacity-60">{selectedAssignment?.class_name || "N/A"}</span>
        },
        {
            label: "Assignment",
            render: () => <span className="font-medium opacity-60">{selectedAssignment?.title || "N/A"}</span>
        },
        {
            label: "Submitted",
            render: (row) => row.submission_date ? new Date(row.submission_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "N/A"
        },
        {
            label: "Grade",
            render: (row) => row.status === 'graded' ? (
                <span className="font-bold text-green-600">{row.score} / {selectedAssignment.total_points}</span>
            ) : (
                <span className="text-gray-400 italic">Pending</span>
            ),
        },
        {
            label: "Status",
            render: (row) => (
                <span className={`px-2.5 py-1 text-[11px] font-medium rounded-full border ${row.status === 'graded'
                    ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                    : 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
                    }`}>
                    {(row.status || 'pending').charAt(0).toUpperCase() + (row.status || 'pending').slice(1)}
                </span>
            )
        },
        {
            label: "Actions",
            render: (row) => (
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
            )
        }
    ];

    return (
        <div className={`min-h-screen transition-colors ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
            <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-gray-100 dark:bg-gray-900 transition-colors">
                {/* Header & View Switcher */}
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight leading-tight">{title}</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2 md:line-clamp-none">{description}</p>
                        </div>
                        {view === 'list' && (
                            <button
                                onClick={handleAddClick}
                                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#010080] text-white rounded-xl font-semibold hover:bg-blue-800 shadow-lg shadow-blue-900/20 transition-all active:scale-95 text-sm md:text-base"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Add New {title.endsWith('s') ? title.slice(0, -1) : title}</span>
                            </button>
                        )}
                    </div>

                    {view === 'list' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {isLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <div key={i} className={`p-6 rounded-xl border animate-pulse ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="space-y-2 w-3/4">
                                                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2"></div>
                                                </div>
                                                <div className="h-6 w-16 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
                                            </div>
                                            <div className="space-y-3 mb-6">
                                                <div className="h-4 w-1/2 bg-gray-100 dark:bg-gray-800 rounded"></div>
                                                <div className="h-4 w-1/3 bg-gray-100 dark:bg-gray-800 rounded"></div>
                                            </div>
                                            <div className="pt-4 border-t border-gray-50 dark:border-gray-700/50 flex justify-between items-center">
                                                <div className="flex gap-2">
                                                    <div className="h-8 w-8 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                                                    <div className="h-8 w-8 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                                                </div>
                                                <div className="h-9 w-24 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : !assignments || assignments.length === 0 ? (
                                <div className={`p-10 md:p-20 rounded-2xl border-2 border-dashed text-center flex flex-col items-center justify-center ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
                                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-50 text-gray-300'}`}>
                                        <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <h3 className={`text-lg md:text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>No {title} Found</h3>
                                    <p className="text-gray-500 max-w-xs mx-auto text-sm md:text-base">Click the button above to create your first {title.toLowerCase().endsWith('s') ? title.toLowerCase().slice(0, -1) : title.toLowerCase()} and get started.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {(assignments || []).map((assignment) => (
                                        <div
                                            key={assignment.id}
                                            onClick={() => handleViewSubmissions(assignment)}
                                            className={`relative p-5 rounded-xl border transition-all cursor-pointer flex flex-col hover:shadow-md ${isDark ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-blue-300'}`}
                                        >
                                            {/* 1. Exam Name/Title */}
                                            <div className="flex justify-between items-start mb-4 gap-3">
                                                <div className="flex flex-col gap-1 w-full">
                                                    <span className={`text-[10px] uppercase font-bold tracking-wide opacity-50 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        {assignment.class_name || "General"}
                                                    </span>
                                                    <h3 className={`text-lg font-bold leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                        {assignment.title}
                                                    </h3>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleStatusToggle(assignment); }}
                                                    className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${assignment.status === 'inactive'
                                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                                                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                                                        }`}
                                                >
                                                    {assignment.status || 'active'}
                                                </button>
                                            </div>

                                            {/* 2. Program | Subprogram (Parallel) */}
                                            <div className="grid grid-cols-2 gap-4 mb-3 pb-3 border-b border-gray-100 dark:border-gray-700/50">
                                                <div className="flex flex-col">
                                                    <span className={`text-[10px] uppercase font-bold opacity-60 mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Program</span>
                                                    <span className={`text-sm font-semibold truncate ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        {assignment.program_name || "N/A"}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`text-[10px] uppercase font-bold opacity-60 mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Subprogram</span>
                                                    <span className={`text-sm font-semibold truncate ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        {assignment.subprogram_name || "N/A"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* 3. Start Date | End Date (Parallel) */}
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="flex flex-col">
                                                    <span className={`text-[10px] uppercase font-bold opacity-60 mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Start Date</span>
                                                    <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                        {assignment.start_date ? new Date(assignment.start_date).toLocaleDateString() : (assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'N/A')}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`text-[10px] uppercase font-bold opacity-60 mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>End Date</span>
                                                    <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                        {assignment.end_date ? new Date(assignment.end_date).toLocaleDateString() : 'N/A'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* 4. Points & Actions */}
                                            <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className={`text-[10px] uppercase font-bold opacity-60 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Points</span>
                                                    <span className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{assignment.total_points}</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md text-xs mr-2">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                                        <span>{assignment.submission_count || 0}</span>
                                                    </div>

                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleEditClick(assignment); }}
                                                        className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(assignment.id); }}
                                                        className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                                        title="Delete"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

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
                                        {type === 'writing_task' ? (
                                            <>
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

                                                {/* Essay Name & Marks */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1.5 opacity-80">Essay Name</label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={formData.title}
                                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                            className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1.5 opacity-80">Marks</label>
                                                        <input
                                                            type="number"
                                                            required
                                                            value={formData.total_points}
                                                            onChange={(e) => setFormData({ ...formData, total_points: e.target.value })}
                                                            className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Description */}
                                                <div>
                                                    <label className="block text-sm font-medium mb-1.5 opacity-80">Description</label>
                                                    <textarea
                                                        rows={4}
                                                        value={formData.description}
                                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                        className={`w-full px-3 py-2 rounded-lg border outline-none transition-all resize-none ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`}
                                                    />
                                                </div>

                                                {/* Word Count */}
                                                <div>
                                                    <label className="block text-sm font-medium mb-1.5 opacity-80">Word Count</label>
                                                    <input
                                                        type="number"
                                                        placeholder="e.g., 500"
                                                        value={formData.word_count}
                                                        onChange={(e) => setFormData({ ...formData, word_count: e.target.value })}
                                                        className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`}
                                                    />
                                                </div>

                                                {/* Due Date & Status */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1.5 opacity-80">Due Date</label>
                                                        <input
                                                            type="datetime-local"
                                                            value={formData.due_date}
                                                            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                                            className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`}
                                                        />
                                                    </div>
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
                                            </>
                                        ) : (
                                            <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl border overflow-hidden`}>
                                                <div className={`px-4 py-3 border-b ${isDark ? 'bg-gray-700/30 border-gray-700' : 'bg-gray-50/80 border-gray-100'}`}>
                                                    <h4 className="text-sm font-semibold text-blue-600">Basic Information</h4>
                                                </div>
                                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Assignment Title</label>
                                                        <input
                                                            type="text" required placeholder="Project Name..."
                                                            value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                            className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Total Points</label>
                                                        <input
                                                            type="number" required
                                                            value={formData.total_points} onChange={(e) => setFormData({ ...formData, total_points: e.target.value })}
                                                            className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Due Date</label>
                                                        <input
                                                            type="date" required
                                                            value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                                            className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                                        />
                                                    </div>

                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                                                        <textarea
                                                            rows="3" placeholder="Instructions..."
                                                            value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                            className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                                        />
                                                    </div>

                                                    {(type === 'test' || type === 'oral_assignment') && (
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Duration (Minutes)</label>
                                                            <input
                                                                type="number"
                                                                value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                                                className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                                            />
                                                        </div>
                                                    )}

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Class</label>
                                                        <select
                                                            required value={formData.class_id} onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                                                            className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                                        >
                                                            <option value="">Select Class</option>
                                                            {classes?.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Program</label>
                                                        <select
                                                            required value={formData.program_id} onChange={(e) => setFormData({ ...formData, program_id: e.target.value })}
                                                            className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                                        >
                                                            <option value="">Select Program</option>
                                                            {programs?.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                                        </select>
                                                    </div>

                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
                                                        <select
                                                            required value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                            className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                                        >
                                                            <option value="active">Active</option>
                                                            <option value="inactive">Inactive</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className={`px-6 py-4 border-t flex justify-end gap-3 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                        <button
                                            type="button" onClick={() => setIsAdding(false)}
                                            className={`px-4 py-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-2 rounded-lg bg-[#010080] hover:bg-blue-800 text-white transition-colors shadow-lg shadow-blue-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {editingAssignment ? 'Update' : 'Create'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {view === 'submissions' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => setView('list')}
                                    className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Back to Assignments
                                </button>
                                <h3 className="font-bold text-xl text-gray-800 dark:text-white">
                                    Submissions for {selectedAssignment?.title}
                                </h3>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-900/50 p-1 rounded-xl">
                                <DataTable
                                    columns={getSubmissionColumns()}
                                    data={submissions || []}
                                    isLoading={isLoadingSubmissions}
                                    showAddButton={false}
                                />
                            </div>
                        </div>
                    )}

                    {view === 'grading' && gradingSubmission && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => setView('submissions')}
                                    className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Back to Submissions
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                <div className="lg:col-span-12">
                                    <div className="space-y-6">
                                        <div className={`p-6 rounded-xl border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                                            <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                                                <div>
                                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1 block">Student Submission</span>
                                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{gradingSubmission.student_name}</h2>
                                                    <p className="text-xs text-gray-500 mt-1">Submitted on {new Date(gradingSubmission.submission_date).toLocaleString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`px-2.5 py-1 text-[11px] font-medium rounded-full border ${gradingSubmission.status === 'graded'
                                                        ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                                                        : 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
                                                        }`}>
                                                        {(gradingSubmission.status || 'pending').charAt(0).toUpperCase() + (gradingSubmission.status || 'pending').slice(1)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className={`p-6 rounded-lg border leading-relaxed overflow-auto whitespace-pre-wrap ${isDark ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`} style={{ minHeight: '300px' }}>
                                                {selectedAssignment.questions ? (
                                                    <div className="space-y-8">
                                                        {(typeof selectedAssignment.questions === 'string' ? JSON.parse(selectedAssignment.questions) : selectedAssignment.questions).map((q, idx) => {
                                                            const studentAnswers = typeof gradingSubmission.content === 'string'
                                                                ? JSON.parse(gradingSubmission.content)
                                                                : (gradingSubmission.content || {});
                                                            const studentAnswer = studentAnswers[idx];

                                                            // Support both index-based and string-based correct answers
                                                            const correctAnswer = q.options && q.correctOption !== undefined
                                                                ? q.options[q.correctOption]
                                                                : (q.correctAnswer || q.answer);

                                                            const isCorrect = studentAnswer === correctAnswer;

                                                            return (
                                                                <div key={idx} className={`pb-6 border-b last:border-0 ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                                                                    <div className="flex justify-between items-start mb-4">
                                                                        <h4 className="font-bold text-lg flex gap-3">
                                                                            <span className="opacity-30">{idx + 1}.</span>
                                                                            {q.questionText}
                                                                        </h4>
                                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${isCorrect
                                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                                            }`}>
                                                                            {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        <div className={`p-4 rounded-xl border ${isCorrect
                                                                            ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800'
                                                                            : 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800'
                                                                            }`}>
                                                                            <span className="text-[10px] uppercase font-bold block mb-1 opacity-50">Student's Answer</span>
                                                                            <p className="font-semibold">{studentAnswer || "No answer provided"}</p>
                                                                        </div>
                                                                        {!isCorrect && (
                                                                            <div className="p-4 rounded-xl border bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800">
                                                                                <span className="text-[10px] uppercase font-bold block mb-1 opacity-50">Correct Answer</span>
                                                                                <p className="font-semibold text-blue-700 dark:text-blue-400">{correctAnswer}</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex justify-between items-center mb-6">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                                                                <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Essay Content</span>
                                                            </div>
                                                            <button
                                                                onClick={handleDownloadEssay}
                                                                className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors border border-blue-200"
                                                                title="Download as Word Document"
                                                            >
                                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                                                                </svg>
                                                                Download Word
                                                            </button>
                                                        </div>
                                                        <div className="text-lg leading-relaxed text-gray-800 dark:text-gray-200">
                                                            {gradingSubmission.content}
                                                        </div>

                                                        {/* Download Student Submission File */}
                                                        {gradingSubmission.file_url && (
                                                            <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
                                                                <div className="flex items-center justify-between p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                                                                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                            </svg>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 italic">Original Attachment Identified</p>
                                                                            <p className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-black tracking-tighter">Student Submission File</p>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleDownloadFile(gradingSubmission.file_url)}
                                                                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                        </svg>
                                                                        Download File
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {!selectedAssignment.questions && (
                                            <div className={`p-6 rounded-xl border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                                                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                    </svg>
                                                    Grading & Feedback
                                                </h4>
                                                <form onSubmit={handleGradeSubmit} className="space-y-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                        <div className="md:col-span-1">
                                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Score / {selectedAssignment.total_points}</label>
                                                            <input
                                                                type="number" required max={selectedAssignment.total_points}
                                                                value={gradeData.score} onChange={(e) => setGradeData({ ...gradeData, score: e.target.value })}
                                                                className={`w-full p-3 rounded-lg border text-center font-bold text-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                                            />
                                                        </div>
                                                        <div className="md:col-span-3">
                                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Teacher Feedback</label>
                                                            <textarea
                                                                rows="3" required placeholder="Enter feedback here..."
                                                                value={gradeData.feedback} onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                                                                className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Feedback File Upload */}
                                                    <div className="mt-4">
                                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Attach Graded/Corrected File (Optional)</label>
                                                        <input
                                                            type="file"
                                                            accept=".doc,.docx,.pdf,.txt"
                                                            onChange={(e) => setFeedbackFile(e.target.files[0])}
                                                            className="hidden"
                                                            id="feedback-file-upload"
                                                        />
                                                        <label
                                                            htmlFor="feedback-file-upload"
                                                            className={`flex items-center gap-3 px-6 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-all hover:border-blue-500 ${isDark ? 'border-gray-700 bg-gray-800 hover:bg-gray-750' : 'border-gray-300 bg-white hover:bg-gray-50'}`}
                                                        >
                                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                            </svg>
                                                            {feedbackFile ? (
                                                                <div className="flex-1 flex items-center justify-between">
                                                                    <div>
                                                                        <p className="font-semibold text-sm">{feedbackFile.name}</p>
                                                                        <p className="text-xs opacity-60">{(feedbackFile.size / 1024).toFixed(2)} KB</p>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => { e.preventDefault(); setFeedbackFile(null); }}
                                                                        className="text-red-500 hover:text-red-700 transition-colors"
                                                                    >
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <span className="text-sm font-medium opacity-70">Upload Graded File (.doc, .docx, .pdf, .txt) - Max 10MB</span>
                                                            )}
                                                        </label>
                                                    </div>
                                                    <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                                                        <button
                                                            type="submit"
                                                            className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-all flex items-center gap-2 active:scale-95"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            Save Grade
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
                        <div className={`relative w-full max-w-md p-6 rounded-2xl shadow-2xl transform transition-all scale-100 ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
                            <div className="text-center">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                                    <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold mb-2">Delete Assignment?</h3>
                                <p className="text-sm opacity-70 mb-6">
                                    Are you sure you want to delete this assignment? This action cannot be undone.
                                </p>
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className={`px-5 py-2.5 rounded-xl font-medium transition-colors ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium shadow-lg shadow-red-600/20 transition-all active:scale-95"
                                    >
                                        Yes, Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main >
        </div >
    );
}
