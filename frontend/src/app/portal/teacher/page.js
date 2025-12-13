"use client";

import TeacherHeader from "./TeacherHeader";
import { useGetClassesQuery } from "@/redux/api/classApi";
import { useGetStudentsQuery } from "@/redux/api/studentApi";
import { useGetCoursesQuery } from "@/redux/api/courseApi";
import { useDarkMode } from "@/context/ThemeContext";

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
      <main className="flex-1 overflow-y-auto p-6 bg-gray-100 dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Dashboard Overview</h1>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Course Card */}
            <div className="rounded-lg shadow-sm p-6 transition-colors" style={{ backgroundColor: '#010080' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/90 text-sm font-medium mb-1">Total Course</p>
                  <p className="text-3xl font-bold text-white">
                    {coursesLoading ? "..." : totalCourses}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Active Students Card */}
            <div className="rounded-lg shadow-sm p-6 transition-colors" style={{ backgroundColor: '#f95150' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/90 text-sm font-medium mb-1">Active Students</p>
                  <p className="text-3xl font-bold text-white">
                    {studentsLoading ? "..." : activeStudents}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Total Courses Card */}
            <div className="rounded-lg shadow-sm p-6 text-white transition-colors" style={{ backgroundColor: '#4b47a4' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/90 text-sm font-medium mb-1">Total Courses</p>
                  <p className="text-3xl font-bold">
                    {coursesLoading ? "..." : totalCourses}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Attendance Bar Chart */}
            <div className={`rounded-lg shadow-sm p-6 border transition-colors ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-lg font-semibold mb-4 ${
                isDark ? 'text-white' : 'text-gray-800'
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
              <div className="relative h-64">
                <div className="absolute inset-0 flex items-end justify-between gap-2">
                  {weeklyAttendance.map((data, index) => {
                    const thisWeekHeight = (data.thisWeek / maxAttendance) * 100;
                    const lastWeekHeight = (data.lastWeek / maxAttendance) * 100;
                    const isHighlighted = data.day === "Mon";
                    
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-1 group">
                        <div className="relative w-full h-full flex items-end justify-center gap-1">
                          {/* Last Week Bar */}
                          <div
                            className="w-full bg-red-500 rounded-t transition-all hover:opacity-80"
                            style={{ height: `${lastWeekHeight}%` }}
                            title={`Last Week: ${data.lastWeek}`}
                          />
                          {/* This Week Bar */}
                          <div
                            className={`w-full bg-blue-500 rounded-t transition-all hover:opacity-80 ${
                              isHighlighted ? 'ring-2 ring-blue-300' : ''
                            }`}
                            style={{ height: `${thisWeekHeight}%` }}
                            title={`This Week: ${data.thisWeek}`}
                          />
                        </div>
                        {isHighlighted && (
                          <div className={`absolute -top-8 px-2 py-1 rounded text-xs font-medium ${
                            isDark ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {data.day} {data.thisWeek}
                          </div>
                        )}
                        <span className={`text-xs font-medium mt-1 ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {data.day}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between pr-2">
                  {[0, 100, 200, 300, 400].map((value) => (
                    <span key={value} className={`text-xs ${
                      isDark ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Course Completion Rate Pie Chart */}
            <div className={`rounded-lg shadow-sm p-6 border transition-colors ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>
                  Statistics Course Completion Rate
                </h2>
                <select className={`px-3 py-1 border rounded-lg text-sm transition-colors ${
                  isDark 
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
                        <span className={`text-sm font-medium ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {course.course}:
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {course.percentage}%
                        </span>
                        <span className={`text-xs ${
                          course.change >= 0 
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
