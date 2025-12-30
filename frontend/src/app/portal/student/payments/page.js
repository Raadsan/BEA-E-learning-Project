"use client";

import { useDarkMode } from "@/context/ThemeContext";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useGetStudentPaymentsQuery } from "@/redux/api/paymentApi";

// Icon Components for consistent look
const IconDollar = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 .895-4 2s1.79 2 4 2 4 .895 4 2-1.79 2-4 2m0-8c2.21 0 4 .895 4 2m-4-2V6m0 8v2m8-4a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconBook = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const IconCheck = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const IconDownload = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

export default function StudentPaymentsPage() {
  const { isDark } = useDarkMode();
  const { data: user, isLoading: userLoading } = useGetCurrentUserQuery();
  const { data: payments = [], isLoading: paymentsLoading } = useGetStudentPaymentsQuery(user?.id, {
    skip: !user?.id,
  });

  const totalPaid = payments
    .filter((p) => p.status === "paid" || p.status === "completed")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  // Stats for the summary boxes (Refined design)
  const stats = [
    {
      title: "Total Amount Paid",
      value: `$${totalPaid.toFixed(2)}`,
      icon: <IconDollar />,
      color: "bg-blue-100",
      textColor: "text-blue-600"
    },
    {
      title: "Enrolled Program",
      value: payments[0]?.program_name || user?.chosen_program || "None",
      icon: <IconBook />,
      color: "bg-purple-100",
      textColor: "text-purple-600"
    },
    {
      title: "Recent Status",
      value: payments[0]?.status ? (payments[0].status.charAt(0).toUpperCase() + payments[0].status.slice(1)) : "Clean",
      icon: <IconCheck />,
      color: "bg-green-100",
      textColor: "text-green-600"
    }
  ];

  if (userLoading || paymentsLoading) {
    return (
      <div className={`min-h-screen transition-colors pt-12 w-full px-6 sm:px-10 pb-20 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center h-[40vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-xs font-bold tracking-wide opacity-50 uppercase">Loading Records...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors pt-12 w-full px-6 sm:px-10 pb-20 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="w-full">
        {/* Header */}
        <div className="mb-12">
          <h1 className={`text-4xl font-bold mb-4 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Payment History
          </h1>
          <p className={`text-lg font-medium opacity-60 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            View and manage your academic financial transactions and receipts
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`rounded-2xl shadow-sm p-6 border transition-all ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <span className={stat.textColor}>{stat.icon}</span>
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {stat.title}
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table Container */}
        <div className={`rounded-2xl shadow-sm overflow-hidden border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#010080] text-white">
                <tr>
                  <Th>Program</Th>
                  <Th>Fee</Th>
                  <Th>Paid</Th>
                  <Th>Method</Th>
                  <Th>Status</Th>
                  <Th>Date</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 italic font-medium">
                      No transaction history available.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className={`transition-colors ${isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}`}>
                      <Td>
                        <div className="font-bold text-sm text-blue-600 dark:text-blue-400">
                          {p.program_name || "Enrollment Fee"}
                        </div>
                      </Td>
                      <Td className="opacity-60 font-medium">${Number(p.amount || 0).toFixed(2)}</Td>
                      <Td>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          ${Number(p.amount || 0).toFixed(2)}
                        </span>
                      </Td>
                      <Td>
                        <span className={`px-2 py-1 rounded text-[10px] uppercase font-black tracking-widest ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                          {p.method || "N/A"}
                        </span>
                      </Td>
                      <Td>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${p.status === "paid" || p.status === "completed"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}>
                          {p.status ? p.status : "Pending"}
                        </span>
                      </Td>
                      <Td className="font-medium opacity-60">{p.created_at ? new Date(p.created_at).toLocaleDateString() : "-"}</Td>
                      <Td>
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all"
                          title="Download Invoice"
                        >
                          <IconDownload />
                        </button>
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="px-6 py-5 uppercase text-[10px] font-black tracking-widest">
      {children}
    </th>
  );
}

function Td({ children, className = "" }) {
  const { isDark } = useDarkMode();
  return (
    <td className={`px-6 py-5 whitespace-nowrap text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'} ${className}`}>
      {children}
    </td>
  );
}
