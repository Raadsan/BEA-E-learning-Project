"use client";

import TeacherHeader from "./TeacherHeader";
import React from 'react';
import { useGetClassesQuery } from "@/redux/api/classApi";
import { useGetStudentsQuery } from "@/redux/api/studentApi";
import { useGetTeacherDashboardStatsQuery } from "@/redux/api/teacherApi";

import { useDarkMode } from "@/context/ThemeContext";

// Small inline Circular Progress component (declared above default export)
function ProgressCircle({ percent = 0, size = 56, strokeWidth = 6, colors = ['#3b82f6'], isDark = false }) {
  const radius = 50 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - Math.min(Math.max(percent, 0), 100) / 100);
  const trackColor = isDark ? '#2d3748' : '#e5e7eb';
  const color = colors[0] || '#3b82f6';

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="transform rotate-0">
      <circle cx="50" cy="50" r={radius} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
      <circle
        cx="50"
        cy="50"
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={dashOffset}
        transform="rotate(-90 50 50)"
      />
      <text x="50" y="50" dominantBaseline="central" textAnchor="middle" className={`text-xs ${isDark ? 'text-gray-100' : 'text-gray-800'}`} style={{ fontSize: 13, fontWeight: 600 }}>
        {percent}%
      </text>
    </svg>
  );
}

// SVG Pie Chart Component
function PieChart({ data, size = 200, isDark = false }) {
  // data: [{ label, value, color }]
  const total = data.reduce((acc, cur) => acc + cur.value, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No data</p>
      </div>
    );
  }

  let cumulativePercent = 0;

  function getCoordinatesForPercent(percent) {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  }

  return (
    <svg viewBox="-1 -1 2 2" width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      {data.map((slice, index) => {
        if (slice.value === 0) return null;

        const percent = slice.value / total;
        const start = getCoordinatesForPercent(cumulativePercent);
        cumulativePercent += percent;
        const end = getCoordinatesForPercent(cumulativePercent);

        // Large arc flag: determine if the slice is > 50%
        const largeArcFlag = percent > 0.5 ? 1 : 0;

        const pathData = [
          `M 0 0`,
          `L ${start[0]} ${start[1]}`,
          `A 1 1 0 ${largeArcFlag} 1 ${end[0]} ${end[1]}`,
          `Z`
        ].join(' ');

        return (
          <path key={index} d={pathData} fill={slice.color} />
        );
      })}
    </svg>
  );
}

export default function TeacherDashboard() {
  const { isDark } = useDarkMode();

  const { data: stats, isLoading: statsLoading } = useGetTeacherDashboardStatsQuery();
  const { data: classesData, isLoading: classesLoading } = useGetClassesQuery();
  const { data: studentsData, isLoading: studentsLoading } = useGetStudentsQuery();

  // Stats from backend
  const totalAttended = stats?.totalAttended || 0;
  const totalPossible = stats?.totalPossible || 0;
  const absentCount = Math.max(0, totalPossible - totalAttended);
  const hasAttendanceData = totalPossible > 0;

  // Attendance Pie Data
  const attendancePieData = [
    { label: "Present", value: totalAttended, color: "#10b981" },
    { label: "Absent", value: absentCount, color: "#ef4444" }
  ];

  // Classes Distribution Pie Data
  const classAttendanceData = stats?.classAttendanceData || [];
  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];
  const classesPieData = classAttendanceData.map((cls, idx) => ({
    label: cls.className,
    value: cls.attended,
    color: colors[idx % colors.length]
  }));


  // Extract counts
  const classes = Array.isArray(classesData) ? classesData : [];
  const totalClasses = classes.length;

  const studentsArray = studentsData?.students || (Array.isArray(studentsData) ? studentsData : []);
  const totalStudents = studentsArray.length;
  const activeStudents = studentsArray.filter(
    (student) => student.status === "Active" || !student.status
  ).length;

  const weeklyAttendance = stats?.weeklyAttendance || [
    { day: "Sun", thisWeek: 0, lastWeek: 0 },
    { day: "Mon", thisWeek: 0, lastWeek: 0 },
    { day: "Tue", thisWeek: 0, lastWeek: 0 },
    { day: "Wed", thisWeek: 0, lastWeek: 0 },
    { day: "Thur", thisWeek: 0, lastWeek: 0 },
    { day: "Fri", thisWeek: 0, lastWeek: 0 },
    { day: "Sat", thisWeek: 0, lastWeek: 0 },
  ];

  const maxAttendance = Math.max(...weeklyAttendance.map(d => Math.max(d.thisWeek, d.lastWeek, 1)));



  return (
    <>
      <TeacherHeader />

      {/* Dashboard Content */}
      <main className="flex-1 overflow-y-auto mt-6 bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="w-full px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Dashboard Overview</h1>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 max-w-full">
            {/* 1. Total Classes Card */}
            <div className={`rounded-xl shadow-md p-4 transition-colors hover:shadow-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border text-gray-100'}`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Total Classes</p>
                  <p className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {classesLoading ? '...' : totalClasses}
                  </p>
                  <div className="mt-2 text-sm flex items-center gap-2">
                    <span className="text-green-600 text-sm flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      +6.3% last month
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <ProgressCircle percent={32} size={80} strokeWidth={8} colors={['#3b82f6']} isDark={isDark} />
                </div>
              </div>
            </div>

            {/* 2. Active Students Card */}
            <div className={`rounded-xl shadow-md p-4 transition-colors hover:shadow-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border text-gray-100'}`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Active Students</p>
                  <p className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {studentsLoading ? '...' : activeStudents}
                  </p>
                  <div className="mt-2 text-sm flex items-center gap-2">
                    <span className="text-red-600 text-sm flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                      </svg>
                      -18.45%
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <ProgressCircle percent={totalStudents ? Math.round((activeStudents / totalStudents) * 100) : 48} size={80} strokeWidth={8} colors={['#f95150']} isDark={isDark} />
                </div>
              </div>
            </div>

            {/* 3. Avg. Attendance Card */}
            <div className={`rounded-xl shadow-md p-4 transition-colors hover:shadow-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border text-gray-100'}`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Avg. Attendance</p>
                  <p className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stats?.avgAttendance || 0}%
                  </p>
                  <div className="mt-2 text-sm flex items-center gap-2">
                    <span className="text-green-600 text-sm flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      +2.4% last month
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <ProgressCircle percent={stats?.avgAttendance || 0} size={80} strokeWidth={8} colors={['#10b981']} isDark={isDark} />
                </div>
              </div>
            </div>

            {/* 4. Assignments Card */}
            <div className={`rounded-xl shadow-md p-4 transition-colors hover:shadow-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border text-gray-100'}`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Assignments</p>
                  <p className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stats?.assignmentsCount || 0}
                  </p>
                  <div className="mt-2 text-sm flex items-center gap-2">
                    <span className="text-blue-600 text-sm flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      2 New
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <ProgressCircle percent={0} size={80} strokeWidth={8} colors={['#8b5cf6']} isDark={isDark} />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section - 3 Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">

            {/* Weekly Attendance Bar Chart */}
            <div className={`rounded-xl shadow-md p-6 border transition-colors ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <h2 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>Weekly Attendance (Hours)</h2>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>This Week</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Last Week</span>
                </div>
              </div>

              <div className="relative h-64 pl-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg pt-4">
                <div className="absolute inset-0 flex items-end justify-between gap-2 px-2 pb-2">
                  {weeklyAttendance.map((data, index) => {
                    const thisWeekHeight = (data.thisWeek / maxAttendance) * 100;
                    const lastWeekHeight = (data.lastWeek / maxAttendance) * 100;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-1 group">
                        <div className="relative w-full h-full flex items-end justify-center gap-1">
                          <div className="w-2 md:w-4 bg-red-400 rounded-t hover:opacity-90" style={{ height: `${lastWeekHeight}%` }} title={`Last Week: ${data.lastWeek}`} />
                          <div className="w-2 md:w-4 bg-blue-500 rounded-t hover:opacity-90" style={{ height: `${thisWeekHeight}%` }} title={`This Week: ${data.thisWeek}`} />
                        </div>
                        <span className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{data.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Overall Attendance Pie Chart */}
            <div className={`rounded-xl shadow-md p-6 border transition-colors ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <h2 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>Overall Attendance</h2>

              <div className="flex flex-col items-center justify-center h-64">
                {hasAttendanceData ? (
                  <div className="relative">
                    <PieChart data={attendancePieData} size={180} isDark={isDark} />
                  </div>
                ) : (
                  <div className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <p>No attendance data available yet.</p>
                  </div>
                )}

                {hasAttendanceData && (
                  <div className="flex items-center gap-6 mt-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Present ({totalAttended})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Absent ({absentCount})</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Classes Distribution Pie Chart */}
            <div className={`rounded-xl shadow-md p-6 border transition-colors ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <h2 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>Classes Attendance</h2>

              <div className="flex flex-col items-center justify-center h-64">
                {classesPieData.length > 0 ? (
                  <div className="relative">
                    <PieChart data={classesPieData} size={180} isDark={isDark} />
                  </div>
                ) : (
                  <div className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <p>No class data available yet.</p>
                  </div>
                )}

                {classesPieData.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-3 mt-6 max-w-full">
                    {classesPieData.slice(0, 6).map((cls, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cls.color }}></div>
                        <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'} truncate max-w-[80px]`} title={cls.label}>
                          {cls.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  );
}
