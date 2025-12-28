"use client";

import { useState, useEffect } from "react";
import StudentHeader from "../StudentHeader";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetNewsQuery } from "@/redux/api/newsApi";

export default function StudentNewsPage() {
    const { isDark } = useDarkMode();
    // Fetch active news (default)
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

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'} transition-colors duration-200`}>
            <StudentHeader />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">News & Events</h1>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : isError ? (
                    <div className="text-center p-8 bg-red-100 text-red-700 rounded-lg">
                        <p>Failed to load news. Please try again later.</p>
                    </div>
                ) : newsList?.length === 0 ? (
                    <div className={`text-center p-12 rounded-lg border-2 border-dashed ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium">No news or events</h3>
                        <p className="mt-1 text-sm text-gray-500">You're all caught up!</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {newsList.map((item) => {
                            const isRead = readIds.includes(item.id);
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => handleMarkAsRead(item.id)}
                                    className={`relative p-6 rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md cursor-pointer
                    ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
                    ${!isRead ? 'border-l-4 border-l-blue-500' : ''}
                  `}
                                >
                                    {!isRead && (
                                        <span className="absolute top-4 right-4 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium dark:bg-blue-900/30 dark:text-blue-300">
                                            New
                                        </span>
                                    )}

                                    <div className="flex items-center gap-2 mb-3 text-sm text-gray-500 dark:text-gray-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span>{new Date(item.event_date).toLocaleDateString()}</span>
                                        <span className="mx-2">•</span>
                                        <span className={`capitalize font-medium ${item.type === 'exam' ? 'text-red-500' :
                                                item.type === 'deadline' ? 'text-orange-500' :
                                                    item.type === 'event' ? 'text-purple-500' :
                                                        item.type === 'training' ? 'text-blue-500' :
                                                            'text-gray-500'
                                            }`}>{item.type}</span>
                                    </div>

                                    <h3 className={`text-lg font-bold mb-2 ${isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                                        {item.title}
                                    </h3>

                                    <p className={`text-sm line-clamp-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {item.description}
                                    </p>

                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                        <span className="text-xs text-gray-400 italic">
                                            {/* Posted by Admin? We don't have that info yet but that's fine */}
                                        </span>
                                        {!isRead && (
                                            <span className="text-xs text-blue-600 font-medium hover:underline">Mark as Read</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
