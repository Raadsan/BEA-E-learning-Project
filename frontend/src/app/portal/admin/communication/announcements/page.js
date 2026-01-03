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

// Extracted Components
import AnnouncementForm from "./components/AnnouncementForm";
import AnnouncementViewModal from "./components/AnnouncementViewModal";
import AnnouncementConfirmationModal from "./components/AnnouncementConfirmationModal";

export default function AnnouncementsPage() {
  const { isDark } = useDarkMode();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  const [formData, setFormData] = useState({
    title: "", content: "", targetType: "all_students", targetId: "", publishDate: new Date().toISOString().split('T')[0], status: "Published"
  });

  const { data: announcements, isLoading, isError } = useGetAnnouncementsQuery();
  const { data: classes } = useGetClassesQuery();
  const { data: students } = useGetStudentsQuery();

  const [createAnnouncement, { isLoading: isCreating }] = useCreateAnnouncementMutation();
  const [updateAnnouncement, { isLoading: isUpdating }] = useUpdateAnnouncementMutation();
  const [deleteAnnouncement, { isLoading: isDeleting }] = useDeleteAnnouncementMutation();

  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false, title: "", message: "", onConfirm: null, isLoading: false
  });

  const handleAddClick = () => {
    setEditingAnnouncement(null);
    setFormData({ title: "", content: "", targetType: "all_students", targetId: "", publishDate: new Date().toISOString().split('T')[0], status: "Published" });
    setIsModalOpen(true);
  };

  const handleEditClick = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title, content: announcement.content, targetType: "manual", targetId: "",
      publishDate: announcement.publish_date ? new Date(announcement.publish_date).toISOString().split('T')[0] : "", status: announcement.status
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setConfirmationModal({
      isOpen: true, title: "Delete Announcement", message: "Are you sure you want to delete this announcement?",
      onConfirm: async () => {
        setConfirmationModal(prev => ({ ...prev, isLoading: true }));
        try {
          await deleteAnnouncement(id).unwrap();
          setConfirmationModal({ isOpen: false, title: "", message: "", onConfirm: null, isLoading: false });
        } catch (error) { setConfirmationModal(prev => ({ ...prev, isLoading: false })); alert("Failed to delete."); }
      },
      isLoading: false
    });
  };

  const handleViewClick = (announcement) => { setSelectedAnnouncement(announcement); setIsViewModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    } else targetAudienceString = "General Announcement";

    if (editingAnnouncement && formData.targetType === 'manual') targetAudienceString = editingAnnouncement.target_audience;

    const payload = {
      title: formData.title, content: formData.content, targetAudience: targetAudienceString,
      targetType: formData.targetType, targetId: formData.targetId, publishDate: formData.publishDate, status: formData.status
    };

    try {
      if (editingAnnouncement) await updateAnnouncement({ id: editingAnnouncement.id, ...payload }).unwrap();
      else await createAnnouncement(payload).unwrap();
      setIsModalOpen(false);
    } catch (error) { alert("Failed to save announcement."); }
  };

  const columns = [
    { key: "title", label: "Title" },
    { key: "content", label: "Content", render: (row) => <span className="text-gray-700 dark:text-gray-300 max-w-xs truncate block" title={row.content}>{row.content}</span> },
    { key: "target_audience", label: "Target Audience" },
    { key: "publish_date", label: "Publish Date", render: (row) => row.publish_date ? new Date(row.publish_date).toLocaleDateString() : 'N/A' },
    { key: "views", label: "Views", render: (row) => row.views || 0 },
    { key: "status", label: "Status", render: (row) => <span className={`px-2 text-xs leading-5 font-semibold rounded-full ${row.status === "Published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{row.status}</span> },
    {
      key: "actions", label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => handleViewClick(row)} className="text-blue-600 p-1 hover:bg-blue-50 rounded" title="View"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
          <button onClick={() => handleEditClick(row)} className="text-green-600 p-1 hover:bg-green-50 rounded" title="Edit"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
          <button onClick={() => handleDeleteClick(row.id)} className="text-red-600 p-1 hover:bg-red-50 rounded" title="Delete"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
        </div>
      ),
    },
  ];

  return (
    <>
      <AdminHeader />
      <main className="flex-1 overflow-y-auto bg-gray-50 pt-20"><div className="w-full px-8 py-6"><DataTable title="Announcements" columns={columns} data={announcements || []} showAddButton={true} onAddClick={handleAddClick} isLoading={isLoading} /></div></main>
      <AnnouncementForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} editingAnnouncement={editingAnnouncement} formData={formData} setFormData={setFormData} handleSubmit={handleSubmit} isDark={isDark} isCreating={isCreating} isUpdating={isUpdating} classes={classes} students={students} />
      <AnnouncementViewModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} announcement={selectedAnnouncement} isDark={isDark} />
      <AnnouncementConfirmationModal isOpen={confirmationModal.isOpen} onClose={() => setConfirmationModal({ ...confirmationModal, isOpen: false })} title={confirmationModal.title} message={confirmationModal.message} onConfirm={confirmationModal.onConfirm} isLoading={confirmationModal.isLoading} isDark={isDark} />
    </>
  );
}
