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

  // Calculate progress (placeholder - you can adjust based on your data)
  const calculateProgress = () => {
    // This is a placeholder - adjust based on your actual progress tracking
    if (courses.length === 0) return 0;
    // For now, return a mock progress
    return 72; // 72% as shown in the image
  };

  const progress = calculateProgress();
  const completedCourses = Math.floor((progress / 100) * courses.length);
  const remainingCourses = courses.length - completedCourses;

  // Handle subprogram click
  const handleSubprogramClick = (subprogram) => {
    if (subprogram.id == studentClass?.subprogram_id) {
      // Navigate to course overview
      router.push(`/portal/student/my-courses/${subprogram.id}`);
    }
  };

  const bg = isDark ? "bg-gray-900" : "bg-gray-100";
  const card = isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900";

  if (loading) {
    return (
      <div className={`min-h-screen transition-colors ${bg}`}>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className={`p-6 rounded-xl shadow ${card}`}>
              <p className={isDark ? "text-gray-300" : "text-gray-600"}>Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!studentClass || !studentProgram) {
    return (
      <div className={`min-h-screen transition-colors ${bg}`}>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className={`p-6 rounded-xl shadow ${card}`}>
              <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                You have not been assigned to any class yet.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const programImage = studentProgram.image 
    ? (studentProgram.image.startsWith('http') 
        ? studentProgram.image 
        : `http://localhost:5000${studentProgram.image}`)
    : '/images/book1.jpg';

  return (
    <div className={`min-h-screen transition-colors ${bg}`}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className={`mb-6 p-6 rounded-xl ${card} shadow-md`}>
            <h1 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              My Courses
            </h1>
            <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              View your enrolled programs and courses.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Section - Program Card */}
            <div className="lg:col-span-2 space-y-6">
              {/* Program Card with Image */}
              <div className={`rounded-xl shadow-lg overflow-hidden ${card}`}>
                <div className={`relative h-64 bg-gradient-to-br ${isDark ? 'from-gray-700 to-gray-800' : 'from-gray-200 to-gray-300'}`}>
                  {studentProgram.image && (
                    <Image
                      src={programImage}
                      alt={studentProgram.title}
                      fill
                      className="object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <h2 className={`text-2xl font-bold mb-2 text-white`}>
                      {studentProgram.title}
                    </h2>
                    {studentSubprogram && (
                      <p className="text-white/80 text-sm">
                        {studentSubprogram.subprogram_name}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      Progress
                    </span>
                    <span className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {progress}%
                    </span>
                  </div>
                  <div className={`w-full h-3 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-200"}`}>
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Subprograms List */}
              <div className={`rounded-xl shadow overflow-hidden ${card}`}>
                <div className={`px-6 py-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                  <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                    Available Subprograms
                  </h2>
                  <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Click on your active subprogram to view course details
                  </p>
                </div>

                {subprogramsLoading ? (
                  <div className="p-6 text-center">
                    <p className={isDark ? "text-gray-400" : "text-gray-600"}>Loading subprograms...</p>
                  </div>
                ) : subprogramsData.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className={isDark ? "text-gray-400" : "text-gray-600"}>No subprograms available.</p>
                  </div>
                ) : (
                  <div className="p-6 space-y-3">
                    {subprogramsData.map((subprogram) => {
                      const isActive = studentClass && (subprogram.id == studentClass.subprogram_id);
                      const isLocked = !isActive;

                      return (
                        <div
                          key={subprogram.id}
                          onClick={() => !isLocked && handleSubprogramClick(subprogram)}
                          className={`p-5 rounded-xl border-2 transition-all ${
                            isActive
                              ? `border-[#010080] shadow-lg bg-gradient-to-br ${isDark ? 'from-[#010080]/30 to-[#010080]/10' : 'from-[#010080]/15 to-blue-50'} ${card} cursor-pointer hover:shadow-xl`
                              : `border-gray-300 dark:border-gray-600 ${isDark ? "bg-gray-700/50" : "bg-gray-100"} opacity-60 cursor-not-allowed relative`
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className={`text-lg font-semibold mb-1 ${
                                isLocked 
                                  ? (isDark ? "text-gray-500" : "text-gray-400")
                                  : (isDark ? "text-white" : "text-gray-900")
                              }`}>
                                {subprogram.subprogram_name}
                              </h3>
                              {subprogram.description && (
                                <p className={`text-sm ${
                                  isLocked
                                    ? (isDark ? "text-gray-600" : "text-gray-500")
                                    : (isDark ? "text-gray-300" : "text-gray-600")
                                }`}>
                                  {subprogram.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              {isActive && (
                                <span className="px-3 py-1 bg-[#010080] text-white rounded-full text-xs font-semibold shadow-md">
                                  Active
                                </span>
                              )}
                              {isLocked && (
                                <svg
                                  className="w-6 h-6 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                  />
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar - Statistics */}
            <div className="space-y-6">
              {/* Program Info */}
              <div className={`rounded-xl p-6 ${card} shadow-md`}>
                <h3 className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                  Program Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className={`text-sm font-medium mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Program
                    </p>
                    <p className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {studentProgram.title}
                    </p>
                  </div>
                  {studentSubprogram && (
                    <div>
                      <p className={`text-sm font-medium mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        Subprogram
                      </p>
                      <p className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {studentSubprogram.subprogram_name}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className={`text-sm font-medium mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Total Courses
                    </p>
                    <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {courses.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Course Statistics */}
              <div className={`rounded-xl p-6 ${card} shadow-md`}>
                <h3 className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                  Course Progress
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Completed</p>
                    <p className={`text-2xl font-bold text-green-500 ${isDark ? "text-green-400" : "text-green-600"}`}>
                      {completedCourses}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Remaining</p>
                    <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {remainingCourses}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Total Lessons</p>
                    <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {courses.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
