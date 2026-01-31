"use client";

import { useState } from "react";
import {
    useGetQuestionsQuery,
    useCreateQuestionMutation,
    useUpdateQuestionMutation,
    useDeleteQuestionMutation,
} from "@/redux/api/reviewApi";
import toast from "react-hot-toast";
import DataTable from "@/components/DataTable";

export default function TeacherQuestionsPage() {
    const { data: questions, isLoading, refetch } = useGetQuestionsQuery("teacher");
    const [createQuestion] = useCreateQuestionMutation();
    const [updateQuestion] = useUpdateQuestionMutation();
    const [deleteQuestion] = useDeleteQuestionMutation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [formData, setFormData] = useState({ question_text: "" });

    const handleOpenModal = (question = null) => {
        if (question) {
            setEditingQuestion(question);
            setFormData({ question_text: question.question_text });
        } else {
            setEditingQuestion(null);
            setFormData({ question_text: "" });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingQuestion(null);
        setFormData({ question_text: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingQuestion) {
                await updateQuestion({
                    type: "teacher",
                    id: editingQuestion.id,
                    question_text: formData.question_text,
                }).unwrap();
                toast.success("Question updated successfully");
            } else {
                await createQuestion({
                    type: "teacher",
                    question_text: formData.question_text,
                }).unwrap();
                toast.success("Question created successfully");
            }
            refetch();
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save question:", error);
            toast.error("Failed to save question");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this question?")) {
            try {
                await deleteQuestion({ type: "teacher", id }).unwrap();
                toast.success("Question deleted successfully");
                refetch();
            } catch (error) {
                console.error("Failed to delete question:", error);
                toast.error("Failed to delete question");
            }
        }
    };

    const handleToggleActive = async (question) => {
        try {
            await updateQuestion({
                type: "teacher",
                id: question.id,
                question_text: question.question_text,
                is_active: !question.is_active,
            }).unwrap();
            toast.success(`Question ${question.is_active ? 'deactivated' : 'activated'} successfully`);
            refetch();
        } catch (error) {
            console.error("Failed to toggle status:", error);
            toast.error("Failed to update status");
        }
    };

    const columns = [
        { key: "question_text", label: "Question Text", sortable: true },
        {
            key: "is_active",
            label: "Status",
            render: (value, row) => (
                <button
                    onClick={() => handleToggleActive(row)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${value
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                >
                    {value ? 'Active' : 'Inactive'}
                </button>
            ),
            sortable: true
        },
        {
            key: "actions",
            label: "Actions",
            render: (_, row) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => handleOpenModal(row)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            ),
            sortable: false
        }
    ];

    return (
        <div className="p-6">
            <DataTable
                title="Teacher Review Questions"
                columns={columns}
                data={questions || []}
                isLoading={isLoading}
                searchPlaceholder="Search questions..."
                itemsPerPage={10}
                onAddClick={() => handleOpenModal()}
                showAddButton={true}
            />

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                                {editingQuestion ? 'Edit Question' : 'Create New Question'}
                            </h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Question Text
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    value={formData.question_text}
                                    onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Enter the question text..."
                                />
                            </div>
                            <div className="flex items-center justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm font-medium"
                                >
                                    {editingQuestion ? 'Save Changes' : 'Create Question'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
