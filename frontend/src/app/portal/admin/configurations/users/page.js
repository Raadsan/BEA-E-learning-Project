"use client";

import { useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";
import { useGetUsersQuery } from "@/redux/api/userApi";
import { useDarkMode } from "@/context/ThemeContext";

export default function UsersPage() {
  const { isDark } = useDarkMode();
  const { data: usersData, isLoading, error, refetch } = useGetUsersQuery();

  const users = usersData || [];

  const handleEdit = (user) => {
    console.log("Edit user:", user);
    // TODO: Implement edit functionality based on user_type
    // Navigate to appropriate edit page (admin, teacher, or student)
    if (user.user_type === 'admin') {
      // Navigate to admin edit page
      window.location.href = `/portal/admin/admins`;
    } else if (user.user_type === 'teacher') {
      // Navigate to teacher edit page
      window.location.href = `/portal/admin/teachers`;
    } else if (user.user_type === 'student') {
      // Navigate to student edit page
      window.location.href = `/portal/admin/students`;
    }
  };

  const handleDelete = (user) => {
    if (window.confirm(`Are you sure you want to delete this ${user.user_type}?`)) {
      console.log("Delete user:", user);
      // TODO: Implement delete functionality based on user_type
      alert("Delete functionality will be implemented based on user type");
    }
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
      render: (row) => (
        <span className="font-mono text-gray-600 dark:text-gray-400">••••••••</span>
      ),
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
        const roleKey = (roleDisplay.toLowerCase() || row.user_type || "").split(" ")[0];
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
      render: (row) => {
        const status = row.status || "active";
        return (
          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            status.toLowerCase() === "active" 
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
        <div className="flex gap-2 items-center">
          <button
            onClick={() => handleEdit(row)}
            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
            title="Edit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => handleDelete(row)}
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
      <>
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors">
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
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors">
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
      
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="w-full px-8 py-6">
          <DataTable
            title="Users Management"
            columns={columns}
            data={users}
            showAddButton={false}
          />
        </div>
      </main>
    </>
  );
}
