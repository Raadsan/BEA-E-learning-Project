"use client";

import { useState, useEffect } from "react";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";

export default function AnnouncementsPage() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    targetAudience: "All Students",
    publishDate: new Date().toISOString().split('T')[0],
    status: "Published"
  });

  // State for announcements
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  // Fetch announcements from API
  const fetchAnnouncements = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/announcements");
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data);
      } else {
        console.error("Failed to fetch announcements");
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const columns = [
    {
      key: "title",
      label: "Title",
    },
    {
      key: "content",
      label: "Content",
      render: (row) => (
        <span className="text-gray-700 dark:text-gray-300 max-w-xs truncate block">
          {row.content}
        </span>
      ),
    },
    {
      key: "target_audience",
      label: "Target Audience",
    },
    {
      key: "publish_date",
      label: "Publish Date",
      render: (row) => new Date(row.publish_date).toLocaleDateString(),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${row.status === "Published"
          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
          }`}>
          {row.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
            title="View"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
            title="Edit"
            onClick={() => handleEdit(row)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Delete"
            onClick={() => handleDelete(row.id)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  const handleEdit = (row) => {
    setEditingId(row.id);
    setFormData({
      title: row.title,
      content: row.content,
      targetAudience: row.target_audience,
      publishDate: new Date(row.publish_date).toISOString().split('T')[0],
      status: row.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this announcement?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/announcements/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          fetchAnnouncements();
        } else {
          alert("Failed to delete announcement");
        }
      } catch (error) {
        console.error("Error deleting announcement:", error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId
        ? `http://localhost:5000/api/announcements/emergency-update/${editingId}`
        : "http://localhost:5000/api/announcements";

      // Always use POST now (one for create, one for update)
      const method = "POST";

      console.log("Submitting form:", { url, method, formData });

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        fetchAnnouncements();
        setShowModal(false);
        setEditingId(null);
        setFormData({
          title: "",
          content: "",
          targetAudience: "All Students",
          publishDate: new Date().toISOString().split('T')[0],
          status: "Published"
        });
      } else {
        const errorText = await response.text();
        console.error("Submission failed:", errorText);
        alert(`Failed to ${editingId ? 'update' : 'create'} announcement. Status: ${response.status}. Error: ${errorText}`);
      }
    } catch (error) {
      console.error(`Error ${editingId ? 'updating' : 'creating'} announcement:`, error);
      alert(`Error ${editingId ? 'updating' : 'creating'} announcement: ${error.message}`);
    }
  };

  return (
    <>
      <AdminHeader />
      <main className="flex-1 overflow-y-auto bg-gray-50 mt-20 transition-colors">
        <div className="w-full px-8 py-6">
          <DataTable
            title="Announcements"
            columns={columns}
            data={announcements}
            showAddButton={true}
            onAddClick={() => {
              setEditingId(null);
              setFormData({
                title: "",
                content: "",
                targetAudience: "All Students",
                publishDate: new Date().toISOString().split('T')[0],
                status: "Published"
              });
              setShowModal(true);
            }}
          />
        </div>
      </main>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? "Edit Announcement" : "Create New Announcement"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#010080] focus:border-transparent outline-none transition-all"
              placeholder="e.g., New Course Registration"
            />
          </div>

          <div>
            <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target Audience
            </label>
            <select
              id="targetAudience"
              name="targetAudience"
              value={formData.targetAudience}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#010080] focus:border-transparent outline-none transition-all"
            >
              <option value="All Students">All Students</option>
              <option value="Advanced English Students">Advanced English Students</option>
              <option value="Beginner English Students">Beginner English Students</option>
              <option value="Teachers">Teachers</option>
            </select>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Content
            </label>
            <textarea
              id="content"
              name="content"
              required
              rows={4}
              value={formData.content}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#010080] focus:border-transparent outline-none transition-all resize-none"
              placeholder="Write your announcement content here..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Publish Date
              </label>
              <input
                type="date"
                id="publishDate"
                name="publishDate"
                required
                value={formData.publishDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#010080] focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#010080] focus:border-transparent outline-none transition-all"
              >
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 mt-6">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#010080] hover:bg-[#010080]/90 text-white transition-colors shadow-sm"
            >
              {editingId ? "Update Announcement" : "Create Announcement"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

