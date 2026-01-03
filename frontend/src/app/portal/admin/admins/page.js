"use client";

import { useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";
import { useDarkMode } from "@/context/ThemeContext";
import {
  useGetAdminsQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation
} from "@/redux/api/adminApi";
import Loader from "@/components/Loader";
import { useToast } from "@/components/Toast";

// Extracted Components
import AdminForm from "./components/AdminForm";
import AdminConfirmationModal from "./components/AdminConfirmationModal";

export default function AdminsPage() {
  const { isDark } = useDarkMode();
  const { showToast } = useToast();

  const { data: allUsers, isLoading } = useGetAdminsQuery();
  const [createAdmin, { isLoading: isCreating }] = useCreateAdminMutation();
  const [updateAdmin, { isLoading: isUpdating }] = useUpdateAdminMutation();
  const [deleteAdmin, { isLoading: isDeleting }] = useDeleteAdminMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "", last_name: "", username: "", email: "", password: "", confirmPassword: "", role: "admin", status: "active"
  });

  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false, title: "", message: "", onConfirm: null, isLoading: false
  });

  const handleStatusToggle = (admin) => {
    const newStatus = admin.status === 'active' ? 'inactive' : 'active';
    setConfirmationModal({
      isOpen: true, title: "Confirm Status Change", message: `Do you want to change status of ${admin.username} to ${newStatus}?`,
      onConfirm: async () => {
        setConfirmationModal(prev => ({ ...prev, isLoading: true }));
        try {
          await updateAdmin({ id: admin.id, status: newStatus }).unwrap();
          showToast("Admin status updated successfully", "success");
          setConfirmationModal({ isOpen: false, title: "", message: "", onConfirm: null, isLoading: false });
        } catch (error) {
          showToast(error?.data?.error || "Failed to update status", "error");
          setConfirmationModal(prev => ({ ...prev, isLoading: false }));
        }
      },
      isLoading: false
    });
  };

  const handleDeleteClick = (id) => {
    setConfirmationModal({
      isOpen: true, title: "Delete Admin", message: "Are you sure you want to delete this admin?",
      onConfirm: async () => {
        setConfirmationModal(prev => ({ ...prev, isLoading: true }));
        try {
          await deleteAdmin(id).unwrap();
          showToast("Admin deleted successfully", "success");
          setConfirmationModal({ isOpen: false, title: "", message: "", onConfirm: null, isLoading: false });
        } catch (error) {
          showToast(error?.data?.error || "Failed to delete admin", "error");
          setConfirmationModal(prev => ({ ...prev, isLoading: false }));
        }
      },
      isLoading: false
    });
  };

  const handleAddClick = () => {
    setEditingAdmin(null);
    setFormData({ first_name: "", last_name: "", username: "", email: "", password: "", confirmPassword: "", role: "admin", status: "active" });
    setIsModalOpen(true);
  };

  const handleEditClick = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      first_name: admin.first_name || "", last_name: admin.last_name || "", username: admin.username || "",
      email: admin.email || "", password: "", confirmPassword: "", role: admin.role || "admin", status: admin.status || "active"
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setEditingAdmin(null); };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      showToast("Passwords do not match", "error"); return;
    }
    try {
      const payload = { ...formData };
      if (editingAdmin && !payload.password) { delete payload.password; delete payload.confirmPassword; }
      delete payload.confirmPassword;

      if (editingAdmin) {
        await updateAdmin({ id: editingAdmin.id, ...payload }).unwrap();
        showToast("Admin updated successfully", "success");
      } else {
        await createAdmin(payload).unwrap();
        showToast("Admin created successfully", "success");
      }
      handleCloseModal();
    } catch (error) { showToast(error?.data?.error || "Operation failed", "error"); }
  };

  const columns = [
    { key: "first_name", label: "First Name", render: (row) => <span className="font-medium text-gray-900 dark:text-white">{row.first_name || "-"}</span> },
    { key: "last_name", label: "Last Name", render: (row) => <span className="font-medium text-gray-900 dark:text-white">{row.last_name || "-"}</span> },
    { key: "username", label: "Username", render: (row) => <span className="text-gray-700 dark:text-gray-300">{row.username}</span> },
    { key: "email", label: "Email", render: (row) => <span className="text-gray-700 dark:text-gray-300">{row.email || "-"}</span> },
    { key: "status", label: "Status", render: (row) => <button onClick={() => handleStatusToggle(row)} className={`px-3 py-1 text-xs font-semibold rounded-full ${row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{row.status?.charAt(0).toUpperCase() + row.status?.slice(1)}</button> },
    { key: "role", label: "Role", render: (row) => <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">{row.role}</span> },
    {
      key: "actions", label: "Actions",
      render: (row) => (
        <div className="flex gap-2 items-center">
          <button onClick={() => handleEditClick(row)} className="text-green-600 p-2 hover:bg-green-50 rounded-lg transition-colors" title="Edit"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
          <button onClick={() => handleDeleteClick(row.id)} className="text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete" disabled={isDeleting}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
        </div>
      ),
    },
  ];

  if (isLoading) return <div className={`flex-1 min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}><AdminHeader /><main className="flex-1 flex items-center justify-center"><Loader /></main></div>;

  return (
    <>
      <AdminHeader />
      <main className="flex-1 bg-gray-50 mt-20"><div className="w-full px-8 py-6"><div className="mb-6"><h1 className="text-2xl font-bold text-gray-800 mb-2">Admins Management</h1><p className="text-gray-600">Manage system administrators and their access</p></div><DataTable title="" columns={columns} data={allUsers || []} showAddButton={true} onAddClick={handleAddClick} /></div></main>
      <AdminForm isOpen={isModalOpen} onClose={handleCloseModal} editingAdmin={editingAdmin} formData={formData} handleInputChange={handleInputChange} handleSubmit={handleSubmit} isDark={isDark} isCreating={isCreating} isUpdating={isUpdating} />
      <AdminConfirmationModal isOpen={confirmationModal.isOpen} onClose={() => setConfirmationModal({ ...confirmationModal, isOpen: false })} title={confirmationModal.title} message={confirmationModal.message} onConfirm={confirmationModal.onConfirm} isLoading={confirmationModal.isLoading} isDark={isDark} />
    </>
  );
}
