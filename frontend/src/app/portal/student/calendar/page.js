"use client";

import { useState } from "react";
import StudentHeader from "@/components/StudentHeader";
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
      <>
        <StudentHeader />
        <main className="flex-1 overflow-y-auto bg-gray-50 mt-20">
          <div className="w-full px-8 py-6">
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Loading calendar...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <StudentHeader />

      <main className="flex-1 overflow-y-auto bg-gray-50 mt-20">
        <div className="w-full px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-800">My Class Calendar</h1>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-xl font-semibold text-gray-700">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-3 text-center font-medium text-gray-600 bg-gray-50">
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
                    className={`min-h-[100px] p-2 border border-gray-200 ${
                      date ? 'bg-white' : 'bg-gray-50'
                    } ${isToday ? 'bg-blue-50 border-blue-300' : ''}`}
                  >
                    {date && (
                      <>
                        <div className={`text-sm font-medium mb-1 ${
                          isToday ? 'text-blue-600' : 'text-gray-700'
                        }`}>
                          {date.getDate()}
                        </div>
                        {hasSchedules && (
                          <div className="space-y-1">
                            {daySchedules.map(schedule => (
                              <div key={schedule.id} className="text-xs bg-green-100 text-green-800 p-1 rounded">
                                <div className="font-medium">{schedule.class_name}</div>
                                <div className="text-xs opacity-75">{schedule.subprogram_name}</div>
                                {schedule.zoom_link && (
                                  <a
                                    href={schedule.zoom_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline text-xs"
                                  >
                                    Join Zoom
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
            <div className="mt-6 flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-50 border border-blue-300 rounded"></div>
                <span>Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 rounded"></div>
                <span>Class Schedule</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}