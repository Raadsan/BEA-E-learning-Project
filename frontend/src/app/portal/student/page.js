"use client";

import { useDarkMode } from "@/context/ThemeContext";
import Link from "next/link";

export default function StudentDashboard() {
  const { isDark } = useDarkMode();

  // Mock data - replace with API calls later
  const stats = {
    coursesCompleted: 3,
    certificatesEarned: 2,
    hoursLearned: 18.5,
    streakDays: 3,
  };

  const attendanceData = [
    { week: "W1", value: 60 },
    { week: "W2", value: 70 },
    { week: "W3", value: 80 },
    { week: "W4", value: 65 },
  ];

  const leaderboardData = [
    { rank: 1, username: "Username 1", daysActive: 15, points: 1520 },
    { rank: 2, username: "Username 2", daysActive: 14, points: 1450 },
    { rank: 3, username: "Username 3", daysActive: 13, points: 1380 },
    { rank: 4, username: "Username 4", daysActive: 12, points: 1320 },
    { rank: 5, username: "Username 5", daysActive: 11, points: 1250 },
  ];

  const maxAttendance = Math.max(...attendanceData.map(d => d.value));

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="p-6">
      <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Ready to keep learning Banner */}
              <div className={`rounded-xl p-8 ${isDark ? 'bg-[#010080]' : 'bg-[#010080]'} text-white relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 right-4 w-16 h-16 bg-white rounded-lg"></div>
                  <div className="absolute top-20 right-20 w-12 h-12 bg-white rounded-full"></div>
                  <div className="absolute bottom-8 left-8 w-20 h-20 bg-white rounded-lg"></div>
                  <div className="absolute bottom-20 left-24 w-14 h-14 bg-white rounded-full"></div>
                  <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white rounded-lg"></div>
                </div>
                <div className="relative z-10">
                  <h2 className="text-3xl font-bold mb-3">Ready to keep learning?</h2>
                  <p className="text-blue-100 mb-6 max-w-2xl">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.
                  </p>
                  <div className="flex gap-4">
                    <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors">
                      Resume Last Course
                    </button>
                    <button className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors">
                      Explore New Courses
                    </button>
                  </div>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Courses Completed */}
                <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Courses Completed
                    </span>
                  </div>
                  <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stats.coursesCompleted}
                  </p>
                </div>

                {/* Certificates Earned */}
                <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Certificates Earned
                    </span>
                  </div>
                  <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stats.certificatesEarned}
                  </p>
                </div>

                {/* Hours Learned */}
                <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Hours Learned
                    </span>
                  </div>
                  <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stats.hoursLearned}
                  </p>
                </div>

                {/* Streak */}
                <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Streak (Days)
                    </span>
                  </div>
                  <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stats.streakDays}
                  </p>
                </div>
              </div>

              {/* Continue Learning Section */}
              <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Continue Learning
                  </h3>
                  <Link 
                    href="/portal/student/my-courses"
                    className={`text-sm font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
                  >
                    See All
                  </Link>
                </div>
                <div className="flex gap-4">
                  <div className="w-32 h-24 bg-blue-100 rounded-lg flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded">
                        LABEL
                      </span>
                    </div>
                    <h4 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Learning Course Name
                    </h4>
                    <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Next Module: Functions & Modules
                    </p>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                      Resume Course
                    </button>
                  </div>
                </div>
              </div>

              {/* For You Section */}
              <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    For You
                  </h3>
                  <Link 
                    href="/portal/student/browse-courses"
                    className={`text-sm font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
                  >
                    See All
                  </Link>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  No courses available at the moment.
                </p>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Attendance Chart */}
              <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Your Week Attendance
                </h3>
                <div className="space-y-3">
                  {attendanceData.map((item, index) => (
                    <div key={item.week} className="flex items-center gap-3">
                      <span className={`text-sm font-medium w-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.week}
                      </span>
                      <div className="flex-1 relative">
                        <div className={`h-6 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div
                            className={`h-full rounded ${
                              index === 2 ? 'bg-blue-600' : isDark ? 'bg-gray-600' : 'bg-gray-300'
                            }`}
                            style={{ width: `${(item.value / maxAttendance) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className={`text-xs font-medium w-12 text-right ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leaderboard */}
              <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Leaderboard
                  </h3>
                  <Link 
                    href="/portal/student/leaderboard"
                    className={`text-sm font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
                  >
                    See All
                  </Link>
                </div>
                <div className="space-y-3">
                  {leaderboardData.map((user) => (
                    <div key={user.rank} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-gray-700">{user.rank}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {user.username}
                        </p>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
                          </svg>
                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {user.daysActive} days
                          </span>
                        </div>
                      </div>
                      <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {user.points.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
