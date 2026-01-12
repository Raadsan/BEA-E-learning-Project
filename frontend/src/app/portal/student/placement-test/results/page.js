"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetStudentPlacementResultsQuery, useGetPlacementTestByIdQuery } from "@/redux/api/placementTestApi";

export default function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resultId = searchParams.get("id");

  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
  const { data: results, isLoading: resultsLoading } = useGetStudentPlacementResultsQuery(user.id || user.student_id, {
    skip: !user.id && !user.student_id,
  });

  // Find the specific result
  const result = results?.find((r) => r.id.toString() === resultId) || results?.[0];

  // Fetch the test details to show the breakdown
  const { data: test, isLoading: testLoading } = useGetPlacementTestByIdQuery(result?.test_id, {
    skip: !result?.test_id,
  });

  if (resultsLoading || testLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#010080]"></div>
      </div>
    );
  }

  if (!result || !test) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-200 text-center max-w-md w-full">
          <p className="text-gray-900 font-semibold text-lg mb-4">No result data found.</p>
          <button onClick={() => router.push("/portal/student/dashboard")} className="px-6 py-2 bg-[#010080] text-white rounded-lg font-medium text-sm">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const studentAnswers = typeof result.answers === 'string' ? JSON.parse(result.answers) : (result.answers || {});
  const testQuestions = typeof test.questions === 'string' ? JSON.parse(test.questions) : (test.questions || []);

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Simple Results Summary */}
        <div className="bg-white p-10 rounded-xl border border-gray-200 text-center space-y-4">
          <h1 className="text-2xl font-semibold text-gray-900">Placement Test Results</h1>
          <p className="text-gray-500 text-sm">Review your performance and test evaluation below.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 flex flex-col items-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Score</span>
              <span className="text-xl font-semibold text-[#010080] mt-1">{result.score} / {result.total_questions}</span>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 flex flex-col items-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Accuracy</span>
              <span className="text-xl font-semibold text-gray-900 mt-1">{Math.round(result.percentage)}%</span>
            </div>
            {result.status === 'completed' ? (
              <div className="p-4 rounded-lg bg-green-50 border border-green-100 flex flex-col items-center">
                <span className="text-[10px] font-bold text-green-600 uppercase">Status</span>
                <span className="text-xl font-semibold text-green-700 mt-1">Completed</span>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-100 flex flex-col items-center">
                <span className="text-[10px] font-bold text-yellow-600 uppercase">Status</span>
                <span className="text-lg font-semibold text-yellow-700 mt-1">Pending Review</span>
              </div>
            )}
          </div>
        </div>

        {/* Question Breakdown Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-2">Question Breakdown</h2>

          {testQuestions.map((q, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-blue-600 uppercase">Question {i + 1} • {q.type}</span>
                  <span className="text-xs text-gray-400 mt-0.5">{q.points || 0} Marks</span>
                </div>
                {q.type === 'mcq' && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${studentAnswers[q.id] === q.options[q.correctOption] ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {studentAnswers[q.id] === q.options[q.correctOption] ? 'Correct' : 'Incorrect'}
                  </span>
                )}
              </div>

              {q.type === 'mcq' && (
                <div className="space-y-3">
                  <p className="text-base font-medium text-gray-800">{q.questionText}</p>
                  <div className="flex flex-col gap-2 mt-4">
                    {q.options.map((opt, oi) => {
                      const isStudentAnswer = studentAnswers[q.id] === opt;
                      const isCorrect = oi === q.correctOption;
                      return (
                        <div key={oi} className={`px-4 py-2.5 rounded-lg border text-sm flex items-center justify-between ${isCorrect ? 'border-green-100 bg-green-50/20 text-green-700' :
                          isStudentAnswer ? 'border-red-100 bg-red-50/20 text-red-700' : 'border-gray-50 text-gray-600'
                          }`}>
                          <span>{opt}</span>
                          {isCorrect && <span className="text-xs font-bold uppercase tracking-tighter">Answer</span>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {q.type === 'passage' && (
                <div className="space-y-4">
                  <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg line-clamp-2">{q.passageText}</p>
                  <div className="space-y-4">
                    {q.subQuestions.map((sq, si) => (
                      <div key={si} className="border-l-2 border-gray-100 pl-4 py-1">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm font-medium text-gray-800">{sq.questionText}</p>
                          <span className="text-[10px] text-gray-400">{sq.points || 0} Marks</span>
                        </div>
                        <div className="flex gap-4 text-xs">
                          <span className="text-gray-500 font-medium">Your: <span className={studentAnswers[sq.id] === sq.options[sq.correctOption] ? 'text-green-600' : 'text-red-500'}>{studentAnswers[sq.id] || 'N/A'}</span></span>
                          <span className="text-gray-500">Correct: <span className="text-green-600">{sq.options[sq.correctOption]}</span></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {q.type === 'essay' && (
                <div className="space-y-3">
                  <p className="text-base font-medium text-gray-800">{q.title}</p>
                  <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 leading-relaxed font-normal">
                    {studentAnswers[q.id] || "No response."}
                  </div>

                  {result.status === 'completed' ? (
                    <div className="flex flex-col gap-3 mt-4">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-green-600 uppercase px-2 py-0.5 bg-green-50 rounded">Graded</span>
                        <span className="font-bold text-gray-900">{result.essay_marks || 0} / {q.points || 0} Marks</span>
                      </div>
                      {result.feedback_file && (
                        <div className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all hover:shadow-md ${typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'bg-blue-900/10 border-blue-800' : 'bg-blue-50/50 border-blue-100'}`}>
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-blue-100">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Teacher Feedback</span>
                              <span className="text-[10px] text-blue-600/70">Graded Essay File</span>
                            </div>
                          </div>
                          <a
                            href={`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000'}${result.feedback_file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
                          >
                            Download
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-[10px] text-gray-400 mt-2">
                      <p className="font-normal italic">Pending manual review by BEA academic team.</p>
                      <span className="font-semibold">{q.points || 0} Marks</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-6">
          <button
            onClick={() => router.push("/portal/student/dashboard")}
            className="bg-[#010080] text-white px-8 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
          >
            Return to Dashboard
          </button>
        </div>

        <footer className="text-center py-8 opacity-40">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">BEA Academic Portal • 2026</p>
        </footer>
      </div>
    </main>
  );
}
