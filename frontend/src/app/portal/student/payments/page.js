"use client";

import { useRouter } from "next/navigation";
import DataTable from "@/components/DataTable";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useGetStudentPaymentsQuery } from "@/redux/api/paymentApi";
import Loader from "@/components/Loader";

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
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useGetCurrentUserQuery();
  const { data: payments = [], isLoading: paymentsLoading } = useGetStudentPaymentsQuery(user?.id, {
    skip: !user?.id,
  });

  const totalPaid = payments
    .filter((p) => p.status === "paid" || p.status === "completed")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  // Calculate payment status
  let isPaid = true;
  if (user?.approval_status === 'approved' && user?.paid_until) {
    const expiryDate = new Date(user.paid_until);
    const today = new Date();
    expiryDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    isPaid = expiryDate >= today;
  }

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
      value: user?.chosen_program || "None",
      icon: <IconBook />,
      color: "bg-purple-100",
      textColor: "text-purple-600"
    },
    {
      title: "Account Status",
      value: isPaid ? "Active" : "Expired",
      icon: <IconCheck />,
      color: isPaid ? "bg-green-100" : "bg-red-100",
      textColor: isPaid ? "text-green-600" : "text-red-600"
    }
  ];

  const columns = [
    {
      key: "created_at",
      label: "Date",
      render: (row) => (
        <span className="font-medium opacity-70">
          {row.created_at ? new Date(row.created_at).toLocaleDateString() : "-"}
        </span>
      )
    },
    {
      key: "method",
      label: "Method",
      render: (row) => (
        <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-widest ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'}`}>
          {row.method || "N/A"}
        </span>
      )
    },
    {
      key: "program_name",
      label: "Program",
      render: (row) => (
        <span className="font-semibold text-blue-600 dark:text-blue-400">
          {row.program_name || "Enrollment Fee"}
        </span>
      )
    },
    {
      key: "amount",
      label: "Amount Paid",
      render: (row) => (
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          ${Number(row.amount || 0).toFixed(2)}
        </span>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const status = row.status || "pending";
        return (
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status === "paid" || status === "completed"
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
            }`}>
            {status}
          </span>
        );
      }
    },
    {
      key: "action",
      label: "Receipt",
      render: () => (
        <button
          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all"
          title="Download Invoice"
        >
          <IconDownload />
        </button>
      )
    }
  ];

  if (userLoading || paymentsLoading) {
    return (
      <div className={`min-h-screen transition-colors pt-12 w-full px-6 sm:px-10 pb-20 ${isDark ? 'bg-[#0b0f19]' : 'bg-gray-50'}`}>
        <Loader fullPage />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors pt-12 w-full px-6 sm:px-10 pb-20 ${isDark ? 'bg-[#0b0f19]' : 'bg-gray-50'}`}>
      <div className="w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className={`text-4xl font-bold mb-4 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Payment History
            </h1>
            <p className={`text-lg font-medium opacity-60 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              View and manage your academic financial transactions and receipts
            </p>
          </div>

          {!isPaid && (
            <button
              onClick={() => router.push("/portal/student/payments/upgrade")}
              className="px-8 py-4 bg-[#010080] text-white hover:bg-blue-900 rounded-xl font-normal shadow-xl uppercase tracking-wider text-sm border-b-4 border-blue-900 active:border-b-0 active:translate-y-1 transition-all"
            >
              Upgrade Plan Now
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`rounded-2xl shadow-sm p-6 border transition-all ${isDark ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-100'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <span className={stat.textColor}>{stat.icon}</span>
                </div>
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
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

        {/* Table Container */}
        <div className="w-full">
          <DataTable
            title="Transaction Logs"
            columns={columns}
            data={payments}
            showAddButton={false}
            emptyMessage="No transaction history available."
          />
        </div>
      </div>
    </div>
  );
}
