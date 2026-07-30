"use client";

import { useState } from "react";

import DataTable from "@/components/DataTable";
import {
    useGetShiftsQuery,
    useCreateShiftMutation,
    useUpdateShiftMutation,
    useDeleteShiftMutation
} from "@/lib/api/shiftApi";
import { useDarkMode } from "@/context/ThemeContext";
import { useToast } from "@/components/Toast";
import { usePagePermissions } from "@/hooks/usePagePermissions";
import AdminTableActions from "@/components/admin/AdminTableActions";

// Extracted Components
import ShiftForm from "@/components/admin/shifts/ShiftForm";
import ShiftConfirmationModal from "@/components/admin/shifts/ShiftConfirmationModal";

export default function ShiftsPage() {
    const { isDark } = useDarkMode();
    const { showToast } = useToast();
    const { canAdd, canEdit, canDelete } = usePagePermissions("class_management", "shifts");
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

    const formatTimeForInput = (timeVal: any) => {
        if (!timeVal) return "";
        let timeStr = timeVal.toString();
        if (timeStr.includes("T")) {
            const parts = timeStr.split("T");
            if (parts[1]) {
                timeStr = parts[1].substring(0, 5);
            }
        } else if (timeStr.length >= 5) {
            timeStr = timeStr.substring(0, 5);
        }
        return timeStr;
    };

    const handleEdit = (shift: any) => {
        setEditingShift(shift);
        setFormData({
            shift_name: shift.shift_name || "",
            session_type: shift.session_type || "",
            start_time: formatTimeForInput(shift.start_time),
            end_time: formatTimeForInput(shift.end_time)
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

    const formatTime = (timeVal) => {
        if (!timeVal) return "-";
        let timeStr = timeVal.toString();
        if (timeStr.includes("T")) {
            const parts = timeStr.split("T");
            if (parts[1]) {
                timeStr = parts[1].substring(0, 8);
            }
        }
        const match = timeStr.match(/^(\d{2}):(\d{2})/);
        if (!match) return timeStr;

        let hours = parseInt(match[1], 10);
        const minutes = match[2];
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const strHours = hours.toString().padStart(2, '0');

        return `${strHours}:${minutes} ${ampm}`;
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
            render: (val) => <span className="font-medium">{formatTime(val)}</span>
        },
        {
            key: "end_time",
            label: "End Time",
            render: (val) => <span className="font-medium">{formatTime(val)}</span>
        },
        {
            key: "actions", label: "Actions",
            render: (_, row) => (
                <AdminTableActions
                    canView={false}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    onEdit={() => handleEdit(row)}
                    onDelete={() => handleDelete(row.id)}
                    deleteDisabled={isDeleting}
                />
            ),
        },
    ];

    if (isLoading) return <main className="flex-1 pt-12 text-center text-gray-600">Loading shifts...</main>;
    if (isError) return <main className="flex-1 pt-12 text-center text-red-600">Error: {(error as any)?.data?.error || "Unknown error"}</main>;

    return (
        <>
            <main className={`flex-1 min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="w-full px-8 py-6">
                    <DataTable
                        title="Shift Management"
                        columns={columns}
                        data={shifts}
                        onAddClick={canAdd ? handleAddShift : undefined}
                        showAddButton={canAdd}
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
