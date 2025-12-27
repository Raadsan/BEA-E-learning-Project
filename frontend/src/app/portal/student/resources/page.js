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
  const [selectedLevel, setSelectedLevel] = useState(null);

  const bg = isDark ? "bg-[#0f172a]" : "bg-[#f8fafc]";

  const levels = [
    { id: 'A1', name: "A1 - Beginner", image: "/images/book1.jpg", color: "from-blue-500 to-indigo-600" },
    { id: 'A2', name: "A2 - Elementary", image: "/images/book2.jpg", color: "from-emerald-500 to-teal-600" },
    { id: 'A2+', name: "A2+ - Pre-Intermediate", image: "/images/book3.jpg", color: "from-amber-400 to-orange-500" },
    { id: 'B1', name: "B1 - Intermediate", image: "/images/book4.jpg", color: "from-purple-500 to-indigo-600" },
    { id: 'B1+', name: "B1+ - Intermediate Plus", image: "/images/book5.jpg", color: "from-rose-500 to-pink-600" },
    { id: 'B2', name: "B2 - Upper-Intermediate", image: "/images/book6.jpg", color: "from-blue-600 to-cyan-500" },
    { id: 'C1', name: "C1 - Advanced", image: "/images/book7.jpg", color: "from-violet-600 to-purple-500" },
    { id: 'C2', name: "C2 - Mastery", image: "/images/book8.jpg", color: "from-gray-800 to-slate-900" },
  ];

  // Map subprograms to CEFR levels for filtering
  const filteredResources = useMemo(() => {
    if (!resources) return [];
    return resources.filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
        (r.subject && r.subject.toLowerCase().includes(search.toLowerCase()));
      const matchesType = filterType === "All" || r.type === filterType;
      const matchesLevel = !selectedLevel || (r.subprogram_name && r.subprogram_name.includes(selectedLevel));
      return matchesSearch && matchesType && matchesLevel;
    });
  }, [resources, search, filterType, selectedLevel]);

  const types = useMemo(() => {
    if (!resources) return ["All"];
    const uniqueTypes = [...new Set(resources.map(r => r.type))];
    return ["All", ...uniqueTypes];
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
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="animate-fade-in">
            <h1 className={`text-4xl font-extrabold mb-3 tracking-tight ${isDark ? "text-white" : "text-[#010080]"}`}>
              Curriculum Resources
            </h1>
            <p className={`text-lg font-medium max-w-2xl ${isDark ? "text-blue-200/60" : "text-gray-500"}`}>
              Explore our comprehensive library of digital materials, optimized for your learning proficiency.
            </p>
          </div>

          {selectedLevel && (
            <button
              onClick={() => setSelectedLevel(null)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-[#010080] font-bold text-sm hover:bg-blue-100 transition-all active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Standard View
            </button>
          )}
        </div>

        {/* Level Selection Grid - Only shown when no level is selected or as a horizontal bar */}
        {!selectedLevel ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {levels.map((level, idx) => (
              <div
                key={level.id}
                onClick={() => setSelectedLevel(level.id)}
                className={`group relative h-72 rounded-[2rem] overflow-hidden cursor-pointer shadow-xl transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl border-2 ${isDark ? 'border-gray-800' : 'border-white'}`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${level.color} opacity-90 group-hover:opacity-100 transition-opacity`}></div>

                {/* Book Image */}
                <div className="absolute inset-x-0 bottom-0 top-12 flex items-center justify-center p-4 transition-transform duration-500 group-hover:scale-110">
                  <img
                    src={level.image}
                    alt={level.name}
                    className="h-full object-contain drop-shadow-2xl"
                  />
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                  <div className="flex justify-between items-start">
                    <span className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-black text-lg border border-white/30">
                      {level.id}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-black text-xl leading-tight">
                      {level.name}
                    </h3>
                    <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mt-1">
                      Explore Materials
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Active Level Banner */
          <div className={`relative rounded-3xl overflow-hidden mb-10 h-48 border-2 ${isDark ? 'border-gray-800' : 'border-white'} shadow-2xl`}>
            <div className={`absolute inset-0 bg-gradient-to-r ${levels.find(l => l.id === selectedLevel)?.color} opacity-90`}></div>
            <div className="absolute inset-0 flex items-center justify-between px-10">
              <div className="flex items-center gap-8">
                <div className="w-32 h-32 relative">
                  <img
                    src={levels.find(l => l.id === selectedLevel)?.image}
                    alt={selectedLevel}
                    className="w-full h-full object-contain drop-shadow-2xl animate-float"
                  />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-black tracking-widest uppercase mb-2">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                    Selected Level
                  </div>
                  <h2 className="text-4xl font-black text-white tracking-tight">
                    {levels.find(l => l.id === selectedLevel)?.name}
                  </h2>
                </div>
              </div>
              <div className="hidden lg:block text-right">
                <p className="text-white/60 font-bold text-sm uppercase tracking-widest">Available Resources</p>
                <p className="text-5xl font-black text-white mt-1">{filteredResources.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Controls Bar */}
        <div className={`flex flex-col lg:flex-row gap-5 items-center justify-between p-6 rounded-[2rem] shadow-xl border-2 mb-10 transition-all ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-50'}`}>
          <div className="relative w-full lg:w-96 group">
            <input
              type="text"
              placeholder="Search by title, subject or level..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 transition-all text-sm font-bold focus:ring-4 focus:ring-blue-500/20 outline-none
                ${isDark ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-blue-100 text-[#010080] placeholder-gray-400'}
              `}
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-1 w-full lg:w-auto scrollbar-hide">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-7 py-3 rounded-2xl text-xs font-black whitespace-nowrap transition-all tracking-wider shadow-sm
                  ${filterType === type
                    ? 'bg-[#010080] text-white shadow-blue-900/40 scale-105'
                    : (isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200')}
                `}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        {filteredResources.length === 0 ? (
          <div className={`p-20 rounded-[3rem] shadow-2xl text-center border-4 border-dashed animate-fade-in
            ${isDark ? 'bg-gray-800/40 border-gray-700' : 'bg-white border-blue-100'}`}>
            <div className="w-24 h-24 mx-auto bg-gray-100 dark:bg-gray-700 rounded-3xl flex items-center justify-center mb-8 rotate-3 transition-transform hover:rotate-0">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className={`text-3xl font-black mb-4 ${isDark ? "text-white" : "text-[#010080]"}`}>No Materials Available</h3>
            <p className={`text-lg max-w-lg mx-auto leading-relaxed ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              {selectedLevel
                ? `We haven't uploaded resources for the ${selectedLevel} level yet. Please check back soon or try another level.`
                : "No materials match your search filters. Try clearing some filters or using broad keywords."}
            </p>
            {selectedLevel && (
              <button
                onClick={() => setSelectedLevel(null)}
                className="mt-8 px-8 py-3 bg-blue-50 text-[#010080] font-black rounded-2xl hover:bg-blue-100 transition-all border border-blue-100"
              >
                View Other Levels
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredResources.map((resource, idx) => (
              <div
                key={resource.id}
                className={`group relative rounded-[2.5rem] overflow-hidden shadow-xl transition-all duration-500 border-2 hover:shadow-[0_20px_50px_-15px_rgba(1,0,128,0.2)] hover:-translate-y-2 flex flex-col
                  ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-50'}
                `}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="p-8 flex-1">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="inline-flex items-center px-4 py-1.5 bg-[#010080] text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                          {resource.type}
                        </span>
                        {resource.subprogram_name && (
                          <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${isDark ? 'bg-indigo-900/40 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
                            {resource.subprogram_name}
                          </span>
                        )}
                      </div>
                      <h3 className={`text-2xl font-black leading-tight ${isDark ? "text-white" : "text-[#010080]"} transition-colors group-hover:text-blue-600`}>
                        {resource.title}
                      </h3>
                    </div>
                  </div>

                  <div className={`mb-8 p-5 rounded-3xl ${isDark ? "bg-gray-900/50" : "bg-[#f8fafc]"} border ${isDark ? 'border-gray-700' : 'border-blue-50'}`}>
                    <p className={`text-sm leading-relaxed font-medium ${isDark ? "text-gray-400" : "text-gray-600"} line-clamp-3`}>
                      {resource.description || "Comprehensive course curriculum material provided for this specific level and subject."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isDark ? 'bg-gray-700 text-blue-400' : 'bg-blue-50 text-[#010080]'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Program</p>
                        <p className={`text-xs font-black ${isDark ? 'text-gray-200' : 'text-[#010080]'}`}>{resource.program_name || "General Course"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-8 pb-8 mt-auto">
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/btn relative flex items-center justify-center gap-3 w-full py-5 rounded-2xl font-black text-sm tracking-wider transition-all bg-[#010080] text-white overflow-hidden shadow-lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#010080] via-blue-700 to-[#010080] translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
                    <svg className="w-6 h-6 relative z-10 transition-transform group-hover/btn:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span className="relative z-10">{resource.type === 'Drive' ? 'ENTER GOOGLE DRIVE' : 'DOWNLOAD RESOURCE'}</span>
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
