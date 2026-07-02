"use client";

import { useGetAttendanceReportQuery, useGetTeacherClassesQuery } from "@/lib/api/teacherApi";
import { useDarkMode } from "@/context/ThemeContext";
import { useMemo, useState } from "react";
import DataTable from "@/components/DataTable";
import { exportRowsToExcel, openPdfPrintWindow } from "@/utils/reportExport";

export default function AttendanceReportPage() {
    const { isDark } = useDarkMode();
    const [selectedClass, setSelectedClass] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const { data: classesData = [] } = useGetTeacherClassesQuery();
    const reportParams = useMemo(() => ({
        class_name: selectedClass || undefined,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
        status: selectedStatus || undefined,
    }), [selectedClass, fromDate, toDate, selectedStatus]);
    const { data: reportData = [], isLoading, error } = useGetAttendanceReportQuery(reportParams);

    const filteredData = reportData;

    const exportColumns = [
        { key: "date", label: "Date", getValue: (row) => new Date(row.date).toLocaleDateString() },
        { key: "student_name", label: "Student" },
        { key: "class_name", label: "Class" },
        { key: "hour1", label: "Hour 1", getValue: (row) => row.hour1 ? "Present" : "Absent" },
        { key: "hour2", label: "Hour 2", getValue: (row) => row.hour2 ? "Present" : "Absent" },
    ];

    const handleExportExcel = () => {
        exportRowsToExcel(
            filteredData,
            exportColumns,
            `BEA_Teacher_Report_${new Date().toISOString().split("T")[0]}`
        );
    };

    const handleExportPdf = () => {
        openPdfPrintWindow(
            "BEA Teacher Attendance Report",
            filteredData,
            exportColumns,
            [
                `Generated: ${new Date().toLocaleString()}`,
                `Class: ${selectedClass || "All Classes"}`,
                `Status: ${selectedStatus || "All Statuses"}`,
                `Period: ${fromDate || "Any"} to ${toDate || "Any"}`,
                `Rows: ${filteredData.length}`,
            ]
        );
    };

    const columns = [
        {
            key: "date",
            label: "Date",
            render: (val) => <span className="text-sm font-semibold">{new Date(val).toLocaleDateString()}</span>,
            width: "150px"
        },
        {
            key: "student_name",
            label: "Student",
            className: "font-bold",
            width: "250px"
        },
        {
            key: "class_name",
            label: "Class",
            width: "200px"
        },
        {
            key: "hour1",
            label: "Hour 1",
            render: (val) => (
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${val
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                    {val ? 'Present' : 'Absent'}
                </span>
            ),
            width: "120px"
        },
        {
            key: "hour2",
            label: "Hour 2",
            render: (val) => (
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${val
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                    {val ? 'Present' : 'Absent'}
                </span>
            ),
            width: "120px"
        }
    ];

    return (
        <main className={`flex-1 min-h-screen transition-colors ${isDark ? 'bg-[#0f172a]' : 'bg-gray-50'} px-4 sm:px-8 py-6`}>
            <DataTable
                title="Attendance Report"
                columns={columns}
                data={filteredData}
                showAddButton={false}
                isLoading={isLoading}
                emptyMessage={error ? "Failed to load report." : "No attendance records found."}
                customHeaderLeft={
                    <div className="flex gap-3 flex-wrap items-center">
                        {/* Class Filter */}
                        <div className="relative group min-w-[200px]">
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className={`w-full pl-4 pr-10 py-1.5 rounded-lg text-gray-700 font-bold text-[13px] border focus:ring-2 outline-none appearance-none transition-all shadow-sm cursor-pointer ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-900' : 'bg-white border-gray-200 focus:ring-blue-100'}`}
                            >
                                <option value="">All Classes</option>
                                {classesData.map((cls) => (
                                    <option key={cls.id} value={cls.class_name}>{cls.class_name}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {/* From Date */}
                        <div className="relative min-w-[150px]">
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className={`w-full px-4 py-1.5 rounded-lg text-gray-700 font-bold text-[13px] border focus:ring-2 outline-none transition-all shadow-sm ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-900' : 'bg-white border-gray-200 focus:ring-blue-100'}`}
                            />
                        </div>
                        <div className="relative min-w-[150px]">
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className={`w-full px-4 py-1.5 rounded-lg text-gray-700 font-bold text-[13px] border focus:ring-2 outline-none transition-all shadow-sm ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-900' : 'bg-white border-gray-200 focus:ring-blue-100'}`}
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative group min-w-[150px]">
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className={`w-full pl-4 pr-10 py-1.5 rounded-lg text-gray-700 font-bold text-[13px] border focus:ring-2 outline-none appearance-none transition-all shadow-sm cursor-pointer ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-900' : 'bg-white border-gray-200 focus:ring-blue-100'}`}
                            >
                                <option value="">All Statuses</option>
                                <option value="Present">Present</option>
                                <option value="Absent">Absent</option>
                            </select>
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleExportExcel}
                            disabled={!filteredData.length}
                            className={`px-4 py-1.5 rounded-lg border font-bold text-[13px] transition-all disabled:opacity-50 ${isDark ? 'bg-emerald-900/50 border-emerald-800 text-emerald-200 hover:bg-emerald-900/70' : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'}`}
                        >
                            Export Excel
                        </button>
                        <button
                            type="button"
                            onClick={handleExportPdf}
                            disabled={!filteredData.length}
                            className={`px-4 py-1.5 rounded-lg border font-bold text-[13px] transition-all disabled:opacity-50 ${isDark ? 'bg-rose-900/50 border-rose-800 text-rose-200 hover:bg-rose-900/70' : 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100'}`}
                        >
                            Export PDF
                        </button>
                    </div>
                }
            />
        </main>
    );
}
