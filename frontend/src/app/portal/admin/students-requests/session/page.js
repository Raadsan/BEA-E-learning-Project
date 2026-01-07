"use client";

import { useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetSessionRequestsQuery, useUpdateSessionRequestStatusMutation } from "@/redux/api/sessionRequestApi";
import { useGetClassesQuery } from "@/redux/api/classApi";
import { useUpdateStudentMutation, useGetStudentsQuery } from "@/redux/api/studentApi";
import { useToast } from "@/components/Toast";
import SessionActionModal from "./components/SessionActionModal";
import AdminConfirmationModal from "../../admins/components/AdminConfirmationModal";

export default function AdminSessionRequestsPage() {
    const { isDark } = useDarkMode();
    const { showToast } = useToast();
    const { data: requests = [], isLoading, refetch } = useGetSessionRequestsQuery();
    const { data: classes = [] } = useGetClassesQuery();
    const { data: allStudents = [] } = useGetStudentsQuery();
    const [updateStatus, { isLoading: isStatusUpdating }] = useUpdateSessionRequestStatusMutation();
    const [updateStudent, { isLoading: isStudentUpdating }] = useUpdateStudentMutation();

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [adminNote, setAdminNote] = useState("");
    const [modalType, setModalType] = useState(null); // 'approve' or 'reject'
    const [selectedClassId, setSelectedClassId] = useState("");
    const [selectedType, setSelectedType] = useState("");

    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: null
    });

    const handleAction = async (status, classId = null) => {
        if (!selectedRequest) return;
        try {
            // 1. Update Request Status
            await updateStatus({ id: selectedRequest.id, status, admin_response: adminNote }).unwrap();

            // 2. If approved and classId provided, update Student's class
            if (status === 'approved' && classId) {
                const selectedClass = classes.find(c => c.id === parseInt(classId));
                const subprogramId = selectedClass?.subprogram_id || null;

                await updateStudent({
                    id: selectedRequest.student_id,
                    class_id: parseInt(classId),
                    chosen_subprogram: subprogramId
                }).unwrap();
            }

            showToast(`Request ${status === 'approved' ? 'approved' : 'rejected'} successfully!`, "success");
            closeModal();
            refetch();
        } catch (err) {
            console.error("Action failed:", err);
            showToast(err?.data?.error || "Failed to update status.", "error");
        }
    };

    const openModal = (request, type) => {
        setSelectedRequest(request);
        setModalType(type);
        setAdminNote("");
        setSelectedClassId("");
        setSelectedType(request.requested_session_type?.toLowerCase() || "");
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
            render: (row) => <div className="text-gray-600 dark:text-gray-400  truncate lg:max-w-[180px]" title={row.student_name}>{row.student_name}</div>
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
        { key: "current_class_name", label: "CURRENT CLASS", width: "150px", render: (row) => <div className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate lg:max-w-[150px]" title={row.current_class_name || "N/A"}>{row.current_class_name || "N/A"}</div> },
        {
            key: "requested_session_type", label: "REQUESTED", width: "180px",
            render: (row) => (
                <div className="truncate lg:max-w-[180px]" title={`${row.requested_session_type} ${row.requested_class_name ? '- ' + row.requested_class_name : ''}`}>
                    <span className="font-bold text-sm text-blue-600 dark:text-blue-400 capitalize">{row.requested_session_type}</span>
                    {row.requested_class_name && <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({row.requested_class_name})</span>}
                </div>
            ),
        },
        { key: "reason", label: "REASON", width: "200px", render: (row) => <div className="text-sm italic text-gray-600 dark:text-gray-300 truncate lg:max-w-[200px]" title={row.reason}>{row.reason}</div> },
        {
            key: "status", label: "STATUS", width: "120px",
            render: (row) => {
                switch (row.status) {
                    case 'approved': return <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 uppercase tracking-tighter shadow-sm border border-green-200 dark:border-green-800">Approved</span>;
                    case 'rejected': return <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 uppercase tracking-tighter shadow-sm border border-red-200 dark:border-red-800">Rejected</span>;
                    default: return <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 uppercase tracking-tighter shadow-sm border border-yellow-200 dark:border-yellow-800">Pending</span>;
                }
            },
        },
        {
            key: "actions", label: "ACTIONS", width: "150px",
            render: (row) => {
                if (row.status === 'pending') {
                    return (
                        <div className="flex gap-2">
                            <button onClick={() => openModal(row, 'approve')} className="text-orange-500 hover:bg-orange-50 p-2 rounded-lg transition-colors border border-orange-100 dark:border-orange-900/30" title="Approve & Assign Class">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => {
                                    setConfirmationModal({
                                        isOpen: true,
                                        title: "Confirm Rejection",
                                        message: `Are you sure you want to reject the session request for ${row.student_name}?`,
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
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="View Details"
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
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
            <AdminHeader />
            <main className="flex-1 min-w-0 flex flex-col items-center bg-gray-50 pt-20 transition-colors dark:bg-gray-900">
                <div className="w-full max-w-full px-4 sm:px-8 py-6 min-w-0 flex flex-col">
                    <DataTable
                        title="Session Change Requests"
                        columns={columns}
                        data={requests}
                        showAddButton={false}
                        isLoading={isLoading}
                    />
                </div>
            </main>

            <SessionActionModal
                isOpen={!!selectedRequest}
                onClose={closeModal}
                request={selectedRequest}
                modalType={modalType}
                adminNote={adminNote}
                setAdminNote={setAdminNote}
                handleAction={handleAction}
                isUpdating={isStatusUpdating || isStudentUpdating}
                isDark={isDark}
                classes={classes}
                allStudents={allStudents}
                selectedClassId={selectedClassId}
                setSelectedClassId={setSelectedClassId}
                selectedType={selectedType}
                setSelectedType={setSelectedType}
            />

            <AdminConfirmationModal
                isOpen={confirmationModal.isOpen}
                onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
                title={confirmationModal.title}
                message={confirmationModal.message}
                onConfirm={confirmationModal.onConfirm}
                isDark={isDark}
            />
        </div>
    );
}
