"use client";

import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/Toast";
import { useUploadFileMutation } from "@/redux/api/uploadApi";
import { API_BASE_URL } from "@/constants";

export default function CertificateForm({ isOpen, onClose, target, certificate, onSave, isSaving, isDark }) {
    const { showToast } = useToast();
    const fileInputRef = useRef(null);
    const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();

    const [formData, setFormData] = useState({
        template_url: "",
        name_x: 500,
        name_y: 500,
        font_size: 40,
        font_color: "#000000"
    });

    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    useEffect(() => {
        if (certificate) {
            setFormData({
                template_url: certificate.template_url,
                name_x: certificate.name_x,
                name_y: certificate.name_y,
                font_size: certificate.font_size,
                font_color: certificate.font_color
            });
            if (certificate.template_url) {
                setPreviewUrl(`${API_BASE_URL}${certificate.template_url}`);
            }
        }
    }, [certificate]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => setPreviewUrl(reader.result);
                reader.readAsDataURL(selectedFile);
            } else if (selectedFile.type === 'application/pdf') {
                setPreviewUrl(URL.createObjectURL(selectedFile));
                showToast("PDF Template selected.", "info");
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name.includes('_x') || name.includes('_y') || name === 'font_size' ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let finalTemplateUrl = formData.template_url;

            // 1. Upload file if selected
            if (file) {
                const uploadFormData = new FormData();
                uploadFormData.append("file", file);

                const result = await uploadFile(uploadFormData).unwrap();
                finalTemplateUrl = result.url;
            }

            if (!finalTemplateUrl) {
                showToast("Please upload a template file", "error");
                return;
            }

            // 2. Save certificate metadata
            await onSave({
                target_id: target.id,
                target_type: target.type,
                template_url: finalTemplateUrl,
                ...formData,
                template_url: finalTemplateUrl
            }).unwrap();

            showToast("Certificate configuration saved successfully!", "success");
            onClose();
        } catch (error) {
            showToast(error.message || "Failed to save configuration", "error");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-inherit z-10">
                    <div>
                        <h2 className="text-xl font-bold">Configure Certificate</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Target: {target.name} ({target.type})</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* File Upload & Preview */}
                        <div className="space-y-4">
                            <label className="block text-sm font-semibold mb-2">Certificate Template (PDF or Image)</label>
                            <div
                                onClick={() => fileInputRef.current.click()}
                                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:border-blue-500 ${isDark ? 'border-gray-600 bg-gray-700/50' : 'border-gray-300 bg-gray-50'}`}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*,application/pdf"
                                    onChange={handleFileChange}
                                />
                                <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                <p className="text-sm font-medium">Click to upload template</p>
                                <p className="text-xs text-gray-500 mt-1">Supports PNG, JPG, or PDF</p>
                            </div>

                            {previewUrl && (
                                <div className="relative border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 aspect-[1.414/1] flex items-center justify-center group">
                                    {file?.type === 'application/pdf' || (previewUrl.toLowerCase().endsWith('.pdf') && !file) ? (
                                        <iframe
                                            src={previewUrl}
                                            className="w-full h-full border-none pointer-events-none"
                                            title="PDF Preview"
                                        />
                                    ) : (
                                        <img src={previewUrl} alt="Preview" className="w-full h-auto" />
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-50">Horizontal Position (X)</label>
                                    <input
                                        type="number"
                                        name="name_x"
                                        value={formData.name_x}
                                        onChange={handleInputChange}
                                        className={`w-full p-3 rounded-lg border transition-all ${isDark ? 'bg-gray-700 border-gray-600 outline-none focus:ring-1 focus:ring-blue-500' : 'bg-gray-50 border-gray-200 outline-none focus:ring-1 focus:ring-blue-500'}`}
                                        placeholder="E.g. 500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-50">Vertical Position (Y)</label>
                                    <input
                                        type="number"
                                        name="name_y"
                                        value={formData.name_y}
                                        onChange={handleInputChange}
                                        className={`w-full p-3 rounded-lg border transition-all ${isDark ? 'bg-gray-700 border-gray-600 outline-none focus:ring-1 focus:ring-blue-500' : 'bg-gray-50 border-gray-200 outline-none focus:ring-1 focus:ring-blue-500'}`}
                                        placeholder="E.g. 500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-50">Font Size</label>
                                    <input
                                        type="number"
                                        name="font_size"
                                        value={formData.font_size}
                                        onChange={handleInputChange}
                                        className={`w-full p-3 rounded-lg border transition-all ${isDark ? 'bg-gray-700 border-gray-600 outline-none focus:ring-1 focus:ring-blue-500' : 'bg-gray-50 border-gray-200 outline-none focus:ring-1 focus:ring-blue-500'}`}
                                        placeholder="E.g. 40"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-50">Font Color (HEX)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            name="font_color"
                                            value={formData.font_color}
                                            onChange={handleInputChange}
                                            className={`h-11 w-11 rounded-lg border cursor-pointer ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}
                                        />
                                        <input
                                            type="text"
                                            name="font_color"
                                            value={formData.font_color}
                                            onChange={handleInputChange}
                                            className={`flex-1 p-3 rounded-lg border transition-all font-mono uppercase ${isDark ? 'bg-gray-700 border-gray-600 outline-none focus:ring-1 focus:ring-blue-500' : 'bg-gray-50 border-gray-200 outline-none focus:ring-1 focus:ring-blue-500'}`}
                                            placeholder="#000000"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={`p-4 rounded-xl border-2 border-dashed ${isDark ? 'border-blue-900/30 bg-blue-900/10' : 'border-blue-100 bg-blue-50'}`}>
                                <h3 className="font-bold text-sm mb-1 text-blue-600 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Setup Tip
                                </h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                    The values range from 0 to 1000. For example, <b>X: 500</b> and <b>Y: 500</b> puts the name exactly in the center. Adjust these to match your template perfectly.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-5 py-2.5 text-sm font-bold border-2 rounded-xl transition-all ${isDark ? 'hover:bg-gray-700 text-gray-300 border-gray-600' : 'hover:bg-gray-100 text-gray-700 border-gray-300'}`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || isUploading}
                            className={`px-8 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 flex items-center gap-2`}
                        >
                            {(isSaving || isUploading) && <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                            {isUploading ? "Uploading..." : (isSaving ? "Saving..." : (certificate ? "Update Configuration" : "Save Configuration"))}
                        </button>
                    </div>
                </form>
            </div>
            <style jsx>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
}
