"use client";

import { useGetAttendanceReportQuery } from "@/redux/api/teacherApi";
import TeacherHeader from "../TeacherHeader";
import { useDarkMode } from "@/context/ThemeContext";
import { useState } from "react";

export default function AttendanceReportPage() {
    const { isDark } = useDarkMode();
    const { data: reportData, isLoading, error } = useGetAttendanceReportQuery();
    const [search, setSearch] = useState("");

    const filteredData = reportData?.filter((record) =>
        record.student_name.toLowerCase().includes(search.toLowerCase()) ||
        record.class_name.toLowerCase().includes(search.toLowerCase()) ||
        (record.course_title && record.course_title.toLowerCase().includes(search.toLowerCase()))
    ) || [];

    return (
        <div className={`min-h-screen ${isDark ? 'bg-[#03081d] text-white' : 'bg-gray-50 text-gray-900'}`}>
            <TeacherHeader />
            <div className="p-6">
                <h2 className="text-2xl font-semibold mb-6">Attendance Report</h2>

                {/* Search */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search by student, class, or course..."
                        className={`w-full max-w-md px-4 py-2 rounded-lg border ${isDark ? 'bg-[#06102b] border-[#07203c] text-white' : 'bg-white border-gray-300'
                            }`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
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
                                    <th className="px-6 py-3 text-xs font-semibold uppercase">Course</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase">Hour 1</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase">Hour 2</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDark ? 'divide-[#07203c]' : 'divide-gray-200'}`}>
                                {isLoading && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center">Loading report...</td>
                                    </tr>
                                )}
                                {error && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center text-red-500">Failed to load report.</td>
                                    </tr>
                                )}
                                {!isLoading && !error && filteredData.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center">No attendance records found.</td>
                                    </tr>
                                )}
                                {filteredData.map((record) => (
                                    <tr key={record.id} className={`${isDark ? 'hover:bg-[#0d1a2e]' : 'hover:bg-gray-50'}`}>
                                        <td className="px-6 py-4">{new Date(record.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-medium">{record.student_name}</td>
                                        <td className="px-6 py-4">{record.class_name}</td>
                                        <td className="px-6 py-4">{record.course_title || '-'}</td>
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
