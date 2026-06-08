"use client";

import { useState, useEffect } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetAssignmentsQuery } from "@/lib/api/assignmentApi";
import { useGetCurrentUserQuery } from "@/lib/api/authApi";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";
import {
  getAssignmentTimeStatus,
  getAssignmentTimeStatusBadgeClass,
  getAssignmentTimeStatusLabel,
  getAssignmentTimeButtonLabel,
  isAssignmentTimeActionDisabled,
  formatAssignmentDateTime,
  formatAssignmentCountdown,
} from "@/utils/assignmentTime";

export default function ExamsPage() {
  const { isDark } = useDarkMode();
  const { showToast } = useToast();
  const router = useRouter();
  const { data: user } = useGetCurrentUserQuery();
  const [now, setNow] = useState(() => new Date());

  const { data: tests, isLoading, error } = useGetAssignmentsQuery(
    { class_id: user?.class_id, type: "exam" },
    { skip: !user?.class_id }
  );

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (error) showToast("Failed to load exams", "error");
  }, [error, showToast]);

  const handleOpenTest = (test) => {
    const status = getAssignmentTimeStatus(test, now);

    if (status === "upcoming") {
      showToast("This exam is not open yet. Please wait until the start time.", "info");
      return;
    }
    if (status === "complete") {
      showToast("This exam is complete.", "warning");
      return;
    }
    if (status === "submitted" || status === "graded") {
      router.push(`/portal/student/exams/results?id=${test.id}`);
    } else {
      router.push(`/portal/student/exams/take?id=${test.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const visibleTests = tests?.filter((t) => t.status !== "inactive") || [];

  return (
    <div className={`min-h-screen p-8 transition-colors ${isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      <div className="mb-8 mt-4">
        <h1 className="text-2xl font-bold mb-1">Exams</h1>
        <p className={`text-sm opacity-60 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          View your exams. Tasks open at the start time and complete when the end time is reached.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {!user?.class_id ? (
          <div className="col-span-full py-20 text-center opacity-50">
            <p className="text-xl">No class assigned yet.</p>
          </div>
        ) : visibleTests.length === 0 ? (
          <div className="col-span-full py-20 text-center opacity-50">
            <p className="text-xl">No exams assigned yet.</p>
          </div>
        ) : (
          visibleTests.map((test) => {
            const status = getAssignmentTimeStatus(test, now);
            const isDisabled = isAssignmentTimeActionDisabled(status);
            const isGraded = status === "graded";
            const isSubmitted = status === "submitted";
            const isUpcoming = status === "upcoming";
            const isActive = status === "active";
            const endDate = test.due_date || test.end_date;

            const buttonLabel = getAssignmentTimeButtonLabel(status, {
              scoreText: isGraded ? `${test.score}/${test.total_points}` : undefined,
              activeLabel: "Take Exam",
            });

            return (
              <div
                key={test.id}
                className={`flex flex-col rounded-lg p-5 border transition-all ${
                  isDisabled ? "opacity-70" : ""
                } ${
                  isDark
                    ? "bg-gray-800 border-gray-700 hover:border-gray-600"
                    : "bg-white border-gray-200 hover:border-blue-300"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs font-bold uppercase tracking-wide opacity-50 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Exam
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getAssignmentTimeStatusBadgeClass(status)}`}
                  >
                    {getAssignmentTimeStatusLabel(status)}
                  </span>
                </div>

                <h3 className="text-lg font-bold mb-1.5 line-clamp-1">{test.title}</h3>
                <p className={`text-sm mb-4 line-clamp-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  {test.description ||
                    (test.duration ? `${test.duration} minutes` : "No description provided.")}
                </p>

                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-3">
                  <div
                    className={`flex items-center justify-between text-xs font-medium opacity-70 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                        />
                      </svg>
                      <span>{test.total_points || 0} Marks</span>
                    </div>
                    {isGraded && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        {test.score}/{test.total_points}
                      </span>
                    )}
                  </div>

                  <div className={`text-xs space-y-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>Starts: {formatAssignmentDateTime(test.start_date)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>Ends: {formatAssignmentDateTime(endDate)}</span>
                    </div>
                    {isUpcoming && test.start_date && (
                      <p className="text-blue-600 dark:text-blue-400 font-semibold pt-1">
                        Opens in {formatAssignmentCountdown(test.start_date, now)}
                      </p>
                    )}
                    {isActive && endDate && (
                      <p className="text-amber-600 dark:text-amber-400 font-semibold pt-1">
                        Completes in {formatAssignmentCountdown(endDate, now)}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenTest(test)}
                    disabled={isDisabled}
                    className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all ${
                      isGraded || isSubmitted
                        ? isDark
                          ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        : isDisabled
                          ? "bg-gray-400 cursor-not-allowed text-white opacity-70"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {buttonLabel}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
