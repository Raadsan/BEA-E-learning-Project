"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/DataTable";
import { useGetProgramsQuery } from "@/lib/api/programApi";
import { useGetSubprogramsQuery } from "@/lib/api/subprogramApi";
import {
    useGetCertificatesQuery,
    useGetIssuedCertificatesQuery,
    useUpsertCertificateMutation,
    useDeleteCertificateMutation
} from "@/lib/api/certificateApi";
import { useDarkMode } from "@/context/ThemeContext";
import { useToast } from "@/components/Toast";
import { useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@/constants";

// Components
import CertificateForm from "@/components/admin/certificates/CertificateForm";
import ProgramConfirmationModal from "@/components/admin/programs/ProgramConfirmationModal";

export default function CertificatesPage() {
    const { isDark } = useDarkMode();
    const { showToast } = useToast();

    const searchParams = useSearchParams();
    const tabParam = searchParams.get("tab") || "configuration";

    const [activeTab, setActiveTab] = useState(tabParam);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCert, setEditingCert] = useState(null);
    const [selectedTarget, setSelectedTarget] = useState(null);

    // Filter, pagination and checkbox selection states
    const [typeFilter, setTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedConfigs, setSelectedConfigs] = useState([]);
    
    // Lightbox modal for Live Preview
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");

    // Action Audit Log State (Requirement 1.52)
    const [actionLogs, setActionLogs] = useState([]);

    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: null,
        isLoading: false,
        confirmButtonColor: "blue"
    });

    // Sync activeTab with URL parameter
    useEffect(() => {
        if (tabParam && tabParam !== activeTab) {
            setActiveTab(tabParam);
        }
    }, [tabParam, activeTab]);

    // Load action log history from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem("certificate_action_history");
            if (stored) {
                setActionLogs(JSON.parse(stored));
            } else {
                // Seed logs with a default initial value
                const defaultLogs = [
                    {
                        id: 1,
                        action: "System Initialized",
                        details: "Certificate Configuration management engine started.",
                        timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
                    }
                ];
                setActionLogs(defaultLogs);
                localStorage.setItem("certificate_action_history", JSON.stringify(defaultLogs));
            }
        } catch (e) {
            console.error("Failed to load history logs", e);
        }
    }, []);

    // Function to append a log action to the action logs (Requirement 1.52)
    const logAction = (action, details) => {
        const newLog = {
            id: Date.now() + Math.random(),
            action,
            details,
            timestamp: new Date().toISOString()
        };
        const updated = [newLog, ...actionLogs].slice(0, 100);
        setActionLogs(updated);
        localStorage.setItem("certificate_action_history", JSON.stringify(updated));
    };

    // Queries
    const { data: programs = [], isLoading: loadingPrograms } = useGetProgramsQuery();
    const { data: subprograms = [], isLoading: loadingSubprograms } = useGetSubprogramsQuery();
    const { data: certificates = [], isLoading: loadingCerts } = useGetCertificatesQuery();
    const { data: issuedCerts = [], isLoading: loadingIssued } = useGetIssuedCertificatesQuery();

    const [upsertCertificate, { isLoading: isSaving }] = useUpsertCertificateMutation();
    const [deleteCertificate, { isLoading: isDeleting }] = useDeleteCertificateMutation();

    const handleManage = (target, type) => {
        const cert = certificates.find(c => c.target_id === target.id && c.target_type === type);
        setEditingCert(cert || null);
        setSelectedTarget({ ...target, type });
        setIsModalOpen(true);
    };

    const handleSaveSuccess = () => {
        logAction(
            editingCert ? "Configuration Updated" : "Configuration Created",
            `Successfully set up certificate template parameters for target: ${selectedTarget?.name} (${selectedTarget?.type}).`
        );
    };

    const handleDelete = (cert) => {
        setConfirmationModal({
            isOpen: true,
            title: "Delete Certificate Template",
            message: `Are you sure you want to delete the certificate template for "${cert.target_name}"?`,
            onConfirm: async () => {
                setConfirmationModal(prev => ({ ...prev, isLoading: true }));
                try {
                    await deleteCertificate(cert.id).unwrap();
                    showToast("Certificate template deleted successfully!", "success");
                    logAction("Configuration Deleted", `Deleted certificate template alignment for target: ${cert.target_name}.`);
                    setConfirmationModal(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    showToast(error?.data?.error || "Failed to delete certificate", "error");
                } finally {
                    setConfirmationModal(prev => ({ ...prev, isLoading: false }));
                }
            },
            isLoading: false,
            confirmButtonColor: "red"
        });
    };

    // Bulk Delete Action
    const handleBulkDelete = () => {
        setConfirmationModal({
            isOpen: true,
            title: "Bulk Delete Configurations",
            message: `Are you sure you want to delete all ${selectedConfigs.length} selected certificate configurations?`,
            onConfirm: async () => {
                setConfirmationModal(prev => ({ ...prev, isLoading: true }));
                try {
                    let deletedCount = 0;
                    await Promise.all(selectedConfigs.map(async (rowId) => {
                        // Find the item matching this ID
                        const item = configurationData.find(x => x.id === rowId);
                        if (item && item.certificate) {
                            await deleteCertificate(item.certificate.id).unwrap();
                            deletedCount++;
                        }
                    }));
                    showToast(`Successfully deleted ${deletedCount} certificate configurations!`, "success");
                    logAction("Bulk Delete Executed", `Admin removed certificate configurations for ${deletedCount} programs/levels in bulk.`);
                    setSelectedConfigs([]);
                    setConfirmationModal(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    showToast("Failed to complete bulk delete operation", "error");
                } finally {
                    setConfirmationModal(prev => ({ ...prev, isLoading: false }));
                }
            },
            isLoading: false,
            confirmButtonColor: "red"
        });
    };

    // Configuration Table Data
    const configurationData = [
        ...programs.map(p => ({
            id: `program-${p.id}`,
            originalId: p.id,
            name: p.title,
            type: 'program',
            certificate: certificates.find(c => c.target_id === p.id && c.target_type === 'program')
        })),
        ...subprograms.map(s => ({
            id: `subprogram-${s.id}`, originalId: s.id, name: s.subprogram_name, type: 'subprogram',
            certificate: certificates.find(c => c.target_id === s.id && c.target_type === 'subprogram')
        }))
    ].filter(item => {
        const matchesType = typeFilter === "all" || item.type === typeFilter;
        const matchesStatus = statusFilter === "all" ||
            (statusFilter === "configured" ? item.certificate : !item.certificate);
        return matchesType && matchesStatus;
    });

    // Live Thumbnail Preview Showcase Renderer (Requirement 1.53)
    const renderLiveThumbnail = (row) => {
        if (!row.certificate || !row.certificate.template_url) {
            return (
                <div className="w-[80px] h-[52px] rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center bg-gray-50/50 dark:bg-gray-800 text-[10px] text-gray-400 font-bold select-none">
                    No Template
                </div>
            );
        }

        const url = row.certificate.template_url;
        const isPdf = url.toLowerCase().endsWith('.pdf');
        const fullUrl = `${API_BASE_URL}${url}`;

        if (isPdf) {
            return (
                <div 
                    onClick={(e) => {
                        e.stopPropagation();
                        setPreviewUrl(fullUrl);
                        setIsPreviewOpen(true);
                    }}
                    className="w-[80px] h-[52px] rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:border-red-900 flex flex-col items-center justify-center cursor-pointer transition-all shadow-sm hover:scale-105 active:scale-95"
                    title="PDF Template - Click to Preview"
                >
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6l-4-4H9z" />
                    </svg>
                    <span className="text-[8px] text-red-600 dark:text-red-400 font-extrabold uppercase mt-0.5">PDF Form</span>
                </div>
            );
        }

        return (
            <div 
                onClick={(e) => {
                    e.stopPropagation();
                    setPreviewUrl(fullUrl);
                    setIsPreviewOpen(true);
                }}
                className="w-[80px] h-[52px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-150 flex items-center justify-center cursor-pointer transition-all shadow-sm hover:scale-105 active:scale-95 group relative"
                title="Image Template - Click to Preview"
            >
                <img src={fullUrl} alt="Certificate template" className="w-full h-full object-cover group-hover:opacity-90" />
                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                </div>
            </div>
        );
    };

    const configColumns = [
        {
            key: "preview",
            label: "Live Thumbnail",
            render: (_, row) => renderLiveThumbnail(row)
        },
        { key: "name", label: "Target Name" },
        {
            key: "type",
            label: "Type",
            render: (val) => <span className={`capitalize px-2.5 py-0.5 rounded-full text-xs font-bold ${val === 'program' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-purple-50 text-purple-700 border border-purple-200'}`}>{val}</span>
        },
        {
            key: "created_at",
            label: "Configured Date",
            render: (val, row) => row.certificate ? new Date(row.certificate.created_at).toLocaleDateString() : "-"
        },
        {
            key: "uploaded_by",
            label: "Configured By",
            render: (val, row) => (
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {row.certificate?.uploaded_by || "-"}
                </span>
            )
        },
        {
            key: "actions",
            label: "Actions",
            render: (_, row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleManage({ id: row.originalId, name: row.name }, row.type)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-1 text-xs font-semibold"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        {row.certificate ? "Edit" : "Setup"}
                    </button>
                    {row.certificate && (
                        <button
                            onClick={() => handleDelete({ ...row.certificate, target_name: row.name })}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Delete Configuration"
                        >
                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    )}
                </div>
            )
        }
    ];

    // Issued Log Columns
    const issuedColumns = [
        { key: "student_name", label: "Student Name" },
        { key: "target_name", label: "Program/Subprogram" },
        {
            key: "target_type",
            label: "Type",
            render: (val) => <span className="capitalize">{val}</span>
        },
        { key: "class_name", label: "Class" },
        {
            key: "issued_at",
            label: "Date Issued",
            render: (val) => new Date(val).toLocaleDateString()
        }
    ];

    const TableFilters = (
        <div className="flex gap-3 flex-wrap items-center">
            {/* Type selector */}
            <div className="relative group w-[110px]">
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full pl-3 pr-7 py-1 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-lg text-gray-700 dark:text-white font-bold text-[11px] h-[32px] focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none appearance-none cursor-pointer"
                >
                    <option value="all">All Types</option>
                    <option value="program">Programs</option>
                    <option value="subprogram">Subprograms</option>
                </select>
                <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Status configured filter */}
            <div className="relative group w-[120px]">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-3 pr-7 py-1 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-lg text-gray-700 dark:text-white font-bold text-[11px] h-[32px] focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none appearance-none cursor-pointer"
                >
                    <option value="all">All Status</option>
                    <option value="configured">Configured</option>
                    <option value="not_configured">Not Configured</option>
                </select>
                <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>
    );

    if (loadingPrograms || loadingSubprograms || loadingCerts || loadingIssued) {
        return (
            <main className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center min-h-[50vh]">
                <div className="text-center text-gray-650 font-bold">Loading Certificate Configuration Board...</div>
            </main>
        );
    }

    return (
        <>
            <main className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'} overflow-y-auto`}>
                <div className="w-full px-8 py-6 space-y-6">
                    {/* Header - No tabs here as they are in the sidebar */}
                    <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4">
                        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {activeTab === "configuration" ? "Certificate Configuration" : "Issued Certificates Log"}
                        </h1>
                    </div>

                    {activeTab === "configuration" ? (
                        <div className="space-y-8">
                            <DataTable
                                title="Configuration Targets"
                                columns={configColumns}
                                data={configurationData}
                                showAddButton={false}
                                customActions={
                                    <>
                                        {/* Show All Button (Requirement 1.50) */}
                                        <button
                                            onClick={() => {
                                                setTypeFilter("all");
                                                setStatusFilter("all");
                                                setRowsPerPage(10000); // Clears all filters and bypasses pagination limits
                                            }}
                                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors border border-gray-250 cursor-pointer text-xs h-[38px] shadow-sm"
                                            title="Display all items at once"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18v3" />
                                            </svg>
                                            Show All
                                        </button>

                                        {/* Bulk Actions Button (Requirement 1.51) */}
                                        <button
                                            onClick={handleBulkDelete}
                                            disabled={selectedConfigs.length === 0}
                                            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors h-[38px] text-xs font-semibold ${
                                                selectedConfigs.length === 0
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : 'bg-[#010080] hover:bg-[#010080]/90 text-white shadow-md'
                                            }`}
                                            title="Bulk Action Operations"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Delete Selected ({selectedConfigs.length})
                                        </button>
                                    </>
                                }
                                customHeaderLeft={
                                    <div className="flex gap-2 flex-wrap items-center">
                                        {TableFilters}
                                        
                                        {/* Selection Pill Count box */}
                                        {selectedConfigs.length > 0 && (
                                            <div className="px-3 py-1 bg-[#010080] text-white rounded-lg shadow-sm flex items-center gap-2 h-[32px]">
                                                <span className="font-bold text-[11px]">{selectedConfigs.length} selected</span>
                                                <button
                                                    onClick={() => setSelectedConfigs([])}
                                                    className="ml-0.5 text-white hover:text-gray-200 transition-colors"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                }
                                selectable={true}
                                selectedItems={selectedConfigs}
                                onSelectionChange={setSelectedConfigs}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={setRowsPerPage}
                            />

                            {/* Action History Log Panel (Requirement 1.52) */}
                            <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-3 h-3 rounded-full bg-[#010080] animate-pulse" />
                                        <h3 className="text-md font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                                            Configuration Action History Logs
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (window.confirm("Clear all certificate logs?")) {
                                                const cleared = [{
                                                    id: Date.now(),
                                                    action: "Logs Cleared",
                                                    details: "Audit history log cleared by administrator.",
                                                    timestamp: new Date().toISOString()
                                                }];
                                                setActionLogs(cleared);
                                                localStorage.setItem("certificate_action_history", JSON.stringify(cleared));
                                            }
                                        }}
                                        className="text-xs font-bold text-red-650 hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                        Clear History Log
                                    </button>
                                </div>

                                <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2">
                                    {actionLogs.length === 0 ? (
                                        <p className="text-xs text-gray-400 italic text-center py-6">No actions logged yet.</p>
                                    ) : (
                                        actionLogs.map((log) => (
                                            <div 
                                                key={log.id} 
                                                className="flex gap-4 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800/80 hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
                                            >
                                                <div className="flex flex-col items-center flex-shrink-0">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                                        log.action.includes("Delete")
                                                            ? "bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/30"
                                                            : log.action.includes("Clear")
                                                            ? "bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-800"
                                                            : "bg-green-50 text-green-600 border border-green-200 dark:bg-green-950/30"
                                                    }`}>
                                                        {log.action.charAt(0)}
                                                    </div>
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex justify-between items-start gap-4">
                                                        <h4 className="text-xs font-extrabold text-gray-900 dark:text-white">
                                                            {log.action}
                                                        </h4>
                                                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold whitespace-nowrap">
                                                            {new Date(log.timestamp).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 dark:text-gray-450 leading-relaxed font-semibold">
                                                        {log.details}
                                                    </p>
                                                </div>
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

            {/* Live Template Lightbox Preview Modal (Requirement 1.53) */}
            {isPreviewOpen && (
                <div 
                    className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
                    onClick={() => setIsPreviewOpen(false)}
                >
                    <div 
                        className="relative max-w-4xl max-h-[85vh] w-full flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button 
                            onClick={() => setIsPreviewOpen(false)}
                            className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
                        >
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        
                        <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden p-2 shadow-2xl border border-gray-700/50 flex items-center justify-center">
                            {previewUrl.toLowerCase().endsWith('.pdf') ? (
                                <iframe 
                                    src={previewUrl} 
                                    className="w-[85vw] max-w-[800px] h-[60vh] border-none"
                                    title="Full Certificate PDF Preview"
                                />
                            ) : (
                                <img 
                                    src={previewUrl} 
                                    alt="Certificate Template Large Preview" 
                                    className="max-w-full max-h-[75vh] object-contain rounded-lg"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <CertificateForm
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    target={selectedTarget}
                    certificate={editingCert}
                    onSave={async (data) => {
                        await upsertCertificate(data);
                        handleSaveSuccess();
                    }}
                    isSaving={isSaving}
                    isDark={isDark}
                />
            )}

            <ProgramConfirmationModal
                isOpen={confirmationModal.isOpen}
                onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
                title={confirmationModal.title}
                message={confirmationModal.message}
                onConfirm={confirmationModal.onConfirm}
                isLoading={confirmationModal.isLoading}
                confirmButtonColor={confirmationModal.confirmButtonColor}
                isDark={isDark}
            />

            <style jsx>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
            `}</style>
        </>
    );
}
