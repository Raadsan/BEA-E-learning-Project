"use client";

import UpcomingEventsList from "@/components/UpcomingEventsList";
import WeeklyAttendanceChart from "@/components/WeeklyAttendanceChart";
import PerformanceClustersChart from "@/components/PerformanceClustersChart";
import AssignmentCompletionChart from "@/components/AssignmentCompletionChart";
import React, { useState } from 'react';
import { useGetTeacherDashboardStatsQuery, useGetTeacherClassesQuery, useGetTeacherProgramsQuery } from "@/lib/api/teacherApi";
import { useGetStudentsQuery } from "@/lib/api/studentApi";
import DataTable from "@/components/DataTable";

export default function TeacherDashboard() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { data: stats, isLoading: statsLoading } = useGetTeacherDashboardStatsQuery({ month: selectedMonth, year: selectedYear });
  const { data: classes = [], isLoading: classesLoading } = useGetTeacherClassesQuery();
  const { data: programs = [] } = useGetTeacherProgramsQuery();
  const { data: studentsData } = useGetStudentsQuery();
  const students = Array.isArray(studentsData) ? studentsData : (studentsData?.students || []);

  const totalClasses = stats?.totalClasses ?? 0;
  const totalStudents = stats?.totalStudents ?? 0;
  const activeStudents = stats?.activeStudents ?? 0;
  const totalPrograms = stats?.totalPrograms ?? 0;

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const classColumns = [
    {
      key: "id", label: "Class ID",
      render: (val) => <span className="font-mono text-xs text-gray-400">#{val}</span>
    },
    {
      key: "class_name", label: "Class Name",
      render: (val) => <span className="font-semibold text-gray-800">{val || 'N/A'}</span>
    },
    {
      key: "subprogram_name", label: "Subprogram",
      render: (val, row) => {
        const name = row?.subprograms?.subprogram_name || val || 'N/A';
        return <span className="text-[#010080] font-medium text-sm">{name}</span>;
      }
    },
    {
      key: "students_count", label: "Students",
      render: (val, row) => {
        const count = row?._count?.students ?? '-';
        return (
          <span className="inline-flex items-center gap-1 font-bold text-gray-800">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {count}
          </span>
        );
      }
    },
    {
      key: "created_at", label: "Created",
      render: (val) => val ? new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'
    },
    {
      key: "status", label: "Status",
      render: () => (
        <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-700">
          Active
        </span>
      )
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="w-full px-8 py-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              Welcome back, {statsLoading ? '...' : (stats?.fullName || 'Teacher')}! 👋
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Real-time class analytics and performance tracking</p>
          </div>
          {/* Month / Year filter */}
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
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-600" />
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

        {/* Summary Cards — same design as admin */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          {/* Total Students */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-transform hover:-translate-y-1 duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Total Students</p>
                <h3 className="text-5xl font-black text-gray-900 dark:text-white mb-2">
                  {statsLoading ? '...' : totalStudents}
                </h3>
                <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>Enrolled</span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Active Students */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-transform hover:-translate-y-1 duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Active Students</p>
                <h3 className="text-5xl font-black text-gray-900 dark:text-white mb-2">
                  {statsLoading ? '...' : activeStudents}
                </h3>
                <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>In class</span>
                </div>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Programs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-transform hover:-translate-y-1 duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Total Programs</p>
                <h3 className="text-5xl font-black text-gray-900 dark:text-white mb-2">
                  {statsLoading ? '...' : totalPrograms}
                </h3>
                <div className="flex items-center gap-1 text-sm font-medium text-purple-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>Assigned</span>
                </div>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Classes */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-transform hover:-translate-y-1 duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Total Classes</p>
                <h3 className="text-5xl font-black text-gray-900 dark:text-white mb-2">
                  {statsLoading ? '...' : totalClasses}
                </h3>
                <div className="flex items-center gap-1 text-sm font-medium text-red-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Schedule</span>
                </div>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 — Attendance + Performance Clusters (same components as admin) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <WeeklyAttendanceChart programs={programs} classes={classes} />
          <PerformanceClustersChart programs={programs} classes={classes} />
        </div>

        {/* Charts Row 2 — Assignment Completion + Upcoming Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <AssignmentCompletionChart programs={programs} classes={classes} students={students} />
          <UpcomingEventsList />
        </div>

        {/* My Classes Table */}
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

      </div>
    </div>
  );
}
