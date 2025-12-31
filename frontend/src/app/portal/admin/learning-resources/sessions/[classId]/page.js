"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";
import { useGetClassSchedulesQuery, useGetClassQuery } from "@/redux/api/classApi";
import { useCreateClassScheduleMutation, useUpdateClassScheduleMutation } from "@/redux/api/classApi";
import { useToast } from "@/components/Toast";

export default function ClassSessionsPage() {
    const params = useParams();
    const router = useRouter();
    const classId = params.classId;
    const { showToast } = useToast();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSession, setEditingSession] = useState(null);

    // Fetch class details and schedules
    const { data: classDetails, isLoading: classLoading } = useGetClassQuery(classId);
    const { data: rawSessions = [], isLoading: sessionsLoading } = useGetClassSchedulesQuery(classId);

    const [createSchedule, { isLoading: isCreating }] = useCreateClassScheduleMutation();
    const [updateSchedule, { isLoading: isUpdating }] = useUpdateClassScheduleMutation();

    // State for bulk rows
    const [sessionRows, setSessionRows] = useState([]);

    const getDefaultTimes = () => {
        if (!classDetails?.type) return { start: "", end: "" };
        const type = classDetails.type.toLowerCase();
        if (type.includes("morning")) return { start: "08:00", end: "10:00" };
        if (type.includes("afternoon")) return { start: "16:00", end: "18:00" };
        if (type.includes("night")) return { start: "20:00", end: "22:00" };
        return { start: "", end: "" };
    };

    const createNewRow = () => {
        const { start, end } = getDefaultTimes();
        return {
            id: Date.now() + Math.random(), // temp id for key
            title: `Session ${sessionRows.length + 1}`,
            meetingLink: "",
            scheduleDate: "",
            startTime: start,
            endTime: end,
        };
    };

    const handleAddSession = () => {
        setEditingSession(null);
        setSessionRows([createNewRow()]);
        setIsModalOpen(true);
    };

    const handleAddRow = () => {
        if (sessionRows.length >= 22) {
            showToast("Maximum of 22 sessions can be added at once", "warning");
            return;
        }
        setSessionRows(prev => {
            const { start, end } = getDefaultTimes();
            return [...prev, {
                id: Date.now() + Math.random(),
                title: `Session ${prev.length + 1}`,
                meetingLink: prev[prev.length - 1]?.meetingLink || "", // copy last link for convenience
                scheduleDate: "",
                startTime: start,
                endTime: end,
            }];
        });
    };

    const handleRemoveRow = (index) => {
        if (sessionRows.length <= 1 && !editingSession) return; // Don't remove last row in create mode
        setSessionRows(prev => prev.filter((_, i) => i !== index));
    };

    const handleRowChange = (index, field, value) => {
        setSessionRows(prev => {
            const newRows = [...prev];
            newRows[index] = { ...newRows[index], [field]: value };
            return newRows;
        });
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSession(null);
        setSessionRows([]);
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleCloseModal();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (sessionRows.some(row => !row.scheduleDate)) {
            showToast("Please fill in the Date for all sessions", "error");
            return false;
        }

        try {
            const promises = sessionRows.map(row => {
                // Ensure date is in YYYY-MM-DD format
                let dateToSend = row.scheduleDate;
                if (dateToSend) {
                    dateToSend = String(dateToSend).split('T')[0].split(' ')[0].trim();
                }

                const scheduleData = {
                    schedule_date: dateToSend,
                    zoom_link: row.meetingLink || null,
                    start_time: row.startTime ? (row.startTime.length === 5 ? `${row.startTime}:00` : row.startTime) : null,
                    end_time: row.endTime ? (row.endTime.length === 5 ? `${row.endTime}:00` : row.endTime) : null,
                    title: row.title || `Session`,
                };

                if (editingSession) {
                    return updateSchedule({
                        id: editingSession.id,
                        class_id: classId,
                        ...scheduleData
                    }).unwrap();
                } else {
                    return createSchedule({
                        classId: classId,
                        ...scheduleData
                    }).unwrap();
                }
            });

            await Promise.all(promises);

            handleCloseModal();
            showToast(editingSession ? "Session updated!" : `Successfully created ${sessionRows.length} sessions!`, "success");

        } catch (error) {
            console.error("Error saving schedule:", error);
            showToast(error?.data?.error || "Failed to save sessions", "error");
        }
    };

    const handleEdit = (session) => {
        setEditingSession(session);
        setSessionRows([{
            id: session.id,
            title: session.title || "",
            meetingLink: session.meetingLink || "",
            scheduleDate: session.scheduleDate || "",
            startTime: session.startTime || "",
            endTime: session.endTime || "",
        }]);
        setIsModalOpen(true);
    };

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
        const [year, month, day] = dateString.split('-').map(Number);
        if (!startTime && !endTime) {
            const sessionDateOnly = new Date(year, month - 1, day);
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            if (sessionDateOnly < today) return "Completed";
            if (sessionDateOnly > today) return "Scheduled";
            return "Active";
        }
        const [startHours, startMinutes] = startTime ? startTime.split(':').map(Number) : [0, 0];
        const [endHours, endMinutes] = endTime ? endTime.split(':').map(Number) : [23, 59];
        const startDateTime = new Date(year, month - 1, day, startHours, startMinutes);
        const endDateTime = new Date(year, month - 1, day, endHours, endMinutes);

        if (now >= startDateTime && now <= endDateTime) return "Active";
        if (now > endDateTime) return "Completed";
        return "Scheduled";
    };

    // Transform and sort sessions
    const sessions = useMemo(() => {
        if (!rawSessions) return [];
        return rawSessions.map(schedule => ({
            id: schedule.id,
            title: schedule.title || schedule.class_name || "Class Session",
            platform: schedule.zoom_link?.includes('zoom') ? 'Zoom' :
                schedule.zoom_link?.includes('meet.google') ? 'Google Meet' :
                    schedule.zoom_link?.includes('teams') ? 'Microsoft Teams' : 'Other',
            meetingLink: schedule.zoom_link || "",
            meetingId: extractMeetingId(schedule.zoom_link),
            passcode: "-",
            scheduleDate: schedule.schedule_date || "",
            startTime: schedule.start_time ? String(schedule.start_time).substring(0, 5) : "",
            endTime: schedule.end_time ? String(schedule.end_time).substring(0, 5) : "",
            status: getSessionStatus(
                schedule.schedule_date || "",
                schedule.start_time ? String(schedule.start_time).substring(0, 8) : "",
                schedule.end_time ? String(schedule.end_time).substring(0, 8) : ""
            ),
            class_id: schedule.class_id,
            description: schedule.description || "",
        })).sort((a, b) => new Date(`${b.scheduleDate}T${b.startTime || '00:00'}`) - new Date(`${a.scheduleDate}T${a.startTime || '00:00'}`));
    }, [rawSessions]);


    const columns = [
        { key: "title", label: "Session Title" },
        {
            key: "platform",
            label: "Platform",
            render: (row) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${row.platform === "Zoom" ? "bg-blue-100 text-blue-800" :
                    row.platform === "Google Meet" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
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
                    <span className="text-gray-500">{row.startTime} - {row.endTime}</span>
                </div>
            ),
        },
        {
            key: "status",
            label: "Status",
            render: (row) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${row.status === "Active" ? "bg-green-100 text-green-800" :
                    row.status === "Scheduled" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}`}>
                    {row.status}
                </span>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (row) => (
                <button onClick={() => handleEdit(row)} className="text-blue-600 hover:text-blue-900 p-1">
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
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Classes
                    </button>

                    {sessionsLoading || classLoading ? (
                        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">Loading sessions...</div>
                    ) : (
                        <DataTable
                            title={`Sessions for ${classDetails?.class_name || "Class"}`}
                            columns={columns}
                            data={sessions}
                            onAddClick={handleAddSession}
                            showAddButton={true}
                        />
                    )}
                </div>
            </main>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleBackdropClick} />
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col z-10">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Class *</label>
                                    <div className="text-lg font-semibold text-gray-800 border rounded-lg px-4 py-2 bg-gray-50 w-full min-w-[300px]">
                                        {classDetails ? `${classDetails.class_name}${classDetails.type ? ` (${classDetails.type})` : ''}` : 'Loading Class...'}
                                    </div>
                                </div>
                                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {!editingSession && (
                                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <p className="text-gray-600 text-sm">Add up to 22 sessions at once for the selected class.</p>
                                    <button
                                        type="button"
                                        onClick={handleAddRow}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add Row
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Modal Body - Scrollable Table */}
                        <div className="overflow-y-auto flex-1 p-6">
                            <div className="min-w-full inline-block align-middle">
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/4">Session Name</th>
                                                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/4">Meeting Link</th>
                                                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/6">Date</th>
                                                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/6">Start</th>
                                                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/6">End</th>
                                                {!editingSession && <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-10"></th>}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {sessionRows.map((row, index) => (
                                                <tr key={row.id}>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="text"
                                                            value={row.title}
                                                            onChange={(e) => handleRowChange(index, "title", e.target.value)}
                                                            className="w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-blue-600 font-medium"
                                                            placeholder="Session Name"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="url"
                                                            value={row.meetingLink}
                                                            onChange={(e) => handleRowChange(index, "meetingLink", e.target.value)}
                                                            className="w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-600"
                                                            placeholder="https://..."
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="date"
                                                            value={row.scheduleDate}
                                                            onChange={(e) => handleRowChange(index, "scheduleDate", e.target.value)}
                                                            className="w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-600"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="time"
                                                            value={row.startTime}
                                                            onChange={(e) => handleRowChange(index, "startTime", e.target.value)}
                                                            className="w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-blue-600"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="time"
                                                            value={row.endTime}
                                                            onChange={(e) => handleRowChange(index, "endTime", e.target.value)}
                                                            className="w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-blue-600"
                                                        />
                                                    </td>
                                                    {!editingSession && (
                                                        <td className="px-4 py-3 text-right">
                                                            <button
                                                                onClick={() => handleRemoveRow(index)}
                                                                className="text-red-400 hover:text-red-600 transition-colors"
                                                                title="Remove Row"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                            <button
                                onClick={handleCloseModal}
                                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isCreating || isUpdating}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                {isCreating || isUpdating
                                    ? "Saving..."
                                    : (editingSession ? "Save Changes" : `Save All ${sessionRows.length} Sessions`)
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
