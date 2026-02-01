"use client";

import { useState } from "react";

import DataTable from "@/components/DataTable";
import {
    useGetShiftsQuery,
    useCreateShiftMutation,
    useUpdateShiftMutation,
    useDeleteShiftMutation
} from "@/redux/api/shiftApi";
import { useDarkMode } from "@/context/ThemeContext";
import { useToast } from "@/components/Toast";

// Extracted Components
import ShiftForm from "./components/ShiftForm";
import ShiftConfirmationModal from "./components/ShiftConfirmationModal";

export default function ShiftsPage() {
    const { isDark } = useDarkMode();
    const { showToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingShift, setEditingShift] = useState(null);
    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false, title: "", message: "", onConfirm: null, isLoading: false, confirmButtonColor: "red"
    });

    const { data: shifts = [], isLoading, isError, error } = useGetShiftsQuery();
    const [createShift, { isLoading: isCreating }] = useCreateShiftMutation();
    const [updateShift, { isLoading: isUpdating }] = useUpdateShiftMutation();
    const [deleteShift, { isLoading: isDeleting }] = useDeleteShiftMutation();

    const [formData, setFormData] = useState({
        shift_name: "", session_type: "", start_time: "", end_time: ""
    });

    const handleAddShift = () => {
        setEditingShift(null);
        setFormData({ shift_name: "", session_type: "", start_time: "", end_time: "" });
        setIsModalOpen(true);
    };

    const handleEdit = (shift) => {
        setEditingShift(shift);
        setFormData({
            shift_name: shift.shift_name || "",
            session_type: shift.session_type || "",
            start_time: shift.start_time || "",
            end_time: shift.end_time || ""
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        setConfirmationModal({
            isOpen: true,
            title: "Delete Shift",
            message: "Are you sure you want to delete this shift? This action cannot be undone.",
            onConfirm: async () => {
                setConfirmationModal(prev => ({ ...prev, isLoading: true }));
                try {
                    await deleteShift(id).unwrap();
                    showToast("Shift deleted successfully!", "success");
                    setConfirmationModal({ isOpen: false, title: "", message: "", onConfirm: null, isLoading: false, confirmButtonColor: "red" });
                } catch (error) {
                    setConfirmationModal(prev => ({ ...prev, isLoading: false }));
                    showToast(error?.data?.error || "Failed to delete shift.", "error");
                }
            },
            isLoading: false,
            confirmButtonColor: "red"
        });
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingShift(null);
        setFormData({ shift_name: "", session_type: "", start_time: "", end_time: "" });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingShift) {
                await updateShift({ id: editingShift.id, ...formData }).unwrap();
                showToast("Shift updated successfully!", "success");
            } else {
                await createShift(formData).unwrap();
                showToast("Shift created successfully!", "success");
            }
            handleCloseModal();
        } catch (error) {
            showToast(error?.data?.error || "Failed to save shift.", "error");
        }
    };

    const columns = [
        { key: "shift_name", label: "Shift Name" },
        {
            key: "session_type",
            label: "Session",
            render: (val) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isDark ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-600'}`}>
                    {val}
                </span>
            )
        },
        {
            key: "start_time",
            label: "Start Time",
            render: (val) => <span className="font-medium">{val}</span>
        },
        {
            key: "end_time",
            label: "End Time",
            render: (val) => <span className="font-medium">{val}</span>
        },
        {
            key: "actions", label: "Actions",
            render: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleEdit(row)}
                        className="text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                        disabled={isDeleting}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            ),
        },
    ];

    if (isLoading) return <main className="flex-1 pt-12 text-center text-gray-600">Loading shifts...</main>;
    if (isError) return <main className="flex-1 pt-12 text-center text-red-600">Error: {error?.data?.error || "Unknown error"}</main>;

    return (
        <>
            <main className={`flex-1 min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="w-full px-8 py-6">
                    <DataTable
                        title="Shift Management"
                        columns={columns}
                        data={shifts}
                        onAddClick={handleAddShift}
                        showAddButton={true}
                    />
                </div>
            </main>

            <ShiftForm
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                editingShift={editingShift}
                formData={formData}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                isDark={isDark}
                isCreating={isCreating}
                isUpdating={isUpdating}
            />

            <ShiftConfirmationModal
                isOpen={confirmationModal.isOpen}
                onClose={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}
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
