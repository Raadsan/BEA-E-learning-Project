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

  // Stats for the summary boxes
  const stats = [
    {
      title: "Total Amount Paid",
      value: `$${totalPaid.toFixed(2)}`,
      icon: <IconDollar />,
      color: "bg-green-100 text-green-700",
      darkColor: "bg-green-900/30 text-green-400"
    },
    {
      title: "Active Program",
      value: user?.chosen_program || "None",
      icon: <IconBook />,
      color: "bg-blue-100 text-blue-700",
      darkColor: "bg-blue-900/30 text-blue-400"
    },
    {
      title: "Outstanding Balance",
      value: "$0.00",
      icon: <IconClock />,
      color: "bg-orange-100 text-orange-700",
      darkColor: "bg-orange-900/30 text-orange-400"
    }
  ];

  if (userLoading || paymentsLoading) {
    return (
      <div className={`min-h-screen p-8 ${isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
        <div className="flex items-center justify-center h-64 text-[#010080]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors ${isDark ? "bg-gray-900" : "bg-gray-50"} p-4 md:p-8`}>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            Payment History
          </h1>
          <p className={`mt-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            View and manage all your financial transactions and receipts.
          </p>
        </div>

        {/* Summary Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`p-6 rounded-2xl shadow-sm border transition-all hover:shadow-md ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
                }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${isDark ? stat.darkColor : stat.color}`}>
                  {stat.icon}
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    {stat.title}
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
            <IconAlert />
            <p>Error loading payments: {error.message || "Unknown error"}</p>
          </div>
        )}

        {/* Payments Table */}
        <div className={`rounded-2xl shadow-sm border overflow-hidden ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className={`${isDark ? "bg-gray-700/50" : "bg-gray-50"} border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                  <Th>Date</Th>
                  <Th>Student Name</Th>
                  <Th>Program</Th>
                  <Th>Orig. Amount</Th>
                  <Th>Paid</Th>
                  <Th>Method</Th>
                  <Th>Curr.</Th>
                  <Th>Status</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-gray-700" : "divide-gray-100"}`}>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-gray-500 italic">
                      No payment records found.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                      <Td>{p.created_at ? new Date(p.created_at).toLocaleDateString() : "-"}</Td>
                      <Td className="font-medium">{user?.full_name}</Td>
                      <Td>{p.program_id || user?.chosen_program || "-"}</Td>
                      <Td className="text-gray-500">${Number(p.amount || 0).toFixed(2)}</Td>
                      <Td className="font-bold text-green-600">${Number(p.amount || 0).toFixed(2)}</Td>
                      <Td>
                        <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                          }`}>
                          {p.method || "-"}
                        </span>
                      </Td>
                      <Td className="text-xs">{p.currency || "USD"}</Td>
                      <Td>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${p.status === "paid" || p.status === "completed"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400"
                          }`}>
                          {p.status === "paid" || p.status === "completed" ? (
                            <IconCheck />
                          ) : (
                            <IconClock />
                          )}
                          <span className="capitalize">{p.status || "Pending"}</span>
                        </span>
                      </Td>
                      <Td>
                        <button className="p-2 text-[#010080] hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors group" title="Download Receipt">
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
    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
      {children}
    </th>
  );
}

function Td({ children, className = "" }) {
  const { isDark } = useDarkMode();
  return (
    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? "text-gray-300" : "text-gray-700"} ${className}`}>
      {children}
    </td>
  );
}


