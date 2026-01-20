"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useDarkMode } from "@/context/ThemeContext";
import { useToast } from "@/components/Toast";
import Modal from "@/components/Modal";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useGetSubprogramsQuery } from "@/redux/api/subprogramApi";
import {
    useGetAcademicCalendarQuery,
    useCreateCalendarEntryMutation,
    useUpdateCalendarEntryMutation,
    useDeleteCalendarEntryMutation,
} from "@/redux/api/academicCalendarApi";

export default function WeeklyScheduleView() {
    const { isDark } = useDarkMode();
    const { showToast } = useToast();

    const [selectedProgram, setSelectedProgram] = useState("");
    const [selectedSubprogram, setSelectedSubprogram] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [selectedCell, setSelectedCell] = useState(null);

    // Calendar selection state
    const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
    const currentYear = new Date().getFullYear();
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);

    // Form data for activity
    const [formData, setFormData] = useState({
        week_number: 1,
        day: "Saturday",
        activity_title: "",
        activity_description: ""
    });

    // Queries
    const { data: programs = [], isLoading: programsLoading } = useGetProgramsQuery();
    const { data: allSubprograms = [], isLoading: subprogramsLoading } = useGetSubprogramsQuery();

    const { data: calendarData = [], isLoading: calendarLoading } = useGetAcademicCalendarQuery(
        { subprogramId: selectedSubprogram, month: selectedMonth, year: selectedYear },
        { skip: !selectedSubprogram }
    );

    // Mutations
    const [createEntry, { isLoading: isCreating }] = useCreateCalendarEntryMutation();
    const [updateEntry, { isLoading: isUpdating }] = useUpdateCalendarEntryMutation();
    const [deleteEntry, { isLoading: isDeleting }] = useDeleteCalendarEntryMutation();

    // Filter subprograms based on selected program
    const subprograms = selectedProgram
        ? allSubprograms.filter(sp => sp.program_id === parseInt(selectedProgram))
        : [];

    // Configuration
    const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"];
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const years = [2025, 2026, 2027, 2028, 2029, 2030];

    // Standard 4 weeks for academic display
    const weeks = [1, 2, 3, 4];

    // Build calendar grid data structure
    const calendarGrid = useMemo(() => {
        const grid = {};
        weeks.forEach(week => {
            grid[week] = {};
            days.forEach(day => {
                grid[week][day] = null;
            });
        });

        // Populate with actual data
        calendarData.forEach(entry => {
            if (grid[entry.week_number] && grid[entry.week_number][entry.day] !== undefined) {
                grid[entry.week_number][entry.day] = entry;
            }
        });

        return grid;
    }, [calendarData, weeks, days]);

    const handleProgramChange = (e) => {
        setSelectedProgram(e.target.value);
        setSelectedSubprogram("");
    };

    const handleCellClick = (week, day) => {
        const existingEntry = calendarGrid[week][day];

        if (existingEntry) {
            // Edit existing entry
            setEditingEntry(existingEntry);
            setFormData({
                week_number: existingEntry.week_number,
                day: existingEntry.day,
                activity_title: existingEntry.activity_title,
                activity_description: existingEntry.activity_description || ""
            });
        } else {
            // Create new entry
            setEditingEntry(null);
            setFormData({
                week_number: week,
                day: day,
                activity_title: "",
                activity_description: ""
            });
        }

        setSelectedCell({ week, day });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingEntry) {
                // Update existing entry
                await updateEntry({
                    id: editingEntry.id,
                    ...formData,
                    subprogram_id: parseInt(selectedSubprogram),
                    program_id: parseInt(selectedProgram),
                    month: selectedMonth,
                    year: selectedYear
                }).unwrap();
                showToast("Activity updated successfully", "success");
            } else {
                // Create new entry
                await createEntry({
                    ...formData,
                    program_id: parseInt(selectedProgram),
                    subprogram_id: parseInt(selectedSubprogram),
                    month: selectedMonth,
                    year: selectedYear
                }).unwrap();
                showToast("Activity created successfully", "success");
            }

            setIsModalOpen(false);
            setFormData({
                week_number: 1,
                day: "Saturday",
                activity_title: "",
                activity_description: ""
            });
        } catch (error) {
            console.error("Error saving activity:", error);
            showToast(error?.data?.error || "Failed to save activity", "error");
        }
    };

    const handleDelete = async () => {
        if (!editingEntry) return;

        try {
            await deleteEntry({
                id: editingEntry.id,
                subprogram_id: parseInt(selectedSubprogram)
            }).unwrap();
            showToast("Activity deleted successfully", "success");
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error deleting activity:", error);
            showToast("Failed to delete activity", "error");
        }
    };

    const getActivityColor = () => {
        return "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
    };

    return (
        <div className="space-y-8">
            {/* Calendar Header matching user image */}
            {selectedSubprogram && (
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Schedule for {selectedMonth} {selectedYear}
                    </h2>

                    <div className="flex items-center gap-2">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className={`px-3 py-2 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/10 ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-700'}`}
                        >
                            {months.map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className={`px-3 py-2 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/10 ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-700'}`}
                        >
                            {years.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>

                        <Link
                            href="/portal/admin/learning-resources/timetable/create"
                            className={`ml-4 px-4 py-2 ${isDark ? 'bg-white hover:bg-gray-100 text-gray-900' : 'bg-[#010080] hover:bg-[#010080]/90 text-white'} font-semibold rounded-xl transition-all active:scale-95 flex items-center gap-2 text-sm`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Create
                        </Link>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className={`mb-8 p-6 rounded-2xl border transition-all ${isDark ? 'bg-gray-800 border-gray-700 shadow-lg shadow-black/20' : 'bg-white border-gray-200 shadow-sm'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Select Program <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedProgram}
                            onChange={handleProgramChange}
                            className={`w-full px-4 py-3 border rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        >
                            <option value="">-- Select a Program --</option>
                            {programs.map((program) => (
                                <option key={program.id} value={program.id}>{program.title}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Select Course <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedSubprogram}
                            onChange={(e) => setSelectedSubprogram(e.target.value)}
                            className={`w-full px-4 py-3 border rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} ${!selectedProgram ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={!selectedProgram}
                        >
                            <option value="">-- Select a Course --</option>
                            {subprograms.map((subprogram) => (
                                <option key={subprogram.id} value={subprogram.id}>{subprogram.subprogram_name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Calendar Table */}
            {selectedSubprogram ? (
                <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                    <th className={`px-4 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'} border-r ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                                        Weeks
                                    </th>
                                    {days.map(day => (
                                        <th key={day} className={`px-4 py-4 text-center text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'} border-r last:border-r-0 ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                                            {day}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {weeks.map(week => (
                                    <tr key={week} className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                        <td className={`px-4 py-3 font-bold text-sm ${isDark ? 'text-gray-200 bg-gray-700' : 'text-gray-700 bg-gray-50'} border-r ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                                            Week {week}
                                        </td>
                                        {days.map(day => {
                                            const entry = calendarGrid[week][day];
                                            return (
                                                <td
                                                    key={day}
                                                    onClick={() => handleCellClick(week, day)}
                                                    className={`px-3 py-3 text-sm border-r last:border-r-0 ${isDark ? 'border-gray-700' : 'border-gray-200'} cursor-pointer hover:opacity-80 transition-opacity min-h-[80px] align-top`}
                                                >
                                                    {entry ? (
                                                        <div className={`p-3 rounded-lg border-2 h-full min-h-[60px] ${getActivityColor()}`}>
                                                            <div className="text-xs font-bold opacity-90 line-clamp-3">{entry.activity_title}</div>
                                                        </div>
                                                    ) : (
                                                        <div className={`p-3 rounded-lg border-2 border-dashed h-full min-h-[60px] flex items-center justify-center ${isDark ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'} transition-all`}>
                                                            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>+ Add</span>
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className={`p-20 text-center rounded-3xl border-2 border-dashed transition-all ${isDark ? 'bg-gray-800/30 border-gray-700' : 'bg-gray-50 border-gray-300'}`}>
                    <div className="max-w-xs mx-auto">
                        <div className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <svg className={`w-8 h-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>No Course Selected</h3>
                        <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Choose a program and course above to manage the weekly schedule.</p>
                    </div>
                </div>
            )}

            {/* Activity Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingEntry ? "Edit Activity" : "Add Activity"}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Week and Day (read-only display) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-sm font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Week
                            </label>
                            <input
                                type="text"
                                value={`Week ${formData.week_number}`}
                                readOnly
                                className={`w-full px-4 py-3 border rounded-xl ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-700'} cursor-not-allowed`}
                            />
                        </div>
                        <div>
                            <label className={`block text-sm font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Day
                            </label>
                            <input
                                type="text"
                                value={formData.day}
                                readOnly
                                className={`w-full px-4 py-3 border rounded-xl ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-700'} cursor-not-allowed`}
                            />
                        </div>
                    </div>


                    {/* Activity Title */}
                    <div>
                        <label className={`block text-sm font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Activity Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.activity_title}
                            onChange={(e) => setFormData({ ...formData, activity_title: e.target.value })}
                            required
                            placeholder="E.g., Introduction to Grammar..."
                            className={`w-full px-4 py-2 border rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/10 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        />
                    </div>

                    {/* Activity Description (Optional) */}
                    <div>
                        <label className={`block text-sm font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Description (Optional)
                        </label>
                        <textarea
                            value={formData.activity_description}
                            onChange={(e) => setFormData({ ...formData, activity_description: e.target.value })}
                            rows={3}
                            placeholder="Additional notes or details about this activity..."
                            className={`w-full px-4 py-3 border rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div>
                            {editingEntry && (
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isDeleting ? "Deleting..." : "Delete"}
                                </button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className={`px-4 py-2.5 rounded-xl transition-colors font-semibold ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isCreating || isUpdating}
                                className={`px-6 py-2.5 ${isDark ? 'bg-white hover:bg-gray-100 text-gray-900' : 'bg-[#010080] hover:bg-[#010080]/90 text-white'} font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50`}
                            >
                                {isCreating || isUpdating ? "Saving..." : (editingEntry ? "Update" : "Add Activity")}
                            </button>
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
