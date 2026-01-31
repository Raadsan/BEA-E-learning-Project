"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";

const ReviewModal = ({ isOpen, onClose, onSubmit, title, subtitle, revieweeName, questions = [], isLoading }) => {
    const { isDarkMode } = useTheme();
    const [answers, setAnswers] = useState({});
    const [comment, setComment] = useState("");

    // Initialize answers when questions change
    useEffect(() => {
        if (questions.length > 0) {
            const initialAnswers = {};
            questions.forEach(q => {
                initialAnswers[q.id] = 0;
            });
            setAnswers(initialAnswers);
        }
    }, [questions]);

    if (!isOpen) return null;

    const handleRatingChange = (questionId, rating) => {
        setAnswers(prev => ({ ...prev, [questionId]: rating }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Ensure all questions are answered
        const unanswered = questions.filter(q => !answers[q.id]);
        if (unanswered.length > 0) {
            alert("Fadlan dhameystir dhammaan qiimeynta su'aalaha.");
            return;
        }

        // Calculate average rating for the overall_rating field
        const totalRating = Object.values(answers).reduce((acc, curr) => acc + curr, 0);
        const overallRating = Math.round(totalRating / questions.length);

        const formattedAnswers = Object.entries(answers).map(([qId, rating]) => ({
            question_id: parseInt(qId),
            rating
        }));

        onSubmit({ rating: overallRating, comment, answers: formattedAnswers });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] ${isDarkMode ? 'bg-[#0a0a2e] border border-blue-900/50' : 'bg-white'}`}>
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-blue-900/30 flex-shrink-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
                            <p className={`text-sm mt-1 ${isDarkMode ? 'text-blue-300/70' : 'text-gray-500'}`}>{subtitle} <strong>{revieweeName}</strong></p>
                        </div>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-blue-900/50 text-blue-400' : 'hover:bg-gray-100 text-gray-500'}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Body - Scrollable */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    <div className="space-y-6">
                        {/* Questions */}
                        {questions.map((q) => (
                            <div key={q.id} className="flex flex-col gap-2 p-4 rounded-xl border border-dashed border-gray-200 dark:border-blue-900/30">
                                <span className={`text-sm font-semibold leading-relaxed ${isDarkMode ? 'text-blue-100' : 'text-gray-700'}`}>
                                    {q.question_text}
                                </span>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => handleRatingChange(q.id, star)}
                                            className="transition-transform active:scale-90"
                                        >
                                            <svg
                                                className={`w-8 h-8 ${answers[q.id] >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-blue-900/50'}`}
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={1}
                                            >
                                                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                            </svg>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Comment */}
                        <div className="space-y-2 pt-2">
                            <label className={`text-sm font-bold ${isDarkMode ? 'text-blue-200' : 'text-gray-700'}`}>
                                Faalladaada dheeriga ah (Optional Comment)
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Halkan ku qor faalladaada..."
                                className={`w-full h-24 p-3 rounded-xl border outline-none transition-all resize-none ${isDarkMode
                                    ? 'bg-blue-950/30 border-blue-800 text-white placeholder:text-blue-700 focus:border-blue-500'
                                    : 'bg-gray-50 border-gray-200 focus:border-blue-500'
                                    }`}
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Footer - Sticky */}
                <div className="p-6 border-t border-gray-200 dark:border-blue-900/30 bg-gray-50/50 dark:bg-blue-900/10 flex-shrink-0">
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className={`w-full py-3.5 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 ${isLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : isDarkMode
                                ? 'bg-white hover:bg-gray-100 text-gray-900 shadow-lg shadow-white/10'
                                : 'bg-[#010080] hover:bg-[#010080]/90 text-white shadow-lg shadow-[#010080]/25'
                            }`}
                    >
                        {isLoading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Submit Detailed Review
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
