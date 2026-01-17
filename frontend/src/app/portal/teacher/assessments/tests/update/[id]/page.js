"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
    useUpdateAssignmentMutation,
    useGetAssignmentsQuery
} from "@/redux/api/assignmentApi";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useGetClassesQuery } from "@/redux/api/classApi";
import { useToast } from "@/components/Toast";
import { useDarkMode } from "@/context/ThemeContext";


export default function UpdateTestPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const id = params.id;
    const router = useRouter();
    const { showToast } = useToast();
    const { isDark } = useDarkMode();

    const { data: assignments } = useGetAssignmentsQuery({ type: 'test' });
    const { data: programs } = useGetProgramsQuery();
    const { data: classes } = useGetClassesQuery();
    const [updateAssignment, { isLoading: isUpdating }] = useUpdateAssignmentMutation();

    const existingTest = assignments?.find(a => a.id.toString() === id);

    const [testData, setTestData] = useState({
        title: "",
        description: "",
        due_date: "",
        class_id: "",
        program_id: "",
        total_points: 0,
        status: "active",
        duration: 60,
    });

    const [questions, setQuestions] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState({
        type: "mcq",
        questionText: "",
        options: ["", "", "", ""],
        correctOption: 0,
        points: 1,
    });

    useEffect(() => {
        if (existingTest) {
            setTestData({
                title: existingTest.title,
                description: existingTest.description,
                due_date: existingTest.due_date ? new Date(existingTest.due_date).toISOString().split('T')[0] : "",
                class_id: existingTest.class_id,
                program_id: existingTest.program_id,
                total_points: existingTest.total_points,
                status: existingTest.status || "active",
                duration: existingTest.duration || 60,
            });
            const q = typeof existingTest.questions === 'string'
                ? JSON.parse(existingTest.questions)
                : (existingTest.questions || []);
            setQuestions(q);
        }
    }, [existingTest]);

    // Re-calculate total points whenever questions change
    useEffect(() => {
        const total = questions.reduce((sum, q) => sum + (parseInt(q.points) || 1), 0);
        setTestData(prev => ({ ...prev, total_points: total }));
    }, [questions]);

    const handleDataChange = (e) => {
        setTestData({ ...testData, [e.target.name]: e.target.value });
    };

    const handleTypeChange = (type) => {
        let newQuestion = { ...currentQuestion, type };
        if (type === "true_false") {
            newQuestion.options = ["True", "False"];
            newQuestion.correctOption = 0;
        } else if (type === "mcq") {
            newQuestion.options = ["", "", "", ""];
            newQuestion.correctOption = 0;
        } else if (type === "short_answer") {
            newQuestion.options = [];
            newQuestion.correctOption = "";
        }
        setCurrentQuestion(newQuestion);
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...currentQuestion.options];
        newOptions[index] = value;
        setCurrentQuestion({ ...currentQuestion, options: newOptions });
    };

    const handleSaveQuestion = () => {
        if (!currentQuestion.questionText) {
            showToast("Question text is required.", "error");
            return;
        }
        if (currentQuestion.type === 'mcq' && currentQuestion.options.some(opt => !opt)) {
            showToast("Please fill all MCQ options.", "error");
            return;
        }
        if (currentQuestion.type === 'short_answer' && !currentQuestion.correctOption) {
            showToast("Please provide a correct answer for short answer questions.", "error");
            return;
        }

        if (editingIndex !== null) {
            const updated = [...questions];
            updated[editingIndex] = currentQuestion;
            setQuestions(updated);
            showToast("Question updated", "success");
        } else {
            setQuestions([...questions, currentQuestion]);
            showToast("Question added", "success");
        }
        resetQuestionForm();
    };

    const resetQuestionForm = () => {
        setCurrentQuestion({
            type: "mcq",
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const removeQuestion = (e, index) => {
        e.stopPropagation();
        setQuestions(questions.filter((_, i) => i !== index));
        if (editingIndex === index) resetQuestionForm();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (questions.length === 0) {
            showToast("Please add at least one question.", "error");
            return;
        }

        const payload = {
            ...testData,
            due_date: testData.due_date === "" ? null : testData.due_date,
            type: 'test',
            questions: questions,
            status: testData.status.toLowerCase()
        };

        try {
            await updateAssignment({ id, ...payload }).unwrap();
            showToast("Exam updated successfully!", "success");
            router.push("/portal/teacher/assessments/tests");
        } catch (err) {
            showToast(err.data?.error || "Failed to update Exam.", "error");
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
                                Update Exam
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                                Modify the existing exam details and questions.
                            </p>
                        </div>
                        <button
                            onClick={() => router.push("/portal/teacher/assessments/tests")}
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
                                    <h2 className="text-xl font-semibold">Exam Settings</h2>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Exam Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={testData.title}
                                            onChange={handleDataChange}
                                            placeholder="e.g., Mid-Term Assessment"
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
                                            rows="4"
                                            placeholder="Provide clear instructions for students..."
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

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
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
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Duration (Min)</label>
                                            <input
                                                type="number"
                                                name="duration"
                                                value={testData.duration}
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
                                                <option value="closed">Closed</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="pt-6">
                                        <button
                                            onClick={handleSubmit}
                                            disabled={isUpdating}
                                            className={`w-full py-4 rounded-xl text-white font-semibold transition-all shadow-lg active:scale-[0.98] ${isUpdating ? 'bg-gray-400' : 'bg-[#673ab7] hover:bg-[#5e35b1] shadow-purple-900/20'}`}
                                        >
                                            {isUpdating ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    Updating...
                                                </div>
                                            ) : (
                                                "Save Exam Changes"
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

                                    {/* Pill Switcher */}
                                    <div className="flex bg-gray-100 dark:bg-gray-900/50 p-1.5 rounded-2xl gap-1 shadow-inner border border-gray-200/50 dark:border-gray-700">
                                        {['mcq', 'true_false', 'short_answer'].map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => handleTypeChange(type)}
                                                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-[0.1em] rounded-xl transition-all ${currentQuestion.type === type
                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                                    }`}
                                            >
                                                {type === 'mcq' ? 'MCQ' : type === 'true_false' ? 'TRUE FALSE' : 'SHORT ANSWER'}
                                            </button>
                                        ))}
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
                                            placeholder="Enter your question here..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Weight (Points)</label>
                                            <input
                                                type="number"
                                                value={currentQuestion.points}
                                                onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) || 1 })}
                                                className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                                min="1"
                                            />
                                        </div>
                                    </div>

                                    {currentQuestion.type === 'mcq' && (
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
                                    )}

                                    {currentQuestion.type === 'true_false' && (
                                        <div className="space-y-4">
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Correct Selection</label>
                                            <div className="grid grid-cols-2 gap-6">
                                                {currentQuestion.options.map((opt, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => setCurrentQuestion({ ...currentQuestion, correctOption: idx })}
                                                        className={`py-4 rounded-xl border-2 font-semibold transition-all ${currentQuestion.correctOption === idx
                                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20'
                                                            : (isDark ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-blue-300')
                                                            }`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {currentQuestion.type === 'short_answer' && (
                                        <div className="space-y-4">
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Reference Answer</label>
                                            <input
                                                type="text"
                                                value={currentQuestion.correctOption}
                                                onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctOption: e.target.value })}
                                                placeholder="What is the exact answer?"
                                                className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                            />
                                        </div>
                                    )}

                                    <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                                        <button
                                            type="button"
                                            onClick={handleSaveQuestion}
                                            className={`flex-1 py-3.5 rounded-xl font-semibold transition-all active:scale-[0.98] ${editingIndex !== null ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
                                        >
                                            {editingIndex !== null ? 'Update Item' : '+ Add to Bank'}
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

                        {/* Right Column: Preview */}
                        <div className="lg:col-span-1">
                            <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6 sticky top-24`}>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-lg font-semibold flex items-center gap-2">
                                        Review Bank
                                        <span className="text-gray-400 font-normal">({questions.length})</span>
                                    </h2>
                                    <div className="px-3 py-1 bg-purple-50 dark:bg-purple-900/40 text-[#673ab7] dark:text-purple-300 rounded-lg text-xs font-bold uppercase">
                                        {testData.total_points} PTS
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
                                                        <div className="flex flex-wrap gap-2">
                                                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#673ab7] dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-1.5 py-0.5 rounded">
                                                                {q.type.replace('_', ' ')}
                                                            </span>
                                                            <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                                                                {q.points || 1} PTS
                                                            </span>
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
