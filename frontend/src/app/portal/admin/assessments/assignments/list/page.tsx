"use client";

import { useState } from "react";

import DataTable from "@/components/DataTable";

export default function AssignmentListPage() {
  // Sample data - replace with actual API call
  const [assignments] = useState([
    {
      id: 1,
      title: "Essay Writing Assignment",
      course: "Advanced English",
      dueDate: "2024-02-15",
      status: "Active",
      submissions: 15,
      totalStudents: 20
    },
    {
      id: 2,
      title: "Grammar Quiz",
      course: "Intermediate English",
      dueDate: "2024-02-20",
      status: "Active",
      submissions: 8,
      totalStudents: 25
    },
    {
      id: 3,
      title: "Reading Comprehension",
      course: "Beginner English",
      dueDate: "2024-02-10",
      status: "Completed",
      submissions: 18,
      totalStudents: 18
    },
  ]);

  const columns = [
    {
      key: "title",
      label: "Assignment Title",
    },
    {
      key: "course",
      label: "Course",
    },
    {
      key: "dueDate",
      label: "Due Date",
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${row.status === "Active"
          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          }`}>
          {row.status}
        </span>
      ),
    },
    {
      key: "submissions",
      label: "Submissions",
      render: (row) => `${row.submissions}/${row.totalStudents}`,
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
            title="View"
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

  return (
    <>
      <main className="flex-1 overflow-y-auto bg-gray-50 transition-colors">
        <div className="w-full px-8 py-6">
          <DataTable
            title="Assignment List"
            columns={columns}
            data={assignments}
            showAddButton={true}
            onAddClick={() => window.location.href = "/portal/admin/assessments/assignments/create"}
          />
        </div>
      </main>
    </>
  );
}

