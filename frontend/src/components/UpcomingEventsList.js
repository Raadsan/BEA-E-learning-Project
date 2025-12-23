"use client";

import React from 'react';

const UpcomingEventsList = () => {
    // Mock data - in real implementation, this would come from announcements API
    const events = [
        {
            id: 1,
            title: "Winter Semester Finals",
            date: "2025-12-28",
            type: "exam",
            description: "Final examinations for all major programs"
        },
        {
            id: 2,
            title: "New Year Celebration",
            date: "2026-01-01",
            type: "event",
            description: "Campus-wide celebration for the New Year"
        },
        {
            id: 3,
            title: "Spring Enrollment Deadline",
            date: "2026-01-05",
            type: "deadline",
            description: "Last day to register for Spring 2026 courses"
        },
        {
            id: 4,
            title: "Advanced AI Workshop",
            date: "2026-01-12",
            type: "training",
            description: "Hands-on workshop on modern AI techniques"
        },
        {
            id: 5,
            title: "Staff Performance Review",
            date: "2026-01-15",
            type: "meeting",
            description: "Annual meeting with the governing board"
        }
    ];

    const getTypeColor = (type) => {
        const colors = {
            exam: 'bg-red-100 text-red-800',
            event: 'bg-blue-100 text-blue-800',
            training: 'bg-purple-100 text-purple-800',
            deadline: 'bg-orange-100 text-orange-800',
            meeting: 'bg-green-100 text-green-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    const getTypeIcon = (type) => {
        const icons = {
            exam: '📝',
            event: '🎉',
            training: '📚',
            deadline: '⏰',
            meeting: '👥'
        };
        return icons[type] || '📌';
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📅 Upcoming Events & News</h3>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {events.map((event) => (
                    <div
                        key={event.id}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{getTypeIcon(event.type)}</span>
                                <div>
                                    <h4 className="font-semibold text-gray-900">{event.title}</h4>
                                    <p className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(event.type)}`}>
                                {event.type}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 ml-10">{event.description}</p>
                    </div>
                ))}
            </div>

            {events.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                    <p>No upcoming events</p>
                </div>
            )}
        </div>
    );
};

export default UpcomingEventsList;
