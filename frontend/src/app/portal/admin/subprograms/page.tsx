"use client";

import { useState } from "react";

import DataTable from "@/components/DataTable";
import { useGetSubprogramsQuery, useCreateSubprogramMutation, useUpdateSubprogramMutation, useDeleteSubprogramMutation } from "@/lib/api/subprogramApi";
import { useGetProgramsQuery } from "@/lib/api/programApi";
import { useDarkMode } from "@/context/ThemeContext";
import { useToast } from "@/components/Toast";

// Extracted Components
import SubprogramForm from "@/components/admin/subprograms/SubprogramForm";
import SubprogramConfirmationModal from "@/components/admin/subprograms/SubprogramConfirmationModal";

export default function SubprogramsPage() {
  const { isDark } = useDarkMode();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubprogram, setEditingSubprogram] = useState(null);

  // Selection and Filter States
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedSubprograms, setSelectedSubprograms] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isBulkActionsModalOpen, setIsBulkActionsModalOpen] = useState(false);

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

  // Filter & Sort Logic
  const filteredSubprograms = subprograms.filter(sub => {
    const matchesProgram = selectedProgramId ? String(sub.program_id) === String(selectedProgramId) : true;
    const matchesStatus = selectedStatus ? sub.status === selectedStatus : true;
    return matchesProgram && matchesStatus;
  });

  const sortedSubprograms = [...filteredSubprograms].sort((a, b) => {
    if (sortBy === "name-asc") {
      return (a.subprogram_name || "").localeCompare(b.subprogram_name || "");
    }
    if (sortBy === "name-desc") {
      return (b.subprogram_name || "").localeCompare(a.subprogram_name || "");
    }
    if (sortBy === "newest") {
      return new Date(b.created_at || b.createdAt || 0).getTime() - new Date(a.created_at || a.createdAt || 0).getTime();
    }
    if (sortBy === "oldest") {
      return new Date(a.created_at || a.createdAt || 0).getTime() - new Date(b.created_at || b.createdAt || 0).getTime();
    }
    return 0;
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

  // Bulk Actions Handlers
  const handleBulkStatusChange = async (newStatus) => {
    try {
      await Promise.all(selectedSubprograms.map(async (id) => {
        await updateSubprogram({ id, status: newStatus }).unwrap();
      }));
      showToast(`Status of ${selectedSubprograms.length} subprograms updated to ${newStatus}`, "success");
      setSelectedSubprograms([]);
      setIsBulkActionsModalOpen(false);
    } catch (error) {
      console.error(error);
      showToast("Failed to bulk update status.", "error");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedSubprograms.map(async (id) => {
        await deleteSubprogram(id).unwrap();
      }));
      showToast(`${selectedSubprograms.length} subprograms deleted successfully`, "success");
      setSelectedSubprograms([]);
      setIsBulkActionsModalOpen(false);
    } catch (error) {
      console.error(error);
      showToast("Failed to bulk delete subprograms.", "error");
    }
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
    {
      key: "subprogram_name",
      label: "Subprogram Name",
      className: "whitespace-nowrap pr-8"
    },
    {
      key: "program_name",
      label: "Program",
      width: "250px",
      className: "text-left",
      render: (val) => (
        <span className="dark:text-gray-300 max-w-[230px] truncate block" title={val}>
          {val || <span className="text-gray-400">-</span>}
        </span>
      )
    },
    {
      key: "description",
      label: "Description",
      width: "300px",
      className: "text-left pl-4",
      render: (val) => (
        <span className="dark:text-gray-300 max-w-[280px] truncate block" title={val}>
          {val || <span className="text-gray-400">No description</span>}
        </span>
      ),
    },
    { key: "status", label: "Status", render: (val, row) => <button onClick={() => handleStatusToggle(row)} className={`px-4 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full transition-all active:scale-95 ${val === 'active' ? 'bg-green-100 text-green-700' : val === 'archived' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{val === "active" ? "Active" : val === "archived" ? "Archived" : "Inactive"}</button> },
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
  if (isError) return <main className="flex-1 bg-gray-50"><div className="w-full px-8 py-6 text-center py-12 text-red-600">Error: {(error as any)?.data?.error || "Unknown error"}</div></main>;

  return (
    <>
      <main className="flex-1 bg-gray-50">
        <div className="w-full px-8 py-6">
          <DataTable
            title="Subprogram Management"
            columns={columns}
            data={sortedSubprograms}
            onAddClick={handleAddSubprogram}
            showAddButton={false}
            customActions={
              <>
                {/* Show All Button */}
                <button
                  onClick={() => {
                    setSelectedProgramId("");
                    setSelectedStatus("");
                    setSortBy("newest");
                    setRowsPerPage(10000); // Clear limits to display all rows at once
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors border border-gray-250 cursor-pointer text-xs h-[38px] shadow-sm"
                  title="Clear all filters"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18v3" />
                  </svg>
                  Show All
                </button>
                <button
                  onClick={() => setIsBulkActionsModalOpen(true)}
                  disabled={selectedSubprograms.length === 0}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors h-[38px] text-xs font-semibold ${selectedSubprograms.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#010080] hover:bg-[#010080]/90 text-white'
                    }`}
                  title={selectedSubprograms.length === 0 ? "Select subprograms to perform actions" : "Perform bulk actions"}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Actions
                </button>
                <button
                  onClick={handleAddSubprogram}
                  className="bg-[#010080] hover:bg-[#010080]/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors h-[38px] text-xs font-semibold"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add
                </button>
              </>
            }
            customHeaderLeft={
              <div className="flex gap-2 flex-wrap items-center">
                {/* Selection Counter Box */}
                {selectedSubprograms.length > 0 && (
                  <div className="px-3 py-1 bg-[#010080] text-white rounded-lg shadow-sm flex items-center gap-2 h-[32px]">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-bold text-[11px]">{selectedSubprograms.length} selected</span>
                    <button
                      onClick={() => setSelectedSubprograms([])}
                      className="ml-1 text-white hover:text-gray-200 transition-colors"
                      title="Clear selection"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Program Filter */}
                <div className="relative group w-[130px]">
                  <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#010080] transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <select
                    value={selectedProgramId}
                    onChange={(e) => setSelectedProgramId(e.target.value)}
                    className="w-full pl-8 pr-7 py-1 bg-white border border-gray-200 rounded-lg text-gray-700 font-bold text-[11px] focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none appearance-none transition-all shadow-sm hover:border-gray-300 cursor-pointer h-[32px]"
                  >
                    <option value="">All Programs</option>
                    {programs.map(prog => (
                      <option key={prog.id} value={prog.id}>{prog.title}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Status Filter */}
                <div className="relative group w-[130px]">
                  <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#010080] transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full pl-8 pr-7 py-1 bg-white border border-gray-200 rounded-lg text-gray-700 font-bold text-[11px] focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none appearance-none transition-all shadow-sm hover:border-gray-300 cursor-pointer h-[32px]"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                  </select>
                  <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Sort Filter */}
                <div className="relative group w-[130px]">
                  <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#010080] transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full pl-8 pr-7 py-1 bg-white border border-gray-200 rounded-lg text-gray-700 font-bold text-[11px] focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none appearance-none transition-all shadow-sm hover:border-gray-300 cursor-pointer h-[32px]"
                  >
                    <option value="newest">Newest to Oldest</option>
                    <option value="oldest">Oldest to Newest</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                  </select>
                  <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            }
            selectable={true}
            selectedItems={selectedSubprograms}
            onSelectionChange={setSelectedSubprograms}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={setRowsPerPage}
          />
        </div>
      </main>

      <SubprogramForm isOpen={isModalOpen} onClose={handleCloseModal} editingSubprogram={editingSubprogram} formData={formData} handleInputChange={handleInputChange} handleSubmit={handleSubmit} isDark={isDark} programs={programs} isCreating={isCreating} isUpdating={isUpdating} />
      <SubprogramConfirmationModal isOpen={confirmationModal.isOpen} onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))} title={confirmationModal.title} message={confirmationModal.message} onConfirm={confirmationModal.onConfirm} isLoading={confirmationModal.isLoading} confirmButtonColor={confirmationModal.confirmButtonColor} isDark={isDark} />

      {/* Bulk Actions Modal */}
      {isBulkActionsModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsBulkActionsModalOpen(false)}
          />
          <div className={`relative rounded-xl shadow-2xl w-full max-w-md p-6 border-2 transform transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-800'}`}>
            <h3 className="text-lg font-bold mb-4">Bulk Actions ({selectedSubprograms.length} selected)</h3>
            <p className="text-sm mb-6 text-gray-500 dark:text-gray-400">Choose an action to perform on all selected subprograms.</p>
            <div className="space-y-3">
              <button
                onClick={() => handleBulkStatusChange("active")}
                className="w-full py-2.5 px-4 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 font-semibold text-sm transition-colors border border-green-200"
              >
                Set Status to Active
              </button>
              <button
                onClick={() => handleBulkStatusChange("inactive")}
                className="w-full py-2.5 px-4 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-sm transition-colors border border-gray-250"
              >
                Set Status to Inactive
              </button>
              <button
                onClick={() => handleBulkStatusChange("archived")}
                className="w-full py-2.5 px-4 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-sm transition-colors border border-amber-200"
              >
                Set Status to Archived
              </button>
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete all selected subprograms? This action cannot be undone.")) {
                    handleBulkDelete();
                  }
                }}
                className="w-full py-2.5 px-4 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-sm transition-colors border border-red-200"
              >
                Delete Selected Subprograms
              </button>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsBulkActionsModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </>
  );
}
