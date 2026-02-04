"use client";

import React from 'react';
import { useGetNewsQuery } from "@/redux/api/newsApi";
import { useDarkMode } from "@/context/ThemeContext";

const UpcomingEventsList = () => {
    const { isDark } = useDarkMode();
    const { data: newsList, isLoading, isError } = useGetNewsQuery();

    const getTypeColor = (type) => {
        const colors = {
            exam: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
            event: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            training: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
            deadline: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
            meeting: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            news: 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300'
        };
        return colors[type] || colors['news'];
    };

    const getTypeIcon = (type) => {
        const icons = {
            exam: '📝',
            event: '🎉',
            training: '📚',
            deadline: '⏰',
            meeting: '👥',
            news: '📰'
        };
        return icons[type] || '📌';
    };

    // Sort by date (nearest first)
    const sortedEvents = Array.isArray(newsList)
        ? [...newsList]
            .filter(item => item.status === 'active') // Only show active
            .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
        : [];

    return (
        <div className={`p-6 rounded-xl shadow-md border flex flex-col h-[500px] ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#010080]'}`}>
                <span>📅</span> Upcoming Events & News
            </h3>

            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#010080]"></div>
                </div>
            ) : isError ? (
                <div className="flex-1 flex items-center justify-center text-red-500">
                    Failed to load events
                </div>
            ) : sortedEvents.length === 0 ? (
                <div className={`flex-1 flex flex-col items-center justify-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <span className="text-4xl mb-2">📭</span>
                    <p>No upcoming events</p>
                </div>
            ) : (
                <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                    {sortedEvents.map((event) => (
                        <div
                            key={event.id}
                            className={`p-4 border rounded-lg transition-all hover:shadow-md cursor-pointer ${isDark ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{getTypeIcon(event.type)}</span>
                                    <div>
                                        <h4 className={`font-semibold text-sm leading-tight ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                                            {event.title}
                                        </h4>
                                        <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {new Date(event.event_date).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${getTypeColor(event.type)}`}>
                                    {event.type}
                                </span>
                            </div>
                            <p className={`text-sm ml-10 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {event.description}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UpcomingEventsList;
