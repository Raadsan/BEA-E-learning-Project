"use client";

import React, { useState } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import {
  useGetStudentProgressReportQuery,
  useGetStudentAvailablePeriodsQuery
} from "@/redux/api/reportApi";
import StudentProgressReportView from "@/components/StudentProgressReportView";
import OfficialReportModal from "@/components/OfficialReportModal";
import { PrinterIcon } from "@heroicons/react/24/outline";

export default function ProgressReportPage() {
  const { isDark } = useDarkMode();
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // 1. Get current user to identify the student
  const { data: user, isLoading: userLoading } = useGetCurrentUserQuery();
  const studentId = user?.id;

  // 2. Get available periods for this student
  const { data: availablePeriods = [], isLoading: periodsLoading } = useGetStudentAvailablePeriodsQuery(studentId, {
    skip: !studentId
  });

  // 3. Get the progress report data (either full or for a specific period)
  const { data: reportData, isLoading: reportLoading, error } = useGetStudentProgressReportQuery(
    { studentId, period: selectedPeriod },
    { skip: !studentId }
  );

  const handlePrint = () => {
    setIsPrintModalOpen(true);
  };

  const isInitialLoading = userLoading || periodsLoading;
  const hasError = !!error;

  // Map backend data to component props
  const formattedStudent = reportData?.studentInfo ? {
    full_name: reportData.studentInfo.name || user?.full_name || 'N/A',
    student_id: reportData.studentInfo.id || user?.student_id || user?.id || 'N/A',
    program_name: reportData.studentInfo.courseLevel || reportData.studentInfo.subprogram || user?.chosen_program || 'N/A',
    subprogram_name: reportData.studentInfo.subprogram || 'N/A',
    instructor_name: reportData.studentInfo.instructor || 'N/A'
  } : {
    full_name: user?.full_name || 'N/A',
    student_id: user?.student_id || user?.id || 'N/A',
    program_name: user?.chosen_program || 'N/A',
    subprogram_name: 'N/A',
    instructor_name: 'N/A'
  };

  const formattedSummary = reportData?.progressSummary ? {
    attendance_rate: reportData.progressSummary.attendanceRate,
    overall_gpa: reportData.examResult || 0,
    completion_rate: reportData.progressSummary.completionRate || 0,
    total_assignments: 0
  } : {
    attendance_rate: 0,
    overall_gpa: 0,
    completion_rate: 0
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

  const transformedPeriods = Array.isArray(availablePeriods) ? availablePeriods.map(p => ({
    period: p.period,
    label: p.label || new Date(p.period + "-01").toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  })) : [];

  return (
    <main className={`min-h-screen pt-12 pb-12 w-full sm:px-10 transition-colors ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex justify-between items-center mb-8 no-print">
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Student Progress Report
        </h2>
        <div className="flex items-center gap-4">
          {transformedPeriods.length > 0 && (
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className={`px-4 py-2.5 rounded-xl border font-bold text-sm ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-[#010080]'} focus:outline-none focus:ring-2 focus:ring-[#010080]/20 transition-all`}
            >
              <option value="">Full History</option>
              {transformedPeriods.map(p => (
                <option key={p.period} value={p.period}>{p.label}</option>
              ))}
            </select>
          )}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-[#010080] text-white px-6 py-2.5 rounded-xl hover:bg-blue-900 transition-all shadow-lg hover:shadow-blue-900/20 font-medium"
          >
            <PrinterIcon className="w-5 h-5" />
            Print Official Report
          </button>
        </div>
      </div>
      <div id="printable-report">
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
      </div>

      <OfficialReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        data={reportData}
        student={formattedStudent}
        summary={formattedSummary}
        performance={formattedPerformance}
        isDark={isDark}
      />
    </main>
  );
}
