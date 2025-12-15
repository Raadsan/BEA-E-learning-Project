"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGetPlacementTestByIdQuery, useUpdatePlacementTestMutation } from "@/redux/api/placementTestApi";
import AdminHeader from "@/components/AdminHeader";
import { useToast } from "@/components/Toast";
import Loader from "@/components/Loader";

export default function EditPlacementTestPage() {
    const router = useRouter();
    const { id } = useParams();
    const { showToast } = useToast();

    // Fetch existing test data
    const { data: test, isLoading: isFetching, error } = useGetPlacementTestByIdQuery(id);
    const [updateTest, { isLoading: isUpdating }] = useUpdatePlacementTestMutation();

    const [testData, setTestData] = useState({
        title: "",
        description: "",
        duration_minutes: 60,
        status: "active",
    });

    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState({
        questionText: "",
        options: ["", "", "", ""],
        correctOption: 0,
    });

    // Populate form when data fetches
    useEffect(() => {
        if (test) {
            setTestData({
                title: test.title,
                description: test.description || "",
                duration_minutes: test.duration_minutes,
                status: test.status,
            });
            // Ensure questions is an array if fetched
            setQuestions(Array.isArray(test.questions) ? test.questions : []);
        }
    }, [test]);

    const handleTestChange = (e) => {
        setTestData({ ...testData, [e.target.name]: e.target.value });
    };

    const handleQuestionChange = (e) => {
        setCurrentQuestion({ ...currentQuestion, questionText: e.target.value });
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...currentQuestion.options];
        newOptions[index] = value;
        setCurrentQuestion({ ...currentQuestion, options: newOptions });
    };

    const addQuestion = () => {
        if (!currentQuestion.questionText || currentQuestion.options.some((opt) => !opt)) {
            showToast("Please fill in the question and all options.", "error");
            return;
        }
        setQuestions([...questions, currentQuestion]);
        setCurrentQuestion({
            questionText: "",
            options: ["", "", "", ""],
            correctOption: 0,
        });
        showToast("Question added successfully", "success");
    };

    const removeQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (questions.length === 0) {
            showToast("Please add at least one question.", "error");
            return;
        }

        try {
            await updateTest({ id, ...testData, questions }).unwrap();
            showToast("Test updated successfully!", "success");
            router.push("/portal/admin/assessments/placement-tests");
        } catch (err) {
            showToast("Failed to update test.", "error");
            console.error(err);
        }
    };

    if (isFetching) return <div className="flex justify-center items-center h-screen"><Loader /></div>;
    if (error) return <div className="p-8 text-center text-red-500">Error loading test details.</div>;

    return (
        <div className="flex-1 min-h-screen bg-gray-100 flex flex-col text-gray-800">
            <AdminHeader />
            <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full">
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="text-gray-500 hover:text-gray-900 mb-4 flex items-center gap-2 transition-colors font-medium hover:-translate-x-1 transform duration-200"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Test Details
                    </button>
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900">Edit Placement Test</h1>
                        <button
                            onClick={handleSubmit}
                            disabled={isUpdating || questions.length === 0}
                            className="bg-[#673ab7] hover:bg-[#5e35b1] text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                        >
                            {isUpdating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Updating...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Test Details & Question Form */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* 1. Test Info - Google Form Header Style */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-t-[10px] border-t-[#673ab7]">
                            <h2 className="text-xl font-normal mb-6 text-gray-900 flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#673ab7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Test Details
                            </h2>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Test Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={testData.title}
                                        onChange={handleTestChange}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#673ab7]/20 focus:border-[#673ab7] outline-none transition-colors"
                                        placeholder="Test Title e.g., General English Placement Test"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                    <textarea
                                        name="description"
                                        value={testData.description}
                                        onChange={handleTestChange}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#673ab7]/20 focus:border-[#673ab7] outline-none transition-colors"
                                        rows="3"
                                        placeholder="Enter a brief description..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (minutes)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="duration_minutes"
                                                value={testData.duration_minutes}
                                                onChange={handleTestChange}
                                                className="w-full border border-gray-300 rounded-lg pl-4 pr-12 py-2 focus:ring-2 focus:ring-[#673ab7]/20 focus:border-[#673ab7] outline-none transition-colors"
                                                min="1"
                                            />
                                            <span className="absolute right-4 top-2.5 text-gray-500 text-sm pointer-events-none">min</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                                        <select
                                            name="status"
                                            value={testData.status}
                                            onChange={handleTestChange}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#673ab7]/20 focus:border-[#673ab7] outline-none transition-colors bg-white cursor-pointer"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Add Question Form - Card Style */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h2 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Add New Question
                            </h2>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Question Text</label>
                                    <textarea
                                        value={currentQuestion.questionText}
                                        onChange={handleQuestionChange}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-colors"
                                        rows="2"
                                        placeholder="Type your question here..."
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-sm font-semibold text-gray-700">Options <span className="text-gray-400 font-normal">(Select correct answer)</span></label>
                                    {currentQuestion.options.map((opt, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="correctOption"
                                                checked={currentQuestion.correctOption === idx}
                                                onChange={() => setCurrentQuestion({ ...currentQuestion, correctOption: idx })}
                                                className="w-4 h-4 text-blue-600 focus:ring-blue-600 border-gray-300 cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={opt}
                                                onChange={(e) => handleOptionChange(idx, e.target.value)}
                                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-colors"
                                                placeholder={`Option ${idx + 1}`}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={addQuestion}
                                    className="w-full mt-4 bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 hover:text-gray-900 py-2.5 rounded-lg font-medium transition-colors"
                                >
                                    + Add Question
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Question Preview & Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-8">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-gray-900">Questions List <span className="ml-1 text-gray-500 font-normal">({questions.length})</span></h2>
                            </div>

                            {questions.length === 0 ? (
                                <div className="text-center py-12 px-4 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-100">
                                    <p className="text-sm">Questions you add will appear here.</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
                                    {questions.map((q, i) => (
                                        <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-100 relative group hover:bg-gray-100 transition-colors">
                                            <button
                                                onClick={() => removeQuestion(i)}
                                                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-red-50 rounded"
                                                title="Remove Question"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                            <div className="flex gap-3">
                                                <span className="flex-shrink-0 w-6 h-6 bg-white text-gray-600 border border-gray-200 rounded flex items-center justify-center text-xs font-bold mt-0.5">
                                                    {i + 1}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm text-gray-900 mb-2 leading-snug break-words">
                                                        {q.questionText}
                                                    </p>
                                                    <ul className="space-y-1">
                                                        {q.options.map((opt, oid) => (
                                                            <li
                                                                key={oid}
                                                                className={`text-xs flex items-center gap-2 ${oid === q.correctOption ? 'text-green-700 font-medium' : 'text-gray-500'}`}
                                                            >
                                                                <span className={`w-1.5 h-1.5 rounded-full ${oid === q.correctOption ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                                                <span className="truncate">{opt}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isUpdating || questions.length === 0}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {isUpdating ? "Updating..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
