"use client";

import { useGetAttendanceReportQuery, useGetTeacherClassesQuery } from "@/redux/api/teacherApi";
import TeacherHeader from "../TeacherHeader";
import { useDarkMode } from "@/context/ThemeContext";
import { useState } from "react";

export default function AttendanceReportPage() {
    const { isDark } = useDarkMode();
    const { data: reportData, isLoading, error } = useGetAttendanceReportQuery();
    const { data: classesData } = useGetTeacherClassesQuery();

    const [search, setSearch] = useState("");
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");

    const filteredData = reportData?.filter((record) => {
        const matchesSearch =
            record.student_name.toLowerCase().includes(search.toLowerCase()) ||
            record.class_name.toLowerCase().includes(search.toLowerCase());

        const matchesClass = selectedClass ? record.class_name === selectedClass : true;

        // Date comparison (record.date is ISO string, selectedDate is YYYY-MM-DD from input)
        const recordDate = new Date(record.date).toISOString().split('T')[0];
        const matchesDate = selectedDate ? recordDate === selectedDate : true;

        const matchesStatus = selectedStatus
            ? (selectedStatus === 'Present' ? (record.hour1 || record.hour2) : (!record.hour1 && !record.hour2))
            : true;

        return matchesSearch && matchesClass && matchesDate && matchesStatus;
    }) || [];

    return (
        <div className={`min-h-screen transition-colors ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
            <TeacherHeader />
            <div className="w-full px-8 py-6 pt-24">
                <h1 className="text-3xl font-bold mb-8">Attendance Report</h1>

                {/* Filters Row */}
                <div className="flex flex-col md:flex-row gap-4 mb-6 items-end">
                    {/* Search */}
                    <div className="w-full md:w-1/4">
                        <label className="block text-sm font-medium mb-1">Search</label>
                        <input
                            type="text"
                            placeholder="Student or Class..."
                            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-[#06102b] border-[#07203c] text-white' : 'bg-white border-gray-300'}`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Class Filter */}
                    <div className="w-full md:w-1/4">
                        <label className="block text-sm font-medium mb-1">Class</label>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-[#06102b] border-[#07203c] text-white' : 'bg-white border-gray-300'}`}
                        >
                            <option value="">-- Select Class --</option>
                            {classesData?.map((cls) => (
                                <option key={cls.id} value={cls.class_name}>{cls.class_name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date Filter */}
                    <div className="w-full md:w-1/4">
                        <label className="block text-sm font-medium mb-1">Date</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-[#06102b] border-[#07203c] text-white' : 'bg-white border-gray-300'}`}
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="w-full md:w-1/4">
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-[#06102b] border-[#07203c] text-white' : 'bg-white border-gray-300'}`}
                        >
                            <option value="">-- All Status --</option>
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className={`rounded-xl shadow-lg overflow-hidden ${isDark ? 'bg-[#06102b] border border-[#07203c]' : 'bg-white border border-gray-200'}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className={`${isDark ? 'bg-[#07203c]' : 'bg-[#010080]'} text-white`}>
                                <tr>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase">Date</th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase">Student</th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase">Class</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase">Hour 1</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase">Hour 2</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDark ? 'divide-[#07203c]' : 'divide-gray-200'}`}>
                                {isLoading && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center">Loading report...</td>
                                    </tr>
                                )}
                                {error && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-red-500">Failed to load report.</td>
                                    </tr>
                                )}
                                {!isLoading && !error && filteredData.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center">No attendance records found.</td>
                                    </tr>
                                )}
                                {filteredData.map((record) => (
                                    <tr key={record.id} className={`${isDark ? 'hover:bg-[#0d1a2e]' : 'hover:bg-gray-50'}`}>
                                        <td className="px-6 py-4">{new Date(record.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-medium">{record.student_name}</td>
                                        <td className="px-6 py-4">{record.class_name}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded text-xs ${record.hour1
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {record.hour1 ? 'Present' : 'Absent'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded text-xs ${record.hour2
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {record.hour2 ? 'Present' : 'Absent'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
