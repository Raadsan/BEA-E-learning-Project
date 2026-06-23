"use client";

import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/Toast";
import { useUploadFileMutation } from "@/lib/api/uploadApi";
import { resolveMediaUrl } from "@/constants";
import {
    CERTIFICATE_FIELD_KEYS,
    CERTIFICATE_FIELD_LABELS,
    CERTIFICATE_FIELD_SAMPLES,
    DEFAULT_FIELDS_CONFIG,
    normalizeFieldsConfig,
} from "@/utils/certificateFields";

export default function CertificateForm({ isOpen, onClose, certificate, onSave, isSaving, isDark }) {
    const { showToast } = useToast();
    const fileInputRef = useRef(null);
    const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();

    const [templateUrl, setTemplateUrl] = useState("");
    const [fieldsConfig, setFieldsConfig] = useState(DEFAULT_FIELDS_CONFIG);
    const [activeField, setActiveField] = useState("student_name");
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    useEffect(() => {
        if (certificate) {
            setTemplateUrl(certificate.template_url || "");
            setFieldsConfig(normalizeFieldsConfig(certificate.fields_config, certificate));
            if (certificate.template_url) {
                setPreviewUrl(resolveMediaUrl(certificate.template_url) || "");
            }
        } else {
            setTemplateUrl("");
            setFieldsConfig(DEFAULT_FIELDS_CONFIG);
            setPreviewUrl("");
        }
    }, [certificate]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            if (selectedFile.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onloadend = () => setPreviewUrl(reader.result as string);
                reader.readAsDataURL(selectedFile);
            } else if (selectedFile.type === "application/pdf") {
                setPreviewUrl(URL.createObjectURL(selectedFile));
                showToast("PDF template selected.", "info");
            }
        }
    };

    const updateField = (fieldKey, key, value) => {
        setFieldsConfig((prev) => ({
            ...prev,
            [fieldKey]: {
                ...prev[fieldKey],
                [key]:
                    key === "enabled"
                        ? value
                        : key === "font_color"
                          ? value
                          : parseInt(value, 10) || 0,
            },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let finalTemplateUrl = templateUrl;

            if (file) {
                const uploadFormData = new FormData();
                uploadFormData.append("file", file);
                const result = await uploadFile(uploadFormData).unwrap();
                finalTemplateUrl = result.url;
            }

            if (!finalTemplateUrl) {
                showToast("Please upload a certificate template file", "error");
                return;
            }

            await onSave({
                is_global: true,
                template_url: finalTemplateUrl,
                fields_config: fieldsConfig,
                name_x: fieldsConfig.student_name.x,
                name_y: fieldsConfig.student_name.y,
                font_size: fieldsConfig.student_name.font_size,
                font_color: fieldsConfig.student_name.font_color,
            }).unwrap();

            showToast("Global certificate template saved successfully!", "success");
            onClose();
        } catch (error) {
            showToast(error?.data?.error || error.message || "Failed to save template", "error");
        }
    };

    if (!isOpen) return null;

    const activeConfig = fieldsConfig[activeField];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className={`w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl ${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-inherit z-10">
                    <div>
                        <h2 className="text-xl font-bold">Global Certificate Template</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            One template for all programs and subprograms. Student details are added automatically when a certificate is issued.
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    <div className={`p-4 rounded-xl border ${isDark ? "border-blue-900/40 bg-blue-900/10" : "border-blue-100 bg-blue-50"}`}>
                        <h3 className="font-bold text-sm mb-2 text-[#010080]">How this works</h3>
                        <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1.5 list-disc pl-4">
                            <li>Upload <strong>one</strong> certificate design (PDF or image).</li>
                            <li>Set where each field appears: student name, ID, program, subprogram, grade, and date.</li>
                            <li>When a student completes a subprogram, their certificate uses this same template with their own data.</li>
                        </ul>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="block text-sm font-semibold">Certificate Template (PDF or Image)</label>
                            <div
                                onClick={() => fileInputRef.current.click()}
                                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:border-blue-500 ${isDark ? "border-gray-600 bg-gray-700/50" : "border-gray-300 bg-gray-50"}`}
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
                                <div className="relative border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 aspect-[1.414/1]">
                                    {file?.type === "application/pdf" || (previewUrl.toLowerCase().endsWith(".pdf") && !file) ? (
                                        <iframe src={previewUrl} className="w-full h-full border-none pointer-events-none" title="PDF Preview" />
                                    ) : (
                                        <img src={previewUrl} alt="Preview" className="w-full h-auto" />
                                    )}

                                    {CERTIFICATE_FIELD_KEYS.map((fieldKey) => {
                                        const field = fieldsConfig[fieldKey];
                                        if (!field.enabled) return null;
                                        return (
                                            <div
                                                key={fieldKey}
                                                className={`absolute text-center pointer-events-none whitespace-nowrap ${activeField === fieldKey ? "ring-2 ring-[#010080] rounded px-1" : ""}`}
                                                style={{
                                                    left: `${(field.x / 1000) * 100}%`,
                                                    top: `${(field.y / 1000) * 100}%`,
                                                    transform: "translate(-50%, -50%)",
                                                    fontSize: `${Math.max(field.font_size / 4, 8)}px`,
                                                    color: field.font_color,
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {CERTIFICATE_FIELD_SAMPLES[fieldKey]}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-60">Select field to position</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {CERTIFICATE_FIELD_KEYS.map((fieldKey) => (
                                        <button
                                            key={fieldKey}
                                            type="button"
                                            onClick={() => setActiveField(fieldKey)}
                                            className={`px-3 py-2 rounded-lg text-left text-xs font-bold border transition-all ${
                                                activeField === fieldKey
                                                    ? "bg-[#010080] text-white border-[#010080]"
                                                    : isDark
                                                      ? "bg-gray-700 border-gray-600 hover:border-blue-400"
                                                      : "bg-gray-50 border-gray-200 hover:border-blue-300"
                                            }`}
                                        >
                                            {CERTIFICATE_FIELD_LABELS[fieldKey]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={`p-4 rounded-xl border ${isDark ? "border-gray-700 bg-gray-900/40" : "border-gray-200 bg-gray-50"}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-bold text-sm">{CERTIFICATE_FIELD_LABELS[activeField]}</h4>
                                    <label className="flex items-center gap-2 text-xs font-semibold">
                                        <input
                                            type="checkbox"
                                            checked={activeConfig.enabled}
                                            onChange={(e) => updateField(activeField, "enabled", e.target.checked)}
                                        />
                                        Show on certificate
                                    </label>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-50">X Position</label>
                                        <input
                                            type="number"
                                            value={activeConfig.x}
                                            onChange={(e) => updateField(activeField, "x", e.target.value)}
                                            className={`w-full p-3 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-50">Y Position</label>
                                        <input
                                            type="number"
                                            value={activeConfig.y}
                                            onChange={(e) => updateField(activeField, "y", e.target.value)}
                                            className={`w-full p-3 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-50">Font Size</label>
                                        <input
                                            type="number"
                                            value={activeConfig.font_size}
                                            onChange={(e) => updateField(activeField, "font_size", e.target.value)}
                                            className={`w-full p-3 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-50">Font Color</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                value={activeConfig.font_color}
                                                onChange={(e) => updateField(activeField, "font_color", e.target.value)}
                                                className="h-11 w-11 rounded-lg border cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={activeConfig.font_color}
                                                onChange={(e) => updateField(activeField, "font_color", e.target.value)}
                                                className={`flex-1 p-3 rounded-lg border font-mono uppercase ${isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"}`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <p className="text-[11px] text-gray-500 mt-3">
                                    Sample value: <span className="font-semibold">{CERTIFICATE_FIELD_SAMPLES[activeField]}</span>. Positions use a 0–1000 grid (500, 500 = center).
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-5 py-2.5 text-sm font-bold border-2 rounded-xl transition-all ${isDark ? "hover:bg-gray-700 text-gray-300 border-gray-600" : "hover:bg-gray-100 text-gray-700 border-gray-300"}`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || isUploading}
                            className="px-8 py-2.5 text-sm font-bold text-white bg-[#010080] hover:bg-[#010080]/90 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2"
                        >
                            {(isSaving || isUploading) && (
                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            )}
                            {isUploading ? "Uploading..." : isSaving ? "Saving..." : certificate ? "Update Template" : "Save Template"}
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
