"use client";

import TeacherHeader from "./TeacherHeader";
import React from 'react';
import { useGetClassesQuery } from "@/redux/api/classApi";
import { useGetStudentsQuery } from "@/redux/api/studentApi";
import { useGetCoursesQuery } from "@/redux/api/courseApi";
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

export default function TeacherDashboard() {
  const { isDark } = useDarkMode();

  // Fetch data from APIs
  const { data: classesData, isLoading: classesLoading } = useGetClassesQuery();
  const { data: studentsData, isLoading: studentsLoading } = useGetStudentsQuery();
  const { data: coursesData, isLoading: coursesLoading } = useGetCoursesQuery();

  // Extract counts
  const classes = Array.isArray(classesData) ? classesData : [];
  const totalClasses = classes.length;

  const studentsArray = studentsData?.students || (Array.isArray(studentsData) ? studentsData : []);
  const totalStudents = studentsArray.length;
  const activeStudents = studentsArray.filter(
    (student) => student.status === "Active" || !student.status
  ).length;

  const courses = Array.isArray(coursesData) ? coursesData : [];
  const totalCourses = courses.length;

  // Mock data for charts (replace with real data later)
  const weeklyAttendance = [
    { day: "Sun", thisWeek: 280, lastWeek: 220 },
    { day: "Mon", thisWeek: 400, lastWeek: 120 },
    { day: "Tue", thisWeek: 320, lastWeek: 120 },
    { day: "Wed", thisWeek: 220, lastWeek: 180 },
    { day: "Thur", thisWeek: 380, lastWeek: 60 },
    { day: "Fri", thisWeek: 300, lastWeek: 160 },
    { day: "Sat", thisWeek: 100, lastWeek: 40 },
  ];

  const maxAttendance = Math.max(...weeklyAttendance.map(d => Math.max(d.thisWeek, d.lastWeek)));

  const courseCompletion = [
    { course: "Course A", percentage: 40, change: 5.88 },
    { course: "Course B", percentage: 25, change: -1.25 },
    { course: "Course C", percentage: 20, change: 0.23 },
    { course: "Course D", percentage: 15, change: -2.5 },
  ];

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

            {/* 3. Avg. Attendance Card (Replaced Total Courses) */}
            <div className={`rounded-xl shadow-md p-4 transition-colors hover:shadow-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border text-gray-100'}`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Avg. Attendance</p>
                  <p className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    92%
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
                  <ProgressCircle percent={92} size={80} strokeWidth={8} colors={['#10b981']} isDark={isDark} />
                </div>
              </div>
            </div>

            {/* 4. Assignments Card (New) */}
            <div className={`rounded-xl shadow-md p-4 transition-colors hover:shadow-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border text-gray-100'}`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Assignments</p>
                  <p className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    12
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
                  <ProgressCircle percent={65} size={80} strokeWidth={8} colors={['#8b5cf6']} isDark={isDark} />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Attendance Bar Chart */}
            <div className={`rounded-xl shadow-md p-6 border transition-colors ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
              <h2 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-800'
                }`}>
                Statistics Weekly Attendance
              </h2>

              {/* Legend */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>This Week</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Last Week</span>
                </div>
              </div>

              {/* Chart */}
              <div className="relative h-64 pl-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg pt-4">
                <div className="absolute inset-0 flex items-end justify-between gap-2 px-2 pb-2">
                  {weeklyAttendance.map((data, index) => {
                    const thisWeekHeight = (data.thisWeek / maxAttendance) * 100;
                    const lastWeekHeight = (data.lastWeek / maxAttendance) * 100;
                    const isHighlighted = data.day === "Mon";

                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-1 group">
                        <div className="relative w-full h-full flex items-end justify-center gap-1">
                          {/* Last Week Bar (left) */}
                          <div className="w-2 md:w-4 bg-red-400 rounded-t transition-all hover:opacity-90" style={{ height: `${lastWeekHeight}%` }} title={`Last Week: ${data.lastWeek}`} />
                          {/* This Week Bar (right) */}
                          <div className={`w-2 md:w-4 bg-blue-500 rounded-t transition-all hover:opacity-90 ${isHighlighted ? 'ring-2 ring-blue-300' : ''}`} style={{ height: `${thisWeekHeight}%` }} title={`This Week: ${data.thisWeek}`} />
                        </div>
                        <span className={`text-xs font-medium mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                          {data.day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Course Completion Rate Pie Chart */}
            <div className={`rounded-xl shadow-md p-6 border transition-colors ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'
                  }`}>
                  Statistics Course Completion Rate
                </h2>
                <select className={`px-3 py-1 border rounded-lg text-sm transition-colors ${isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                  }`}>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
                {/* Pie Chart Placeholder */}
                <div className="relative w-48 h-48 flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    {courseCompletion.map((course, index) => {
                      const total = courseCompletion.reduce((sum, c) => sum + c.percentage, 0);
                      const startAngle = courseCompletion.slice(0, index).reduce((sum, c) => sum + (c.percentage / total) * 360, 0);
                      const angle = (course.percentage / total) * 360;
                      const largeArcFlag = angle > 180 ? 1 : 0;

                      const x1 = 50 + 50 * Math.cos((startAngle * Math.PI) / 180);
                      const y1 = 50 + 50 * Math.sin((startAngle * Math.PI) / 180);
                      const x2 = 50 + 50 * Math.cos(((startAngle + angle) * Math.PI) / 180);
                      const y2 = 50 + 50 * Math.sin(((startAngle + angle) * Math.PI) / 180);

                      return (
                        <path
                          key={index}
                          d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                          fill={index % 2 === 0 ? '#3b82f6' : '#ef4444'}
                          className="transition-opacity hover:opacity-80"
                        />
                      );
                    })}
                  </svg>
                </div>

                {/* Data List */}
                <div className="flex-1 space-y-3 w-full">
                  {courseCompletion.map((course, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: index % 2 === 0 ? '#3b82f6' : '#ef4444' }}
                        ></div>
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                          {course.course}:
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                          {course.percentage}%
                        </span>
                        <span className={`text-xs ${course.change >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                          }`}>
                          ({course.change >= 0 ? '+' : ''}{course.change.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
