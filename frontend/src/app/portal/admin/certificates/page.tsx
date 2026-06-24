"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/DataTable";
import { useGetProgramsQuery } from "@/lib/api/programApi";
import { useGetSubprogramsQuery } from "@/lib/api/subprogramApi";
import {
    useGetGlobalCertificateQuery,
    useGetIssuedCertificatesQuery,
    useUpsertCertificateMutation,
    useDeleteCertificateMutation,
} from "@/lib/api/certificateApi";
import { useDarkMode } from "@/context/ThemeContext";
import { useToast } from "@/components/Toast";
import { useSearchParams } from "next/navigation";
import { resolveMediaUrl } from "@/constants";
import {
    CERTIFICATE_FIELD_KEYS,
    CERTIFICATE_FIELD_LABELS,
    normalizeFieldsConfig,
} from "@/utils/certificateFields";

import CertificateForm from "@/components/admin/certificates/CertificateForm";
import ProgramConfirmationModal from "@/components/admin/programs/ProgramConfirmationModal";
import AuditTrailSection from "@/components/admin/AuditTrailSection";
import { usePagePermissions } from "@/hooks/usePagePermissions";

export default function CertificatesPage() {
    const { isDark } = useDarkMode();
    const { showToast } = useToast();

    const searchParams = useSearchParams();
    const tabParam = searchParams.get("tab") || "configuration";
    const pageKey = tabParam === "issued" ? "certificate_issued" : "certificate_configuration";
    const { canView, canAdd, canEdit, canDelete } = usePagePermissions("academic_management", pageKey);
    const [activeTab, setActiveTab] = useState(tabParam);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");
    const [actionLogs, setActionLogs] = useState([]);

    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: null,
        isLoading: false,
        confirmButtonColor: "blue",
    });

    useEffect(() => {
        if (tabParam && tabParam !== activeTab) {
            setActiveTab(tabParam);
        }
    }, [tabParam, activeTab]);

    useEffect(() => {
        try {
            const stored = localStorage.getItem("certificate_action_history");
            if (stored) {
                setActionLogs(JSON.parse(stored));
            }
        } catch (e) {
            console.error("Failed to load history logs", e);
        }
    }, []);

    const logAction = (action, details) => {
        const newLog = {
            id: Date.now() + Math.random(),
            action,
            details,
            timestamp: new Date().toISOString(),
        };
        const updated = [newLog, ...actionLogs].slice(0, 100);
        setActionLogs(updated);
        localStorage.setItem("certificate_action_history", JSON.stringify(updated));
    };

    const { data: programs = [], isLoading: loadingPrograms } = useGetProgramsQuery();
    const { data: subprograms = [], isLoading: loadingSubprograms } = useGetSubprogramsQuery();
    const { data: globalTemplate, isLoading: loadingTemplate } = useGetGlobalCertificateQuery();
    const { data: issuedCerts = [], isLoading: loadingIssued } = useGetIssuedCertificatesQuery();

    const [upsertCertificate, { isLoading: isSaving }] = useUpsertCertificateMutation();
    const [deleteCertificate, { isLoading: isDeleting }] = useDeleteCertificateMutation();

    const fieldsConfig = globalTemplate
        ? normalizeFieldsConfig(globalTemplate.fields_config, globalTemplate)
        : null;

    const handleDeleteTemplate = () => {
        if (!globalTemplate) return;

        setConfirmationModal({
            isOpen: true,
            title: "Delete Global Certificate Template",
            message: "Are you sure you want to delete the global certificate template? Students will not be able to download certificates until a new template is uploaded.",
            onConfirm: async () => {
                setConfirmationModal((prev) => ({ ...prev, isLoading: true }));
                try {
                    await deleteCertificate(globalTemplate.id).unwrap();
                    showToast("Global certificate template deleted.", "success");
                    logAction("Template Deleted", "Global certificate template was removed.");
                    setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
                } catch (error) {
                    showToast(error?.data?.error || "Failed to delete template", "error");
                } finally {
                    setConfirmationModal((prev) => ({ ...prev, isLoading: false }));
                }
            },
            isLoading: false,
            confirmButtonColor: "red",
        });
    };

    const issuedColumns = [
        { key: "student_name", label: "Student Name" },
        { key: "student_id", label: "Student ID" },
        { key: "target_name", label: "Program / Subprogram" },
        {
            key: "target_type",
            label: "Type",
            render: (val) => <span className="capitalize">{val}</span>,
        },
        { key: "class_name", label: "Class" },
        {
            key: "issued_at",
            label: "Date Issued",
            render: (val) => new Date(val).toLocaleDateString(),
        },
    ];

    const subprogramRows = subprograms.map((sub) => {
        const program = programs.find((p) => p.id === sub.program_id);
        return {
            id: sub.id,
            subprogram_name: sub.subprogram_name,
            program_name: program?.title || "-",
        };
    });

    const subprogramColumns = [
        { key: "subprogram_name", label: "Subprogram" },
        { key: "program_name", label: "Program" },
        {
            key: "status",
            label: "Certificate Rule",
            render: () => (
                <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-full">
                    Uses global template
                </span>
            ),
        },
    ];

    if (loadingPrograms || loadingSubprograms || loadingTemplate || loadingIssued) {
        return (
            <main className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center min-h-[50vh]">
                <div className="text-center text-gray-650 font-bold">Loading Certificate Configuration...</div>
            </main>
        );
    }

    const templateUrl = globalTemplate?.template_url
        ? resolveMediaUrl(globalTemplate.template_url)
        : "";

    return (
        <>
            <main className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"} overflow-y-auto`}>
                <div className="w-full px-8 py-6 space-y-6">
                    <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4">
                        <div>
                            <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                                {activeTab === "configuration" ? "Certificate Configuration" : "Issued Certificates Log"}
                            </h1>
                            {activeTab === "configuration" && (
                                <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                    One certificate template for the whole academy. Each student certificate is filled with their own program, subprogram, grade, ID, and date.
                                </p>
                            )}
                        </div>
                    </div>

                    {activeTab === "configuration" ? (
                        <div className="space-y-6">
                            <div className={`rounded-2xl border p-6 shadow-sm ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                                <div className="flex flex-col lg:flex-row gap-6 justify-between">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${globalTemplate ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                                                {globalTemplate ? "Template Ready" : "Not Configured"}
                                            </span>
                                            {globalTemplate?.updated_at && (
                                                <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                                    Last updated: {new Date(globalTemplate.updated_at).toLocaleString()}
                                                </span>
                                            )}
                                        </div>

                                        <div className={`rounded-xl p-4 text-sm leading-relaxed ${isDark ? "bg-gray-900/50 text-gray-300" : "bg-blue-50 text-gray-700"}`}>
                                            <p className="font-semibold mb-2">How certificates are generated</p>
                                            <ol className="list-decimal pl-5 space-y-1">
                                                <li>Admin uploads one certificate design here.</li>
                                                <li>Student completes a subprogram (or full program).</li>
                                                <li>System places that student&apos;s name, ID, program, subprogram, grade, and issue date on the same template.</li>
                                                <li>Each subprogram still gives its own certificate, but all use this one design.</li>
                                            </ol>
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            {(canAdd || canEdit) && (
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="px-5 py-2.5 rounded-xl bg-[#010080] hover:bg-[#010080]/90 text-white text-sm font-bold shadow-md"
                                            >
                                                {globalTemplate ? "Edit Global Template" : "Create Global Template"}
                                            </button>
                                            )}
                                            {globalTemplate && canDelete && (
                                                <button
                                                    onClick={handleDeleteTemplate}
                                                    disabled={isDeleting}
                                                    className="px-5 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-bold"
                                                >
                                                    Delete Template
                                                </button>
                                            )}
                                            {templateUrl && canView && (
                                                <button
                                                    onClick={() => {
                                                        setPreviewUrl(templateUrl);
                                                        setIsPreviewOpen(true);
                                                    }}
                                                    className={`px-5 py-2.5 rounded-xl border text-sm font-bold ${isDark ? "border-gray-600 hover:bg-gray-700" : "border-gray-300 hover:bg-gray-100"}`}
                                                >
                                                    Preview Template
                                                </button>
                                            )}
                                        </div>

                                        {globalTemplate && (
                                            <AuditTrailSection record={globalTemplate} isDark={isDark} />
                                        )}
                                    </div>

                                    <div className="w-full lg:w-[280px]">
                                        {templateUrl ? (
                                            <div
                                                className="aspect-[1.414/1] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-90"
                                                onClick={() => {
                                                    setPreviewUrl(templateUrl);
                                                    setIsPreviewOpen(true);
                                                }}
                                            >
                                                {templateUrl.toLowerCase().endsWith(".pdf") ? (
                                                    <div className="h-full bg-red-50 dark:bg-red-950/20 flex flex-col items-center justify-center">
                                                        <span className="text-red-600 font-bold text-sm">PDF Template</span>
                                                    </div>
                                                ) : (
                                                    <img src={templateUrl} alt="Certificate template" className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                        ) : (
                                            <div className="aspect-[1.414/1] rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-sm text-gray-400 font-semibold">
                                                No template uploaded
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {fieldsConfig && (
                                <div className={`rounded-2xl border p-6 shadow-sm ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                                    <h2 className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Field Positions</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                        {CERTIFICATE_FIELD_KEYS.map((fieldKey) => {
                                            const field = fieldsConfig[fieldKey];
                                            return (
                                                <div key={fieldKey} className={`rounded-lg border p-3 ${isDark ? "border-gray-700 bg-gray-900/40" : "border-gray-200 bg-gray-50"}`}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-bold">{CERTIFICATE_FIELD_LABELS[fieldKey]}</span>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${field.enabled ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                                                            {field.enabled ? "ON" : "OFF"}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        X: {field.x}, Y: {field.y}, Size: {field.font_size}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <DataTable
                                title="Subprograms Covered by This Template"
                                columns={subprogramColumns}
                                data={subprogramRows}
                                showAddButton={false}
                            />

                            <div className={`p-6 rounded-xl border shadow-sm ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                                <h3 className="text-md font-extrabold uppercase tracking-wider mb-4">Configuration Action History</h3>
                                <div className="max-h-[240px] overflow-y-auto space-y-3">
                                    {actionLogs.length === 0 ? (
                                        <p className="text-xs text-gray-400 italic">No actions logged yet.</p>
                                    ) : (
                                        actionLogs.map((log) => (
                                            <div key={log.id} className={`p-3 rounded-lg border text-xs ${isDark ? "border-gray-700 bg-gray-900/40" : "border-gray-100 bg-gray-50"}`}>
                                                <div className="flex justify-between gap-3">
                                                    <span className="font-bold">{log.action}</span>
                                                    <span className="text-gray-400">{new Date(log.timestamp).toLocaleString()}</span>
                                                </div>
                                                <p className="text-gray-500 mt-1">{log.details}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <DataTable
                            title="Issued Certificates Log"
                            columns={issuedColumns}
                            data={issuedCerts}
                            showAddButton={false}
                        />
                    )}
                </div>
            </main>

            {isPreviewOpen && (
                <div
                    className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
                    onClick={() => setIsPreviewOpen(false)}
                >
                    <div className="relative max-w-4xl max-h-[85vh] w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setIsPreviewOpen(false)}
                            className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white"
                        >
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden p-2 shadow-2xl">
                            {previewUrl.toLowerCase().endsWith(".pdf") ? (
                                <iframe src={previewUrl} className="w-[85vw] max-w-[800px] h-[60vh] border-none" title="Certificate PDF Preview" />
                            ) : (
                                <img src={previewUrl} alt="Certificate Template Preview" className="max-w-full max-h-[75vh] object-contain rounded-lg" />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <CertificateForm
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    certificate={globalTemplate}
                    onSave={async (data) => {
                        await upsertCertificate(data);
                        logAction(
                            globalTemplate ? "Template Updated" : "Template Created",
                            "Global certificate template and field positions were saved."
                        );
                    }}
                    isSaving={isSaving}
                    isDark={isDark}
                />
            )}

            <ProgramConfirmationModal
                isOpen={confirmationModal.isOpen}
                onClose={() => setConfirmationModal((prev) => ({ ...prev, isOpen: false }))}
                title={confirmationModal.title}
                message={confirmationModal.message}
                onConfirm={confirmationModal.onConfirm}
                isLoading={confirmationModal.isLoading}
                confirmButtonColor={confirmationModal.confirmButtonColor}
                isDark={isDark}
            />
        </>
    );
}
