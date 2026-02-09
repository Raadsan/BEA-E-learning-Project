import { useState, useRef } from "react";
import { useToast } from "@/components/Toast";
import { useSubmitAssignmentMutation } from "@/redux/api/assignmentApi";

export default function SubmissionModal({ assignment, onClose, onSuccess }) {
    const [file, setFile] = useState(null);
    const [description, setDescription] = useState("");
    const [uploading, setUploading] = useState(false);
    const [submitAssignment] = useSubmitAssignmentMutation();
    const { showToast } = useToast();
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            setFile(droppedFile);
        }
    };

    const handleSubmit = async () => {
        if (!file) {
            showToast("Please upload a file first.", "error");
            return;
        }

        try {
            setUploading(true);

            // 1. Upload File
            const formData = new FormData();
            formData.append("file", file);

            const uploadRes = await fetch("${API_URL}/uploads", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: formData,
            });

            if (!uploadRes.ok) {
                throw new Error("File upload failed");
            }

            const uploadData = await uploadRes.json();
            const fileUrl = uploadData.url;

            // 2. Submit Assignment with File URL and Description
            await submitAssignment({
                assignment_id: assignment.id,
                content: description || "File submission", // Use description if provided, otherwise default text
                file_url: fileUrl,
                type: 'course_work'
            }).unwrap();

            showToast("Assignment submitted successfully!", "success");
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            showToast(err.message || "Failed to submit assignment", "error");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            {/* Backdrop - No onClick, so it won't close when clicked */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 transition-all transform scale-100">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Submit Assignment</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Simplified File Input */}
                <div className="mb-4">
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Upload File</label>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        accept=".pdf,.doc,.docx,.txt"
                    />
                    {file && <p className="mt-1 text-xs text-green-600">Selected: {file.name}</p>}
                </div>

                {/* Simple Textarea */}
                <div className="mb-6">
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Optional notes..."
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 h-24 text-sm bg-white dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>

                {/* Normal Button */}
                <button
                    onClick={handleSubmit}
                    disabled={uploading || !file}
                    className={`w-full py-2.5 rounded-md text-sm font-medium text-white transition-colors ${uploading || !file ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {uploading ? 'Uploading...' : 'Submit'}
                </button>
            </div>
        </div>
    );
}
