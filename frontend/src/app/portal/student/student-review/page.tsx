"use client";

import { useState, useEffect } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import StudentPageHeader from "@/components/student/StudentPageHeader";
import { useGetCurrentUserQuery } from "@/lib/api/authApi";
import { useGetTimelinesQuery } from "@/lib/api/courseTimelineApi";
import {
  useGetTeachersToReviewQuery,
  useSubmitTeacherReviewMutation,
  useGetQuestionsQuery,
  useGetStudentReviewBoxesQuery
} from "@/lib/api/reviewApi";
import { useToast } from "@/components/Toast";
import { isProficiencyOnlyStudent } from "@/utils/programCatalog";

// Star Rating Component
const StarRating = ({ value, onChange, disabled = false, isDark = false }: { value: number; onChange?: (r: number) => void; disabled?: boolean; isDark?: boolean }) => (
  <div className="flex gap-1.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        disabled={disabled}
        onClick={() => onChange && onChange(star)}
        className={`transition-transform ${disabled ? 'cursor-default' : 'hover:scale-110 active:scale-95 focus:outline-none'}`}
      >
        <svg
          className={`w-7 h-7 transition-colors ${
            value >= star
              ? 'text-amber-400 fill-amber-400'
              : isDark ? 'text-gray-700' : 'text-gray-300'
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
);

// Evaluation Modal for an Active Box
const TeacherEvaluationModal = ({
  box,
  teachers,
  questions,
  onClose,
  onSubmitSuccess,
  user,
  termSerial
}: any) => {
  const { isDark } = useDarkMode();
  const { showToast } = useToast();
  const [submitReview, { isLoading }] = useSubmitTeacherReviewMutation();
  const [selectedTeacherId, setSelectedTeacherId] = useState(teachers[0]?.id || teachers[0]?.teacher_id || "");
  const [answers, setAnswers] = useState<{ [qId: string]: number }>({});
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (questions.length > 0) {
      const initial: { [qId: string]: number } = {};
      questions.forEach((q: any) => { initial[q.id] = 0; });
      setAnswers(initial);
    }
  }, [questions]);

  const handleRatingChange = (qId: string, rating: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: rating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherId) {
      showToast("Please select a teacher to evaluate.", "error");
      return;
    }

    const unanswered = questions.filter((q: any) => !answers[q.id]);
    if (unanswered.length > 0) {
      showToast("Please answer all rating questions.", "error");
      return;
    }

    const totalRating = (Object.values(answers) as number[]).reduce((acc, curr) => acc + curr, 0);
    const overallRating = Math.round(totalRating / questions.length);

    const formattedAnswers = Object.entries(answers).map(([qId, rating]) => ({
      question_id: parseInt(qId, 10) || qId,
      rating
    }));

    try {
      await submitReview({
        teacher_id: selectedTeacherId,
        class_id: user?.class_id,
        term_serial: termSerial,
        rating: overallRating,
        comment,
        answers: formattedAnswers,
        assignment_id: box.id
      }).unwrap();

      showToast("Evaluation submitted successfully!", "success");
      onSubmitSuccess(selectedTeacherId);
      onClose();
    } catch (err: any) {
      showToast(err.data?.error || err.message || "Failed to submit review.", "error");
    }
  };

  const activeTeacher = teachers.find((t: any) => String(t.id || t.teacher_id) === String(selectedTeacherId));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border ${
        isDark ? 'bg-[#060338] border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900'
      }`}>
        {/* Modal Header */}
        <div className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b backdrop-blur-md ${
          isDark ? 'bg-[#060338]/90 border-gray-800' : 'bg-white/90 border-gray-100'
        }`}>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {box.class_name || "Evaluation Form"}
            </span>
            <h2 className="text-xl font-extrabold">{box.title}</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-800'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Teacher Selection */}
          {teachers.length > 1 && (
            <div>
              <label className="block text-xs font-black uppercase text-gray-400 mb-2">Select Instructor</label>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className={`w-full h-12 rounded-xl px-4 text-sm font-bold border outline-none ${
                  isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
                }`}
              >
                {teachers.map((t: any) => (
                  <option key={t.id || t.teacher_id} value={t.id || t.teacher_id}>
                    {t.full_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeTeacher && (
            <div className={`flex items-center gap-4 p-4 rounded-2xl border ${
              isDark ? 'bg-indigo-950/30 border-indigo-800/40' : 'bg-indigo-50/60 border-indigo-100'
            }`}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-lg bg-[#010080] text-white shadow-md">
                {activeTeacher.full_name?.[0] || "T"}
              </div>
              <div>
                <h3 className="font-bold text-base">{activeTeacher.full_name}</h3>
                <p className="text-xs text-gray-500">Evaluating for {box.title}</p>
              </div>
            </div>
          )}

          {/* Rating Questions */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Evaluation Criteria</h4>
            {questions.map((q: any) => (
              <div key={q.id} className={`p-4 rounded-2xl border ${
                isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50/70 border-gray-100'
              }`}>
                <label className="block text-sm font-semibold mb-3">{q.question_text}</label>
                <StarRating
                  value={answers[q.id] || 0}
                  onChange={(rating) => handleRatingChange(q.id, rating)}
                  isDark={isDark}
                />
              </div>
            ))}
          </div>

          {/* Additional Comment */}
          <div>
            <label className="block text-xs font-black uppercase text-gray-400 mb-2">Additional Feedback (Optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className={`w-full p-4 rounded-xl border text-sm outline-none transition-colors ${
                isDark ? 'bg-gray-900 border-gray-700 text-white focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-600'
              }`}
              placeholder="Share constructive feedback for your instructor..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm border ${
                isDark ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : 'border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl font-bold text-sm bg-[#010080] hover:bg-blue-900 text-white shadow-lg shadow-blue-950/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {isLoading ? "Submitting..." : "Submit Evaluation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function StudentReviewPage() {
  const { isDark } = useDarkMode();
  const { data: user } = useGetCurrentUserQuery();
  const { data: timelines = [] } = useGetTimelinesQuery();
  const { data: questions = [] } = useGetQuestionsQuery("teacher");
  const isProficiencyOnly = isProficiencyOnlyStudent(user);
  const { showToast } = useToast();

  const {
    data: reviewBoxes = [],
    isLoading: boxesLoading,
    refetch: refetchBoxes
  } = useGetStudentReviewBoxesQuery(undefined, {
    skip: !user || isProficiencyOnly
  });

  const {
    data: teachersToReview = [],
    isLoading: teachersLoading,
    refetch: refetchTeachers
  } = useGetTeachersToReviewQuery(undefined, {
    skip: !user || isProficiencyOnly
  });

  const [submitReview] = useSubmitTeacherReviewMutation();
  const [activeModalBox, setActiveModalBox] = useState<any>(null);
  const [locallySubmitted, setLocallySubmitted] = useState<{ [boxId: string]: boolean }>({});
  const [confirmBoxId, setConfirmBoxId] = useState<string | number | null>(null);
  const [isSubmittingLink, setIsSubmittingLink] = useState(false);

  const handleOpenQuestionnaireLink = (box: any) => {
    if (box.questionnaire_url) {
      window.open(box.questionnaire_url, "_blank", "noopener,noreferrer");
    }
    setConfirmBoxId(box.id);
  };

  const handleConfirmCompleted = async (box: any) => {
    setIsSubmittingLink(true);
    try {
      const defaultTeacherId = teachersToReview[0]?.id || teachersToReview[0]?.teacher_id || "1";
      await submitReview({
        teacher_id: defaultTeacherId,
        class_id: user?.class_id,
        term_serial: currentTermSerial,
        rating: 5,
        comment: "Completed via questionnaire link",
        answers: [],
        assignment_id: box.id
      }).unwrap();

      showToast("Questionnaire marked as completed!", "success");
      setLocallySubmitted((prev) => ({ ...prev, [box.id]: true }));
      setConfirmBoxId(null);
      refetchBoxes();
    } catch (err: any) {
      showToast(err?.data?.error || err?.message || "Submitted state updated", "success");
      setLocallySubmitted((prev) => ({ ...prev, [box.id]: true }));
      setConfirmBoxId(null);
      refetchBoxes();
    } finally {
      setIsSubmittingLink(false);
    }
  };

  const handleReviewSuccess = (teacherId: string) => {
    if (activeModalBox) {
      setLocallySubmitted((prev) => ({ ...prev, [activeModalBox.id]: true }));
    }
    refetchBoxes();
    refetchTeachers();
  };

  const currentTermSerial = timelines.length > 0 ? timelines[timelines.length - 1]?.term_serial : '1';

  if (isProficiencyOnly) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#03002e] text-white' : 'bg-gray-100/70 text-gray-900'}`}>
        <p className="text-gray-500">Teacher evaluations are not available for your program.</p>
      </div>
    );
  }

  const formatDate = (isoString?: string) => {
    if (!isoString) return "-";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return String(isoString);
      return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    } catch (_e) {
      return String(isoString);
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    } catch (_e) {
      return "";
    }
  };

  const getBadgeStyle = (status: string) => {
    if (status === "open" || status === "active") return "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800";
    if (status === "upcoming" || status === "pending") return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800";
    if (status === "completed" || status === "reviewed") return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800";
    return "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800";
  };

  const getBadgeLabel = (status: string) => {
    if (status === "open" || status === "active") return "ACTIVE NOW";
    if (status === "upcoming" || status === "pending") return "UPCOMING";
    if (status === "completed" || status === "reviewed") return "REVIEWED";
    return "CLOSED";
  };

  return (
    <div className={`min-h-screen p-6 transition-colors ${isDark ? 'bg-[#03002e] text-white' : 'bg-gray-100/70 text-gray-900'}`}>
      <div className="w-full max-w-7xl mx-auto">
        <StudentPageHeader
          title="Teacher Reviews"
          description="Manage teacher review boxes assigned to your class and submit your evaluations."
        />

        {/* Review Boxes Grid matching Admin layout */}
        <div className="mt-8">
          {boxesLoading || teachersLoading ? (
            <div className="grid gap-6 xl:grid-cols-3 lg:grid-cols-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`h-64 rounded-2xl animate-pulse ${isDark ? 'bg-gray-800' : 'bg-white'}`}></div>
              ))}
            </div>
          ) : reviewBoxes.length === 0 ? (
            <div className={`text-center py-20 rounded-2xl border border-dashed ${isDark ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-white'}`}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold">No Review Boxes Available</h3>
              <p className="text-xs text-gray-500 mt-1">There are no teacher review boxes currently assigned to your class.</p>
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-3 lg:grid-cols-2">
              {reviewBoxes.map((box: any) => {
                const isSubmitted = Boolean(box.is_submitted || locallySubmitted[box.id]);
                let status = box.computed_status || 'open';
                if (isSubmitted) status = 'completed';

                const isOpen = status === 'open' || status === 'active';
                const isUpcoming = status === 'upcoming' || status === 'pending';
                const isClosed = status === 'closed';
                const isCompleted = status === 'completed';

                return (
                  <div
                    key={box.id}
                    className={`rounded-2xl border p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg flex flex-col justify-between ${
                      isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div>
                      {/* Top Row: Icon + Status Badge */}
                      <div className="mb-5 flex items-start justify-between gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase ${getBadgeStyle(status)}`}>
                          {getBadgeLabel(status)}
                        </span>
                      </div>

                      {/* Title & Class */}
                      <h2 className="mb-1 font-serif text-xl font-black text-[#05004e] dark:text-white">
                        {box.title}
                      </h2>
                      <p className="mb-4 text-xs font-bold text-blue-600">
                        {box.class_name || "All Classes"}
                      </p>

                      {box.description && (
                        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                          {box.description}
                        </p>
                      )}

                      {/* Metadata Grid (Program, Subprogram, Dates) */}
                      <div className="mb-4 grid grid-cols-2 gap-4 border-y border-gray-100 py-4 text-sm dark:border-gray-800">
                        <div>
                          <div className="text-[10px] font-black uppercase text-gray-400">Program</div>
                          <div className="truncate font-semibold text-xs text-gray-800 dark:text-gray-200" title={box.program_name || "All Programs"}>
                            {box.program_name || "All Programs"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-black uppercase text-gray-400">Subprogram</div>
                          <div className="truncate font-semibold text-xs text-gray-800 dark:text-gray-200" title={box.subprogram_name || "All Subprograms"}>
                            {box.subprogram_name || "All Subprograms"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-black uppercase text-gray-400">Start Date</div>
                          <div className="font-semibold text-xs text-gray-800 dark:text-gray-200">
                            {formatDate(box.start_date)} <span className="text-[10px] text-gray-400">{formatTime(box.start_date)}</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-black uppercase text-gray-400">End Date</div>
                          <div className="font-semibold text-xs text-gray-800 dark:text-gray-200">
                            {formatDate(box.end_date)} <span className="text-[10px] text-gray-400">{formatTime(box.end_date)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="space-y-2 pt-2">
                      {isOpen && (
                        box.questionnaire_url ? (
                          <div className="space-y-3">
                            <button
                              onClick={() => handleOpenQuestionnaireLink(box)}
                              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#010080] py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-900 active:scale-95"
                            >
                              <span>Open Questionnaire Link</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </button>

                            {confirmBoxId === box.id && (
                              <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/90 dark:bg-indigo-950/60 dark:border-indigo-800 space-y-3 animate-in fade-in duration-200">
                                <div className="flex items-center gap-2 text-xs font-bold text-indigo-950 dark:text-indigo-200">
                                  <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span>Did you finish submitting the questionnaire?</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleConfirmCompleted(box)}
                                    disabled={isSubmittingLink}
                                    className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>{isSubmittingLink ? "Submitting..." : "Yes, I Completed It"}</span>
                                  </button>
                                  <button
                                    onClick={() => setConfirmBoxId(null)}
                                    disabled={isSubmittingLink}
                                    className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 text-xs font-bold text-gray-700 dark:text-gray-200 transition"
                                  >
                                    Not Yet
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => setActiveModalBox(box)}
                            className="w-full rounded-xl bg-[#010080] py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-900 active:scale-95 flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>Evaluate Instructors</span>
                          </button>
                        )
                      )}

                      {isCompleted && (
                        <div className="w-full rounded-xl bg-emerald-50 border border-emerald-200 py-3 text-center text-xs font-bold text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Evaluation Submitted & Completed</span>
                        </div>
                      )}

                      {isUpcoming && (
                        <div className="w-full rounded-xl bg-amber-50 border border-amber-200 py-3 text-center text-xs font-bold text-amber-800 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300 flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Opens on {formatDate(box.start_date)} {formatTime(box.start_date)}</span>
                        </div>
                      )}

                      {isClosed && !isCompleted && (
                        <div className="w-full rounded-xl bg-gray-100 border border-gray-200 py-3 text-center text-xs font-bold text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">
                          Review Period Closed
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Active Evaluation Modal */}
      {activeModalBox && (
        <TeacherEvaluationModal
          box={activeModalBox}
          teachers={teachersToReview}
          questions={questions}
          onClose={() => setActiveModalBox(null)}
          onSubmitSuccess={handleReviewSuccess}
          user={user}
          termSerial={currentTermSerial}
        />
      )}
    </div>
  );
}
