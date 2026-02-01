"use client";

import { useState, useMemo } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import {
    useGetStudentStatsQuery,
    useGetProgramDistributionQuery,
    useGetSubprogramDistributionQuery,
    useGetPerformanceOverviewQuery,
    useGetDetailedStudentListQuery,
    useGetAttendanceAnalyticsQuery,
    useGetAssignmentCompletionAnalyticsQuery,
    useGetConsolidatedStatsQuery // New Consolidated Query
} from "@/redux/api/reportApi";
import { useGetTopStudentsQuery } from "@/redux/api/studentApi";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useGetClassesQuery } from "@/redux/api/classApi";
import Link from "next/link";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

export default function StudentReportsPage() {
    const { isDark } = useDarkMode();

    // Filters
    const [selectedProgram, setSelectedProgram] = useState("");
    const [selectedClass, setSelectedClass] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const itemsPerPage = 100;
    const [sortConfig, setSortConfig] = useState({ key: 'registration_date', direction: 'desc' });

    const handleSort = (key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Fetch programs and classes for filters
    const { data: programsData } = useGetProgramsQuery();
    const { data: classesData } = useGetClassesQuery();
    // API returns the array directly, not wrapped in an object
    const programs = Array.isArray(programsData) ? programsData : (programsData?.programs || []);
    const classes = Array.isArray(classesData) ? classesData : (classesData?.classes || []);

    // Fetch aggregation data
    const { data: stats = {}, isLoading: statsLoading } = useGetStudentStatsQuery();
    const { data: programData = [], isLoading: programsLoading } = useGetProgramDistributionQuery();
    const { data: performance = {}, isLoading: perfLoading } = useGetPerformanceOverviewQuery();
    const { data: consolidatedResp, isLoading: consolidatedLoading } = useGetConsolidatedStatsQuery();

    // Handle potential wrapper in consolidated response
    const consolidated = consolidatedResp?.data || consolidatedResp || {};

    // Fetch detailed student list with filters
    const { data: detailedStudentsData, isLoading: studentsLoading } = useGetDetailedStudentListQuery({
        program: selectedProgram,
        class_id: selectedClass,
        search: searchTerm,
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
        sort_by: sortConfig.key,
        order: sortConfig.direction
    });

    const students = detailedStudentsData?.students || [];
    const totalStudents = detailedStudentsData?.total || 0;
    const totalPages = Math.ceil(totalStudents / itemsPerPage);

    // Fetch attendance analytics
    const { data: attendanceData } = useGetAttendanceAnalyticsQuery({
        program: selectedProgram,
        class_id: selectedClass,
        date_from: dateFrom,
        date_to: dateTo
    });

    // Fetch assignment completion analytics
    // Fetch assignment completion analytics
    const { data: assignmentData } = useGetAssignmentCompletionAnalyticsQuery({
        program: selectedProgram,
        class_id: selectedClass
    });


    // --- Chart Data Preparation ---


    // 1. Gender Data
    const genderData = consolidated.gender || [];
    const genderColors = { Male: '#3B82F6', Female: '#EC4899', Unknown: '#9CA3AF' };

    // 2. Status Data
    const statusData = consolidated.status || [];
    const statusColors = { Approved: '#10B981', Pending: '#F59E0B', Rejected: '#EF4444', Other: '#6B7280' };

    // 3. Performance Pie Data
    const perfPieData = [
        { name: 'Excellent (80%+)', value: performance.excellent_count || 0, color: '#10B981' },
        { name: 'Below 80%', value: performance.below_80_count || 0, color: '#3B82F6' },
    ];

    // 4. Enrollment Trends
    const enrollmentData = consolidated.enrollment || [];

    const chartTheme = {
        background: 'transparent',
        text: isDark ? '#9CA3AF' : '#4B5563',
        grid: isDark ? '#374151' : '#E5E7EB',
        tooltip: {
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
            border: isDark ? '1px solid #374151' : '1px solid #E5E7EB',
            color: isDark ? '#F3F4F6' : '#111827'
        }
    };

    // Custom Label for Pie Charts
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return percent > 0.05 ? (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12} fontWeight="bold">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        ) : null;
    };

    // Export to CSV function
    const exportToCSV = () => {
        const headers = ['Student ID', 'Name', 'Email', 'Phone', 'Program', 'Subprogram', 'Class', 'Joined Date', 'Attendance Rate', 'Avg Score', 'Status'];
        const rows = students.map(s => [
            s.student_id,
            s.full_name,
            s.email,
            s.phone || 'N/A',
            s.chosen_program || 'N/A',
            s.chosen_subprogram || 'N/A',
            s.class_name || 'N/A',
            s.registration_date ? new Date(s.registration_date).toLocaleDateString() : 'N/A',
            `${s.attendance_rate}%`,
            `${s.overall_average}%`,
            s.approval_status
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `student_report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div className={`flex-1 min-w-0 flex flex-col px-4 sm:px-8 py-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-[1800px] mx-auto w-full space-y-8">
                {/* Header with Actions */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className={`text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Student Reports & Analytics
                        </h1>
                        <p className={`text-base font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Comprehensive student performance, attendance, and engagement analytics
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={exportToCSV}
                            disabled={students.length === 0}
                            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${students.length === 0
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg hover:shadow-xl'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Export CSV
                            </div>
                        </button>
                    </div>
                </div>

                {/* Filters Section */}
                <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
                    <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Filters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <div>
                            <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Search Student
                            </label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Name, email, or ID..."
                                className={`w-full px-4 py-2.5 rounded-lg border font-medium text-sm ${isDark
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                                    }`}
                            />
                        </div>

                        {/* Program Filter */}
                        <div>
                            <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Program
                            </label>
                            <select
                                value={selectedProgram}
                                onChange={(e) => {
                                    setSelectedProgram(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className={`w-full px-4 py-2.5 rounded-lg border font-medium text-sm ${isDark
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-200 text-gray-900'
                                    }`}
                            >
                                <option value="">All Programs</option>
                                {programs.map(p => (
                                    <option key={p.id} value={p.title}>{p.title}</option>
                                ))}
                            </select>
                        </div>

                        {/* Class Filter */}
                        <div>
                            <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Class
                            </label>
                            <select
                                value={selectedClass}
                                onChange={(e) => {
                                    setSelectedClass(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className={`w-full px-4 py-2.5 rounded-lg border font-medium text-sm ${isDark
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-200 text-gray-900'
                                    }`}
                            >
                                <option value="">All Classes</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.class_name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Clear Filters */}
                        <div className="flex items-end">
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setSelectedProgram("");
                                    setSelectedClass("");
                                    setDateFrom("");
                                    setDateTo("");
                                    setCurrentPage(1);
                                }}
                                className={`w-full px-4 py-2.5 rounded-lg font-bold text-sm transition-all ${isDark
                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Enrollment Trends - Line Chart */}
                    <div className={`p-8 rounded-2xl border shadow-sm md:col-span-2 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'}`}>
                        <h3 className={`text-xl font-extrabold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Enrollment Trends (Last 12 Months)
                        </h3>
                        <div className="h-80">
                            {consolidatedLoading ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={enrollmentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
                                        <XAxis
                                            dataKey="month"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: chartTheme.text }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: chartTheme.text }}
                                        />
                                        <Tooltip contentStyle={chartTheme.tooltip} />
                                        <Legend formatter={(value) => <span style={{ color: chartTheme.text }}>{value}</span>} />
                                        <Line
                                            type="monotone"
                                            dataKey="students"
                                            name="New Students"
                                            stroke="#8B5CF6"
                                            strokeWidth={3}
                                            dot={{ fill: '#8B5CF6', r: 4 }}
                                            activeDot={{ r: 8 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Gender Distribution - Pie Chart */}
                    <div className={`p-8 rounded-2xl border shadow-sm ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'}`}>
                        <h3 className={`text-xl font-extrabold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Gender Distribution
                        </h3>
                        <div className="h-80">
                            {consolidatedLoading ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={genderData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            label={renderCustomizedLabel}
                                            labelLine={false}
                                        >
                                            {genderData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={genderColors[entry.name] || '#9CA3AF'} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={chartTheme.tooltip} />
                                        <Legend formatter={(value) => <span style={{ color: chartTheme.text }}>{value}</span>} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Status Distribution - Pie Chart */}
                    <div className={`p-8 rounded-2xl border shadow-sm ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'}`}>
                        <h3 className={`text-xl font-extrabold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Approval Status
                        </h3>
                        <div className="h-80">
                            {consolidatedLoading ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={statusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            label={renderCustomizedLabel}
                                            labelLine={false}
                                        >
                                            {statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={statusColors[entry.name] || '#9CA3AF'} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={chartTheme.tooltip} />
                                        <Legend formatter={(value) => <span style={{ color: chartTheme.text }}>{value}</span>} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Program Distribution - Bar Chart */}
                    <div className={`p-8 rounded-2xl border shadow-sm lg:col-span-2 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'}`}>
                        <h3 className={`text-xl font-extrabold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Program Enrollment
                        </h3>
                        <div className="h-80">
                            {programsLoading ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : programData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={programData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: chartTheme.text, fontSize: 10 }}
                                            interval={0}
                                            angle={-45}
                                            textAnchor="end"
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: chartTheme.text }}
                                        />
                                        <Tooltip
                                            contentStyle={chartTheme.tooltip}
                                            cursor={{ fill: isDark ? '#374151' : '#F3F4F6' }}
                                        />
                                        <Bar dataKey="students" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400">
                                    No enrollment data available
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Detailed Student List */}
                <div className={`p-8 rounded-2xl border shadow-sm ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex flex-col gap-1">
                            <h3 className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Detailed Student List
                            </h3>
                            <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {totalStudents} students found
                            </p>
                        </div>
                    </div>

                    {studentsLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : students.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                            <th
                                                onClick={() => handleSort('full_name')}
                                                className={`text-left py-4 px-4 text-xs font-bold uppercase tracking-wider cursor-pointer group select-none ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    Student
                                                    {sortConfig.key === 'full_name' && (
                                                        <span className="text-blue-500">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                    )}
                                                </div>
                                            </th>
                                            <th className={`text-left py-4 px-4 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Program</th>
                                            <th className={`text-left py-4 px-4 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Class</th>
                                            <th
                                                onClick={() => handleSort('registration_date')}
                                                className={`text-left py-4 px-4 text-xs font-bold uppercase tracking-wider cursor-pointer group select-none ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    Joined
                                                    {sortConfig.key === 'registration_date' && (
                                                        <span className="text-blue-500">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                    )}
                                                </div>
                                            </th>
                                            <th className={`text-center py-4 px-4 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Attendance</th>
                                            <th
                                                onClick={() => handleSort('overall_average')}
                                                className={`text-center py-4 px-4 text-xs font-bold uppercase tracking-wider cursor-pointer group select-none ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                <div className="flex items-center justify-center gap-2">
                                                    Avg Score
                                                    {sortConfig.key === 'overall_average' && (
                                                        <span className="text-blue-500">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                    )}
                                                </div>
                                            </th>
                                            <th
                                                onClick={() => handleSort('approval_status')}
                                                className={`text-center py-4 px-4 text-xs font-bold uppercase tracking-wider cursor-pointer group select-none ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                <div className="flex items-center justify-center gap-2">
                                                    Status
                                                    {sortConfig.key === 'approval_status' && (
                                                        <span className="text-blue-500">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                    )}
                                                </div>
                                            </th>
                                            <th className={`text-center py-4 px-4 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-100'}`}>
                                        {students.map((student) => (
                                            <tr key={student.student_id} className={`hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors`}>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                            {student.full_name?.charAt(0) || 'S'}
                                                        </div>
                                                        <div>
                                                            <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                                {student.full_name}
                                                            </p>
                                                            <p className="text-xs text-gray-500">{student.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        {student.chosen_program || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        {student.class_name || 'Unassigned'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        {student.registration_date ? new Date(student.registration_date).toLocaleDateString() : 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full ${student.attendance_rate >= 80 ? 'bg-emerald-500' :
                                                                    student.attendance_rate >= 60 ? 'bg-amber-500' :
                                                                        'bg-red-500'
                                                                    }`}
                                                                style={{ width: `${student.attendance_rate}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                            {student.attendance_rate}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-center">
                                                    <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-black ${student.overall_average >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                        student.overall_average >= 60 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                        }`}>
                                                        {student.overall_average}%
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-center">
                                                    <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold ${student.approval_status === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                        student.approval_status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                            'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {student.approval_status || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-center">
                                                    <Link
                                                        href={`/portal/admin/reports/students/${student.student_id}`}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        View Report
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalStudents)} of {totalStudents} students
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${currentPage === 1
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-600'
                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                                }`}
                                        >
                                            Previous
                                        </button>
                                        <span className={`px-4 py-2 rounded-lg font-bold text-sm ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}>
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${currentPage === totalPages
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-600'
                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                                }`}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className={`text-lg font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                No students found
                            </p>
                            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                Try adjusting your filters
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
