"use client";

import React, { useState } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import {
  useGetStudentProgressReportQuery,
  useGetStudentAvailablePeriodsQuery
} from "@/redux/api/reportApi";
import StudentProgressReportView from "@/components/StudentProgressReportView";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

export default function ProgressReportPage() {
  const { isDark } = useDarkMode();
  const [selectedPeriod, setSelectedPeriod] = useState("");

  // 1. Get current user to identify the student
  const { data: user, isLoading: userLoading } = useGetCurrentUserQuery();
  const studentId = user?.user_id;

  // 2. Get available periods for this student
  const { data: availablePeriods = [], isLoading: periodsLoading } = useGetStudentAvailablePeriodsQuery(studentId, {
    skip: !studentId
  });

  // 3. Get the progress report data (either full or for a specific period)
  const { data: reportData, isLoading: reportLoading, error } = useGetStudentProgressReportQuery(
    { studentId, period: selectedPeriod },
    { skip: !studentId }
  );

  if (userLoading || periodsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#010080] border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-3xl border border-red-100 dark:border-red-800 max-w-md">
          <DocumentTextIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-2">Failed to load report</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We couldn't retrieve your academic progress data at this time.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-700 transition-colors"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  // Map backend data to component props
  const formattedStudent = reportData?.studentInfo ? {
    full_name: reportData.studentInfo.name || user?.full_name,
    student_id: reportData.studentInfo.id || user?.student_id,
    program_name: reportData.studentInfo.courseLevel,
    subprogram_name: reportData.studentInfo.subprogram,
    instructor_name: reportData.studentInfo.instructor
  } : {
    full_name: user?.full_name,
    student_id: user?.student_id
  };

  const formattedSummary = reportData?.progressSummary ? {
    attendance_rate: reportData.progressSummary.attendanceRate,
    overall_gpa: reportData.examResult || 0,
    total_assignments: 0
  } : {
    attendance_rate: 0,
    overall_gpa: 0
  };

  const formattedPerformance = reportData?.skillPerformance ? Object.entries(reportData.skillPerformance).map(([key, val]) => ({
    category: key.charAt(0).toUpperCase() + key.slice(1),
    average: val
  })) : [];

  const formattedFeedback = reportData?.feedback ? [{
    feedback: reportData.feedback.comments || reportData.feedback.comment,
    teacher_name: reportData.studentInfo?.instructor || "Department Head",
    created_at: new Date().toISOString()
  }] : [];

  // Transform periods for the selector
  const transformedPeriods = Array.isArray(availablePeriods) ? availablePeriods.map(p => ({
    period: p.period, // e.g. "2024-05"
    label: p.label || new Date(p.period + "-01").toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  })) : [];

  return (
    <main className={`min-h-screen pt-12 pb-12 w-full px-6 sm:px-10 transition-colors ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <StudentProgressReportView
        student={formattedStudent}
        summary={formattedSummary}
        performance={formattedPerformance}
        submissions={reportData?.submissions || []}
        recentFeedback={formattedFeedback}
        periods={transformedPeriods}
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        isLoading={reportLoading}
        isDark={isDark}
        showLedger={true}
      />
    </main>
  );
}
