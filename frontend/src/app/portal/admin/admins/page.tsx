"use client";

import { useState } from "react";
import DataTable from "@/components/DataTable";
import { useDarkMode } from "@/context/ThemeContext";
import {
  useGetAdminsQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
  useBulkActionAdminsMutation
} from "@/lib/api/adminApi";
import Loader from "@/components/Loader";
import { useToast } from "@/components/Toast";

// Extracted Components
import AdminForm from "@/components/admin/admins/AdminForm";
import AdminViewModal from "@/components/admin/admins/AdminViewModal";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { parsePermissions } from "@/constants/adminPermissions";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminsPage() {
  const router = useRouter();
  const { isSuperAdmin } = useAdminPermissions();
  const { isDark } = useDarkMode();
  const { showToast } = useToast();

  const { data: allUsers, isLoading } = useGetAdminsQuery();
  const [createAdmin, { isLoading: isCreating }] = useCreateAdminMutation();
  const [updateAdmin, { isLoading: isUpdating }] = useUpdateAdminMutation();
  const [deleteAdmin, { isLoading: isDeleting }] = useDeleteAdminMutation();
  const [bulkActionAdmins] = useBulkActionAdminsMutation();

  // Selection state
  const [selectedAdmins, setSelectedAdmins] = useState([]);

  // Filtering & Sorting State
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOption, setSortOption] = useState("default");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingAdmin, setViewingAdmin] = useState(null);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "", username: "", email: "", password: "", confirmPassword: "", role: "super", status: "active", permissions: [] as string[]
  });

  useEffect(() => {
    if (!isSuperAdmin) {
      router.replace("/portal/admin");
    }
  }, [isSuperAdmin, router]);

  // Bulk Action Confirmation Modal State
  const [bulkModal, setBulkModal] = useState({
    isOpen: false,
    action: "",
    confirmInput: "",
    isSubmitting: false,
  });

  const openBulkModal = (action) => {
    setBulkModal({
      isOpen: true,
      action,
      confirmInput: "",
      isSubmitting: false,
    });
  };

  const closeBulkModal = () => {
    setBulkModal({
      isOpen: false,
      action: "",
      confirmInput: "",
      isSubmitting: false,
    });
  };

  const handleConfirmBulkAction = async () => {
    if (bulkModal.confirmInput !== "CONFIRM") {
      showToast("Please type CONFIRM exactly to proceed.", "error");
      return;
    }

    setBulkModal((prev) => ({ ...prev, isSubmitting: true }));

    try {
      await bulkActionAdmins({
        adminIds: selectedAdmins,
        action: bulkModal.action,
      }).unwrap();

      showToast(
        `Successfully performed bulk ${bulkModal.action} on ${selectedAdmins.length} admins!`,
        "success"
      );
      setSelectedAdmins([]);
      closeBulkModal();
    } catch (err) {
      showToast(
        `Failed to perform bulk action: ${err?.data?.error || err.message || "Unknown error"}`,
        "error"
      );
      setBulkModal((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleStatusToggle = (admin) => {
    const newStatus = admin.status === 'active' ? 'inactive' : 'active';
    setBulkModal({
      isOpen: true,
      action: newStatus === 'active' ? 'activate' : 'deactivate',
      confirmInput: "",
      isSubmitting: false,
    });
    // Set selected user to only this admin for direct toggle action
    setSelectedAdmins([admin.id]);
  };

  const handleDeleteClick = (id) => {
    setBulkModal({
      isOpen: true,
      action: 'delete',
      confirmInput: "",
      isSubmitting: false,
    });
    setSelectedAdmins([id]);
  };

  const handleAddClick = () => {
    setEditingAdmin(null);
    setFormData({
      full_name: "", username: "", email: "", password: "", confirmPassword: "", role: "super", status: "active", permissions: []
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      full_name: admin.full_name || `${admin.first_name || ''} ${admin.last_name || ''}`.trim() || "",
      username: admin.username || "",
      email: admin.email || "",
      password: "",
      confirmPassword: "",
      role: admin.role || "super",
      status: admin.status || "active",
      permissions: parsePermissions(admin.permissions),
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAdmin(null);
  };

  const handleViewClick = (admin) => {
    setViewingAdmin(admin);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingAdmin(null);
  };

  const formatAdminDate = (value) => {
    if (!value) return "N/A";
    return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (name === "role" && value === "super") {
        next.permissions = [];
      }
      if (name === "role" && value === "technical" && !prev.permissions?.length) {
        next.permissions = ["dashboard"];
      }
      return next;
    });
  };

  const handlePermissionToggle = (permissionKey) => {
    setFormData((prev) => {
      const current = prev.permissions || [];
      const permissions = current.includes(permissionKey)
        ? current.filter((key) => key !== permissionKey)
        : [...current, permissionKey];
      return { ...prev, permissions };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.role === "technical") {
      if (!formData.permissions?.length) {
        showToast("Select at least one permission for Technical Admin", "error");
        return;
      }
    } else {
      if (!editingAdmin && !formData.password) {
        showToast("Password is required for Super Admin", "error");
        return;
      }
      if (formData.password && formData.password !== formData.confirmPassword) {
        showToast("Passwords do not match", "error");
        return;
      }
      if (formData.password) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
        if (!passwordRegex.test(formData.password)) {
          showToast("Password must be at least 6 characters and include uppercase, lowercase, number, and symbol", "error");
          return;
        }
      }
    }

    try {
      const payload = { ...formData };
      if (formData.role === "technical") {
        delete payload.password;
        delete payload.confirmPassword;
      } else {
        delete payload.permissions;
        if (editingAdmin && !payload.password) {
          delete payload.password;
          delete payload.confirmPassword;
        }
      }
      delete payload.confirmPassword;

      if (editingAdmin) {
        await updateAdmin({ id: editingAdmin.id, ...payload }).unwrap();
        showToast("Admin updated successfully", "success");
      } else {
        await createAdmin(payload).unwrap();
        showToast("Admin created successfully", "success");
      }
      handleCloseModal();
    } catch (error) {
      showToast(error?.data?.error || "Operation failed", "error");
    }
  };

  // Reset all filters to show all
  const handleShowAll = () => {
    setRoleFilter("all");
    setStatusFilter("all");
    setSortOption("default");
    setSelectedAdmins([]);
    showToast("Reset all filters, showing all admins", "info");
  };

  // 1. Filtering logic
  let processedAdmins = (allUsers || []).filter((admin) => {
    // Role filter
    if (roleFilter !== "all" && admin.role !== roleFilter) return false;
    // Status filter
    if (statusFilter !== "all" && admin.status !== statusFilter) return false;
    return true;
  });

  // 2. Sorting logic
  processedAdmins = [...processedAdmins].sort((a, b) => {
    if (sortOption === "name_asc") {
      return (a.full_name || `${a.first_name || ''} ${a.last_name || ''}`).trim().localeCompare(
        (b.full_name || `${b.first_name || ''} ${b.last_name || ''}`).trim()
      );
    }
    if (sortOption === "name_desc") {
      return (b.full_name || `${b.first_name || ''} ${b.last_name || ''}`).trim().localeCompare(
        (a.full_name || `${a.first_name || ''} ${a.last_name || ''}`).trim()
      );
    }
    if (sortOption === "newest") {
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    }
    if (sortOption === "oldest") {
      return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
    }
    return 0;
  });

  const columns = [
    {
      key: "full_name",
      label: "Full Name",
      render: (_, row) => (
        <span className="font-semibold dark:text-gray-200">
          {row.full_name || `${row.first_name || ''} ${row.last_name || ''}`.trim() || "-"}
        </span>
      ),
    },
    { key: "username", label: "Username" },
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Role",
      render: (val) => {
        const isTechnical = val === "technical";
        return (
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
            isTechnical
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
              : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
          }`}>
            {isTechnical ? "Technical Admin" : "Super Admin"}
          </span>
        );
      }
    },
    {
      key: "status",
      label: "Status",
      render: (val, row) => (
        <button
          onClick={() => handleStatusToggle(row)}
          className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
            val === 'active'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
          }`}
        >
          {val?.charAt(0).toUpperCase() + val?.slice(1)}
        </button>
      )
    },
    {
      key: "created_info",
      label: "Created By",
      render: (_, row) => (
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5 font-medium min-w-[180px]">
          <div className="flex items-start gap-1">
            <span className="text-gray-400 font-bold shrink-0">By:</span>
            <span className="text-gray-700 dark:text-gray-200">{row.created_by_name || "Not recorded"}</span>
          </div>
          <div className="flex items-start gap-1">
            <span className="text-gray-400 font-bold shrink-0">At:</span>
            <span>{formatAdminDate(row.created_at)}</span>
          </div>
        </div>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleViewClick(row)}
            className="text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors dark:text-blue-400 dark:hover:bg-blue-950/20"
            title="View"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            onClick={() => handleEditClick(row)}
            className="text-green-600 p-2 hover:bg-green-50 rounded-lg transition-colors dark:text-green-400 dark:hover:bg-green-950/20"
            title="Edit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => handleDeleteClick(row.id)}
            className="text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors dark:text-red-400 dark:hover:bg-red-950/20"
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

  // Custom filters header to include Show All, Sorting and Status (Role) Dropdowns
  const filters = (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Show All Button */}
      <button
        onClick={handleShowAll}
        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-all dark:bg-blue-950/40 dark:border-blue-900/60 dark:text-blue-300 dark:hover:bg-blue-950/60 active:scale-95"
        title="Reset all filters and selection"
      >
        Show All
      </button>

      {/* Role Filter (labeled "Filter By Status" in DOCX) */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Admin Type:</span>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="text-xs border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500/50 font-medium"
        >
          <option value="all">All Roles</option>
          <option value="super">Super Admin</option>
          <option value="technical">Technical Admin</option>
        </select>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Status:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500/50 font-medium"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Sorting Button/Dropdown */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Sort By:</span>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="text-xs border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500/50 font-medium"
        >
          <option value="default">Default (Newest)</option>
          <option value="name_asc">Name: A to Z</option>
          <option value="name_desc">Name: Z to A</option>
          <option value="newest">Newest to Oldest</option>
          <option value="oldest">Oldest to Newest</option>
        </select>
      </div>
    </div>
  );

  // Bulk Actions floating bar matching users/page.tsx
  const customActions = selectedAdmins.length > 0 ? (
    <>
      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 mr-1.5 self-center">
        {selectedAdmins.length} selected
      </span>
      <button
        onClick={() => openBulkModal("activate")}
        className="px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
      >
        Activate
      </button>
      <button
        onClick={() => openBulkModal("deactivate")}
        className="px-4 py-2 text-sm font-semibold rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors"
      >
        Deactivate
      </button>
      <button
        onClick={() => openBulkModal("delete")}
        className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
      >
        Delete
      </button>
    </>
  ) : null;




  if (!isSuperAdmin) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={`flex-1 min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex-1 flex items-center justify-center">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="w-full px-8 py-6">
          <DataTable
            title="Admins Management"
            columns={columns}
            data={processedAdmins}
            showAddButton={true}
            onAddClick={handleAddClick}
            selectable={true}
            selectedItems={selectedAdmins}
            onSelectionChange={setSelectedAdmins}
            getRowId={(row) => row.id}
            filters={filters}
            customActions={customActions}
          />
        </div>
      </div>

      <AdminForm
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingAdmin={editingAdmin}
        formData={formData}
        handleInputChange={handleInputChange}
        handlePermissionToggle={handlePermissionToggle}
        handleSubmit={handleSubmit}
        isDark={isDark}
        isCreating={isCreating}
        isUpdating={isUpdating}
      />

      <AdminViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        admin={viewingAdmin}
        isDark={isDark}
      />

      {/* Custom Premium Bulk Confirmation Modal matching Users page */}
      {bulkModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50">
          <div
            className="absolute inset-0 backdrop-blur-sm"
            onClick={() => !bulkModal.isSubmitting && closeBulkModal()}
          />
          <div className={`relative w-full max-w-md rounded-lg shadow-lg overflow-hidden border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            
            {/* Modal Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50/50 border-gray-200'}`}>
              <h3 className={`text-lg font-bold capitalize flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Confirm Bulk {bulkModal.action}
              </h3>
              <button
                onClick={() => !bulkModal.isSubmitting && closeBulkModal()}
                className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                disabled={bulkModal.isSubmitting}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className={`p-4 rounded-lg border mb-5 ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-blue-50/50 border-blue-100'}`}>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  You are about to <span className="font-extrabold underline capitalize">{bulkModal.action}</span> <span className="font-bold">{selectedAdmins.length}</span> selected administrator(s). This action is permanent and transaction-safe.
                </p>
              </div>
              
              <div className="space-y-2">
                <label className={`block text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Type <span className="text-red-500 font-extrabold font-mono">CONFIRM</span> to verify:
                </label>
                <input
                  type="text"
                  value={bulkModal.confirmInput}
                  onChange={(e) => setBulkModal(prev => ({ ...prev, confirmInput: e.target.value }))}
                  placeholder="Type CONFIRM here"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-mono ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                      : 'bg-white border-blue-200 text-blue-900 placeholder-gray-400'
                  }`}
                  disabled={bulkModal.isSubmitting}
                  autoFocus
                />
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={closeBulkModal}
                  className={`px-4 py-2 border rounded-lg transition-colors text-sm font-medium ${
                    isDark
                      ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                      : 'border-gray-300 hover:bg-gray-50 text-gray-600'
                  }`}
                  disabled={bulkModal.isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBulkAction}
                  disabled={bulkModal.confirmInput !== "CONFIRM" || bulkModal.isSubmitting}
                  className={`px-6 py-2 rounded-lg font-bold text-sm text-white transition-colors flex items-center justify-center ${
                    bulkModal.confirmInput !== "CONFIRM" || bulkModal.isSubmitting
                      ? 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed opacity-50 shadow-none'
                      : 'bg-[#010080] hover:bg-[#010080]/90 text-white'
                  }`}
                >
                  {bulkModal.isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "Confirm"
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
