"use client";

import { useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";
import { useDarkMode } from "@/context/ThemeContext";

export default function IELTSTOEFLStudentsPage() {
  const { isDark } = useDarkMode();
  
  // Sample data - Replace with actual API call when backend is ready
  // This should come from a separate IELTS/TOEFL registrations table
  const [ieltsStudents] = useState([
    {
      id: 1,
      firstName: "Ahmed",
      lastName: "Hassan",
      email: "ahmed.hassan@example.com",
      phone: "+252 61 1234567",
      age: 25,
      gender: "Male",
      country: "Somalia",
      city: "Mogadishu",
      examType: "IELTS",
      verificationMethod: "Certificate",
      certificateInstitution: "British Council",
      certificateDate: "2023-06-15",
      certificateDocument: "certificate_ahmed.pdf",
      examBookingDate: null,
      examBookingTime: null,
      registrationDate: "2024-02-10",
      status: "Verified"
    },
    {
      id: 2,
      firstName: "Fatima",
      lastName: "Ali",
      email: "fatima.ali@example.com",
      phone: "+252 61 2345678",
      age: 22,
      gender: "Female",
      country: "Somalia",
      city: "Hargeisa",
      examType: "TOEFL",
      verificationMethod: "Exam Booking",
      certificateInstitution: null,
      certificateDate: null,
      certificateDocument: null,
      examBookingDate: "2024-03-15",
      examBookingTime: "10:00 AM",
      registrationDate: "2024-02-12",
      status: "Pending Exam"
    },
    {
      id: 3,
      firstName: "Mohamed",
      lastName: "Ibrahim",
      email: "mohamed.ibrahim@example.com",
      phone: "+252 61 3456789",
      age: 28,
      gender: "Male",
      country: "Somalia",
      city: "Kismayo",
      examType: "IELTS",
      verificationMethod: "Certificate",
      certificateInstitution: "IDP Education",
      certificateDate: "2023-12-20",
      certificateDocument: "certificate_mohamed.pdf",
      examBookingDate: null,
      examBookingTime: null,
      registrationDate: "2024-02-15",
      status: "Verified"
    },
    {
      id: 4,
      firstName: "Aisha",
      lastName: "Mohamed",
      email: "aisha.mohamed@example.com",
      phone: "+252 61 4567890",
      age: 24,
      gender: "Female",
      country: "Somalia",
      city: "Bosaso",
      examType: "IELTS",
      verificationMethod: "Exam Booking",
      certificateInstitution: null,
      certificateDate: null,
      certificateDocument: null,
      examBookingDate: "2024-03-20",
      examBookingTime: "02:00 PM",
      registrationDate: "2024-02-18",
      status: "Pending Exam"
    },
  ]);

  const columns = [
    {
      key: "fullName",
      label: "Full Name",
      render: (row) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {`${row.firstName} ${row.lastName}`}
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
          <div className="font-medium text-gray-900 dark:text-white">{row.city}</div>
          <div className="text-gray-500 dark:text-gray-400 text-xs">{row.country}</div>
        </div>
      ),
    },
    {
      key: "examType",
      label: "Exam Type",
      render: (row) => (
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          row.examType === "IELTS" 
            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" 
            : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
        }`}>
          {row.examType}
        </span>
      ),
    },
    {
      key: "verificationMethod",
      label: "Verification Method",
      render: (row) => (
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          row.verificationMethod === "Certificate" 
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
      <main className="flex-1 overflow-y-auto bg-gray-50 mt-20 transition-colors">
        <div className="w-full px-8 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">IELTS / TOEFL Students</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage students registered for IELTS and TOEFL exam preparation programs</p>
          </div>
          <DataTable
            title=""
            columns={columns}
            data={ieltsStudents}
            showAddButton={false}
          />
        </div>
      </main>
    </>
  );
}

