"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useGetClassQuery, useGetClassesQuery, useGetClassSchedulesQuery } from "@/redux/api/classApi";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useGetSubprogramQuery } from "@/redux/api/subprogramApi";

export default function CourseOverviewPage() {
  const { isDark } = useDarkMode();
  const router = useRouter();
  const params = useParams();
  const subprogramId = params?.subprogramId;

  const { data: user, isLoading: userLoading } = useGetCurrentUserQuery();
  const [studentClass, setStudentClass] = useState(null);
  const [program, setProgram] = useState(null);
  const [subprogram, setSubprogram] = useState(null);
  const [subprogramClasses, setSubprogramClasses] = useState([]);
  const [classSchedules, setClassSchedules] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch student's class
  const { data: classData, isLoading: classLoading } = useGetClassQuery(
    user?.class_id,
    { skip: !user?.class_id }
  );

  // Fetch all classes
  const { data: allClasses = [], isLoading: classesLoading } = useGetClassesQuery();

  // Fetch programs
  const { data: programs = [] } = useGetProgramsQuery();

  // Fetch subprogram details
  const { data: subprogramData, isLoading: subprogramLoading } = useGetSubprogramQuery(
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

  // Filter classes for this subprogram and sort: student's class first
  useEffect(() => {
    if (allClasses.length > 0 && subprogramId) {
      const filtered = allClasses.filter(cls => cls.subprogram_id == subprogramId);
      // Sort: student's class first, then others
      const sorted = filtered.sort((a, b) => {
        const aIsStudentClass = studentClass && (a.id == studentClass.id || a._id == studentClass.id);
        const bIsStudentClass = studentClass && (b.id == studentClass.id || b._id == studentClass.id);
        if (aIsStudentClass && !bIsStudentClass) return -1;
        if (!aIsStudentClass && bIsStudentClass) return 1;
        return 0;
      });
      setSubprogramClasses(sorted);
    }
  }, [allClasses, subprogramId, studentClass]);

  // Fetch schedules for each class
  useEffect(() => {
    if (subprogramClasses.length > 0) {
      subprogramClasses.forEach((cls) => {
        // Schedules are already included in the class data from getAllClasses query
        if (cls.latest_schedule_date) {
          setClassSchedules(prev => ({
            ...prev,
            [cls.id || cls._id]: {
              date: cls.latest_schedule_date,
              zoom_link: cls.latest_zoom_link
            }
          }));
        }
      });
    }
  }, [subprogramClasses]);

  useEffect(() => {
    if (!userLoading && !classLoading && !subprogramLoading && !classesLoading) {
      setLoading(false);
    }
  }, [userLoading, classLoading, subprogramLoading, classesLoading]);

  const bg = isDark ? "bg-gray-900" : "bg-gray-100";

  if (loading) {
    return (
      <div className={`min-h-screen transition-colors ${bg}`}>
        <div className="py-6">
          <div className={`p-6 rounded-xl shadow ${isDark ? "bg-gray-800 text-white" : "bg-red-50 text-gray-900"} text-center`}>
            <p className={isDark ? "text-gray-300" : "text-gray-600"}>Loading course overview...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!subprogram || !program) {
    return (
      <div className={`min-h-screen transition-colors ${bg}`}>
        <div className="py-6">
          <div className={`p-6 rounded-xl shadow ${isDark ? "bg-gray-800 text-white" : "bg-red-50 text-gray-900"}`}>
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
    );
  }

  return (
    <div className={`min-h-screen transition-colors pt-12 w-full px-6 sm:px-10 pb-20 ${bg}`}>
      <div className="w-full">
        {/* Back Button Only */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className={`p-2 rounded-lg ${isDark ? "bg-gray-800 hover:bg-[#010080]" : "bg-white hover:bg-[#010080] hover:text-white"} transition-colors shadow-sm`}
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
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Classes for this Subprogram */}
          <div>
            <h2 className={`text-2xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-900"}`}>
              {subprogram.subprogram_name}
            </h2>

            {classesLoading ? (
              <div className={`p-6 rounded-xl shadow ${isDark ? "bg-gray-800 text-white" : "bg-red-50 text-gray-900"} text-center`}>
                <p className={isDark ? "text-gray-400" : "text-gray-600"}>Loading classes...</p>
              </div>
            ) : subprogramClasses.length === 0 ? (
              <div className={`p-6 rounded-xl shadow ${isDark ? "bg-gray-800 text-white" : "bg-red-50 text-gray-900"} text-center`}>
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                  No classes available for this subprogram yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {subprogramClasses.map((cls) => {
                  const isStudentClass = studentClass && (cls.id == studentClass.id || cls._id == studentClass.id);
                  const isMorning = cls.type === 'morning';
                  const isNight = cls.type === 'night';

                  return (
                    <div
                      key={cls.id || cls._id}
                      onClick={() => isStudentClass && router.push("/portal/student/online-sessions")}
                      className={`relative rounded-2xl overflow-hidden shadow-xl transition-all duration-300 border-2 ${isStudentClass
                        ? `border-[#010080] ${isDark ? 'bg-gray-800' : 'bg-blue-50'} hover:shadow-2xl hover:scale-[1.02] cursor-pointer`
                        : `${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-300 bg-gray-50/50'} opacity-75 cursor-not-allowed`
                        }`}
                    >
                      <div className="relative p-6">
                        {/* Header with Course Code and Your Class Badge */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className={`text-2xl font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                              {cls.class_name}
                            </h3>
                            <div className="flex items-center gap-2 mb-3">
                              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${isMorning
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                                : isNight
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                {cls.type ? (
                                  <>
                                    {isMorning && '🌅 '}
                                    {isNight && '🌙 '}
                                    {cls.type.charAt(0).toUpperCase() + cls.type.slice(1)} Class
                                  </>
                                ) : 'N/A'}
                              </span>
                            </div>
                          </div>
                          {isStudentClass ? (
                            <span className="px-3 py-1.5 bg-[#010080] text-white rounded-full text-xs font-semibold shadow-md flex items-center gap-1.5 whitespace-nowrap">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Your Class
                            </span>
                          ) : (
                            <span className="px-3 py-1.5 bg-gray-400 text-white rounded-full text-xs font-semibold shadow-md flex items-center gap-1.5 whitespace-nowrap">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                              </svg>
                              Can't Access
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        {cls.description && (
                          <p className={`text-sm mb-4 leading-relaxed ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                            {cls.description}
                          </p>
                        )}

                        {/* Teacher Info - No Background */}
                        {cls.teacher_name && (
                          <div className="mt-4 flex items-center justify-between">
                            <div>
                              <p className={`text-xs font-medium mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                👨‍🏫 Teacher
                              </p>
                              <p className={`text-lg font-bold whitespace-nowrap ${isDark ? "text-white" : "text-gray-900"}`}>
                                {cls.teacher_name}
                              </p>
                            </div>
                            {isStudentClass && (
                              <div className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                                Join Session →
                              </div>
                            )}
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
    </div>
  );
}
