"use client";

import { useState, useEffect } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useGetAttendanceStatsQuery } from "@/redux/api/attendanceApi";
import { useGetLearningHoursSummaryQuery } from "@/redux/api/learningHoursApi";
import { useGetTopStudentsQuery, useGetStudentProgressQuery } from "@/redux/api/studentApi";
import { useGetSubprogramsByProgramIdQuery } from "@/redux/api/subprogramApi";
import Link from "next/link";

export default function StudentDashboard() {
  const { isDark } = useDarkMode();
  const { data: user, isLoading: userLoading } = useGetCurrentUserQuery();
  const [approvalStatus, setApprovalStatus] = useState('pending');

  // Fetch Attendance Stats
  const { data: attendanceStats, isLoading: attendanceLoading } = useGetAttendanceStatsQuery(
    { class_id: user?.class_id, timeFrame: 'Weekly' },
    { skip: !user?.class_id }
  );

  // Fetch Learning Hours Summary
  const { data: learningSummary, isLoading: learningLoading } = useGetLearningHoursSummaryQuery(
    { class_id: user?.class_id },
    { skip: !user?.class_id }
  );

  // Fetch Leaderboard (Top Students)
  const { data: leaderboardData = [], isLoading: leaderboardLoading } = useGetTopStudentsQuery({ limit: 5 });

  // Fetch Student Progress for "Continue Learning"
  const { data: progressData, isLoading: progressLoading } = useGetStudentProgressQuery();

  // Fetch Subprograms to potentially recommend (For You)
  const { data: subprograms = [] } = useGetSubprogramsByProgramIdQuery(
    user?.chosen_program,
    { skip: !user?.chosen_program }
  );

  useEffect(() => {
    if (user && user.approval_status) {
      setApprovalStatus(user.approval_status);
    }
  }, [user]);

  // Map progress data to find active course
  const activeCourse = Array.isArray(progressData)
    ? progressData.find(p => p.student_id === user?.id && p.progress < 100) || progressData[0]
    : null;

  // Process attendance for chart
  const processAttendanceData = () => {
    if (!attendanceStats || !Array.isArray(attendanceStats)) {
      return [
        { week: "W1", value: 0 },
        { week: "W2", value: 0 },
        { week: "W3", value: 0 },
        { week: "W4", value: 0 },
      ];
    }
    // Simple mapping - adapt based on actual API response structure
    return attendanceStats.slice(-4).map((stat, index) => ({
      week: `W${index + 1}`,
      value: stat.percentage || stat.attendance_rate || 0
    }));
  };

  const attendanceData = processAttendanceData();
  const maxAttendance = Math.max(...attendanceData.map(d => d.value), 100);

  const stats = {
    coursesCompleted: user?.completed_courses_count || 0,
    certificatesEarned: user?.certificates_count || 0,
    hoursLearned: learningSummary?.total_hours || 0,
    streakDays: user?.login_streak || 0,
  };

  if (userLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
        <p className="text-xl font-semibold">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="py-6">
        {/* Welcome Message */}
        <div className={`mb-6 p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Welcome, {user?.full_name || 'Student'}!
          </h1>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Dashboard Overview
          </p>
          {approvalStatus !== 'approved' && (
            <div className="mt-4">
              <div
                className={`p-4 rounded-lg flex items-start gap-3 ${approvalStatus === "pending"
                    ? isDark
                      ? "bg-blue-900/30 border border-blue-700"
                      : "bg-blue-50 border border-blue-200"
                    : isDark
                      ? "bg-red-900/30 border border-red-700"
                      : "bg-red-50 border border-red-200"
                  }`}
              >
                <svg
                  className={`w-8 h-8 ${approvalStatus === "pending"
                      ? "text-blue-600"
                      : "text-red-600"
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={
                      approvalStatus === "pending"
                        ? "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        : "M6 18L18 6M6 6l12 12"
                    }
                  />
                </svg>
                <div>
                  <h2
                    className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-900"
                      }`}
                  >
                    {approvalStatus === "pending"
                      ? "Your registration is pending approval"
                      : "Account access is restricted"}
                  </h2>
                  <p
                    className={`text-sm mt-1 ${isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                  >
                    {approvalStatus === "pending"
                      ? "Thank you for registering! Your account is under review by our administrators. You will be notified once it has been approved and full features are unlocked."
                      : "Your registration has been reviewed. Please contact the administration team for more information about your account status."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

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
                  Master your skills with BEA E-learning. Your progress is saved and waiting for you to continue your journey.
                </p>
                <div className="flex gap-4">
                  <Link href="/portal/student/my-courses" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors">
                    Resume Last Course
                  </Link>
                  <Link href="/portal/student/browse-courses" className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors">
                    Explore New Courses
                  </Link>
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
                  {learningLoading ? "..." : stats.hoursLearned}h
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
              {activeCourse ? (
                <div className="flex gap-4">
                  <div className="w-32 h-24 bg-[#010080]/10 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <svg className="w-10 h-10 text-[#010080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-[#010080] bg-blue-100 px-2 py-1 rounded">
                        {activeCourse.progress}% COMPLETED
                      </span>
                    </div>
                    <h4 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {activeCourse.subprogram_name || "Current Course"}
                    </h4>
                    <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Keep up the great work! You're making steady progress.
                    </p>
                    <Link
                      href={`/portal/student/my-courses/${activeCourse.subprogram_id}`}
                      className="inline-block px-4 py-2 bg-[#010080] hover:bg-[#010080]/90 text-white rounded-lg font-medium transition-colors"
                    >
                      Resume Course
                    </Link>
                  </div>
                </div>
              ) : (
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  You haven't started any courses yet.
                </p>
              )}
            </div>

            {/* For You Section */}
            <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  For You
                </h3>
                <Link
                  href="/portal/student/my-courses"
                  className={`text-sm font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
                >
                  See All
                </Link>
              </div>
              {subprograms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subprograms.slice(0, 2).map((sp) => (
                    <div key={sp.id} className={`p-4 rounded-lg border ${isDark ? 'border-gray-700 bg-gray-700/30' : 'border-gray-100 bg-gray-50'}`}>
                      <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{sp.subprogram_name}</h4>
                      <p className={`text-xs mb-3 line-clamp-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{sp.description}</p>
                      <Link href={`/portal/student/my-courses`} className="text-xs font-bold text-[#010080] dark:text-blue-400">VIEW DETAILS →</Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  No course recommendations at the moment.
                </p>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Attendance Chart */}
            <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Weekly Attendance
                </h3>
                {attendanceLoading && <span className="animate-spin h-4 w-4 border-2 border-[#010080] border-t-transparent rounded-full"></span>}
              </div>
              <div className="space-y-3">
                {attendanceData.map((item, index) => (
                  <div key={item.week} className="flex items-center gap-3">
                    <span className={`text-sm font-medium w-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.week}
                    </span>
                    <div className="flex-1 relative">
                      <div className={`h-6 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div
                          className={`h-full rounded transition-all duration-1000 ${item.value > 80 ? 'bg-green-500' : item.value > 50 ? 'bg-blue-600' : 'bg-orange-500'
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
                {leaderboardLoading ? (
                  <p className="text-sm text-gray-500">Loading...</p>
                ) : leaderboardData.length > 0 ? (
                  leaderboardData.map((lbUser, index) => (
                    <div key={lbUser.id} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${index === 0 ? 'bg-yellow-100' : index === 1 ? 'bg-gray-100' : index === 2 ? 'bg-orange-100' : 'bg-blue-50'
                        }`}>
                        <span className={`text-xs font-bold ${index === 0 ? 'text-yellow-700' : index === 1 ? 'text-gray-700' : index === 2 ? 'text-orange-700' : 'text-blue-700'
                          }`}>{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {lbUser.full_name || lbUser.username}
                        </p>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
                          </svg>
                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {lbUser.points || 0} pts
                          </span>
                        </div>
                      </div>
                      {isLocked && <span className="text-[10px] text-gray-400">🔒</span>}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No data yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

