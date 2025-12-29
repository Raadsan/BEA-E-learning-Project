"use client";

import { useState } from "react";
import DataTable from "@/components/DataTable";
import { useDarkMode } from "@/context/ThemeContext";
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
import Modal from "@/components/Modal";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import TeacherHeader from "../TeacherHeader";

export default function AssignmentManager({ type, title, description }) {
    const { isDark } = useDarkMode();
    const { data: currentUser } = useGetCurrentUserQuery();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState(null);
    const [isSubmissionsModalOpen, setIsSubmissionsModalOpen] = useState(false);
    const [selectedAssignmentForSubmissions, setSelectedAssignmentForSubmissions] = useState(null);
    const [gradingSubmission, setGradingSubmission] = useState(null);
    const [gradeData, setGradeData] = useState({ score: "", feedback: "" });

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
        { id: selectedAssignmentForSubmissions?.id, type },
        { skip: !selectedAssignmentForSubmissions }
    );

    // Mutations
    const [createAssignment] = useCreateAssignmentMutation();
    const [updateAssignment] = useUpdateAssignmentMutation();
    const [deleteAssignment] = useDeleteAssignmentMutation();
    const [gradeSubmission] = useGradeSubmissionMutation();

    const handleAddClick = () => {
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
        setIsModalOpen(true);
    };

    const handleEditClick = (assignment) => {
        setEditingAssignment(assignment);
        setFormData({
            title: assignment.title,
            description: assignment.description,
            class_id: assignment.class_id,
            program_id: assignment.program_id,
            due_date: assignment.due_date ? new Date(assignment.due_date).toISOString().split('T')[0] : "",
            total_points: assignment.total_points,
            status: assignment.status,
            word_count: assignment.word_count || "",
            duration: assignment.duration || "",
            submission_format: assignment.submission_format || "",
            requirements: assignment.requirements || ""
        });
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm("Are you sure you want to delete this?")) {
            try {
                await deleteAssignment({ id, type }).unwrap();
            } catch (err) {
                alert("Failed to delete");
            }
        }
    };

    const handleViewSubmissions = (assignment) => {
        setSelectedAssignmentForSubmissions(assignment);
        setIsSubmissionsModalOpen(true);
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
            await gradeSubmission({
                id: gradingSubmission.id,
                type,
                ...gradeData
            }).unwrap();
            setGradingSubmission(null);
            alert("Submission graded successfully!");
        } catch (err) {
            alert("Failed to grade submission");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAssignment) {
                await updateAssignment({ id: editingAssignment.id, ...formData, type }).unwrap();
            } else {
                await createAssignment({ ...formData, type }).unwrap();
            }
            setIsModalOpen(false);
        } catch (err) {
            alert("Error saving assignment");
        }
    };

    const getColumns = () => {
        const baseColumns = [
            { label: "Title", key: "title" },
            { label: "Class", key: "class_name" },
        ];

        // Type specific columns
        if (type === 'writing_task') {
            baseColumns.push({ label: "Word Count", key: "word_count" });
        } else if (type === 'test' || type === 'oral_assignment') {
            baseColumns.push({ label: "Duration (min)", key: "duration" });
        } else if (type === 'course_work') {
            baseColumns.push({ label: "Format", key: "submission_format" });
        }

        baseColumns.push(
            {
                label: "Due Date",
                render: (row) => row.due_date ? new Date(row.due_date).toLocaleDateString() : "N/A"
            },
            { label: "Points", key: "total_points" },
            {
                label: "Status",
                render: (row) => (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {row.status}
                    </span>
                )
            },
            {
                label: "Actions",
                render: (row) => (
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleViewSubmissions(row)}
                            className="p-1 hover:text-[#010080] transition-colors flex items-center gap-1 text-xs font-medium text-gray-500"
                            title="View Submissions"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                            Submissions
                        </button>
                        <button
                            onClick={() => handleEditClick(row)}
                            className="p-1 hover:text-blue-600 transition-colors"
                            title="Edit"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => handleDeleteClick(row.id)}
                            className="p-1 hover:text-red-600 transition-colors"
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

    return (
        <div className={`min-h-screen transition-colors ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
            <TeacherHeader />
            <div className="w-full px-8 py-6 pt-24"> {/* pt-24 to clear fixed header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">{title}</h1>
                    <p className={isDark ? "text-gray-400" : "text-gray-600"}>{description}</p>
                </div>

                <DataTable
                    title={title}
                    columns={getColumns()}
                    data={assignments || []}
                    onAddClick={handleAddClick}
                    showAddButton={true}
                />

                {/* Main Modal: Create/Edit Assignment */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={editingAssignment ? `Edit ${title}` : `Add New ${title}`}
                >
                    <form onSubmit={handleSubmit} className="space-y-4 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#010080] focus:outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                                        }`}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Description / Instructions</label>
                                <textarea
                                    rows="3"
                                    placeholder="Brief overview of the task"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#010080] focus:outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                                        }`}
                                />
                            </div>

                            {/* Type Specific Fields */}
                            {type === 'writing_task' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Target Word Count</label>
                                        <input
                                            type="number"
                                            placeholder="e.g., 500"
                                            value={formData.word_count}
                                            onChange={(e) => setFormData({ ...formData, word_count: e.target.value })}
                                            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#010080] focus:outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                                                }`}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-1">Essay Topic / Detailed Prompt</label>
                                        <textarea
                                            rows="2"
                                            placeholder="Specify what the student should write about"
                                            value={formData.requirements}
                                            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#010080] focus:outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                                                }`}
                                        />
                                    </div>
                                </>
                            )}

                            {(type === 'test' || type === 'oral_assignment') && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Duration (Minutes)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g., 60"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#010080] focus:outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                                            }`}
                                    />
                                </div>
                            )}

                            {type === 'course_work' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Submission Format</label>
                                    <select
                                        value={formData.submission_format}
                                        onChange={(e) => setFormData({ ...formData, submission_format: e.target.value })}
                                        className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#010080] focus:outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                                            }`}
                                    >
                                        <option value="">Select Format</option>
                                        <option value="File Upload">File Upload</option>
                                        <option value="Online Text">Online Text</option>
                                        <option value="External Link">External Link</option>
                                        <option value="Physical Copy">Physical Copy</option>
                                    </select>
                                </div>
                            )}

                            {(type === 'course_work' || type === 'oral_assignment') && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Specific Requirements / Instructions</label>
                                    <textarea
                                        rows="2"
                                        placeholder="List any additional requirements here"
                                        value={formData.requirements}
                                        onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                        className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#010080] focus:outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                                            }`}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-1">Class</label>
                                <select
                                    required
                                    value={formData.class_id}
                                    onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                                    className={`w-full p-2 border rounded-lg focus:focus:ring-2 focus:ring-[#010080] focus:outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                                        }`}
                                >
                                    <option value="">Select Class</option>
                                    {classes?.map(c => (
                                        <option key={c.id} value={c.id}>{c.class_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Program</label>
                                <select
                                    required
                                    value={formData.program_id}
                                    onChange={(e) => setFormData({ ...formData, program_id: e.target.value })}
                                    className={`w-full p-2 border rounded-lg focus:focus:ring-2 focus:ring-[#010080] focus:outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                                        }`}
                                >
                                    <option value="">Select Program</option>
                                    {programs?.map(p => (
                                        <option key={p.id} value={p.id}>{p.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Due Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.due_date}
                                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                    className={`w-full p-2 border rounded-lg focus:focus:ring-2 focus:ring-[#010080] focus:outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                                        }`}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Total Points</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.total_points}
                                    onChange={(e) => setFormData({ ...formData, total_points: e.target.value })}
                                    className={`w-full p-2 border rounded-lg focus:focus:ring-2 focus:ring-[#010080] focus:outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                                        }`}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className={`w-full p-2 border rounded-lg focus:focus:ring-2 focus:ring-[#010080] focus:outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                                        }`}
                                >
                                    <option value="active">Active</option>
                                    <option value="draft">Draft</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-[#010080] text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
                                disabled={isLoading}
                            >
                                {editingAssignment ? 'Save Changes' : 'Create Task'}
                            </button>
                        </div>
                    </form>
                </Modal>

                {/* Submissions Modal */}
                <Modal
                    isOpen={isSubmissionsModalOpen}
                    onClose={() => setIsSubmissionsModalOpen(false)}
                    title={`Submissions: ${selectedAssignmentForSubmissions?.title}`}
                    width="w-[90%] max-w-5xl"
                >
                    <div className="p-6">
                        {isLoadingSubmissions ? (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#010080]"></div>
                            </div>
                        ) : submissions?.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">
                                No submissions yet for this assignment.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Left Side: List of submissions */}
                                <div className={`md:col-span-1 border-r pr-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                    <div className="space-y-2">
                                        {submissions?.map(sub => (
                                            <button
                                                key={sub.id}
                                                onClick={() => handleGradeClick(sub)}
                                                className={`w-full text-left p-3 rounded-xl transition-all ${gradingSubmission?.id === sub.id
                                                    ? 'bg-[#010080] text-white shadow-lg scale-[1.02]'
                                                    : isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                                                    }`}
                                            >
                                                <div className="font-semibold truncate">{sub.student_name}</div>
                                                <div className={`text-xs ${gradingSubmission?.id === sub.id ? 'text-blue-100' : 'text-gray-500'}`}>
                                                    {sub.status === 'graded' ? `Graded: ${sub.score}/${selectedAssignmentForSubmissions.total_points}` : 'Pending Grade'}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Side: Submission Detail & Grading Form */}
                                <div className="md:col-span-2">
                                    {gradingSubmission ? (
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border dark:border-gray-700">
                                                <div>
                                                    <h3 className="font-bold text-lg">{gradingSubmission.student_name}</h3>
                                                    <p className="text-sm opacity-60">Submitted on: {new Date(gradingSubmission.submission_date).toLocaleString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs uppercase font-bold opacity-40">Status</div>
                                                    <div className={`text-sm font-bold ${gradingSubmission.status === 'graded' ? 'text-green-500' : 'text-yellow-500'}`}>
                                                        {gradingSubmission.status.toUpperCase()}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={`p-6 rounded-2xl border shadow-inner min-h-[300px] overflow-auto whitespace-pre-wrap font-serif text-lg leading-relaxed ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'
                                                }`}>
                                                {gradingSubmission.content}
                                            </div>

                                            <form onSubmit={handleGradeSubmit} className={`p-6 rounded-2xl border space-y-4 ${isDark ? 'bg-gray-800 border-gray-700 shadow-xl' : 'bg-blue-50/30 border-blue-100 shadow-sm'}`}>
                                                <h4 className="font-bold text-[#010080] dark:text-blue-400">Grade & Feedback</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    <div className="md:col-span-1">
                                                        <label className="block text-xs font-bold uppercase opacity-60 mb-1">Score / {selectedAssignmentForSubmissions.total_points}</label>
                                                        <input
                                                            type="number"
                                                            required
                                                            max={selectedAssignmentForSubmissions.total_points}
                                                            value={gradeData.score}
                                                            onChange={(e) => setGradeData({ ...gradeData, score: e.target.value })}
                                                            className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#010080] focus:outline-none ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`}
                                                        />
                                                    </div>
                                                    <div className="md:col-span-3">
                                                        <label className="block text-xs font-bold uppercase opacity-60 mb-1">Feedback to Student</label>
                                                        <textarea
                                                            rows="2"
                                                            required
                                                            placeholder="Great work! Focus on..."
                                                            value={gradeData.feedback}
                                                            onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                                                            className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#010080] focus:outline-none ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex justify-end">
                                                    <button
                                                        type="submit"
                                                        className="px-8 py-3 bg-[#010080] text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg flex items-center gap-2"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Assign Grade
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                                            <svg className="w-20 h-20 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                            <p className="text-xl font-medium">Select a student from the left to grade their work</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </Modal>
            </div>
        </div>
    );
}
