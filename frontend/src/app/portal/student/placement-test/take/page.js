"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useGetPlacementTestByIdQuery,
  useSubmitPlacementTestMutation,
  useGetStudentPlacementResultsQuery
} from "@/redux/api/placementTestApi";

export default function TakePlacementTestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const testId = searchParams.get("id");

  const { data: test, isLoading: testLoading, error: fetchError } = useGetPlacementTestByIdQuery(testId, {
    skip: !testId,
  });
  const [submitTest, { isLoading: isSubmitting }] = useSubmitPlacementTestMutation();

  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
  const { data: results, isLoading: resultsLoading } = useGetStudentPlacementResultsQuery(user.id || user.student_id, {
    skip: !user.id && !user.student_id,
  });

  const isLoading = testLoading || resultsLoading;

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null); // Fix: Start as null
  const [isTimeUp, setIsTimeUp] = useState(false);

  const questions = useMemo(() => {
    if (!test) return [];
    return typeof test.questions === "string" ? JSON.parse(test.questions) : test.questions;
  }, [test]);

  useEffect(() => {
    if (results && testId) {
      const alreadyTaken = results.find(r => r.test_id === parseInt(testId));
      if (alreadyTaken) {
        router.replace(`/portal/student/placement-test/results?id=${alreadyTaken.id}`);
      }
    }
  }, [results, testId, router]);

  useEffect(() => {
    if (test && test.duration_minutes && timeRemaining === null) {
      setTimeRemaining(test.duration_minutes * 60);
    }
  }, [test, timeRemaining]);

  useEffect(() => {
    if (timeRemaining === null) return;

    if (timeRemaining <= 0) {
      if (!isTimeUp) {
        setIsTimeUp(true);
        handleAutoSubmit();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isTimeUp]);

  const handleAutoSubmit = async () => {
    await performSubmit(true);
  };

  const performSubmit = async (silent = false) => {
    if (!silent && !window.confirm("Are you sure you want to submit your test?")) return;

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const result = await submitTest({
        test_id: testId,
        student_id: user.id || user.student_id,
        answers: answers,
      }).unwrap();

      router.push(`/portal/student/placement-test/results?id=${result.id}`);
    } catch (err) {
      console.error("Failed to submit test:", err);
      if (!silent) alert("Failed to submit test. Please try again.");
    }
  };

  const handleAnswerChange = (idx, value) => {
    setAnswers((prev) => ({
      ...prev,
      [idx]: value,
    }));
  };

  const formatTime = (seconds) => {
    if (seconds === null) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading || !test) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f0ebf8]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#673ab7]"></div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIdx];
  const isLastQuestion = currentQuestionIdx === questions.length - 1;
  const hasAnsweredCurrent = answers[currentQuestionIdx] !== undefined;

  return (
    <main className="flex-1 min-h-screen bg-gray-50 py-8 px-4 font-sans text-[#202124]">
      <div className="max-w-[770px] mx-auto space-y-4">
        {/* Google Forms Style Header Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <div className="h-2.5 bg-[#673ab7] w-full" />
          <div className="p-8">
            <h1 className="text-3xl font-medium mb-3">{test.title}</h1>
            <p className="text-sm text-gray-600 mb-6">{test.description || "Required"}</p>
            <div className="flex items-center justify-between border-t pt-4 text-xs font-medium uppercase tracking-wider text-gray-500">
              <div className="flex items-center gap-2">
                <span className="text-red-500">* Indicates required question</span>
              </div>
              <div
                className={`px-4 py-2 rounded-lg bg-gray-50 border flex items-center gap-2 ${timeRemaining !== null && timeRemaining < 300
                  ? "text-red-600 border-red-200 animate-pulse"
                  : "text-gray-700"
                  }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-bold font-mono">{formatTime(timeRemaining)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Card (Subtle) */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Page {currentQuestionIdx + 1} of {questions.length}
          </span>
          <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#673ab7]/60 transition-all duration-300"
              style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 relative group transition-all hover:shadow-md">
          <div className="mb-6 flex justify-between items-start">
            <div className="flex items-start gap-1">
              <span className="text-base font-medium">{currentQuestionIdx + 1}. </span>
              <h2 className="text-base leading-relaxed whitespace-pre-wrap flex-1">
                {currentQuestion &&
                  (currentQuestion.questionText || currentQuestion.question || "")
                    .split("_____")
                    .map((part, i, arr) => (
                      <React.Fragment key={i}>
                        {part}
                        {i < arr.length - 1 && (
                          <span className="inline-block min-w-[80px] border-b-2 border-[#673ab7] mx-1 text-[#673ab7] font-bold text-center">
                            {answers[currentQuestionIdx] || " "}
                          </span>
                        )}
                      </React.Fragment>
                    ))}
                <span className="text-red-500 ml-1">*</span>
              </h2>
            </div>
            {currentQuestion?.points && (
              <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                {currentQuestion.points} points
              </span>
            )}
          </div>

          <div className="space-y-4 ml-2">
            {currentQuestion?.options?.map((option, idx) => (
              <label key={idx} className="flex items-center gap-3 group cursor-pointer">
                <div className="relative flex items-center justify-center">
                  <input
                    type="radio"
                    name={`q-${currentQuestionIdx}`}
                    value={option}
                    checked={answers[currentQuestionIdx] === option}
                    onChange={() => handleAnswerChange(currentQuestionIdx, option)}
                    className="appearance-none w-5 h-5 border-2 border-gray-300 rounded-full checked:border-[#673ab7] transition-all cursor-pointer"
                  />
                  {answers[currentQuestionIdx] === option && (
                    <div className="absolute w-2.5 h-2.5 bg-[#673ab7] rounded-full" />
                  )}
                </div>
                <span className="text-sm text-gray-700 font-normal group-hover:text-black transition-colors">
                  {option}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentQuestionIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIdx === 0}
              className={`px-6 py-2 rounded font-medium text-sm transition-all ${currentQuestionIdx === 0
                ? "text-gray-400 cursor-not-allowed"
                : "text-[#673ab7] hover:bg-[#673ab7]/5"
                }`}
            >
              Back
            </button>

            {!isLastQuestion ? (
              <button
                onClick={() => setCurrentQuestionIdx((prev) => prev + 1)}
                disabled={!hasAnsweredCurrent}
                className={`px-6 py-2 rounded font-medium text-sm transition-all shadow ${!hasAnsweredCurrent
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                  : "bg-[#673ab7] text-white hover:bg-[#5e35b1]"
                  }`}
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => performSubmit()}
                disabled={!hasAnsweredCurrent || isSubmitting}
                className={`px-8 py-2 rounded font-medium text-sm transition-all shadow ${!hasAnsweredCurrent || isSubmitting
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                  : "bg-[#673ab7] text-white hover:bg-[#5e35b1]"
                  }`}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            )}
          </div>

          <button
            onClick={() => setAnswers({ ...answers, [currentQuestionIdx]: undefined })}
            className="text-gray-500 text-xs hover:text-gray-700 transition-colors"
          >
            Clear selection
          </button>
        </div>

        {/* Mandatory Warning */}
        {!hasAnsweredCurrent && (
          <div className="p-4 bg-[#fce8e6] border border-[#f5c6cb] rounded-lg animate-fade-in flex items-center gap-3">
            <svg className="w-5 h-5 text-[#d93025]" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs text-[#d93025] font-medium">This is a required question</span>
          </div>
        )}

        <footer className="pt-10 pb-20 text-center text-xs text-gray-500">
          Never submit passwords through Google Forms.
        </footer>
      </div>
    </main>
  );
}
