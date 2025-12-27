"use client";

import { useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";
import { useGetUsersQuery } from "@/redux/api/userApi";
import { useDarkMode } from "@/context/ThemeContext";

export default function UsersPage() {
  const { isDark } = useDarkMode();
  const { data: usersData, isLoading, error, refetch } = useGetUsersQuery();
  const [visiblePasswords, setVisiblePasswords] = useState(new Set());

  // View Modal State
  const [viewingUser, setViewingUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const users = usersData || [];

  const togglePasswordVisibility = (userId) => {
    setVisiblePasswords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleView = (user) => {
    setViewingUser(user);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingUser(null);
  };

  const columns = [
    {
      key: "full_name",
      label: "Full Name",
      render: (row) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {row.full_name || "-"}
        </span>
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
      key: "password",
      label: "Password",
      render: (row) => {
        const isVisible = visiblePasswords.has(row.id);
        const password = row.password || "";

        return (
          <div className="max-w-[200px]">
            <span
              className={`font-mono text-sm ${isVisible
                ? "text-gray-900 dark:text-gray-100 font-semibold"
                : "text-gray-500 dark:text-gray-400"
                }`}
              title={password || "No password"}
            >
              {isVisible ? (password || "N/A") : "••••••••"}
            </span>
          </div>
        );
      },
    },
    {
      key: "role",
      label: "Role",
      render: (row) => {
        const roleColors = {
          admin: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
          teacher: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
          student: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        };
        const roleDisplay = row.role || row.user_type || "N/A";
        // Simple normalization for role key to match colors
        const roleKey = (roleDisplay.toLowerCase().includes('admin') ? 'admin' :
          roleDisplay.toLowerCase().includes('teacher') ? 'teacher' :
            roleDisplay.toLowerCase().includes('student') ? 'student' : 'student');

        return (
          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${roleColors[roleKey] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
            }`}>
            {roleDisplay.charAt(0).toUpperCase() + roleDisplay.slice(1)}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const status = row.status || "active";
        return (
          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${status.toLowerCase() === "active" || status.toLowerCase() === 'approved'
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
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

  if (isLoading) {
    return (
      <>
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#03002e] mt-6">
          <div className="w-full px-8 py-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-600 dark:text-gray-400">Loading users...</div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#03002e] mt-6">
          <div className="w-full px-8 py-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-red-600 dark:text-red-400">
                Error loading users: {error?.data?.error || error?.message || "Unknown error"}
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AdminHeader />
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#03002e] mt-20">
        <div className="w-full px-8 py-6">
          <DataTable
            title="Users Management"
            columns={columns}
            data={users}
            showAddButton={false}
            onRowClick={togglePasswordVisibility}
            getRowId={(row) => row.id}
          />
        </div>
      </main>

      {/* View User Modal */}
      {isViewModalOpen && viewingUser && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ pointerEvents: 'none' }}
        >
          <div
            className="absolute inset-0 bg-transparent"
            onClick={handleCloseViewModal}
            style={{ pointerEvents: 'auto' }}
          />

          <div
            className={`relative rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 border-2 ${isDark ? 'bg-gray-800/95 border-gray-600' : 'bg-white/95 border-gray-300'
              }`}
            onClick={(e) => e.stopPropagation()}
            style={{ pointerEvents: 'auto', backdropFilter: 'blur(2px)' }}
          >
            <div className={`sticky top-0 border-b px-6 py-4 flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'
                }`}>
                User Profile: {viewingUser.full_name}
              </h2>
              <button
                onClick={handleCloseViewModal}
                className={`transition-colors ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Personal Information Section */}
              <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-blue-50/50 border-blue-200'
                }`}>
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'
                  }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  User Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>Full Name</label>
                    <p className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {viewingUser.full_name || 'N/A'}
                    </p>
                  </div>
                  <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>Email</label>
                    <p className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                      {viewingUser.email || 'N/A'}
                    </p>
                  </div>
                  <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>Role</label>
                    <p className={`text-base font-medium capitalize ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                      {viewingUser.role || viewingUser.user_type || 'N/A'}
                    </p>
                  </div>
                  <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${(viewingUser.status && viewingUser.status.toLowerCase() === 'active') ||
                        (viewingUser.status && viewingUser.status.toLowerCase() === 'approved')
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                      {viewingUser.status || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-purple-50/50 border-purple-200'
                }`}>
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'
                  }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Security Information
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>Password</label>
                    <p className={`font-mono text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                      {viewingUser.password || '••••••••'}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </>
  );
}

