"use client";

import { useMemo, useState } from "react";
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

export default function AdminsPage() {
  const { isDark } = useDarkMode();
  const { showToast } = useToast();

  // API Hooks
  const { data: allUsers, isLoading } = useGetAdminsQuery();
  const [createAdmin, { isLoading: isCreating }] = useCreateAdminMutation();
  const [updateAdmin, { isLoading: isUpdating }] = useUpdateAdminMutation();
  const [deleteAdmin, { isLoading: isDeleting }] = useDeleteAdminMutation();

  // Local State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "", // Only required for creation
    role: "admin",
    status: "active"
  });

  // Confirmation Modal State
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    isLoading: false
  });

  // Handlers
  const handleStatusToggle = (admin) => {
    const newStatus = admin.status === 'active' ? 'inactive' : 'active';

    setConfirmationModal({
      isOpen: true,
      title: "Confirm Status Change",
      message: `Do you want to change status of ${admin.username} to ${newStatus}?`,
      onConfirm: async () => {
        setConfirmationModal(prev => ({ ...prev, isLoading: true }));
        try {
          await updateAdmin({ id: admin.id, status: newStatus }).unwrap();
          showToast("Admin status updated successfully", "success");
          setConfirmationModal({ isOpen: false, title: "", message: "", onConfirm: null, isLoading: false });
        } catch (error) {
          console.error("Failed to update status:", error);
          showToast(error?.data?.error || "Failed to update status", "error");
          setConfirmationModal(prev => ({ ...prev, isLoading: false }));
        }
      },
      isLoading: false
    });
  };

  const handleDeleteClick = (id) => {
    setConfirmationModal({
      isOpen: true,
      title: "Delete Admin",
      message: "Are you sure you want to delete this admin?",
      onConfirm: async () => {
        setConfirmationModal(prev => ({ ...prev, isLoading: true }));
        try {
          await deleteAdmin(id).unwrap();
          showToast("Admin deleted successfully", "success");
          setConfirmationModal({ isOpen: false, title: "", message: "", onConfirm: null, isLoading: false });
        } catch (error) {
          console.error("Failed to delete admin:", error);
          showToast(error?.data?.error || "Failed to delete admin", "error");
          setConfirmationModal(prev => ({ ...prev, isLoading: false }));
        }
      },
      isLoading: false
    });
  };

  const handleAddClick = () => {
    setEditingAdmin(null);
    setFormData({
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      password: "",
      role: "admin",
      status: "active"
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      first_name: admin.first_name || "",
      last_name: admin.last_name || "",
      username: admin.username || "",
      email: admin.email || "",
      password: "", // Leave empty to keep existing
      role: admin.role || "admin",
      status: admin.status || "active"
    });
    setIsModalOpen(true);
  };


  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAdmin(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };

      // If editing and password is empty, remove it so it doesn't try to update to empty string
      if (editingAdmin && !payload.password) {
        delete payload.password;
      }

      if (editingAdmin) {
        await updateAdmin({ id: editingAdmin.id, ...payload }).unwrap();
        showToast("Admin updated successfully", "success");
      } else {
        await createAdmin(payload).unwrap();
        showToast("Admin created successfully", "success");
      }
      handleCloseModal();
    } catch (error) {
      console.error("Operation failed:", error);
      showToast(error?.data?.error || "Operation failed", "error");
    }
  };

  const columns = [
    {
      key: "first_name",
      label: "First Name",
      render: (row) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {row.first_name || "-"}
        </span>
      ),
    },
    {
      key: "last_name",
      label: "Last Name",
      render: (row) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {row.last_name || "-"}
        </span>
      ),
    },
    {
      key: "username",
      label: "Username",
      render: (row) => (
        <span className="text-gray-700 dark:text-gray-300">{row.username}</span>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (row) => (
        <span className="text-gray-700 dark:text-gray-300">{row.email || "-"}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <button
          onClick={() => handleStatusToggle(row)}
          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full transition-opacity hover:opacity-80 ${row.status === 'active'
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}
          title="Click to toggle status"
        >
          {row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : 'Active'}
        </button>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (row) => (
        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
          {row.role}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2 items-center">
          <button
            onClick={() => handleEditClick(row)}
            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
            title="Edit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => handleDeleteClick(row.id)}
            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
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

  if (isLoading) {
    return (
      <div className={`flex-1 min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <AdminHeader />
        <main className="flex-1 flex items-center justify-center">
          <Loader />
        </main>
      </div>
    );
  }

  return (
    <>
      <AdminHeader />
      <main className="flex-1 overflow-y-auto bg-gray-50 mt-20 transition-colors">
        <div className="w-full px-8 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Admins Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage system administrators and their access</p>
          </div>
          <DataTable
            title=""
            columns={columns}
            data={allUsers || []}
            showAddButton={true}
            onAddClick={handleAddClick}
          />
        </div>
      </main>

      {/* Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 w-full max-w-2xl mx-4 shadow-xl ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-xl font-bold">
                {editingAdmin ? 'Edit Admin' : 'Add New Admin'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={`p-6 rounded-lg border mb-6 ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-blue-50/50 border-blue-100'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Admin Information
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>First Name *</label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-blue-200 text-blue-900'}`}
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Last Name *</label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-blue-200 text-blue-900'}`}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Username *</label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-blue-200 text-blue-900'}`}
                        required
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-blue-200 text-blue-900'}`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {editingAdmin ? 'Password (leave blank to keep current)' : 'Password *'}
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-blue-200 text-blue-900'}`}
                      required={!editingAdmin}
                      minLength={6}
                    />
                  </div>

                  {editingAdmin && (
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-blue-200 text-blue-900'}`}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={`px-4 py-2 border rounded-lg transition-colors ${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isCreating || isUpdating ? 'Saving...' : (editingAdmin ? 'Update Admin' : 'Create Admin')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirmation Modal */}
      {confirmationModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !confirmationModal.isLoading && setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
          />
          <div className={`relative w-full max-w-md rounded-xl shadow-2xl overflow-hidden border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50/50 border-gray-200'}`}>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {confirmationModal.title}
              </h3>
              <button
                onClick={() => !confirmationModal.isLoading && setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
                className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                disabled={confirmationModal.isLoading}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <p className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {confirmationModal.message}
              </p>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
                  className={`px-4 py-2 rounded-lg border font-medium transition-colors ${isDark
                    ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  disabled={confirmationModal.isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmationModal.onConfirm}
                  disabled={confirmationModal.isLoading}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center px-6"
                >
                  {confirmationModal.isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

