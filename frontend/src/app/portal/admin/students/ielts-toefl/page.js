"use client";

import { useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetIeltsToeflStudentsQuery } from "@/redux/api/ieltsToeflApi";
import { useGetClassesQuery } from "@/redux/api/classApi";
import { useGetSessionRequestsQuery } from "@/redux/api/sessionRequestApi";

export default function IELTSTOEFLStudentsPage() {
  const { isDark } = useDarkMode();
  const { data: ieltsStudents, isLoading, isError, error } = useGetIeltsToeflStudentsQuery();
  const { data: classes = [] } = useGetClassesQuery();
  const { data: sessionRequests = [] } = useGetSessionRequestsQuery();

  const filteredStudents = (ieltsStudents || []).filter(student =>
    student.status?.toLowerCase() === 'approved' && student.class_id
  );

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
          {`${row.firstName} ${row.lastName}`}
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
      key: "phone",
      label: "Phone",
      width: "150px",
      render: (row) => (
        <span className="text-gray-700 dark:text-gray-300">{row.phone}</span>
      ),
    },
    {
      key: "age",
      label: "Age",
      width: "80px",
      render: (row) => (
        <span className="text-gray-700 dark:text-gray-300">{row.age}</span>
      ),
    },
    {
      key: "gender",
      label: "Gender",
      width: "100px",
      render: (row) => (
        <span className="text-gray-700 dark:text-gray-300">{row.gender}</span>
      ),
    },
    {
      key: "location",
      label: "Location",
      width: "180px",
      render: (row) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900 dark:text-white">{row.city}</div>
          <div className="text-gray-500 dark:text-gray-400 text-xs">{row.country}</div>
        </div>
      ),
    },
    {
      key: "examType",
      label: "Exam Type",
      width: "120px",
      render: (row) => (
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${row.examType === "IELTS"
          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
          }`}>
          {row.examType}
        </span>
      ),
    },
    {
      key: "class_name",
      label: "Class",
      width: "140px",
      render: (row) => {
        // Find session requests for this student
        const studentRequests = sessionRequests.filter(r => r.student_id === row.student_id);
        const pendingRequest = studentRequests.find(r => r.status === 'pending');
        const rejectedRequest = !pendingRequest && studentRequests.find(r => r.status === 'rejected');

        const className = getClassName(row.class_id);

        if (pendingRequest) {
          return (
            <div className="flex justify-center">
              <span
                className="min-w-[120px] px-3 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center gap-1"
                title={`Sesssion Change Requested: ${pendingRequest.requested_session_type}`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                {className || "Pending Request"}
              </span>
            </div>
          );
        }

        if (rejectedRequest) {
          return (
            <div className="flex justify-center">
              <span
                className="min-w-[120px] px-3 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800 flex items-center justify-center gap-1"
                title={`Request Rejected: ${rejectedRequest.admin_response || 'No reason provided'}`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {className || "Request Rejected"}
              </span>
            </div>
          );
        }

        return (
          <div className="flex justify-center">
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
              {className}
            </span>
          </div>
        );
      },
    },
    {
      key: "verification_method",
      label: "Verification Method",
      width: "180px",
      render: (row) => (
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${row.verificationMethod === "Certificate"
          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
          }`}>
          {row.verificationMethod === "Certificate" ? "Certificate" : "Exam Booking"}
        </span>
      ),
    },
    {
      key: "certificateInfo",
      label: "Certificate Details",
      width: "200px",
      render: (row) => {
        if (row.verificationMethod === "Certificate") {
          return (
            <div className="text-sm space-y-1">
              <div className="font-semibold text-gray-900 dark:text-white">{row.certificateInstitution || "-"}</div>
              <div className="text-gray-500 dark:text-gray-400 text-xs">{row.certificateDate || "-"}</div>
            </div>
          );
        }
        return <span className="text-gray-400 dark:text-gray-500">-</span>;
      },
    },
    {
      key: "examBooking",
      label: "Exam Booking",
      width: "200px",
      render: (row) => {
        if (row.verificationMethod === "Exam Booking") {
          return (
            <div className="text-sm space-y-1">
              <div className="font-semibold text-gray-900 dark:text-white">{row.examBookingDate || "-"}</div>
              <div className="text-gray-500 dark:text-gray-400 text-xs">{row.examBookingTime || "-"}</div>
            </div>
          );
        }
        return <span className="text-gray-400 dark:text-gray-500">-</span>;
      },
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const statusColors = {
          "Verified": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
          "Pending Exam": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
          "Pending Review": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        };
        return (
          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[row.status] || "bg-gray-100 text-gray-800"}`}>
            {row.status}
          </span>
        );
      },
    },
    {
      key: "registrationDate",
      label: "Registration Date",
      render: (row) => {
        if (!row.registrationDate) return <span className="text-gray-400 dark:text-gray-500">-</span>;
        const date = new Date(row.registrationDate);
        return (
          <span className="text-gray-700 dark:text-gray-300">
            {date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
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
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
            title="View Details"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          {row.verificationMethod === "Certificate" && row.certificateDocument && (
            <button
              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
              title="View Certificate"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          )}
          {row.verificationMethod === "Exam Booking" && (
            <button
              className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 transition-colors p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20"
              title="View Exam Details"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          )}
          <button
            className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300 transition-colors p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20"
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
      <AdminHeader />
      <main className="flex-1 min-w-0 flex flex-col items-center overflow-y-auto overflow-x-hidden bg-gray-50 pt-20 transition-colors">
        <div className="w-full max-w-full px-4 sm:px-8 py-6 min-w-0 flex flex-col">
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
                  <p className="text-gray-600 dark:text-gray-400 text-lg">No active IELTS/TOEFL students assigned to classes</p>
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
