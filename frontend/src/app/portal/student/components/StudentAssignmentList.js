import { useState } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetAssignmentsQuery, useSubmitAssignmentMutation } from "@/redux/api/assignmentApi";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useToast } from "@/components/Toast";

export default function StudentAssignmentList({ type, title }) {
    const { isDark } = useDarkMode();
    const { showToast } = useToast();
    const { data: user } = useGetCurrentUserQuery();
    const { data: assignments, isLoading } = useGetAssignmentsQuery({
        class_id: user?.class_id,
        type: type
    }, { skip: !user?.class_id });

    const [submitAssignment] = useSubmitAssignmentMutation();

    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [view, setView] = useState("list"); // "list" or "workspace"
    const [submissionContent, setSubmissionContent] = useState("");
    const [quizAnswers, setQuizAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const getWordCount = (text) => {
        return text.trim() ? text.trim().split(/\s+/).length : 0;
    };

    const handleOpenWorkspace = (assignment) => {
        setSelectedAssignment(assignment);
        if (assignment.questions) {
            const initialAnswers = assignment.student_content ?
                (typeof assignment.student_content === 'string' ? JSON.parse(assignment.student_content) : assignment.student_content)
                : {};
            setQuizAnswers(initialAnswers);
        } else {
            setSubmissionContent(assignment.student_content || "");
        }
        setView("workspace");
    };

    const handleFinalSubmit = async () => {
        const isQuiz = !!selectedAssignment?.questions;

        if (!isQuiz && !submissionContent.trim()) {
            showToast("Please write something before submitting.", "error");
            return;
        }

        if (isQuiz) {
            const questions = typeof selectedAssignment.questions === 'string'
                ? JSON.parse(selectedAssignment.questions)
                : selectedAssignment.questions;

            if (Object.keys(quizAnswers).length < questions.length) {
                if (!window.confirm("You haven't answered all questions. Submit anyway?")) return;
            }
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
            showToast("Work submitted successfully!", "success");
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#010080]"></div>
            </div>
        );
    }

    if (view === "workspace") {
        const isClosed = selectedAssignment.submission_status === "submitted" || selectedAssignment.submission_status === "graded";

        return (
            <div className={`min-h-screen transition-colors pt-6 w-full px-8 pb-12 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
                {/* Header & Back Button */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => setView("list")}
                        className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{selectedAssignment.title}</h1>
                        <p className={`text-sm font-medium opacity-60 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {type === 'writing_task' ? 'Writing Workspace' : 'Assignment Submission'}
                        </p>
                    </div>
                </div>

                {/* Top Section: Instructions & Details */}
                <div className="flex flex-col gap-6 mb-8 mt-2">
                    <div className={`p-6 rounded-2xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Instructions</h3>
                                <p className={`text-base leading-relaxed whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {selectedAssignment?.requirements || selectedAssignment?.description || "No specific instructions provided."}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <div className={`px-4 py-2 rounded-xl text-center border ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                                    <div className="text-[10px] uppercase font-semibold text-gray-400">Points</div>
                                    <div className="font-semibold">{selectedAssignment.total_points}</div>
                                </div>
                                <div className={`px-4 py-2 rounded-xl text-center border ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                                    <div className="text-[10px] uppercase font-semibold text-gray-400">Due Date</div>
                                    <div className="font-semibold">{selectedAssignment.due_date ? new Date(selectedAssignment.due_date).toLocaleDateString() : "N/A"}</div>
                                </div>
                                {selectedAssignment.word_count && (
                                    <div className={`px-4 py-2 rounded-xl text-center border ${isDark ? 'bg-blue-900/20 border-blue-800/30' : 'bg-blue-50 border-blue-100'}`}>
                                        <div className="text-[10px] uppercase font-semibold text-blue-500">Target</div>
                                        <div className="font-semibold text-blue-600 dark:text-blue-400">{selectedAssignment.word_count} Words</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {selectedAssignment.feedback && (
                            <div className={`mt-4 p-4 rounded-xl border border-yellow-200/50 ${isDark ? 'bg-yellow-900/10' : 'bg-yellow-50/50'}`}>
                                <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-500 mb-1 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" /></svg>
                                    Teacher's Feedback
                                </h4>
                                <p className="text-sm italic text-yellow-700 dark:text-yellow-400">"{selectedAssignment.feedback}"</p>
                            </div>
                        )}
                    </div>

                    {isClosed && (
                        <div className={`p-6 rounded-2xl border flex items-center gap-4 transition-all animate-in fade-in slide-in-from-top-2 ${isDark ? 'bg-green-900/10 border-green-800/30 text-green-400' : 'bg-green-50 border-green-100 text-green-700'}`}>
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-xl uppercase tracking-wide">Work Submitted</p>
                                <p className="text-sm opacity-90">Your work has been safely recorded. Editing is disabled for this assignment.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Writing Area / Quiz Area */}
                <div className="w-full">
                    {selectedAssignment.questions ? (
                        <div className="space-y-6">
                            {(typeof selectedAssignment.questions === 'string' ? JSON.parse(selectedAssignment.questions) : selectedAssignment.questions).map((q, idx) => (
                                <div key={idx} className={`p-8 rounded-2xl shadow-sm border transition-all ${isDark ? 'bg-gray-800 border-gray-700 hover:border-blue-500/30' : 'bg-white border-gray-200 hover:border-blue-200 shadow-sm'}`}>
                                    <div className="flex justify-between items-start mb-6">
                                        <h3 className="text-lg font-bold flex gap-3">
                                            <span className="opacity-30">{idx + 1}.</span>
                                            {q.questionText}
                                        </h3>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                            {q.points || 1} Points
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {q.options.map((opt, oIdx) => (
                                            <label
                                                key={oIdx}
                                                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${quizAnswers[idx] === opt
                                                        ? (isDark ? 'bg-blue-900/20 border-blue-500 text-blue-100' : 'bg-blue-50 border-blue-500 text-blue-900')
                                                        : (isDark ? 'bg-gray-900/50 border-gray-700 hover:border-gray-600 text-gray-400' : 'bg-gray-50 border-gray-100 hover:border-gray-300 text-gray-600')
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
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${quizAnswers[idx] === opt
                                                        ? 'border-blue-500 bg-blue-500 text-white'
                                                        : 'border-gray-300'
                                                    }`}>
                                                    {quizAnswers[idx] === opt && (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <span className="font-medium">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="relative group">
                            <textarea
                                className={`w-full h-[500px] p-6 border rounded-xl shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all resize-none text-lg leading-relaxed ${isDark ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-600' : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'
                                    } ${isClosed ? 'opacity-80 cursor-not-allowed border-dashed' : 'hover:border-blue-500/30'}`}
                                placeholder="Type your essay content here..."
                                value={submissionContent}
                                onChange={(e) => !isClosed && setSubmissionContent(e.target.value)}
                                disabled={isClosed}
                            />
                            <div className={`absolute bottom-6 right-6 px-4 py-2 rounded-lg text-sm font-semibold border ${getWordCount(submissionContent) < (selectedAssignment?.word_count || 0)
                                ? (isDark ? 'bg-yellow-900/20 text-yellow-400 border-yellow-800/30' : 'bg-yellow-50 text-yellow-700 border-yellow-200')
                                : (isDark ? 'bg-green-900/20 text-green-400 border-green-800/30' : 'bg-green-50 text-green-700 border-green-200')
                                }`}>
                                <span className="opacity-60 mr-1.5 font-medium">Word Count:</span>
                                {getWordCount(submissionContent)}
                                {selectedAssignment?.word_count ? <span className="opacity-40 ml-1">/ {selectedAssignment.word_count}</span> : ''}
                            </div>
                        </div>
                    )}

                    {!isClosed && (
                        <div className="flex justify-center mt-12 mb-20">
                            <button
                                onClick={handleFinalSubmit}
                                className={`px-16 py-4 rounded-2xl font-bold text-white transition-all shadow-xl active:scale-[0.98] flex items-center gap-3 ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
                                    }`}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Complete & Submit Progress
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-colors pt-12 w-full px-8 pb-12 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
            <div className="mb-10">
                <h1 className={`text-4xl font-semibold mb-2 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h1>
                <p className={`text-lg font-medium opacity-70 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    View assignments and submit your progress.
                </p>
            </div>

            {!assignments || assignments.filter(t => t.status !== 'inactive').length === 0 ? (
                <div className={`p-20 rounded-xl shadow-sm border-2 border-dashed text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <p className="text-xl font-medium text-gray-400">No active {title.toLowerCase()} assignments yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assignments.filter(t => t.status !== 'inactive').map((task) => {
                        const isGraded = task.submission_status === 'graded';
                        const isSubmitted = task.submission_status === 'submitted';
                        const currentWords = getWordCount(task.student_content || "");

                        return (
                            <div
                                key={task.id}
                                onClick={() => handleOpenWorkspace(task)}
                                className={`group p-6 rounded-xl border transition-all cursor-pointer hover:shadow-md flex flex-col justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                                    }`}
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className={`text-lg font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {task.title}
                                        </h3>
                                        <span className={`px-2.5 py-1 text-[11px] font-medium rounded-full border ${isGraded ? 'bg-green-100 text-green-700 border-green-200' :
                                            isSubmitted ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                'bg-yellow-100 text-yellow-700 border-yellow-200'
                                            }`}>
                                            {(task.submission_status || 'pending').charAt(0).toUpperCase() + (task.submission_status || 'pending').slice(1)}
                                        </span>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center gap-3 text-gray-500">
                                            <svg className="w-4 h-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-sm font-medium">
                                                {task.due_date ? new Date(task.due_date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                            </span>
                                        </div>
                                        {isGraded ? (
                                            <div className="flex items-center gap-2.5 text-green-600">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" /></svg>
                                                <span className="text-sm font-semibold">Grade: {task.score} / {task.total_points}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 text-gray-500">
                                                <svg className="w-4 h-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-sm font-medium">{task.total_points} Points</span>
                                            </div>
                                        )}
                                    </div>

                                    {isGraded && task.feedback && (
                                        <div className={`mb-4 p-3 rounded-xl border border-dashed text-xs italic ${isDark ? 'bg-blue-900/10 border-blue-800/40 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                                            "{task.feedback}"
                                        </div>
                                    )}
                                </div>

                                <button
                                    className={`w-full py-2.5 rounded-lg font-semibold transition-all text-sm border ${isSubmitted || isGraded
                                        ? 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                        : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
                                        }`}
                                >
                                    {isSubmitted || isGraded ? 'View My Work' : 'Start Working'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div >
    );
}
