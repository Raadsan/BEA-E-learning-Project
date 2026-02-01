"use client";

import { useState } from "react";

import DataTable from "@/components/DataTable";
import { useGetSubprogramsQuery, useCreateSubprogramMutation, useUpdateSubprogramMutation, useDeleteSubprogramMutation } from "@/redux/api/subprogramApi";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useDarkMode } from "@/context/ThemeContext";
import { useToast } from "@/components/Toast";

// Extracted Components
import SubprogramForm from "./components/SubprogramForm";
import SubprogramConfirmationModal from "./components/SubprogramConfirmationModal";

export default function SubprogramsPage() {
  const { isDark } = useDarkMode();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubprogram, setEditingSubprogram] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    isLoading: false,
    confirmButtonColor: "blue"
  });

  const { data: backendSubprograms, isLoading, isError, error } = useGetSubprogramsQuery();
  const { data: programs = [] } = useGetProgramsQuery();
  const [createSubprogram, { isLoading: isCreating }] = useCreateSubprogramMutation();
  const [updateSubprogram, { isLoading: isUpdating }] = useUpdateSubprogramMutation();
  const [deleteSubprogram, { isLoading: isDeleting }] = useDeleteSubprogramMutation();

  const subprograms = backendSubprograms || [];

  const [formData, setFormData] = useState({
    subprogram_name: "",
    program_id: "",
    description: "",
    status: "active",
  });

  const handleAddSubprogram = () => {
    setEditingSubprogram(null);
    setFormData({
      subprogram_name: "",
      program_id: "",
      description: "",
      status: "active",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (subprogram) => {
    setEditingSubprogram(subprogram);
    setFormData({
      subprogram_name: subprogram.subprogram_name || "",
      program_id: subprogram.program_id || "",
      description: subprogram.description || "",
      status: subprogram.status || "active",
    });
    setIsModalOpen(true);
  };

  const handleStatusToggle = (subprogram) => {
    const newStatus = subprogram.status === 'active' ? 'inactive' : 'active';
    const confirmMessage = `Do you want to change status of "${subprogram.subprogram_name}" to ${newStatus}?`;

    setConfirmationModal({
      isOpen: true,
      title: "Confirm Status Change",
      message: confirmMessage,
      onConfirm: async () => {
        setConfirmationModal(prev => ({ ...prev, isLoading: true }));
        try {
          await updateSubprogram({ id: subprogram.id, status: newStatus }).unwrap();
          showToast("Status updated successfully!", "success");
          setConfirmationModal({ isOpen: false, title: "", message: "", onConfirm: null, isLoading: false, confirmButtonColor: "blue" });
        } catch (error) {
          setConfirmationModal(prev => ({ ...prev, isLoading: false }));
          showToast(error?.data?.error || "Failed to update status.", "error");
        }
      },
      isLoading: false,
      confirmButtonColor: "blue"
    });
  };

  const handleDeleteClick = (subprogram) => {
    setConfirmationModal({
      isOpen: true,
      title: "Delete Subprogram",
      message: `Are you sure you want to delete "${subprogram.subprogram_name}"? This action cannot be undone.`,
      onConfirm: async () => {
        setConfirmationModal(prev => ({ ...prev, isLoading: true }));
        try {
          await deleteSubprogram(subprogram.id).unwrap();
          showToast("Subprogram deleted successfully!", "success");
          setConfirmationModal({ isOpen: false, title: "", message: "", onConfirm: null, isLoading: false, confirmButtonColor: "red" });
        } catch (error) {
          setConfirmationModal(prev => ({ ...prev, isLoading: false }));
          showToast(error?.data?.error || "Failed to delete subprogram.", "error");
        }
      },
      isLoading: false,
      confirmButtonColor: "red"
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSubprogram(null);
    setFormData({
      subprogram_name: "",
      program_id: "",
      description: "",
      status: "active",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        program_id: parseInt(formData.program_id),
      };

      if (editingSubprogram) {
        await updateSubprogram({ id: editingSubprogram.id, ...submitData }).unwrap();
        showToast("Subprogram updated successfully!", "success");
      } else {
        await createSubprogram(submitData).unwrap();
        showToast("Subprogram registered successfully!", "success");
      }

      handleCloseModal();
    } catch (error) {
      showToast(error?.data?.error || "Failed to save subprogram.", "error");
    }
  };

  const columns = [
    { key: "subprogram_name", label: "Subprogram Name" },
    { key: "program_name", label: "Program", render: (val) => val || "N/A" },
    { key: "description", label: "Description", render: (val) => <span className="text-gray-700 dark:text-gray-300 max-w-xs truncate block">{val || <span className="text-gray-400">No description</span>}</span> },
    { key: "status", label: "Status", render: (val, row) => <button onClick={() => handleStatusToggle(row)} className={`px-4 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full transition-all active:scale-95 ${val === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{val === "active" ? "Active" : "Inactive"}</button> },
    {
      key: "actions", label: "Actions",
      render: (_, row) => (
        <div className="flex gap-2">
          <button onClick={() => handleEdit(row)} className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50" title="Edit">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
          <button onClick={() => handleDeleteClick(row)} className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50" title="Delete" disabled={isDeleting}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) return <main className="flex-1 bg-gray-50"><div className="w-full px-8 py-6 text-center py-12 text-gray-600">Loading subprograms...</div></main>;
  if (isError) return <main className="flex-1 bg-gray-50"><div className="w-full px-8 py-6 text-center py-12 text-red-600">Error: {error?.data?.error || "Unknown error"}</div></main>;

  return (
    <>
      <main className="flex-1 bg-gray-50">
        <div className="w-full px-8 py-6">
          <DataTable title="Subprogram Management" columns={columns} data={subprograms} onAddClick={handleAddSubprogram} showAddButton={true} />
        </div>
      </main>

      <SubprogramForm isOpen={isModalOpen} onClose={handleCloseModal} editingSubprogram={editingSubprogram} formData={formData} handleInputChange={handleInputChange} handleSubmit={handleSubmit} isDark={isDark} programs={programs} isCreating={isCreating} isUpdating={isUpdating} />
      <SubprogramConfirmationModal isOpen={confirmationModal.isOpen} onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))} title={confirmationModal.title} message={confirmationModal.message} onConfirm={confirmationModal.onConfirm} isLoading={confirmationModal.isLoading} confirmButtonColor={confirmationModal.confirmButtonColor} isDark={isDark} />

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </>
  );
}
