"use client";

import { useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";

export default function SubmissionStatusPage() {
  // Sample data - replace with actual API call
  const [submissions] = useState([
    {
      id: 1,
      studentName: "Ahmed Hassan",
      assignmentTitle: "Essay Writing Assignment",
      submittedDate: "2024-02-14",
      status: "Submitted",
      grade: "-",
      course: "Advanced English"
    },
    {
      id: 2,
      studentName: "Fatima Ali",
      assignmentTitle: "Grammar Quiz",
      submittedDate: "2024-02-18",
      status: "Graded",
      grade: "A",
      course: "Intermediate English"
    },
    {
      id: 3,
      studentName: "Mohamed Ibrahim",
      assignmentTitle: "Reading Comprehension",
      submittedDate: "2024-02-09",
      status: "Graded",
      grade: "B+",
      course: "Beginner English"
    },
    {
      id: 4,
      studentName: "Aisha Mohamed",
      assignmentTitle: "Essay Writing Assignment",
      submittedDate: "2024-02-13",
      status: "Pending Review",
      grade: "-",
      course: "Advanced English"
    },
  ]);

  const columns = [
    {
      key: "studentName",
      label: "Student Name",
    },
    {
      key: "assignmentTitle",
      label: "Assignment",
    },
    {
      key: "course",
      label: "Course",
    },
    {
      key: "submittedDate",
      label: "Submitted Date",
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const statusColors = {
          "Submitted": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
          "Graded": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
          "Pending Review": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        };
        return (
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[row.status] || "bg-gray-100 text-gray-800"}`}>
            {row.status}
          </span>
        );
      },
    },
    {
      key: "grade",
      label: "Grade",
      render: (row) => row.grade !== "-" ? (
        <span className="font-semibold text-gray-900 dark:text-white">{row.grade}</span>
      ) : (
        <span className="text-gray-400">-</span>
      ),
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
          {row.status === "Submitted" && (
            <button
              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
              title="Grade"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
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
            title="Assignment Submissions"
            columns={columns}
            data={submissions}
            showAddButton={false}
          />
        </div>
      </main>
    </>
  );
}

