"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useGetClassQuery } from "@/redux/api/classApi";
import { useGetCoursesBySubprogramIdQuery } from "@/redux/api/courseApi";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useGetSubprogramQuery } from "@/redux/api/subprogramApi";
import Image from "next/image";

export default function CourseOverviewPage() {
  const { isDark } = useDarkMode();
  const router = useRouter();
  const params = useParams();
  const subprogramId = params?.subprogramId;

  const { data: user, isLoading: userLoading } = useGetCurrentUserQuery();
  const [studentClass, setStudentClass] = useState(null);
  const [program, setProgram] = useState(null);
  const [subprogram, setSubprogram] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch student's class
  const { data: classData, isLoading: classLoading } = useGetClassQuery(
    user?.class_id,
    { skip: !user?.class_id }
  );

  // Fetch programs
  const { data: programs = [] } = useGetProgramsQuery();

  // Fetch subprogram details
  const { data: subprogramData, isLoading: subprogramLoading } = useGetSubprogramQuery(
    subprogramId,
    { skip: !subprogramId }
  );

  // Fetch courses for this subprogram
  const { data: coursesData, isLoading: coursesLoading } = useGetCoursesBySubprogramIdQuery(
    subprogramId,
    { skip: !subprogramId }
  );

  useEffect(() => {
    if (classData) {
      setStudentClass(classData);
    }
  }, [classData]);

  useEffect(() => {
    if (subprogramData) {
      setSubprogram(subprogramData);
      // Find the program
      const foundProgram = programs.find(p => p.id == subprogramData.program_id);
      if (foundProgram) {
        setProgram(foundProgram);
      }
    }
  }, [subprogramData, programs]);

  useEffect(() => {
    if (coursesData) {
      setCourses(Array.isArray(coursesData) ? coursesData : []);
    }
  }, [coursesData]);

  useEffect(() => {
    if (!userLoading && !classLoading && !subprogramLoading && !coursesLoading) {
      setLoading(false);
    }
  }, [userLoading, classLoading, subprogramLoading, coursesLoading]);

  const bg = isDark ? "bg-gray-900" : "bg-gray-100";
  const card = isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900";

  if (loading) {
    return (
      <div className={`min-h-screen transition-colors ${bg}`}>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className={`p-6 rounded-xl shadow ${card}`}>
              <p className={isDark ? "text-gray-300" : "text-gray-600"}>Loading course overview...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!subprogram || !program) {
    return (
      <div className={`min-h-screen transition-colors ${bg}`}>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className={`p-6 rounded-xl shadow ${card}`}>
              <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                Course information not found.
              </p>
              <button
                onClick={() => router.back()}
                className="mt-4 px-4 py-2 bg-[#010080] text-white rounded-lg hover:bg-[#010080]/90 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const programImage = program.image 
    ? (program.image.startsWith('http') 
        ? program.image 
        : `http://localhost:5000${program.image}`)
    : '/images/book1.jpg';

  return (
    <div className={`min-h-screen transition-colors ${bg}`}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header with Back Button */}
          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className={`p-2 rounded-lg ${isDark ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-100"} transition-colors`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
            <div className={`flex-1 p-6 rounded-xl ${card} shadow-md`}>
              <h1 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                Course Overview
              </h1>
              <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                {program.title} - {subprogram.subprogram_name}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Program Card */}
              <div className={`rounded-xl shadow-lg overflow-hidden ${card}`}>
                <div className={`relative h-48 bg-gradient-to-br ${isDark ? 'from-gray-700 to-gray-800' : 'from-gray-200 to-gray-300'}`}>
                  {program.image && (
                    <Image
                      src={programImage}
                      alt={program.title}
                      fill
                      className="object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <h2 className={`text-2xl font-bold mb-1 text-white`}>
                      {program.title}
                    </h2>
                    <p className="text-white/80 text-sm">
                      {subprogram.subprogram_name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Class Information */}
              {studentClass && (
                <div className={`rounded-xl shadow overflow-hidden ${card}`}>
                  <div className={`px-6 py-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                    <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                      Class Information
                    </h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className={`text-sm font-medium mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          Class Name
                        </p>
                        <p className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                          {studentClass.class_name}
                        </p>
                      </div>
                      {studentClass.description && (
                        <div className="col-span-2">
                          <p className={`text-sm font-medium mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            Description
                          </p>
                          <p className={`text-base ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            {studentClass.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Schedule Section (Placeholder - you can integrate with your schedule API) */}
              <div className={`rounded-xl shadow overflow-hidden ${card}`}>
                <div className={`px-6 py-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                  <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                    Schedule
                  </h2>
                </div>
                <div className="p-6">
                  <div className="text-center py-8">
                    <svg
                      className="w-16 h-16 mx-auto text-gray-400 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                      Schedule information will be displayed here
                    </p>
                    <p className={`text-sm mt-2 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                      Check with your instructor for class timings
                    </p>
                  </div>
                </div>
              </div>

              {/* Courses List */}
              <div className={`rounded-xl shadow overflow-hidden ${card}`}>
                <div className={`px-6 py-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                  <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                    Courses in this Subprogram
                  </h2>
                  <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    {courses.length} course{courses.length !== 1 ? 's' : ''} available
                  </p>
                </div>

                {coursesLoading ? (
                  <div className="p-6 text-center">
                    <p className={isDark ? "text-gray-400" : "text-gray-600"}>Loading courses...</p>
                  </div>
                ) : courses.length === 0 ? (
                  <div className="p-6 text-center">
                    <svg
                      className="w-12 h-12 mx-auto text-gray-400 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                      No courses available for this subprogram yet.
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
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Program Details */}
              <div className={`rounded-xl p-6 ${card} shadow-md`}>
                <h3 className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                  Program Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className={`text-sm font-medium mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Program
                    </p>
                    <p className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {program.title}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Subprogram
                    </p>
                    <p className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {subprogram.subprogram_name}
                    </p>
                  </div>
                  {subprogram.description && (
                    <div>
                      <p className={`text-sm font-medium mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        Description
                      </p>
                      <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                        {subprogram.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Info */}
              <div className={`rounded-xl p-6 ${card} shadow-md`}>
                <h3 className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                  Quick Info
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Total Courses</p>
                    <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {courses.length}
                    </p>
                  </div>
                  {studentClass && (
                    <div>
                      <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Your Class</p>
                      <p className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {studentClass.class_name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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

