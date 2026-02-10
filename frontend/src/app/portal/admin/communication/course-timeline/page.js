"use client";

import { useState, useEffect } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import DataTable from "@/components/DataTable";
import { useToast } from "@/components/Toast";
import { API_URL } from "@/constants";

export default function CourseTimelinePage() {
    const { isDark } = useDarkMode();
    const { showToast } = useToast();
    const [timelines, setTimelines] = useState([]);
    const [filteredTimelines, setFilteredTimelines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingTimeline, setEditingTimeline] = useState(null);
    const [timelineToDelete, setTimelineToDelete] = useState(null);
    const [selectedYear, setSelectedYear] = useState("All");
    const [years, setYears] = useState(["All"]);
    const [formData, setFormData] = useState({
        term_serial: "",
        start_date: "",
        end_date: "",
        holidays: "",
    });

    // Fetch timelines
    const fetchTimelines = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/course-timeline/admin`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();
            setTimelines(data);

            // Extract unique years
            const extractedYears = ["All", ...new Set(data.map(t => {
                const date = new Date(t.start_date);
                return date.getFullYear().toString();
            }))].sort((a, b) => b - a);
            setYears(extractedYears);
        } catch (err) {
            console.error("Error fetching timelines:", err);
            setTimelines([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTimelines();
    }, []);

    // Filter timelines by year
    useEffect(() => {
        if (selectedYear === "All") {
            setFilteredTimelines(timelines);
        } else {
            const filtered = timelines.filter(t => {
                const year = new Date(t.start_date).getFullYear().toString();
                return year === selectedYear;
            });
            setFilteredTimelines(filtered);
        }
    }, [selectedYear, timelines]);

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Open modal for create
    const handleCreate = () => {
        setEditingTimeline(null);
        setFormData({
            term_serial: "",
            start_date: "",
            end_date: "",
            holidays: "",
        });
        setShowModal(true);
    };

    // Open modal for edit
    const handleEdit = (timeline) => {
        setEditingTimeline(timeline);
        setFormData({
            term_serial: timeline.term_serial,
            start_date: timeline.start_date,
            end_date: timeline.end_date,
            holidays: timeline.holidays || "",
        });
        setShowModal(true);
    };

    // Submit form (create or update)
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");
            const url = editingTimeline
                ? `${API_URL}/course-timeline/${editingTimeline.id}`
                : `${API_URL}/course-timeline`;

            const method = editingTimeline ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to save timeline");
            }

            showToast(editingTimeline ? "Timeline updated successfully!" : "Timeline created successfully!", "success");
            setShowModal(false);
            fetchTimelines();
        } catch (err) {
            showToast(err.message, "error");
        }
    };

    // Open delete confirmation modal
    const handleDeleteClick = (timeline) => {
        setTimelineToDelete(timeline);
        setShowDeleteModal(true);
    };

    // Confirm and execute delete
    const confirmDelete = async () => {
        if (!timelineToDelete) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/course-timeline/${timelineToDelete.id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("Failed to delete timeline");

            showToast("Timeline deleted successfully!", "success");
            setShowDeleteModal(false);
            setTimelineToDelete(null);
            fetchTimelines();
        } catch (err) {
            showToast(err.message, "error");
        }
    };

    // Format date for display (YYYY-MM-DD to DD/MM/YYYY)
    const formatDateForDisplay = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // DataTable columns configuration
    const columns = [
        { key: "term_serial", label: "Term Serial", width: "150px" },
        {
            key: "start_date",
            label: "Start Date",
            width: "150px",
            render: (value, row) => row.start_date_display || formatDateForDisplay(value),
        },
        {
            key: "end_date",
            label: "End Date",
            width: "150px",
            render: (value, row) => row.end_date_display || formatDateForDisplay(value),
        },
        {
            key: "holidays",
            label: "Holidays",
            width: "300px",
            render: (value) => value || <span className="text-gray-400 italic">No holidays</span>,
        },
        {
            key: "is_active",
            label: "Status",
            width: "120px",
            render: (value) => (
                <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${value ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                >
                    {value ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            width: "120px",
            render: (_, row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleEdit(row)}
                        className="text-blue-600 p-1 hover:bg-blue-50 rounded"
                        title="Edit"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                        </svg>
                    </button>
                    <button
                        onClick={() => handleDeleteClick(row)}
                        className="text-red-600 p-1 hover:bg-red-50 rounded"
                        title="Delete"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                    </button>
                </div>
            ),
        },
    ];

    if (loading) {
        return (
            <main className="flex-1 p-6 text-center text-gray-600">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4">Loading timelines...</p>
            </main>
        );
    }

    return (
        <>
            <main className="flex-1 bg-gray-50">
                <div className="w-full px-8 py-6">
                    {/* DataTable */}
                    <DataTable
                        title="Course Timeline Management"
                        columns={columns}
                        data={filteredTimelines}
                        onAddClick={handleCreate}
                        showAddButton={true}
                        emptyMessage="No timeline entries found for the selected year."
                        customHeaderLeft={
                            <div className="flex items-center ml-4">
                                <label className="text-sm text-gray-600 dark:text-gray-300 mr-2">Filter Year:</label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {years.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                        }
                    />
                </div>
            </main>

            {/* Modal for Create/Edit */}
            {showModal && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowModal(false)}
                    />
                    <div
                        className={`relative rounded-xl shadow-lg w-full max-w-2xl overflow-hidden border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                            }`}
                    >
                        {/* Modal Header */}
                        <div className={`border-b px-6 py-4 flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                            }`}>
                            <h2 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                {editingTimeline ? "Edit Timeline" : "Create New Timeline"}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className={`transition-colors ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Term Serial <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="term_serial"
                                        value={formData.term_serial}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g. BEA-01"
                                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'
                                            }`}
                                    />
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Start Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={formData.start_date}
                                        onChange={handleInputChange}
                                        required
                                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-600'
                                            }`}
                                    />
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        End Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        value={formData.end_date}
                                        onChange={handleInputChange}
                                        required
                                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-600'
                                            }`}
                                    />
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Holidays (Optional)
                                    </label>
                                    <textarea
                                        name="holidays"
                                        value={formData.holidays}
                                        onChange={handleInputChange}
                                        rows="3"
                                        placeholder="e.g. 19th to the 20th of March 2026—Eid-Alfitr Celebration"
                                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'
                                            }`}
                                    />
                                </div>
                            </div>

                            <div className={`mt-6 pt-6 border-t flex justify-end gap-3 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className={`px-4 py-2 border-2 rounded-xl font-medium transition-all ${isDark
                                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
                                >
                                    {editingTimeline ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* custom Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowDeleteModal(false)}
                    />
                    <div
                        className={`relative rounded-xl shadow-lg p-8 max-w-md w-full border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                            }`}
                    >
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                                <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className={`text-2xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Delete Timeline</h3>
                            <p className={`text-sm mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Are you sure you want to delete <span className="font-medium text-red-600">"{timelineToDelete?.term_serial}"</span>? This action cannot be undone.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className={`flex-1 px-4 py-3 border-2 rounded-xl font-medium transition-all ${isDark
                                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-red-500/30"
                                >
                                    Delete Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
