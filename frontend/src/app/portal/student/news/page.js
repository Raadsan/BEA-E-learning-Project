"use client";

import { useState, useEffect } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetNewsQuery } from "@/redux/api/newsApi";

export default function StudentNewsPage() {
    const { isDark } = useDarkMode();
    const { data: newsList, isLoading, isError } = useGetNewsQuery();
    const [readIds, setReadIds] = useState([]);

    // Load read IDs from local storage on mount
    useEffect(() => {
        const stored = localStorage.getItem("student_read_news");
        if (stored) {
            setReadIds(JSON.parse(stored));
        }
    }, []);

    const handleMarkAsRead = (id) => {
        if (!readIds.includes(id)) {
            const newIds = [...readIds, id];
            setReadIds(newIds);
            localStorage.setItem("student_read_news", JSON.stringify(newIds));
        }
    };

    const getCategoryColor = (type, isDark) => {
        const colors = {
            exam: isDark ? 'bg-red-600/20 text-red-400' : 'bg-red-100 text-red-700',
            deadline: isDark ? 'bg-orange-600/20 text-orange-400' : 'bg-orange-100 text-orange-700',
            event: isDark ? 'bg-purple-600/20 text-purple-400' : 'bg-purple-100 text-purple-700',
            training: isDark ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-700',
            default: isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
        };
        return colors[type] || colors.default;
    };

    const bg = isDark ? "bg-gray-900" : "bg-gray-50";

    return (
        <div className={`min-h-screen transition-colors pt-12 w-full px-6 sm:px-10 pb-20 ${bg}`}>
            <div className="w-full">
                {/* Header Section */}
                <div className="mb-12">
                    <h1 className={`text-4xl font-bold mb-4 tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                        Events & News
                    </h1>
                    <p className={`text-lg font-medium opacity-60 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        Stay updated with the latest happenings, exams, and deadlines.
                    </p>
                </div>

                {isLoading ? (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className={`h-64 rounded-2xl animate-pulse ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                        ))}
                    </div>
                ) : isError ? (
                    <div className={`p-8 rounded-2xl text-center border ${isDark ? "bg-red-900/20 border-red-500/50" : "bg-red-50 border-red-100"}`}>
                        <span className="text-red-500 font-medium">Failed to load news. Please try again later.</span>
                    </div>
                ) : newsList?.length === 0 ? (
                    <div className={`p-12 rounded-2xl text-center border-2 border-dashed ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
                        <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${isDark ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-400"}`}>
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                        </div>
                        <h3 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>All caught up!</h3>
                        <p className={isDark ? "text-gray-400" : "text-gray-500"}>No new events or news items to display.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {newsList.map((item, index) => {
                            const isRead = readIds.includes(item.id);
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => handleMarkAsRead(item.id)}
                                    className={`group relative rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer 
                                        ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}
                                        ${!isRead ? 'ring-2 ring-blue-500/20' : ''}
                                    `}
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    {/* New Badge */}
                                    {!isRead && (
                                        <span className={`absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded-full text-white bg-blue-600 shadow-lg shadow-blue-600/30 z-10`}>
                                            NEW
                                        </span>
                                    )}

                                    {/* Category & Date */}
                                    <div className="flex flex-wrap items-center gap-2 mb-4">
                                        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${getCategoryColor(item.type, isDark)}`}>
                                            {item.type || 'News'}
                                        </span>
                                        <span className={`text-xs font-medium flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {new Date(item.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <h3 className={`text-xl font-bold mb-3 line-clamp-2 ${isDark ? 'text-white group-hover:text-blue-400' : 'text-gray-900 group-hover:text-blue-600'} transition-colors`}>
                                        {item.title}
                                    </h3>

                                    <p className={`text-sm mb-6 line-clamp-3 leading-relaxed ${isDark ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-600 group-hover:text-gray-700'} transition-colors`}>
                                        {item.description}
                                    </p>

                                    {/* Action Footer */}
                                    <div className={`mt-auto pt-4 border-t flex items-center justify-between ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                                        <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                            Posted by Admin
                                        </span>
                                        <button className={`text-sm font-semibold flex items-center gap-1 transition-colors ${isDark ? 'text-blue-400 group-hover:text-blue-300' : 'text-[#010080] group-hover:text-blue-700'}`}>
                                            {!isRead ? "Mark as Read" : "Read Again"}
                                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                            </svg>
                                        </button>
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
