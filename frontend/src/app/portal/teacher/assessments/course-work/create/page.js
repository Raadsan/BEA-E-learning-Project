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
import TeacherHeader from "../../../TeacherHeader";
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
            questions
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
            console.error(err);
        }
    };

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} flex flex-col`}>
            <TeacherHeader />
            <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full pt-24">
                <div className="mb-6">
                    <button
                        onClick={() => router.back()}
                        className="text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-2 transition-colors"
                    >
                        ← Back to List
                    </button>
                    <h1 className="text-3xl font-bold">{editId ? "Edit" : "Create New"} Course Work</h1>
                    <p className="text-gray-500 mt-1">Build an MCQ quiz for your students.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Test Details & Question Form */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* 1. Basic Info */}
                        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-sm border overflow-hidden`}>
                            <div className={`px-6 py-4 border-b ${isDark ? 'bg-gray-700/30 border-gray-700' : 'bg-gray-50/80 border-gray-100'}`}>
                                <h2 className="text-lg font-semibold text-blue-600">Basic Information</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={testData.title}
                                        onChange={handleDataChange}
                                        className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                        placeholder="e.g., Week 1 Science Quiz"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={testData.description}
                                        onChange={handleDataChange}
                                        className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                        rows="3"
                                        placeholder="Instructions for students..."
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Program</label>
                                        <select
                                            name="program_id"
                                            value={testData.program_id}
                                            onChange={handleDataChange}
                                            className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                            required
                                        >
                                            <option value="">Select Program</option>
                                            {programs?.map(p => (
                                                <option key={p.id} value={p.id}>{p.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Class</label>
                                        <select
                                            name="class_id"
                                            value={testData.class_id}
                                            onChange={handleDataChange}
                                            className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                            required
                                        >
                                            <option value="">Select Class</option>
                                            {classes?.map(c => (
                                                <option key={c.id} value={c.id}>{c.class_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Due Date</label>
                                        <input
                                            type="date"
                                            name="due_date"
                                            value={testData.due_date}
                                            onChange={handleDataChange}
                                            className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Total Points</label>
                                        <input
                                            type="number"
                                            name="total_points"
                                            value={testData.total_points}
                                            onChange={handleDataChange}
                                            className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                            min="1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Status</label>
                                        <select
                                            name="status"
                                            value={testData.status}
                                            onChange={handleDataChange}
                                            className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                            required
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Add/Edit Question Form */}
                        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-sm border overflow-hidden`}>
                            <div className={`px-6 py-4 border-b ${isDark ? 'bg-gray-700/30 border-gray-700' : 'bg-gray-50/80 border-gray-100'}`}>
                                <h2 className="text-lg font-semibold text-blue-600">
                                    {editingIndex !== null ? `Edit Question #${editingIndex + 1}` : "Add Question"}
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Question Text</label>
                                    <textarea
                                        value={currentQuestion.questionText}
                                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })}
                                        className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                        rows="2"
                                        placeholder="Enter the question here..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Points for this question</label>
                                    <input
                                        type="number"
                                        value={currentQuestion.points}
                                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) || 1 })}
                                        className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                        min="1"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-sm font-medium">Options (Select the correct answer)</label>
                                    {currentQuestion.options.map((opt, idx) => (
                                        <div key={idx} className="flex items-center gap-3 group">
                                            <input
                                                type="radio"
                                                name="correctOption"
                                                checked={currentQuestion.correctOption === idx}
                                                onChange={() => setCurrentQuestion({ ...currentQuestion, correctOption: idx })}
                                                className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={opt}
                                                onChange={(e) => handleOptionChange(idx, e.target.value)}
                                                className={`flex-1 border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                                placeholder={`Option ${idx + 1}`}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={handleSaveQuestion}
                                        className={`flex-1 py-3 rounded-lg font-bold transition-all ${editingIndex !== null ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
                                    >
                                        {editingIndex !== null ? 'Update Question' : '+ Add Question'}
                                    </button>
                                    {editingIndex !== null && (
                                        <button
                                            type="button"
                                            onClick={resetQuestionForm}
                                            className="px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg font-bold transition-all"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Question Preview & Summary */}
                    <div className="lg:col-span-1">
                        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg border sticky top-24 overflow-hidden`}>
                            <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'bg-gray-700/30 border-gray-700' : 'bg-gray-50/80 border-gray-100'}`}>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    Questions
                                    <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">{questions.length}</span>
                                </h2>
                            </div>
                            <div className="p-6">

                                {questions.length === 0 ? (
                                    <div className={`text-center py-12 text-gray-400 border-2 border-dashed rounded-xl ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                                        <div className="text-4xl mb-2">📝</div>
                                        <p>No questions added yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {questions.map((q, i) => (
                                            <div
                                                key={i}
                                                onClick={() => handleSelectQuestion(i)}
                                                className={`p-4 rounded-xl border relative group cursor-pointer transition-all ${editingIndex === i
                                                    ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/20 shadow-md'
                                                    : 'bg-gray-50 border-gray-200 dark:bg-gray-700/50 dark:border-gray-600 hover:border-blue-400'
                                                    }`}
                                            >
                                                <button
                                                    onClick={(e) => removeQuestion(e, i)}
                                                    className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                                >
                                                    ✕
                                                </button>
                                                <p className="font-bold text-sm mb-2 pr-6">
                                                    {i + 1}. {q.questionText}
                                                    <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold uppercase">{q.points || 1} pts</span>
                                                </p>
                                                <ul className="space-y-1">
                                                    {q.options.map((opt, oid) => (
                                                        <li
                                                            key={oid}
                                                            className={`text-xs ${oid === q.correctOption ? 'text-green-600 dark:text-green-400 font-bold' : 'text-gray-500'}`}
                                                        >
                                                            {String.fromCharCode(65 + oid)}. {opt}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-8 pt-6 border-t dark:border-gray-700">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isCreating || isUpdating || questions.length === 0}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-xl shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
                                    >
                                        {isCreating || isUpdating ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                                                Saving...
                                            </div>
                                        ) : (
                                            editId ? "Update Course Work" : "Finish & Create"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
