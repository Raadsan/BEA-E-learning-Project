"use client";

import StudentHeader from "../../../StudentHeader";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TakePlacementTestPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(60 * 60); // 60 minutes in seconds

  // Sample questions - in a real app, these would come from an API
  const questions = [
    {
      id: 1,
      question: "She _____ to the store every morning.",
      options: ["go", "goes", "going", "gone"]
    },
    {
      id: 2,
      question: "I _____ my homework yesterday.",
      options: ["do", "did", "done", "doing"]
    },
    {
      id: 3,
      question: "They _____ playing football when it started raining.",
      options: ["was", "were", "is", "are"]
    },
    // Add more questions as needed
  ];

  const totalQuestions = 30;
  // For demo purposes, cycle through available questions
  const currentQuestionData = questions[currentQuestion % questions.length] || questions[0];

  const handleSubmitTest = () => {
    if (window.confirm("Are you sure you want to submit the test? You cannot change your answers after submission.")) {
      // In a real app, submit answers to backend
      console.log("Submitting test with answers:", answers);
      router.push("/portal/student/placement-test/results");
    }
  };

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          // Auto-submit when time runs out
          if (window.confirm("Time is up! Your test will be submitted now.")) {
            router.push("/portal/student/placement-test/results");
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

  // Load saved answer for current question
  useEffect(() => {
    if (answers[currentQuestion]) {
      setSelectedAnswer(answers[currentQuestion]);
    } else {
      setSelectedAnswer(null);
    }
  }, [currentQuestion, answers]);

  const handleAnswerSelect = (option) => {
    setSelectedAnswer(option);
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: option,
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
      // In a real app, submit answers to backend
      console.log("Submitting test with answers:", answers);
      router.push("/portal/student/placement-test/results");
    }
  };

  return (
    <>
      <StudentHeader />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="w-full px-8 pt-6 pb-6 flex items-center justify-center min-h-full">
          <div className="bg-white rounded-xl shadow-md p-8 max-w-4xl w-full border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Placement Test</h1>
              <div className="bg-blue-100 text-gray-900 px-4 py-2 rounded-lg font-medium">
                Time Remaining: {formatTime(timeRemaining)}
              </div>
            </div>

            {/* Question Number */}
            <div className="mb-4">
              <p className="text-gray-600 font-medium">
                Question {currentQuestion + 1} of {totalQuestions}
              </p>
            </div>

            {/* Instruction */}
            <p className="text-gray-700 mb-6 font-medium">Choose the correct answer:</p>

            {/* Question */}
            <div className="mb-8">
              <p className="text-xl text-gray-900 mb-6">
                {currentQuestionData.question.split("_____").map((part, index, array) => (
                  <span key={index}>
                    {part}
                    {index < array.length - 1 && (
                      <span className="border-b-2 border-gray-900 inline-block min-w-[100px] mx-1"></span>
                    )}
                  </span>
                ))}
              </p>

              {/* Answer Options */}
              <div className="space-y-3">
                {currentQuestionData.options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedAnswer === option
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={option}
                      checked={selectedAnswer === option}
                      onChange={() => handleAnswerSelect(option)}
                      className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-900 font-medium">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {currentQuestion < totalQuestions - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={handleSubmitTest}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Submit Test
                </button>
              )}
            </div>

            {/* Submit Button (centered at bottom) */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleSubmitTest}
                className="w-full max-w-md px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Submit Test
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

