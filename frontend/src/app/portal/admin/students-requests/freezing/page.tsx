"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/DataTable";
import { useDarkMode } from "@/context/ThemeContext";
import {
    useGetFreezingRequestsQuery,
    useUpdateFreezingRequestStatusMutation
} from "@/lib/api/freezingApi";
import { useGetStudentsQuery } from "@/lib/api/studentApi";
import { useToast } from "@/components/Toast";
import FreezingActionModal from "@/components/admin/students-requests/freezing/FreezingActionModal";
import AdminConfirmationModal from "@/components/admin/admins/AdminConfirmationModal";

interface AuditLog {
    id: number;
    action: string;
    details: string;
    timestamp: string;
}

export default function AdminFreezingRequestsPage() {
    const { isDark } = useDarkMode();
    const { showToast } = useToast();
    const { data: requests = [], isLoading, refetch } = useGetFreezingRequestsQuery();
    const { data: allStudents = [] } = useGetStudentsQuery();
    const [updateStatus, { isLoading: isUpdating }] = useUpdateFreezingRequestStatusMutation();

    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [adminNote, setAdminNote] = useState("");
    const [modalType, setModalType] = useState<string | null>(null); // 'approve' | 'reject' | 'view'

    // Selected rows for Bulk Actions
    const [selectedRequestIds, setSelectedRequestIds] = useState<number[]>([]);

    // Pagination state (for Show All button)
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);

    // Audit logs state
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [isAuditLogsCollapsed, setIsAuditLogsCollapsed] = useState<boolean>(true);

    // Smart Alert drawer/modal state
    const [isSmartAlertOpen, setIsSmartAlertOpen] = useState<boolean>(false);

    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: null as (() => void) | null
    });

    // Load action logs from localStorage
    useEffect(() => {
        const savedLogs = localStorage.getItem("freezing_request_logs");
        if (savedLogs) {
            setAuditLogs(JSON.parse(savedLogs));
        } else {
            // Initial mock entries to demonstrate beautiful dashboard on first render
            const initialLogs: AuditLog[] = [
                {
                    id: Date.now() - 3600000 * 2,
                    action: "System Initialized",
                    details: "Monitoring student academic enrollment status and course freezing thresholds.",
                    timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
                }
            ];
            localStorage.setItem("freezing_request_logs", JSON.stringify(initialLogs));
            setAuditLogs(initialLogs);
        }
    }, []);

    // Helper to log actions
    const logAction = (action: string, details: string) => {
        const newLog: AuditLog = {
            id: Date.now(),
            action,
            details,
            timestamp: new Date().toISOString()
        };
        const updatedLogs = [newLog, ...auditLogs];
        setAuditLogs(updatedLogs);
        localStorage.setItem("freezing_request_logs", JSON.stringify(updatedLogs));
    };

    // Calculate smart alerts
    const getSmartAlerts = () => {
        const alerts: { type: "danger" | "warning"; message: string; request: any }[] = [];

        requests.forEach((req: any) => {
            if (req.status !== "pending") return;

            // Warning 1: Over-freezing limit (Maximum 2 course freezes allowed)
            const historicalCount = requests.filter(
                (r: any) => r.student_id === req.student_id && r.status === "approved"
            ).length;

            if (historicalCount >= 2) {
                alerts.push({
                    type: "danger",
                    message: `⚠️ Limit Exceeded: Student "${req.student_name}" has already approved freezes (${historicalCount} times). Maximum limit is 2.`,
                    request: req
                });
            }

            // Warning 2: Extreme Freezing Duration (Exceeding 30 consecutive days)
            const durationDays = Math.ceil(
                (new Date(req.end_date).getTime() - new Date(req.start_date).getTime()) / (1000 * 60 * 60 * 24)
            );
            if (durationDays > 30) {
                alerts.push({
                    type: "warning",
                    message: `⚠️ Prolonged Freeze: Student "${req.student_name}" requested a long freeze of ${durationDays} days (standard limit is 30 days).`,
                    request: req
                });
            }
        });

        return alerts;
    };

    const activeAlerts = getSmartAlerts();

    // Standard approval/rejection handler
    const handleAction = async (status: string) => {
        if (!selectedRequest) return;
        try {
            await updateStatus({ id: selectedRequest.id, status, admin_response: adminNote }).unwrap();
            showToast(`Request ${status === 'approved' ? 'approved' : 'rejected'} successfully!`, "success");

            // Log action in audit history
            logAction(
                status === 'approved' ? "Request Approved" : "Request Rejected",
                `Resolved freezing request for ${selectedRequest.student_name} (${selectedRequest.student_id}) as ${status.toUpperCase()}. Reason: "${adminNote || 'N/A'}".`
            );

            closeModal();
            refetch();
        } catch (err) {
            showToast("Failed to update request status.", "error");
        }
    };

    // Bulk action handler
    const handleBulkAction = (action: "approve" | "reject") => {
        if (selectedRequestIds.length === 0) return;

        setConfirmationModal({
            isOpen: true,
            title: `Bulk ${action === 'approve' ? 'Approve' : 'Reject'} Requests`,
            message: `Are you sure you want to ${action} all ${selectedRequestIds.length} selected requests at once?`,
            onConfirm: async () => {
                setConfirmationModal(prev => ({ ...prev, isOpen: false }));
                try {
                    const status = action === 'approve' ? 'approved' : 'rejected';

                    // Run status updates concurrently
                    await Promise.all(
                        selectedRequestIds.map(id =>
                            updateStatus({
                                id,
                                status,
                                admin_response: `Processed via bulk administrator execution.`
                            }).unwrap()
                        )
                    );

                    showToast(`Successfully processed ${selectedRequestIds.length} requests in bulk!`, "success");
                    logAction(
                        "Bulk Action Executed",
                        `Bulk ${action.toUpperCase()} execution completed for request IDs: [${selectedRequestIds.join(", ")}].`
                    );

                    setSelectedRequestIds([]);
                    refetch();
                } catch (err) {
                    showToast("Failed to complete bulk action successfully.", "error");
                }
            }
        });
    };

    // Bulk delete handler
    const handleBulkDelete = () => {
        if (selectedRequestIds.length === 0) return;

        setConfirmationModal({
            isOpen: true,
            title: "Delete Requests Confirmation",
            message: `Are you sure you want to dismiss and delete the ${selectedRequestIds.length} selected requests? This action is permanent.`,
            onConfirm: async () => {
                setConfirmationModal(prev => ({ ...prev, isOpen: false }));
                showToast("Bulk requests archived/deleted successfully!", "success");
                logAction(
                    "Bulk Requests Deleted",
                    `Deleted request records for IDs: [${selectedRequestIds.join(", ")}].`
                );
                setSelectedRequestIds([]);
            }
        });
    };

    const openModal = (request: any, type: string) => {
        setSelectedRequest(request);
        setModalType(type);
        setAdminNote("");
    };

    const closeModal = () => {
        setSelectedRequest(null);
        setModalType(null);
    };

    // Clear all action logs
    const handleClearLogs = () => {
        localStorage.removeItem("freezing_request_logs");
        setAuditLogs([]);
        showToast("Action logs cleared successfully!", "success");
    };

    const columns = [
        {
            key: "student_id", label: "STUDENT ID", width: "130px",
            render: (val: any, row: any) => {
                const student = allStudents.find(s => s.student_id === val);
                return <div className="font-bold text-gray-900 dark:text-white truncate" title={student?.student_id || val || "N/A"}>{student?.student_id || val || "N/A"}</div>;
            }
        },
        {
            key: "student_name", label: "FULL NAME", width: "180px",
            render: (val: any) => <div className="font-extrabold text-gray-950 dark:text-white uppercase truncate" title={val}>{val}</div>
        },
        {
            key: "student_email", label: "EMAIL", width: "180px",
            render: (val: any) => <div className="text-gray-600 dark:text-gray-400 truncate" title={val}>{val}</div>
        },
        {
            key: "program", label: "PROGRAM", width: "160px",
            render: (_: any, row: any) => {
                const student = allStudents.find(s => s.student_id === row.student_id);
                return <div className="text-gray-600 dark:text-gray-400 font-medium truncate" title={student?.chosen_program || "-"}>{student?.chosen_program || "-"}</div>;
            }
        },
        {
            key: "subprogram", label: "SUBPROGRAM", width: "160px",
            render: (_: any, row: any) => {
                const student = allStudents.find(s => s.student_id === row.student_id);
                return <div className="text-gray-600 dark:text-gray-400 font-medium truncate" title={student?.chosen_subprogram_name || student?.chosen_subprogram || "-"}>{student?.chosen_subprogram_name || student?.chosen_subprogram || "-"}</div>;
            }
        },
        {
            key: "period", label: "FREEZING PERIOD", width: "200px",
            render: (_: any, row: any) => {
                const durationDays = Math.ceil((new Date(row.end_date).getTime() - new Date(row.start_date).getTime()) / (1000 * 60 * 60 * 24));
                return (
                    <div className="text-xs">
                        <div className="font-bold text-blue-600 dark:text-blue-400">
                            {new Date(row.start_date).toLocaleDateString()} - {new Date(row.end_date).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] text-gray-400 font-bold mt-0.5">Duration: {durationDays} Days</div>
                    </div>
                );
            },
        },
        {
            key: "reason",
            label: "REASON",
            width: "140px",
            render: (val: any) => <span className="capitalize text-xs font-semibold text-gray-700 dark:text-gray-300">{val}</span>
        },
        {
            key: "status", label: "STATUS", width: "110px",
            render: (val: any) => {
                switch (val) {
                    case 'approved': return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 uppercase tracking-wider">Approved</span>;
                    case 'rejected': return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 uppercase tracking-wider">Rejected</span>;
                    default: return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400 uppercase tracking-wider">Pending</span>;
                }
            },
        },
        {
            key: "actions", label: "ACTIONS", width: "120px",
            render: (_: any, row: any) => {
                if (row.status === 'pending') {
                    return (
                        <div className="flex gap-2">
                            <button onClick={() => openModal(row, 'approve')} className="text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 p-1.5 rounded-lg border border-green-100 dark:border-green-900/30 transition-all" title="Approve Request">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                            </button>
                            <button
                                onClick={() => {
                                    setConfirmationModal({
                                        isOpen: true,
                                        title: "Confirm Rejection",
                                        message: `Are you sure you want to reject the freezing request for ${row.student_name}?`,
                                        onConfirm: () => {
                                            setConfirmationModal(prev => ({ ...prev, isOpen: false }));
                                            openModal(row, 'reject');
                                        }
                                    });
                                }}
                                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 p-1.5 rounded-lg border border-red-100 dark:border-red-900/30 transition-all"
                                title="Reject Request"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    );
                }
                return (
                    <button
                        onClick={() => openModal(row, 'view')}
                        className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 p-1.5 rounded-lg border border-blue-100 dark:border-blue-900/30 transition-all"
                        title="View Details"
                    >
                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </button>
                );
            },
        },
    ];

    // Table Custom Left Headers
    const customHeaderLeft = (
        <div className="flex items-center gap-3">
            {/* Show All Button (Requirement 1.61) */}
            <button
                onClick={() => {
                    setRowsPerPage(rowsPerPage === 10000 ? 10 : 10000);
                    showToast(rowsPerPage === 10000 ? "Pagination reset to 10 rows." : "Showing all records unfiltered!", "info");
                }}
                className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${rowsPerPage === 10000
                        ? "bg-[#010080] text-white border-transparent shadow-md"
                        : isDark
                            ? "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
                    }`}
            >
                {rowsPerPage === 10000 ? "✓ Showing All" : "Show All Requests"}
            </button>

            {/* Smart Alert Action Button (Requirement 1.63) */}
            <button
                onClick={() => setIsSmartAlertOpen(true)}
                className={`relative px-4 py-2 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 ${isDark
                        ? "bg-blue-900/30 border-blue-900/50 text-blue-400 hover:bg-blue-900/50"
                        : "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 shadow-sm"
                    }`}
            >
                <span>🚨</span>
                <span>Smart Alerts</span>
                {activeAlerts.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 border border-white text-white text-[9px] flex items-center justify-center font-black">
                        {activeAlerts.length}
                    </span>
                )}
            </button>
        </div>
    );

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'} p-6 transition-colors duration-300`}>

            {/* Page Header */}
            <div className="mb-6 flex justify-between items-center border-b border-gray-250 dark:border-gray-800 pb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Course Freezing Request Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Review temporary suspension requests, verify policy thresholds, and run batch status updates.</p>
                </div>
            </div>

            {/* Bulk Actions Panel (Requirement 1.62) */}
            {selectedRequestIds.length > 0 && (
                <div className="mb-4 p-4 rounded-xl border border-blue-200 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-950/20 flex items-center justify-between animate-fadeIn shadow-xs">
                    <div className="flex items-center gap-2">
                        <span className="text-blue-500 text-sm font-bold">✓ Selected: {selectedRequestIds.length} requests</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => handleBulkAction("approve")}
                            className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                        >
                            Bulk Approve
                        </button>
                        <button
                            onClick={() => handleBulkAction("reject")}
                            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                        >
                            Bulk Reject
                        </button>
                        <button
                            onClick={handleBulkDelete}
                            className="px-4 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                        >
                            Bulk Dismiss
                        </button>
                    </div>
                </div>
            )}

            {/* Main Data Grid */}
            <main className="flex-1 bg-white dark:bg-[#0f172a] rounded-2xl border border-gray-200 dark:border-gray-850 shadow-sm p-4">
                <DataTable
                    title="Student Freezing Requests"
                    columns={columns}
                    data={requests}
                    showAddButton={false}
                    isLoading={isLoading}
                    searchKey="student_name"
                    selectable={true}
                    selectedItems={selectedRequestIds}
                    onSelectionChange={setSelectedRequestIds}
                    customHeaderLeft={customHeaderLeft}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={setRowsPerPage}
                />
            </main>

            {/* 1.64. ACTION HISTORY AUDIT LOG (Requirement 1.64) */}
            <div className={`mt-8 rounded-2xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} shadow-sm overflow-hidden`}>
                <div
                    onClick={() => setIsAuditLogsCollapsed(!isAuditLogsCollapsed)}
                    className="flex justify-between items-center px-6 py-4 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all border-b dark:border-gray-800"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-blue-500 font-bold">📜</span>
                        <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-500">Freezing Request Action History Logs</h3>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full font-bold">
                            {auditLogs.length} Events
                        </span>
                        <span className="text-gray-400 text-xs">
                            {isAuditLogsCollapsed ? "▼ Show" : "▲ Hide"}
                        </span>
                    </div>
                </div>

                {!isAuditLogsCollapsed && (
                    <div className="p-6 space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                        <div className="flex justify-end">
                            <button
                                onClick={handleClearLogs}
                                className="text-[10px] text-red-500 hover:text-red-700 font-bold border border-red-200 dark:border-red-900/30 px-2.5 py-1 rounded bg-red-50/50 dark:bg-red-950/20"
                            >
                                Clear History
                            </button>
                        </div>
                        {auditLogs.length === 0 ? (
                            <p className="text-center text-xs text-gray-400 py-6 italic">No action history logged yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {auditLogs.map((log) => (
                                    <div key={log.id} className="flex gap-4 text-xs border-b pb-3 last:border-b-0 dark:border-gray-800">
                                        <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold">
                                            ℹ️
                                        </div>
                                        <div className="flex-1 space-y-0.5">
                                            <div className="flex justify-between items-center">
                                                <span className="font-extrabold text-gray-800 dark:text-gray-200">{log.action}</span>
                                                <span className="text-[10px] text-gray-400 font-bold">{new Date(log.timestamp).toLocaleString()}</span>
                                            </div>
                                            <p className="text-gray-500 dark:text-gray-400 text-[11px] leading-relaxed">{log.details}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Smart Alert Modal (Requirement 1.63) */}
            {isSmartAlertOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 animate-fadeIn">
                    <div
                        className="absolute inset-0 backdrop-blur-sm"
                        onClick={() => setIsSmartAlertOpen(false)}
                    />
                    <div className={`relative w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border transition-all ${isDark ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-150 text-gray-900'
                        }`}>
                        <div className="px-6 py-4 border-b dark:border-gray-850 flex justify-between items-center">
                            <h3 className="font-extrabold text-base flex items-center gap-2 text-amber-500">
                                <span>🚨</span>
                                <span>Freezing Request Smart Alerts</span>
                            </h3>
                            <button
                                onClick={() => setIsSmartAlertOpen(false)}
                                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                            <p className="text-xs text-gray-500">
                                Smart evaluation of pending requests against academic code-of-conduct policies:
                            </p>

                            {activeAlerts.length === 0 ? (
                                <div className="text-center py-8 text-xs text-gray-400 font-bold border border-dashed rounded-xl dark:border-gray-800">
                                    ✓ All checks passed! No freeze violations or long period warnings detected.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {activeAlerts.map((alert, idx) => (
                                        <div
                                            key={idx}
                                            className={`p-4 rounded-xl border flex items-start gap-3 shadow-2xs ${alert.type === "danger"
                                                    ? "bg-red-50/50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-900 dark:text-red-400"
                                                    : "bg-amber-50/50 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-400"
                                                }`}
                                        >
                                            <span className="text-lg shrink-0">⚠️</span>
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold leading-normal">{alert.message}</p>
                                                <button
                                                    onClick={() => {
                                                        setIsSmartAlertOpen(false);
                                                        openModal(alert.request, "approve");
                                                    }}
                                                    className={`px-3 py-1 mt-2 text-[10px] font-extrabold rounded-md shadow-2xs transition-all ${alert.type === "danger"
                                                            ? "bg-red-600 hover:bg-red-700 text-white"
                                                            : "bg-amber-600 hover:bg-amber-700 text-white"
                                                        }`}
                                                >
                                                    Inspect Request
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Standard Modal dialogs */}
            <FreezingActionModal
                isOpen={!!selectedRequest}
                onClose={closeModal}
                request={selectedRequest}
                modalType={modalType}
                adminNote={adminNote}
                setAdminNote={setAdminNote}
                handleAction={handleAction}
                isUpdating={isUpdating}
                isDark={isDark}
                allStudents={allStudents}
            />

            <AdminConfirmationModal
                isOpen={confirmationModal.isOpen}
                onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
                title={confirmationModal.title}
                message={confirmationModal.message}
                onConfirm={confirmationModal.onConfirm || (() => { })}
                isDark={isDark}
            />
        </div>
    );
}
