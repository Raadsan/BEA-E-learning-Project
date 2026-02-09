"use client";

import { useGetAttendanceReportQuery, useGetTeacherClassesQuery } from "@/redux/api/teacherApi";
import { useDarkMode } from "@/context/ThemeContext";
import { useState } from "react";
import DataTable from "@/components/DataTable";

export default function AttendanceReportPage() {
    const { isDark } = useDarkMode();
    const { data: reportData = [], isLoading, error } = useGetAttendanceReportQuery();
    const { data: classesData = [] } = useGetTeacherClassesQuery();

    const [selectedClass, setSelectedClass] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");

    // Filter Logic
    const filteredData = reportData.filter((record) => {
        const matchesClass = selectedClass ? record.class_name === selectedClass : true;

        // Date comparison (record.date is ISO string, selectedDate is YYYY-MM-DD from input)
        const recordDate = new Date(record.date).toISOString().split('T')[0];
        const matchesDate = selectedDate ? recordDate === selectedDate : true;

        const matchesStatus = selectedStatus
            ? (selectedStatus === 'Present' ? (record.hour1 || record.hour2) : (!record.hour1 && !record.hour2))
            : true;

        return matchesClass && matchesDate && matchesStatus;
    });

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

                        {/* Date Filter */}
                        <div className="relative min-w-[150px]">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
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
                    </div>
                }
            />
        </main>
    );
}
