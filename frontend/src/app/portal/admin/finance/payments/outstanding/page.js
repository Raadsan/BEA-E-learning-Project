"use client";

import { useState } from "react";

import DataTable from "@/components/DataTable";

export default function OutstandingFeesPage() {
  // Sample data - replace with actual API call
  const [outstandingFees] = useState([
    {
      id: 1,
      studentName: "Ahmed Hassan",
      course: "Advanced English",
      totalFee: 1000,
      paidAmount: 500,
      outstandingAmount: 500,
      dueDate: "2024-02-20",
      daysOverdue: 0,
      status: "Outstanding"
    },
    {
      id: 2,
      studentName: "Fatima Ali",
      course: "Intermediate English",
      totalFee: 800,
      paidAmount: 400,
      outstandingAmount: 400,
      dueDate: "2024-02-15",
      daysOverdue: 5,
      status: "Overdue"
    },
    {
      id: 3,
      studentName: "Mohamed Ibrahim",
      course: "Beginner English",
      totalFee: 600,
      paidAmount: 300,
      outstandingAmount: 300,
      dueDate: "2024-02-10",
      daysOverdue: 10,
      status: "Overdue"
    },
    {
      id: 4,
      studentName: "Aisha Mohamed",
      course: "Advanced English",
      totalFee: 1000,
      paidAmount: 500,
      outstandingAmount: 500,
      dueDate: "2024-02-25",
      daysOverdue: 0,
      status: "Outstanding"
    },
  ]);

  const columns = [
    {
      key: "studentName",
      label: "Student Name",
    },
    {
      key: "course",
      label: "Course",
    },
    {
      key: "totalFee",
      label: "Total Fee",
      render: (row) => (
        <span className="text-gray-700 dark:text-gray-300">${row.totalFee.toFixed(2)}</span>
      ),
    },
    {
      key: "paidAmount",
      label: "Paid Amount",
      render: (row) => (
        <span className="text-green-600 dark:text-green-400">${row.paidAmount.toFixed(2)}</span>
      ),
    },
    {
      key: "outstandingAmount",
      label: "Outstanding Amount",
      render: (row) => (
        <span className="font-semibold text-red-600 dark:text-red-400">${row.outstandingAmount.toFixed(2)}</span>
      ),
    },
    {
      key: "dueDate",
      label: "Due Date",
    },
    {
      key: "daysOverdue",
      label: "Days Overdue",
      render: (row) => row.daysOverdue > 0 ? (
        <span className="text-red-600 dark:text-red-400 font-semibold">{row.daysOverdue} days</span>
      ) : (
        <span className="text-gray-500">-</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${row.status === "Overdue"
            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
          }`}>
          {row.status}
        </span>
      ),
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
            title="Send Reminder"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex-1 overflow-y-auto bg-gray-50 transition-colors">
        <div className="w-full px-8 py-6">
          <DataTable
            title="Outstanding / Overdue Fees"
            columns={columns}
            data={outstandingFees}
            showAddButton={false}
          />
        </div>
      </div>
    </>
  );
}

