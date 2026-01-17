"use client";

import { useState } from "react";

import DataTable from "@/components/DataTable";

export default function PaymentHistoryPage() {
  // Sample data - replace with actual API call
  const [payments] = useState([
    {
      id: 1,
      studentName: "Ahmed Hassan",
      paymentDate: "2024-02-01",
      amount: 500,
      paymentMethod: "Bank Transfer",
      transactionId: "TXN-2024-001",
      status: "Completed",
      course: "Advanced English"
    },
    {
      id: 2,
      studentName: "Fatima Ali",
      paymentDate: "2024-02-05",
      amount: 400,
      paymentMethod: "Cash",
      transactionId: "TXN-2024-002",
      status: "Completed",
      course: "Intermediate English"
    },
    {
      id: 3,
      studentName: "Mohamed Ibrahim",
      paymentDate: "2024-02-10",
      amount: 300,
      paymentMethod: "Mobile Money",
      transactionId: "TXN-2024-003",
      status: "Pending",
      course: "Beginner English"
    },
    {
      id: 4,
      studentName: "Aisha Mohamed",
      paymentDate: "2024-02-12",
      amount: 500,
      paymentMethod: "Bank Transfer",
      transactionId: "TXN-2024-004",
      status: "Completed",
      course: "Advanced English"
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
      key: "paymentDate",
      label: "Payment Date",
    },
    {
      key: "amount",
      label: "Amount",
      render: (row) => (
        <span className="font-semibold text-gray-900 dark:text-white">${row.amount.toFixed(2)}</span>
      ),
    },
    {
      key: "paymentMethod",
      label: "Payment Method",
    },
    {
      key: "transactionId",
      label: "Transaction ID",
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${row.status === "Completed"
          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
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
            title="View Receipt"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
          <button
            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
            title="Download"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 transition-colors">
      <div className="w-full px-8 py-6">
        <DataTable
          title="Payment History"
          columns={columns}
          data={payments}
          showAddButton={false}
        />
      </div>
    </div>
}

