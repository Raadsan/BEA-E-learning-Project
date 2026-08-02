"use client";

import { useDarkMode } from "@/context/ThemeContext";
import { usePagePermissions } from "@/hooks/usePagePermissions";

// Import both views
import WeeklyScheduleView from "@/components/admin/timetable/weekly-schedule";

export default function TimetablePage() {
    const { isDark } = useDarkMode();
    const { canView, canAdd, canEdit, canDelete } = usePagePermissions("class_management", "timetable");

    return (
        <main className={`flex-1 overflow-y-auto transition-colors ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="w-full px-8 py-6">
                {/* Academic timetable content */}
                <WeeklyScheduleView canView={canView} canAdd={canAdd} canEdit={canEdit} canDelete={canDelete} />
            </div>
        </main>
    );
}
