"use client";

import { useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";
import { useGetSubprogramsQuery, useCreateSubprogramMutation, useUpdateSubprogramMutation, useDeleteSubprogramMutation } from "@/redux/api/subprogramApi";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useDarkMode } from "@/context/ThemeContext";

export default function SubprogramsPage() {
  const { isDark } = useDarkMode();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewSubprogramsModalOpen, setIsViewSubprogramsModalOpen] = useState(false);
  const [selectedProgramForView, setSelectedProgramForView] = useState(null);
  const [editingSubprogram, setEditingSubprogram] = useState(null);

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

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this subprogram?")) {
      try {
        await deleteSubprogram(id).unwrap();
      } catch (error) {
        console.error("Failed to delete subprogram:", error);
        alert("Failed to delete subprogram. Please try again.");
      }
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
      } else {
        await createSubprogram(submitData).unwrap();
      }

      handleCloseModal();
    } catch (error) {
      console.error("Failed to save subprogram:", error);
      alert(error?.data?.error || "Failed to save subprogram. Please try again.");
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
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          row.status === "active" 
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
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ pointerEvents: 'none' }}
        >
          <div 
            className="absolute inset-0 bg-transparent"
            onClick={handleBackdropClick}
            style={{ pointerEvents: 'auto' }}
          />
          
          <div 
            className={`relative rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4 border-2 ${
              isDark ? 'bg-gray-800/95 border-gray-600' : 'bg-white/95 border-gray-300'
            }`}
            style={{ backdropFilter: 'blur(2px)' }}
            onClick={(e) => e.stopPropagation()}
            style={{ pointerEvents: 'auto' }}
          >
            <div className={`sticky top-0 border-b px-6 py-4 flex items-center justify-between ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                {editingSubprogram ? "Edit Subprogram" : "Add New Subprogram"}
              </h2>
              <button
                onClick={handleCloseModal}
                className={`transition-colors ${
                  isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="subprogram_name" className={`block text-sm font-medium mb-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
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
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label htmlFor="program_id" className={`block text-sm font-medium mb-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Program <span className="text-red-500">*</span>
                </label>
                <select
                  id="program_id"
                  name="program_id"
                  value={formData.program_id}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                  }`}
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
                <label htmlFor="description" className={`block text-sm font-medium mb-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Enter subprogram description"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label htmlFor="status" className={`block text-sm font-medium mb-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
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
                  className={`px-4 py-2 border rounded-lg transition-colors ${
                    isDark
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
                  {isCreating || isUpdating ? "Saving..." : editingSubprogram ? "Update Subprogram" : "Add Subprogram"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

