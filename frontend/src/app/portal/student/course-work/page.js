"use client";

import { useState, useEffect, useRef } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetAssignmentsQuery, useSubmitAssignmentMutation } from "@/redux/api/assignmentApi";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useToast } from "@/components/Toast";

export default function CourseWorkPage() {
  const type = "course_work";
  const title = "Course Work";

  const { isDark } = useDarkMode();
  const { showToast } = useToast();
  const { data: user } = useGetCurrentUserQuery();
  const { data: assignments, isLoading } = useGetAssignmentsQuery({
    class_id: user?.class_id,
    type: type
  }, { skip: !user?.class_id });

  const [submitAssignment] = useSubmitAssignmentMutation();

  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [view, setView] = useState("list"); // "list", "start", "workspace"
  const [submissionContent, setSubmissionContent] = useState("");
  const [quizAnswers, setQuizAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  // Timer logic
  useEffect(() => {
    if (view === "workspace" && timeLeft > 0 && !submitting) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleFinalSubmit(true); // Auto-submit when time is up
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [view, timeLeft, submitting]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getWordCount = (text) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  const handleOpenWorkspace = (assignment) => {
    setSelectedAssignment(assignment);
    if (assignment.duration && assignment.submission_status !== 'submitted' && assignment.submission_status !== 'graded') {
      setView("start");
    } else {
      startWorkspace(assignment);
    }
  };

  const startWorkspace = (assignment) => {
    if (assignment.questions) {
      const initialAnswers = assignment.student_content ?
        (typeof assignment.student_content === 'string' ? JSON.parse(assignment.student_content) : assignment.student_content)
        : {};
      setQuizAnswers(initialAnswers);
    } else {
      setSubmissionContent(assignment.student_content || "");
    }

    if (assignment.duration) {
      setTimeLeft(assignment.duration * 60);
    }
    setView("workspace");
  };

  const handleFinalSubmit = async (auto = false) => {
    const isQuiz = !!selectedAssignment?.questions;

    if (!auto && !isQuiz && !submissionContent.trim()) {
      showToast("Please write something before submitting.", "error");
      return;
    }

    if (!auto && isQuiz) {
      const questions = typeof selectedAssignment.questions === 'string'
        ? JSON.parse(selectedAssignment.questions)
        : selectedAssignment.questions;

      if (Object.keys(quizAnswers).length < questions.length) {
        if (!window.confirm("You haven't answered all questions. Submit anyway?")) return;
      }
    } else if (!auto && !window.confirm("Are you sure you want to submit your work?")) {
      return;
    }

    try {
      setSubmitting(true);
      await submitAssignment({
        assignment_id: selectedAssignment.id,
        content: isQuiz ? quizAnswers : submissionContent,
        type: type // Pass type for multi-table routing
      }).unwrap();
      setView("list");
      setSubmissionContent("");
      setQuizAnswers({});
      showToast(auto ? "Time's up! Work auto-submitted." : "Work submitted successfully!", "success");
    } catch (err) {
      showToast(err.data?.error || "Failed to submit work", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswerChange = (qIndex, option) => {
    setQuizAnswers(prev => ({
      ...prev,
      [qIndex]: option
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (view === "start") {
    const questions = selectedAssignment.questions ? (typeof selectedAssignment.questions === 'string'
      ? JSON.parse(selectedAssignment.questions)
      : selectedAssignment.questions) : [];

    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
        <div className={`max-w-2xl w-full p-10 rounded-3xl shadow-xl border transition-all ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-blue-50 dark:bg-blue-900/40 rounded-2xl mb-6">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight text-blue-600">{selectedAssignment.title}</h1>
            <p className="text-slate-500 font-semibold uppercase tracking-widest text-[10px]">Assessment Induction</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Duration</span>
              <span className="text-xl font-bold">{selectedAssignment.duration} <span className="text-xs opacity-50">MIN</span></span>
            </div>
            <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">{selectedAssignment.questions ? 'Questions' : 'Points'}</span>
              <span className="text-xl font-bold">{selectedAssignment.questions ? questions.length : selectedAssignment.total_points}</span>
            </div>
          </div>

          <div className={`p-6 rounded-2xl mb-8 border ${isDark ? 'bg-gray-900/30 border-gray-700 text-gray-400' : 'bg-blue-50/30 border-blue-100 text-slate-600'}`}>
            <h3 className="font-bold text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2 text-blue-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" /></svg>
              Instructions
            </h3>
            <ul className="text-sm space-y-2 font-medium">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                Ensure a stable internet connection.
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                The timer begins immediately upon clicking "Begin".
              </li>
              <li className="flex items-center gap-2 text-rose-500">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                Automatic submission occurs when the session expires.
              </li>
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setView("list")}
              className={`flex-1 py-4 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200 text-slate-600'}`}
            >
              Return Late
            </button>
            <button
              onClick={() => startWorkspace(selectedAssignment)}
              className="flex-[2] py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase text-[10px] tracking-widest transition-all shadow-md active:scale-[0.98]"
            >
              Begin Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "workspace") {
    const isClosed = selectedAssignment.submission_status === "submitted" || selectedAssignment.submission_status === "graded";

    return (
      <div className={`min-h-screen transition-colors pt-6 w-full px-8 pb-12 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
        {/* Header & Back Button */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView("list")}
              className={`p-2 rounded-xl transition-all ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50 border border-gray-200'}`}
            >
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{selectedAssignment.title}</h1>
              <p className={`text-xs font-semibold opacity-60 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                {type.replace('_', ' ').toUpperCase()} WORKSPACE
              </p>
            </div>
          </div>

          {selectedAssignment.duration && !isClosed && (
            <div className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border transition-all ${timeLeft < 300 ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse' : 'bg-blue-50 border-blue-200 text-blue-600'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xl font-bold tabular-nums">{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

        {/* Top Section: Instructions & Details */}
        <div className="flex flex-col gap-6 mb-8 mt-2">
          <div className={`p-6 rounded-2xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex flex-wrap justify-between items-start gap-6">
              <div className="flex-1 min-w-[300px]">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2 uppercase tracking-wide text-xs opacity-50">
                  Guidelines
                </h3>
                <p className={`text-base leading-relaxed whitespace-pre-wrap font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {selectedAssignment?.requirements || selectedAssignment?.description || "Follow the standard submission procedures."}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className={`px-4 py-2 rounded-xl text-center border ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Potential</div>
                  <div className="font-bold">{selectedAssignment.total_points} PTS</div>
                </div>
                <div className={`px-4 py-2 rounded-xl text-center border ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Due At</div>
                  <div className="font-bold">{selectedAssignment.due_date ? new Date(selectedAssignment.due_date).toLocaleDateString() : "N/A"}</div>
                </div>
              </div>
            </div>

            {selectedAssignment.feedback && (
              <div className={`mt-6 p-4 rounded-xl border border-dashed ${isDark ? 'bg-blue-900/10 border-blue-800/40' : 'bg-blue-50/50 border-blue-200'}`}>
                <h4 className="text-[10px] font-bold text-blue-600 mb-2 uppercase tracking-widest">Instructor Feedback</h4>
                <p className="text-sm italic font-medium text-slate-700 dark:text-slate-300">"{selectedAssignment.feedback}"</p>
              </div>
            )}
          </div>

          {isClosed && (
            <div className={`p-6 rounded-2xl border flex items-center gap-4 ${isDark ? 'bg-green-900/10 border-green-800/30 text-green-400' : 'bg-green-50 border-green-100 text-green-700'}`}>
              <div className="p-2 bg-green-500 text-white rounded-lg shadow-md">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-lg leading-tight">Work Recorded</p>
                <p className="text-xs font-medium opacity-70">This workspace is currently locked. Grading version is pinned.</p>
              </div>
            </div>
          )}
        </div>

        {/* Writing Area / Quiz Area */}
        <div className="w-full">
          {selectedAssignment.questions ? (
            <div className="space-y-6">
              {(typeof selectedAssignment.questions === 'string' ? JSON.parse(selectedAssignment.questions) : selectedAssignment.questions).map((q, idx) => (
                <div key={idx} className={`p-8 rounded-2xl shadow-sm border transition-all ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-lg font-bold flex gap-3">
                      <span className="opacity-30">#{idx + 1}</span>
                      {q.questionText}
                    </h3>
                    <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-lg ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                      {q.points || 1} Points
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {q.options.map((opt, oIdx) => (
                      <label
                        key={oIdx}
                        className={`flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${quizAnswers[idx] === opt
                          ? 'border-blue-500 bg-blue-500/5 dark:bg-blue-500/10'
                          : (isDark ? 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600' : 'bg-gray-50 border-gray-50 text-gray-600 hover:border-gray-200')
                          } ${isClosed ? 'cursor-not-allowed opacity-80' : ''}`}
                      >
                        <input
                          type="radio"
                          name={`q-${idx}`}
                          value={opt}
                          checked={quizAnswers[idx] === opt}
                          onChange={() => !isClosed && handleAnswerChange(idx, opt)}
                          className="hidden"
                          disabled={isClosed}
                        />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${quizAnswers[idx] === opt
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                          }`}>
                          {quizAnswers[idx] === opt && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                        <span className={`font-bold ${quizAnswers[idx] === opt ? 'text-blue-600 dark:text-blue-400' : ''}`}>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative">
              <textarea
                className={`w-full h-[500px] p-8 border-2 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/5 focus:outline-none transition-all resize-none text-lg font-medium leading-relaxed ${isDark ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-600' : 'bg-white border-gray-100 text-gray-800 placeholder-gray-400'
                  } ${isClosed ? 'opacity-80 cursor-not-allowed border-dashed' : 'hover:border-gray-200'}`}
                placeholder="Provide your written response here..."
                value={submissionContent}
                onChange={(e) => !isClosed && setSubmissionContent(e.target.value)}
                disabled={isClosed}
              />
              <div className={`absolute bottom-6 right-6 px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${getWordCount(submissionContent) < (selectedAssignment?.word_count || 0)
                ? (isDark ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-100')
                : (isDark ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100')
                }`}>
                {getWordCount(submissionContent)} WORDS
                {selectedAssignment?.word_count ? <span className="opacity-40 ml-1">/ {selectedAssignment.word_count} TARGET</span> : ''}
              </div>
            </div>
          )}

          {!isClosed && (
            <div className="flex justify-center mt-12 mb-20">
              <button
                onClick={() => handleFinalSubmit(false)}
                className={`px-12 py-4 rounded-xl font-bold text-sm text-white transition-all shadow-lg active:scale-[0.98] ${submitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                  }`}
                disabled={submitting}
              >
                {submitting ? 'Processing...' : 'Complete & Submit Review'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors pt-12 w-full px-6 sm:px-10 pb-20 ${isDark ? 'bg-[#0f172a] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="w-full mx-auto mb-12">
        <h1 className={`text-4xl font-bold mb-4 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h1>
        <p className={`text-lg font-medium max-w-2xl opacity-60 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Access your {title.toLowerCase()} assignments, track your progress, and submit your entries for review.
        </p>
      </div>

      {!assignments || assignments.filter(t => t.status !== 'inactive').length === 0 ? (
        <div className={`w-full p-20 rounded-3xl border-2 border-dashed text-center ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-gray-200'}`}>
          <p className="text-xl font-medium text-gray-400">No active {title.toLowerCase()} assignments assigned to you yet.</p>
        </div>
      ) : (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {assignments.filter(t => t.status !== 'inactive').map((task) => {
            const isGraded = task.submission_status === 'graded';
            const isSubmitted = task.submission_status === 'submitted';

            return (
              <div
                key={task.id}
                onClick={() => handleOpenWorkspace(task)}
                className={`group p-8 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${isDark ? 'bg-slate-900 border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/80 shadow-lg' : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-xl shadow-sm'
                  }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-3 rounded-xl ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${isGraded ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                      isSubmitted ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        'bg-amber-100 text-amber-700 border-amber-200'
                      }`}>
                      {task.submission_status || 'Pending'}
                    </span>
                  </div>

                  <h3 className={`text-xl font-bold mb-4 tracking-tight group-hover:text-blue-600 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {task.title}
                  </h3>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                      <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {task.due_date ? new Date(task.due_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Continuous'}
                    </div>

                    {isGraded ? (
                      <div className="flex items-center gap-3 text-emerald-600 text-sm font-bold">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4" /></svg>
                        Grade: {task.score} / {task.total_points}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                        <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        {task.total_points} Points
                      </div>
                    )}
                  </div>
                </div>

                <button
                  className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${isSubmitted || isGraded
                    ? (isDark ? 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700' : 'bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100')
                    : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:scale-[1.02]'
                    }`}
                >
                  {isSubmitted || isGraded ? 'Review Work' : 'Start Task'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
