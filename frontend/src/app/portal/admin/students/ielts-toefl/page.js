"use client";

import { useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetIeltsToeflStudentsQuery } from "@/redux/api/ieltsToeflApi";

export default function IELTSTOEFLStudentsPage() {
  const { isDark } = useDarkMode();
  const { data: ieltsStudents, isLoading, isError, error } = useGetIeltsToeflStudentsQuery();

  const columns = [
    {
      key: "fullName",
      label: "Full Name",
      render: (row) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {`${row.first_name} ${row.last_name}`}
        </span>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (row) => (
        <span className="text-gray-700 dark:text-gray-300">{row.email}</span>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (row) => (
        <span className="text-gray-700 dark:text-gray-300">{row.phone}</span>
      ),
    },
    {
      key: "age",
      label: "Age",
      render: (row) => (
        <span className="text-gray-700 dark:text-gray-300">{row.age}</span>
      ),
    },
    {
      key: "gender",
      label: "Gender",
      render: (row) => (
        <span className="text-gray-700 dark:text-gray-300">{row.gender}</span>
      ),
    },
    {
      key: "location",
      label: "Location",
      render: (row) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900 dark:text-white">{row.residency_city}</div>
          <div className="text-gray-500 dark:text-gray-400 text-xs">{row.residency_country}</div>
        </div>
      ),
    },
    {
      key: "exam_type",
      label: "Exam Type",
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
      label: "Verification Method",
      render: (row) => (
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${row.verification_method === "Certificate"
          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
          }`}>
          {row.verification_method}
        </span>
      ),
    },
    {
      key: "certificateInfo",
      label: "Certificate Details",
      render: (row) => {
        if (row.verification_method === "Certificate") {
          return (
            <div className="text-sm space-y-1">
              <div className="font-semibold text-gray-900 dark:text-white">{row.certificate_institution || "-"}</div>
              <div className="text-gray-500 dark:text-gray-400 text-xs">{row.certificate_date || "-"}</div>
            </div>
          );
        }
        return <span className="text-gray-400 dark:text-gray-500">-</span>;
      },
    },
    {
      key: "examBooking",
      label: "Exam Booking",
      render: (row) => {
        if (row.verification_method === "Exam Booking") {
          return (
            <div className="text-sm space-y-1">
              <div className="font-semibold text-gray-900 dark:text-white">{row.exam_booking_date || "-"}</div>
              <div className="text-gray-500 dark:text-gray-400 text-xs">{row.exam_booking_time || "-"}</div>
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
          "Pending": "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
        };
        return (
          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[row.status] || "bg-gray-100 text-gray-800"}`}>
            {row.status}
          </span>
        );
      },
    },
    {
      key: "registration_date",
      label: "Registration Date",
      render: (row) => {
        if (!row.registration_date) return <span className="text-gray-400 dark:text-gray-500">-</span>;
        const date = new Date(row.registration_date);
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
          {row.verification_method === "Certificate" && row.certificate_document && (
            <button
              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
              title="View Certificate"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          )}
          {row.verification_method === "Exam Booking" && (
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
      <main className="flex-1 overflow-y-auto bg-gray-50 pt-20 transition-colors">
        <div className="w-full px-8 py-6">
          {(isLoading) ? (
            <div className="text-center py-10">Loading...</div>
          ) : isError ? (
            <div className="text-center py-10 text-red-500">Error loading data</div>
          ) : (
            !ieltsStudents || ieltsStudents.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-600 dark:text-gray-400 text-lg">IELTS/TOEFL students not registered</p>
              </div>
            ) : (
              <DataTable
                title="IELTS / TOEFL Students"
                columns={columns}
                data={ieltsStudents}
                showAddButton={false}
              />
            )
          )}
        </div>
      </main>
    </>
  );
}

