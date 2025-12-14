"use client";

import { useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";

export default function OnlineSessionsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        platform: "",
        meetingLink: "",
        meetingId: "",
        passcode: "",
        scheduleDate: "",
        scheduleTime: "",
        status: "Scheduled",
    });

    // Sample data
    const [sessions, setSessions] = useState([
        {
            id: 1,
            title: "Weekly Grammar Workshop",
            platform: "Zoom",
            meetingLink: "https://zoom.us/j/123456789",
            meetingId: "123 456 789",
            passcode: "grammar101",
            scheduleDate: "2024-10-25",
            scheduleTime: "14:00",
            status: "Scheduled"
        },
        {
            id: 2,
            title: "IELTS Speaking Practice",
            platform: "Google Meet",
            meetingLink: "https://meet.google.com/fad-tsap-phc",
            meetingId: "fad-tsap-phc",
            passcode: "-",
            scheduleDate: "2024-10-26",
            scheduleTime: "10:30",
            status: "Active"
        },
    ]);

    const handleAddSession = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({
            title: "",
            platform: "",
            meetingLink: "",
            meetingId: "",
            passcode: "",
            scheduleDate: "",
            scheduleTime: "",
            status: "Scheduled",
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

    const handleSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log("Saving new session:", formData);

        const newSession = {
            id: sessions.length + 1,
            ...formData
        };

        setSessions([...sessions, newSession]);
        handleCloseModal();

        return false;
    };

    const handleEdit = (session) => {
        console.log("Edit session:", session);
    };

    const columns = [
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
                    <span className="text-gray-500">{row.scheduleTime}</span>
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

            <main className="flex-1 overflow-y-auto bg-gray-50 transition-colors">
                <div className="w-full px-8 py-6">
                    <DataTable
                        title="Online Session Links"
                        columns={columns}
                        data={sessions}
                        onAddClick={handleAddSession}
                        showAddButton={true}
                    />
                </div>
            </main>

            {/* Add Session Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center"
                    style={{ pointerEvents: 'none' }}
                >
                    <div
                        className="absolute inset-0 bg-black bg-opacity-20"
                        onClick={handleBackdropClick}
                        style={{ pointerEvents: 'auto' }}
                    />

                    <div
                        className="relative bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4"
                        onClick={(e) => e.stopPropagation()}
                        style={{ pointerEvents: 'auto' }}
                    >
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-800">Schedule New Session</h2>
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

                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                        Status
                                    </label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Scheduled">Scheduled</option>
                                        <option value="Active">Active (Happening Now)</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
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
                                    <label htmlFor="scheduleTime" className="block text-sm font-medium text-gray-700 mb-1">
                                        Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        id="scheduleTime"
                                        name="scheduleTime"
                                        value={formData.scheduleTime}
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
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Schedule Session
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
