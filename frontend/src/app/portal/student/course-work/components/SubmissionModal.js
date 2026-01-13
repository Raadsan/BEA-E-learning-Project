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

            const uploadRes = await fetch("http://localhost:5000/api/uploads", {
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
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Submit Work</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        {/* X Icon */}
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* File Upload Area */}
                <div
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 mb-4 flex flex-col items-center justify-center text-center hover:border-blue-500 transition-colors cursor-pointer bg-gray-50 dark:bg-gray-900/50"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt"
                    />

                    {file ? (
                        <div className="flex flex-col items-center text-blue-600">
                            {/* FileText Icon */}
                            <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            <p className="font-semibold text-sm">{file.name}</p>
                            <p className="text-xs text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-gray-500">
                            {/* Upload Icon */}
                            <svg className="w-10 h-10 mb-2 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                            <p className="font-medium text-sm">Click or Drag file to upload</p>
                            <p className="text-xs opacity-60 mt-1">PDF, Word, or Text files</p>
                        </div>
                    )}
                </div>

                {/* Description Field */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description / Notes</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add any additional details here..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none h-24 text-sm"
                    />
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={uploading || !file}
                    className={`w-full py-3 rounded-xl font-bold text-lg text-white transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${uploading || !file
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/30'
                        }`}
                >
                    {uploading ? (
                        <>Uploading...</>
                    ) : (
                        <>
                            Submit Assignment
                            {/* CheckCircle Icon */}
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </>
                    )}
                </button>

            </div>
        </div>
    );
}
