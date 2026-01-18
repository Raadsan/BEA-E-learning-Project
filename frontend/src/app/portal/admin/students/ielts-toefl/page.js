"use client";

import { useState } from "react";
import DataTable from "@/components/DataTable";
import { useDarkMode } from "@/context/ThemeContext";
import {
  useGetIeltsToeflStudentsQuery,
  useApproveIeltsToeflStudentMutation,
  useRejectIeltsToeflStudentMutation
} from "@/redux/api/ieltsToeflApi";
import { useGetClassesQuery } from "@/redux/api/classApi";
import { useGetSessionRequestsQuery } from "@/redux/api/sessionRequestApi";
import { toast } from "react-hot-toast";

export default function IELTSTOEFLStudentsPage() {
  const { isDark } = useDarkMode();
  const { data: ieltsStudents, isLoading, isError, error } = useGetIeltsToeflStudentsQuery();
  const { data: classes = [] } = useGetClassesQuery();

  const [approveStudent] = useApproveIeltsToeflStudentMutation();
  const [rejectStudent] = useRejectIeltsToeflStudentMutation();
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredStudents = (ieltsStudents || []).filter(student => {
    if (statusFilter === "all") return true;
    return student.status?.toLowerCase() === statusFilter.toLowerCase();
  });

  const handleApprove = async (id) => {
    try {
      await approveStudent(id).unwrap();
      toast.success("Student approved successfully");
    } catch (err) {
      toast.error(err.data?.error || "Failed to approve student");
    }
  };

  const handleReject = async (id) => {
    if (window.confirm("Are you sure you want to reject this student?")) {
      try {
        await rejectStudent(id).unwrap();
        toast.success("Student rejected");
      } catch (err) {
        toast.error(err.data?.error || "Failed to reject student");
      }
    }
  };

  const getClassName = (classId) => {
    const cls = classes.find(c => c.id == classId);
    return cls ? cls.class_name : 'Unknown';
  };

  const columns = [
    {
      key: "student_id",
      label: "Student ID",
      width: "150px",
      render: (row) => (
        <span className="font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">
          {row.student_id || "N/A"}
        </span>
      ),
    },
    {
      key: "fullName",
      label: "Full Name",
      width: "180px",
      render: (row) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {`${row.first_name || ''} ${row.last_name || ''}`}
        </span>
      ),
    },
    {
      key: "email",
      label: "Email",
      width: "220px",
      render: (row) => (
        <span className="text-gray-700 dark:text-gray-300">{row.email}</span>
      ),
    },
    {
      key: "examType",
      label: "Exam Type",
      width: "120px",
      render: (row) => (
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${row.exam_type === "IELTS"
          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
          }`}>
          {row.exam_type}
        </span>
      ),
    },
    {
      key: "verification_method",
      label: "Verification",
      width: "150px",
      render: (row) => (
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${row.verification_method === "Certificate"
          ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
          : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
          }`}>
          {row.verification_method}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const s = (row.status || 'Pending').toLowerCase();
        const colors = {
          "approved": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
          "pending": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
          "rejected": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
          "paid": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        };
        return (
          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[s] || "bg-gray-100 text-gray-800"}`}>
            {row.status || 'Pending'}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2 items-center">
          {(row.status?.toLowerCase() === 'pending' || row.status?.toLowerCase() === 'paid') && (
            <>
              <button
                onClick={() => handleApprove(row.student_id)}
                className="text-green-600 hover:text-green-900 dark:text-green-400 p-1 rounded-md hover:bg-green-50"
                title="Approve"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                onClick={() => handleReject(row.student_id)}
                className="text-red-600 hover:text-red-900 dark:text-red-400 p-1 rounded-md hover:bg-red-50"
                title="Reject"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          )}
          <button
            className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
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

  return (
    <>
      <main className="flex-1 min-w-0 flex flex-col items-center bg-gray-50 transition-colors">
        <div className="w-full max-w-full px-4 sm:px-8 py-6 min-w-0 flex flex-col">
          <div className="mb-6 flex justify-between items-center">
            <div className="flex gap-2">
              {["All", "Pending", "Approved", "Paid", "Rejected"].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status.toLowerCase())}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === status.toLowerCase()
                    ? "bg-[#010080] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {(isLoading) ? (
            <div className="flex items-center justify-center py-10">
              <div className="text-center">Loading...</div>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-10">
              <div className="text-center text-red-500">Error loading data</div>
            </div>
          ) : (
            !filteredStudents || filteredStudents.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400 text-lg">No students found for this status</p>
                </div>
              </div>
            ) : (
              <DataTable
                title="IELTS / TOEFL Students"
                columns={columns}
                data={filteredStudents}
                showAddButton={false}
              />
            )
          )}
        </div>
      </main>
    </>
  );
}
