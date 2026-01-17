"use client";

import React, { useState } from "react";

import { useGetStudentProgressQuery } from "@/redux/api/studentApi";
import { useDarkMode } from "@/context/ThemeContext";
import DataTable from "@/components/DataTable";

export default function StudentProgressPage() {
    const { isDark } = useDarkMode();
    const [selectedStudent, setSelectedStudent] = useState(null);

    const { data: students, isLoading, error } = useGetStudentProgressQuery();

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
            render: (row) => (
                <div className="font-medium">{row.full_name}</div>
            ),
        },
        {
            key: "email",
            label: "Email / ID",
            render: (row) => (
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{row.email}</div>
            ),
        },
        {
            key: "class_name",
            label: "Class",
            render: (row) => (
                <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{row.class_name || 'Not Assigned'}</div>
            ),
        },
        {
            key: "progress_percentage",
            label: "Progress",
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-[100px]">
                        <div
                            className={`h-2 rounded-full ${row.progress_percentage >= 75 ? 'bg-green-500' : row.progress_percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                            style={{ width: `${Math.min(row.progress_percentage || 0, 100)}%` }}
                        />
                    </div>
                    <span className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {row.progress_percentage || 0}%
                    </span>
                </div>
            ),
        },
        {
            key: "status",
            label: "Status",
            render: (row) => getStatusBadge(row.status),
        },
        {
            key: "last_active",
            label: "Last Active",
            render: (row) => (
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {row.last_active ? new Date(row.last_active).toLocaleDateString() : 'Never'}
                </div>
            ),
        },
    ];

    if (isLoading) {
        return (
            <>
                <div className="flex justify-center items-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors min-h-screen">
                    <div className="w-full px-8 py-6">
                        <div className={`rounded-xl shadow-md p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                            <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Student Progress</h2>
                            <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                                {error?.data?.error || "Failed to load student data"}
                            </p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Detail View
    if (selectedStudent) {
        return (
            <>
                <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors min-h-screen">
                    <div className="w-full px-8 py-6">
                        {/* Back Button */}
                        <button
                            onClick={() => setSelectedStudent(null)}
                            className={`mb-6 flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isDark
                                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Student List
                        </button>

                        {/* Student Details */}
                        <div className={`rounded-xl shadow-md p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                        {selectedStudent.full_name}
                                    </h1>
                                    <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {selectedStudent.email}
                                    </p>
                                </div>
                                {getStatusBadge(selectedStudent.status)}
                            </div>

                            {/* Progress Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Overall Progress</div>
                                    <div className={`text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                        {selectedStudent.progress_percentage}%
                                    </div>
                                </div>
                                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Class</div>
                                    <div className={`text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                        {selectedStudent.class_name || 'Not Assigned'}
                                    </div>
                                </div>
                                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Last Active</div>
                                    <div className={`text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                        {selectedStudent.last_active ? new Date(selectedStudent.last_active).toLocaleDateString() : 'Never'}
                                    </div>
                                </div>
                            </div>

                            {/* Additional Details */}
                            <div className="space-y-4">
                                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                    Student Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Phone</div>
                                        <div className={`mt-1 ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
                                            {selectedStudent.phone || 'Not provided'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Program</div>
                                        <div className={`mt-1 ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
                                            {selectedStudent.chosen_program || 'Not selected'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Hours Attended</div>
                                        <div className={`mt-1 ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
                                            {selectedStudent.total_attended} / {selectedStudent.total_possible}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // List View
    return (
        <>
            <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors min-h-screen">
                <div className="w-full px-8 py-6">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Student Progress</h1>
                        <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Track student attendance and progress
                        </p>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className={`rounded-xl shadow-md p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Students</div>
                            <div className={`text-3xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                {students?.length || 0}
                            </div>
                        </div>
                        <div className={`rounded-xl shadow-md p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>On Track</div>
                            <div className="text-3xl font-bold mt-2 text-green-500">
                                {students?.filter(s => s.status === 'On Track').length || 0}
                            </div>
                        </div>
                        <div className={`rounded-xl shadow-md p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>At Risk</div>
                            <div className="text-3xl font-bold mt-2 text-yellow-500">
                                {students?.filter(s => s.status === 'At Risk').length || 0}
                            </div>
                        </div>
                    </div>

                    {/* Student Table */}
                    <DataTable
                        columns={columns}
                        data={students || []}
                        title="All Students"
                        onRowClick={(student) => setSelectedStudent(student)}
                        getRowId={(student) => student.id}
                    />
                </div>
            </div>
        </>
    );
}
