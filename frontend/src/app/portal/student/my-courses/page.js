"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useGetClassQuery } from "@/redux/api/classApi";
import { useGetCoursesBySubprogramIdQuery } from "@/redux/api/courseApi";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useGetSubprogramsQuery, useGetSubprogramsByProgramIdQuery } from "@/redux/api/subprogramApi";
import Image from "next/image";

export default function MyCoursesPage() {
  const { isDark } = useDarkMode();
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useGetCurrentUserQuery();
  const [studentClass, setStudentClass] = useState(null);
  const [studentProgram, setStudentProgram] = useState(null);
  const [studentSubprogram, setStudentSubprogram] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch student's class
  const { data: classData, isLoading: classLoading } = useGetClassQuery(
    user?.class_id,
    { skip: !user?.class_id }
  );

  // Fetch programs
  const { data: programs = [] } = useGetProgramsQuery();

  // Fetch all subprograms to find student's subprogram
  const { data: allSubprograms = [] } = useGetSubprogramsQuery();

  // Fetch subprograms for the student's program
  const { data: subprogramsData = [], isLoading: subprogramsLoading } = useGetSubprogramsByProgramIdQuery(
    studentProgram?.id,
    { skip: !studentProgram?.id }
  );

  // Fetch courses for student's subprogram
  const { data: coursesData, isLoading: coursesLoading } = useGetCoursesBySubprogramIdQuery(
    studentClass?.subprogram_id,
    { skip: !studentClass?.subprogram_id }
  );

  useEffect(() => {
    if (classData) {
      setStudentClass(classData);
    }
  }, [classData]);

  useEffect(() => {
    if (coursesData) {
      setCourses(Array.isArray(coursesData) ? coursesData : []);
    }
  }, [coursesData]);

  // Find student's program and subprogram
  useEffect(() => {
    if (studentClass && allSubprograms.length > 0 && programs.length > 0) {
      // Find the subprogram from all subprograms
      const subprogram = allSubprograms.find(sp => sp.id == studentClass.subprogram_id);
      if (subprogram) {
        setStudentSubprogram(subprogram);
        // Find the program
        const program = programs.find(p => p.id == subprogram.program_id);
        if (program) {
          setStudentProgram(program);
        }
      }
    }
  }, [studentClass, programs, allSubprograms]);

  useEffect(() => {
    if (!userLoading && !classLoading && !subprogramsLoading) {
      setLoading(false);
    }
  }, [userLoading, classLoading, subprogramsLoading]);

  // Handle subprogram click - navigate to course overview
  const handleSubprogramClick = (subprogram) => {
    const isActive = studentClass && (subprogram.id == studentClass.subprogram_id);
    if (isActive) {
      router.push(`/portal/student/my-courses/${subprogram.id}`);
    }
  };

  const bg = isDark ? "bg-gray-900" : "bg-gray-50";
  const card = isDark ? "bg-gray-800 text-white border-gray-700" : "bg-white text-gray-900 border-gray-100";

  if (loading) {
    return (
      <div className={`min-h-screen transition-colors ${bg}`}>
        <div className="py-6 w-full px-6 sm:px-10">
          <div className={`p-6 rounded-xl shadow-sm border ${card}`}>
            <p className={isDark ? "text-gray-300" : "text-gray-600"}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!studentClass || !studentProgram) {
    return (
      <div className={`min-h-screen transition-colors ${bg}`}>
        <div className="py-6 w-full px-6 sm:px-10">
          <div className={`p-6 rounded-xl shadow-sm border ${card}`}>
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
              You have not been assigned to any class yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors pt-12 w-full px-6 sm:px-10 pb-20 ${bg}`}>
      <div className="w-full">
        {/* Header */}
        <div className="mb-12">
          <h1 className={`text-4xl font-bold tracking-tight mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
            My Courses
          </h1>
          <p className={`text-lg font-medium opacity-60 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Track your progress and access your study materials.
          </p>
        </div>

        <div className="flex flex-col gap-12">

          {/* Top Section: Levels (Left) & Image (Right) - 50/50 split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">

            {/* Left Column - Subprograms (Pillar Chart Style) */}
            <div className="flex flex-col gap-4">
              <h2 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                Program Levels
              </h2>
              {subprogramsLoading ? (
                <p className="text-gray-500">Loading levels...</p>
              ) : (
                <div className="flex flex-row gap-4 h-[500px] items-end px-2 overflow-x-auto pb-4">
                  {subprogramsData.map((subprogram, index) => {
                    const isActive = studentClass && (subprogram.id == studentClass.subprogram_id);

                    // Graduated Height: Min 25%, Max 100%
                    const total = subprogramsData.length || 1;
                    const heightPercent = 25 + ((index / (total - 1 || 1)) * 75);

                    return (
                      <div
                        key={subprogram.id}
                        onClick={() => handleSubprogramClick(subprogram)}
                        className="group flex flex-col items-center gap-3 flex-1 min-w-[80px] cursor-pointer transition-all duration-300 hover:-translate-y-2 h-full justify-end"
                      >
                        {/* The Pillar */}
                        <div
                          className={`
                              w-full rounded-t-2xl border-x border-t transition-all duration-500 relative
                              flex flex-col justify-end items-center p-2
                              ${isActive
                              ? "bg-green-600 border-green-500 shadow-xl shadow-green-600/20 z-10 scale-105"
                              : isDark ? "bg-gray-800 border-gray-700 opacity-60" : "bg-gray-200 border-gray-300 opacity-60"
                            }
                            `}
                          style={{ height: `${heightPercent}%`, minHeight: '100px' }}
                        >
                          {/* Icon/Indicator */}
                          <div className="mb-4">
                            {isActive ? (
                              <div className="w-10 h-10 rounded-full bg-white text-green-600 flex items-center justify-center shadow-lg">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            ) : (
                              <span className={`text-2xl font-bold opacity-20 ${isDark ? "text-white" : "text-black"}`}>
                                {index + 1}
                              </span>
                            )}
                          </div>

                          {/* Vertical Label */}
                          <span className={`text-[10px] font-bold uppercase tracking-widest -rotate-90 mb-8 whitespace-nowrap ${isActive ? "text-white" : "opacity-40"}`}>
                            {isActive ? "Current Level" : `Level ${index + 1}`}
                          </span>
                        </div>

                        {/* Title below pillar */}
                        <div className="text-center w-full px-1">
                          <h3 className={`text-xs font-bold truncate ${isDark ? "text-white" : "text-gray-900"} ${isActive ? "opacity-100" : "opacity-60"}`}>
                            {subprogram.subprogram_name}
                          </h3>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column - Image (Matching Height) */}
            <div className="flex flex-col gap-4">
              <h2 className={`text-xl font-bold mb-2 opacity-0 select-none`}>Spacing</h2>
              <div className={`relative w-full h-[500px] rounded-3xl overflow-hidden shadow-sm border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                <Image
                  src="/images/My courses.jpg"
                  alt="My Courses"
                  fill
                  className="object-contain p-8"
                  priority
                  unoptimized
                />
              </div>
            </div>

          </div>

          {/* Bottom Section: My Classes */}
          <div className="mt-8">
            <div className="mb-8 border-b pb-4 border-gray-100 dark:border-gray-700">
              <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                My Classes
              </h2>
              <p className={`text-sm opacity-60 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Courses available in your current level: {studentSubprogram?.subprogram_name}.
              </p>
            </div>

            {courses.length === 0 ? (
              <div className={`p-12 rounded-2xl border-2 border-dashed text-center ${isDark ? "bg-gray-800/20 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                <p className="text-gray-400">No courses found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {courses.map((course) => (
                  <div key={course.id} className={`p-5 rounded-2xl border shadow-sm transition-all hover:shadow-md ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">{course.code || "Course"}</span>
                    </div>
                    <h3 className={`text-base font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>{course.course_name}</h3>
                    <p className={`text-xs opacity-60 line-clamp-2 mb-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{course.description || "Access your course materials."}</p>
                    <button onClick={() => router.push(`/portal/student/my-courses/${studentClass?.subprogram_id}`)} className="text-xs font-bold text-blue-600 hover:underline">View Course</button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
