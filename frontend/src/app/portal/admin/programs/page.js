"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";
import { useGetProgramsQuery, useCreateProgramMutation, useUpdateProgramMutation, useDeleteProgramMutation } from "@/redux/api/programApi";
import { useGetSubprogramsByProgramIdQuery } from "@/redux/api/subprogramApi";
import { studentApi } from "@/redux/api/studentApi";
import { useDarkMode } from "@/context/ThemeContext";
import Image from "next/image";

export default function ProgramsPage() {
  const { isDark } = useDarkMode();
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [editingProgram, setEditingProgram] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    isLoading: false,
    confirmButtonColor: "blue"
  });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "active",
    image: null,
    video: null,
    price: "",
    discount: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  // Fetch programs from backend
  const { data: backendPrograms, isLoading, isError, error } = useGetProgramsQuery();
  const [createProgram, { isLoading: isCreating }] = useCreateProgramMutation();
  const [updateProgram, { isLoading: isUpdating }] = useUpdateProgramMutation();
  const [deleteProgram, { isLoading: isDeleting }] = useDeleteProgramMutation();

  // Map backend programs to display format
  const programs = backendPrograms?.map((program) => ({
    id: program.id,
    title: program.title,
    description: program.description || "",
    image: program.image ? `http://localhost:5000${program.image}` : null,
    video: program.video ? `http://localhost:5000${program.video}` : null,
    status: program.status || "active",
    price: program.price || 0,
    discount: program.discount || 0,
  })) || [];

  const handleAddProgram = () => {
    setEditingProgram(null);
    setFormData({
      title: "",
      description: "",
      status: "active",
      image: null,
      video: null,
      price: "",
      discount: "",
    });
    setImagePreview(null);
    setVideoPreview(null);
    setIsModalOpen(true);
  };

  const handleEdit = (program) => {
    setEditingProgram(program);
    setFormData({
      title: program.title || "",
      description: program.description || "",
      status: program.status || "active",
      image: null,
      video: null,
      price: program.price || "",
      discount: program.discount || "",
    });
    setImagePreview(program.image || null);
    setVideoPreview(program.video || null);
    setIsModalOpen(true);
  };

  const handleStatusToggle = (program) => {
    const newStatus = program.status === 'active' ? 'inactive' : 'active';
    const confirmMessage = `Do you want to change status of ${program.title} to ${newStatus}?`;

    setConfirmationModal({
      isOpen: true,
      title: "Confirm Status Change",
      message: confirmMessage,
      onConfirm: async () => {
        setConfirmationModal(prev => ({ ...prev, isLoading: true }));
        try {
          const submitFormData = new FormData();
          submitFormData.append("status", newStatus);
          await updateProgram({ id: program.id, formData: submitFormData }).unwrap();
          setConfirmationModal({ isOpen: false, title: "", message: "", onConfirm: null, isLoading: false, confirmButtonColor: "blue" });
        } catch (error) {
          console.error("Failed to update status:", error);
          setConfirmationModal(prev => ({ ...prev, isLoading: false }));
          alert(error?.data?.error || "Failed to update status.");
        }
      },
      isLoading: false,
      confirmButtonColor: "blue"
    });
  };

  const handleDelete = (id) => {
    setConfirmationModal({
      isOpen: true,
      title: "Delete Program",
      message: "Are you sure you want to delete this program? This action cannot be undone.",
      onConfirm: async () => {
        setConfirmationModal(prev => ({ ...prev, isLoading: true }));
        try {
          await deleteProgram(id).unwrap();
          setConfirmationModal({ isOpen: false, title: "", message: "", onConfirm: null, isLoading: false, confirmButtonColor: "red" });
        } catch (error) {
          console.error("Failed to delete program:", error);
          setConfirmationModal(prev => ({ ...prev, isLoading: false }));
          alert("Failed to delete program. Please try again.");
        }
      },
      isLoading: false,
      confirmButtonColor: "red"
    });
  };

  const handleView = (program) => {
    setSelectedProgram(program);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedProgram(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProgram(null);
    setFormData({
      title: "",
      description: "",
      status: "active",
      image: null,
      video: null,
      price: "",
      discount: "",
    });
    setImagePreview(null);
    setVideoPreview(null);
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

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));

      // Create preview
      const file = files[0];
      if (name === "image") {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else if (name === "video") {
        const reader = new FileReader();
        reader.onloadend = () => {
          setVideoPreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const submitFormData = new FormData();
      submitFormData.append("title", formData.title);
      submitFormData.append("description", formData.description);
      // Only append status if it's a new program or if it's explicitly changed in the form
      if (!editingProgram || formData.status !== editingProgram.status) {
        submitFormData.append("status", formData.status);
      }

      if (formData.image) {
        submitFormData.append("image", formData.image);
      }
      if (formData.video) {
        submitFormData.append("video", formData.video);
      }
      submitFormData.append("price", formData.price || 0);
      submitFormData.append("discount", formData.discount || 0);

      if (editingProgram) {
        await updateProgram({ id: editingProgram.id, formData: submitFormData }).unwrap();
        // Invalidate Students cache so the student table updates immediately without refresh
        dispatch(studentApi.util.invalidateTags(["Students"]));
      } else {
        await createProgram(submitFormData).unwrap();
      }

      handleCloseModal();
    } catch (error) {
      console.error("Failed to save program:", error);
      alert("Failed to save program. Please try again.");
    }

    return false;
  };

  const columns = [
    {
      key: "title",
      label: "Title",
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
      key: "price",
      label: "Price",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-gray-700 dark:text-gray-300 max-w-xs ">
            ${(parseFloat(row.price || 0) - parseFloat(row.discount || 0)).toFixed(2)}
          </span>
          {parseFloat(row.discount || 0) > 0 && (
            <span className="text-[10px] text-gray-400 line-through">
              ${parseFloat(row.price || 0).toFixed(2)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <button
          onClick={() => handleStatusToggle(row)}
          className={`px-4 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full transition-all active:scale-95 ${row.status === 'active'
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
            }`}
          title="Click to toggle status"
        >
          {row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : 'Active'}
        </button>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleView(row)}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
            title="View Details"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
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
            onClick={() => handleDelete(row.id)}
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
        <main className="flex-1 overflow-y-auto bg-gray-50 pt-20">
          <div className="w-full px-8 py-6">
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Loading programs...</p>
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
        <main className="flex-1 overflow-y-auto bg-gray-50 pt-20">
          <div className="w-full px-8 py-6">
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400">Error loading programs: {error?.data?.message || "Unknown error"}</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AdminHeader />

      <main className="flex-1 overflow-y-auto bg-gray-50 pt-20">
        <div className="w-full px-8 py-6">
          <DataTable
            title="Program Management"
            columns={columns}
            data={programs}
            onAddClick={handleAddProgram}
            showAddButton={true}
          />
        </div>
      </main>

      {/* Add/Edit Program Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm"
          style={{ pointerEvents: 'none' }}
        >
          {/* Backdrop overlay */}
          <div
            className="absolute inset-0 bg-transparent"
            onClick={handleBackdropClick}
            style={{ pointerEvents: 'auto' }}
          />

          {/* Modal content */}
          <div
            className={`relative rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4 border-2 ${isDark ? 'bg-gray-800/95 border-gray-600' : 'bg-white/95 border-gray-300'
              }`}
            style={{ backdropFilter: 'blur(2px)', pointerEvents: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#010080]">
                {editingProgram ? "Update Program Details" : "Add New Program"}
              </h2>
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
                <label htmlFor="title" className="block text-sm font-semibold mb-2 text-gray-700">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter program title"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-[#f0f7ff] text-gray-900 transition-all font-medium placeholder:text-gray-400"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-semibold mb-2 text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Enter program description"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-[#f0f7ff] text-gray-900 transition-all font-medium placeholder:text-gray-400 resize-none"
                />
              </div>

              <div>
                <label htmlFor="image" className="block text-sm font-semibold mb-2 text-gray-700">
                  Image
                </label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-[#f0f7ff] text-gray-900 transition-all font-medium"
                />
                {imagePreview && (
                  <div className="mt-2 w-32 h-32 relative">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="video" className="block text-sm font-semibold mb-2 text-gray-700">
                  Video
                </label>
                <input
                  type="file"
                  id="video"
                  name="video"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-[#f0f7ff] text-gray-900 transition-all font-medium"
                />
                {videoPreview && (
                  <div className="mt-2 w-full max-w-md">
                    <video
                      src={videoPreview}
                      controls
                      className="w-full rounded"
                      preload="metadata"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-semibold mb-2 text-gray-700">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-[#f0f7ff] text-gray-900 transition-all font-medium placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label htmlFor="discount" className="block text-sm font-semibold mb-2 text-gray-700">
                    Discount ($)
                  </label>
                  <input
                    type="number"
                    id="discount"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-[#f0f7ff] text-gray-900 transition-all font-medium placeholder:text-gray-400"
                  />
                </div>
              </div>

              {!editingProgram && (
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
              )}

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
                  {isCreating || isUpdating ? "Processing..." : editingProgram ? "Save Changes" : "Add Program"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Program Modal (including subprograms) */}
      {isViewModalOpen && selectedProgram && (
        <ViewProgramModal
          program={selectedProgram}
          onClose={handleCloseViewModal}
          isDark={isDark}
        />
      )}

      {/* Confirmation Modal */}
      {confirmationModal.isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center">
          <div
            className="absolute inset-0  backdrop-blur-sm"
            onClick={() => !confirmationModal.isLoading && setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
          />
          <div className={`relative w-full max-w-md p-6 rounded-lg shadow-xl ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
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
    </>
  );
}

// View Program Modal Component (Updated Design)
function ViewProgramModal({ program, onClose, isDark }) {
  const { data: subprograms, isLoading, isError } = useGetSubprogramsByProgramIdQuery(program.id);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm"
      style={{ pointerEvents: 'none' }}
    >
      <div
        className="absolute inset-0 bg-transparent"
        onClick={onClose}
        style={{ pointerEvents: 'auto' }}
      />

      <div
        className={`relative rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4 border-2 ${isDark ? 'bg-gray-800/95 border-gray-600' : 'bg-white/95 border-gray-300'
          }`}
        onClick={(e) => e.stopPropagation()}
        style={{ pointerEvents: 'auto', backdropFilter: 'blur(2px)' }}
      >
        <div className={`sticky top-0 border-b px-6 py-4 flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'
            }`}>
            Program Details: {program.title}
          </h2>
          <button
            onClick={onClose}
            className={`transition-colors ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Program Information */}
          <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-blue-50/50 border-blue-200'
            }`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'
              }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Basic Information
            </h3>
            <div className="space-y-4">
              <div className={`p-4 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>Title</label>
                <p className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {program.title}
                </p>
              </div>
              <div className={`p-4 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>Description</label>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {program.description}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                  <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${program.status === 'active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                    {program.status}
                  </span>
                </div>
                <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                  <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Pricing</label>
                  <p className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Price: ${parseFloat(program.price).toFixed(2)}
                    {parseFloat(program.discount) > 0 && (
                      <span className="ml-2 text-green-600 text-sm font-medium">
                        (Discount: -${parseFloat(program.discount).toFixed(2)})
                      </span>
                    )}
                    <span className="ml-2 text-blue-600">
                      Total: ${(parseFloat(program.price) - parseFloat(program.discount)).toFixed(2)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            {/* Visuals */}
            {(program.image || program.video) && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {program.image && (
                  <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                    <label className={`block text-xs font-semibold mb-2 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>Image</label>
                    <div className="relative h-48 w-full rounded overflow-hidden">
                      <Image src={program.image} alt={program.title} fill className="object-cover" />
                    </div>
                  </div>
                )}
                {program.video && (
                  <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                    <label className={`block text-xs font-semibold mb-2 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>Video</label>
                    <video src={program.video} controls className="w-full h-48 object-cover rounded" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Subprograms Section */}
          <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-purple-50/50 border-purple-200'
            }`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'
              }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Associated Subprograms
            </h3>
            {isLoading ? (
              <div className="text-center py-8">
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading subprograms...</p>
              </div>
            ) : isError ? (
              <div className="text-center py-8">
                <p className="text-red-600 dark:text-red-400">Error loading subprograms</p>
              </div>
            ) : !subprograms || subprograms.length === 0 ? (
              <div className={`p-6 text-center rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No subprograms found for this program.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subprograms.map((subprogram) => (
                  <div
                    key={subprogram.id}
                    className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800/50 border-gray-600' : 'bg-white border-gray-200'
                      } hover:shadow-md transition-shadow`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {subprogram.subprogram_name}
                      </h4>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${subprogram.status === 'active'
                        ? isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'
                        : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                        }`}>
                        {subprogram.status}
                      </span>
                    </div>
                    <p className={`text-sm line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {subprogram.description || 'No description available'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

