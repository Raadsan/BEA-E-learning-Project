"use client";

import { useState } from "react";
import Image from "next/image";

import DataTable from "@/components/DataTable";
import { useDarkMode } from "@/context/ThemeContext";
import { useToast } from "@/components/Toast";
import { API_URL, resolveMediaUrl } from "@/constants";
import { uploadFileRequest } from "@/utils/uploadFile";
import {
    useGetNewsQuery,
    useCreateNewsMutation,
    useUpdateNewsMutation,
    useDeleteNewsMutation
} from "@/lib/api/newsApi";

const toDateTimeLocal = (value?: string | null) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const formatDate = (value?: string | null) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString();
};

const formatTime = (value?: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const defaultFormData = () => ({
    title: "",
    description: "",
    event_date: toDateTimeLocal(new Date().toISOString()),
    type: "news",
    status: "active",
    image_url: "",
    location: "",
});

export default function NewsPage() {
    const { isDark } = useDarkMode();
    const { showToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedNews, setSelectedNews] = useState<any>(null);
    const [editingNews, setEditingNews] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState(defaultFormData());

    const { data: newsList, isLoading } = useGetNewsQuery(true);
    const [createNews, { isLoading: isCreating }] = useCreateNewsMutation();
    const [updateNews, { isLoading: isUpdating }] = useUpdateNewsMutation();
    const [deleteNews] = useDeleteNewsMutation();

    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: null as (() => Promise<void>) | null,
        isLoading: false,
    });

    const handleAddClick = () => {
        setEditingNews(null);
        setFormData(defaultFormData());
        setIsModalOpen(true);
    };

    const handleEditClick = (newsItem: any) => {
        if (!newsItem) return;
        setEditingNews(newsItem);
        setFormData({
            title: newsItem.title || "",
            description: newsItem.description || "",
            event_date: toDateTimeLocal(newsItem.event_date),
            type: newsItem.type || "news",
            status: newsItem.status || "active",
            image_url: newsItem.image_url || "",
            location: newsItem.location || "",
        });
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id: number) => {
        setConfirmationModal({
            isOpen: true,
            title: "Delete News/Event",
            message: "Are you sure you want to delete this item?",
            onConfirm: async () => {
                setConfirmationModal((prev) => ({ ...prev, isLoading: true }));
                try {
                    await deleteNews(id).unwrap();
                    setConfirmationModal({ isOpen: false, title: "", message: "", onConfirm: null, isLoading: false });
                    showToast("Item deleted successfully", "success");
                } catch (error) {
                    console.error("Failed to delete", error);
                    setConfirmationModal((prev) => ({ ...prev, isLoading: false }));
                    showToast("Failed to delete item.", "error");
                }
            },
            isLoading: false,
        });
    };

    const handleViewClick = (newsItem: any) => {
        if (!newsItem) return;
        setSelectedNews(newsItem);
        setIsViewModalOpen(true);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            showToast("Please upload an image file", "error");
            return;
        }

        try {
            setIsUploading(true);
            const data = await uploadFileRequest(file);
            setFormData((prev) => ({
                ...prev,
                image_url: data.url,
            }));
            showToast("Image uploaded successfully!", "success");
        } catch (err) {
            console.error("Upload error:", err);
            showToast(err instanceof Error ? err.message : "Failed to upload image", "error");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            title: formData.title.trim(),
            description: formData.description.trim(),
            event_date: new Date(formData.event_date).toISOString(),
            type: formData.type,
            status: formData.status,
            image_url: formData.image_url || null,
            location: formData.location.trim() || null,
        };

        try {
            if (editingNews) {
                await updateNews({ id: editingNews.id, ...payload }).unwrap();
                showToast("Updated successfully", "success");
            } else {
                await createNews(payload).unwrap();
                showToast("Created successfully", "success");
            }
            setIsModalOpen(false);
        } catch (error: any) {
            console.error("Failed to save", error);
            showToast(error?.data?.error || "Failed to save item.", "error");
        }
    };

    const columns = [
        {
            key: "image_url",
            label: "Image",
            width: "80px",
            render: (_: unknown, row: any) => (
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    {row.image_url ? (
                        <img
                            src={resolveMediaUrl(row.image_url) || row.image_url}
                            alt={row.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-xs text-gray-400">No image</span>
                    )}
                </div>
            ),
        },
        { key: "title", label: "Title" },
        {
            key: "description",
            label: "Description",
            render: (val: string) => (
                <span className="text-gray-700 dark:text-gray-300 max-w-xs truncate block" title={val || ""}>
                    {val || "-"}
                </span>
            ),
        },
        {
            key: "event_date",
            label: "Date",
            render: (val: string) => formatDate(val),
        },
        {
            key: "event_time",
            label: "Time",
            render: (_: unknown, row: any) => formatTime(row.event_date),
        },
        {
            key: "type",
            label: "Type",
            render: (val: string) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize 
          ${val === "exam" ? "bg-red-100 text-red-800" :
                        val === "deadline" ? "bg-orange-100 text-orange-800" :
                            val === "event" ? "bg-purple-100 text-purple-800" :
                                val === "training" ? "bg-blue-100 text-blue-800" :
                                    "bg-gray-100 text-gray-800"
                    }`}>
                    {val || "-"}
                </span>
            ),
        },
        {
            key: "status",
            label: "Status",
            render: (val: string) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${val === "active"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }`}>
                    {val || "-"}
                </span>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (_: unknown, row: any) => (
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => handleViewClick(row)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="View"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleEditClick(row)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
                        title="Edit"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDeleteClick(row.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            ),
        },
    ];

    return (
        <>
            <div className="flex-1 overflow-y-auto bg-gray-50 transition-colors">
                <div className="w-full px-8 py-6">
                    <DataTable
                        title="News & Events"
                        columns={columns}
                        data={newsList || []}
                        showAddButton={true}
                        onAddClick={handleAddClick}
                        isLoading={isLoading}
                    />
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-lg shadow-xl ${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
                        <h3 className="text-xl font-bold mb-4">{editingNews ? "Edit News/Event" : "Create News/Event"}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? "bg-gray-700 border-gray-600" : "border-gray-300"}`}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? "bg-gray-700 border-gray-600" : "border-gray-300"}`}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Image</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                                        {formData.image_url ? (
                                            <img
                                                src={resolveMediaUrl(formData.image_url) || formData.image_url}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-xs text-gray-400 text-center px-2">No image</span>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium text-center ${isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"}`}>
                                            {isUploading ? "Uploading..." : formData.image_url ? "Change Image" : "Upload Image"}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleFileUpload}
                                                disabled={isUploading}
                                            />
                                        </label>
                                        {formData.image_url && (
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, image_url: "" })}
                                                className="text-sm text-red-600 hover:text-red-700"
                                            >
                                                Remove image
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Location</label>
                                <input
                                    type="text"
                                    placeholder="e.g. BEA Campus, Mogadishu"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? "bg-gray-700 border-gray-600" : "border-gray-300"}`}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? "bg-gray-700 border-gray-600" : "border-gray-300"}`}
                                    >
                                        <option value="news">News</option>
                                        <option value="event">Event</option>
                                        <option value="exam">Exam</option>
                                        <option value="deadline">Deadline</option>
                                        <option value="training">Training</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={formData.event_date}
                                        onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? "bg-gray-700 border-gray-600" : "border-gray-300"}`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? "bg-gray-700 border-gray-600" : "border-gray-300"}`}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className={`px-4 py-2 rounded-lg ${isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating || isUpdating || isUploading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isCreating || isUpdating ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isViewModalOpen && selectedNews && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)} />
                    <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-lg shadow-xl ${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
                        <div className="flex justify-between items-start mb-4 gap-4">
                            <h3 className="text-2xl font-bold">{selectedNews.title}</h3>
                            <button type="button" onClick={() => setIsViewModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {selectedNews.image_url && (
                            <div className="relative w-full h-56 mb-4 rounded-lg overflow-hidden">
                                <Image
                                    src={resolveMediaUrl(selectedNews.image_url) || selectedNews.image_url}
                                    alt={selectedNews.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className={`p-4 rounded-lg border ${isDark ? "bg-gray-700/50 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                                <p className="text-sm font-semibold mb-2 opacity-75 uppercase tracking-wide">Description</p>
                                <p className="whitespace-pre-wrap">{selectedNews.description || "-"}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className={`p-3 rounded-lg ${isDark ? "bg-gray-700/30" : "bg-blue-50"}`}>
                                    <p className="text-xs font-semibold opacity-75 uppercase">Type</p>
                                    <p className="font-medium capitalize">{selectedNews.type || "-"}</p>
                                </div>
                                <div className={`p-3 rounded-lg ${isDark ? "bg-gray-700/30" : "bg-blue-50"}`}>
                                    <p className="text-xs font-semibold opacity-75 uppercase">Status</p>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${selectedNews.status === "active"
                                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                        : "bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300"
                                        }`}>
                                        {selectedNews.status || "-"}
                                    </span>
                                </div>
                                <div className={`p-3 rounded-lg ${isDark ? "bg-gray-700/30" : "bg-blue-50"}`}>
                                    <p className="text-xs font-semibold opacity-75 uppercase">Date</p>
                                    <p className="font-medium">{formatDate(selectedNews.event_date)}</p>
                                </div>
                                <div className={`p-3 rounded-lg ${isDark ? "bg-gray-700/30" : "bg-blue-50"}`}>
                                    <p className="text-xs font-semibold opacity-75 uppercase">Time</p>
                                    <p className="font-medium">{formatTime(selectedNews.event_date)}</p>
                                </div>
                                <div className={`p-3 rounded-lg ${isDark ? "bg-gray-700/30" : "bg-blue-50"}`}>
                                    <p className="text-xs font-semibold opacity-75 uppercase">Location</p>
                                    <p className="font-medium">{selectedNews.location || "-"}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsViewModalOpen(false)}
                                className={`px-4 py-2 rounded-lg ${isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"}`}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirmationModal.isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !confirmationModal.isLoading && setConfirmationModal((prev) => ({ ...prev, isOpen: false }))} />
                    <div className={`relative w-full max-w-md p-6 rounded-lg shadow-xl ${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
                        <h3 className="text-xl font-bold mb-3">{confirmationModal.title}</h3>
                        <p className={`mb-6 ${isDark ? "text-gray-300" : "text-gray-600"}`}>{confirmationModal.message}</p>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setConfirmationModal((prev) => ({ ...prev, isOpen: false }))} disabled={confirmationModal.isLoading} className={`px-4 py-2 rounded-lg font-medium transition-colors ${isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"}`}>Cancel</button>
                            <button type="button" onClick={confirmationModal.onConfirm || undefined} disabled={confirmationModal.isLoading} className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 flex items-center gap-2">{confirmationModal.isLoading && <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>} Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
