"use client";

import { useState, useEffect } from "react";
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
import TeacherHeader from "../TeacherHeader";

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
        setEditingAssignment(null);
        setFormData({
            title: "",
            description: "",
            class_id: "",
            program_id: "",
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
        setEditingAssignment(assignment);
        setFormData({
            title: assignment.title,
            description: assignment.description,
            class_id: assignment.class_id,
            program_id: assignment.program_id,
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

    const handleDeleteClick = async (id) => {
        if (window.confirm("Are you sure you want to delete this?")) {
            try {
                await deleteAssignment({ id, type }).unwrap();
                showToast("Assignment deleted successfully", "success");
            } catch (err) {
                showToast("Failed to delete", "error");
            }
        }
    };

    const handleStatusToggle = async (assignment) => {
        const newStatus = assignment.status === 'inactive' ? 'active' : 'inactive';
        try {
            await updateAssignment({
                id: assignment.id,
                type,
                ...assignment,
                status: newStatus
            }).unwrap();
            showToast(`Status updated to ${newStatus}`, "success");
        } catch (err) {
            showToast("Failed to update status", "error");
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
            await gradeSubmission({
                id: gradingSubmission.id,
                type,
                ...gradeData
            }).unwrap();
            showToast("Submission graded successfully!", "success");
            setView("submissions"); // Go back to table after grading
            setGradingSubmission(null);
        } catch (err) {
            showToast("Failed to grade submission", "error");
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
                        <span className="text-[11px] text-gray-500 uppercase">{row.class_name}</span>
                    </div>
                )
            },
        ];

        if (type === 'writing_task') {
            baseColumns.push({ label: "Words", key: "word_count" });
        } else if (type === 'test' || type === 'oral_assignment') {
            baseColumns.push({ label: "Duration", key: "duration" });
        }

        baseColumns.push(
            {
                label: "Due Date",
                render: (row) => (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {row.due_date ? new Date(row.due_date).toLocaleDateString() : "N/A"}
                    </span>
                )
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
                            className={`p-1.5 rounded-lg transition-colors ${row.status === 'inactive'
                                ? 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20'
                                : 'text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20'
                                }`}
                            title={row.status === 'inactive' ? "Activate" : "Deactivate"}
                        >
                            {row.status === 'inactive' ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
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
            <TeacherHeader />
            <main className="flex-1 overflow-y-auto px-8 py-6 pt-24 bg-gray-100 dark:bg-gray-900 transition-colors">
                <div className="w-full">
                    {/* Header & View Switcher */}
                    <div className="flex-1 p-8 space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">{title}</h1>
                                <p className="text-sm text-gray-500 mt-1">{description}</p>
                            </div>
                            {view === 'list' && (
                                <button
                                    onClick={handleAddClick}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-[#010080] text-white rounded-lg font-semibold hover:bg-blue-800 shadow-lg shadow-blue-900/10 transition-all active:scale-95"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add New {title}
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
                                    <div className={`p-20 rounded-2xl border-2 border-dashed text-center flex flex-col items-center justify-center ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
                                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-50 text-gray-300'}`}>
                                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                        <h3 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>No {title} Found</h3>
                                        <p className="text-gray-500 max-w-xs mx-auto">Click the button above to create your first {title.toLowerCase()} and get started.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {(assignments || []).map((assignment) => (
                                            <div
                                                key={assignment.id}
                                                onClick={() => handleViewSubmissions(assignment)}
                                                className={`group p-6 rounded-xl border transition-all cursor-pointer hover:shadow-md hover:border-blue-500/30 hover:scale-[1.01] flex flex-col justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                                            >
                                                <div>
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <h3 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                                {assignment.title}
                                                            </h3>
                                                            <span className="text-[11px] text-gray-500 uppercase font-medium">{assignment.class_name}</span>
                                                        </div>
                                                        <span className={`px-2.5 py-1 text-[11px] font-medium rounded-full border ${assignment.status === 'inactive'
                                                            ? 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                                                            : 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                                                            }`}>
                                                            {(assignment.status || 'active').charAt(0).toUpperCase() + (assignment.status || 'active').slice(1)}
                                                        </span>
                                                    </div>

                                                    <div className="space-y-3 mb-6">
                                                        <div className="flex items-center gap-2.5 text-gray-500">
                                                            <svg className="w-4 h-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            <span className="text-sm font-medium">
                                                                {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'N/A'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2.5 text-gray-500">
                                                            <svg className="w-4 h-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <span className="text-sm font-medium">{assignment.total_points} Points</span>
                                                        </div>
                                                        <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
                                                            <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                            </svg>
                                                            <span className="text-sm font-bold">{assignment.submission_count || 0} Submissions</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between gap-2 pt-4 border-t border-gray-50 dark:border-gray-700/50">
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleEditClick(assignment); }}
                                                            className="text-gray-500 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                                                            title="Edit"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleStatusToggle(assignment); }}
                                                            className={`transition-all p-2 rounded-lg ${assignment.status === 'inactive'
                                                                ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                                : 'text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                                                                }`}
                                                            title={assignment.status === 'inactive' ? "Activate" : "Deactivate"}
                                                        >
                                                            {assignment.status === 'inactive' ? (
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteClick(assignment.id); }}
                                                            className="text-gray-500 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                                            title="Delete"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleViewSubmissions(assignment); }}
                                                        className="px-4 py-2 text-sm font-semibold bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                                                    >
                                                        View Students
                                                    </button>
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
                                <div className="absolute inset-0  backdrop-blur-sm" onClick={() => setIsAdding(false)} />
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
                                        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
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

                                                    {type === 'writing_task' && (
                                                        <>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Word Count</label>
                                                                <input
                                                                    type="number" placeholder="Words"
                                                                    value={formData.word_count} onChange={(e) => setFormData({ ...formData, word_count: e.target.value })}
                                                                    className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Prompt</label>
                                                                <input
                                                                    type="text" placeholder="Title/Prompt"
                                                                    value={formData.requirements} onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                                                    className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                                                />
                                                            </div>
                                                        </>
                                                    )}

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
                                        </div>

                                        <div className={`px-6 py-4 border-t flex justify-end gap-3 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50/50 border-gray-200'}`}>
                                            <button
                                                type="button" onClick={() => setIsAdding(false)}
                                                className={`px-4 py-2 rounded-lg font-semibold border transition-all ${isDark ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-md transition-all active:scale-95"
                                            >
                                                {editingAssignment ? 'Update Assignment' : 'Create Assignment'}
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
                                                        gradingSubmission.content
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
                </div>
            </main >
        </div >
    );
}
