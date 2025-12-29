"use client";

import { useState, useMemo } from "react";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";
import { useGetClassesQuery, useGetAllClassSchedulesQuery } from "@/redux/api/classApi";
import { useCreateClassScheduleMutation, useUpdateClassScheduleMutation } from "@/redux/api/classApi";
import { useToast } from "@/components/Toast";

export default function OnlineSessionsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSession, setEditingSession] = useState(null);
    const { showToast } = useToast();

    // Use RTK Query for fetching data
    const { data: classes = [], isLoading: classesLoading } = useGetClassesQuery();
    const { data: rawSessions = [], isLoading: sessionsLoading } = useGetAllClassSchedulesQuery();

    const [createSchedule, { isLoading: isCreating }] = useCreateClassScheduleMutation();
    const [updateSchedule, { isLoading: isUpdating }] = useUpdateClassScheduleMutation();

    const [formData, setFormData] = useState({
        class_id: "",
        title: "",
        platform: "",
        meetingLink: "",
        meetingId: "",
        passcode: "",
        scheduleDate: "",
        startTime: "",
        endTime: "",
        description: "",
    });

    const extractMeetingId = (link) => {
        if (!link) return "-";
        if (link.includes('zoom.us/j/')) {
            return link.split('zoom.us/j/')[1]?.split('?')[0] || "-";
        }
        if (link.includes('meet.google.com/')) {
            return link.split('meet.google.com/')[1]?.split('?')[0] || "-";
        }
        return "-";
    };

    const getSessionStatus = (dateString, startTime, endTime) => {
        if (!dateString) return "Scheduled";

        const now = new Date();

        // Parse the date string properly (format: YYYY-MM-DD)
        const [year, month, day] = dateString.split('-').map(Number);
        const sessionDateOnly = new Date(year, month - 1, day); // month is 0-indexed

        // If no times are set, just check the date
        if (!startTime && !endTime) {
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            if (sessionDateOnly < today) {
                return "Completed";
            } else if (sessionDateOnly > today) {
                return "Scheduled";
            }
            return "Active"; // Same day but no time specified
        }

        // Combine date and time to create full datetime objects
        const [startHours, startMinutes, startSeconds = 0] = startTime ? startTime.split(':').map(Number) : [0, 0, 0];
        const [endHours, endMinutes, endSeconds = 0] = endTime ? endTime.split(':').map(Number) : [23, 59, 59];

        const startDateTime = new Date(year, month - 1, day, startHours, startMinutes, startSeconds);
        const endDateTime = new Date(year, month - 1, day, endHours, endMinutes, endSeconds);

        // Check if current time is between start and end
        if (now >= startDateTime && now <= endDateTime) {
            return "Active";
        } else if (now > endDateTime) {
            return "Completed";
        }

        // If we get here, the session is in the future
        return "Scheduled";
    };

    // Transform and sort sessions
    const sessions = useMemo(() => {
        if (!rawSessions) return [];

        const formattedSessions = rawSessions.map(schedule => ({
            id: schedule.id,
            title: schedule.title || schedule.class_name || "Class Session",
            platform: schedule.zoom_link?.includes('zoom') ? 'Zoom' :
                schedule.zoom_link?.includes('meet.google') ? 'Google Meet' :
                    schedule.zoom_link?.includes('teams') ? 'Microsoft Teams' : 'Other',
            meetingLink: schedule.zoom_link || "",
            meetingId: extractMeetingId(schedule.zoom_link),
            passcode: "-",
            scheduleDate: schedule.schedule_date || "",
            startTime: schedule.start_time
                ? (String(schedule.start_time).length > 8
                    ? String(schedule.start_time).substring(0, 8)
                    : String(schedule.start_time).substring(0, 5))
                : "",
            endTime: schedule.end_time
                ? (String(schedule.end_time).length > 8
                    ? String(schedule.end_time).substring(0, 8)
                    : String(schedule.end_time).substring(0, 5))
                : "",
            status: getSessionStatus(
                schedule.schedule_date || "",
                schedule.start_time ? String(schedule.start_time).substring(0, 8) : "",
                schedule.end_time ? String(schedule.end_time).substring(0, 8) : ""
            ),
            class_id: schedule.class_id,
            className: schedule.class_name || "Unknown Class",
            teacherName: schedule.teacher_name || "",
            description: schedule.description || "",
        }));

        // Sort by date and start time (most recent first)
        return formattedSessions.sort((a, b) => {
            const dateA = new Date(`${a.scheduleDate}T${a.startTime || '00:00'}`);
            const dateB = new Date(`${b.scheduleDate}T${b.startTime || '00:00'}`);
            return dateB - dateA;
        });
    }, [rawSessions]);

    const handleAddSession = () => {
        setEditingSession(null);
        setFormData({
            class_id: "",
            title: "",
            platform: "",
            meetingLink: "",
            meetingId: "",
            passcode: "",
            scheduleDate: "",
            startTime: "",
            endTime: "",
            description: "",
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSession(null);
        setFormData({
            class_id: "",
            title: "",
            platform: "",
            meetingLink: "",
            meetingId: "",
            passcode: "",
            scheduleDate: "",
            startTime: "",
            endTime: "",
            description: "",
        });
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleCloseModal();
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!formData.class_id || !formData.scheduleDate) {
            showToast("Please fill in all required fields (Class and Date)", "error");
            return false;
        }

        try {
            // Ensure date is in YYYY-MM-DD format without timezone conversion
            // Date input always returns YYYY-MM-DD format, use it directly
            let dateToSend = formData.scheduleDate;
            if (dateToSend) {
                // Remove any time portion if present and ensure it's just YYYY-MM-DD
                dateToSend = String(dateToSend).split('T')[0].split(' ')[0].trim();
                // Validate and format: YYYY-MM-DD
                if (dateToSend.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    // Already in correct format, use as is
                } else if (dateToSend.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
                    // Format with padding
                    const parts = dateToSend.split('-');
                    dateToSend = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
                }
            }

            // Format time as HH:MM:SS (MySQL TIME format)
            let startTimeToSend = formData.startTime || null;
            let endTimeToSend = formData.endTime || null;

            if (startTimeToSend && startTimeToSend.length === 5) {
                // If it's HH:MM format, add seconds
                startTimeToSend = `${startTimeToSend}:00`;
            }

            if (endTimeToSend && endTimeToSend.length === 5) {
                // If it's HH:MM format, add seconds
                endTimeToSend = `${endTimeToSend}:00`;
            }

            const scheduleData = {
                schedule_date: dateToSend,
                zoom_link: formData.meetingLink || null,
                start_time: startTimeToSend,
                end_time: endTimeToSend,
                title: formData.title || null,
            };

            // If editing and class_id changed, include it in the update
            if (editingSession && formData.class_id !== editingSession.class_id) {
                scheduleData.class_id = formData.class_id;
            }

            if (editingSession) {
                // Update existing session
                await updateSchedule({
                    id: editingSession.id,
                    ...scheduleData
                }).unwrap();
            } else {
                // Create new session
                await createSchedule({
                    classId: formData.class_id,
                    ...scheduleData
                }).unwrap();
            }

            // Close modal
            handleCloseModal();

            // Invalidation is handled automatically by RTK Query tags

            // Show success toast message
            const successMessage = editingSession
                ? "Session updated successfully!"
                : "Session created successfully!";
            showToast(successMessage, "success");
        } catch (error) {
            console.error("Error saving schedule:", error);
            showToast(
                error?.data?.error || `Failed to ${editingSession ? 'update' : 'create'} session. Please try again.`,
                "error"
            );
        }

        return false;
    };

    const handleEdit = (session) => {
        setEditingSession(session);

        setFormData({
            class_id: session.class_id || "",
            title: session.title || "",
            platform: session.platform || "",
            meetingLink: session.meetingLink || "",
            meetingId: session.meetingId || "",
            passcode: session.passcode || "",
            scheduleDate: session.scheduleDate || "",
            startTime: session.startTime || "",
            endTime: session.endTime || "",
            description: session.description || "",
        });

        setIsModalOpen(true);
    };

    const columns = [
        {
            key: "className",
            label: "Class",
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{row.className || "N/A"}</span>
                    {row.teacherName && (
                        <span className="text-xs text-gray-500">{row.teacherName}</span>
                    )}
                </div>
            ),
        },
        {
            key: "title",
            label: "Session Title",
        },
        {
            key: "platform",
            label: "Platform",
            render: (row) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${row.platform === "Zoom" ? "bg-blue-100 text-blue-800" :
                    row.platform === "Google Meet" ? "bg-green-100 text-green-800" :
                        row.platform === "Microsoft Teams" ? "bg-purple-100 text-purple-800" :
                            "bg-gray-100 text-gray-800"
                    }`}>
                    {row.platform}
                </span>
            ),
        },
        {
            key: "schedule",
            label: "Schedule",
            render: (row) => (
                <div className="flex flex-col text-sm">
                    <span className="font-medium text-gray-900">{row.scheduleDate}</span>
                    {row.startTime && row.endTime ? (
                        <span className="text-gray-500">{row.startTime} - {row.endTime}</span>
                    ) : row.startTime ? (
                        <span className="text-gray-500">{row.startTime}</span>
                    ) : (
                        <span className="text-gray-400">No time set</span>
                    )}
                </div>
            ),
        },
        {
            key: "details",
            label: "Meeting Details",
            render: (row) => (
                <div className="text-xs text-gray-500">
                    <div>ID: <span className="text-gray-700 select-all">{row.meetingId}</span></div>
                    {row.passcode && row.passcode !== '-' && (
                        <div>Pass: <span className="text-gray-700 select-all">{row.passcode}</span></div>
                    )}
                </div>
            ),
        },
        {
            key: "status",
            label: "Status",
            render: (row) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${row.status === "Active" ? "bg-green-100 text-green-800" :
                    row.status === "Scheduled" ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-800"
                    }`}>
                    {row.status}
                </span>
            ),
        },
        {
            key: "join",
            label: "Link",
            render: (row) => (
                <a
                    href={row.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-900 font-medium text-sm flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                >
                    Join
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </a>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (row) => (
                <button
                    onClick={() => handleEdit(row)}
                    className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
                    title="Edit"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
            ),
        },
    ];

    return (
        <>
            <AdminHeader />

            <main className="flex-1 overflow-y-auto bg-gray-50 transition-colors mt-20">
                <div className="w-full px-8 py-6">
                    {sessionsLoading || classesLoading ? (
                        <div className="bg-white rounded-lg shadow p-6 text-center">
                            <p className="text-gray-600">Loading classes and sessions...</p>
                        </div>
                    ) : (
                        <DataTable
                            title="Online Session Links"
                            columns={columns}
                            data={sessions}
                            onAddClick={handleAddSession}
                            showAddButton={true}
                        />
                    )}
                </div>
            </main>

            {/* Add Session Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center "
                >
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-smin"
                        onClick={handleBackdropClick}
                        style={{ pointerEvents: 'auto' }}
                    />

                    <div
                        className="relative bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4"
                        onClick={(e) => e.stopPropagation()}
                        style={{ pointerEvents: 'auto' }}
                    >
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {editingSession ? "Edit Session" : "Schedule New Session"}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label htmlFor="class_id" className="block text-sm font-medium text-gray-700 mb-1">
                                        Class <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="class_id"
                                        name="class_id"
                                        value={formData.class_id}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select a Class</option>
                                        {classes.map((classItem) => (
                                            <option key={classItem.id || classItem._id} value={classItem.id || classItem._id}>
                                                {classItem.class_name} {classItem.teacher_name ? `- ${classItem.teacher_name}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                        Session Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g. Weekly Grammar Q&A"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-1">
                                        Platform <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="platform"
                                        name="platform"
                                        value={formData.platform}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Platform</option>
                                        <option value="Zoom">Zoom</option>
                                        <option value="Google Meet">Google Meet</option>
                                        <option value="Microsoft Teams">Microsoft Teams</option>
                                        <option value="Skype">Skype</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Add any additional notes or description..."
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="scheduleDate" className="block text-sm font-medium text-gray-700 mb-1">
                                        Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        id="scheduleDate"
                                        name="scheduleDate"
                                        value={formData.scheduleDate}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                                        Start Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        id="startTime"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                                        End Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        id="endTime"
                                        name="endTime"
                                        value={formData.endTime}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="meetingLink" className="block text-sm font-medium text-gray-700 mb-1">
                                    Meeting Link (URL) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="url"
                                    id="meetingLink"
                                    name="meetingLink"
                                    value={formData.meetingLink}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="https://..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="meetingId" className="block text-sm font-medium text-gray-700 mb-1">
                                        Meeting ID (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        id="meetingId"
                                        name="meetingId"
                                        value={formData.meetingId}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 123 456 7890"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="passcode" className="block text-sm font-medium text-gray-700 mb-1">
                                        Passcode (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        id="passcode"
                                        name="passcode"
                                        value={formData.passcode}
                                        onChange={handleInputChange}
                                        placeholder="Meeting Password"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating || isUpdating}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isCreating || isUpdating
                                        ? (editingSession ? "Updating..." : "Creating...")
                                        : (editingSession ? "Update Session" : "Schedule Session")
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
