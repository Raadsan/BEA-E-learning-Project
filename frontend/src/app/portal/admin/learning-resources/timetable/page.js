"use client";

import { useState, useMemo } from "react";
import { useDarkMode } from "@/context/ThemeContext";

import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import { useToast } from "@/components/Toast";
import EventModal from "./EventModal";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useGetSubprogramsQuery } from "@/redux/api/subprogramApi";
import { useGetTeachersQuery } from "@/redux/api/teacherApi";
import {
    useGetTimetableQuery,
    useCreateEntryMutation,
    useUpdateEntryMutation,
    useDeleteEntryMutation
} from "@/redux/api/timetableApi";
import {
    useGetEventsQuery,
    useCreateEventMutation,
    useUpdateEventMutation,
    useDeleteEventMutation
} from "@/redux/api/eventApi";

export default function TimetablePage() {
    const { isDark } = useDarkMode();
    const { showToast } = useToast();
    const [selectedProgram, setSelectedProgram] = useState("");
    const [selectedSubprogram, setSelectedSubprogram] = useState("");
    const [currentDate, setCurrentDate] = useState(new Date());

    // Modals state
    const [isClassModalOpen, setIsClassModalOpen] = useState(false);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [editingEvent, setEditingEvent] = useState(null);
    const [selectedDateForEvent, setSelectedDateForEvent] = useState(null);

    // Delete states
    const [isDeleteClassModalOpen, setIsDeleteClassModalOpen] = useState(false);
    const [deleteClassId, setDeleteClassId] = useState(null);
    const [isDeleteEventModalOpen, setIsDeleteEventModalOpen] = useState(false);
    const [deleteEventId, setDeleteEventId] = useState(null);

    // Class Form state
    const [classFormData, setClassFormData] = useState({
        days: ["Monday"],
        start_time: "00:00",
        end_time: "00:00",
        subject: "",
        teacher_id: "",
        sessionType: "class",
        eventType: "holiday",
        title: "",
        description: "",
        eventDate: new Date().toISOString().split('T')[0]
    });

    // Queries
    const { data: programs = [], isLoading: programsLoading } = useGetProgramsQuery();
    const { data: allSubprograms = [], isLoading: subprogramsLoading } = useGetSubprogramsQuery();
    const { data: teachers = [] } = useGetTeachersQuery();

    // Timetable Query (Weekly)
    const { data: weeklyTimetable = [], isLoading: timetableLoading } = useGetTimetableQuery(selectedSubprogram, {
        skip: !selectedSubprogram
    });

    // Events Query (Monthly) - Fetch for the whole month/year (simplified: fetch all or by month range if API supports)
    // For now, let's fetch roughly by month to avoid over-fetching if we had implemented range in Calendar.
    // Simplifying: Fetching all for subprogram for now or range. The API asks for start/end.
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];

    const { data: events = [], isLoading: eventsLoading } = useGetEventsQuery({
        subprogramId: selectedSubprogram,
        start: startOfMonth,
        end: endOfMonth
    }, {
        skip: !selectedSubprogram
    });

    // Mutations
    const [createClass, { isLoading: isCreatingClass }] = useCreateEntryMutation();
    const [updateClass, { isLoading: isUpdatingClass }] = useUpdateEntryMutation();
    const [deleteClass, { isLoading: isDeletingClass }] = useDeleteEntryMutation();

    const [createEvent] = useCreateEventMutation();
    const [updateEvent] = useUpdateEventMutation();
    const [deleteEvent] = useDeleteEventMutation();

    // Filter subprograms
    const subprograms = selectedProgram
        ? allSubprograms.filter(sp => sp.program_id === parseInt(selectedProgram))
        : [];

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const handleProgramChange = (e) => {
        setSelectedProgram(e.target.value);
        setSelectedSubprogram("");
    };

    // --- Calendar Navigation ---
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

    const handleMonthChange = (e) => {
        const newMonth = parseInt(e.target.value);
        setCurrentDate(prev => new Date(prev.getFullYear(), newMonth, 1));
    };

    const handleYearChange = (e) => {
        const newYear = parseInt(e.target.value);
        setCurrentDate(prev => new Date(newYear, prev.getMonth(), 1));
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };
    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    // --- Data Generation Logic ---
    const timetableEntries = useMemo(() => {
        if (!selectedSubprogram) return [];

        const sessions = [];

        // 1. Add Specific Events
        events.forEach(event => {
            const dateObj = new Date(event.event_date);
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
            const displayDate = dateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });

            sessions.push({
                id: `event-${event.id}`,
                uniqueKey: `event-${event.id}`,
                date: event.event_date,
                displayDate,
                day: dayName,
                type: event.type === 'exam' ? "Exam" : (event.type === 'holiday' ? 'Holiday' : 'Event'),
                subject: event.title || "Event",
                teacher_name: "-",
                isEvent: true,
                originalData: event
            });
        });

        // 2. Add Weekly Recurring Classes
        weeklyTimetable.forEach(cls => {
            let displayDate = "Weekly Pattern";
            if (cls.date) {
                const dateObj = new Date(cls.date);
                displayDate = dateObj.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });
            }

            sessions.push({
                id: `class-${cls.id}`,
                uniqueKey: `class-${cls.id}`,
                date: cls.date, // Store the raw date string
                displayDate,    // Store formatted date for display
                day: cls.day,
                type: cls.type || "Class",
                subject: cls.subject || "Class",
                teacher_name: cls.teacher_name || "Unassigned",
                isEvent: false,
                originalData: cls
            });
        });

        return sessions.sort((a, b) => {
            if (a.isEvent && b.isEvent) return a.date.localeCompare(b.date);
            if (!a.isEvent && !b.isEvent) return a.day.localeCompare(b.day);
            return a.isEvent ? -1 : 1; // Events first
        });
    }, [events, weeklyTimetable, selectedSubprogram]);


    // --- Class Modal Handlers ---
    const handleOpenClassModal = (entry = null) => {
        if (entry) {
            setEditingClass(entry);
            setClassFormData({
                days: [entry.day],
                subject: entry.subject || "",
                teacher_id: entry.teacher_id || "",
                classType: entry.type || "Class",
                sessionType: "class",
                eventType: "holiday",
                title: entry.subject || "",
                description: entry.description || "",
                eventDate: entry.date || ""
            });
        } else {
            setEditingClass(null);
            const today = new Date().toISOString().split('T')[0];
            setClassFormData({
                days: [new Date().toLocaleDateString('en-US', { weekday: 'long' })],
                subject: "",
                teacher_id: "",
                classType: "Class",
                sessionType: "class",
                eventType: "holiday",
                title: "",
                description: "",
                eventDate: today
            });
        }
        setIsClassModalOpen(true);
    };

    const handleClassSubmit = async (e, keepOpen = false) => {
        if (e && e.preventDefault) e.preventDefault();
        try {
            const basePayload = {
                subject: classFormData.subject,
                program_id: parseInt(selectedProgram),
                subprogram_id: parseInt(selectedSubprogram),
                teacher_id: classFormData.teacher_id ? parseInt(classFormData.teacher_id) : null,
                type: classFormData.classType || "Class",
                start_time: "00:00",
                end_time: "00:00",
                date: classFormData.eventDate || null
            };

            if (editingClass) {
                await updateClass({
                    id: editingClass.id,
                    ...basePayload,
                    day: classFormData.days[0]
                }).unwrap();
                showToast("Class updated successfully", "success");
            } else {
                const promises = classFormData.days.map(day => {
                    return createClass({
                        ...basePayload,
                        day
                    }).unwrap();
                });
                await Promise.all(promises);
                showToast(`Created ${classFormData.days.length} session(s) successfully`, "success");
            }

            if (keepOpen) {
                setClassFormData(prev => ({ ...prev, subject: "" }));
            } else {
                setIsClassModalOpen(false);
            }
        } catch (error) {
            console.error(error);
            showToast(error?.data?.error || "Failed to save class", "error");
        }
    };

    const handleDeleteClassClick = (id) => {
        setDeleteClassId(id);
        setIsDeleteClassModalOpen(true);
    };

    const handleConfirmDeleteClass = async () => {
        try {
            await deleteClass(deleteClassId).unwrap();
            showToast("Class deleted successfully", "success");
            setIsDeleteClassModalOpen(false);
        } catch (error) {
            console.error(error);
            showToast("Failed to delete class", "error");
        }
    };

    // --- Event Modal Handlers ---
    const handleOpenAddEvent = () => {
        setSelectedDateForEvent(new Date()); // Default to today
        setEditingEvent(null);
        setIsEventModalOpen(true);
    }

    const handleEditEvent = (event) => {
        setEditingEvent(event);
        setSelectedDateForEvent(new Date(event.event_date));
        setIsEventModalOpen(true);
    };

    const handleEventSave = async (eventData, keepOpen = false) => {
        try {
            const payload = {
                subprogram_id: parseInt(selectedSubprogram),
                program_id: parseInt(selectedProgram),
                event_date: eventData.event_date || classFormData.eventDate,
                ...eventData
            };

            if (editingEvent) {
                await updateEvent({ id: editingEvent.id, ...payload }).unwrap();
                showToast("Event updated successfully", "success");
            } else {
                await createEvent(payload).unwrap();
                showToast("Event created successfully", "success");
            }

            if (keepOpen) {
                setClassFormData(prev => ({ ...prev, title: "", description: "" }));
            } else {
                setIsEventModalOpen(false);
                setIsClassModalOpen(false);
            }
        } catch (error) {
            console.error(error);
            showToast("Failed to save event", "error");
        }
    };

    const handleEventDelete = (id) => {
        setDeleteEventId(id);
        setIsDeleteEventModalOpen(true);
    };

    const handleConfirmDeleteEvent = async () => {
        try {
            await deleteEvent(deleteEventId).unwrap();
            showToast("Event deleted successfully", "success");
            setIsDeleteEventModalOpen(false);
            setIsEventModalOpen(false);
        } catch (error) {
            console.error(error);
            showToast("Failed to delete event", "error");
        }
    };

    // --- Table Columns ---
    const columns = [
        {
            key: "date",
            label: "Date",
            render: (row) => {
                const isWeekly = row.displayDate === "Weekly Pattern";
                return (
                    <span className={`font-bold ${isWeekly ? 'text-gray-400 text-[10px] uppercase tracking-wider' : 'text-black dark:text-white'}`}>
                        {row.displayDate}
                    </span>
                );
            }
        },
        {
            key: "day",
            label: "Day",
            render: (row) => <span className="font-semibold text-gray-900 dark:text-white uppercase text-xs tracking-wider">{row.day}</span>
        },
        {
            key: "type",
            label: "Type",
            render: (row) => {
                let colorClass = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
                if (row.type === 'Holiday') colorClass = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
                if (row.type === 'Exam' || row.type === 'exam') colorClass = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";

                // Weekly Class Types
                if (row.type === 'Lecture') colorClass = "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300";
                if (row.type === 'Lab') colorClass = "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300";
                if (row.type === 'Tutorial') colorClass = "bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300";

                return (
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${colorClass}`}>
                        {row.type}
                    </span>
                );
            }
        },
        {
            key: "subject",
            label: "Subject / Title",
            render: (row) => <span className="font-medium text-gray-900 dark:text-white">{row.subject}</span>
        },
        {
            key: "teacher_name",
            label: "Teacher",
            render: (row) => {
                if (row.isEvent) {
                    return (
                        <span className="text-gray-400 text-xs italic font-medium uppercase tracking-tighter">
                            {row.type === 'Holiday' ? 'Holiday - No Class' : 'School Event'}
                        </span>
                    );
                }
                return <span className="text-gray-500 text-sm font-medium">{row.teacher_name || "Unassigned"}</span>
            }
        },
        {
            key: "actions",
            label: "Actions",
            render: (row) => (
                <div className="flex items-center gap-2">
                    {row.isEvent ? (
                        <>
                            <button onClick={() => handleEditEvent(row.originalData)} className="text-blue-600 hover:text-blue-800 p-1" title="Edit Event">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => handleEventDelete(row.originalData.id)} className="text-red-600 hover:text-red-800 p-1" title="Delete Event">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </>
                    ) : (
                        // For class rows, we edit/delete the underlying WEEKLY class
                        <>
                            <button onClick={() => handleOpenClassModal(row.originalData)} className="text-blue-600 hover:text-blue-800 p-1" title="Edit Weekly Class">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => handleDeleteClassClick(row.originalData.id)} className="text-red-600 hover:text-red-800 p-1" title="Delete Weekly Class">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </>
                    )}
                </div>
            )
        }
    ];

    return (
        <>
            <main className={`flex-1 overflow-y-auto transition-colors ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="w-full px-8 py-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h1 className={`text-3xl font-extrabold mb-2 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Academic Timetable
                            </h1>
                            <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Centralized schedule for classes, exams, and academic events
                            </p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className={`mb-8 p-6 rounded-2xl border transition-all ${isDark ? 'bg-gray-800 border-gray-700 shadow-lg shadow-black/20' : 'bg-white border-gray-200 shadow-sm'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
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
                                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
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

                    {/* Monthly Timetable Data Table */}
                    {selectedSubprogram ? (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            {/* Month Navigation */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 gap-4">
                                <h2 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Schedule for {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </h2>
                                <div className="flex items-center gap-1">
                                    <select
                                        value={currentDate.getMonth()}
                                        onChange={handleMonthChange}
                                        className={`px-3 py-2 border rounded-xl font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-700'}`}
                                    >
                                        {months.map((month, index) => (
                                            <option key={month} value={index}>{month}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={currentDate.getFullYear()}
                                        onChange={handleYearChange}
                                        className={`px-3 py-2 border rounded-xl font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-700'}`}
                                    >
                                        {years.map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <DataTable
                                title="Registered Sessions"
                                columns={columns}
                                data={timetableEntries}
                                customActions={
                                    <button
                                        onClick={() => handleOpenClassModal()}
                                        className={`px-5 py-2.5 ${isDark ? 'bg-white hover:bg-gray-100 text-gray-900' : 'bg-[#010080] hover:bg-[#010080]/90 text-white'} font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm active:scale-95`}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                        Add Session
                                    </button>
                                }
                            />

                            <div className={`p-4 rounded-2xl border transition-all ${isDark ? 'bg-indigo-900/10 border-indigo-900/20 text-indigo-300' : 'bg-indigo-50 border-indigo-100 text-indigo-800'}`}>
                                <div className="flex gap-3">
                                    <div className={`p-2 rounded-full h-fit ${isDark ? 'bg-indigo-900/40 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm mb-1 uppercase tracking-wider">Schedule Information</h4>
                                        <ul className="text-xs space-y-1.5 font-medium opacity-90">
                                            <li>• <span className="font-bold">Weekly Classes</span> repeat automatically every week. Editing one updates the global pattern.</li>
                                            <li>• <span className="font-bold">Events & Holidays</span> are date-specific. Holidays will automatically suppress recurring classes.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={`p-20 text-center rounded-3xl border-2 border-dashed transition-all ${isDark ? 'bg-gray-800/30 border-gray-700' : 'bg-gray-50 border-gray-300'}`}>
                            <div className="max-w-xs mx-auto">
                                <div className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                    <svg className={`w-8 h-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </div>
                                <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>No Course Selected</h3>
                                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Choose a program and course above to manage the academic timetable.</p>
                            </div>
                        </div>
                    )}
                </div>

                <Modal
                    isOpen={isClassModalOpen}
                    onClose={() => setIsClassModalOpen(false)}
                    title={editingClass ? "Edit Weekly Class" : "Add Session"}
                >
                    <div className="space-y-6">
                        {/* 1. DATE & DAY SELECTION */}
                        <div>
                            <label className={`block text-sm font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                1. When? (Date or Weekly Day)
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input
                                    type="date"
                                    value={classFormData.eventDate || ""}
                                    onChange={(e) => {
                                        const date = new Date(e.target.value);
                                        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                                        setClassFormData({
                                            ...classFormData,
                                            eventDate: e.target.value,
                                            days: [dayName]
                                        });
                                    }}
                                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                />
                                <select
                                    value={classFormData.days[0] || "Monday"}
                                    onChange={(e) => setClassFormData({ ...classFormData, days: [e.target.value] })}
                                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                >
                                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* 2. SESSION TYPE */}
                        <div>
                            <label className={`block text-sm font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                2. Session Type
                            </label>
                            <select
                                value={classFormData.sessionType || 'class'}
                                onChange={(e) => setClassFormData({ ...classFormData, sessionType: e.target.value })}
                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                            >
                                <option value="class">🎓 Weekly Recurring Class</option>
                                <option value="event">📅 Specific Event (Holiday/Exam/etc.)</option>
                            </select>
                        </div>

                        {/* 3. SUBJECT */}
                        <div>
                            <label className={`block text-sm font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                3. Subject / Title
                            </label>
                            <input
                                type="text"
                                value={(classFormData.sessionType === 'event' ? classFormData.title : classFormData.subject) || ""}
                                onChange={(e) => {
                                    if (classFormData.sessionType === 'event') {
                                        setClassFormData({ ...classFormData, title: e.target.value });
                                    } else {
                                        setClassFormData({ ...classFormData, subject: e.target.value });
                                    }
                                }}
                                required
                                placeholder="Enter subject or event title..."
                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                            />
                        </div>

                        {/* 4. CLASS TYPE (OR EVENT TYPE) & TEACHER */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={`block text-sm font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    4. {classFormData.sessionType === 'class' ? 'Class Type' : 'Category'}
                                </label>
                                <select
                                    value={(classFormData.sessionType === 'class' ? (classFormData.classType || 'Class') : (classFormData.eventType || 'holiday'))}
                                    onChange={(e) => {
                                        if (classFormData.sessionType === 'class') {
                                            setClassFormData({ ...classFormData, classType: e.target.value });
                                        } else {
                                            setClassFormData({ ...classFormData, eventType: e.target.value });
                                        }
                                    }}
                                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                >
                                    {classFormData.sessionType === 'class' ? (
                                        <>
                                            <option value="Class">Class (General)</option>
                                            <option value="Lecture">Lecture</option>
                                            <option value="Lab">Lab</option>
                                            <option value="Tutorial">Tutorial</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="holiday">Holiday</option>
                                            <option value="exam">Exam</option>
                                            <option value="activity">Activity</option>
                                        </>
                                    )}
                                </select>
                            </div>
                            {classFormData.sessionType === 'class' && (
                                <div>
                                    <label className={`block text-sm font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        5. Teacher
                                    </label>
                                    <select
                                        value={classFormData.teacher_id || ""}
                                        onChange={(e) => setClassFormData({ ...classFormData, teacher_id: e.target.value })}
                                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                    >
                                        <option value="">Select Teacher...</option>
                                        {teachers.map(t => (
                                            <option key={t.id} value={t.id}>{t.full_name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* BUTTONS */}
                        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <button type="button" onClick={() => setIsClassModalOpen(false)} className={`px-4 py-2.5 rounded-xl transition-colors font-semibold ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>Cancel</button>
                            {!editingClass && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (classFormData.sessionType === 'event') {
                                            handleEventSave({
                                                title: classFormData.title,
                                                type: classFormData.eventType,
                                                description: classFormData.description,
                                                event_date: classFormData.eventDate
                                            }, true);
                                        } else {
                                            handleClassSubmit(null, true);
                                        }
                                    }}
                                    className={`px-4 py-2.5 ${isDark ? 'bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-300' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'} border border-indigo-200 font-bold rounded-xl shadow-sm transition-all active:scale-95`}
                                >
                                    Add & Another
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    if (classFormData.sessionType === 'event') {
                                        handleEventSave({
                                            title: classFormData.title,
                                            type: classFormData.eventType,
                                            description: classFormData.description,
                                            event_date: classFormData.eventDate
                                        });
                                    } else {
                                        handleClassSubmit(null, false);
                                    }
                                }}
                                className={`px-6 py-2.5 ${isDark ? 'bg-white hover:bg-gray-100 text-gray-900' : 'bg-[#010080] hover:bg-[#010080]/90 text-white'} font-bold rounded-xl shadow-lg transition-all active:scale-95`}
                            >
                                {editingClass ? 'Update' : 'Add Session'}
                            </button>
                        </div>
                    </div>
                </Modal>

                <EventModal
                    isOpen={isEventModalOpen}
                    onClose={() => setIsEventModalOpen(false)}
                    selectedDate={selectedDateForEvent ? selectedDateForEvent.toDateString() : ""}
                    event={editingEvent}
                    onSave={handleEventSave}
                    onDelete={handleEventDelete}
                />

                <Modal
                    isOpen={isDeleteClassModalOpen}
                    onClose={() => setIsDeleteClassModalOpen(false)}
                    title="Delete Class"
                >
                    <div className="space-y-4">
                        <p>Are you sure you want to delete this weekly class? <br /> <span className="text-red-500 text-sm">This will remove it from all weeks.</span></p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsDeleteClassModalOpen(false)} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">Cancel</button>
                            <button onClick={handleConfirmDeleteClass} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
                        </div>
                    </div>
                </Modal>

                <Modal
                    isOpen={isDeleteEventModalOpen}
                    onClose={() => setIsDeleteEventModalOpen(false)}
                    title="Delete Event"
                >
                    <div className="space-y-4">
                        <p>Are you sure you want to delete this event? <br /> <span className="text-red-500 text-sm">This action cannot be undone.</span></p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsDeleteEventModalOpen(false)} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">Cancel</button>
                            <button onClick={handleConfirmDeleteEvent} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
                        </div>
                    </div>
                </Modal>
            </main>
        </>
    );
}
