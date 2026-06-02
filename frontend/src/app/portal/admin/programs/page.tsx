"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";

import DataTable from "@/components/DataTable";
import { useGetProgramsQuery, useCreateProgramMutation, useUpdateProgramMutation, useDeleteProgramMutation } from "@/lib/api/programApi";
import { studentApi } from "@/lib/api/studentApi";
import { useDarkMode } from "@/context/ThemeContext";
import { useToast } from "@/components/Toast";
import { API_BASE_URL } from "@/constants";

// Extracted Components
import ProgramForm from "@/components/admin/programs/ProgramForm";
import ViewProgramModal from "@/components/admin/programs/ViewProgramModal";
import ProgramConfirmationModal from "@/components/admin/programs/ProgramConfirmationModal";

export default function ProgramsPage() {
  const { isDark } = useDarkMode();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [editingProgram, setEditingProgram] = useState(null);
  
  // Selection and Filter States
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedPrograms, setSelectedPrograms] = useState([]);
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

  const [formData, setFormData] = useState({
    title: "", description: "", status: "active", image: null, video: null, curriculum: null, curriculum_file: null, price: "", discount: "", test_required: "none"
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  const { data: backendPrograms, isLoading, isError, error } = useGetProgramsQuery();
  const [createProgram, { isLoading: isCreating }] = useCreateProgramMutation();
  const [updateProgram, { isLoading: isUpdating }] = useUpdateProgramMutation();
  const [deleteProgram, { isLoading: isDeleting }] = useDeleteProgramMutation();

  const programs = backendPrograms?.map((program) => ({
    ...program,
    image: program.image ? `${API_BASE_URL}${program.image}` : null,
    video: program.video ? `${API_BASE_URL}${program.video}` : null,
    curriculum_file: program.curriculum_file ? `${API_BASE_URL}${program.curriculum_file}` : null,
  })) || [];

  // Filter & Sort Logic
  const filteredPrograms = programs.filter(program => {
    const matchesStatus = selectedStatus ? program.status === selectedStatus : true;
    return matchesStatus;
  });

  const sortedPrograms = [...filteredPrograms].sort((a, b) => {
    if (sortBy === "name-asc") {
      return (a.title || "").localeCompare(b.title || "");
    }
    if (sortBy === "name-desc") {
      return (b.title || "").localeCompare(a.title || "");
    }
    if (sortBy === "newest") {
      return new Date(b.created_at || b.createdAt || 0).getTime() - new Date(a.created_at || a.createdAt || 0).getTime();
    }
    if (sortBy === "oldest") {
      return new Date(a.created_at || a.createdAt || 0).getTime() - new Date(b.created_at || b.createdAt || 0).getTime();
    }
    return 0;
  });

  const handleAddProgram = () => {
    setEditingProgram(null);
    setFormData({ title: "", description: "", status: "active", image: null, video: null, curriculum: null, curriculum_file: null, price: "", discount: "", test_required: "none" });
    setImagePreview(null); setVideoPreview(null);
    setIsModalOpen(true);
  };

  const handleEdit = (program) => {
    setEditingProgram(program);
    setFormData({
      title: program.title || "", description: program.description || "",
      status: program.status || "active", image: null, video: null, curriculum: null,
      curriculum_file: program.curriculum_file || null,
      price: program.price || "", discount: program.discount || "", test_required: program.test_required || "none"
    });
    setImagePreview(program.image || null); setVideoPreview(program.video || null);
    setIsModalOpen(true);
  };

  // handleStatusToggle
  const handleStatusToggle = (program) => {
    const newStatus = program.status === 'active' ? 'inactive' : 'active';
    setConfirmationModal({
      isOpen: true, title: "Confirm Status Change",
      message: `Do you want to change status of ${program.title} to ${newStatus}?`,
      onConfirm: async () => {
        setConfirmationModal(prev => ({ ...prev, isLoading: true }));
        try {
          const submitFormData = new FormData();
          submitFormData.append("status", newStatus);
          await updateProgram({ id: program.id, formData: submitFormData }).unwrap();
          showToast(`Program status updated to ${newStatus}`, "success");
          setConfirmationModal({ isOpen: false, title: "", message: "", onConfirm: null, isLoading: false, confirmButtonColor: "blue" });
        } catch (error) {
          setConfirmationModal(prev => ({ ...prev, isLoading: false }));
          console.error("Failed to update status:", error);
          showToast("Failed to update program status", "error");
        }
      },
      isLoading: false, confirmButtonColor: "blue"
    });
  };

  // handleDelete
  const handleDelete = (id) => {
    setConfirmationModal({
      isOpen: true, title: "Delete Program", message: "Are you sure? This action cannot be undone.",
      onConfirm: async () => {
        setConfirmationModal(prev => ({ ...prev, isLoading: true }));
        try {
          await deleteProgram(id).unwrap();
          showToast("Program deleted successfully", "success");
          setConfirmationModal({ isOpen: false, title: "", message: "", onConfirm: null, isLoading: false, confirmButtonColor: "red" });
        } catch (error) {
          setConfirmationModal(prev => ({ ...prev, isLoading: false }));
          console.error("Failed to delete program:", error);
          showToast("Failed to delete program", "error");
        }
      },
      isLoading: false, confirmButtonColor: "red"
    });
  };

  // Bulk Actions Handlers
  const handleBulkStatusChange = async (newStatus) => {
    try {
      await Promise.all(selectedPrograms.map(async (id) => {
        const submitFormData = new FormData();
        submitFormData.append("status", newStatus);
        await updateProgram({ id, formData: submitFormData }).unwrap();
      }));
      showToast(`Status of ${selectedPrograms.length} programs updated to ${newStatus}`, "success");
      setSelectedPrograms([]);
      setIsBulkActionsModalOpen(false);
    } catch (error) {
      console.error(error);
      showToast("Failed to bulk update status", "error");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedPrograms.map(async (id) => {
        await deleteProgram(id).unwrap();
      }));
      showToast(`${selectedPrograms.length} programs deleted successfully`, "success");
      setSelectedPrograms([]);
      setIsBulkActionsModalOpen(false);
    } catch (error) {
      console.error(error);
      showToast("Failed to bulk delete programs", "error");
    }
  };

  const handleView = (program) => { setSelectedProgram(program); setIsViewModalOpen(true); };
  const handleCloseViewModal = () => { setIsViewModalOpen(false); setSelectedProgram(null); };

  const handleCloseModal = () => {
    setIsModalOpen(false); setEditingProgram(null);
    setFormData({ title: "", description: "", status: "active", image: null, video: null, curriculum: null, curriculum_file: null, price: "", discount: "", test_required: "none" });
    setImagePreview(null); setVideoPreview(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
      const reader = new FileReader();
      reader.onloadend = () => {
        if (name === "image") setImagePreview(reader.result);
        else if (name === "video") setVideoPreview(reader.result);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  // handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitFormData = new FormData();
      submitFormData.append("title", formData.title);
      submitFormData.append("description", formData.description);
      if (!editingProgram || formData.status !== editingProgram.status) submitFormData.append("status", formData.status);
      if (formData.image) submitFormData.append("image", formData.image);
      if (formData.video) submitFormData.append("video", formData.video);
      if (formData.curriculum) submitFormData.append("curriculum", formData.curriculum);
      submitFormData.append("price", String(formData.price || 0));
      submitFormData.append("discount", String(formData.discount || 0));
      submitFormData.append("test_required", formData.test_required || "none");

      if (editingProgram) {
        await updateProgram({ id: editingProgram.id, formData: submitFormData }).unwrap();
        dispatch(studentApi.util.invalidateTags(["Students"]));
        showToast("Program updated successfully", "success");
      } else {
        await createProgram(submitFormData).unwrap();
        showToast("Program created successfully", "success");
      }
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save program:", error);
      showToast("Failed to save program", "error");
    }
  };

  const columns = [
    { key: "title", label: "Title" },
    // {
    //   key: "media", label: "Media (Image/Video)",
    //   render: (_, row) => (
    //     <div className="flex gap-2 items-center">
    //       {row.image ? (
    //         <div className="relative w-12 h-8 rounded overflow-hidden shadow-xs border border-gray-200/60 bg-gray-50 flex-shrink-0">
    //           <img src={row.image} alt={row.title} className="object-cover w-full h-full" />
    //         </div>
    //       ) : (
    //         <div className="w-12 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200/60 flex-shrink-0">
    //           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    //           </svg>
    //         </div>
    //       )}
    //       {row.video ? (
    //         <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center shadow-xs" title="Promo Video Available">
    //           <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
    //             <path d="M8 5v14l11-7z" />
    //           </svg>
    //         </div>
    //       ) : (
    //         <span className="text-[10px] text-gray-400">No Video</span>
    //       )}
    //     </div>
    //   )
    // },
    { key: "description", label: "Description", className: "text-left pl-4", render: (val) => <span className="truncate block max-w-xs">{val || "No description"}</span> },
    { key: "price", label: "Price", render: (_, row) => <div><span>${(parseFloat(row.price || 0) - parseFloat(row.discount || 0)).toFixed(2)}</span>{parseFloat(row.discount || 0) > 0 && <span className="block text-[10px] text-gray-400 line-through">${parseFloat(row.price || 0).toFixed(2)}</span>}</div> },
    { key: "status", label: "Status", render: (val, row) => <button onClick={() => handleStatusToggle(row)} className={`px-4 py-1.5 text-xs font-bold rounded-full ${val === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{val?.charAt(0).toUpperCase() + val?.slice(1)}</button> },
    {
      key: "actions", label: "Actions",
      render: (_, row) => (
        <div className="flex gap-2">
          <button onClick={() => handleView(row)} className="text-blue-600 p-1 hover:bg-blue-50 rounded" title="View"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
          <button onClick={() => handleEdit(row)} className="text-blue-600 p-1 hover:bg-blue-50 rounded" title="Edit"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
          <button onClick={() => handleDelete(row.id)} className="text-red-600 p-1 hover:bg-red-50 rounded" title="Delete" disabled={isDeleting}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
        </div>
      ),
    },
  ];

  if (isLoading) return <main className="flex-1 bg-gray-50 text-center py-12">Loading programs...</main>;
  if (isError) return <main className="flex-1 bg-gray-50 text-center py-12 text-red-600">Error: {(error as any)?.data?.message || "Unknown error"}</main>;

  return (
    <>
      <main className="flex-1 bg-gray-50">
        <div className="w-full px-8 py-6">
          <DataTable
            title="Program Management"
            columns={columns}
            data={sortedPrograms}
            onAddClick={handleAddProgram}
            showAddButton={false}
            customActions={
              <>
                {/* Show All Button */}
                <button
                  onClick={() => {
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
                  disabled={selectedPrograms.length === 0}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors h-[38px] text-xs font-semibold ${selectedPrograms.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#010080] hover:bg-[#010080]/90 text-white'
                    }`}
                  title={selectedPrograms.length === 0 ? "Select programs to perform actions" : "Perform bulk actions"}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Actions
                </button>
                <button
                  onClick={handleAddProgram}
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
                {selectedPrograms.length > 0 && (
                  <div className="px-3 py-1 bg-[#010080] text-white rounded-lg shadow-sm flex items-center gap-2 h-[32px]">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-bold text-[11px]">{selectedPrograms.length} selected</span>
                    <button
                      onClick={() => setSelectedPrograms([])}
                      className="ml-1 text-white hover:text-gray-200 transition-colors"
                      title="Clear selection"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

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
            selectedItems={selectedPrograms}
            onSelectionChange={setSelectedPrograms}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={setRowsPerPage}
          />
        </div>
      </main>

      <ProgramForm isOpen={isModalOpen} onClose={handleCloseModal} editingProgram={editingProgram} formData={formData} handleInputChange={handleInputChange} handleFileChange={handleFileChange} handleSubmit={handleSubmit} isDark={isDark} isCreating={isCreating} isUpdating={isUpdating} imagePreview={imagePreview} videoPreview={videoPreview} />
      
      {isViewModalOpen && selectedProgram && (
        <ViewProgramModal program={selectedProgram} onClose={handleCloseViewModal} isDark={isDark} />
      )}
      
      <ProgramConfirmationModal isOpen={confirmationModal.isOpen} onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))} title={confirmationModal.title} message={confirmationModal.message} onConfirm={confirmationModal.onConfirm} isLoading={confirmationModal.isLoading} confirmButtonColor={confirmationModal.confirmButtonColor} isDark={isDark} />

      {/* Bulk Actions Modal */}
      {isBulkActionsModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsBulkActionsModalOpen(false)}
          />
          <div className={`relative rounded-xl shadow-2xl w-full max-w-md p-6 border-2 transform transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-800'}`}>
            <h3 className="text-lg font-bold mb-4">Bulk Actions ({selectedPrograms.length} selected)</h3>
            <p className="text-sm mb-6 text-gray-500 dark:text-gray-400">Choose an action to perform on all selected programs.</p>
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
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete all selected programs? This action cannot be undone.")) {
                    handleBulkDelete();
                  }
                }}
                className="w-full py-2.5 px-4 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-sm transition-colors border border-red-200"
              >
                Delete Selected Programs
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
    </>
  );
}
