"use client";

import { useState } from "react";
import { useGetStudentSchedulesQuery } from "@/redux/api/classApi";
import { useDarkMode } from "@/context/ThemeContext";

export default function StudentCalendarPage() {
  const { isDark } = useDarkMode();
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: schedules = [], isLoading } = useGetStudentSchedulesQuery();

  // Get days in current month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const days = getDaysInMonth(currentDate);

  // Get schedules for current month
  const getSchedulesForDate = (date) => {
    if (!date) return [];
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.schedule_date);
      return scheduleDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  if (isLoading) {
    return (
      <div className={`min-h-screen transition-colors pt-12 w-full px-6 sm:px-10 pb-20 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>Loading calendar...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors pt-12 w-full px-6 sm:px-10 pb-20 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="w-full">
        <div className="mb-12">
          <h1 className={`text-4xl font-bold mb-4 tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
            My Class Calendar
          </h1>
          <p className={`text-lg font-medium opacity-60 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Track your class schedules and important academic events.
          </p>
        </div>

        <div className={`rounded-2xl shadow-sm border p-8 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <div className="flex items-center justify-between mb-8">
            <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateMonth(-1)}
                className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-600"}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-600"}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className={`p-4 text-center font-bold text-xs uppercase tracking-wider ${isDark ? "bg-gray-900 text-gray-400" : "bg-gray-50 text-gray-500"}`}>
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {days.map((date, index) => {
              const daySchedules = getSchedulesForDate(date);
              const isToday = date && date.toDateString() === new Date().toDateString();
              const hasSchedules = daySchedules.length > 0;

              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-3 transition-colors ${date ? (isDark ? 'bg-gray-800' : 'bg-white') : (isDark ? 'bg-gray-900/50' : 'bg-gray-50')
                    } ${isToday ? (isDark ? 'bg-blue-900/20' : 'bg-blue-50') : ''}`}
                >
                  {date && (
                    <>
                      <div className={`text-sm font-bold mb-2 ${isToday ? 'text-blue-600 dark:text-blue-400' : (isDark ? 'text-gray-400' : 'text-gray-700')
                        }`}>
                        {date.getDate()}
                      </div>
                      {hasSchedules && (
                        <div className="space-y-1">
                          {daySchedules.map(schedule => (
                            <div key={schedule.id} className={`text-[10px] p-1.5 rounded-lg border ${isDark ? 'bg-blue-900/30 border-blue-800 text-blue-300' : 'bg-blue-50 border-blue-100 text-blue-700'
                              }`}>
                              <div className="font-bold truncate">{schedule.class_name}</div>
                              {schedule.zoom_link && (
                                <a
                                  href={schedule.zoom_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline font-medium block mt-1"
                                >
                                  Join Session
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-8 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isDark ? "bg-blue-500" : "bg-blue-600"}`}></div>
              <span className={isDark ? "text-gray-400" : "text-gray-600 font-medium"}>Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isDark ? "bg-blue-900/40" : "bg-blue-100"}`}></div>
              <span className={isDark ? "text-gray-400" : "text-gray-600 font-medium"}>Class Schedule</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}