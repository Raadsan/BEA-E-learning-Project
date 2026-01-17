"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    useCreateAssignmentMutation,
    useUpdateAssignmentMutation,
    useGetAssignmentsQuery
} from "@/redux/api/assignmentApi";
import { useGetClassesQuery } from "@/redux/api/classApi";
import { useGetProgramsQuery } from "@/redux/api/programApi";

import { useToast } from "@/components/Toast";
import { useDarkMode } from "@/context/ThemeContext";

export default function CreateCourseWorkPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get("id");
    const { showToast } = useToast();
    const { isDark } = useDarkMode();

    const [createAssignment, { isLoading: isCreating }] = useCreateAssignmentMutation();
    const [updateAssignment, { isLoading: isUpdating }] = useUpdateAssignmentMutation();

    // Queries for dropdowns
    const { data: classes } = useGetClassesQuery();
    const { data: programs } = useGetProgramsQuery();

    // Fetch existing if editing
    const { data: assignments } = useGetAssignmentsQuery({ type: 'course_work' }, { skip: !editId });
    const editingAssignment = assignments?.find(a => a.id === parseInt(editId));

    const [testData, setTestData] = useState({
        title: "",
        description: "",
        due_date: "",
        class_id: "",
        program_id: "",
        total_points: 100,
        status: "active",
    });

    const [questions, setQuestions] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState({
        questionText: "",
        options: ["", "", "", ""],
        correctOption: 0,
        points: 1,
    });

    useEffect(() => {
        if (editingAssignment) {
            setTestData({
                title: editingAssignment.title,
                description: editingAssignment.description,
                due_date: editingAssignment.due_date ? new Date(editingAssignment.due_date).toISOString().split('T')[0] : "",
                class_id: editingAssignment.class_id,
                program_id: editingAssignment.program_id,
                total_points: editingAssignment.total_points,
                status: editingAssignment.status || "active",
            });
            const q = typeof editingAssignment.questions === 'string'
                ? JSON.parse(editingAssignment.questions)
                : (editingAssignment.questions || []);
            setQuestions(q);
        }
    }, [editingAssignment]);

    const handleDataChange = (e) => {
        setTestData({ ...testData, [e.target.name]: e.target.value });
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...currentQuestion.options];
        newOptions[index] = value;
        setCurrentQuestion({ ...currentQuestion, options: newOptions });
    };

    const handleSaveQuestion = () => {
        if (!currentQuestion.questionText || currentQuestion.options.some((opt) => !opt)) {
            showToast("Please fill in the question and all options.", "error");
            return;
        }

        if (editingIndex !== null) {
            const updatedQuestions = [...questions];
            updatedQuestions[editingIndex] = currentQuestion;
            setQuestions(updatedQuestions);
            setEditingIndex(null);
            showToast("Question updated successfully", "success");
        } else {
            setQuestions([...questions, currentQuestion]);
            showToast("Question added successfully", "success");
        }

        resetQuestionForm();
    };

    const resetQuestionForm = () => {
        setCurrentQuestion({
            questionText: "",
            options: ["", "", "", ""],
            correctOption: 0,
            points: 1,
        });
        setEditingIndex(null);
    };

    const handleSelectQuestion = (index) => {
        setCurrentQuestion(questions[index]);
        setEditingIndex(index);
    };

    const removeQuestion = (e, index) => {
        e.stopPropagation();
        setQuestions(questions.filter((_, i) => i !== index));
        if (editingIndex === index) {
            resetQuestionForm();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (questions.length === 0) {
            showToast("Please add at least one question.", "error");
            return;
        }

        if (!testData.class_id || !testData.program_id) {
            showToast("Please select a Class and Program.", "error");
            return;
        }

        const payload = {
            ...testData,
            due_date: testData.due_date === "" ? null : testData.due_date,
            type: 'course_work',
            questions: questions.length > 0 ? questions : null,
            status: testData.status.toLowerCase()
        };

        try {
            if (editId) {
                await updateAssignment({ id: editId, ...payload }).unwrap();
                showToast("Course Work updated successfully!", "success");
            } else {
                await createAssignment(payload).unwrap();
                showToast("Course Work created successfully!", "success");
            }
            router.push("/portal/teacher/assessments/course-work");
        } catch (err) {
            showToast(err.data?.error || "Failed to save Course Work.", "error");
        }
    };

    return (
        <div className={`min-h-screen transition-colors ${isDark ? "bg-[#03002e] text-white" : "bg-gray-100/50 text-gray-900"}`}>
            <div className="p-4 lg:p-8">
                <div className="max-w-5xl mx-auto">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className={`text-3xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {editId ? "Update" : "Create"} Course Work
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                                Create an MCQ-based assessment for your collection.
                            </p>
                        </div>
                        <button
                            onClick={() => router.push("/portal/teacher/assessments/course-work")}
                            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all text-sm font-medium ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 shadow-sm'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to List
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Form Settings */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* 1. Basic Info Card - Google Form Header Style */}
                            <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border-t-[10px] border-t-[#673ab7] p-8`}>
                                <div className="flex items-center gap-2 mb-6">
                                    <h2 className="text-xl font-semibold">General Settings</h2>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={testData.title}
                                            onChange={handleDataChange}
                                            placeholder="e.g., Week 1 Grammar Review"
                                            className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#673ab7]/20 focus:border-[#673ab7] outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Instructions</label>
                                        <textarea
                                            name="description"
                                            value={testData.description}
                                            onChange={handleDataChange}
                                            className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#673ab7]/20 focus:border-[#673ab7] outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                            rows="3"
                                            placeholder="Brief instructions for students..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Program</label>
                                            <select
                                                name="program_id"
                                                value={testData.program_id}
                                                onChange={handleDataChange}
                                                className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#673ab7]/20 focus:border-[#673ab7] outline-none transition-all bg-white dark:bg-gray-700 ${isDark ? 'border-gray-600 text-white' : 'border-gray-300'}`}
                                            >
                                                <option value="">Select Program</option>
                                                {programs?.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Class</label>
                                            <select
                                                name="class_id"
                                                value={testData.class_id}
                                                onChange={handleDataChange}
                                                className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#673ab7]/20 focus:border-[#673ab7] outline-none transition-all bg-white dark:bg-gray-700 ${isDark ? 'border-gray-600 text-white' : 'border-gray-300'}`}
                                            >
                                                <option value="">Select Class</option>
                                                {classes?.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Due Date</label>
                                            <input
                                                type="date"
                                                name="due_date"
                                                value={testData.due_date}
                                                onChange={handleDataChange}
                                                className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#673ab7]/20 focus:border-[#673ab7] outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</label>
                                            <select
                                                name="status"
                                                value={testData.status}
                                                onChange={handleDataChange}
                                                className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#673ab7]/20 focus:border-[#673ab7] outline-none transition-all bg-white dark:bg-gray-700 ${isDark ? 'border-gray-600 text-white' : 'border-gray-300'}`}
                                            >
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="pt-6">
                                        <button
                                            onClick={handleSubmit}
                                            disabled={isCreating || isUpdating}
                                            className={`w-full py-4 rounded-xl text-white font-semibold transition-all shadow-lg active:scale-[0.98] ${isCreating || isUpdating ? 'bg-gray-400' : 'bg-[#673ab7] hover:bg-[#5e35b1] shadow-purple-900/20'}`}
                                        >
                                            {isCreating || isUpdating ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    Processing...
                                                </div>
                                            ) : (
                                                editId ? "Update Course Work" : "Publish Course Work"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Question Form */}
                            <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-8 space-y-6`}>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        {editingIndex !== null ? `Edit Question #${editingIndex + 1}` : "Add Question"}
                                    </h2>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-gray-900/40 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700/50">
                                        MCQ Builder
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Question Content</label>
                                        <textarea
                                            value={currentQuestion.questionText}
                                            onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })}
                                            className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                            rows="3"
                                            placeholder="What is your question?"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Multiple Choice Options</label>
                                        {currentQuestion.options.map((opt, idx) => (
                                            <div key={idx} className="flex items-center gap-4 group">
                                                <input
                                                    type="radio"
                                                    name="correctOption"
                                                    checked={currentQuestion.correctOption === idx}
                                                    onChange={() => setCurrentQuestion({ ...currentQuestion, correctOption: idx })}
                                                    className="w-6 h-6 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={opt}
                                                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                                                    className={`flex-1 border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                                    placeholder={`Option ${idx + 1}`}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                                        <button
                                            type="button"
                                            onClick={handleSaveQuestion}
                                            className={`flex-1 py-3.5 rounded-xl font-semibold transition-all active:scale-[0.98] ${editingIndex !== null ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
                                        >
                                            {editingIndex !== null ? 'Update Item' : '+ Add Question'}
                                        </button>
                                        {editingIndex !== null && (
                                            <button
                                                type="button"
                                                onClick={resetQuestionForm}
                                                className="px-8 py-3.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 rounded-xl font-semibold transition-all border border-red-100 dark:border-transparent"
                                            >
                                                Discard
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Collection Preview */}
                        <div className="lg:col-span-1">
                            <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6 sticky top-24`}>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-lg font-semibold flex items-center gap-2">
                                        Review Bank
                                        <span className="text-gray-400 font-normal">({questions.length})</span>
                                    </h2>
                                    <div className="px-3 py-1 bg-purple-50 dark:bg-purple-900/40 text-[#673ab7] dark:text-purple-300 rounded-lg text-xs font-bold uppercase">
                                        {questions.length} Items
                                    </div>
                                </div>

                                {questions.length === 0 ? (
                                    <div className="py-12 px-6 text-center bg-gray-50 dark:bg-gray-900/40 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                        <p className="text-sm text-gray-400 font-medium italic">No items available for preview.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
                                        {questions.map((q, i) => (
                                            <div
                                                key={i}
                                                onClick={() => handleSelectQuestion(i)}
                                                className={`p-4 rounded-xl border cursor-pointer group relative transition-all ${editingIndex === i ? 'bg-[#673ab7]/5 border-[#673ab7] shadow-sm' : 'bg-gray-50 dark:bg-gray-900/40 border-gray-100 dark:border-gray-800 hover:border-blue-200 hover:bg-white dark:hover:bg-gray-800'}`}
                                            >
                                                <button
                                                    onClick={(e) => removeQuestion(e, i)}
                                                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                                                    title="Remove"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>

                                                <div className="flex gap-3">
                                                    <span className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${editingIndex === i ? 'bg-[#673ab7] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                                                        {i + 1}
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-sm leading-snug truncate mb-2">
                                                            {q.questionText}
                                                        </p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {q.options.map((opt, oid) => (
                                                                <span key={oid} className={`text-[8px] px-1.5 py-0.5 rounded font-bold border ${oid === q.correctOption ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' : 'bg-white text-gray-400 border-gray-100 dark:bg-gray-800 dark:border-gray-700'}`}>
                                                                    {opt}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
