"use client";

import { useState } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import Link from "next/link";

// Import both views
import TimeBasedView from "./TimeBasedView";
import WeeklyScheduleView from "./weekly-schedule";

export default function TimetablePage() {
    const { isDark } = useDarkMode();

    return (
        <main className={`flex-1 overflow-y-auto transition-colors ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="w-full px-8 py-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className={`text-3xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Academic Timetable
                        </h1>
                        <p className={`text-base font-normal ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Manage monthly course activities and academic schedules
                        </p>
                    </div>
                </div>

                {/* Render Monthly View */}
                <WeeklyScheduleView />
            </div>
        </main>
    );
}
