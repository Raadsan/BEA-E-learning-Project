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

  const { data: test, isLoading: testLoading } = useGetPlacementTestByIdQuery(testId, {
    skip: !testId,
  });
  const [submitTest, { isLoading: isSubmitting }] = useSubmitPlacementTestMutation();

  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
  const { data: results, isLoading: resultsLoading } = useGetStudentPlacementResultsQuery(user.id || user.student_id, {
    skip: !user.id && !user.student_id,
  });

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);

  const questions = useMemo(() => {
    if (!test) return [];
    let fetchedQuestions = typeof test.questions === "string" ? JSON.parse(test.questions) : test.questions;
    if (!Array.isArray(fetchedQuestions)) return [];

    // Deterministic shuffle helper
    const deterministicShuffle = (array, seed) => {
      let m = array.length, t, i;
      while (m) {
        i = Math.floor(Math.abs(Math.sin(seed++)) * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
      }
      return array;
    };

    const studentIdHash = (str) => {
      let hash = 0;
      for (let i = 0; i < str.toString().length; i++) {
        hash = (hash << 5) - hash + str.toString().charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash);
    };

    const baseSeed = studentIdHash(user.id || user.student_id || "guest");

    // Group by part
    const parts = { 1: [], 2: [], 3: [], 4: [] };
    fetchedQuestions.forEach(q => {
      const p = q.part || 1;
      if (parts[p]) parts[p].push(q);
      else parts[1].push(q); // fallback
    });

    // Shuffle each part and flatten
    const shuffled = [];
    [1, 2, 3, 4].forEach(p => {
      if (parts[p].length > 0) {
        // Use part number + baseSeed as seed for this part's shuffle
        const shuffledPart = deterministicShuffle([...parts[p]], baseSeed + p);
        shuffled.push(...shuffledPart);
      }
    });

    return shuffled;
  }, [test, user.id, user.student_id]);

  useEffect(() => {
    if (results && testId) {
      const alreadyTaken = results.find(r => r.test_id === parseInt(testId));
      if (alreadyTaken) router.replace(`/portal/student/placement-test/results?id=${alreadyTaken.id}`);
    }
  }, [results, testId, router]);

  useEffect(() => {
    if (test && test.duration_minutes && timeRemaining === null) {
      setTimeRemaining(test.duration_minutes * 60);
    }
  }, [test, timeRemaining]);

  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;
    const timer = setInterval(() => setTimeRemaining(p => p - 1), 1000);
    return () => clearInterval(timer);
  }, [timeRemaining]);

  const handleAnswerChange = (qId, value) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const performSubmit = async (silent = false) => {
    if (!silent && !window.confirm("Do you want to submit your answers?")) return;
    try {
      const result = await submitTest({
        test_id: testId,
        student_id: user.id || user.student_id,
        answers: answers,
      }).unwrap();
      router.push(`/portal/student/placement-test/results?id=${result.id}`);
    } catch (err) {
      if (!silent) alert("Failed to submit. Please try again.");
    }
  };

  if (testLoading || !test) return <div className="h-screen flex items-center justify-center font-medium text-[#010080]">Loading Test...</div>;

  const currentQ = questions[currentQuestionIdx];
  const isLast = currentQuestionIdx === questions.length - 1;

  const formatTime = (s) => {
    if (s === null) return "00:00";
    const m = Math.floor(s / 60);
    return `${m}:${(s % 60).toString().padStart(2, "0")}`;
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Simple Header */}
        <div className="bg-white p-8 rounded-xl border border-gray-200 mb-6 flex justify-between items-center shadow-sm">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-gray-900">{test.title}</h1>
            <p className="text-sm text-gray-500">{test.description}</p>
          </div>
          <div className="bg-[#010080] text-white px-5 py-2 rounded-lg font-mono text-lg font-semibold min-w-[100px] text-center">
            {formatTime(timeRemaining)}
          </div>
        </div>

        {/* Question Area */}
        <div className="bg-white p-10 rounded-xl border border-gray-200 min-h-[450px] shadow-sm">
          <div className="flex justify-between items-center mb-10 pb-4 border-b">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Question {currentQuestionIdx + 1} of {questions.length}</span>
            <span className="text-[10px] font-bold text-[#010080] bg-blue-50 px-3 py-1 rounded uppercase">{currentQ?.type}</span>
          </div>

          {currentQ?.type === "mcq" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800 leading-relaxed">{currentQ.questionText}</h2>
              <div className="space-y-3 pt-2">
                {currentQ.options.map((opt, i) => (
                  <label key={i} className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${answers[currentQ.id] === opt ? 'border-[#010080] bg-blue-50/20' : 'border-gray-100 hover:border-gray-200'}`}>
                    <input type="radio" checked={answers[currentQ.id] === opt} onChange={() => handleAnswerChange(currentQ.id, opt)} className="w-4 h-4 accent-[#010080]" />
                    <span className={`text-sm font-medium ${answers[currentQ.id] === opt ? 'text-[#010080]' : 'text-gray-600'}`}>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {currentQ?.type === "passage" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 h-[500px] overflow-y-auto text-sm text-gray-700 leading-relaxed font-normal">
                {currentQ.passageText}
              </div>
              <div className="space-y-8 h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {currentQ.subQuestions.map((sq, si) => (
                  <div key={si} className="space-y-4">
                    <p className="text-sm font-semibold text-gray-900">{si + 1}. {sq.questionText}</p>
                    <div className="space-y-2">
                      {sq.options.map((opt, oi) => (
                        <label key={oi} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${answers[sq.id] === opt ? 'border-[#010080] bg-blue-50/20' : 'border-gray-50'}`}>
                          <input type="radio" checked={answers[sq.id] === opt} onChange={() => handleAnswerChange(sq.id, opt)} className="accent-[#010080] w-3.5 h-3.5" />
                          <span className="text-xs font-medium text-gray-600">{opt}</span>
                        </label>
                      ))}
                    </div>
                    {sq.type === "essay" && ( // Assuming sub-questions can also be essay type
                      <div className="flex justify-between items-center text-[10px] text-gray-400 mt-2">
                        <p className="font-normal">Pending manual review.</p>
                        <span className="font-semibold">{sq.points || 0} Marks</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentQ?.type === "essay" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">{currentQ.title}</h2>
              <p className="text-sm text-gray-600 font-medium leading-relaxed">{currentQ.description}</p>
              <textarea
                value={answers[currentQ.id] || ""}
                onChange={e => handleAnswerChange(currentQ.id, e.target.value)}
                className="w-full p-6 border rounded-xl min-h-[400px] focus:border-[#010080] outline-none bg-gray-50 focus:bg-white transition-all text-sm font-normal"
                placeholder="Type your response here..."
              />
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12 mb-20 px-2">
          <button
            onClick={() => setCurrentQuestionIdx(p => Math.max(0, p - 1))}
            disabled={currentQuestionIdx === 0}
            className="px-8 py-2.5 text-sm font-medium text-gray-400 hover:text-gray-900 disabled:opacity-0 transition-all"
          >
            ← Previous
          </button>

          <div className="flex gap-4">
            {!isLast ? (
              <button
                onClick={() => setCurrentQuestionIdx(p => p + 1)}
                className="bg-[#010080] text-white px-10 py-3 rounded-xl text-sm font-semibold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={() => performSubmit()}
                disabled={isSubmitting}
                className="bg-green-600 text-white px-12 py-3 rounded-xl text-sm font-semibold shadow-lg hover:bg-green-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? "Finalizing..." : "Submit Test"}
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
      `}</style>
    </main>
  );
}
