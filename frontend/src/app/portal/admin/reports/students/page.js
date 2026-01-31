"use client";

import { useDarkMode } from "@/context/ThemeContext";
import {
    useGetStudentStatsQuery,
    useGetProgramDistributionQuery,
    useGetSubprogramDistributionQuery,
    useGetPerformanceOverviewQuery
} from "@/redux/api/reportApi";
import { useGetTopStudentsQuery } from "@/redux/api/studentApi";
import { useMemo } from "react";

export default function StudentReportsPage() {
    const { isDark } = useDarkMode();

    // Fetch pre-aggregated data from backend
    const { data: stats = {}, isLoading: statsLoading } = useGetStudentStatsQuery();
    const { data: programData = [], isLoading: programsLoading } = useGetProgramDistributionQuery();
    const { data: subprogramData = [], isLoading: levelsLoading } = useGetSubprogramDistributionQuery();
    const { data: performance = {}, isLoading: perfLoading } = useGetPerformanceOverviewQuery();

    // Fetch top students
    const { data: topStudentsData = [] } = useGetTopStudentsQuery({ limit: 5 });
    const topStudents = (topStudentsData.students || []).map(s => ({
        id: s.student_id,
        name: s.full_name,
        level: s.chosen_subprogram || s.subprogram_name || 'N/A',
        score: Math.round(s.average_score || 0),
        assignments: s.total_submissions || 0
    }));

    const maxProgramStudents = Math.max(...programData.map(p => p.students), 1);
    const maxSubStudents = Math.max(...subprogramData.map(p => p.students), 1);

    const topRatedByLevel = [
        { level: "Level 8", student: "Ahmed Mohamed Ali", rating: 5.0, reviews: 12 },
        { level: "Level 7", student: "Fatima Hassan Omar", rating: 4.9, reviews: 10 },
        { level: "IELTS Prep", student: "Mohamed Abdi Yusuf", rating: 4.9, reviews: 11 },
        { level: "Level 6", student: "Amina Ibrahim Said", rating: 4.8, reviews: 9 },
        { level: "Business 3", student: "Hassan Ali Mohamed", rating: 4.8, reviews: 8 }
    ];

    return (
        <div className={`flex-1 min-w-0 flex flex-col px-4 sm:px-8 py-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-[1600px] mx-auto w-full space-y-10">
                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className={`text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Regional Analytics
                    </h1>
                    <p className={`text-base font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Comprehensive distribution analysis across programs, levels, and performance metrics
                    </p>
                </div>

                {/* Summary Boxes - matches reference image (Icon Top Left) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Students */}
                    <div className={`p-6 rounded-2xl border transition-all hover:shadow-lg ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
                        <div className="flex flex-col gap-5">
                            <div className="p-2.5 w-fit bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className={`text-3xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {statsLoading ? '...' : (stats.totalStudents || 0).toLocaleString()}
                                </p>
                                <p className="text-sm font-bold mt-1 text-gray-400 uppercase tracking-wide">Total Students</p>
                            </div>
                        </div>
                    </div>

                    {/* Total Programs */}
                    <div className={`p-6 rounded-2xl border transition-all hover:shadow-lg ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
                        <div className="flex flex-col gap-5">
                            <div className="p-2.5 w-fit bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className={`text-3xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {statsLoading ? '...' : (stats.totalPrograms || 0)}
                                </p>
                                <p className="text-sm font-bold mt-1 text-gray-400 uppercase tracking-wide">Active Programs</p>
                            </div>
                        </div>
                    </div>

                    {/* Total Levels */}
                    <div className={`p-6 rounded-2xl border transition-all hover:shadow-lg ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
                        <div className="flex flex-col gap-5">
                            <div className="p-2.5 w-fit bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div>
                                <p className={`text-3xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {statsLoading ? '...' : (subprogramData.length || 0)}
                                </p>
                                <p className="text-sm font-bold mt-1 text-gray-400 uppercase tracking-wide">Total Facilities</p>
                            </div>
                        </div>
                    </div>

                    {/* Avg Student Ratio */}
                    <div className={`p-6 rounded-2xl border transition-all hover:shadow-lg ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
                        <div className="flex flex-col gap-5">
                            <div className="p-2.5 w-fit bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                </svg>
                            </div>
                            <div>
                                <p className={`text-3xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {statsLoading ? '...' : Math.round((stats.totalStudents || 0) / (stats.totalPrograms || 1))}
                                </p>
                                <p className="text-sm font-bold mt-1 text-gray-400 uppercase tracking-wide">Avg Births/Region</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Distribution Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Students per Program */}
                    <div className={`p-8 rounded-2xl border shadow-sm ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'}`}>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex flex-col gap-1">
                                <h3 className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Regional Facility Distribution
                                </h3>
                                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Number of health centers per state
                                </p>
                            </div>
                            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="overflow-x-auto pb-4 custom-scrollbar">
                            {programsLoading ? (
                                <div className="h-80 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : programData.length > 0 ? (
                                <div className="flex items-end justify-start gap-8 h-80 min-w-max px-2">
                                    {programData.map((program, index) => (
                                        <div key={index} className="flex-none w-20 flex flex-col items-center gap-4 group">
                                            <div className="w-full flex-1 flex flex-col items-center justify-end relative">
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {program.students}
                                                </div>
                                                <div
                                                    className="w-full bg-[#10B981] rounded-lg transition-all duration-300 hover:opacity-80 cursor-pointer shadow-sm"
                                                    style={{ height: `${(program.students / maxProgramStudents) * 100}%`, minHeight: '8px' }}
                                                ></div>
                                            </div>
                                            <span className={`text-[10px] font-bold text-center w-full truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`} title={program.name}>
                                                {program.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-80 flex items-center justify-center text-gray-400 italic">
                                    No enrollment data available
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Students per Level */}
                    <div className={`p-8 rounded-2xl border shadow-sm ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'}`}>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex flex-col gap-1">
                                <h3 className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Detailed Level Breakdown
                                </h3>
                                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Distribution across specific subprograms
                                </p>
                            </div>
                            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                        </div>
                        <div className="overflow-x-auto pb-4 custom-scrollbar">
                            {levelsLoading ? (
                                <div className="h-80 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                                </div>
                            ) : subprogramData.length > 0 ? (
                                <div className="flex items-end justify-start gap-8 h-80 min-w-max px-2">
                                    {subprogramData.map((sub, index) => (
                                        <div key={index} className="flex-none w-20 flex flex-col items-center gap-4 group">
                                            <div className="w-full flex-1 flex flex-col items-center justify-end relative">
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {sub.students}
                                                </div>
                                                <div
                                                    className="w-full bg-[#10B981] rounded-lg transition-all duration-300 hover:opacity-80 cursor-pointer shadow-sm"
                                                    style={{ height: `${(sub.students / maxSubStudents) * 100}%`, minHeight: '8px' }}
                                                ></div>
                                            </div>
                                            <span className={`text-[10px] font-bold text-center w-full truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`} title={sub.name}>
                                                {sub.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-80 flex items-center justify-center text-gray-400 italic">
                                    No level distribution data
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Performance & Top Students */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Performance Overview - matches 'Gender Demographics' style */}
                    <div className={`p-8 rounded-2xl border shadow-sm ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'}`}>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex flex-col gap-1">
                                <h3 className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Success Demographics
                                </h3>
                                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Performance breakdown by achievement level
                                </p>
                            </div>
                            <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                        </div>
                        {perfLoading ? (
                            <div className="h-64 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row items-center justify-around gap-12 py-4">
                                {/* Pie Chart */}
                                <div className="relative w-56 h-56">
                                    <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                                        <circle cx="50" cy="50" r="40" fill="none" stroke={isDark ? "#374151" : "#F3F4F6"} strokeWidth="20" />
                                        <circle
                                            cx="50" cy="50" r="40" fill="none" stroke="#10B981" strokeWidth="20"
                                            strokeDasharray={`${(performance.excellent_percent / 100) * 251} 251`}
                                            strokeDashoffset="0"
                                            className="transition-all duration-1000 ease-in-out"
                                        />
                                        <circle
                                            cx="50" cy="50" r="40" fill="none" stroke="#3B82F6" strokeWidth="20"
                                            strokeDasharray={`${(performance.below_80_percent / 100) * 251} 251`}
                                            strokeDashoffset={`-${(performance.excellent_percent / 100) * 251}`}
                                            className="transition-all duration-1000 ease-in-out"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <p className={`text-4xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {performance.excellent_percent}%
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Legend - matches reference dot style */}
                                <div className="space-y-6 w-full sm:w-auto">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                                        <div>
                                            <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{performance.excellent_percent}%</p>
                                            <p className={`text-[11px] font-bold text-gray-400 uppercase tracking-wider`}>Excellent (80%+)</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                                        <div>
                                            <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{performance.below_80_percent}%</p>
                                            <p className={`text-[11px] font-bold text-gray-400 uppercase tracking-wider`}>Average Grade</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Top Students Table */}
                    <div className={`p-8 rounded-2xl border shadow-sm ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'}`}>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex flex-col gap-1">
                                <h3 className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Top Performers
                                </h3>
                                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Highest achieving students this month
                                </p>
                            </div>
                            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            </div>
                        </div>
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full">
                                <thead>
                                    <tr className={`border-b border-dashed ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                                        <th className={`text-left pb-4 px-2 text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Candidate</th>
                                        <th className={`text-left pb-4 px-2 text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Program Level</th>
                                        <th className={`text-center pb-4 px-2 text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Grade</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-dashed divide-gray-100/10 dark:divide-gray-700/50">
                                    {topStudents.map((s, i) => (
                                        <tr key={i} className="group hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="py-4 px-2">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${i === 0 ? 'bg-amber-100 text-amber-700' :
                                                        i === 1 ? 'bg-slate-200 text-slate-700' :
                                                            i === 2 ? 'bg-orange-100 text-orange-700' :
                                                                'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {s.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{s.name}</p>
                                                        <p className="text-[9px] font-medium text-gray-400">{s.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-2">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                    {s.level}
                                                </span>
                                            </td>
                                            <td className="py-4 px-2 text-center">
                                                <div className="inline-flex items-center justify-center px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-black border border-emerald-100 dark:border-emerald-800/30">
                                                    {s.score}%
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Secondary Analytics */}
                <div className={`p-8 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex flex-col gap-1">
                            <h3 className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                High Satisfaction Student Reviews
                            </h3>
                            <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Students with the highest feedback ratings per level
                            </p>
                        </div>
                        <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {topRatedByLevel.map((item, index) => (
                            <div key={index} className={`p-5 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-md ${isDark ? 'bg-gray-900/40 border-gray-700' : 'bg-gray-50/50 border-gray-100'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600">
                                        {item.level}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <svg className="w-2.5 h-2.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <span className={`text-[10px] font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.rating}</span>
                                    </div>
                                </div>
                                <p className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.student}</p>
                                <p className="text-[9px] mt-1 text-gray-400 font-bold uppercase tracking-tighter">{item.reviews} verified reviews</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
