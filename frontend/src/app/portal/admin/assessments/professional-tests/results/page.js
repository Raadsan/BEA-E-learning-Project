"use client";

import { useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";

export default function ProfessionalResultsPage() {
  // Sample data - replace with actual API call
  const [results] = useState([
    {
      id: 1,
      studentName: "Ahmed Hassan",
      testType: "IELTS",
      testDate: "2024-02-10",
      listening: 8.5,
      reading: 8.0,
      writing: 7.5,
      speaking: 8.0,
      overall: 8.0,
      status: "Passed"
    },
    {
      id: 2,
      studentName: "Fatima Ali",
      testType: "TOEFL",
      testDate: "2024-02-12",
      listening: 25,
      reading: 24,
      writing: 23,
      speaking: 24,
      overall: 96,
      status: "Passed"
    },
    {
      id: 3,
      studentName: "Mohamed Ibrahim",
      testType: "IELTS",
      testDate: "2024-02-15",
      listening: 6.5,
      reading: 6.0,
      writing: 5.5,
      speaking: 6.0,
      overall: 6.0,
      status: "Failed"
    },
  ]);

  const columns = [
    {
      key: "studentName",
      label: "Student Name",
    },
    {
      key: "testType",
      label: "Test Type",
    },
    {
      key: "testDate",
      label: "Test Date",
    },
    {
      key: "listening",
      label: "Listening",
    },
    {
      key: "reading",
      label: "Reading",
    },
    {
      key: "writing",
      label: "Writing",
    },
    {
      key: "speaking",
      label: "Speaking",
    },
    {
      key: "overall",
      label: "Overall Score",
      render: (row) => (
        <span className="font-bold text-gray-900 dark:text-white">{row.overall}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          row.status === "Passed" 
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
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
            title="Download Certificate"
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
    <>
      <AdminHeader />
      <main className="flex-1 overflow-y-auto bg-gray-50 mt-20 transition-colors">
        <div className="w-full px-8 py-6">
          <DataTable
            title="Professional Test Results"
            columns={columns}
            data={results}
            showAddButton={false}
          />
        </div>
      </main>
    </>
  );
}

