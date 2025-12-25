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
    <div className={`min-h-screen transition-colors ${bg}`}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              My Courses
            </h1>
            <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subprogramsData.map((subprogram) => {
                const isActive = studentClass && (subprogram.id == studentClass.subprogram_id);
                const isLocked = !isActive;
                const progress = calculateProgress(subprogram.id);
                const totalLessons = subprogram.id == studentClass?.subprogram_id ? courses.length : 0;
                const completedLessons = Math.floor((progress / 100) * totalLessons);

                return (
                  <div
                    key={subprogram.id}
                    onClick={() => handleSubprogramClick(subprogram)}
                    className={`relative rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${
                      isLocked
                        ? `${isDark ? "bg-gray-800/50" : "bg-gray-200"} opacity-60 cursor-not-allowed`
                        : `${card} cursor-pointer hover:shadow-2xl hover:scale-105`
                    }`}
                  >
                    {/* Course Image/Thumbnail */}
                    <div className={`relative h-48 ${isDark ? "bg-gray-700" : "bg-gray-300"}`}>
                      {programImage && (
                        <Image
                          src={programImage}
                          alt={subprogram.subprogram_name}
                          fill
                          className="object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      
                      {/* Completed Badge */}
                      {isActive && progress === 100 && (
                        <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Completed
                        </div>
                      )}

                      {/* Active Badge */}
                      {isActive && progress < 100 && (
                        <div className="absolute top-3 right-3 bg-[#010080] text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                          </svg>
                          In Progress
                        </div>
                      )}

                      {/* Lock Icon for Locked Courses */}
                      {isLocked && (
                        <div className="absolute top-3 right-3 bg-gray-600/80 text-white p-2 rounded-full">
                          <svg
                            className="w-5 h-5"
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
                        </div>
                      )}

                      {/* Course Title Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className={`text-lg font-bold text-white mb-1 line-clamp-2`}>
                          {subprogram.subprogram_name}
                        </h3>
                        {subprogram.description && (
                          <p className="text-white/80 text-sm line-clamp-2">
                            {subprogram.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Course Content */}
                    <div className="p-5">
                      

                      {/* Lesson Count */}
                      {isActive && totalLessons > 0 && (
                        <p className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          {completedLessons}/{totalLessons} lessons
                        </p>
                      )}

                      {/* Continue Button */}
                      {isActive && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/portal/student/my-courses/${subprogram.id}`);
                          }}
                          className="w-full bg-[#010080] hover:bg-[#010080] hover:text-white text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                          View
                        </button>
                      )}

                      {/* Locked Message */}
                      {isLocked && (
                        <div className={`text-center py-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                          <p className="text-sm">Locked</p>
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
    </div>
  );
}
