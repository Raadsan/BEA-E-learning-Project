"use client";

import { useState } from "react";

import DataTable from "@/components/DataTable";
import { useDarkMode } from "@/context/ThemeContext";
import {
    useGetFreezingRequestsQuery,
    useUpdateFreezingRequestStatusMutation
} from "@/redux/api/freezingApi";
import { useGetStudentsQuery } from "@/redux/api/studentApi";
import { useToast } from "@/components/Toast";
import FreezingActionModal from "./components/FreezingActionModal";
import AdminConfirmationModal from "../../admins/components/AdminConfirmationModal";

export default function AdminFreezingRequestsPage() {
    const { isDark } = useDarkMode();
    const { showToast } = useToast();
    const { data: requests = [], isLoading, refetch } = useGetFreezingRequestsQuery();
    const { data: allStudents = [] } = useGetStudentsQuery();
    const [updateStatus, { isLoading: isUpdating }] = useUpdateFreezingRequestStatusMutation();

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [adminNote, setAdminNote] = useState("");
    const [modalType, setModalType] = useState(null); // 'approve' or 'reject'

    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: null
    });

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
            key: "student_id", label: "STUDENT ID", width: "150px",
            render: (row) => {
                const student = allStudents.find(s => s.student_id === row.student_id);
                return <div className="font-bold text-gray-900 dark:text-white truncate lg:max-w-[150px]" title={student?.student_id || row.student_id || "N/A"}>{student?.student_id || row.student_id || "N/A"}</div>;
            }
        },
        {
            key: "student_name", label: "FULL NAME", width: "200px",
            render: (row) => <div className="font-bold text-gray-900 dark:text-white uppercase truncate lg:max-w-[180px]" title={row.student_name}>{row.student_name}</div>
        },
        {
            key: "student_email", label: "EMAIL", width: "200px",
            render: (row) => <div className="text-gray-600 dark:text-gray-400 truncate lg:max-w-[200px]" title={row.student_email}>{row.student_email}</div>
        },
        {
            key: "phone", label: "PHONE", width: "150px",
            render: (row) => {
                const student = allStudents.find(s => s.student_id === row.student_id);
                return <span className="text-gray-600 dark:text-gray-400">{student?.phone || "-"}</span>;
            }
        },
        {
            key: "age", label: "AGE", width: "80px",
            render: (row) => {
                const student = allStudents.find(s => s.student_id === row.student_id);
                return <span className="text-gray-600 dark:text-gray-400">{student?.age || "-"}</span>;
            }
        },
        {
            key: "country", label: "COUNTRY", width: "120px",
            render: (row) => {
                const student = allStudents.find(s => s.student_id === row.student_id);
                return <span className="text-gray-600 dark:text-gray-400">{student?.country || "-"}</span>;
            }
        },
        {
            key: "program", label: "PROGRAM", width: "180px",
            render: (row) => {
                const student = allStudents.find(s => s.student_id === row.student_id);
                return <div className="text-gray-600 dark:text-gray-400 font-medium truncate lg:max-w-[180px]" title={student?.chosen_program || "-"}>{student?.chosen_program || "-"}</div>;
            }
        },
        {
            key: "subprogram", label: "SUBPROGRAM", width: "180px",
            render: (row) => {
                const student = allStudents.find(s => s.student_id === row.student_id);
                return <div className="text-gray-600 dark:text-gray-400 font-medium truncate lg:max-w-[180px]" title={student?.chosen_subprogram_name || student?.chosen_subprogram || "-"}>{student?.chosen_subprogram_name || student?.chosen_subprogram || "-"}</div>;
            }
        },
        {
            key: "period", label: "FREEZING PERIOD", width: "220px",
            render: (row) => (
                <div className="text-sm">
                    <div className="font-bold text-blue-600 dark:text-blue-400">
                        {new Date(row.start_date).toLocaleDateString()} - {new Date(row.end_date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">Duration: {Math.ceil((new Date(row.end_date) - new Date(row.start_date)) / (1000 * 60 * 60 * 24))} days</div>
                </div>
            ),
        },
        { key: "reason", label: "REASON", width: "150px", render: (row) => <div className="capitalize text-sm font-medium truncate lg:max-w-[150px]" title={row.reason}>{row.reason}</div> },
        { key: "description", label: "DETAILS", width: "200px", render: (row) => <div className="text-sm truncate lg:max-w-[200px]" title={row.description}>{row.description || "No description provided"}</div> },
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
            key: "actions", label: "ACTIONS", width: "150px",
            render: (row) => {
                if (row.status === 'pending') {
                    return (
                        <div className="flex gap-2">
                            <button onClick={() => openModal(row, 'approve')} className="text-orange-500 hover:bg-orange-50 p-2 rounded-lg transition-colors border border-orange-100 dark:border-orange-900/30" title="Approve Request">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                                className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors border border-red-100 dark:border-red-900/30"
                                title="Reject Request"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </button>
                        </div>
                    );
                }
                return (
                    <button
                        onClick={() => openModal(row, 'view')}
                        className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors border border-blue-100 dark:border-blue-900/30"
                        title="View Details"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        title="Course Freezing Requests"
                        columns={columns}
                        data={requests}
                        showAddButton={false}
                        isLoading={isLoading}
                        searchKey="student_name"
                    />
                </div>
            </main>
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
                onConfirm={confirmationModal.onConfirm}
                isDark={isDark}
            />
        </>
    );
}
