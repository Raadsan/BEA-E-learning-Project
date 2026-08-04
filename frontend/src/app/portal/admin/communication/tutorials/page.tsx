"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useDarkMode } from "@/context/ThemeContext";
import { useToast } from "@/components/Toast";
import { uploadFileRequest } from "@/utils/uploadFile";
import { usePagePermissions } from "@/hooks/usePagePermissions";
import {
    useGetTutorialsQuery,
    useCreateTutorialMutation,
    useUpdateTutorialMutation,
    useDeleteTutorialMutation,
} from "@/lib/api/tutorialApi";
import TutorialPreviewOverlay from "@/components/tutorials/TutorialPreviewOverlay";
import { resolveMediaUrl } from "@/constants";

const defaultForm = () => ({
    title: "",
    description: "",
    media_type: "video" as "video" | "audio" | "image" | "document",
    media_url: "",
    status: "active",
});

export default function TutorialsPage() {
    const { isDark } = useDarkMode();
    const { showToast } = useToast();
    const { canAdd, canEdit, canDelete } = usePagePermissions("communication", "tutorials");

    const { data: tutorials = [], isLoading } = useGetTutorialsQuery(true);
    const [createTutorial, { isLoading: isCreating }] = useCreateTutorialMutation();
    const [updateTutorial, { isLoading: isUpdating }] = useUpdateTutorialMutation();
    const [deleteTutorial] = useDeleteTutorialMutation();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [previewItem, setPreviewItem] = useState<any>(null);
    const [editing, setEditing] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState(defaultForm());
    const [search, setSearch] = useState("");

    const filtered = tutorials.filter((t: any) => {
        const q = search.toLowerCase();
        if (!q) return true;
        return [t.title, t.description, t.media_type, t.status].join(" ").toLowerCase().includes(q);
    });

    const openCreate = () => {
        setEditing(null);
        setFormData(defaultForm());
        setIsFormOpen(true);
    };

    const openEdit = (item: any) => {
        setEditing(item);
        setFormData({
            title: item.title || "",
            description: item.description || "",
            media_type: (["video", "audio", "image", "document"].includes(item.media_type) ? item.media_type : "video") as "video" | "audio" | "image" | "document",
            media_url: item.media_url || "",
            status: item.status || "active",
        });
        setIsFormOpen(true);
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isVideo = file.type.startsWith("video/");
        const isAudio = file.type.startsWith("audio/");
        const isImage = file.type.startsWith("image/");
        const isDocument = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"].includes(file.type) || /\.(pdf|doc|docx|txt)$/i.test(file.name);
        if (!isVideo && !isAudio && !isImage && !isDocument) {
            showToast("Please upload video, audio, image, PDF, Word, or text files only.", "error");
            return;
        }

        setIsUploading(true);
        try {
            const result = await uploadFileRequest(file, { requireS3: true });
            setFormData((prev) => ({
                ...prev,
                media_url: result.url,
                media_type: isAudio ? "audio" : isImage ? "image" : isDocument ? "document" : "video",
            }));
            showToast("File uploaded successfully!", "success");
        } catch (err: any) {
            showToast(err.message || "Upload failed", "error");
        } finally {
            setIsUploading(false);
            e.target.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            showToast("Title is required", "error");
            return;
        }
        if (!formData.media_url) {
            showToast("Please upload a video, audio, image, or document file", "error");
            return;
        }

        try {
            if (editing) {
                await updateTutorial({ id: editing.id, ...formData }).unwrap();
                showToast("Tutorial updated!", "success");
            } else {
                await createTutorial(formData).unwrap();
                showToast("Tutorial created!", "success");
            }
            setIsFormOpen(false);
        } catch (err: any) {
            showToast(err?.data?.error || "Failed to save tutorial", "error");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Delete this tutorial?")) return;
        try {
            await deleteTutorial(id).unwrap();
            showToast("Tutorial deleted", "success");
        } catch {
            showToast("Failed to delete", "error");
        }
    };

    return (
        <main className={`flex-1 overflow-y-auto ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
            <div className="w-full px-6 sm:px-8 py-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Tutorials</h1>
                        <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            Create and manage S3-hosted videos, audio, images, and documents
                        </p>
                    </div>
                    {canAdd && (
                        <button
                            type="button"
                            onClick={openCreate}
                            className="px-4 py-2 bg-[#010080] text-white rounded-lg hover:bg-blue-900 flex items-center gap-2 text-sm font-semibold"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Tutorial
                        </button>
                    )}
                </div>

                <div className="mb-6">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search tutorials..."
                        className={`w-full max-w-md px-4 py-2 rounded-lg border text-sm ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"}`}
                    />
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20"><LoadingSpinner /></div>
                ) : filtered.length === 0 ? (
                    <div className={`text-center py-20 rounded-2xl border border-dashed ${isDark ? "border-gray-700 text-gray-400" : "border-gray-300 text-gray-500"}`}>
                        No tutorials yet. {canAdd && "Click Add Tutorial to create one."}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filtered.map((item: any) => (
                            <div
                                key={item.id}
                                className={`group flex flex-col rounded-2xl border overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 ${
                                    isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow-sm"
                                }`}
                            >
                                <button
                                    type="button"
                                    onClick={() => setPreviewItem(item)}
                                    className={`relative aspect-video w-full flex items-center justify-center overflow-hidden ${
                                        isDark ? "bg-gray-900" : "bg-gradient-to-br from-[#010080]/10 to-blue-100"
                                    }`}
                                >
                                    {item.media_type === "audio" ? (
                                        <div className="flex flex-col items-center gap-2 text-[#010080]">
                                            <svg className="w-14 h-14 opacity-80" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 3v10.55A4 4 0 1014 17V7h4V3h-6z" />
                                            </svg>
                                            <span className="text-xs font-bold uppercase tracking-wider">Audio</span>
                                        </div>
                                    ) : item.media_type === "image" && item.media_url ? (
                                        <>
                                            <img
                                                src={resolveMediaUrl(item.media_url) || ""}
                                                alt={item.title}
                                                className="absolute inset-0 h-full w-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                                            <div className="relative z-10 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow">
                                                <svg className="w-5 h-5 text-[#010080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        </>
                                    ) : item.media_type === "document" ? (
                                        <div className="flex flex-col items-center gap-2 text-[#010080]">
                                            <svg className="w-14 h-14 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V7l-5-5H7a2 2 0 00-2 2v15a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-xs font-bold uppercase tracking-wider">Document</span>
                                        </div>
                                    ) : (
                                        <>
                                            {item.media_type === "video" && item.media_url && (
                                                <video
                                                    src={`${resolveMediaUrl(item.media_url)}#t=0.1`}
                                                    muted
                                                    playsInline
                                                    preload="metadata"
                                                    className="absolute inset-0 h-full w-full object-cover"
                                                    aria-hidden="true"
                                                    onLoadedMetadata={(event) => {
                                                        const video = event.currentTarget;
                                                        if (Number.isFinite(video.duration) && video.duration > 0) {
                                                            video.currentTime = Math.min(0.1, video.duration / 2);
                                                        }
                                                    }}
                                                />
                                            )}
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                                            <div className="relative z-10 w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                                                <svg className="w-8 h-8 text-[#010080] ml-1" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </div>
                                        </>
                                    )}
                                    <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                        item.media_type === "audio"
                                            ? "bg-purple-100 text-purple-700"
                                            : item.media_type === "image"
                                            ? "bg-green-100 text-green-700"
                                            : item.media_type === "document"
                                            ? "bg-orange-100 text-orange-700"
                                            : "bg-blue-100 text-blue-700"
                                    }`}>
                                        {item.media_type}
                                    </span>
                                    {item.status === "inactive" && (
                                        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600">
                                            Inactive
                                        </span>
                                    )}
                                </button>

                                <div className="flex flex-col flex-1 p-5">
                                    <h3 className={`font-bold text-lg mb-2 line-clamp-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                                        {item.title}
                                    </h3>
                                    <p className={`text-sm flex-1 line-clamp-3 mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                        {item.description || "No description"}
                                    </p>
                                    <div className="flex gap-2 pt-3 border-t dark:border-gray-700 border-gray-100">
                                        <button
                                            type="button"
                                            onClick={() => setPreviewItem(item)}
                                            className="flex-1 py-2 text-xs font-bold rounded-lg bg-[#010080]/10 text-[#010080] hover:bg-[#010080]/20"
                                        >
                                            Play
                                        </button>
                                        {canEdit && (
                                            <button
                                                type="button"
                                                onClick={() => openEdit(item)}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                                title="Edit"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                title="Delete"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create / Edit Modal */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editing ? "Edit Tutorial" : "New Tutorial"}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Title *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"}`}
                            placeholder="Tutorial name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"}`}
                            placeholder="What is this tutorial about?"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Media Type</label>
                            <select
                                value={formData.media_type}
                                onChange={(e) => setFormData({ ...formData, media_type: e.target.value as "video" | "audio" | "image" | "document", media_url: "" })}
                                className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"}`}
                            >
                                <option value="video">Video</option>
                                <option value="audio">Audio</option>
                                <option value="image">Image</option>
                                <option value="document">Document</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"}`}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Upload {formData.media_type.charAt(0).toUpperCase() + formData.media_type.slice(1)} *</label>
                        <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                            isDark ? "border-gray-600 hover:border-blue-500 bg-gray-900/50" : "border-gray-300 hover:border-[#010080] bg-gray-50"
                        }`}>
                            <input
                                type="file"
                                accept={formData.media_type === "audio" ? "audio/*" : formData.media_type === "video" ? "video/*" : formData.media_type === "image" ? "image/*" : ".pdf,.doc,.docx,.txt"}
                                onChange={handleUpload}
                                className="hidden"
                                disabled={isUploading}
                            />
                            {isUploading ? (
                                <span className="text-sm text-gray-500">Uploading...</span>
                            ) : formData.media_url ? (
                                <span className="text-sm text-green-600 font-semibold">✓ File uploaded — click to replace</span>
                            ) : (
                                <>
                                    <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <span className="text-sm text-gray-500">Click to upload</span>
                                </>
                            )}
                        </label>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 rounded-lg border">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isCreating || isUpdating || isUploading}
                            className="px-6 py-2 bg-[#010080] text-white rounded-lg disabled:opacity-50"
                        >
                            {isCreating || isUpdating ? "Saving..." : editing ? "Update" : "Create"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Preview — large fullscreen overlay */}
            <TutorialPreviewOverlay item={previewItem} onClose={() => setPreviewItem(null)} />
        </main>
    );
}
