"use client";

import TeacherHeader from "./TeacherHeader";
import UpcomingEventsList from "@/components/UpcomingEventsList";
import React from 'react';
import { useGetTeacherDashboardStatsQuery } from "@/redux/api/teacherApi";
import { useDarkMode } from "@/context/ThemeContext";

// Dashboard Overview for Teachers

export default function TeacherDashboard() {
  const { isDark } = useDarkMode();

  // Fetch Teacher Stats
  const { data: stats, isLoading: statsLoading } = useGetTeacherDashboardStatsQuery();

  // Extract counts from stats API
  const totalClasses = stats?.totalClasses || 0;
  const totalStudents = stats?.activeStudents || 0; // The API returns active students as 'activeStudents'
  const activeStudents = stats?.activeStudents || 0;
  const totalPrograms = stats?.totalPrograms || 0;

  // Real data for charts from stats API
  const weeklyAttendance = stats?.weeklyAttendance || [
    { day: "Sun", thisWeek: 0, lastWeek: 0 },
    { day: "Mon", thisWeek: 0, lastWeek: 0 },
    { day: "Tue", thisWeek: 0, lastWeek: 0 },
    { day: "Wed", thisWeek: 0, lastWeek: 0 },
    { day: "Thur", thisWeek: 0, lastWeek: 0 },
    { day: "Fri", thisWeek: 0, lastWeek: 0 },
    { day: "Sat", thisWeek: 0, lastWeek: 0 },
  ];

  const maxAttendance = Math.max(...weeklyAttendance.map(d => Math.max(d.thisWeek, d.lastWeek)), 100);

  const courseCompletion = stats?.classAttendanceData?.map(row => ({
    course: row.className,
    percentage: row.attended + row.absent > 0 ? Math.round((row.attended / (row.attended + row.absent)) * 100) : 0,
    change: 0 // Backend doesn't provide change yet
  })) || [
      { course: "No Classes", percentage: 0, change: 0 },
    ];

  return (
    <>
      <TeacherHeader />

      {/* Dashboard Content */}
      <main className="flex-1 overflow-y-auto px-8 py-6 pt-24 bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="w-full">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Dashboard Overview</h1>

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
                  <div className={`flex items-center gap-1 text-sm font-medium text-blue-600`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span>{stats?.studentGrowth || 0}% this month</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <div className="flex items-center gap-1 text-sm font-medium text-emerald-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Currently Enrolled</span>
                  </div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <div className={`flex items-center gap-1 text-sm font-medium text-indigo-600`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span>Assigned to Me</span>
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
                  <div className={`flex items-center gap-1 text-sm font-medium text-purple-600`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>My Schedule</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Attendance Bar Chart */}
            <div className={`rounded-xl shadow-md p-6 border transition-colors ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>

              <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'
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
              <div className="relative h-64 pl-6">
                <div className="absolute inset-0 flex items-end justify-between gap-2">
                  {weeklyAttendance.map((data, index) => {
                    const thisWeekHeight = (data.thisWeek / maxAttendance) * 100;
                    const lastWeekHeight = (data.lastWeek / maxAttendance) * 100;
                    const isHighlighted = data.day === "Mon";

                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-1 group">
                        <div className="relative w-full h-full flex items-end justify-center gap-2">
                          <div className="flex items-end justify-between w-full gap-2 px-1">
                            {/* Last Week Bar (left) */}
                            <div className="w-1/2 bg-red-400 rounded-t transition-all hover:opacity-90" style={{ height: `${lastWeekHeight}%` }} title={`Last Week: ${data.lastWeek}`} />
                            {/* This Week Bar (right) */}
                            <div className={`w-1/2 bg-blue-500 rounded-t transition-all hover:opacity-90 ${isHighlighted ? 'ring-2 ring-blue-300' : ''}`} style={{ height: `${thisWeekHeight}%` }} title={`This Week: ${data.thisWeek}`} />
                          </div>
                        </div>
                        {isHighlighted && (
                          <div className={`absolute -top-8 px-2 py-1 rounded text-xs font-medium ${isDark ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
                            }`}>
                            {data.day} {data.thisWeek}
                          </div>
                        )}
                        <span className={`text-xs font-medium mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                          {data.day}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between pr-2 text-right w-8">
                  {[0, 100, 200, 300, 400].map((value) => (
                    <span key={value} className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Course Completion Rate Pie Chart */}
            <div className={`rounded-xl shadow-md p-6 border transition-colors ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>

              <div className="flex items-center justify-between mb-4">
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

              <div className="flex items-center gap-6">
                {/* Pie Chart Placeholder */}
                <div className="relative w-48 h-48">
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
                <div className="flex-1 space-y-3">
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

          {/* Upcoming Events Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <UpcomingEventsList />
          </div>
        </div>
      </main>
    </>
  );
}


