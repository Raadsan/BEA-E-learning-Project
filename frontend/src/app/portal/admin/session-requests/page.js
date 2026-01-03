"use client";

import { useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetSessionRequestsQuery, useUpdateSessionRequestStatusMutation } from "@/redux/api/sessionRequestApi";
import { useToast } from "@/components/Toast";
import SessionActionModal from "./components/SessionActionModal";

export default function AdminSessionRequestsPage() {
    const { isDark } = useDarkMode();
    const { showToast } = useToast();
    const { data: requests = [], isLoading, refetch } = useGetSessionRequestsQuery();
    const [updateStatus, { isLoading: isUpdating }] = useUpdateSessionRequestStatusMutation();

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [adminNote, setAdminNote] = useState("");
    const [modalType, setModalType] = useState(null); // 'approve' or 'reject'

    const handleAction = async (status) => {
        if (!selectedRequest) return;
        try {
            await updateStatus({ id: selectedRequest.id, status, admin_response: adminNote }).unwrap();
            showToast(`Request ${status === 'approved' ? 'approved' : 'rejected'} successfully!`, "success");
            closeModal();
            refetch();
        } catch (err) {
            showToast("Failed to update status.", "error");
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
            key: "student_name", label: "Student", width: "250px",
            render: (row) => (
                <div>
                    <div className="font-medium text-gray-900 dark:text-white">{row.student_name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{row.student_email}</div>
                </div>
            ),
        },
        { key: "current_class_name", label: "Current Class", width: "150px", render: (row) => <span className="text-sm">{row.current_class_name || "N/A"}</span> },
        {
            key: "requested_session_type", label: "Requested Session", width: "180px",
            render: (row) => (
                <div>
                    <div className="font-medium text-sm text-blue-600 dark:text-blue-400">{row.requested_session_type}</div>
                    {row.requested_class_name && <div className="text-xs text-gray-500 dark:text-gray-400">{row.requested_class_name}</div>}
                </div>
            ),
        },
        { key: "reason", label: "Reason", width: "250px", render: (row) => <span className="text-sm max-w-xs truncate block hover:whitespace-normal cursor-help" title={row.reason}>{row.reason}</span> },
        {
            key: "status", label: "Status", width: "120px",
            render: (row) => {
                switch (row.status) {
                    case 'approved': return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 uppercase tracking-wider">Approved</span>;
                    case 'rejected': return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 uppercase tracking-wider">Rejected</span>;
                    default: return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 uppercase tracking-wider">Pending</span>;
                }
            },
        },
        {
            key: "actions", label: "Actions", width: "150px",
            render: (row) => {
                if (row.status === 'pending') {
                    return (
                        <div className="flex gap-2">
                            <button onClick={() => openModal(row, 'approve')} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-medium transition-colors">Approve</button>
                            <button onClick={() => openModal(row, 'reject')} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-medium transition-colors">Reject</button>
                        </div>
                    );
                }
                return <div className="text-xs text-gray-500 dark:text-gray-400">Processed</div>;
            },
        },
    ];

    return (
        <>
            <AdminHeader />
            <main className="flex-1 min-w-0 flex flex-col items-center overflow-y-auto overflow-x-hidden bg-gray-50 pt-20 transition-colors">
                <div className="w-full max-w-full px-4 sm:px-8 py-6 min-w-0 flex flex-col">
                    <DataTable title="Session Change Requests" columns={columns} data={requests} showAddButton={false} isLoading={isLoading} />
                </div>
            </main>
            <SessionActionModal isOpen={!!selectedRequest} onClose={closeModal} request={selectedRequest} modalType={modalType} adminNote={adminNote} setAdminNote={setAdminNote} handleAction={handleAction} isUpdating={isUpdating} isDark={isDark} />
        </>
    );
}
