"use client";

import { useMemo, useEffect } from "react";
import { useGetStudentMaterialsQuery } from "@/redux/api/materialApi";
import { useDarkMode } from "@/context/ThemeContext";
import Loader from "@/components/Loader";

export default function ResourcesPage() {
  const { isDark } = useDarkMode();
  const { data: resourcesData, isLoading, error } = useGetStudentMaterialsQuery();
  // The API returns the array directly, not an object with a materials property
  const resources = Array.isArray(resourcesData) ? resourcesData : [];

  const bg = isDark ? "bg-[#0f172a]" : "bg-[#f8fafc]";

  // Filter to show only materials for this student's subprogram
  const filteredResources = useMemo(() => {
    // Backend already filters by student's subprogram, so just return all
    return resources;
  }, [resources]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${bg}`}>
      <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="mb-10">
          <div className="animate-fade-in">
            <h1 className={`text-3xl font-semibold mb-3 ${isDark ? "text-white" : "text-[#010080]"}`}>
              Learning Resources
            </h1>
            <p className={`text-base max-w-2xl ${isDark ? "text-blue-200/60" : "text-gray-500"}`}>
              Access your course materials and resources for your level.
            </p>
          </div>
        </div>

        {/* Resources Grid */}
        {filteredResources.length === 0 ? (
          <div className={`p-16 rounded-2xl shadow-lg text-center border ${isDark ? 'bg-gray-800/40 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className={`text-2xl font-semibold mb-3 ${isDark ? "text-white" : "text-[#010080]"}`}>No Materials Available</h3>
            <p className={`text-base max-w-lg mx-auto ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              No materials have been uploaded for your level yet. Please check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource, idx) => (
              <div
                key={resource.id}
                className={`group relative rounded-2xl overflow-hidden shadow-lg transition-all duration-300 border hover:shadow-xl hover:-translate-y-1 flex flex-col
                  ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
                `}
              >
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="inline-flex items-center px-3 py-1 bg-[#010080] text-white rounded-lg text-xs font-medium">
                          {resource.type}
                        </span>
                        {resource.subprogram_name && (
                          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${isDark ? 'bg-indigo-900/40 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
                            {resource.subprogram_name}
                          </span>
                        )}
                      </div>
                      <h3 className={`text-xl font-semibold leading-tight ${isDark ? "text-white" : "text-[#010080]"} transition-colors group-hover:text-blue-600`}>
                        {resource.title}
                      </h3>
                    </div>
                  </div>

                  <div className={`mb-6 p-4 rounded-xl ${isDark ? "bg-gray-900/50" : "bg-gray-50"} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <p className={`text-sm leading-relaxed ${isDark ? "text-gray-400" : "text-gray-600"} line-clamp-3`}>
                      {resource.description || "Course material provided for this level and subject."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-gray-700 text-blue-400' : 'bg-blue-50 text-[#010080]'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div>
                        <p className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Program</p>
                        <p className={`text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-[#010080]'}`}>{resource.program_name || "General Course"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 mt-auto">
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/btn relative flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all bg-[#010080] text-white hover:bg-blue-700 shadow-md"
                  >
                    <svg className="w-5 h-5 transition-transform group-hover/btn:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>{resource.type === 'Drive' ? 'Open Google Drive' : 'Download Resource'}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
