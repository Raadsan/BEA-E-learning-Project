import { useState } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetAssignmentsQuery, useSubmitAssignmentMutation } from "@/redux/api/assignmentApi";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";

export default function StudentAssignmentList({ type, title }) {
    const { isDark } = useDarkMode();
    const { data: user } = useGetCurrentUserQuery();
    const { data: assignments, isLoading } = useGetAssignmentsQuery({
        class_id: user?.class_id,
        type: type
    }, { skip: !user?.class_id });

    const [submitAssignment] = useSubmitAssignmentMutation();

    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [view, setView] = useState("list"); // "list" or "workspace"
    const [submissionContent, setSubmissionContent] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const getWordCount = (text) => {
        return text.trim() ? text.trim().split(/\s+/).length : 0;
    };

    const handleOpenWorkspace = (assignment) => {
        setSelectedAssignment(assignment);
        setSubmissionContent(assignment.student_content || "");
        setView("workspace");
    };

    const handleFinalSubmit = async () => {
        if (!submissionContent.trim()) {
            alert("Please write something before submitting.");
            return;
        }

        try {
            setSubmitting(true);
            await submitAssignment({
                assignment_id: selectedAssignment.id,
                content: submissionContent,
                type: type // Pass type for multi-table routing
            }).unwrap();
            setView("list");
            setSubmissionContent("");
            alert("Work submitted successfully!");
        } catch (err) {
            alert(err.data?.error || "Failed to submit work");
        } finally {
            setSubmitting(false);
        }
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
                        <h1 className="text-4xl font-semibold tracking-tight">{selectedAssignment.title}</h1>
                        <p className={`text-lg font-medium opacity-70 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
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

                {/* Writing Area - Full Width */}
                <div className="max-w-screen-2xl mx-auto">
                    <div className="relative group">
                        <textarea
                            className={`w-full h-[650px] p-10 border-2 rounded-2xl shadow-2xl focus:ring-8 focus:ring-blue-500/10 focus:outline-none transition-all resize-none text-xl leading-relaxed font-serif ${isDark ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-600' : 'bg-white border-gray-100 text-gray-800 placeholder-gray-400'
                                } ${isClosed ? 'opacity-80 cursor-not-allowed border-dashed' : 'group-hover:border-blue-200 dark:group-hover:border-blue-900'}`}
                            placeholder="Type your essay content here..."
                            value={submissionContent}
                            onChange={(e) => !isClosed && setSubmissionContent(e.target.value)}
                            disabled={isClosed}
                        />
                        <div className={`absolute bottom-8 right-10 px-6 py-3 rounded-2xl text-lg font-semibold shadow-xl border-2 transform group-hover:scale-105 transition-transform ${getWordCount(submissionContent) < (selectedAssignment?.word_count || 0)
                            ? (isDark ? 'bg-yellow-900/40 text-yellow-400 border-yellow-800/50' : 'bg-yellow-50 text-yellow-700 border-yellow-100')
                            : (isDark ? 'bg-green-900/40 text-green-400 border-green-800/50' : 'bg-green-50 text-green-700 border-green-100')
                            }`}>
                            <span className="opacity-60 mr-2 text-sm uppercase">Words:</span>
                            {getWordCount(submissionContent)}
                            {selectedAssignment?.word_count ? <span className="text-sm opacity-40 ml-1">/ {selectedAssignment.word_count}</span> : ''}
                        </div>
                    </div>

                    {!isClosed && (
                        <div className="flex justify-center mt-12 mb-20 animate-in fade-in slide-in-from-bottom-4">
                            <button
                                onClick={handleFinalSubmit}
                                className={`px-20 py-5 rounded-[2rem] font-semibold text-2xl text-white transition-all shadow-2xl active:scale-95 flex items-center gap-4 ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#010080] hover:bg-blue-700 hover:shadow-blue-500/40'
                                    }`}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Submit My Assignment
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
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

            {!assignments || assignments.length === 0 ? (
                <div className={`p-20 rounded-2xl shadow-xl border-2 border-dashed text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <p className="text-2xl font-semibold text-gray-400">No active {title.toLowerCase()} assignments yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assignments.map((task) => {
                        const isGraded = task.submission_status === 'graded';
                        const isSubmitted = task.submission_status === 'submitted';
                        const currentWords = getWordCount(task.student_content || "");

                        return (
                            <div
                                key={task.id}
                                onClick={() => handleOpenWorkspace(task)}
                                className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                                    } hover:shadow-2xl hover:scale-[1.02] hover:border-[#010080]`}
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <div className={`p-2.5 rounded-xl ${isGraded ? 'bg-green-100 text-green-700' : isSubmitted ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </div>
                                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-semibold uppercase tracking-widest ${isGraded ? 'bg-green-500 text-white' :
                                        isSubmitted ? 'bg-blue-500 text-white' :
                                            'bg-yellow-500 text-white'
                                        }`}>
                                        {task.submission_status || 'Pending'}
                                    </span>
                                </div>
                                <h3 className={`text-xl font-semibold mb-3 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{task.title}</h3>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {task.word_count && (
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" /></svg>
                                            Goal: {task.word_count}
                                        </div>
                                    )}
                                    {isSubmitted && (
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'}`}>
                                            {currentWords} Words
                                        </div>
                                    )}
                                </div>

                                <p className={`text-sm line-clamp-2 mb-6 opacity-70 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {task.description}
                                </p>

                                <div className={`flex items-center justify-between mt-auto pt-5 border-t border-dashed ${isDark ? 'border-gray-700' : 'border-gray-100'} text-xs font-medium text-gray-500`}>
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        {task.due_date ? new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "N/A"}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-lg font-semibold">{task.total_points}</span>
                                        <span className="text-[10px] uppercase opacity-60">Pts</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
