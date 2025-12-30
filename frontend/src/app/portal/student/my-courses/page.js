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

  // Calculate progress for each subprogram (placeholder)
  const calculateProgress = (subprogramId) => {
    // If it's the active subprogram, calculate based on courses
    if (subprogramId == studentClass?.subprogram_id && courses.length > 0) {
      return 72; // Mock progress
    }
    return 0; // Locked subprograms have 0% progress
  };

  // Handle subprogram click - navigate to course overview
  const handleSubprogramClick = (subprogram) => {
    const isActive = studentClass && (subprogram.id == studentClass.subprogram_id);
    if (isActive) {
      router.push(`/portal/student/my-courses/${subprogram.id}`);
    }
  };

  const bg = isDark ? "bg-gray-900" : "bg-gray-100";
  const card = isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900";

  if (loading) {
    return (
      <div className={`min-h-screen transition-colors ${bg}`}>
        <div className="py-6">
          <div className={`p-6 rounded-xl shadow ${card}`}>
            <p className={isDark ? "text-gray-300" : "text-gray-600"}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!studentClass || !studentProgram) {
    return (
      <div className={`min-h-screen transition-colors ${bg}`}>
        <div className="py-6">
          <div className={`p-6 rounded-xl shadow ${card}`}>
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
              You have not been assigned to any class yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Get program image from database
  const getProgramImage = () => {
    if (!studentProgram?.image) return '/images/book1.jpg';

    // If image path starts with /, use it directly with backend URL
    if (studentProgram.image.startsWith('/')) {
      return `http://localhost:5000${studentProgram.image}`;
    }
    // If image path doesn't start with /, add it
    if (studentProgram.image.startsWith('http')) {
      return studentProgram.image;
    }
    return `http://localhost:5000/${studentProgram.image}`;
  };

  const programImage = getProgramImage();

  return (
    <div className={`min-h-screen transition-colors pt-12 w-full px-6 sm:px-10 pb-20 ${bg}`}>
      <div className="w-full">
        {/* Header */}
        <div className="mb-12">
          <h1 className={`text-4xl font-bold mb-4 tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
            My Courses
          </h1>
          <p className={`text-lg font-medium opacity-60 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Available Courses
          </p>
        </div>

        {/* Main Program Card */}
        <div className={`mb-8 rounded-xl shadow-lg overflow-hidden ${isDark ? "bg-gray-800" : "bg-gray-50"} border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            {/* Left Section - Program Card with Image */}
            <div className={`lg:col-span-1 ${isDark ? "bg-gray-700" : "bg-gray-100"} p-6 relative overflow-hidden`}>
              <div className="relative h-full min-h-[300px] flex flex-col items-center justify-center">
                <Image
                  src={programImage}
                  alt={studentProgram.title}
                  fill
                  className="object-cover "
                  unoptimized
                />

              </div>
            </div>

            {/* Right Section - Course Details */}
            <div className={`lg:col-span-2 ${isDark ? "bg-gray-800" : "bg-white"} p-8`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                    {studentProgram.title}
                  </h3>
                  <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    {studentProgram.title}
                  </p>
                </div>
                <div className="bg-[#010080] text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">In Progress</span>
                </div>
              </div>


              {/* Activity Info */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <svg className={`w-5 h-5 ${isDark ? "text-gray-400" : "text-gray-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                    Last activity: 4 days ago
                  </span>
                </div>
                <div>
                  <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                    {subprogramsData.length} courses available
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subprograms as Course Cards */}
        {subprogramsLoading ? (
          <div className={`p-6 rounded-xl shadow ${card} text-center`}>
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>Loading courses...</p>
          </div>
        ) : subprogramsData.length === 0 ? (
          <div className={`p-6 rounded-xl shadow ${card} text-center`}>
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>No courses available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {subprogramsData.map((subprogram, index) => {
              const isActive = studentClass && (subprogram.id == studentClass.subprogram_id);
              const isLocked = !isActive;
              const progress = calculateProgress(subprogram.id);
              const totalLessons = subprogram.id == studentClass?.subprogram_id ? courses.length : 0;
              const completedLessons = Math.floor((progress / 100) * totalLessons);

              // Define some nice gradients for cards
              const gradients = [
                "from-blue-600 to-indigo-700",
                "from-emerald-500 to-teal-700",
                "from-amber-400 to-orange-600",
                "from-purple-500 to-indigo-600",
                "from-rose-500 to-pink-600",
                "from-cyan-500 to-blue-600"
              ];
              const gradient = gradients[index % gradients.length];

              return (
                <div
                  key={subprogram.id}
                  onClick={() => handleSubprogramClick(subprogram)}
                  className={`group relative rounded-2xl overflow-hidden transition-all duration-500 border-2 ${isLocked
                    ? `${isDark ? "bg-gray-800/40 border-gray-700/50" : "bg-gray-100 border-gray-200"} grayscale opacity-80 cursor-not-allowed`
                    : `${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} cursor-pointer hover:shadow-2xl hover:border-[#010080]/30 hover:-translate-y-2`
                    }`}
                >
                  {/* Top Decorative Section with Icon */}
                  <div className={`relative h-32 flex items-center justify-center overflow-hidden bg-gradient-to-br ${gradient}`}>
                    {/* Abstract Background Patterns */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/30 blur-2xl"></div>
                      <div className="absolute -left-4 -bottom-4 w-20 h-20 rounded-full bg-black/20 blur-xl"></div>
                    </div>

                    <div className={`relative z-10 transition-transform duration-500 ${!isLocked && "group-hover:scale-110"}`}>
                      <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-xl">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="absolute top-4 right-4">
                      {isActive && (
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5 ${progress === 100
                          ? "bg-green-500 text-white"
                          : "bg-white text-[#010080]"
                          }`}>
                          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${progress === 100 ? "bg-white" : "bg-[#010080]"}`}></div>
                          {progress === 100 ? "Completed" : "Active"}
                        </div>
                      )}
                      {isLocked && (
                        <div className="p-1.5 bg-black/20 backdrop-blur-sm rounded-full border border-white/10 text-white/80">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className={`text-xl font-bold mb-2 line-clamp-1 transition-colors ${isLocked
                        ? (isDark ? "text-gray-500" : "text-gray-400")
                        : (isDark ? "text-white group-hover:text-[#4F46E5]" : "text-gray-900 group-hover:text-[#010080]")
                        }`}>
                        {subprogram.subprogram_name}
                      </h3>
                      <p className={`text-sm line-clamp-2 leading-relaxed ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {subprogram.description || "Master the concepts and build practical skills with this comprehensive course module."}
                      </p>
                    </div>

                    {/* Progress & Lessons Info */}
                    {!isLocked && (
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-end text-xs font-semibold">
                          <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                            {totalLessons > 0 ? `${completedLessons}/${totalLessons} Lessons` : "0 Lessons"}
                          </span>
                          <span className="text-[#010080] dark:text-indigo-400">{progress}%</span>
                        </div>
                        <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
                          <div
                            className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-1000 ease-out`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    {isActive ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/portal/student/my-courses/${subprogram.id}`);
                        }}
                        className={`w-full group/btn relative flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all duration-300 overflow-hidden ${isDark
                          ? "bg-indigo-600 text-white hover:bg-indigo-700"
                          : "bg-[#010080] text-white hover:bg-[#010080]/90 shadow-[0_4px_14px_0_rgba(1,0,128,0.39)]"
                          }`}
                      >
                        <span className="relative z-10 transition-transform duration-300 group-hover/btn:-translate-x-1">View Course</span>
                        <svg className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </button>
                    ) : (
                      <div className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-dashed font-medium text-sm transition-colors ${isDark ? "border-gray-700 text-gray-500" : "border-gray-200 text-gray-400"
                        }`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>Course Locked</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
