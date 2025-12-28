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

const IconClock = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconDownload = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const IconCheck = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const IconAlert = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function StudentPaymentsPage() {
  const { isDark } = useDarkMode();
  const { data: user, isLoading: userLoading } = useGetCurrentUserQuery();
  const { data: payments = [], isLoading: paymentsLoading, error } = useGetStudentPaymentsQuery(user?.id, {
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
      <div className={`min-h-screen p-8 ${isDark ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-xs font-medium tracking-wide opacity-50 uppercase">Loading Records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 min-h-screen flex flex-col transition-colors ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <main className="flex-1 overflow-y-auto">
        <div className="py-6">

          {/* Header - OUTSIDE */}
          <div className="mb-8 pt-6">
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Payment History
            </h1>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              View and manage your academic financial transactions and receipts
            </p>
          </div>

          {/* Stats Cards - OUTSIDE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`rounded-xl shadow-md p-6 border transition-all ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <span className={stat.textColor}>{stat.icon}</span>
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {stat.title}
                    </p>
                    <p className={`text-xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Table Controls - Above the table header */}
          <div className="flex justify-between items-end mb-4 gap-4 flex-wrap">
            <div className="flex items-center text-sm text-gray-400">
              <span className="mr-2">Show</span>
              <select className={`px-2 py-1 rounded border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              <span className="ml-2">entries</span>
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search..."
                className={`w-full px-4 py-2 text-sm rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 font-light'
                  }`}
              />
            </div>
          </div>

          {/* Table Container - THE BOX */}
          <div className={`rounded-lg shadow-sm overflow-hidden border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>

            {/* Modern Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#010080] text-white">
                  <tr>
                    
                    <Th>Student Name</Th>
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
                      <td colSpan="8" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 italic">
                        No transaction history available.
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p.id} className={`transition-colors ${isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}`}>
                        
                        <Td>
                          <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{user?.full_name}</div>
                        </Td>
                        <Td>
                          <div className={`text-sm font-medium text-blue-600 dark:text-blue-400`}>
                            {p.program_name || "Enrollment Fee"}
                          </div>
                        </Td>
                        <Td className="text-gray-500">${Number(p.amount || 0).toFixed(2)}</Td>
                        <Td>
                          <span className="font-semibold text-emerald-600">
                            ${Number(p.amount || 0).toFixed(2)}
                          </span>
                        </Td>
                        <Td>
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600 font-medium'
                            }`}>
                            {p.method || "N/A"}
                          </span>
                        </Td>
                        <Td>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-semibold ${p.status === "paid" || p.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                            }`}>
                            <span className="flex items-center gap-1">
                              {p.status === "paid" || p.status === "completed" ? <IconCheck /> : null}
                              {p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : "Pending"}
                            </span>
                          </span>
                        </Td>
                        <Td>{p.created_at ? new Date(p.created_at).toLocaleDateString() : "-"}</Td>
                        <Td>
                          <button
                            className="p-2 text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
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
      </main>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="px-6 py-4 uppercase text-[10px] font-bold tracking-wider">
      {children}
    </th>
  );
}

function Td({ children, className = "" }) {
  const { isDark } = useDarkMode();
  return (
    <td className={`px-6 py-4 whitespace-nowrap text-[11px] border-b border-gray-50 dark:border-gray-700 ${isDark ? 'text-gray-300' : 'text-gray-600'
      } ${className}`}>
      {children}
    </td>
  );
}




