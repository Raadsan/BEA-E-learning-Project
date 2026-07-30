"use client";

import { useState } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetTeacherReviewBoxesQuery, useGetQuestionsQuery } from "@/lib/api/reviewApi";
import { useGetClassesQuery } from "@/lib/api/classApi";
import { useGetStudentsByClassQuery } from "@/lib/api/studentApi";
import TeacherReviewForm from "@/components/ReviewFlows/TeacherReviewForm";
import { getCurrentTerm } from "@/lib/timelineData";

// ─── Status helpers ────────────────────────────────────────────────────────
const getBadgeStyle = (status: string) => {
  if (status === "open" || status === "active")
    return "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800";
  if (status === "upcoming" || status === "pending")
    return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800";
  if (status === "completed" || status === "reviewed")
    return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800";
  return "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800";
};

const getBadgeLabel = (status: string) => {
  if (status === "open" || status === "active") return "ACTIVE NOW";
  if (status === "upcoming" || status === "pending") return "UPCOMING";
  if (status === "completed" || status === "reviewed") return "REVIEWED";
  return "CLOSED";
};

const formatDate = (isoString?: string) => {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return String(isoString);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return String(isoString); }
};

const formatTime = (isoString?: string) => {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
};

// ─── Inline Student List Modal ─────────────────────────────────────────────
function StudentListModal({
  box,
  classId,
  termSerial,
  isDark,
  onClose,
}: {
  box: any;
  classId: string | null;
  termSerial: string;
  isDark: boolean;
  onClose: () => void;
}) {
  const { data: students = [], isLoading, refetch } = useGetStudentsByClassQuery(classId, {
    skip: !classId,
  });
  const { data: classes = [] } = useGetClassesQuery();
  const className = classes.find((c: any) => c.id == classId)?.class_name || "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border ${
          isDark ? "bg-[#060338] border-gray-800 text-white" : "bg-white border-gray-100 text-gray-900"
        }`}
      >
        {/* Header */}
        <div className={`sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b ${isDark ? "border-gray-800 bg-[#060338]" : "border-gray-100 bg-white"}`}>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-blue-500">{box.title}</p>
            <h2 className="text-lg font-black">{className || "All Students"}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`h-14 rounded-xl animate-pulse ${isDark ? "bg-gray-800" : "bg-gray-100"}`} />
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm font-semibold">No students in this class</p>
            </div>
          ) : (
            <div className="space-y-3">
              {students.map((student: any) => (
                <div
                  key={student.student_id}
                  className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 ${
                    isDark ? "border-gray-800 bg-gray-900/60" : "border-gray-100 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-300 font-black text-xs flex-shrink-0">
                      {(student.full_name || "S")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{student.full_name}</div>
                      <div className="text-xs text-gray-400">{student.student_id}</div>
                    </div>
                  </div>
                  <TeacherReviewForm
                    student={student}
                    classId={classId}
                    termSerial={termSerial}
                    onComplete={refetch}
                    reviewOpen={true}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function TeacherReviewsPage() {
  const { isDark } = useDarkMode();
  const { data: reviewBoxes = [], isLoading: boxesLoading } = useGetTeacherReviewBoxesQuery();
  const { data: classes = [] } = useGetClassesQuery();

  const currentTerm = getCurrentTerm();
  const termSerial = currentTerm?.termSerial || `BEA-${new Date().getMonth() + 1}/${new Date().getFullYear()}`;

  const [activeBox, setActiveBox] = useState<any>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const openBox = (box: any) => {
    if (box.questionnaire_url) {
      window.open(box.questionnaire_url, "_blank", "noopener,noreferrer");
      return;
    }
    // No questionnaire — open student list modal
    setSelectedClassId(box.class_id ? String(box.class_id) : null);
    setActiveBox(box);
  };

  return (
    <div className={`min-h-screen transition-colors pt-4 w-full px-6 sm:px-10 pb-20 ${isDark ? "bg-[#03002e] text-white" : "bg-gray-100/70 text-gray-900"}`}>
      <div className="w-full">

        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-black tracking-tight ${isDark ? "text-white" : "text-[#05004e]"}`}>
            Student Reviews
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Review boxes assigned to your classes. Evaluate students when boxes are active.
          </p>
        </div>

        {/* Review Boxes Grid */}
        <div className="mt-4">
          {boxesLoading ? (
            <div className="grid gap-6 xl:grid-cols-3 lg:grid-cols-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`h-64 rounded-2xl animate-pulse ${isDark ? "bg-gray-800" : "bg-white"}`} />
              ))}
            </div>
          ) : reviewBoxes.length === 0 ? (
            <div className={`text-center py-20 rounded-2xl border border-dashed ${isDark ? "border-gray-800 bg-gray-900/50" : "border-gray-200 bg-white"}`}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-bold">No Review Boxes</h3>
              <p className="text-xs text-gray-500 mt-1">No student review boxes are currently assigned to your classes.</p>
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-3 lg:grid-cols-2">
              {reviewBoxes.map((box: any) => {
                const status = box.computed_status || "closed";
                const isOpen = status === "open" || status === "active";
                const isUpcoming = status === "upcoming" || status === "pending";
                const isClosed = status === "closed";

                return (
                  <div
                    key={box.id}
                    className={`rounded-2xl border p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg flex flex-col justify-between ${
                      isDark ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-white"
                    }`}
                  >
                    <div>
                      {/* Top Row: Icon + Badge */}
                      <div className="mb-5 flex items-start justify-between gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
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
                      <p className="mb-4 text-xs font-bold text-violet-600 dark:text-violet-400">
                        {box.class_name || "All Classes"}
                      </p>

                      {box.description && (
                        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                          {box.description}
                        </p>
                      )}

                      {/* Metadata Grid */}
                      <div className="mb-4 grid grid-cols-2 gap-4 border-y border-gray-100 py-4 text-sm dark:border-gray-800">
                        <div>
                          <div className="text-[10px] font-black uppercase text-gray-400">Program</div>
                          <div className="truncate font-semibold text-xs text-gray-800 dark:text-gray-200">
                            {box.program_name || "All Programs"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-black uppercase text-gray-400">Subprogram</div>
                          <div className="truncate font-semibold text-xs text-gray-800 dark:text-gray-200">
                            {box.subprogram_name || "All Subprograms"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-black uppercase text-gray-400">Start Date</div>
                          <div className="font-semibold text-xs text-gray-800 dark:text-gray-200">
                            {formatDate(box.start_date)}{" "}
                            <span className="text-[10px] text-gray-400">{formatTime(box.start_date)}</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-black uppercase text-gray-400">End Date</div>
                          <div className="font-semibold text-xs text-gray-800 dark:text-gray-200">
                            {formatDate(box.end_date)}{" "}
                            <span className="text-[10px] text-gray-400">{formatTime(box.end_date)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Response count */}
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        <span>{box.response_count ?? 0} student reviews submitted</span>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="pt-4 space-y-2">
                      {isOpen && (
                        <button
                          onClick={() => openBox(box)}
                          className="w-full rounded-xl bg-[#010080] py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-900 active:scale-95 flex items-center justify-center gap-2"
                        >
                          {box.questionnaire_url ? (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              <span>Open Questionnaire Link</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                              </svg>
                              <span>Review Students</span>
                            </>
                          )}
                        </button>
                      )}

                      {isUpcoming && (
                        <div className="w-full rounded-xl bg-amber-50 border border-amber-200 py-3 text-center text-xs font-bold text-amber-800 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300 flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Opens on {formatDate(box.start_date)} {formatTime(box.start_date)}</span>
                        </div>
                      )}

                      {isClosed && (
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

      {/* Student List Modal */}
      {activeBox && (
        <StudentListModal
          box={activeBox}
          classId={selectedClassId}
          termSerial={termSerial}
          isDark={isDark}
          onClose={() => setActiveBox(null)}
        />
      )}
    </div>
  );
}
