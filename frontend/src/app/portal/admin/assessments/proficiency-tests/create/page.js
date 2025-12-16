"use client";

import { useState } from "react";
import { useCreateProficiencyTestMutation } from "@/redux/api/proficiencyTestApi";
import AdminHeader from "@/components/AdminHeader";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { useDarkMode } from "@/context/ThemeContext";

// Sample English proficiency questions
const sampleQuestions = [
    {
        id: 1,
        type: "multiple_choice",
        question: "She _____ to the store every morning.",
        options: ["go", "goes", "going", "gone"],
        correct_answer: "goes",
        points: 1
    },
    {
        id: 2,
        type: "multiple_choice",
        question: "I _____ my homework yesterday.",
        options: ["do", "did", "done", "doing"],
        correct_answer: "did",
        points: 1
    },
    {
        id: 3,
        type: "multiple_choice",
        question: "They _____ playing football when it started raining.",
        options: ["was", "were", "is", "are"],
        correct_answer: "were",
        points: 1
    },
    {
        id: 4,
        type: "direct_answer",
        question: "What is the past tense of 'run'?",
        correct_answer: "ran",
        points: 1
    },
    {
        id: 5,
        type: "direct_answer",
        question: "Complete the sentence: The capital of England is _____.",
        correct_answer: "London",
        points: 1
    },
    {
        id: 6,
        type: "essay",
        question: "Write a short paragraph (50-100 words) about your favorite hobby and why you enjoy it.",
        points: 5
    }
];

export default function CreateProficiencyTestPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const { isDark } = useDarkMode();
    const [createTest, { isLoading }] = useCreateProficiencyTestMutation();

    const [formData, setFormData] = useState({
        title: "English Proficiency Test - Intermediate",
        description: "Comprehensive test to assess intermediate English language skills",
        duration_minutes: 45,
        level: "Intermediate",
        status: "active"
    });

    const [questions, setQuestions] = useState(sampleQuestions);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleQuestionChange = (index, field, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index][field] = value;
        setQuestions(updatedQuestions);
    };

    const handleOptionChange = (questionIndex, optionIndex, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].options[optionIndex] = value;
        setQuestions(updatedQuestions);
    };

    const addQuestion = () => {
        const newQuestion = {
            id: questions.length + 1,
            type: "multiple_choice",
            question: "",
            options: ["", "", "", ""],
            correct_answer: "",
            points: 1
        };
        setQuestions([...questions, newQuestion]);
    };

    const removeQuestion = (index) => {
        const updatedQuestions = questions.filter((_, i) => i !== index);
        setQuestions(updatedQuestions);
    };

    const changeQuestionType = (index, newType) => {
        const updatedQuestions = [...questions];
        const baseQuestion = {
            id: updatedQuestions[index].id,
            type: newType,
            question: updatedQuestions[index].question,
            points: updatedQuestions[index].points
        };

        if (newType === "multiple_choice") {
            updatedQuestions[index] = {
                ...baseQuestion,
                options: ["", "", "", ""],
                correct_answer: ""
            };
        } else if (newType === "direct_answer") {
            updatedQuestions[index] = {
                ...baseQuestion,
                correct_answer: ""
            };
        } else if (newType === "essay") {
            updatedQuestions[index] = baseQuestion;
        }

        setQuestions(updatedQuestions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.title.trim()) {
            showToast("Please enter a test title", "error");
            return;
        }

        if (questions.length === 0) {
            showToast("Please add at least one question", "error");
            return;
        }

        // Validate questions
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.question.trim()) {
                showToast(`Question ${i + 1} is empty`, "error");
                return;
            }
            if (q.type === "multiple_choice") {
                if (q.options.some(opt => !opt.trim())) {
                    showToast(`Question ${i + 1}: All options must be filled`, "error");
                    return;
                }
                if (!q.correct_answer) {
                    showToast(`Question ${i + 1}: Please select the correct answer`, "error");
                    return;
                }
            }
        }

        try {
            await createTest({
                ...formData,
                questions
            }).unwrap();
            showToast("Proficiency test created successfully!", "success");
            router.push("/portal/admin/assessments/proficiency-tests");
        } catch (error) {
            showToast("Failed to create test", "error");
            console.error(error);
        }
    };

    return (
        <div className={`flex-1 min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <AdminHeader />
            <main className="flex-1 overflow-y-auto mt-6">
                <div className="w-full px-8 py-6">
                    {/* Header */}
                    <div className="mb-8 flex flex-col gap-2 max-w-4xl mx-auto">
                        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Create Proficiency Test</h1>
                        <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Create a new English proficiency test with multiple question types.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                        {/* Basic Information */}
                        <div className={`rounded-xl shadow-md p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Test Information</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Test Title *
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Duration (minutes) *
                                        </label>
                                        <input
                                            type="number"
                                            name="duration_minutes"
                                            value={formData.duration_minutes}
                                            onChange={handleInputChange}
                                            min="1"
                                            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Level *
                                        </label>
                                        <select
                                            name="level"
                                            value={formData.level}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                        >
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Advanced">Advanced</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Status
                                        </label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="archived">Archived</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Questions Section */}
                        <div className={`rounded-xl shadow-md p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Questions ({questions.length})</h2>
                                <button
                                    type="button"
                                    onClick={addQuestion}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Question
                                </button>
                            </div>

                            <div className="space-y-6">
                                {questions.map((question, index) => (
                                    <div key={question.id} className={`p-4 rounded-lg border-2 ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Question {index + 1}</h3>
                                            <button
                                                type="button"
                                                onClick={() => removeQuestion(index)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        Question Type
                                                    </label>
                                                    <select
                                                        value={question.type}
                                                        onChange={(e) => changeQuestionType(index, e.target.value)}
                                                        className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                                    >
                                                        <option value="multiple_choice">Multiple Choice</option>
                                                        <option value="direct_answer">Direct Answer</option>
                                                        <option value="essay">Essay</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        Points
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={question.points}
                                                        onChange={(e) => handleQuestionChange(index, 'points', parseInt(e.target.value))}
                                                        min="1"
                                                        className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    Question Text *
                                                </label>
                                                <textarea
                                                    value={question.question}
                                                    onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                                                    rows={2}
                                                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                                    required
                                                />
                                            </div>

                                            {question.type === "multiple_choice" && (
                                                <>
                                                    <div>
                                                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                            Options
                                                        </label>
                                                        <div className="space-y-2">
                                                            {question.options.map((option, optIndex) => (
                                                                <div key={optIndex} className="flex items-center gap-2">
                                                                    <input
                                                                        type="radio"
                                                                        name={`correct-${index}`}
                                                                        checked={question.correct_answer === option}
                                                                        onChange={() => handleQuestionChange(index, 'correct_answer', option)}
                                                                        className="w-4 h-4 text-blue-600"
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        value={option}
                                                                        onChange={(e) => handleOptionChange(index, optIndex, e.target.value)}
                                                                        placeholder={`Option ${optIndex + 1}`}
                                                                        className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                                                        required
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            Select the radio button next to the correct answer
                                                        </p>
                                                    </div>
                                                </>
                                            )}

                                            {question.type === "direct_answer" && (
                                                <div>
                                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        Correct Answer
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={question.correct_answer || ""}
                                                        onChange={(e) => handleQuestionChange(index, 'correct_answer', e.target.value)}
                                                        className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                                        placeholder="Enter the correct answer"
                                                    />
                                                </div>
                                            )}

                                            {question.type === "essay" && (
                                                <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/20 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>
                                                    <p className="text-sm">
                                                        Essay questions will be manually graded. Students will have a text area to write their response.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-[#010080] hover:bg-[#000066] text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Creating..." : "Create Test"}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className={`px-8 py-3 rounded-lg font-semibold transition-colors ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
