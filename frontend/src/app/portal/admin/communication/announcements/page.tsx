"use client";

import { useState } from "react";

import DataTable from "@/components/DataTable";
import { useDarkMode } from "@/context/ThemeContext";
import {
  useGetAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation
} from "@/lib/api/announcementApi";
import { useGetClassesQuery } from "@/lib/api/classApi";
import { useGetStudentsQuery } from "@/lib/api/studentApi";
import { usePagePermissions } from "@/hooks/usePagePermissions";
import AdminTableActions from "@/components/admin/AdminTableActions";

// Extracted Components
import AnnouncementForm from "@/components/admin/announcements/AnnouncementForm";
import AnnouncementViewModal from "@/components/admin/announcements/AnnouncementViewModal";
import AnnouncementConfirmationModal from "@/components/admin/announcements/AnnouncementConfirmationModal";

export default function AnnouncementsPage() {
  const { isDark } = useDarkMode();
  const { canView, canAdd, canEdit, canDelete } = usePagePermissions("communication", "announcements");
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
      const cls = classes?.find(c => String(c.id || '') === String(formData.targetId || ''));
      targetAudienceString = cls ? `Class: ${cls.class_name}` : "Class Notification";
    }
    else if (formData.targetType === 'by_student_id') {
      const st = students?.find(s => String(s.student_id || s.id || '') === String(formData.targetId || ''));
      targetAudienceString = st ? `Student: ${st.full_name || st.name} (${st.student_id || st.id})` : "Student Notification";
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
    { key: "content", label: "Content", render: (_, row) => <span className="text-gray-700 dark:text-gray-300 max-w-xs truncate block" title={row.content}>{row.content}</span> },
    { key: "target_audience", label: "Target Audience" },
    { key: "publish_date", label: "Publish Date", render: (_, row) => row.publish_date ? new Date(row.publish_date).toLocaleDateString() : 'N/A' },
    { key: "views", label: "Views", render: (_, row) => row.views || 0 },
    { key: "status", label: "Status", render: (_, row) => <span className={`px-2 text-xs leading-5 font-semibold rounded-full ${row.status === "Published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{row.status}</span> },
    {
      key: "actions", label: "Actions",
      render: (_, row) => (
        <AdminTableActions
          canView={canView}
          canEdit={canEdit}
          canDelete={canDelete}
          onView={() => handleViewClick(row)}
          onEdit={() => handleEditClick(row)}
          onDelete={() => handleDeleteClick(row.id)}
        />
      ),
    },
  ];

  return (
    <>
      <div className="flex-1 overflow-y-auto bg-gray-50"><div className="w-full px-8 py-6"><DataTable title="Announcements" columns={columns} data={announcements || []} showAddButton={canAdd} onAddClick={canAdd ? handleAddClick : undefined} isLoading={isLoading} /></div></div>
      <AnnouncementForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} editingAnnouncement={editingAnnouncement} formData={formData} setFormData={setFormData} handleSubmit={handleSubmit} isDark={isDark} isCreating={isCreating} isUpdating={isUpdating} classes={classes} students={students} />
      <AnnouncementViewModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} announcement={selectedAnnouncement} isDark={isDark} />
      <AnnouncementConfirmationModal isOpen={confirmationModal.isOpen} onClose={() => setConfirmationModal({ ...confirmationModal, isOpen: false })} title={confirmationModal.title} message={confirmationModal.message} onConfirm={confirmationModal.onConfirm} isLoading={confirmationModal.isLoading} isDark={isDark} />
    </>
  );
}
