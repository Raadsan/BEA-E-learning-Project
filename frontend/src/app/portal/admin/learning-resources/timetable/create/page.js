"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDarkMode } from "@/context/ThemeContext";
import { useToast } from "@/components/Toast";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useGetSubprogramsQuery } from "@/redux/api/subprogramApi";
import { useBulkCreateCalendarEntriesMutation } from "@/redux/api/academicCalendarApi";

export default function CreateSchedulePage() {
    const router = useRouter();
    const { isDark } = useDarkMode();
    const { showToast } = useToast();

    const [selectedProgram, setSelectedProgram] = useState("");
    const [selectedSubprogram, setSelectedSubprogram] = useState("");
    const [numberOfMonths, setNumberOfMonths] = useState(1);

    // Calendar selection for creation
    const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
    const currentYear = new Date().getFullYear();
    const [creationMonth, setCreationMonth] = useState(currentMonth);
    const [creationYear, setCreationYear] = useState(currentYear);

    // Queries
    const { data: programs = [] } = useGetProgramsQuery();
    const { data: allSubprograms = [] } = useGetSubprogramsQuery();
    const [bulkCreate, { isLoading }] = useBulkCreateCalendarEntriesMutation();

    // Filter subprograms
    const subprograms = selectedProgram
        ? allSubprograms.filter(sp => sp.program_id === parseInt(selectedProgram))
        : [];

    const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const years = [2025, 2026, 2027, 2028, 2029, 2030];

    // Initialize schedule grid
    const [scheduleGrid, setScheduleGrid] = useState(() => {
        const grid = {};
        for (let week = 1; week <= 4; week++) {
            grid[week] = {};
            days.forEach(day => {
                grid[week][day] = {
                    activity_title: "",
                    activity_description: ""
                };
            });
        }
        return grid;
    });

    const handleProgramChange = (e) => {
        setSelectedProgram(e.target.value);
        setSelectedSubprogram("");
    };

    const handleMonthsChange = (e) => {
        const newMonths = parseInt(e.target.value);
        const newWeeks = newMonths * 4;
        setNumberOfMonths(newMonths);

        // Update grid
        const newGrid = { ...scheduleGrid };

        // Add new weeks if increased
        for (let week = 1; week <= newWeeks; week++) {
            if (!newGrid[week]) {
                newGrid[week] = {};
                days.forEach(day => {
                    newGrid[week][day] = {
                        activity_title: "",
                        activity_description: ""
                    };
                });
            }
        }

        // Remove weeks if decreased
        Object.keys(newGrid).forEach(week => {
            if (parseInt(week) > newWeeks) {
                delete newGrid[week];
            }
        });

        setScheduleGrid(newGrid);
    };

    const updateCell = (week, day, field, value) => {
        setScheduleGrid(prev => ({
            ...prev,
            [week]: {
                ...prev[week],
                [day]: {
                    ...prev[week][day],
                    [field]: value
                }
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedProgram || !selectedSubprogram) {
            showToast("Please select both program and course", "error");
            return;
        }

        // Build entries array (only include cells with data)
        const entries = [];
        Object.keys(scheduleGrid).forEach(week => {
            days.forEach(day => {
                const cell = scheduleGrid[week][day];
                if (cell.activity_title) {
                    entries.push({
                        program_id: parseInt(selectedProgram),
                        subprogram_id: parseInt(selectedSubprogram),
                        week_number: parseInt(week),
                        day_of_week: day,
                        activity_title: cell.activity_title,
                        activity_description: cell.activity_description || null,
                        month: creationMonth,
                        year: creationYear
                    });
                }
            });
        });

        if (entries.length === 0) {
            showToast("Please add at least one activity", "error");
            return;
        }

        try {
            await bulkCreate({ entries }).unwrap();
            showToast(`Successfully created ${entries.length} activities!`, "success");
            router.push("/portal/admin/academic-management/course-schedule");
        } catch (error) {
            console.error("Error creating schedule:", error);
            showToast(error?.data?.error || "Failed to create schedule", "error");
        }
    };

    const clearAll = () => {
        const newGrid = {};
        const totalWeeks = numberOfMonths * 4;
        for (let week = 1; week <= totalWeeks; week++) {
            newGrid[week] = {};
            days.forEach(day => {
                newGrid[week][day] = {
                    activity_title: "",
                    activity_description: ""
                };
            });
        }
        setScheduleGrid(newGrid);
        showToast("Schedule cleared", "info");
    };

    return (
        <main className={`flex-1 overflow-y-auto transition-colors ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="w-full px-8 py-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className={`text-3xl font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Create Weekly Schedule
                        </h1>
                        <p className={`text-base font-normal ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Build a complete weekly timetable for your course
                        </p>
                    </div>
                    <Link
                        href="/portal/admin/learning-resources/timetable"
                        className={`px-4 py-2 rounded-xl border transition-colors ${isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                    >
                        ← Back
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Program/Course Selection */}
                    <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            1. Select Course
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div>
                                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Program <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedProgram}
                                    onChange={handleProgramChange}
                                    required
                                    className={`w-full px-4 py-2 border rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'}`}
                                >
                                    <option value="">-- Select Program --</option>
                                    {programs.map((program) => (
                                        <option key={program.id} value={program.id}>{program.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Course <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedSubprogram}
                                    onChange={(e) => setSelectedSubprogram(e.target.value)}
                                    required
                                    disabled={!selectedProgram}
                                    className={`w-full px-4 py-2 border rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'} ${!selectedProgram ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <option value="">-- Select Course --</option>
                                    {subprograms.map((subprogram) => (
                                        <option key={subprogram.id} value={subprogram.id}>{subprogram.subprogram_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Select Month
                                </label>
                                <select
                                    value={creationMonth}
                                    onChange={(e) => setCreationMonth(e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'}`}
                                >
                                    {months.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Select Year
                                </label>
                                <select
                                    value={creationYear}
                                    onChange={(e) => setCreationYear(parseInt(e.target.value))}
                                    className={`w-full px-4 py-2 border rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'}`}
                                >
                                    {years.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Schedule Grid */}
                    <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                2. Fill Schedule
                            </h2>
                            <button
                                type="button"
                                onClick={clearAll}
                                className={`px-4 py-2 rounded-xl border transition-colors text-sm font-medium ${isDark ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                            >
                                Clear All
                            </button>
                        </div>

                        <div className="space-y-12">
                            {Array.from({ length: numberOfMonths }).map((_, monthIndex) => {
                                const monthNum = monthIndex + 1;
                                const monthWeeks = [
                                    monthIndex * 4 + 1,
                                    monthIndex * 4 + 2,
                                    monthIndex * 4 + 3,
                                    monthIndex * 4 + 4
                                ];

                                return (
                                    <div key={monthNum} className="space-y-4">
                                        <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-700'} font-bold text-sm inline-block`}>
                                            Month {monthNum}
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                                                        <th className={`px-3 py-3 text-left text-xs font-bold uppercase ${isDark ? 'text-gray-300' : 'text-gray-600'} border ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                                                            Week
                                                        </th>
                                                        {days.map(day => (
                                                            <th key={day} className={`px-3 py-3 text-left text-xs font-bold uppercase ${isDark ? 'text-gray-300' : 'text-gray-600'} border ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                                                                {day}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {monthWeeks.map(week => (
                                                        <tr key={week}>
                                                            <td className={`px-3 py-3 font-bold text-sm ${isDark ? 'text-gray-200 bg-gray-700' : 'text-gray-700 bg-gray-50'} border ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                                                                Week {week}
                                                            </td>
                                                            {days.map(day => (
                                                                <td key={day} className={`p-2 border ${isDark ? 'border-gray-600' : 'border-gray-300'} align-top`}>
                                                                    <div className="space-y-2">
                                                                        <input
                                                                            type="text"
                                                                            value={scheduleGrid[week][day].activity_title}
                                                                            onChange={(e) => updateCell(week, day, 'activity_title', e.target.value)}
                                                                            placeholder="Activity Title..."
                                                                            className={`w-full px-2 py-1.5 border rounded text-xs font-bold ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                                                                        />
                                                                        <textarea
                                                                            value={scheduleGrid[week][day].activity_description}
                                                                            onChange={(e) => updateCell(week, day, 'activity_description', e.target.value)}
                                                                            placeholder="Description (optional)"
                                                                            rows={2}
                                                                            className={`w-full px-2 py-1.5 border rounded text-[10px] resize-none ${isDark ? 'bg-gray-800 border-gray-700 text-gray-300 placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-600 placeholder-gray-400'}`}
                                                                        />
                                                                    </div>
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3">
                        <Link
                            href="/portal/admin/learning-resources/timetable"
                            className={`px-6 py-3 rounded-xl transition-colors font-semibold ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isLoading || !selectedProgram || !selectedSubprogram}
                            className={`px-8 py-3 ${isDark ? 'bg-white hover:bg-gray-100 text-gray-900' : 'bg-[#010080] hover:bg-[#010080]/90 text-white'} font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isLoading ? "Creating Schedule..." : "Create Schedule"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
