"use client";

import { useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";
import { useDarkMode } from "@/context/ThemeContext";
import {
    useGetFreezingRequestsQuery,
    useUpdateFreezingRequestStatusMutation
} from "@/redux/api/freezingApi";
import { useToast } from "@/components/Toast";
import FreezingActionModal from "./components/FreezingActionModal";

export default function AdminFreezingRequestsPage() {
    const { isDark } = useDarkMode();
    const { showToast } = useToast();
    const { data: requests = [], isLoading, refetch } = useGetFreezingRequestsQuery();
    const [updateStatus, { isLoading: isUpdating }] = useUpdateFreezingRequestStatusMutation();

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
        {
            key: "period", label: "Freezing Period", width: "220px",
            render: (row) => (
                <div className="text-sm">
                    <div className="font-bold text-[#010080] dark:text-blue-400">
                        {new Date(row.start_date).toLocaleDateString()} - {new Date(row.end_date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">Duration: {Math.ceil((new Date(row.end_date) - new Date(row.start_date)) / (1000 * 60 * 60 * 24))} days</div>
                </div>
            ),
        },
        { key: "reason", label: "Reason", width: "200px", render: (row) => <span className="capitalize text-sm font-medium">{row.reason}</span> },
        { key: "description", label: "Details", width: "250px", render: (row) => <span className="text-sm max-w-xs truncate block hover:whitespace-normal cursor-help" title={row.description}>{row.description || "No description provided"}</span> },
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
            <main className="flex-1 min-w-0 flex flex-col items-center bg-gray-50 pt-20 transition-colors dark:bg-gray-900">
                <div className="w-full max-w-full px-4 sm:px-8 py-6 min-w-0 flex flex-col">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Course Freezing Requests</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Review and manage student requests to temporarily freeze their enrollment.</p>
                    </div>
                    <DataTable columns={columns} data={requests} showAddButton={false} isLoading={isLoading} searchKey="student_name" />
                </div>
            </main>
            <FreezingActionModal isOpen={!!selectedRequest} onClose={closeModal} request={selectedRequest} modalType={modalType} adminNote={adminNote} setAdminNote={setAdminNote} handleAction={handleAction} isUpdating={isUpdating} isDark={isDark} />
        </>
    );
}
