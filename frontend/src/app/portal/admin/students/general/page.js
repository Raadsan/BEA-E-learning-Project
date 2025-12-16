"use client";

import { useState, useMemo } from "react";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";
import { useGetStudentsQuery } from "@/redux/api/studentApi";
import { useGetSubprogramsQuery } from "@/redux/api/subprogramApi";
import { useDarkMode } from "@/context/ThemeContext";

export default function GeneralStudentsPage() {
  const { isDark } = useDarkMode();
  const { data: allStudents, isLoading, isError, error } = useGetStudentsQuery();
  const { data: subprograms = [] } = useGetSubprogramsQuery();

  // Filter students who have chosen_subprogram (General Program students) AND are approved
  const generalStudents = useMemo(() => {
    if (!allStudents) return [];
    return allStudents.filter(student =>
      student.chosen_subprogram &&
      student.chosen_subprogram.trim() !== "" &&
      student.approval_status === 'approved'
    );
  }, [allStudents]);

  // Get subprogram name for display
  const getSubprogramName = (subprogramId) => {
    if (!subprogramId) return "N/A";
    const subprogram = subprograms.find(sp => sp.id === parseInt(subprogramId));
    return subprogram ? subprogram.subprogram_name : `ID: ${subprogramId}`;
  };

  const columns = [
    {
      key: "full_name",
      label: "Full Name",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "phone",
      label: "Phone",
      render: (row) => row.phone || <span className="text-gray-400">-</span>,
    },
    {
      key: "age",
      label: "Age",
      render: (row) => row.age || <span className="text-gray-400">-</span>,
    },
    {
      key: "residency_country",
      label: "Country",
      render: (row) => row.residency_country || <span className="text-gray-400">-</span>,
    },
    {
      key: "residency_city",
      label: "City",
      render: (row) => row.residency_city || <span className="text-gray-400">-</span>,
    },
    {
      key: "chosen_program",
      label: "Program",
      render: (row) => row.chosen_program || <span className="text-gray-400">-</span>,
    },
    {
      key: "chosen_subprogram",
      label: "Subprogram",
      render: (row) => (
        <span className="font-semibold text-blue-600 dark:text-blue-400">
          {getSubprogramName(row.chosen_subprogram)}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Registration Date",
      render: (row) => {
        if (!row.created_at) return <span className="text-gray-400">-</span>;
        const date = new Date(row.created_at);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
            title="View Details"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
            title="Edit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
        <main className="flex-1 overflow-y-auto bg-gray-50 mt-20">
          <div className="w-full px-8 py-6">
            <div className="text-center py-12">
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading students...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-gray-50 mt-20">
          <div className="w-full px-8 py-6">
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400">Error loading students: {error?.data?.error || "Unknown error"}</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AdminHeader />
      <main className="flex-1 overflow-y-auto bg-gray-50 pt-20 transition-colors">
        <div className="w-full px-8 py-6">
          <DataTable
            title="General Program Students"
            columns={columns}
            data={generalStudents}
            showAddButton={false}
          />
        </div>
      </main>
    </>
  );
}

