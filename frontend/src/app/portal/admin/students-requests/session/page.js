"use client";

import { useState } from "react";

import DataTable from "@/components/DataTable";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetSessionRequestsQuery, useUpdateSessionRequestStatusMutation } from "@/redux/api/sessionRequestApi";
import { useGetClassesQuery } from "@/redux/api/classApi";
import { useUpdateStudentMutation, useGetStudentsQuery } from "@/redux/api/studentApi";
import { useToast } from "@/components/Toast";
import { useGetSubprogramsQuery } from "@/redux/api/subprogramApi";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useGetShiftsQuery } from "@/redux/api/shiftApi";
import SessionActionModal from "./components/SessionActionModal";
import AdminConfirmationModal from "../../admins/components/AdminConfirmationModal";

export default function AdminSessionRequestsPage() {
    const { isDark } = useDarkMode();
    const { showToast } = useToast();
    const { data: requests = [], isLoading, refetch } = useGetSessionRequestsQuery();
    const { data: classes = [] } = useGetClassesQuery();
    const { data: allStudents = [] } = useGetStudentsQuery();
    const { data: subprograms = [] } = useGetSubprogramsQuery();
    const { data: programs = [] } = useGetProgramsQuery();
    const { data: shifts = [] } = useGetShiftsQuery();
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
    };

    const closeModal = () => {
        setSelectedRequest(null);
        setModalType(null);
    };

    const columns = [
        {
            key: "student_id", label: "STUDENT ID", width: "150px",
            render: (row) => <div className="text-gray-900 dark:text-white truncate lg:max-w-[150px]" title={row.student_id || "N/A"}>{row.student_id || "N/A"}</div>
        },
        {
            key: "student_name", label: "NAME", width: "200px",
            render: (row) => <div className="text-gray-600 dark:text-gray-400  truncate lg:max-w-[180px]" title={row.student_name}>{row.student_name}</div>
        },
        {
            key: "program_name", label: "PROGRAM", width: "180px",
            render: (row) => <div className="text-gray-700 dark:text-gray-300 truncate lg:max-w-[180px]" title={row.program_name || "-"}>{row.program_name || "-"}</div>
        },
        {
            key: "subprogram_name", label: "SUBPROGRAM", width: "180px",
            render: (row) => <div className="text-gray-700 dark:text-gray-300 truncate lg:max-w-[180px]" title={row.subprogram_name || "-"}>{row.subprogram_name || "-"}</div>
        },
        {
            key: "current_class_name", label: "CURRENT CLASS", width: "180px",
            render: (row) => (
                <div className="text-sm text-gray-700 dark:text-gray-200 truncate lg:max-w-[180px]" title={`${row.current_class_name || "N/A"}`}>
                    <div>{row.current_class_name || "N/A"}</div>
                    <div className="text-[10px] text-gray-500 font-normal">
                        {row.current_shift_name && row.current_session_type
                            ? `${row.current_shift_name} - ${row.current_session_type}`
                            : row.current_session_type || ""}
                    </div>
                </div>
            )
        },
        {
            key: "requested_session_type", label: "REQUEST", width: "180px",
            render: (row) => (
                <div className="truncate lg:max-w-[180px]" title={row.requested_session_type}>
                    <span className="text-sm text-blue-600 dark:text-blue-400 capitalize">{row.requested_session_type}</span>
                    <div className="text-[10px] text-gray-500">
                        {row.requested_shift_name && row.requested_class_type
                            ? `${row.requested_shift_name} - ${row.requested_class_type}`
                            : row.requested_class_type || ""}
                    </div>
                </div>
            ),
        },
        {
            key: "status", label: "STATUS", width: "120px",
            render: (row) => {
                const styles = {
                    approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
                    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
                    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
                };

                const currentStyle = styles[row.status] || styles.pending;

                if (row.status === 'pending') {
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
                        {row.status}
                    </span>
                );
            },
        },
        {
            key: "actions", label: "ACTIONS", width: "100px",
            render: (row) => (
                <button
                    onClick={() => openModal(row, 'view')}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-1 text-xs"
                    title="View Details"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>View</span>
                </button>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
            <main className="flex-1 min-w-0 flex flex-col items-center bg-gray-50 transition-colors dark:bg-gray-900">
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
                setModalType={setModalType}
                adminNote={adminNote}
                setAdminNote={setAdminNote}
                handleAction={handleAction}
                isUpdating={isStatusUpdating || isStudentUpdating}
                isDark={isDark}
                classes={classes}
                allStudents={allStudents}
                subprograms={subprograms}
                programs={programs}
                shifts={shifts}
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
