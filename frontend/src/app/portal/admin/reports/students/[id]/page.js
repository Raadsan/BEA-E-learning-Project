"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDarkMode } from "@/context/ThemeContext";
import {
    useGetStudentProgressReportQuery,
    useGetStudentAvailablePeriodsQuery
} from "@/redux/api/reportApi";
import StudentProgressReportView from "@/components/StudentProgressReportView";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function StudentDetailedReportPage() {
    const { isDark } = useDarkMode();
    const params = useParams();
    const router = useRouter();
    const studentId = params.id;
    const [selectedPeriod, setSelectedPeriod] = useState("");

    // 1. Get available periods for this student
    const { data: availablePeriods = [], isLoading: periodsLoading } = useGetStudentAvailablePeriodsQuery(studentId, {
        skip: !studentId
    });

    // 2. Get the progress report data (either full or for a specific period)
    const { data: reportData, isLoading: reportLoading, error } = useGetStudentProgressReportQuery(
        { studentId, period: selectedPeriod },
        { skip: !studentId }
    );

    if (periodsLoading) {
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
                    <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-2">Report Not Found</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        The requested academic record for ID: {studentId} could not be retrieved.
                    </p>
                    <button
                        onClick={() => router.push('/portal/admin/reports/students')}
                        className="bg-[#010080] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#010080]/90 transition-colors"
                    >
                        Back to Student List
                    </button>
                </div>
            </div>
        );
    }

    // Map backend data to component props
    const formattedStudent = reportData?.studentInfo ? {
        full_name: reportData.studentInfo.name,
        student_id: reportData.studentInfo.id,
        program_name: reportData.studentInfo.courseLevel,
        subprogram_name: reportData.studentInfo.subprogram,
        instructor_name: reportData.studentInfo.instructor
    } : {};

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

    const transformedPeriods = Array.isArray(availablePeriods) ? availablePeriods.map(p => ({
        period: p.period,
        label: p.label || new Date(p.period + "-01").toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    })) : [];

    return (
        <main className={`min-h-screen pt-8 pb-12 w-full px-6 sm:px-10 transition-colors ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Back Button */}
            <button
                onClick={() => router.push('/portal/admin/reports/students')}
                className={`mb-6 flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-sm transition-all active:scale-95 ${isDark
                    ? 'bg-gray-800 text-white hover:bg-gray-700'
                    : 'bg-white text-[#010080] hover:bg-gray-50 border border-gray-200 shadow-sm'
                    }`}
            >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Student Directory
            </button>

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
