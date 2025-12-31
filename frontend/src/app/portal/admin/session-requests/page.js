"use client";

import { useState } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetSessionRequestsQuery, useUpdateSessionRequestStatusMutation } from "@/redux/api/sessionRequestApi";

export default function AdminSessionRequestsPage() {
    const { isDark } = useDarkMode();
    const { data: requests = [], isLoading, refetch } = useGetSessionRequestsQuery();
    const [updateStatus, { isLoading: isUpdating }] = useUpdateSessionRequestStatusMutation();

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

            closeModal();
            refetch();
        } catch (err) {
            console.error("Failed to update status", err);
            alert("Failed to update status. Please try again.");
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

    const bg = isDark ? "bg-gray-900" : "bg-gray-100";
    const card = isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900";
    const border = isDark ? "border-gray-700" : "border-gray-200";
    const textSub = isDark ? "text-gray-400" : "text-gray-500";

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved': return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 uppercase tracking-wider">Approved</span>;
            case 'rejected': return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 uppercase tracking-wider">Rejected</span>;
            default: return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 uppercase tracking-wider">Pending</span>;
        }
    };

    return (
        <div className={`min-h-screen transition-colors pt-20 w-full px-8 pb-20 ${bg}`}>
            <div className="w-full py-6">
                <div className={`mb-6 p-6 rounded-xl shadow-sm border ${border} ${card}`}>
                    <h1 className="text-2xl font-bold mb-2">Session Change Requests</h1>
                    <p className={textSub}>
                        Manage and process student requests for shifting class sessions.
                    </p>
                </div>

                <div className={`rounded-xl shadow-sm border ${border} ${card} overflow-hidden`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className={`bg-gray-50 dark:bg-gray-700/50 border-b ${border}`}>
                                    <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider">Current Class</th>
                                    <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider">Requested Session</th>
                                    <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider">Reason</th>
                                    <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-sm opacity-60">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-6 h-6 border-2 border-primary border-t-transparent animate-spin rounded-full"></div>
                                                Loading requests...
                                            </div>
                                        </td>
                                    </tr>
                                ) : requests.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-sm opacity-60">
                                            No session change requests found in the database.
                                        </td>
                                    </tr>
                                ) : (
                                    requests.map((req) => (
                                        <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium">{req.student_name}</div>
                                                <div className={`text-xs ${textSub}`}>{req.student_email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {req.current_class_name || "N/A"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-sm text-blue-600 dark:text-blue-400">{req.requested_session_type}</div>
                                                {req.requested_class_name && (
                                                    <div className={`text-xs ${textSub}`}>{req.requested_class_name}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm max-w-xs xl:max-w-md truncate hover:whitespace-normal cursor-help" title={req.reason}>
                                                {req.reason}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(req.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {req.status === 'pending' ? (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => openModal(req, 'approve')}
                                                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-medium transition-colors"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => openModal(req, 'reject')}
                                                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-medium transition-colors"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className={`text-xs ${textSub}`}>Processed</div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Action Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className={`${card} w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border ${border} animate-in fade-in zoom-in duration-200`}>
                        <div className={`p-6 border-b ${border}`}>
                            <h3 className="text-xl font-bold">
                                {modalType === 'approve' ? 'Approve' : 'Reject'} Session Request
                            </h3>
                            <p className={`text-sm mt-1 ${textSub}`}>
                                For student: <span className="font-semibold text-gray-900 dark:text-white">{selectedRequest.student_name}</span>
                            </p>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className={`p-3 rounded-lg text-sm ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className={textSub}>Requested Session:</span>
                                    <span className="font-bold text-blue-600 dark:text-blue-400">{selectedRequest.requested_session_type}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className={textSub}>Requested Class:</span>
                                    <span className="font-medium">{selectedRequest.requested_class_name || "Generic"}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 opacity-80">
                                    {modalType === 'approve' ? 'Approval Note (Optional)' : 'Reason for Rejection'}
                                </label>
                                <textarea
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    placeholder={modalType === 'approve' ? "Any instructions for the student..." : "Why is this request being rejected?"}
                                    rows={4}
                                    className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                    required={modalType === 'reject'}
                                />
                            </div>
                        </div>

                        <div className={`p-6 bg-gray-50 dark:bg-gray-700/30 flex justify-end gap-3`}>
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
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
        </div>
    );
}
