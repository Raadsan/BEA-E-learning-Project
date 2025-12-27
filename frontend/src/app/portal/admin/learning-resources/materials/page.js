"use client";

import { useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";
import {
  useGetMaterialsQuery,
  useCreateMaterialMutation,
  useUpdateMaterialMutation,
  useDeleteMaterialMutation
} from "@/redux/api/materialApi";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useGetSubprogramsQuery } from "@/redux/api/subprogramApi";
import { useToast } from "@/components/Toast";
import Loader from "@/components/Loader";

export default function CourseMaterialsPage() {
  const { showToast } = useToast();
  const { data: materials, isLoading: materialsLoading } = useGetMaterialsQuery();
  const { data: programs } = useGetProgramsQuery();
  const { data: subprograms } = useGetSubprogramsQuery();

  const [createMaterial] = useCreateMaterialMutation();
  const [updateMaterial] = useUpdateMaterialMutation();
  const [deleteMaterial] = useDeleteMaterialMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    program_id: "",
    subprogram_id: "",
    subject: "",
    level: "", // Kept for legacy if needed, but primary is program/subprogram
    description: "",
    url: "",
    status: "Active",
  });

  // Filter subprograms based on selected program
  const filteredSubprograms = subprograms?.filter(sp =>
    !formData.program_id || String(sp.program_id) === String(formData.program_id)
  ) || [];

  const handleAddMaterial = () => {
    setEditingMaterial(null);
    setFormData({
      title: "",
      type: "",
      program_id: "",
      subprogram_id: "",
      subject: "",
      level: "",
      description: "",
      url: "",
      status: "Active",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setFormData({
      title: material.title,
      type: material.type,
      program_id: material.program_id || "",
      subprogram_id: material.subprogram_id || "",
      subject: material.subject || "",
      level: material.level || "",
      description: material.description || "",
      url: material.url,
      status: material.status,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMaterial(null);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newState = { ...prev, [name]: value };
      // Reset subprogram if program changes
      if (name === 'program_id') {
        newState.subprogram_id = "";
      }
      return newState;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMaterial) {
        await updateMaterial({ id: editingMaterial.id, ...formData }).unwrap();
        showToast("Material updated successfully!", "success");
      } else {
        await createMaterial(formData).unwrap();
        showToast("Material created successfully!", "success");
      }
      handleCloseModal();
    } catch (err) {
      showToast(err.data?.error || "Failed to save material", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this material?")) {
      try {
        await deleteMaterial(id).unwrap();
        showToast("Material deleted successfully!", "success");
      } catch (err) {
        showToast("Failed to delete material", "error");
      }
    }
  };

  const columns = [
    {
      key: "title",
      label: "Title",
    },
    {
      key: "type",
      label: "Type",
      render: (row) => (
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${row.type === 'Drive' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
          }`}>
          {row.type}
        </span>
      ),
    },
    {
      key: "program",
      label: "Program",
      render: (row) => (
        <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-blue-50 text-blue-600">
          {row.program_name || "N/A"}
        </span>
      ),
    },
    {
      key: "subprogram",
      label: "Subprogram",
      render: (row) => (
        <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-purple-50 text-purple-600">
          {row.subprogram_name || "N/A"}
        </span>
      ),
    },
    {
      key: "subject",
      label: "Subject",
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${row.status === "Active"
          ? "bg-green-50 text-green-600"
          : "bg-gray-50 text-gray-500"
          }`}>
          {row.status}
        </span>
      ),
    },
    {
      key: "url",
      label: "Link",
      render: (row) => (
        <a
          href={row.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          {row.type === 'Drive' ? 'Open Drive' : 'Open Link'}
        </a>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-3">
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-500 hover:text-blue-700 transition-all p-1.5 rounded-lg hover:bg-blue-50"
            title="Edit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="text-red-500 hover:text-red-700 transition-all p-1.5 rounded-lg hover:bg-red-50"
            title="Delete"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminHeader />

      <main className="flex-1 overflow-y-auto mt-10 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <DataTable
            title="Course Materials"
            columns={columns}
            data={materials || []}
            onAddClick={handleAddMaterial}
            showAddButton={true}
            isLoading={materialsLoading}
          />
        </div>
      </main>

      {/* Add/Edit Material Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
        >
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={handleBackdropClick}
          />

          {/* Modal content */}
          <div
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gray-50 border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                {editingMaterial ? "Edit Material" : "Add New Material"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Type</option>
                    <option value="Drive">Google Drive Link</option>
                    <option value="PDF">PDF Document</option>
                    <option value="Document">Word Document</option>
                    <option value="Presentation">PowerPoint</option>
                    <option value="Audio">Audio File</option>
                    <option value="Video">Video Link</option>
                    <option value="Link">Other External Link</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="program_id" className="block text-sm font-medium text-gray-700">
                    Program
                  </label>
                  <select
                    id="program_id"
                    name="program_id"
                    value={formData.program_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">General (No Program)</option>
                    {programs?.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="subprogram_id" className="block text-sm font-medium text-gray-700">
                    Subprogram (Level)
                  </label>
                  <select
                    id="subprogram_id"
                    name="subprogram_id"
                    value={formData.subprogram_id}
                    onChange={handleInputChange}
                    disabled={!formData.program_id}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">All Subprograms</option>
                    {filteredSubprograms.map(sp => (
                      <option key={sp.id} value={sp.id}>{sp.subprogram_name || sp.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                    Subject/Topic
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                  Resource Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  id="url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  required
                  placeholder="https://..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#010080] text-white rounded-lg hover:bg-[#0200a0] transition-colors"
                >
                  {editingMaterial ? "Update Material" : "Save Material"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
