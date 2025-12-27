"use client";

import { useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";
import { useDarkMode } from "@/context/ThemeContext";
import {
  useGetAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation
} from "@/redux/api/announcementApi";
import { useGetClassesQuery } from "@/redux/api/classApi";
import { useGetStudentsQuery } from "@/redux/api/studentApi";

export default function AnnouncementsPage() {
  const { isDark } = useDarkMode();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    targetType: "all_students", // internal logic
    targetId: "", // classId or studentId
    publishDate: new Date().toISOString().split('T')[0],
    status: "Published"
  });

  // Queries
  const { data: announcements, isLoading, isError } = useGetAnnouncementsQuery();
  const { data: classes } = useGetClassesQuery();
  const { data: students } = useGetStudentsQuery();

  // Mutations
  const [createAnnouncement, { isLoading: isCreating }] = useCreateAnnouncementMutation();
  const [updateAnnouncement, { isLoading: isUpdating }] = useUpdateAnnouncementMutation();
  const [deleteAnnouncement, { isLoading: isDeleting }] = useDeleteAnnouncementMutation();

  // Confirmation Modal State
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    isLoading: false
  });

  const handleAddClick = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: "",
      content: "",
      targetType: "all_students",
      targetId: "",
      publishDate: new Date().toISOString().split('T')[0],
      status: "Published"
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (announcement) => {
    setEditingAnnouncement(announcement);
    // Try to parse existing targetAudience string back to type/id if possible, or just default to manual
    // detailed parsing logic would be needed here for perfect round-tripping if we stored complex strings
    // For now, simplifiction: 
    setFormData({
      title: announcement.title,
      content: announcement.content,
      targetType: "manual", // Default to manual for edit unless we parse
      targetId: "",
      publishDate: announcement.publish_date ? new Date(announcement.publish_date).toISOString().split('T')[0] : "",
      status: announcement.status
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setConfirmationModal({
      isOpen: true,
      title: "Delete Announcement",
      message: "Are you sure you want to delete this announcement?",
      onConfirm: async () => {
        setConfirmationModal(prev => ({ ...prev, isLoading: true }));
        try {
          await deleteAnnouncement(id).unwrap();
          setConfirmationModal({ isOpen: false, title: "", message: "", onConfirm: null, isLoading: false });
        } catch (error) {
          console.error("Failed to delete", error);
          setConfirmationModal(prev => ({ ...prev, isLoading: false }));
          alert("Failed to delete announcement.");
        }
      },
      isLoading: false
    });
  };

  const handleViewClick = (announcement) => {
    setSelectedAnnouncement(announcement);
    setIsViewModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Construct Target Audience String
    let targetAudienceString = "";
    if (formData.targetType === 'all_students') targetAudienceString = "All Students";
    else if (formData.targetType === 'all_teachers') targetAudienceString = "All Teachers";
    else if (formData.targetType === 'all_admins') targetAudienceString = "All Admins";
    else if (formData.targetType === 'by_class') {
      const cls = classes?.find(c => c.id.toString() === formData.targetId);
      targetAudienceString = cls ? `Class: ${cls.class_name}` : "Class Notification";
    }
    else if (formData.targetType === 'by_student_id') {
      const st = students?.find(s => s.id.toString() === formData.targetId);
      targetAudienceString = st ? `Student: ${st.full_name} (${st.student_id})` : "Student Notification";
    } else {
      targetAudienceString = "General Announcement";
    }

    // Use existing string if editing and type is manual/unchanged
    if (editingAnnouncement && formData.targetType === 'manual') {
      // If they didn't change the type dropdown, keep original or allow manual edit if we had a field
      // For simplicity, let's assume if they edit, they pick a type
      // Or we could have an input field for "Custom Audience"
      targetAudienceString = editingAnnouncement.target_audience;
    }

    const payload = {
      title: formData.title,
      content: formData.content,
      targetAudience: targetAudienceString,
      publishDate: formData.publishDate,
      status: formData.status
    };

    try {
      if (editingAnnouncement) {
        await updateAnnouncement({ id: editingAnnouncement.id, ...payload }).unwrap();
      } else {
        await createAnnouncement(payload).unwrap();
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save", error);
      alert("Failed to save announcement.");
    }
  };

  const columns = [
    { key: "title", label: "Title" },
    {
      key: "content",
      label: "Content",
      render: (row) => (
        <span className="text-gray-700 dark:text-gray-300 max-w-xs truncate block" title={row.content}>
          {row.content}
        </span>
      )
    },
    { key: "target_audience", label: "Target Audience" },
    {
      key: "publish_date",
      label: "Publish Date",
      render: (row) => row.publish_date ? new Date(row.publish_date).toLocaleDateString() : 'N/A'
    },
    {
      key: "views",
      label: "Views",
      render: (row) => row.views || 0
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
            onClick={() => handleViewClick(row)}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
            title="View"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            onClick={() => handleEditClick(row)}
            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
            title="Edit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => handleDeleteClick(row.id)}
            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
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
    <>
      <AdminHeader />
      <main className="flex-1 overflow-y-auto bg-gray-50 pt-20 transition-colors">
        <div className="w-full px-8 py-6">
          <DataTable
            title="Announcements"
            columns={columns}
            data={announcements || []}
            showAddButton={true}
            onAddClick={handleAddClick}
            isLoading={isLoading}
          />
        </div>
      </main>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className={`relative w-full max-w-2xl p-6 rounded-lg shadow-xl ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
            <h3 className="text-xl font-bold mb-4">{editingAnnouncement ? "Edit Announcement" : "Create Announcement"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea
                  required
                  rows={4}
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Target Audience</label>
                  <select
                    value={formData.targetType}
                    onChange={e => setFormData({ ...formData, targetType: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                  >
                    <option value="all_students">All Students</option>
                    <option value="by_class">By Class</option>
                    <option value="by_student_id">By Student ID</option>
                    <option value="all_teachers">All Teachers</option>
                    <option value="all_admins">All Admins</option>
                  </select>
                </div>
                {formData.targetType === 'by_class' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Select Class</label>
                    <select
                      required
                      value={formData.targetId}
                      onChange={e => setFormData({ ...formData, targetId: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                    >
                      <option value="">Select a Class</option>
                      {classes?.map(c => (
                        <option key={c.id} value={c.id}>{c.class_name}</option>
                      ))}
                    </select>
                  </div>
                )}
                {formData.targetType === 'by_student_id' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Select Student</label>
                    <select
                      required
                      value={formData.targetId}
                      onChange={e => setFormData({ ...formData, targetId: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                    >
                      <option value="">Select a Student</option>
                      {students?.map(s => (
                        <option key={s.id} value={s.id}>{s.full_name} ({s.student_id})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Publish Date</label>
                  <input
                    type="date"
                    required
                    value={formData.publishDate}
                    onChange={e => setFormData({ ...formData, publishDate: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isCreating || isUpdating ? "Saving..." : "Save Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && selectedAnnouncement && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)} />
          <div className={`relative w-full max-w-2xl p-6 rounded-lg shadow-xl ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold">{selectedAnnouncement.title}</h3>
              <button onClick={() => setIsViewModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <p className="text-sm font-semibold mb-2 opacity-75 uppercase tracking-wide">Content</p>
                <p className="whitespace-pre-wrap">{selectedAnnouncement.content}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/30' : 'bg-blue-50'}`}>
                  <p className="text-xs font-semibold opacity-75 uppercase">Target Audience</p>
                  <p className="font-medium">{selectedAnnouncement.target_audience}</p>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/30' : 'bg-blue-50'}`}>
                  <p className="text-xs font-semibold opacity-75 uppercase">Status</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${selectedAnnouncement.status === "Published"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                    }`}>
                    {selectedAnnouncement.status}
                  </span>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/30' : 'bg-blue-50'}`}>
                  <p className="text-xs font-semibold opacity-75 uppercase">Publish Date</p>
                  <p className="font-medium">{selectedAnnouncement.publish_date ? new Date(selectedAnnouncement.publish_date).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/30' : 'bg-blue-50'}`}>
                  <p className="text-xs font-semibold opacity-75 uppercase">Views</p>
                  <p className="font-medium">{selectedAnnouncement.views || 0}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmationModal.isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !confirmationModal.isLoading && setConfirmationModal(prev => ({ ...prev, isOpen: false }))} />
          <div className={`relative w-full max-w-md p-6 rounded-lg shadow-xl ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
            <h3 className="text-xl font-bold mb-3">{confirmationModal.title}</h3>
            <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{confirmationModal.message}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))} disabled={confirmationModal.isLoading} className={`px-4 py-2 rounded-lg font-medium transition-colors ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>Cancel</button>
              <button onClick={confirmationModal.onConfirm} disabled={confirmationModal.isLoading} className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 flex items-center gap-2">{confirmationModal.isLoading && <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>} Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
