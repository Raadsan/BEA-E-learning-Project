"use client";

import { useState, useEffect } from "react";
import TeacherHeader from "../TeacherHeader";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetTeacherAnnouncementsQuery } from "@/redux/api/announcementApi";

export default function TeacherAnnouncementsPage() {
    const { isDark } = useDarkMode();
    const { data: announcements, isLoading, isError } = useGetTeacherAnnouncementsQuery();
    const [readIds, setReadIds] = useState([]);

    // Load read IDs from local storage on mount
    useEffect(() => {
        const stored = localStorage.getItem("teacher_read_announcements");
        if (stored) {
            setReadIds(JSON.parse(stored));
        }
    }, []);

    // Mark all as read when page is visited? Or individually?
    // Let's mark individual when clicked/expanded if we have detail view.
    // For now, let's just list them. "Unread" status is visual.

    const handleMarkAsRead = (id) => {
        if (!readIds.includes(id)) {
            const newIds = [...readIds, id];
            setReadIds(newIds);
            localStorage.setItem("teacher_read_announcements", JSON.stringify(newIds));
            // Trigger a storage event for Header to update if it listens, 
            // but Redux cache update doesn't help with local storage synch across components automatically 
            // unless we use a context or global state for "read status".
            // Custom event dispatch for Header to catch
            window.dispatchEvent(new Event("announcementReadUpdate"));
        }
    };

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'} transition-colors duration-200`}>
            <TeacherHeader />
            <main className="w-full px-8 py-6 pt-24">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">My Announcements</h1>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : isError ? (
                    <div className="text-center p-8 bg-red-100 text-red-700 rounded-lg">
                        <p>Failed to load announcements. Please try again later.</p>
                    </div>
                ) : announcements?.length === 0 ? (
                    <div className={`text-center p-12 rounded-lg border-2 border-dashed ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium">No announcements</h3>
                        <p className="mt-1 text-sm text-gray-500">You're all caught up!</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {announcements.map((announcement) => {
                            const isRead = readIds.includes(announcement.id);
                            return (
                                <div
                                    key={announcement.id}
                                    onClick={() => handleMarkAsRead(announcement.id)}
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
                                        <span>{new Date(announcement.publish_date).toLocaleDateString()}</span>
                                    </div>

                                    <h3 className={`text-lg font-bold mb-2 ${isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                                        {announcement.title}
                                    </h3>

                                    <p className={`text-sm line-clamp-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {announcement.content}
                                    </p>

                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                        <span className="text-xs text-gray-400 italic">
                                            {announcement.target_audience}
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
