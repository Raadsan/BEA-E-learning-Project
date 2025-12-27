"use client";

import { useState, useMemo } from "react";
import { useGetStudentMaterialsQuery } from "@/redux/api/materialApi";
import { useDarkMode } from "@/context/ThemeContext";
import Loader from "@/components/Loader";

export default function ResourcesPage() {
  const { isDark } = useDarkMode();
  const { data: resources, isLoading } = useGetStudentMaterialsQuery();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");

  const bg = isDark ? "bg-[#0f172a]" : "bg-gray-50";

  // Filter types available in data
  const types = useMemo(() => {
    if (!resources) return ["All"];
    const uniqueTypes = [...new Set(resources.map(r => r.type))];
    return ["All", ...uniqueTypes];
  }, [resources]);

  const filteredResources = useMemo(() => {
    if (!resources) return [];
    return resources.filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
        (r.subject && r.subject.toLowerCase().includes(search.toLowerCase()));
      const matchesType = filterType === "All" || r.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [resources, search, filterType]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors ${bg}`}>
      <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="mb-8 border-b pb-6">
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
            Course Materials
          </h1>
          <p className={isDark ? "text-gray-400" : "text-gray-600 font-medium"}>
            Access and download your curriculum resources, study guides, and recorded sessions.
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className={`flex flex-col md:flex-row gap-4 items-center justify-between p-5 rounded-2xl shadow-lg border-2 mb-8 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-50 border-2'}`}>
          <div className="relative w-full md:w-96 group">
            <input
              type="text"
              placeholder="Search materials or topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border-2 transition-all text-sm focus:ring-2 focus:ring-blue-500 outline-none
                ${isDark ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-blue-100 text-gray-900 placeholder-gray-400'}
              `}
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full md:w-auto">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all
                  ${filterType === type
                    ? 'bg-[#010080] text-white shadow-md'
                    : (isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200')}
                `}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {filteredResources.length === 0 ? (
          <div className={`p-16 rounded-3xl shadow-xl text-center border-2 border-dashed
            ${isDark ? 'bg-gray-800/50 border-gray-700 text-white' : 'bg-white border-blue-100 text-gray-900'}`}>
            <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-2">No Resources Found</h3>
            <p className={isDark ? "text-gray-400" : "text-gray-500"}>
              We couldn't find any materials matching your criteria. Check with your instructor if you're expecting something here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredResources.map((resource) => (
              <div
                key={resource.id}
                className={`relative rounded-2xl overflow-hidden shadow-xl transition-all duration-300 border-2 hover:shadow-2xl hover:scale-[1.02] flex flex-col
                  ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-[#010080]'}
                `}
              >
                <div className="p-7 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"} line-clamp-2`}>
                        {resource.title}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-3 py-1 bg-blue-500 text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
                          {resource.type}
                        </span>
                        {resource.subject && (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-600 border border-blue-100'}`}>
                            {resource.subject}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={`mb-6 p-4 rounded-xl ${isDark ? "bg-gray-900/50" : "bg-white/70 shadow-inner"}`}>
                    <p className={`text-sm leading-relaxed ${isDark ? "text-gray-400" : "text-gray-600"} line-clamp-3`}>
                      {resource.description || "Comprehensive course material provided by your instructor for this level."}
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-gray-700 text-blue-400' : 'bg-blue-100 text-[#010080]'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" />
                        </svg>
                      </div>
                      <span className={`text-xs font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {resource.program_name || "General Resource"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`p-4 mt-auto border-t ${isDark ? 'border-gray-700' : 'border-blue-100'}`}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold transition-all bg-[#010080] hover:bg-blue-800 text-white shadow-lg active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>{resource.type === 'Drive' ? 'Open in Google Drive' : 'View Resource'}</span>
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
