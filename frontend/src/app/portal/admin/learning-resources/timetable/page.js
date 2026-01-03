"use client";

import { useState, useMemo } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import AdminHeader from "@/components/AdminHeader";
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

    // Class Form state
    const [classFormData, setClassFormData] = useState({
        day: "Monday",
        start_time: "",
        end_time: "",
        subject: "",
        teacher_id: ""
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
    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };
    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    // --- Data Generation Logic ---
    const monthlySessions = useMemo(() => {
        if (!selectedSubprogram) return [];

        const sessions = [];
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const numDays = new Date(year, month + 1, 0).getDate();

        for (let day = 1; day <= numDays; day++) {
            const date = new Date(year, month, day);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            const dateString = date.toISOString().split('T')[0];

            // 1. Check for Events (Holidays/Exams)
            const dayEvents = events.filter(e => e.event_date.startsWith(dateString));
            const holiday = dayEvents.find(e => e.type === 'holiday');

            if (holiday) {
                // If it's a holiday, only show the holiday (no classes)
                sessions.push({
                    id: `event - ${holiday.id} `,
                    uniqueKey: `event - ${holiday.id} `,
                    date: dateString,
                    day: dayName,
                    time: "All Day",
                    type: "Holiday",
                    subject: holiday.title,
                    teacher_name: "-",
                    originalData: holiday,
                    isEvent: true
                });
                // Check if there are exams on a holiday? Usually not, but let's show them if they exist
                dayEvents.filter(e => e.type !== 'holiday').forEach(event => {
                    sessions.push({
                        id: `event - ${event.id} `,
                        uniqueKey: `event - ${event.id} `,
                        date: dateString,
                        day: dayName,
                        time: "Scheduled", // or event specific time if we had it
                        type: event.type === 'exam' ? "Exam" : "Event",
                        subject: event.title,
                        teacher_name: "-",
                        originalData: event,
                        isEvent: true
                    });
                });

            } else {
                // 2. Not a holiday -> Show Exams + Regular Classes
                dayEvents.forEach(event => {
                    sessions.push({
                        id: `event - ${event.id} `,
                        uniqueKey: `event - ${event.id} `,
                        date: dateString,
                        day: dayName,
                        time: "Scheduled",
                        type: event.type === 'exam' ? "Exam" : "Event",
                        subject: event.title,
                        teacher_name: "-",
                        originalData: event,
                        isEvent: true
                    });
                });

                // Regular Classes
                const daysClasses = weeklyTimetable.filter(c => c.day === dayName);
                // Sort classes by time
                daysClasses.sort((a, b) => a.start_time.localeCompare(b.start_time));

                daysClasses.forEach(cls => {
                    sessions.push({
                        id: `class-${cls.id} -${day} `, // unique id for table
                        uniqueKey: `class-${cls.id} `,
                        date: dateString,
                        day: dayName,
                        time: `${cls.start_time?.slice(0, 5)} - ${cls.end_time?.slice(0, 5)} `,
                        type: cls.type || "Class",
                        subject: cls.subject,
                        teacher_name: cls.teacher_name || "Unassigned",
                        originalData: cls,
                        isEvent: false
                    });
                });
            }
        }
        return sessions;
    }, [currentDate, events, weeklyTimetable, selectedSubprogram]);


    // --- Class Modal Handlers ---
    const handleOpenClassModal = (entry = null) => {
        if (entry) {
            setEditingClass(entry);
            setClassFormData({
                day: entry.day,
                start_time: entry.start_time,
                end_time: entry.end_time,
                subject: entry.subject,
                teacher_id: entry.teacher_id || "",
                classType: entry.type || "Class"
            });
        } else {
            setEditingClass(null);
            setClassFormData({
                day: "Monday",
                start_time: "",
                end_time: "",
                subject: "",
                teacher_id: "",
                classType: "Class"
            });
        }
        setIsClassModalOpen(true);
    };

    const handleClassSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...classFormData,
                program_id: parseInt(selectedProgram),
                subprogram_id: parseInt(selectedSubprogram),
                teacher_id: classFormData.teacher_id ? parseInt(classFormData.teacher_id) : null,
                type: classFormData.classType || "Class"
            };

            if (editingClass) {
                await updateClass({ id: editingClass.id, ...payload }).unwrap();
                showToast("Class updated successfully", "success");
            } else {
                await createClass(payload).unwrap();
                showToast("Class created successfully", "success");
            }
            setIsClassModalOpen(false);
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

    const handleEventSave = async (eventData) => {
        try {
            const payload = {
                subprogram_id: parseInt(selectedSubprogram),
                event_date: selectedDateForEvent.toISOString().split('T')[0],
                ...eventData
            };

            if (editingEvent) {
                await updateEvent({ id: editingEvent.id, ...payload }).unwrap();
                showToast("Event updated successfully", "success");
            } else {
                await createEvent(payload).unwrap();
                showToast("Event created successfully", "success");
            }
            setIsEventModalOpen(false);
        } catch (error) {
            console.error(error);
            showToast("Failed to save event", "error");
        }
    };

    const handleEventDelete = async (id) => {
        if (confirm("Are you sure you want to delete this event?")) {
            try {
                await deleteEvent(id).unwrap();
                showToast("Event deleted successfully", "success");
                setIsEventModalOpen(false);
            } catch (error) {
                console.error(error);
                showToast("Failed to delete event", "error");
            }
        }
    };

    // --- Table Columns ---
    const columns = [
        {
            key: "date",
            label: "Date",
            render: (row) => <span className="text-gray-600 dark:text-gray-400 font-medium">{row.date}</span>
        },
        {
            key: "day",
            label: "Day",
            render: (row) => <span className="font-semibold text-gray-900 dark:text-white">{row.day}</span>
        },
        {
            key: "time",
            label: "Time"
        },
        {
            key: "type",
            label: "Type",
            render: (row) => {
                let colorClass = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
                if (row.type === 'Holiday') colorClass = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
                if (row.type === 'Exam' || row.type === 'exam') colorClass = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
                if (row.type === 'midterm') colorClass = "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
                if (row.type === 'final') colorClass = "bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-200";
                if (row.type === 'quiz') colorClass = "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
                if (row.type === 'meeting') colorClass = "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300";
                if (row.type === 'activity') colorClass = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";

                // Weekly Class Types
                if (row.type === 'Lecture') colorClass = "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300";
                if (row.type === 'Lab') colorClass = "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300";
                if (row.type === 'Tutorial') colorClass = "bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300";
                if (row.type === 'Workshop') colorClass = "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
                if (row.type === 'Seminar') colorClass = "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/30 dark:text-fuchsia-300";

                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
                        {row.type === 'exam' ? 'Exam' : row.type.charAt(0).toUpperCase() + row.type.slice(1)}
                    </span>
                );
            }
        },
        {
            key: "subject",
            label: "Subject / Title",
            render: (row) => <span className="font-medium">{row.subject}</span>
        },
        {
            key: "teacher_name",
            label: "Teacher"
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
                            {/* Delete logic is inside modal for events currently, but better to have direct delete here? 
                                The EventModal has delete. Let's just open modal.
                            */}
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
            <AdminHeader />
            <main className={`flex - 1 overflow - y - auto mt - 20 transition - colors ${isDark ? 'bg-gray-900' : 'bg-gray-50'} `}>
                <div className="w-full px-8 py-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Academic Timetable
                            </h1>
                            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Manage classes, exams, meetings, and academic events
                            </p>
                        </div>
                        {/* Buttons moved to DataTable header */}
                        <div className="hidden"></div>
                    </div>

                    {/* Filters */}
                    <div className={`mb - 8 p - 6 rounded - xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow - sm`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={`block text - sm font - semibold mb - 2 ${isDark ? 'text-gray-300' : 'text-gray-700'} `}>
                                    Select Program <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedProgram}
                                    onChange={handleProgramChange}
                                    className={`w - full px - 4 py - 3 border rounded - xl transition - all focus: outline - none focus: ring - 2 focus: ring - blue - 500 / 20 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} `}
                                >
                                    <option value="">-- Select a Program --</option>
                                    {programs.map((program) => (
                                        <option key={program.id} value={program.id}>{program.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={`block text - sm font - semibold mb - 2 ${isDark ? 'text-gray-300' : 'text-gray-700'} `}>
                                    Select Course <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedSubprogram}
                                    onChange={(e) => setSelectedSubprogram(e.target.value)}
                                    className={`w - full px - 4 py - 3 border rounded - xl transition - all focus: outline - none focus: ring - 2 focus: ring - blue - 500 / 20 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} `}
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
                        <div className="space-y-6 fade-in">
                            {/* Month Navigation */}
                            <div className="flex items-center justify-between">
                                <h2 className={`text - xl font - bold ${isDark ? 'text-white' : 'text-gray-900'} `}>
                                    Schedule for {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </h2>
                                <div className="flex gap-2">
                                    <button onClick={handlePrevMonth} className={`p - 2 rounded - lg border ${isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'} `}>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                    <button onClick={handleNextMonth} className={`p - 2 rounded - lg border ${isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'} `}>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                            </div>

                            <DataTable
                                title={`Sessions - ${currentDate.toLocaleDateString('en-US', { month: 'long' })} `}
                                columns={columns}
                                data={monthlySessions}
                                customActions={
                                    <button
                                        onClick={() => handleOpenClassModal()}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2 text-sm"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                        Add Session
                                    </button>
                                }
                            />

                            <div className="text-sm text-gray-500 mt-2 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                                💡 <strong>Note:</strong> This table shows a generated view of the month.
                                <ul className="list-disc ml-5 mt-1">
                                    <li><strong>Classes</strong> are repeated weekly based on the schedule. Editing one updates the weekly schedule.</li>
                                    <li><strong>Events (Holidays/Exams)</strong> are specific to a date. Holidays hide regular classes for that day.</li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className={`p - 12 text - center rounded - xl border - 2 border - dashed ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-300'} `}>
                            <h3 className={`text - xl font - bold mb - 2 ${isDark ? 'text-gray-300' : 'text-gray-700'} `}>No Course Selected</h3>
                            <p className={`${isDark ? 'text-gray-500' : 'text-gray-600'} `}>Please select a program and course to view the timetable.</p>
                        </div>
                    )}
                </div>

                {/* Unified Add Modal (Replaces separate Class/Event modals) */}
                <Modal
                    isOpen={isClassModalOpen}
                    onClose={() => setIsClassModalOpen(false)}
                    title={editingClass ? "Edit Weekly Class" : "Add Session"}
                >
                    <div className="space-y-4">
                        {/* Type Selector ( Only show if creating new ) */}
                        {!editingClass && (
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Session Type
                                </label>
                                <select
                                    value={classFormData.sessionType || 'class'}
                                    onChange={(e) => setClassFormData({ ...classFormData, sessionType: e.target.value })}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                >
                                    <option value="class">Weekly Recurring Class</option>
                                    <option value="event">Specific Event (Holiday/Exam/Meeting)</option>
                                </select>
                            </div>
                        )}

                        {/* RENDER FORM BASED ON TYPE */}
                        {(classFormData.sessionType === 'event') ? (
                            /* --- EVENT FORM (Date-Specific) --- */
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                handleEventSave({
                                    title: classFormData.title,
                                    type: classFormData.eventType,
                                    description: classFormData.description,
                                    event_date: classFormData.eventDate
                                });
                            }} className="space-y-4 pt-2">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Date *</label>
                                    <input
                                        type="date"
                                        value={classFormData.eventDate || new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setClassFormData({ ...classFormData, eventDate: e.target.value })}
                                        required
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Event Type *</label>
                                    <select
                                        value={classFormData.eventType || 'holiday'}
                                        onChange={(e) => setClassFormData({ ...classFormData, eventType: e.target.value })}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                    >
                                        <option value="holiday">Holiday</option>
                                        <option value="exam">Exam (General)</option>
                                        <option value="midterm">Mid-term Exam</option>
                                        <option value="final">Final Exam</option>
                                        <option value="quiz">Quiz</option>
                                        <option value="meeting">Meeting</option>
                                        <option value="activity">School Activity</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        {classFormData.eventType === 'holiday' ? 'Holiday Name' : 'Title'} *
                                    </label>
                                    <input
                                        type="text"
                                        value={classFormData.title || ""}
                                        onChange={(e) => setClassFormData({ ...classFormData, title: e.target.value })}
                                        required
                                        placeholder={classFormData.eventType === 'holiday' ? "e.g. Eid al-Fitr" : "e.g. Mid-term Exam"}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea
                                        value={classFormData.description || ""}
                                        onChange={(e) => setClassFormData({ ...classFormData, description: e.target.value })}
                                        rows={3}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button type="button" onClick={() => setIsClassModalOpen(false)} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Event</button>
                                </div>
                            </form>
                        ) : (
                            /* --- WEEKLY CLASS FORM (Default) --- */
                            <form onSubmit={handleClassSubmit} className="space-y-6 pt-2">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Day of Week *</label>
                                    <select
                                        name="day"
                                        value={classFormData.day}
                                        onChange={(e) => setClassFormData({ ...classFormData, day: e.target.value })}
                                        required
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                    >
                                        {days.map(day => <option key={day} value={day}>{day}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Start Time *</label>
                                        <input
                                            type="time"
                                            value={classFormData.start_time}
                                            onChange={(e) => setClassFormData({ ...classFormData, start_time: e.target.value })}
                                            required
                                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">End Time *</label>
                                        <input
                                            type="time"
                                            value={classFormData.end_time}
                                            onChange={(e) => setClassFormData({ ...classFormData, end_time: e.target.value })}
                                            required
                                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Subject *</label>
                                    <input
                                        type="text"
                                        value={classFormData.subject}
                                        onChange={(e) => setClassFormData({ ...classFormData, subject: e.target.value })}
                                        required
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Teacher</label>
                                    <select
                                        value={classFormData.teacher_id}
                                        onChange={(e) => setClassFormData({ ...classFormData, teacher_id: e.target.value })}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                    >
                                        <option value="">-- Select Teacher --</option>
                                        {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Class Type *</label>
                                    <select
                                        value={classFormData.classType || 'Class'}
                                        onChange={(e) => setClassFormData({ ...classFormData, classType: e.target.value })}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                    >
                                        <option value="Class">Class (General)</option>
                                        <option value="Lecture">Lecture</option>
                                        <option value="Lab">Lab</option>
                                        <option value="Tutorial">Tutorial</option>
                                        <option value="Workshop">Workshop</option>
                                        <option value="Seminar">Seminar</option>
                                    </select>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button type="button" onClick={() => setIsClassModalOpen(false)} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{editingClass ? 'Update' : 'Add'}</button>
                                </div>
                            </form>
                        )}
                    </div>
                </Modal>

                {/* Event Modal (Only used for Editing existing events now) */}
                <EventModal
                    isOpen={isEventModalOpen}
                    onClose={() => setIsEventModalOpen(false)}
                    selectedDate={selectedDateForEvent ? selectedDateForEvent.toDateString() : ""}
                    event={editingEvent}
                    onSave={handleEventSave}
                    onDelete={handleEventDelete}
                />

                {/* Delete Class Confirmation Modal */}
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

            </main>
        </>
    );
}
