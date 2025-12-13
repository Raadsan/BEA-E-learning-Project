"use client";

import { useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";

export default function ResourcesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    url: "",
    status: "Active",
  });

  const [resources, setResources] = useState([
    {
      id: 1,
      name: "Introduction to English Grammar",
      type: "Document",
      description: "Comprehensive guide to English grammar basics",
      url: "https://example.com/resources/grammar.pdf",
      status: "Active"
    },
    {
      id: 2,
      name: "IELTS Preparation Video Series",
      type: "Video",
      description: "Complete video series for IELTS preparation",
      url: "https://example.com/resources/ielts-videos",
      status: "Active"
    },
    {
      id: 3,
      name: "TOEFL Practice Tests",
      type: "Document",
      description: "Sample TOEFL practice test papers",
      url: "https://example.com/resources/toefl-tests.pdf",
      status: "Active"
    },
    {
      id: 4,
      name: "Academic Writing Guide",
      type: "Document",
      description: "Guide to academic writing styles and formats",
      url: "https://example.com/resources/academic-writing.pdf",
      status: "Inactive"
    },
    {
      id: 5,
      name: "English Pronunciation Audio",
      type: "Audio",
      description: "Audio files for pronunciation practice",
      url: "https://example.com/resources/pronunciation-audio",
      status: "Active"
    },
  ]);

  const handleAddResource = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      name: "",
      type: "",
      description: "",
      url: "",
      status: "Active",
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

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newResource = {
      id: resources.length > 0 ? Math.max(...resources.map((r) => r.id)) + 1 : 1,
      name: formData.name,
      type: formData.type,
      description: formData.description,
      url: formData.url,
      status: formData.status,
    };
    setResources([...resources, newResource]);
    handleCloseModal();
    
    return false;
  };

  const handleEdit = (resource) => {
    console.log("Edit resource:", resource);
  };

  const columns = [
    {
      key: "name",
      label: "Resource Name",
    },
    {
      key: "type",
      label: "Type",
      render: (row) => (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
          {row.type}
        </span>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (row) => (
        <span className="text-gray-600 max-w-xs truncate block" title={row.description}>
          {row.description}
        </span>
      ),
    },
    {
      key: "url",
      label: "Resource URL",
      render: (row) =>
        row.url ? (
          <a
            href={row.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors truncate max-w-xs block"
          >
            View Resource
          </a>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          row.status === "Active" 
            ? "bg-green-100 text-green-800" 
            : "bg-gray-100 text-gray-800"
        }`}>
          {row.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <button
          onClick={() => handleEdit(row)}
          className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
          title="Edit"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      ),
    },
  ];

  return (
    <>
      <AdminHeader />
      
      <main className="flex-1 overflow-y-auto bg-gray-50 transition-colors">
        <div className="w-full px-8 py-6">
          <DataTable
            title="Resources Management"
            columns={columns}
            data={resources}
            onAddClick={handleAddResource}
            showAddButton={true}
          />
        </div>
      </main>

      {/* Add Resource Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ pointerEvents: 'none' }}
        >
          {/* Light backdrop overlay */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-20"
            onClick={handleBackdropClick}
            style={{ pointerEvents: 'auto' }}
          />
          
          {/* Modal content */}
          <div 
            className="relative bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4"
            onClick={(e) => e.stopPropagation()}
            style={{ pointerEvents: 'auto' }}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Add New Resource</h2>
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
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Resource Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter resource name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Type</option>
                    <option value="Document">Document</option>
                    <option value="Video">Video</option>
                    <option value="Audio">Audio</option>
                    <option value="Image">Image</option>
                    <option value="Link">Link</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                  Resource URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  id="url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  required
                  placeholder="https://example.com/resources/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Enter resource description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

