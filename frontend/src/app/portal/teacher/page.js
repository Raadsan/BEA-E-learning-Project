"use client";

import TeacherHeader from "./TeacherHeader";
import React from 'react';
import { useGetClassesQuery } from "@/redux/api/classApi";
import { useGetStudentsQuery } from "@/redux/api/studentApi";
import { useGetCoursesQuery } from "@/redux/api/courseApi";
import { useDarkMode } from "@/context/ThemeContext";

  // Circular Progress Component
  const CircularProgress = ({ percentage, size = 80, strokeWidth = 8, color = "#3b82f6" }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-900">{percentage}%</span>
        </div>
      </div>
    );
  };

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

  // Calculate percentages for circular progress
  const coursesPercentage = totalCourses > 0 ? Math.min(Math.round((totalCourses / 10) * 100), 100) : 0;
  const activeStudentsPercentage = totalStudents > 0 ? Math.min(Math.round((activeStudents / totalStudents) * 100), 100) : 0;
  const classesPercentage = totalClasses > 0 ? Math.min(Math.round((totalClasses / 20) * 100), 100) : 0;

  return (
    <>
      <TeacherHeader />

      {/* Dashboard Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="w-full px-8 pt-6 pb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Dashboard Overview</h1>
          
          {/* Summary Cards with Circular Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 max-w-full">
            {/* Total Course Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-2">Total Course</p>
                  <p className="text-4xl font-bold text-gray-900">
                    {coursesLoading ? "..." : totalCourses}
                  </p>
                  <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    +32.40% last month
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <CircularProgress percentage={coursesPercentage} size={100} color="#f95150" />
                </div>
              </div>
            </div>

            {/* Active Students Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow w-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <p className="text-gray-600 text-sm font-medium mb-2">Active Students</p>
                  <p className="text-4xl font-bold text-gray-900">
                    {studentsLoading ? "..." : activeStudents}
                  </p>
                  <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    +18.45% last month
                  </p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <CircularProgress percentage={activeStudentsPercentage} size={100} color="#010080" />
                </div>
              </div>
            </div>

            {/* Total Courses Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow w-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <p className="text-gray-600 text-sm font-medium mb-2">Total Courses</p>
                  <p className="text-4xl font-bold text-gray-900">
                    {coursesLoading ? "..." : totalCourses}
                  </p>
                  <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    +20.34% last month
                  </p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <CircularProgress percentage={coursesPercentage} size={100} color="#4b47a4" />
                </div>
              </div>
            </div>

            {/* Total Classes Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow w-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <p className="text-gray-600 text-sm font-medium mb-2">Total Classes</p>
                  <p className="text-4xl font-bold text-gray-900">
                    {classesLoading ? "..." : totalClasses}
                  </p>
                  <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    +6.3% last month
                  </p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <CircularProgress percentage={classesPercentage} size={100} color="#10b981" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Attendance Bar Chart */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Statistics Weekly Attendance</h2>
              <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-50 rounded-lg">
                Chart placeholder - Weekly Attendance
              </div>
            </div>

            {/* Course Completion Rate Pie Chart */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Statistics Course Completion Rate</h2>
                <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
              <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-50 rounded-lg">
                Chart placeholder - Course Completion Rate
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

 
