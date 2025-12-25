"use client";

import { useEffect, useState } from "react";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetClassQuery } from "@/redux/api/classApi";
import { useGetCoursesBySubprogramIdQuery } from "@/redux/api/courseApi";

export default function MyClassPage() {
  const { isDark } = useDarkMode();
  const { data: user, isLoading: userLoading } = useGetCurrentUserQuery();
  const [classInfo, setClassInfo] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch class info
  const { data: classData, isLoading: classLoading } = useGetClassQuery(
    user?.class_id,
    { skip: !user?.class_id }
  );

  // Fetch courses if subprogram_id exists
  const { data: coursesData, isLoading: coursesLoading } = useGetCoursesBySubprogramIdQuery(
    classInfo?.subprogram_id,
    { skip: !classInfo?.subprogram_id }
  );

  useEffect(() => {
    if (classData) {
      setClassInfo(classData);
    }
  }, [classData]);

  useEffect(() => {
    if (coursesData) {
      setCourses(Array.isArray(coursesData) ? coursesData : []);
    }
  }, [coursesData]);

  useEffect(() => {
    if (!userLoading && !classLoading) {
      setLoading(false);
    }
  }, [userLoading, classLoading]);

  const bg = isDark ? "bg-gray-900" : "bg-gray-100";
  const card = isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900";

  return (
    <div className={`min-h-screen transition-colors ${bg}`}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`mb-6 p-6 rounded-xl shadow ${card}`}>
          <h1 className="text-2xl font-bold mb-2">My Class</h1>
          <p className={isDark ? "text-gray-300" : "text-gray-600"}>
            Complete information about your assigned class, courses, and schedule.
          </p>
        </div>

        {userLoading || loading ? (
          <div className={`p-6 rounded-xl shadow ${card}`}>
            <p className={isDark ? "text-gray-300" : "text-gray-600"}>Loading class information...</p>
          </div>
        ) : !user?.class_id ? (
          <div className={`p-6 rounded-xl shadow ${card}`}>
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                  No Class Assigned
                </p>
                <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  You have not been assigned to any class yet. Please contact the administration.
                </p>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className={`p-6 rounded-xl shadow border border-red-200 ${isDark ? "bg-red-900/20" : "bg-red-50"}`}>
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Class Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoCard
                isDark={isDark}
                label="Class Name"
                value={classInfo?.class_name || "Not set"}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
              />
              <InfoCard
                isDark={isDark}
                label="Subprogram ID"
                value={classInfo?.subprogram_id || "Not set"}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                }
              />
              <InfoCard
                isDark={isDark}
                label="Course ID"
                value={classInfo?.course_id || "Not set"}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                }
              />
              <InfoCard
                isDark={isDark}
                label="Total Courses"
                value={courses.length || 0}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              />
            </div>

            {/* Class Description */}
            {classInfo?.description && (
              <div className={`p-6 rounded-xl shadow ${card}`}>
                <h2 className={`text-lg font-semibold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                  Class Description
                </h2>
                <p className={isDark ? "text-gray-300" : "text-gray-700"}>
                  {classInfo.description}
                </p>
              </div>
            )}

            {/* Courses Table */}
            <div className={`rounded-xl shadow overflow-hidden ${card}`}>
              <div className={`px-6 py-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                  Courses in This Class
                </h2>
                <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  All courses associated with your class
                </p>
              </div>

              {coursesLoading ? (
                <div className="p-6 text-center">
                  <p className={isDark ? "text-gray-400" : "text-gray-600"}>Loading courses...</p>
                </div>
              ) : courses.length === 0 ? (
                <div className="p-6 text-center">
                  <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                    No courses have been assigned to this class yet.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#010080] text-white">
                      <tr>
                        <Th>Course Name</Th>
                        <Th>Description</Th>
                        <Th>Duration</Th>
                        <Th>Status</Th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? "divide-gray-700" : "divide-gray-200"}`}>
                      {courses.map((course, index) => (
                        <tr
                          key={course.id || course._id || index}
                          className={`${
                            index % 2 === 0
                              ? isDark
                                ? "bg-gray-800"
                                : "bg-white"
                              : isDark
                              ? "bg-gray-800/50"
                              : "bg-gray-50"
                          } hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                        >
                          <Td isDark={isDark}>
                            <div className="font-medium">{course.course_name || "N/A"}</div>
                          </Td>
                          <Td isDark={isDark}>
                            <div className="max-w-md truncate">
                              {course.description || "No description available"}
                            </div>
                          </Td>
                          <Td isDark={isDark}>
                            {course.duration ? `${course.duration} hours` : "N/A"}
                          </Td>
                          <Td isDark={isDark}>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                course.status === "active"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {course.status || "N/A"}
                            </span>
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Class Details Table */}
            <div className={`rounded-xl shadow overflow-hidden ${card}`}>
              <div className={`px-6 py-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                  Class Details
                </h2>
                <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  Complete information about your class
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <tbody className={`divide-y ${isDark ? "divide-gray-700" : "divide-gray-200"}`}>
                    <TableRow
                      isDark={isDark}
                      label="Class ID"
                      value={classInfo?.id || classInfo?._id || "N/A"}
                    />
                    <TableRow
                      isDark={isDark}
                      label="Class Name"
                      value={classInfo?.class_name || "Not set"}
                    />
                    <TableRow
                      isDark={isDark}
                      label="Description"
                      value={classInfo?.description || "No description available"}
                    />
                    <TableRow
                      isDark={isDark}
                      label="Subprogram ID"
                      value={classInfo?.subprogram_id || "Not assigned"}
                    />
                    <TableRow
                      isDark={isDark}
                      label="Course ID"
                      value={classInfo?.course_id || "Not assigned"}
                    />
                    <TableRow
                      isDark={isDark}
                      label="Created At"
                      value={
                        classInfo?.created_at
                          ? new Date(classInfo.created_at).toLocaleDateString()
                          : "N/A"
                      }
                    />
                    <TableRow
                      isDark={isDark}
                      label="Updated At"
                      value={
                        classInfo?.updated_at
                          ? new Date(classInfo.updated_at).toLocaleDateString()
                          : "N/A"
                      }
                    />
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value, icon, isDark }) {
  return (
    <div className={`p-5 rounded-xl shadow ${isDark ? "bg-gray-800" : "bg-white"}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${isDark ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-600"}`}>
          {icon}
        </div>
        <span className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          {label}
        </span>
      </div>
      <div className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
        {value}
      </div>
    </div>
  );
}

function TableRow({ label, value, isDark }) {
  return (
    <tr className={`${isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"} transition-colors`}>
      <td className={`px-6 py-4 font-medium ${isDark ? "text-gray-300" : "text-gray-700"} w-1/3`}>
        {label}
      </td>
      <td className={`px-6 py-4 ${isDark ? "text-gray-200" : "text-gray-900"}`}>
        {value}
      </td>
    </tr>
  );
}

function Th({ children }) {
  return (
    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
      {children}
    </th>
  );
}

function Td({ children, isDark }) {
  return (
    <td className={`px-6 py-4 whitespace-nowrap ${isDark ? "text-gray-200" : "text-gray-900"}`}>
      {children}
    </td>
  );
}
