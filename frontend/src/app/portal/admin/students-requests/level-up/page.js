"use client";

import { useState } from "react";
import DataTable from "@/components/DataTable";
import { useDarkMode } from "@/context/ThemeContext";
import {
    useGetLevelUpRequestsQuery,
    useUpdateLevelUpRequestStatusMutation
} from "@/redux/api/levelUpApi";
import { useToast } from "@/components/Toast";
import LevelUpActionModal from "./components/LevelUpActionModal";
import AdminConfirmationModal from "../../admins/components/AdminConfirmationModal";

export default function AdminLevelUpRequestsPage() {
    const { isDark } = useDarkMode();
    const { showToast } = useToast();
    const { data: requests = [], isLoading, refetch } = useGetLevelUpRequestsQuery();
    const [updateStatus, { isLoading: isUpdating }] = useUpdateLevelUpRequestStatusMutation();

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [adminNote, setAdminNote] = useState("");
    const [modalType, setModalType] = useState(null); // 'choose', 'approve', 'reject', 'view'

    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: null
    });

    const handleAction = async (status, promotionDetails = {}) => {
        if (!selectedRequest) return;
        try {
            const body = {
                status,
                admin_response: adminNote,
                ...promotionDetails
            };
            await updateStatus({ id: selectedRequest.id, ...body }).unwrap();
            showToast(`Request ${status === 'approved' ? 'approved and student promoted' : 'rejected'} successfully!`, "success");
            closeModal();
            refetch();
        } catch (err) {
            showToast(err.data?.error || "Failed to update status.", "error");
        }
    };

    const openModal = (request, type) => {
        setSelectedRequest(request);
        setModalType(type);
        setAdminNote("");
    };

    const closeModal = () => {
        setSelectedRequest(null);
        setModalType(null);
    };

    const columns = [
        {
            key: "student_id", label: "STUDENT ID", width: "150px",
            render: (val) => <div className="font-bold text-gray-900 dark:text-white" title={val}>{val}</div>
        },
        {
            key: "student_name", label: "STUDENT NAME", width: "180px",
            render: (val) => <div className="font-bold text-gray-900 dark:text-white uppercase truncate lg:max-w-[180px]" title={val}>{val}</div>
        },
        {
            key: "requested_subprogram_name", label: "TARGET LEVEL", width: "180px",
            render: (val) => <div className="text-blue-600 dark:text-blue-400 font-bold truncate lg:max-w-[180px]">{val}</div>
        },
        {
            key: "description", label: "REASON", width: "200px",
            render: (val) => <div className="text-sm text-gray-500 italic truncate lg:max-w-[200px]" title={val}>{val || "None"}</div>
        },
        {
            key: "created_at", label: "DATE", width: "120px",
            render: (val) => <div className="text-xs text-gray-500">{new Date(val).toLocaleDateString()}</div>
        },
        {
            key: "status", label: "Status", width: "120px",
            render: (val, row) => {
                const styles = {
                    approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
                    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
                    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
                };

                const currentStyle = styles[val] || styles.pending;

                if (val === 'pending') {
                    return (
                        <button
                            onClick={() => openModal(row, 'choose')}
                            className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider border transition-all hover:scale-105 active:scale-95 ${currentStyle}`}
                        >
                            Pending
                        </button>
                    );
                }

                return (
                    <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider border ${currentStyle}`}>
                        {val}
                    </span>
                );
            },
        },
        {
            key: "actions", label: "ACTIONS", width: "80px",
            render: (_, row) => {
                return (
                    <button
                        onClick={() => openModal(row, 'view')}
                        className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors border border-blue-100 dark:border-blue-900/30 flex items-center justify-center"
                        title={row.status === 'pending' ? 'View Details' : 'View Result'}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </button>
                );
            },
        },
    ];

    return (
        <>
            <main className="flex-1 min-w-0 flex flex-col items-center bg-gray-50 transition-colors dark:bg-gray-900">
                <div className="w-full max-w-full px-4 sm:px-8 py-6 min-w-0 flex flex-col">
                    <DataTable
                        title="Student Level Up Requests"
                        columns={columns}
                        data={requests}
                        showAddButton={false}
                        isLoading={isLoading}
                        searchKey="student_name"
                    />
                </div>
            </main>
            <LevelUpActionModal
                isOpen={!!selectedRequest}
                onClose={closeModal}
                request={selectedRequest}
                modalType={modalType}
                setModalType={setModalType}
                adminNote={adminNote}
                setAdminNote={setAdminNote}
                handleAction={handleAction}
                isUpdating={isUpdating}
                isDark={isDark}
            />
            <AdminConfirmationModal
                isOpen={confirmationModal.isOpen}
                onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
                title={confirmationModal.title}
                message={confirmationModal.message}
                onConfirm={confirmationModal.onConfirm}
                isDark={isDark}
            />
        </>
    );
}
