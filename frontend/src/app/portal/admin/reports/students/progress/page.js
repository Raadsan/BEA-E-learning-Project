"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useDarkMode } from "@/context/ThemeContext";
import {
    useLazyGetStudentProgressReportQuery,
    useGetStudentAvailablePeriodsQuery
} from "@/redux/api/reportApi";
import { toast } from "react-hot-toast";
import StudentProgressReportView from "@/components/StudentProgressReportView";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function StudentProgressReportPage() {
    const { isDark } = useDarkMode();
    const searchParams = useSearchParams();
    const [studentId, setStudentId] = useState("");
    const [selectedPeriod, setSelectedPeriod] = useState("");
    const [reportData, setReportData] = useState(null);

    const [triggerFetch, { isLoading: reportLoading }] = useLazyGetStudentProgressReportQuery();

    // fetch available periods when reportData changes (meaning we have a valid studentId)
    const { data: availablePeriods = [], isLoading: periodsLoading } = useGetStudentAvailablePeriodsQuery(
        reportData?.studentInfo?.id || studentId,
        { skip: !reportData?.studentInfo?.id }
    );

    useEffect(() => {
        const idFromUrl = searchParams.get('id');
        if (idFromUrl) {
            setStudentId(idFromUrl);
            autoFetch(idFromUrl);
        }
    }, [searchParams]);

    // Handle period changes
    useEffect(() => {
        if (reportData?.studentInfo?.id) {
            autoFetch(reportData.studentInfo.id, selectedPeriod);
        }
    }, [selectedPeriod]);

    const autoFetch = async (id, period = "") => {
        if (!id) return;
        try {
            const data = await triggerFetch({ studentId: id, period }).unwrap();
            setReportData(data);
        } catch (error) {
            toast.error(error.data?.error || "Student record not found");
        }
    };

    const handleSearch = async () => {
        if (!studentId.trim()) return toast.error("Please enter a Student ID");
        setSelectedPeriod(""); // Reset period on new search
        autoFetch(studentId);
    };

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
        <div className={`flex-1 min-h-screen p-8 transition-colors ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-6xl mx-auto space-y-10">
                {/* Search Header */}
                <div className={`p-8 rounded-[2.5rem] border transition-all ${isDark ? 'bg-gray-800 border-gray-700 shadow-2xl' : 'bg-white border-gray-100 shadow-xl'}`}>
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <div className="flex-1">
                            <h1 className={`text-2xl font-black uppercase tracking-tight mb-1 ${isDark ? 'text-white' : 'text-[#010080]'}`}>
                                Performance Archive Search
                            </h1>
                            <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Retrieve individual student records and periodic academic reports.
                            </p>
                        </div>
                        <div className="flex gap-3 min-w-[300px] md:min-w-[450px]">
                            <div className="relative flex-1">
                                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Enter Student ID (e.g., BEA-2026-0001)"
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className={`w-full pl-12 pr-6 py-3.5 rounded-2xl border font-bold text-sm focus:ring-4 transition-all outline-none ${isDark
                                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-white/10'
                                            : 'bg-gray-50 border-gray-200 text-[#010080] focus:ring-[#010080]/10'
                                        }`}
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                disabled={reportLoading}
                                className={`px-8 py-3.5 rounded-2xl bg-[#010080] text-white font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-[#010080]/20`}
                            >
                                {reportLoading ? "ARCHIVING..." : "SEARCH"}
                            </button>
                        </div>
                    </div>
                </div>

                {reportData ? (
                    <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
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
                ) : (
                    !reportLoading && (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                            <div className={`p-8 rounded-full mb-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-inner'}`}>
                                <MagnifyingGlassIcon className="w-16 h-16" />
                            </div>
                            <h3 className="text-xl font-bold uppercase tracking-widest">Awaiting Identity Input</h3>
                            <p className="mt-2 font-medium">Please enter a valid student identification number to generate a report.</p>
                        </div>
                    )
                )}

                {reportLoading && !reportData && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#010080] border-t-transparent shadow-xl mb-6"></div>
                        <h3 className="text-xl font-black uppercase tracking-widest animate-pulse">Retrieving Academic Data</h3>
                    </div>
                )}
            </div>
        </div>
    );
}
