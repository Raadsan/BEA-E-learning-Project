"use client";

import { useState, useEffect } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useGetTimelinesQuery } from "@/redux/api/courseTimelineApi";
import { useGetTeachersToReviewQuery, useSubmitTeacherReviewMutation, useGetQuestionsQuery, useGetStudentReviewsQuery } from "@/redux/api/reviewApi";
import { useToast } from "@/components/Toast";

// Sub-component for individual teacher accordion
const TeacherReviewAccordion = ({ teacher, isOpen, onToggle, questions, classId, termSerial, refetchReviews, isReviewed, onReviewSuccess }) => {
  const { isDark } = useDarkMode();
  const { showToast } = useToast();
  const [submitReview, { isLoading }] = useSubmitTeacherReviewMutation();
  const [answers, setAnswers] = useState({});
  const [comment, setComment] = useState("");

  // Initialize/Reset answers when opened or questions load
  useEffect(() => {
    if (isOpen && questions.length > 0) {
      if (Object.keys(answers).length === 0) {
        const initialAnswers = {};
        questions.forEach(q => { initialAnswers[q.id] = 0; });
        setAnswers(initialAnswers);
      }
    }
  }, [isOpen, questions]);

  const handleRatingChange = (questionId, rating) => {
    setAnswers(prev => ({ ...prev, [questionId]: rating }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const unanswered = questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      showToast("Please fill out all the star ratings.", "error");
      return;
    }

    const totalRating = Object.values(answers).reduce((acc, curr) => acc + curr, 0);
    const overallRating = Math.round(totalRating / questions.length);

    const formattedAnswers = Object.entries(answers).map(([qId, rating]) => ({
      question_id: parseInt(qId),
      rating
    }));

    try {
      await submitReview({
        teacher_id: teacher.id || teacher.teacher_id,
        class_id: classId,
        term_serial: termSerial,
        rating: overallRating,
        comment,
        answers: formattedAnswers
      }).unwrap();

      showToast("Evaluation submitted successfully!", "success");
      onToggle(); // Close accordion
      if (onReviewSuccess) onReviewSuccess(teacher.id || teacher.teacher_id);
      if (refetchReviews) refetchReviews();
    } catch (err) {
      console.error("Failed to submit review:", err);
      showToast(err.data?.error || "Failed to submit review.", "error");
    }
  };

  // If already reviewed, show a clear "Reviewed" button in green
  if (isReviewed) {
    return (
      <div className={`mb-4 rounded-2xl border transition-all ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
        <div className="w-full flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300">
              {teacher.full_name?.[0] || "T"}
            </div>
            <div>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {teacher.full_name}
              </h3>
              <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Evaluation completed
              </p>
            </div>
          </div>

          {/* Green "Reviewed" Button */}
          <button
            disabled
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-green-600 cursor-default shadow-lg shadow-green-600/30"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            Reviewed
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`mb-4 rounded-2xl border transition-all duration-200 overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-6 text-left transition-colors ${isOpen
          ? isDark ? 'bg-indigo-900/20' : 'bg-indigo-50/50'
          : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
          }`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${isDark ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700'
            }`}>
            {teacher.full_name?.[0] || "T"}
          </div>
          <div>
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {teacher.full_name}
            </h3>
            <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Click to evaluate
            </p>
          </div>
        </div>

        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen
          ? 'bg-red-100 text-red-600 rotate-90'
          : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
          }`}>
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          )}
        </div>
      </button>

      {isOpen && (
        <div className={`p-6 border-t animate-in slide-in-from-top-2 duration-200 ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-white'}`}>
          <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
            <div className="space-y-6">
              {questions.map((q) => (
                <div key={q.id} className={`p-4 rounded-xl border border-dashed ${isDark ? 'border-gray-700 bg-gray-900/30' : 'border-gray-200 bg-gray-50/50'}`}>
                  <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {q.question_text}
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(q.id, star)}
                        className="transition-transform active:scale-95 focus:outline-none"
                      >
                        <svg
                          className={`w-8 h-8 transition-colors ${answers[q.id] >= star
                            ? 'text-yellow-400 fill-yellow-400'
                            : isDark ? 'text-gray-600' : 'text-gray-300'
                            }`}
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Additional Feedback (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className={`w-full p-4 rounded-xl border outline-none transition-all ${isDark
                  ? 'bg-gray-900 border-gray-700 text-white focus:border-indigo-500 placeholder:text-gray-600'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500 placeholder:text-gray-400'
                  }`}
                placeholder="Share your thoughts about this teacher..."
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg active:scale-95 ${isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#010080] hover:bg-blue-900 shadow-blue-900/30'
                  }`}
              >
                {isLoading ? 'Submitting...' : 'Submit Evaluation'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};


export default function StudentReviewPage() {
  const { isDark } = useDarkMode();
  const { data: user } = useGetCurrentUserQuery();
  const { data: timelines = [] } = useGetTimelinesQuery();
  const { data: questions = [] } = useGetQuestionsQuery("teacher");

  const isProficiencyOnly = (user?.chosen_program || user?.program || "").toString().toLowerCase().trim() === 'proficiency test' || user?.role === 'proficiency_student';

  const { data: teachersToReview = [], isLoading: teachersLoading, refetch } = useGetTeachersToReviewQuery(undefined, {
    skip: !user || isProficiencyOnly
  });

  const { data: existingReviews = [], refetch: refetchReviews } = useGetStudentReviewsQuery(user?.student_id || user?.id, {
    skip: !user
  });

  const [openTeacherId, setOpenTeacherId] = useState(null);
  const [locallyReviewed, setLocallyReviewed] = useState({});

  const handleToggle = (id) => {
    setOpenTeacherId(prev => prev === id ? null : id);
  };

  const handleReviewSuccess = (teacherId) => {
    setLocallyReviewed(prev => ({ ...prev, [teacherId]: true }));
  }

  const handleRefetch = () => {
    refetch();
    refetchReviews();
  };

  const currentTermSerial = timelines.length > 0 ? timelines[timelines.length - 1]?.term_serial : '1';

  const canSeeReviews = !isProficiencyOnly;

  if (!canSeeReviews) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <p className="text-gray-500">Reviews are not available for your program.</p>
      </div>
    );
  }

  // Helper to check if a teacher has already been reviewed
  const isTeacherReviewed = (teacherId) => {
    if (locallyReviewed[teacherId]) return true;
    return existingReviews.some(review =>
      (review.teacher_id === teacherId || review.teacher_name === teachersToReview.find(t => t.id === teacherId || t.teacher_id === teacherId)?.full_name)
    );
  };

  return (
    <div className={`min-h-screen transition-colors pt-12 w-full px-6 sm:px-10 pb-20 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="w-full">
        {/* Header - Plain Style */}
        <div className="mb-10 pl-2">
          <h1 className={`text-4xl font-normal mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Evaluate Your Instructors
          </h1>
          <p className={`text-lg font-medium opacity-60 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Select a teacher below to expand the evaluation form. Your feedback helps us improve.
          </p>
        </div>

        {/* Teachers List (Accordions) */}
        <div className="space-y-4">
          {teachersLoading ? (
            <div className="flex flex-col gap-4">
              {[1, 2].map(i => (
                <div key={i} className={`h-24 rounded-2xl animate-pulse ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
              ))}
            </div>
          ) : teachersToReview.length === 0 ? (
            <div className={`text-center py-20 rounded-3xl border border-dashed ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className="text-gray-500 font-medium">No teachers available for evaluation at this time.</p>
            </div>
          ) : (
            teachersToReview.map((teacher) => {
              const reviewed = isTeacherReviewed(teacher.id || teacher.teacher_id);
              return (
                <TeacherReviewAccordion
                  key={teacher.id || teacher.teacher_id}
                  teacher={teacher}
                  isOpen={openTeacherId === (teacher.id || teacher.teacher_id) && !reviewed}
                  onToggle={() => !reviewed && handleToggle(teacher.id || teacher.teacher_id)}
                  questions={questions}
                  classId={user?.class_id}
                  termSerial={currentTermSerial}
                  refetchReviews={handleRefetch}
                  isReviewed={reviewed}
                  onReviewSuccess={handleReviewSuccess}
                />
              )
            })
          )}
        </div>
      </div>
    </div>
  );
}
