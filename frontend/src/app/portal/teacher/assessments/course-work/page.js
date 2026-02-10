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
    useUpdateAssignmentMutation
} from "@/redux/api/assignmentApi";
import { useGetClassesQuery } from "@/redux/api/classApi";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { API_BASE_URL } from "@/constants";

import DataTable from "@/components/DataTable";

export default function CourseWorkPage() {
    const router = useRouter();
    const { isDark } = useDarkMode();
    const { showToast } = useToast();

    // State
    const [selectedClassId, setSelectedClassId] = useState("");
    const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
    const [gradingSubmission, setGradingSubmission] = useState(null);
    const [gradeData, setGradeData] = useState({ score: "", feedback: "" });
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createFormData, setCreateFormData] = useState({
        title: "",
        description: "",
        program_id: "",
        subprogram_id: "",
        class_id: "",
        unit: "",
        due_date: "",
        status: "active",
        total_points: "100" // Default marks
    });
    const [isEditing, setIsEditing] = useState(false);

    // Queries
    const { data: currentUser } = useGetCurrentUserQuery();

    // getClasses for teachers is automatically filtered by the backend
    const { data: classes, isLoading: isLoadingClasses } = useGetClassesQuery();

    // Derived Data for Cascading Dropdowns
    const uniquePrograms = useMemo(() => {
        if (!classes) return [];
        const programs = new Map();
        classes.forEach(c => {
            if (c.program_id && c.program_name) {
                programs.set(c.program_id, { id: c.program_id, title: c.program_name });
            }
        });
        return Array.from(programs.values());
    }, [classes]);

    const filteredSubprograms = useMemo(() => {
        if (!classes || !createFormData.program_id) return [];
        const subprograms = new Map();
        classes.forEach(c => {
            if (c.program_id == createFormData.program_id && c.subprogram_id && c.subprogram_name) {
                subprograms.set(c.subprogram_id, { id: c.subprogram_id, title: c.subprogram_name });
            }
        });
        return Array.from(subprograms.values());
    }, [classes, createFormData.program_id]);

    const filteredClasses = useMemo(() => {
        if (!classes || !createFormData.subprogram_id) return [];
        return classes.filter(c => c.subprogram_id == createFormData.subprogram_id);
    }, [classes, createFormData.subprogram_id]);

    const { data: assignments, isLoading: isLoadingAssignments } = useGetAssignmentsQuery({
        type: 'course_work',
        class_id: selectedClassId,
        created_by: currentUser?.id
    }, { skip: !selectedClassId || !currentUser?.id });

    const selectedAssignment = assignments?.find(a => a.id == selectedAssignmentId);

    const { data: submissions, isLoading: isLoadingSubmissions } = useGetAssignmentSubmissionsQuery({
        id: selectedAssignmentId,
        type: 'course_work'
    }, { skip: !selectedAssignmentId });

    // Mutations
    const [gradeSubmission] = useGradeSubmissionMutation();
    const [createAssignment, { isLoading: isCreating }] = useCreateAssignmentMutation();
    const [updateAssignment, { isLoading: isUpdating }] = useUpdateAssignmentMutation();

    // Auto-select first class if available (Only for VIEWING, not adding)
    useEffect(() => {
        if (classes && classes.length > 0 && !selectedClassId) {
            setSelectedClassId(classes[0].id);
        }
    }, [classes]);

    const handleCreateDataChange = (e) => {
        const { name, value } = e.target;
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
        setCreateFormData({
            title: "",
            description: "",
            program_id: "",
            subprogram_id: "",
            class_id: "",
            unit: "",
            due_date: "",
            status: "active",
            total_points: "100"
        });
        setIsCreateModalOpen(true);
    };

    const handleEditClick = () => {
        if (!selectedAssignment) return;

        // Find class to get program info (for cascading dropdowns to work properly)
        const classInfo = classes?.find(c => c.id == selectedAssignment.class_id);

        setCreateFormData({
            title: selectedAssignment.title,
            description: selectedAssignment.description || "",
            program_id: classInfo?.program_id || "",
            subprogram_id: classInfo?.subprogram_id || "",
            class_id: selectedAssignment.class_id,
            unit: selectedAssignment.unit || "",
            due_date: selectedAssignment.due_date ? new Date(selectedAssignment.due_date).toISOString().slice(0, 16) : "",
            status: selectedAssignment.status || "active",
            total_points: selectedAssignment.total_points || "100"
        });
        setIsEditing(true);
        setIsCreateModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!createFormData.class_id) {
            showToast("Please select a class", "error");
            return;
        }

        try {
            if (isEditing) {
                await updateAssignment({
                    id: selectedAssignment.id,
                    ...createFormData,
                    type: 'course_work'
                }).unwrap();
                showToast("Course work updated successfully!", "success");
            } else {
                await createAssignment({
                    ...createFormData,
                    type: 'course_work',
                    questions: [],
                    submission_format: 'text'
                }).unwrap();
                showToast("Course work created successfully!", "success");
            }

            setIsCreateModalOpen(false);
            setCreateFormData({
                title: "",
                description: "",
                program_id: "",
                subprogram_id: "",
                class_id: "",
                unit: "",
                due_date: "",
                status: "active",
                total_points: "100"
            });
            setIsEditing(false);
        } catch (err) {
            showToast(err.data?.error || `Failed to ${isEditing ? 'update' : 'create'} course work`, "error");
        }
    };

    const handleGradeClick = (submission) => {
        setGradingSubmission(submission);
        setGradeData({
            score: submission.score || "",
            feedback: submission.feedback || ""
        });
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
        } catch (err) {
            showToast("Failed to grade submission", "error");
        }
    };

    const columns = [
        {
            key: "student_name",
            label: "Student Name",
            render: (value, row) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 dark:text-white">{value || 'N/A'}</span>
                    <span className="text-[10px] text-gray-500 uppercase">{row?.student_email || 'N/A'}</span>
                </div>
            )
        },
        {
            key: "submission_date",
            label: "Submitted At",
            render: (value, row) => {
                if (!row) return "N/A";
                return row.submission_date ? new Date(row.submission_date).toLocaleDateString(undefined, {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                }) : "N/A"
            }
        },
        {
            key: "status",
            label: "Status",
            render: (value, row) => {
                if (!row) return <span className="text-gray-400 italic">Pending</span>;
                const status = row.status || 'pending';
                return (
                    <span className={`px-2.5 py-1 text-[11px] font-medium rounded-full border ${status === 'graded'
                        ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                        : 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
                        }`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                );
            }
        },
        {
            key: "score",
            label: "Grade",
            render: (value, row) => {
                if (!row) return <span className="text-gray-400 italic">Pending</span>;
                return row.status === 'graded' ? (
                    <span className="font-bold text-green-600">{row.score} / {selectedAssignment?.total_points || 100}</span>
                ) : (
                    <span className="text-gray-400 italic">Pending</span>
                );
            }
        },
        {
            key: "actions",
            label: "Actions",
            render: (_, row) => {
                if (!row) return null;
                return (
                    <button
                        onClick={() => handleGradeClick(row)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="Review & Grade"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </button>
                );
            }
        }
    ];

    return (
        <div className={`min-h-screen transition-colors ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
            <main className="flex-1 overflow-y-auto px-8 py-6 bg-gray-100 dark:bg-gray-900 transition-colors">
                <div className="w-full max-w-full mx-auto">
                    {/* Header */}
                    <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Course Work Manager</h1>
                            <p className="text-sm text-gray-500 mt-1">Select a class and coursework item to review student submissions.</p>
                        </div>
                        <div className="flex gap-2">
                            {selectedAssignmentId && (
                                <button
                                    onClick={handleEditClick}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 shadow-lg shadow-yellow-500/10 transition-all active:scale-95 w-fit"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    Edit Course Work
                                </button>
                            )}
                            <button
                                onClick={handleOpenCreate}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#010080] text-white rounded-lg font-semibold hover:bg-blue-800 shadow-lg shadow-blue-900/10 transition-all active:scale-95 w-fit"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create Course Work
                            </button>
                        </div>
                    </div>

                    {/* Filter Section */}
                    <div className={`p-6 rounded-2xl border mb-8 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Select Class</label>
                                <select
                                    value={selectedClassId}
                                    onChange={(e) => {
                                        setSelectedClassId(e.target.value);
                                        setSelectedAssignmentId(""); // Reset assignment when class changes
                                    }}
                                    className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                >
                                    <option value="">Select a Class</option>
                                    {classes?.map(cls => (
                                        <option key={cls.id} value={cls.id}>{cls.class_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Select Course Work Item</label>
                                <select
                                    value={selectedAssignmentId}
                                    onChange={(e) => setSelectedAssignmentId(e.target.value)}
                                    disabled={!selectedClassId}
                                    className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900 disabled:opacity-50'}`}
                                >
                                    <option value="">Select Course Work</option>
                                    {assignments?.map(asgn => (
                                        <option key={asgn.id} value={asgn.id}>{asgn.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Submissions Table */}
                    {selectedAssignmentId ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <DataTable
                                title={`Submissions: ${selectedAssignment?.title}`}
                                columns={columns}
                                data={submissions || []}
                                isLoading={isLoadingSubmissions}
                                showAddButton={false}
                                emptyMessage="No submissions found for this coursework item."
                            />
                        </div>
                    ) : (
                        <div className={`p-20 rounded-2xl border-2 border-dashed text-center flex flex-col items-center justify-center ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-50 text-gray-300'}`}>
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                                </svg>
                            </div>
                            <h3 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>View Submissions</h3>
                            <p className="text-gray-500 max-w-xs mx-auto">Please select a class and a specific coursework item to view student work.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Create/Edit Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                    <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                        {/* Header */}
                        <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{isEditing ? 'Edit' : 'Create'} Course Work</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto">
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">

                                {/* Program Selection */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5 opacity-80">Program</label>
                                        <select
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

                                    {/* Subprogram Selection */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5 opacity-80">Subprogram</label>
                                        <select
                                            name="subprogram_id"
                                            value={createFormData.subprogram_id}
                                            onChange={handleCreateDataChange}
                                            disabled={!createFormData.program_id}
                                            className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'} ${!createFormData.program_id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <option value="">Select Subprogram</option>
                                            {filteredSubprograms.map(sp => (
                                                <option key={sp.id} value={sp.id}>{sp.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Class & Unit Selection */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            {filteredClasses.map(c => (
                                                <option key={c.id} value={c.id}>{c.class_name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
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

                                {/* Title, Marks & Date */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5 opacity-80">Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={createFormData.title}
                                            onChange={handleCreateDataChange}
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

                                    <div>
                                        <label className="block text-sm font-medium mb-1.5 opacity-80">Due Date</label>
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
                            </form>
                        </div>

                        {/* Footer Buttons */}
                        <div className={`px-6 py-4 border-t flex justify-end gap-3 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(false)}
                                className={`px-4 py-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isCreating || isUpdating}
                                className="px-6 py-2 rounded-lg bg-[#010080] hover:bg-blue-800 text-white transition-colors shadow-lg shadow-blue-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCreating ? 'Creating...' : isUpdating ? 'Updating...' : isEditing ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Grading Modal */}
            {gradingSubmission && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                    <div className={`relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl shadow-2xl overflow-hidden border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                        <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50/50 border-gray-200'}`}>
                            <div>
                                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                    Grade Submission
                                </h2>
                                <p className="text-xs text-gray-500">{gradingSubmission.student_name} - {selectedAssignment?.title}</p>
                            </div>
                            <button onClick={() => setGradingSubmission(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
                            {/* Student Work Content */}
                            <div className={`p-6 rounded-xl border leading-relaxed overflow-auto whitespace-pre-wrap ${isDark ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`} style={{ maxHeight: '300px' }}>
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Student Work Content</h4>
                                    <span className="text-xs opacity-50">
                                        Submitted: {gradingSubmission.submission_date ? new Date(gradingSubmission.submission_date).toLocaleString() : 'N/A'}
                                    </span>
                                </div>

                                {gradingSubmission.file_url ? (
                                    <div className="flex flex-col gap-4">
                                        <a
                                            href={`${API_BASE_URL}${gradingSubmission.file_url}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download
                                            className="flex items-center gap-4 px-4 py-3 rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full group"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900 dark:text-white">View Submitted File</p>
                                                <p className="text-xs text-gray-500">Click to open in new tab</p>
                                            </div>
                                            <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                        </a>
                                        {gradingSubmission.content && gradingSubmission.content !== "File submission" && (
                                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                <p className="text-xs font-bold uppercase opacity-50 mb-2">Additional Note:</p>
                                                <p>{gradingSubmission.content}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    gradingSubmission.content ? (
                                        typeof gradingSubmission.content === 'string' && gradingSubmission.content.startsWith('{') ? (
                                            // Handle structured content (Quiz answers)
                                            <div className="space-y-4">
                                                {Object.entries(JSON.parse(gradingSubmission.content)).map(([key, val], idx) => (
                                                    <div key={idx} className="flex gap-4 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                                                        <span className="opacity-40 font-bold">{parseInt(key) + 1}.</span>
                                                        <span>{val}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            gradingSubmission.content
                                        )
                                    ) : "No content provided."
                                )}
                            </div>

                            {/* Grading Form */}
                            <form onSubmit={handleGradeSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Score</label>
                                    <input
                                        type="number" required
                                        value={gradeData.score} onChange={(e) => setGradeData({ ...gradeData, score: e.target.value })}
                                        className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                        placeholder={`Marks out of ${selectedAssignment?.total_points || 100}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Feedback (Optional)</label>
                                    <textarea
                                        rows="3" placeholder="Great job! Keep it up..."
                                        value={gradeData.feedback} onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                                        className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                    />
                                </div>

                                <div className="pt-4 flex justify-end gap-3">
                                    <button
                                        type="button" onClick={() => setGradingSubmission(null)}
                                        className={`px-4 py-2 rounded-lg font-semibold border transition-all ${isDark ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-md transition-all active:scale-95"
                                    >
                                        Submit Grade
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
