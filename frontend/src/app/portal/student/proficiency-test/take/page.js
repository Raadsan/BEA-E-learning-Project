"use client";

import StudentHeader from "../../../StudentHeader";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetProficiencyTestsQuery } from "@/redux/api/proficiencyTestApi";

export default function TakeProficiencyTestPage() {
    const router = useRouter();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(45 * 60); // 45 minutes in seconds

    const { data: tests, isLoading } = useGetProficiencyTestsQuery();
    const activeTest = tests?.find(t => t.status === 'active');

    const questions = activeTest?.questions || [];
    const totalQuestions = questions.length;
    const currentQuestionData = questions[currentQuestion];

    // Timer countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 0) {
                    clearInterval(timer);
                    if (window.confirm("Time is up! Your test will be submitted now.")) {
                        router.push("/portal/student/proficiency-test/results");
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [router]);

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const handleAnswerChange = (value) => {
        setAnswers((prev) => ({
            ...prev,
            [currentQuestion]: value,
        }));
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleNext = () => {
        if (currentQuestion < totalQuestions - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handleSubmitTest = () => {
        if (window.confirm("Are you sure you want to submit the test? You cannot change your answers after submission.")) {
            console.log("Submitting test with answers:", answers);
            router.push("/portal/student/proficiency-test/results");
        }
    };

    if (isLoading) {
        return (
            <>
                <StudentHeader />
                <main className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="flex justify-center items-center min-h-screen">
                        <div className="text-gray-600">Loading test...</div>
                    </div>
                </main>
            </>
        );
    }

    if (!activeTest || totalQuestions === 0) {
        return (
            <>
                <StudentHeader />
                <main className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="flex justify-center items-center min-h-screen">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Active Test Available</h2>
                            <p className="text-gray-600 mb-6">There are currently no active proficiency tests.</p>
                            <button
                                onClick={() => router.push("/portal/student/proficiency-test")}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <StudentHeader />
            <main className="flex-1 overflow-y-auto bg-[#f5f5f5]">
                <div className="w-full px-8 pt-6 pb-6 flex items-center justify-center min-h-full">
                    <div className="max-w-4xl w-full">
                        {/* Header Card with Purple Border */}
                        <div className="bg-white rounded-xl shadow-md mb-6 border-t-8 border-purple-600">
                            <div className="p-8">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{activeTest.title}</h1>
                                <p className="text-gray-600">{activeTest.description}</p>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                        Question {currentQuestion + 1} of {totalQuestions}
                                    </span>
                                    <div className="bg-purple-100 text-purple-900 px-4 py-2 rounded-lg font-medium">
                                        Time Remaining: {formatTime(timeRemaining)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Question Card */}
                        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                                        {currentQuestionData?.type === "multiple_choice" && "Multiple Choice"}
                                        {currentQuestionData?.type === "direct_answer" && "Direct Answer"}
                                        {currentQuestionData?.type === "essay" && "Essay"}
                                    </span>
                                    <span className="text-gray-600 text-sm">
                                        {currentQuestionData?.points} {currentQuestionData?.points === 1 ? 'point' : 'points'}
                                    </span>
                                </div>
                                <h2 className="text-xl text-gray-900 font-medium mb-6">
                                    {currentQuestionData?.question}
                                </h2>
                            </div>

                            {/* Multiple Choice Options */}
                            {currentQuestionData?.type === "multiple_choice" && (
                                <div className="space-y-3">
                                    {currentQuestionData.options.map((option, index) => (
                                        <label
                                            key={index}
                                            className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${answers[currentQuestion] === option
                                                    ? "border-purple-600 bg-purple-50"
                                                    : "border-gray-200 bg-white hover:border-gray-300"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="answer"
                                                value={option}
                                                checked={answers[currentQuestion] === option}
                                                onChange={(e) => handleAnswerChange(e.target.value)}
                                                className="w-5 h-5 text-purple-600 focus:ring-purple-500"
                                            />
                                            <span className="text-gray-900 font-medium">{option}</span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {/* Direct Answer Input */}
                            {currentQuestionData?.type === "direct_answer" && (
                                <div>
                                    <input
                                        type="text"
                                        value={answers[currentQuestion] || ""}
                                        onChange={(e) => handleAnswerChange(e.target.value)}
                                        placeholder="Type your answer here..."
                                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                                    />
                                </div>
                            )}

                            {/* Essay Textarea */}
                            {currentQuestionData?.type === "essay" && (
                                <div>
                                    <textarea
                                        value={answers[currentQuestion] || ""}
                                        onChange={(e) => handleAnswerChange(e.target.value)}
                                        placeholder="Write your essay here..."
                                        rows={10}
                                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none"
                                    />
                                    <p className="text-sm text-gray-500 mt-2">
                                        Recommended: 50-100 words
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between gap-4 mb-6">
                            <button
                                onClick={handlePrevious}
                                disabled={currentQuestion === 0}
                                className="px-6 py-3 bg-white text-purple-600 border-2 border-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>

                            {currentQuestion < totalQuestions - 1 ? (
                                <button
                                    onClick={handleNext}
                                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                                >
                                    Next Question
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmitTest}
                                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                                >
                                    Submit Test
                                </button>
                            )}
                        </div>

                        {/* Progress Indicator */}
                        <div className="bg-white rounded-xl shadow-md p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Progress</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {Object.keys(answers).length} / {totalQuestions} answered
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${(Object.keys(answers).length / totalQuestions) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
