"use client";

import { useState } from "react";
import DataTable from "@/components/DataTable";
import { useGetUsersQuery, useBulkActionUsersMutation } from "@/lib/api/userApi";
import { useDarkMode } from "@/context/ThemeContext";
import { useToast } from "@/components/Toast";
import { resolveProfileImageUrl } from "@/constants";

export default function UsersPage() {
  const { isDark } = useDarkMode();
  const { data: usersData, isLoading, error } = useGetUsersQuery(undefined);
  const [bulkActionUsers] = useBulkActionUsersMutation();
  const { showToast } = useToast();

  // Selection state
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Filtering & Sorting State
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortOption, setSortOption] = useState("default");

  // View Modal State
  const [viewingUser, setViewingUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Bulk Action Confirmation Modal State
  const [bulkModal, setBulkModal] = useState({
    isOpen: false,
    action: "",
    confirmInput: "",
    isSubmitting: false,
  });

  const handleView = (user) => {
    setViewingUser(user);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingUser(null);
  };

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
      await bulkActionUsers({
        userIds: selectedUsers,
        action: bulkModal.action,
      }).unwrap();

      showToast(
        `Successfully performed bulk ${bulkModal.action} on ${selectedUsers.length} users!`,
        "success"
      );
      setSelectedUsers([]);
      closeBulkModal();
    } catch (err) {
      showToast(
        `Failed to perform bulk action: ${err?.data?.error || err.message || "Unknown error"}`,
        "error"
      );
      setBulkModal((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  // 1. Filter Users
  let processedUsers = (usersData || []).filter((user) => {
    // Role filter
    if (roleFilter !== "all" && user.role !== roleFilter) return false;
    // Status filter
    if (statusFilter !== "all") {
      const isUserActive = user.status?.toLowerCase() === "active";
      if (statusFilter === "active" && !isUserActive) return false;
      if (statusFilter === "inactive" && isUserActive) return false;
    }
    return true;
  });

  // 2. Sort Users
  processedUsers = [...processedUsers].sort((a, b) => {
    if (sortOption === "name_asc") {
      return (a.full_name || "").localeCompare(b.full_name || "");
    }
    if (sortOption === "name_desc") {
      return (b.full_name || "").localeCompare(a.full_name || "");
    }
    if (sortOption === "id_asc") {
      return (a.id || "").localeCompare(b.id || "");
    }
    if (sortOption === "id_desc") {
      return (b.id || "").localeCompare(a.id || "");
    }
    if (sortOption === "newest") {
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    }
    if (sortOption === "oldest") {
      return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
    }
    return 0; // Default
  });

  const columns = [
    {
      key: "profile_picture",
      label: "Avatar",
      width: "80px",
      render: (val, row) => {
        const initials = (row.full_name || "U")
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase();
        return (
          <div className="flex items-center justify-center">
            {val ? (
              <img
                src={val}
                alt={row.full_name}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 shadow-sm"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    row.full_name
                  )}&background=random`;
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 font-bold flex items-center justify-center text-sm shadow-sm border border-blue-200 dark:border-blue-800">
                {initials}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "id",
      label: "User ID",
      render: (val) => (
        <span className="font-mono text-xs font-semibold text-gray-500 dark:text-gray-400">
          {val || "-"}
        </span>
      ),
    },
    {
      key: "full_name",
      label: "Full Name",
      render: (_, row) => (
        <span className="font-semibold dark:text-gray-200">
          {row.full_name || "-"}
        </span>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (_, row) => (
        <span className="dark:text-gray-300">{row.email || "-"}</span>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (val, row) => {
        const roleColors = {
          admin: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200",
          teacher: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
          student: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
        };
        const roleDisplay = val || row.user_type || "N/A";
        const roleKey = roleDisplay.toLowerCase().includes("admin")
          ? "admin"
          : roleDisplay.toLowerCase().includes("teacher")
          ? "teacher"
          : "student";

        return (
          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            roleColors[roleKey] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
          }`}>
            {roleDisplay.charAt(0).toUpperCase() + roleDisplay.slice(1)}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (val) => {
        const status = val || "Active";
        const isActive = status.toLowerCase() === "active";

        return (
          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            isActive
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
          }`}>
            {status}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleView(row)}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
            title="View Details"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  // Custom header filters passed into the DataTable
  const filters = (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Role Dropdown Filter */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Role:</span>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="text-xs border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500/50 font-medium"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
        </select>
      </div>

      {/* Status Dropdown Filter */}
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

      {/* Quick Sorting Dropdown */}
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
          <option value="id_asc">ID: Low to High</option>
          <option value="id_desc">ID: High to Low</option>
          <option value="newest">Newest to Oldest</option>
          <option value="oldest">Oldest to Newest</option>
        </select>
      </div>
    </div>
  );

  // Custom Action Buttons for Bulk Operations (Standard premium styling matching students-requests)
  const customActions = selectedUsers.length > 0 ? (
    <>
      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 mr-1.5 self-center">
        {selectedUsers.length} selected
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




  if (isLoading) {
    return (
      <main className="flex-1 bg-gray-50 dark:bg-[#03002e]">
        <div className="w-full px-8 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-600 dark:text-gray-400">Loading users...</div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 bg-gray-50 dark:bg-[#03002e]">
        <div className="w-full px-8 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-red-600 dark:text-red-400">
              Error loading users: {(error as any)?.data?.error || (error as any)?.message || "Unknown error"}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="flex-1 bg-gray-50 dark:bg-[#03002e]">
        <div className="w-full px-8 py-6">
          <DataTable
            title="Users Management"
            columns={columns}
            data={processedUsers}
            showAddButton={false}
            onRowClick={handleView}
            getRowId={(row) => row.id}
            selectable={true}
            selectedItems={selectedUsers}
            onSelectionChange={setSelectedUsers}
            filters={filters}
            customActions={customActions}
          />
        </div>
      </main>

      {/* View User Modal */}
      {isViewModalOpen && viewingUser && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm"
          style={{ pointerEvents: "none" }}
        >
          <div
            className="absolute inset-0 bg-transparent"
            onClick={handleCloseViewModal}
            style={{ pointerEvents: "auto" }}
          />

          <div
            className={`relative rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 border-2 ${
              isDark ? "bg-gray-800/95 border-gray-600" : "bg-white/95 border-gray-300"
            }`}
            onClick={(e) => e.stopPropagation()}
            style={{ pointerEvents: "auto", backdropFilter: "blur(2px)" }}
          >
            <div className={`sticky top-0 border-b px-6 py-4 flex items-center justify-between ${
              isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}>
              <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                User Profile: {viewingUser.full_name}
              </h2>
              <button
                onClick={handleCloseViewModal}
                className={`transition-colors ${
                  isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile Image & Header section */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-100/50 dark:bg-gray-700/20 border border-gray-200 dark:border-gray-700">
                {viewingUser.profile_picture ? (
                  <img
                    src={resolveProfileImageUrl(viewingUser.profile_picture) || ""}
                    alt={viewingUser.full_name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 font-bold flex items-center justify-center text-xl border border-blue-200 dark:border-blue-800 shadow-sm">
                    {(viewingUser.full_name || "U")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {viewingUser.full_name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{viewingUser.email}</p>
                </div>
              </div>

              {/* Personal Information Section */}
              <div className={`p-5 rounded-lg border ${
                isDark ? "bg-gray-700/30 border-gray-600" : "bg-blue-50/50 border-blue-200"
              }`}>
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                  isDark ? "text-white" : "text-gray-800"
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  User Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-3 rounded-md ${isDark ? "bg-gray-800/50" : "bg-white"}`}>
                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}>Full Name</label>
                    <p className={`text-base font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                      {viewingUser.full_name || "N/A"}
                    </p>
                  </div>
                  <div className={`p-3 rounded-md ${isDark ? "bg-gray-800/50" : "bg-white"}`}>
                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}>Email</label>
                    <p className={`text-base ${isDark ? "text-gray-200" : "text-gray-900"}`}>
                      {viewingUser.email || "N/A"}
                    </p>
                  </div>
                  <div className={`p-3 rounded-md ${isDark ? "bg-gray-800/50" : "bg-white"}`}>
                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}>Role</label>
                    <p className={`text-base font-medium capitalize ${isDark ? "text-blue-300" : "text-blue-600"}`}>
                      {viewingUser.role || viewingUser.user_type || "N/A"}
                    </p>
                  </div>
                  <div className={`p-3 rounded-md ${isDark ? "bg-gray-800/50" : "bg-white"}`}>
                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}>Status</label>
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        viewingUser.status?.toLowerCase() === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      }`}>
                        {viewingUser.status || "Active"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Information Section */}
              <div className={`p-5 rounded-lg border ${
                isDark ? "bg-gray-700/30 border-gray-600" : "bg-red-50/50 border-red-200"
              }`}>
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                  isDark ? "text-white" : "text-gray-800"
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Security Information
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className={`p-3 rounded-md ${isDark ? "bg-gray-800/50" : "bg-white"}`}>
                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}>Password (Secured)</label>
                    <div className="flex items-center justify-between">
                      <p className={`text-base font-mono break-all ${isDark ? "text-gray-200" : "text-gray-900"}`}>
                        ••••••••••••••••
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Confirmation Modal */}
      {bulkModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50">
          <div
            className="absolute inset-0 backdrop-blur-sm"
            onClick={() => !bulkModal.isSubmitting && closeBulkModal()}
          />
          <div className={`relative w-full max-w-md rounded-lg shadow-lg overflow-hidden border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
            
            {/* Modal Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? "bg-gray-800/50 border-gray-700" : "bg-gray-50/50 border-gray-200"}`}>
              <h3 className={`text-lg font-bold capitalize flex items-center gap-2 ${isDark ? "text-white" : "text-gray-800"}`}>
                Confirm Bulk {bulkModal.action}
              </h3>
              <button
                onClick={() => !bulkModal.isSubmitting && closeBulkModal()}
                className={`p-1 rounded-lg transition-colors ${isDark ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
                disabled={bulkModal.isSubmitting}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className={`p-4 rounded-lg border mb-5 ${isDark ? "bg-gray-700/30 border-gray-600" : "bg-blue-50/50 border-blue-100"}`}>
                <p className={`text-sm leading-relaxed ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  You are about to <span className="font-extrabold underline capitalize">{bulkModal.action}</span> <span className="font-bold">{selectedUsers.length}</span> selected users. This action cannot be undone.
                </p>
              </div>
              
              <div className="space-y-2">
                <label className={`block text-xs font-bold uppercase tracking-wider ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  Type <span className="text-red-500 font-extrabold font-mono">CONFIRM</span> to verify:
                </label>
                <input
                  type="text"
                  value={bulkModal.confirmInput}
                  onChange={(e) => setBulkModal(prev => ({ ...prev, confirmInput: e.target.value }))}
                  placeholder="Type CONFIRM here"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-mono ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                      : "bg-white border-blue-200 text-blue-900 placeholder-gray-400"
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
                      ? "border-gray-600 hover:bg-gray-700 text-gray-300"
                      : "border-gray-300 hover:bg-gray-50 text-gray-600"
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
                      ? "bg-gray-400 dark:bg-gray-700 cursor-not-allowed opacity-50 shadow-none"
                      : "bg-[#010080] hover:bg-[#010080]/90 text-white"
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
