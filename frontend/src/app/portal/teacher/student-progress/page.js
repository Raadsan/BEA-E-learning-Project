"use client";

import React, { useState } from "react";
import { useGetStudentProgressQuery } from "@/redux/api/studentApi";
import {
    useGetStudentProgressReportQuery,
    useGetStudentAvailablePeriodsQuery
} from "@/redux/api/reportApi";
import { useDarkMode } from "@/context/ThemeContext";
import DataTable from "@/components/DataTable";
import StudentProgressReportView from "@/components/StudentProgressReportView";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function StudentProgressPage() {
    const { isDark } = useDarkMode();
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState("");

    const { data: students, isLoading: studentsLoading, error: studentsError } = useGetStudentProgressQuery();

    // Hooks for student detail view
    const { data: availablePeriods = [], isLoading: periodsLoading } = useGetStudentAvailablePeriodsQuery(selectedStudentId, {
        skip: !selectedStudentId
    });

    const { data: reportData, isLoading: reportLoading, error: reportError } = useGetStudentProgressReportQuery(
        { studentId: selectedStudentId, period: selectedPeriod },
        { skip: !selectedStudentId }
    );

    const getStatusBadge = (status) => {
        const statusConfig = {
            'On Track': { bg: 'bg-green-100', text: 'text-green-800', darkBg: 'bg-green-900', darkText: 'text-green-200' },
            'At Risk': { bg: 'bg-yellow-100', text: 'text-yellow-800', darkBg: 'bg-yellow-900', darkText: 'text-yellow-200' },
            'Inactive': { bg: 'bg-red-100', text: 'text-red-800', darkBg: 'bg-red-900', darkText: 'text-red-200' },
        };

        const config = statusConfig[status] || statusConfig['Inactive'];

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isDark ? `${config.darkBg} ${config.darkText}` : `${config.bg} ${config.text}`
                }`}>
                {status}
            </span>
        );
    };

    const columns = [
        {
            key: "full_name",
            label: "Student Name",
            render: (val, row) => (
                <div className="font-bold text-[#010080] dark:text-white uppercase text-xs">{val}</div>
            ),
        },
        {
            key: "email",
            label: "Email / ID",
            render: (val) => (
                <div className={`text-[10px] font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{val}</div>
            ),
        },
        {
            key: "class_name",
            label: "Class",
            render: (val) => (
                <div className={`text-[10px] font-bold ${isDark ? 'text-gray-300' : 'text-[#010080]'}`}>{val || 'Not Assigned'}</div>
            ),
        },
        {
            key: "progress_percentage",
            label: "Progress",
            render: (val) => (
                <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 min-w-[80px]">
                        <div
                            className={`h-1.5 rounded-full transition-all duration-500 ${val >= 75 ? 'bg-green-500' : val >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                            style={{ width: `${Math.min(val || 0, 100)}%` }}
                        />
                    </div>
                    <span className={`text-[10px] font-black ${isDark ? 'text-gray-300' : 'text-[#010080]'}`}>
                        {val || 0}%
                    </span>
                </div>
            ),
        },
        {
            key: "status",
            label: "Status",
            render: (val) => getStatusBadge(val),
        }
    ];

    if (studentsLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#010080] border-t-transparent"></div>
            </div>
        );
    }

    if (studentsError) {
        return (
            <div className="p-8">
                <div className={`rounded-3xl shadow-xl p-8 ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-100'}`}>
                    <h2 className="text-xl font-black text-red-600 mb-4 uppercase tracking-tight">System Error</h2>
                    <p className={isDark ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>
                        {studentsError?.data?.error || "Failed to load student tracking data."}
                    </p>
                </div>
            </div>
        );
    }

    // Detail View
    if (selectedStudentId) {
        // Find the basic student info from the list for immediate display
        const basicInfo = students?.find(s => s.id === selectedStudentId);

        // Map backend data to component props
        const formattedStudent = reportData?.studentInfo ? {
            full_name: reportData.studentInfo.name || basicInfo?.full_name,
            student_id: reportData.studentInfo.id || basicInfo?.student_id,
            program_name: reportData.studentInfo.courseLevel,
            subprogram_name: reportData.studentInfo.subprogram,
            instructor_name: reportData.studentInfo.instructor
        } : {
            full_name: basicInfo?.full_name,
            student_id: basicInfo?.student_id
        };

        const formattedSummary = reportData?.progressSummary ? {
            attendance_rate: reportData.progressSummary.attendanceRate,
            overall_gpa: reportData.examResult || 0,
            total_assignments: 0
        } : {
            attendance_rate: 0,
            overall_gpa: basicInfo?.progress_percentage || 0
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
            <div className="p-8">
                {/* Back Button */}
                <button
                    onClick={() => {
                        setSelectedStudentId(null);
                        setSelectedPeriod("");
                    }}
                    className={`mb-6 flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-sm transition-all active:scale-95 ${isDark
                        ? 'bg-gray-800 text-white hover:bg-gray-700'
                        : 'bg-white text-[#010080] hover:bg-gray-50 border border-gray-200 shadow-sm'
                        }`}
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Back to Registry
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
            </div>
        );
    }

    // List View
    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className={`text-4xl font-black tracking-tight ${isDark ? 'text-white' : 'text-[#010080]'}`}>
                    Student Tracking Registry
                </h1>
                <p className={`mt-2 font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Comprehensive academic performance monitoring and periodic reporting.
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className={`rounded-3xl shadow-xl p-8 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-white'}`}>
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Total Managed</div>
                    <div className={`text-4xl font-black ${isDark ? 'text-white' : 'text-[#010080]'}`}>
                        {students?.length || 0}
                    </div>
                </div>
                <div className={`rounded-3xl shadow-xl p-8 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-white'}`}>
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Optimal Progress</div>
                    <div className="text-4xl font-black text-green-500">
                        {students?.filter(s => s.status === 'On Track').length || 0}
                    </div>
                </div>
                <div className={`rounded-3xl shadow-xl p-8 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-white'}`}>
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Requiring Attention</div>
                    <div className="text-4xl font-black text-red-500">
                        {students?.filter(s => s.status === 'At Risk' || s.status === 'Inactive').length || 0}
                    </div>
                </div>
            </div>

            {/* Student Table */}
            <div className="rounded-3xl shadow-2xl overflow-hidden">
                <DataTable
                    columns={columns}
                    data={students || []}
                    title="Academic Master Registry"
                    onRowClick={(student) => setSelectedStudentId(student.id)}
                    getRowId={(student) => student.id}
                    showAddButton={false}
                />
            </div>
        </div>
    );
}
