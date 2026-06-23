import { useState, useRef } from "react";
import { useToast } from "@/components/Toast";
import { useSubmitAssignmentMutation } from "@/lib/api/assignmentApi";
import { useDarkMode } from "@/context/ThemeContext";

const ACCEPTED_FILE_TYPES = ".pdf,.doc,.docx,.txt";
const ACCEPTED_FILE_LABEL = "PDF, Word (.doc, .docx), or Text (.txt)";

function formatDateTime(value?: string | null) {
    if (!value) return "Not set";
    return new Date(value).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getSubmitErrorMessage(err: unknown): string {
    if (typeof err === "object" && err !== null) {
        const e = err as {
            status?: number | string;
            data?: { error?: string; message?: string };
            error?: string;
        };
        if (e.data?.error) return e.data.error;
        if (e.data?.message) return e.data.message;
        if (typeof e.error === "string" && e.error) return e.error;
        if (e.status === "FETCH_ERROR") {
            return "Could not reach the server. Check your connection and try again.";
        }
        if (typeof e.status === "number") {
            return `Submission failed (${e.status}). Please try again.`;
        }
    }
    return "Failed to submit assignment";
}

export default function SubmissionModal({ assignment, onClose, onSuccess }) {
    const { isDark } = useDarkMode();
    const [file, setFile] = useState<File | null>(null);
    const [description, setDescription] = useState("");
    const [uploading, setUploading] = useState(false);
    const [submitAssignment] = useSubmitAssignmentMutation();
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const instructions =
        assignment?.requirements?.trim() ||
        assignment?.description?.trim() ||
        "Follow your teacher's instructions and upload your completed work as a file.";

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
            setFile(droppedFile);
        }
    };

    const handleSubmit = async () => {
        if (!file) {
            showToast("Please upload your assignment file before submitting.", "error");
            return;
        }

        try {
            setUploading(true);

            const formData = new FormData();
            formData.append("assignment_id", assignment.id.toString());
            formData.append("content", description.trim() || "File submission");
            formData.append("type", "course_work");
            formData.append("file", file);

            await submitAssignment(formData).unwrap();

            showToast("Assignment submitted successfully!", "success");
            onSuccess();
            onClose();
        } catch (err: unknown) {
            showToast(getSubmitErrorMessage(err), "error");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <div
                className={`relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
                    isDark ? "bg-gray-800 border border-gray-700" : "bg-white"
                }`}
            >
                {/* Header */}
                <div
                    className={`px-6 py-4 flex items-start justify-between gap-4 border-b shrink-0 ${
                        isDark ? "border-gray-700 bg-gray-800" : "border-gray-100 bg-gray-50"
                    }`}
                >
                    <div className="min-w-0">
                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                            Submit Assignment
                        </p>
                        <h3 className={`text-lg font-bold truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                            {assignment?.title || "Course Work"}
                        </h3>
                        {assignment?.unit && (
                            <p className={`text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                {assignment.unit}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg shrink-0 transition-colors ${
                            isDark ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-200 text-gray-500"
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-6 space-y-5">
                    {/* Assignment details */}
                    <div className="flex flex-wrap gap-3">
                        <div
                            className={`px-4 py-2 rounded-xl text-center border min-w-[100px] ${
                                isDark ? "bg-gray-900/50 border-gray-700" : "bg-gray-50 border-gray-100"
                            }`}
                        >
                            <div className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">Marks</div>
                            <div className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                                {assignment?.total_points || 0} PTS
                            </div>
                        </div>
                        <div
                            className={`px-4 py-2 rounded-xl text-center border min-w-[120px] ${
                                isDark ? "bg-gray-900/50 border-gray-700" : "bg-gray-50 border-gray-100"
                            }`}
                        >
                            <div className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">Due Date</div>
                            <div className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                                {formatDateTime(assignment?.due_date)}
                            </div>
                        </div>
                        {assignment?.start_date && (
                            <div
                                className={`px-4 py-2 rounded-xl text-center border min-w-[120px] ${
                                    isDark ? "bg-gray-900/50 border-gray-700" : "bg-gray-50 border-gray-100"
                                }`}
                            >
                                <div className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">Opened</div>
                                <div className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                                    {formatDateTime(assignment.start_date)}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Instructions / requirements */}
                    <div
                        className={`p-5 rounded-2xl border ${
                            isDark ? "bg-gray-900/40 border-gray-700" : "bg-blue-50/50 border-blue-100"
                        }`}
                    >
                        <h4
                            className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${
                                isDark ? "text-blue-400" : "text-blue-700"
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            Assignment Requirements
                        </h4>
                        <p
                            className={`text-sm leading-relaxed whitespace-pre-wrap ${
                                isDark ? "text-gray-300" : "text-gray-700"
                            }`}
                        >
                            {instructions}
                        </p>
                    </div>

                    {/* File upload */}
                    <div>
                        <label className={`block text-sm font-semibold mb-2 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                            Upload File <span className="text-red-500">*</span>
                        </label>
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                                file
                                    ? isDark
                                        ? "border-emerald-600/50 bg-emerald-900/10"
                                        : "border-emerald-300 bg-emerald-50/50"
                                    : isDark
                                      ? "border-gray-600 hover:border-blue-500 hover:bg-gray-700/30"
                                      : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/30"
                            }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={handleFileChange}
                                className="hidden"
                                accept={ACCEPTED_FILE_TYPES}
                            />
                            {file ? (
                                <div className="flex flex-col items-center gap-2">
                                    <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className={`text-sm font-semibold ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
                                        {file.name}
                                    </p>
                                    <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                        Click to change file
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <svg className={`w-8 h-8 ${isDark ? "text-gray-500" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <p className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                        Drag & drop or click to upload
                                    </p>
                                    <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                        {ACCEPTED_FILE_LABEL}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Optional note */}
                    <div>
                        <label className={`block text-sm font-semibold mb-2 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                            Description / Notes <span className={`font-normal text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>(optional)</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add any notes for your teacher..."
                            rows={3}
                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none ${
                                isDark
                                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                            }`}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div
                    className={`px-6 py-4 border-t flex justify-end gap-3 shrink-0 ${
                        isDark ? "border-gray-700 bg-gray-800/80" : "border-gray-100 bg-gray-50"
                    }`}
                >
                    <button
                        onClick={onClose}
                        disabled={uploading}
                        className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
                            isDark
                                ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                        }`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={uploading || !file}
                        className={`px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors ${
                            uploading || !file
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-900/10"
                        }`}
                    >
                        {uploading ? "Submitting..." : "Submit Assignment"}
                    </button>
                </div>
            </div>
        </div>
    );
}
