
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
            await updateStatus({
                id: selectedRequest.id,
                status,
                admin_response: adminNote
            }).unwrap();

            showToast(`Request ${status === 'approved' ? 'approved' : 'rejected'} successfully!`, "success");
            closeModal();
            refetch();
        } catch (err) {
            console.error("Failed to update status", err);
            showToast("Failed to update status. Please try again.", "error");
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
            key: "student_name",
            label: "Student",
            width: "250px",
            render: (row) => (
                <div>
                    <div className="font-medium text-gray-900 dark:text-white">{row.student_name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{row.student_email}</div>
                </div>
            ),
        },
        {
            key: "period",
            label: "Freezing Period",
            width: "220px",
            render: (row) => (
                <div className="text-sm">
                    <div className="font-bold text-[#010080] dark:text-blue-400">
                        {new Date(row.start_date).toLocaleDateString()} - {new Date(row.end_date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">Duration: {Math.ceil((new Date(row.end_date) - new Date(row.start_date)) / (1000 * 60 * 60 * 24))} days</div>
                </div>
            ),
        },
        {
            key: "reason",
            label: "Reason",
            width: "200px",
            render: (row) => (
                <span className="capitalize text-sm font-medium">{row.reason}</span>
            ),
        },
        {
            key: "description",
            label: "Details",
            width: "250px",
            render: (row) => (
                <span className="text-sm max-w-xs truncate block hover:whitespace-normal cursor-help" title={row.description}>
                    {row.description || "No description provided"}
                </span>
            ),
        },
        {
            key: "status",
            label: "Status",
            width: "120px",
            render: (row) => {
                switch (row.status) {
                    case 'approved':
                        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 uppercase tracking-wider">Approved</span>;
                    case 'rejected':
                        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 uppercase tracking-wider">Rejected</span>;
                    default:
                        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 uppercase tracking-wider">Pending</span>;
                }
            },
        },
        {
            key: "actions",
            label: "Actions",
            width: "150px",
            render: (row) => {
                if (row.status === 'pending') {
                    return (
                        <div className="flex gap-2">
                            <button
                                onClick={() => openModal(row, 'approve')}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-medium transition-colors"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => openModal(row, 'reject')}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-medium transition-colors"
                            >
                                Reject
                            </button>
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
            <main className="flex-1 min-w-0 flex flex-col items-center overflow-y-auto overflow-x-hidden bg-gray-50 pt-20 transition-colors dark:bg-gray-900">
                <div className="w-full max-w-full px-4 sm:px-8 py-6 min-w-0 flex flex-col">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Course Freezing Requests</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Review and manage student requests to temporarily freeze their enrollment.</p>
                    </div>

                    <DataTable
                        columns={columns}
                        data={requests}
                        showAddButton={false}
                        isLoading={isLoading}
                        searchKey="student_name"
                    />
                </div>
            </main>

            {/* Action Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={closeModal}
                    />
                    <div className={`relative w-full max-w-md rounded-xl shadow-2xl overflow-hidden border-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                        <div className={`sticky top-0 z-10 px-6 py-4 border-b flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                {modalType === 'approve' ? 'Approve' : 'Reject'} Freezing Request
                            </h3>
                            <button
                                onClick={closeModal}
                                className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className={`p-4 rounded-lg border-2 ${isDark ? 'bg-blue-900/10 border-blue-800' : 'bg-blue-100 border-blue-200'}`}>
                                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Student</p>
                                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedRequest.student_name}</p>
                                <div className="mt-2 flex justify-between items-center text-sm">
                                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Period:</span>
                                    <span className="font-bold text-blue-600">{new Date(selectedRequest.start_date).toLocaleDateString()} - {new Date(selectedRequest.end_date).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {modalType === 'approve' ? 'Academy Note (Optional)' : 'Reason for Rejection'}
                                </label>
                                <textarea
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    placeholder={modalType === 'approve' ? "Instructions or feedback for the student..." : "Provide a reason for the student..."}
                                    rows={4}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                    required={modalType === 'reject'}
                                />
                            </div>
                        </div>

                        <div className={`p-6 flex justify-end gap-3 border-t ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50/50 border-gray-200'}`}>
                            <button
                                onClick={closeModal}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-700'}`}
                            >
                                Cancel
                            </button>
                            <button
                                disabled={isUpdating || (modalType === 'reject' && !adminNote)}
                                onClick={() => handleAction(modalType === 'approve' ? 'approved' : 'rejected')}
                                className={`px-6 py-2 text-sm font-bold text-white rounded-lg transition-all shadow-lg ${modalType === 'approve'
                                    ? 'bg-green-600 hover:bg-green-700 shadow-green-500/20'
                                    : 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {isUpdating ? 'Processing...' : (modalType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
