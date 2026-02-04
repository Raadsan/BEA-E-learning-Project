"use client";

import { useState } from "react";
import DataTable from "@/components/DataTable";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useGetSubprogramsQuery } from "@/redux/api/subprogramApi";
import {
    useGetCertificatesQuery,
    useGetIssuedCertificatesQuery,
    useUpsertCertificateMutation,
    useDeleteCertificateMutation
} from "@/redux/api/certificateApi";
import { useDarkMode } from "@/context/ThemeContext";
import { useToast } from "@/components/Toast";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

// Components
import CertificateForm from "./components/CertificateForm";
import ProgramConfirmationModal from "../programs/components/ProgramConfirmationModal";

export default function CertificatesPage() {
    const { isDark } = useDarkMode();
    const { showToast } = useToast();

    const searchParams = useSearchParams();
    const tabParam = searchParams.get("tab") || "configuration";

    const [activeTab, setActiveTab] = useState(tabParam);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCert, setEditingCert] = useState(null);
    const [selectedTarget, setSelectedTarget] = useState(null);
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

    const [typeFilter, setTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

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

    const configColumns = [
        { key: "name", label: "Target Name" },
        {
            key: "type",
            label: "Type",
            render: (val) => <span className={`capitalize px-2 py-1 rounded text-xs font-bold ${val === 'program' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{val}</span>
        },
        {
            key: "created_at",
            label: "Created At",
            render: (val, row) => row.certificate ? new Date(row.certificate.created_at).toLocaleDateString() : "-"
        },
        {
            key: "uploaded_by",
            label: "Uploaded By",
            render: (val, row) => row.certificate?.uploaded_by || "-"
        },
        {
            key: "actions",
            label: "Actions",
            render: (_, row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleManage({ id: row.originalId, name: row.name }, row.type)}
                        className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50 flex items-center gap-1 text-sm font-medium"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        {row.certificate ? "Edit" : "Setup"}
                    </button>
                    {row.certificate && (
                        <button
                            onClick={() => handleDelete({ ...row.certificate, target_name: row.name })}
                            className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
        <div className="flex gap-3 flex-wrap">
            <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className={`text-xs border rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'}`}
            >
                <option value="all">All Types</option>
                <option value="program">Programs</option>
                <option value="subprogram">Subprograms</option>
            </select>
            <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`text-xs border rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'}`}
            >
                <option value="all">All Status</option>
                <option value="configured">Configured</option>
                <option value="not_configured">Not Configured</option>
            </select>
        </div>
    );

    if (loadingPrograms || loadingSubprograms || loadingCerts || loadingIssued) return <main className="flex-1 bg-gray-50"><div className="w-full px-8 py-6 text-center py-12 text-gray-600">Loading certificates...</div></main>;

    return (
        <>
            <main className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="w-full px-8 py-6 space-y-6">
                    {/* Header - No tabs here as they are in the sidebar */}
                    <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4">
                        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {activeTab === "configuration" ? "Certificate Configuration" : "Issued Certificates Log"}
                        </h1>
                    </div>

                    {activeTab === "configuration" ? (
                        <DataTable
                            title="Configuration"
                            columns={configColumns}
                            data={configurationData}
                            showAddButton={false}
                            customHeaderLeft={TableFilters}
                        />
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

            {isModalOpen && (
                <CertificateForm
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    target={selectedTarget}
                    certificate={editingCert}
                    onSave={upsertCertificate}
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
        </>
    );
}
