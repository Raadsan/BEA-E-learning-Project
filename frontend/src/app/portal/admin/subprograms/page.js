"use client";

import { useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";
import { useGetSubprogramsQuery, useCreateSubprogramMutation, useUpdateSubprogramMutation, useDeleteSubprogramMutation } from "@/redux/api/subprogramApi";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useDarkMode } from "@/context/ThemeContext";
import { useToast } from "@/components/Toast";

export default function SubprogramsPage() {
  const { isDark } = useDarkMode();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewSubprogramsModalOpen, setIsViewSubprogramsModalOpen] = useState(false);
  const [selectedProgramForView, setSelectedProgramForView] = useState(null);
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
          console.error("Failed to update status:", error);
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
          console.error("Failed to delete subprogram:", error);
          setConfirmationModal(prev => ({ ...prev, isLoading: false }));
          showToast(error?.data?.error || "Failed to delete subprogram.", "error");
        }
      },
      isLoading: false,
      confirmButtonColor: "red"
    });
  };

  const confirmDelete = async () => {
    if (!subprogramToDelete) return;

    try {
      await deleteSubprogram(subprogramToDelete.id).unwrap();
      showToast("Subprogram deleted successfully!", "success");
      setIsDeleteModalOpen(false);
      setSubprogramToDelete(null);
    } catch (error) {
      console.error("Failed to delete subprogram:", error);
      showToast(error?.data?.error || "Failed to delete subprogram.", "error");
    }
  };

  const handleViewProgramSubprograms = (programName, programId) => {
    setSelectedProgramForView({ name: programName, id: programId });
    setIsViewSubprogramsModalOpen(true);
  };

  const handleCloseViewSubprogramsModal = () => {
    setIsViewSubprogramsModalOpen(false);
    setSelectedProgramForView(null);
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

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
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
    e.stopPropagation();

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
      console.error("Failed to save subprogram:", error);
      showToast(error?.data?.error || "Failed to save subprogram. Please try again.", "error");
    }

    return false;
  };

  const columns = [
    {
      key: "subprogram_name",
      label: "Subprogram Name",
    },
    {
      key: "program_name",
      label: "Program",
      render: (row) => row.program_name || "N/A",
    },
    {
      key: "description",
      label: "Description",
      render: (row) => (
        <span className="text-gray-700 dark:text-gray-300 max-w-xs truncate block">
          {row.description || <span className="text-gray-400">No description</span>}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <button
          onClick={() => handleStatusToggle(row)}
          className={`px-4 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full transition-all active:scale-95  ${row.status === 'active'
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
            }`}
          title="Click to toggle status"
        >
          {row.status === "active" ? "Active" : "Inactive"}
        </button>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
            title="Edit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => handleDeleteClick(row)}
            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
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

  if (isLoading) {
    return (
      <>
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-gray-50 mt-20">
          <div className="w-full px-8 py-6">
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Loading subprograms...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-gray-50 mt-20">
          <div className="w-full px-8 py-6">
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400">Error loading subprograms: {error?.data?.error || "Unknown error"}</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AdminHeader />

      <main className="flex-1 overflow-y-auto bg-gray-50 mt-20">
        <div className="w-full px-8 py-6">
          <DataTable
            title="Subprogram Management"
            columns={columns}
            data={subprograms}
            onAddClick={handleAddSubprogram}
            showAddButton={true}
          />
        </div>
      </main>

      {/* Add/Edit Subprogram Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseModal}
          />
          <div className={`relative w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden border-2 transition-all ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className={`sticky top-0 z-10 px-6 py-4 border-b flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {editingSubprogram ? "Edit Subprogram" : "Add New Subprogram"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-[#010080] transition-colors p-1 border-2 border-gray-100 rounded-md hover:border-[#010080]/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="subprogram_name" className="block text-sm font-semibold mb-2 text-gray-700">
                  Subprogram Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="subprogram_name"
                  name="subprogram_name"
                  value={formData.subprogram_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter subprogram name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-[#f0f7ff] text-gray-900 transition-all font-medium placeholder:text-gray-400"
                />
              </div>

              <div>
                <label htmlFor="program_id" className="block text-sm font-semibold mb-2 text-gray-700">
                  Program <span className="text-red-500">*</span>
                </label>
                <select
                  id="program_id"
                  name="program_id"
                  value={formData.program_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-[#f0f7ff] text-gray-900 transition-all font-medium"
                >
                  <option value="">Select Program</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-semibold mb-2 text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Enter subprogram description"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-[#f0f7ff] text-gray-900 transition-all font-medium resize-none placeholder:text-gray-400"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-semibold mb-2 text-gray-700">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-[#f0f7ff] text-gray-900 transition-all font-medium"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 border border-gray-200 rounded-xl font-semibold transition-all hover:bg-gray-50 text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-8 py-2.5 bg-[#2563eb] text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-500/10 active:scale-95 disabled:opacity-50"
                >
                  {isCreating || isUpdating ? "Processing..." : editingSubprogram ? "Save Changes" : "Add Subprogram"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirmation Modal */}
      {confirmationModal.isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !confirmationModal.isLoading && setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
          />
          <div className={`relative w-full max-w-md p-6 rounded-xl shadow-2xl border-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
            }`}>
            <h3 className="text-xl font-bold mb-3">{confirmationModal.title}</h3>
            <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {confirmationModal.message}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
                disabled={confirmationModal.isLoading}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${isDark
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50`}
              >
                Cancel
              </button>
              <button
                onClick={confirmationModal.onConfirm}
                disabled={confirmationModal.isLoading}
                className={`px-6 py-2 ${confirmationModal.confirmButtonColor === 'red' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-md`}
              >
                {confirmationModal.isLoading && (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes bounceSubtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-pop-in {
          animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-bounce-subtle {
          animation: bounceSubtle 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
