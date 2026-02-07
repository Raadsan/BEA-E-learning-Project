"use client";

import UpcomingEventsList from "@/components/UpcomingEventsList";
import React, { useState } from 'react';
import { useGetTeacherDashboardStatsQuery, useGetTeacherClassesQuery } from "@/redux/api/teacherApi";
import { useGetAssignmentStatsQuery, useGetPerformanceClustersQuery } from "@/redux/api/assignmentApi";
import { useDarkMode } from "@/context/ThemeContext";
import DataTable from "@/components/DataTable";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';

const BRAND_COLORS = ['#010080', '#f40606', '#4b47a4', '#f95150', '#18178a', '#8b5cf6'];

export default function TeacherDashboard() {
  const { isDark } = useDarkMode();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Fetch Teacher Stats with month/year
  const { data: stats, isLoading: statsLoading } = useGetTeacherDashboardStatsQuery({ month: selectedMonth, year: selectedYear });
  const { data: classes = [], isLoading: classesLoading } = useGetTeacherClassesQuery();
  const { data: performanceData } = useGetPerformanceClustersQuery();
  const { data: submissionStats } = useGetAssignmentStatsQuery();

  // Extract counts from stats API
  const totalClasses = stats?.totalClasses || 0;
  const totalStudents = stats?.activeStudents || 0;
  const activeStudents = stats?.activeStudents || 0;
  const totalPrograms = stats?.totalPrograms || 0;

  // Weekly Attendance data for Recharts
  const weeklyAttendance = stats?.weeklyAttendance || [];

  const courseCompletion = stats?.classAttendanceData?.map(row => ({
    name: row.className,
    value: row.attended + row.absent > 0 ? Math.round((row.attended / (row.attended + row.absent)) * 100) : 0,
  })) || [{ name: "No Data", value: 100 }];

  const classColumns = [
    { key: "id", label: "Class ID" },
    { key: "class_name", label: "Class Name" },
    { key: "subprogram_name", label: "Subprogram" },
    { key: "created_at", label: "Start Date", render: (val) => val ? new Date(val).toLocaleDateString() : 'N/A' },
    {
      key: "status", label: "Status", render: (val) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${val === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
          {val || 'Active'}
        </span>
      )
    }
  ];

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <main className="flex-1 overflow-y-auto p-4 lg:p-8 py-6 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="w-full">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Welcome back Teacher, {statsLoading ? 'Teacher' : (stats?.fullName || 'Teacher')}! 👋
            </h1>
            <p className="text-sm text-gray-500 mt-1">Real-time class analytics and performance tracking</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1.5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="bg-transparent text-sm font-bold border-none focus:ring-0 outline-none px-2 text-[#010080] dark:text-white cursor-pointer"
              >
                {months.map((m, i) => (
                  <option key={m} value={i + 1} className="dark:bg-gray-800">{m}</option>
                ))}
              </select>
              <div className="w-px h-4 bg-gray-200 dark:bg-gray-600"></div>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="bg-transparent text-sm font-bold border-none focus:ring-0 outline-none px-2 text-[#010080] dark:text-white cursor-pointer"
              >
                {[2024, 2025, 2026].map(y => (
                  <option key={y} value={y} className="dark:bg-gray-800">{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Students Card */}
          <div className={`rounded-xl shadow-md p-6 transition-all hover:shadow-lg hover:-translate-y-1 duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border border-gray-100'}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Students</p>
                <h3 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {statsLoading ? '...' : totalStudents}
                </h3>
                <div className="flex items-center gap-1 text-sm font-medium text-blue-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span>{stats?.studentGrowth || 0}% growth</span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <svg className="w-8 h-8 text-[#010080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Active Students Card */}
          <div className={`rounded-xl shadow-md p-6 transition-all hover:shadow-lg hover:-translate-y-1 duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border border-gray-100'}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Active Students</p>
                <h3 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {statsLoading ? '...' : activeStudents}
                </h3>
                <div className="flex items-center gap-1 text-sm font-medium text-blue-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Enrolled</span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <svg className="w-8 h-8 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Programs Card */}
          <div className={`rounded-xl shadow-md p-6 transition-all hover:shadow-lg hover:-translate-y-1 duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border border-gray-100'}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Programs</p>
                <h3 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {statsLoading ? '...' : totalPrograms}
                </h3>
                <div className="flex items-center gap-1 text-sm font-medium text-indigo-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>Assigned</span>
                </div>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Classes Card */}
          <div className={`rounded-xl shadow-md p-6 transition-all hover:shadow-lg hover:-translate-y-1 duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border border-gray-100'}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Classes</p>
                <h3 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {statsLoading ? '...' : totalClasses}
                </h3>
                <div className="flex items-center gap-1 text-sm font-medium text-[#f40606]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Schedule</span>
                </div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <svg className="w-8 h-8 text-[#f40606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Attendance Bar Chart */}
          <div className={`rounded-xl shadow-md p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <h2 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-[#010080]'}`}>Weekly Attendance Trends</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyAttendance}>
                  <defs>
                    <linearGradient id="colorThis" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#010080" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#010080" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorLast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f40606" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f40606" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f3f4f6'} vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#9ca3af' : '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: isDark ? '#9ca3af' : '#64748b', fontSize: 12 }} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" />
                  <Area type="monotone" dataKey="thisWeek" name="Second Half" stroke="#010080" fillOpacity={1} fill="url(#colorThis)" />
                  <Area type="monotone" dataKey="lastWeek" name="First Half" stroke="#f40606" fillOpacity={1} fill="url(#colorLast)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Competition Pie Chart */}
          <div className={`rounded-xl shadow-md p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <h2 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-[#f40606]'}`}>Class Performance Competition</h2>
            <div className="h-64 flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={courseCompletion}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {courseCompletion.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Performance Clusters Bar Chart */}
          <div className={`rounded-xl shadow-md p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <h2 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-[#4b47a4]'}`}>Student Performance Clusters</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f3f4f6'} vertical={false} />
                  <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#9ca3af' : '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: isDark ? '#9ca3af' : '#64748b', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  <Bar dataKey="count" name="Students" fill="#4b47a4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Submission Activity Area Chart */}
          <div className={`rounded-xl shadow-md p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <h2 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-[#f95150]'}`}>Submission Activity</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={submissionStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f3f4f6'} vertical={false} />
                  <XAxis
                    dataKey="type"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: isDark ? '#9ca3af' : '#64748b', fontSize: 11 }}
                    tickFormatter={(val) => val.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: isDark ? '#9ca3af' : '#64748b', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  <Bar dataKey="completionRate" name="Completion Rate (%)" fill="#f95150" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <DataTable
            title="My Assigned Classes"
            columns={classColumns}
            data={classes}
            isLoading={classesLoading}
            showAddButton={false}
            emptyMessage="No classes assigned yet."
          />
        </div>

        <div className="mt-8">
          <UpcomingEventsList />
        </div>
      </div>
    </main>
  );
}

