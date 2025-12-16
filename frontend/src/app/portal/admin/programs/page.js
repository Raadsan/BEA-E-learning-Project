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
  const [isSubprogramsModalOpen, setIsSubprogramsModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [editingProgram, setEditingProgram] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "active",
    image: null,
    video: null,
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
  })) || [];

  const handleAddProgram = () => {
    setEditingProgram(null);
    setFormData({
      title: "",
      description: "",
      status: "active",
      image: null,
      video: null,
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
    });
    setImagePreview(program.image || null);
    setVideoPreview(program.video || null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this program?")) {
      try {
        await deleteProgram(id).unwrap();
      } catch (error) {
        console.error("Failed to delete program:", error);
        alert("Failed to delete program. Please try again.");
      }
    }
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
      submitFormData.append("status", formData.status);

      if (formData.image) {
        submitFormData.append("image", formData.image);
      }
      if (formData.video) {
        submitFormData.append("video", formData.video);
      }

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
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${row.status === "active"
          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
          }`}>
          {row.status === "active" ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewSubprograms(row)}
            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
            title="View Subprograms"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
        <main className="flex-1 overflow-y-auto bg-gray-50 mt-6">
          <div className="w-full px-6 py-6">
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
        <main className="flex-1 overflow-y-auto bg-gray-50 mt-6">
          <div className="w-full px-6 py-6">
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

      <main className="flex-1 overflow-y-auto bg-gray-50 mt-6">
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
          className="fixed inset-0 z-[100] flex items-center justify-center"
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
            <div className={`sticky top-0 border-b px-6 py-4 flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'
                }`}>
                {editingProgram ? "Edit Program" : "Add New Program"}
              </h2>
              <button
                onClick={handleCloseModal}
                className={`transition-colors ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="title" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
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
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'border-gray-300'
                    }`}
                />
              </div>

              <div>
                <label htmlFor="description" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
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
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'border-gray-300'
                    }`}
                />
              </div>

              <div>
                <label htmlFor="image" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  Image
                </label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'border-gray-300'
                    }`}
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
                <label htmlFor="video" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  Video
                </label>
                <input
                  type="file"
                  id="video"
                  name="video"
                  accept="video/*"
                  onChange={handleFileChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'border-gray-300'
                    }`}
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

              <div>
                <label htmlFor="status" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'border-gray-300'
                    }`}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={`px-4 py-2 border rounded-lg transition-colors ${isDark
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating || isUpdating ? "Saving..." : editingProgram ? "Update Program" : "Add Program"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Subprograms Modal */}
      {isSubprogramsModalOpen && selectedProgram && (
        <SubprogramsModal
          program={selectedProgram}
          onClose={handleCloseSubprogramsModal}
          isDark={isDark}
        />
      )}
    </>
  );
}

// Subprograms Modal Component
function SubprogramsModal({ program, onClose, isDark }) {
  const { data: subprograms, isLoading, isError } = useGetSubprogramsByProgramIdQuery(program.id);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
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
            Subprograms for {program.title}
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

        <div className="p-4 bg-gray-50">
          {isLoading ? (
            <div className="text-center py-8">
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading subprograms...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400">Error loading subprograms</p>
            </div>
          ) : !subprograms || subprograms.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No subprograms found for this program.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subprograms.map((subprogram) => (
                <div
                  key={subprogram.id}
                  className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}
                >
                  <h3 className={`font-semibold text-lg mb-2 ${isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                    {subprogram.subprogram_name}
                  </h3>
                  <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                    {subprogram.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${subprogram.status === 'active'
                      ? isDark
                        ? 'bg-green-900/30 text-green-300 border border-green-700'
                        : 'bg-green-100 text-green-800'
                      : isDark
                        ? 'bg-gray-700 text-gray-400 border border-gray-600'
                        : 'bg-gray-200 text-gray-600'
                      }`}>
                      {subprogram.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
