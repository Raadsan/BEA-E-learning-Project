"use client";

import { useDarkMode } from "@/context/ThemeContext";
import { API_BASE_URL } from "@/constants";

export default function SubmissionDetailsModal({ assignment, onClose }) {
    const { isDark } = useDarkMode();

    // Format dates
    const submissionDate = assignment.submission_date
        ? new Date(assignment.submission_date).toLocaleString()
        : "N/A";

    const isGraded = assignment.submission_status === 'graded';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100 ${isDark ? "bg-gray-800 border border-gray-700" : "bg-white"
                    }`}
            >
                {/* Header */}
                <div className={`px-6 py-4 flex items-center justify-between border-b ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-100 bg-gray-50"
                    }`}>
                    <div>
                        <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                            Submission Details
                        </h3>
                        <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            {assignment.title}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-200 text-gray-500"
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body - Compact Padding */}
                <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">

                    {/* Status Badge */}
                    <div className="flex justify-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${isGraded
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            }`}>
                            {isGraded ? (
                                <>
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Graded
                                </>
                            ) : (
                                <>
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Submitted
                                </>
                            )}
                        </span>
                    </div>

                    {/* Score Section (if graded) */}
                    {isGraded && (
                        <div className={`p-3 rounded-xl text-center border ${isDark ? "bg-gray-900/50 border-gray-700" : "bg-blue-50/50 border-blue-100"
                            }`}>
                            <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 opacity-70 ${isDark ? "text-gray-400" : "text-gray-500"
                                }`}>Score Achieved</p>
                            <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-blue-600"
                                }`}>
                                {assignment.score || 0} <span className="text-base opacity-50 font-medium text-gray-500">/ {assignment.total_points}</span>
                            </div>
                        </div>
                    )}

                    {/* Teacher Feedback (if graded) */}
                    {isGraded && assignment.feedback && (
                        <div>
                            <h4 className={`text-[10px] font-bold uppercase mb-1.5 opacity-70 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                Teacher Feedback
                            </h4>
                            <div className={`p-3 rounded-xl border text-sm leading-relaxed ${isDark ? "bg-gray-700/30 border-gray-700 text-gray-300" : "bg-gray-50 border-gray-200 text-gray-700"
                                }`}>
                                {assignment.feedback}
                            </div>
                        </div>
                    )}

                    {/* Submission Info */}
                    <div className="space-y-3 pt-1">
                        <h4 className={`text-[10px] font-bold uppercase opacity-70 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            Your Submission
                        </h4>

                        {/* File */}
                        {assignment.file_url ? (
                            <a
                                href={`${API_BASE_URL}${assignment.file_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg border bg-gray-50 dark:bg-gray-900 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group w-full"
                            >
                                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">Open Submitted File</p>
                                </div>
                                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                    Click here &rarr;
                                </div>
                            </a>
                        ) : (
                            <div className={`px-4 py-3 rounded-lg border text-sm italic w-full text-center ${isDark ? "border-gray-700 text-gray-500" : "border-gray-200 text-gray-400"}`}>
                                No file attached.
                            </div>
                        )}

                        {/* Note */}
                        {assignment.student_content && assignment.student_content !== "File submission" && (
                            <div className={`p-3 rounded-xl border text-sm ${isDark ? "bg-gray-900/30 border-gray-700 text-gray-400" : "bg-gray-50 border-gray-200 text-gray-600"}`}>
                                <span className="font-semibold block mb-1 text-[10px] uppercase opacity-70">Your Note:</span>
                                {assignment.student_content}
                            </div>
                        )}

                        {/* Teacher Name */}
                        {assignment.teacher_name && (
                            <div className={`p-2.5 rounded-xl border flex items-center gap-3 ${isDark ? "border-gray-700 bg-gray-900/30" : "border-gray-200 bg-gray-50"
                                }`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isDark ? "bg-purple-900/30 text-purple-400" : "bg-purple-100 text-purple-600"
                                    }`}>
                                    {assignment.teacher_name.charAt(0)}
                                </div>
                                <div className="text-xs">
                                    <p className={`font-medium ${isDark ? "text-gray-200" : "text-gray-900"}`}>
                                        {assignment.teacher_name}
                                    </p>
                                    <p className="text-[10px] opacity-60">Assigned / Graded by</p>
                                </div>
                            </div>
                        )}

                        {/* Date */}
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 pt-1 justify-center">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Submitted on {submissionDate}
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className={`px-6 py-4 border-t flex justify-end ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-100 bg-gray-50"}`}>
                    <button
                        onClick={onClose}
                        className={`px-5 py-2 rounded-lg font-medium transition-colors ${isDark
                            ? "bg-gray-700 hover:bg-gray-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                            }`}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
