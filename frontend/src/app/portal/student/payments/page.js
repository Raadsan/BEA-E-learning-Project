"use client";

import { useEffect, useState } from "react";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useDarkMode } from "@/context/ThemeContext";

export default function StudentPaymentsPage() {
  const { isDark } = useDarkMode();
  const { data: user, isLoading: userLoading } = useGetCurrentUserQuery();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";
        const res = await fetch(`${baseUrl}/api/payments/student/${user.id}`);
        const json = await res.json().catch(() => ({}));
        if (res.ok && json.success) {
          setPayments(json.payments || []);
        } else {
          setError(json.error || "Failed to load payment history");
        }
      } catch (err) {
        setError(err.message || "Failed to load payment history");
      } finally {
        setLoading(false);
      }
    };

    if (user && !userLoading) {
      fetchPayments();
    }
  }, [user, userLoading]);

  const totalPaid = payments
    .filter((p) => p.status === "paid" || p.status === "completed")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return (
    <div
      className={`min-h-screen transition-colors ${
        isDark ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      <div className="max-w-5xl mx-auto p-6">
        <div
          className={`mb-6 p-6 rounded-xl shadow ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h1
            className={`text-2xl font-bold mb-2 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Payment History
          </h1>
          <p className={isDark ? "text-gray-300" : "text-gray-600"}>
            Track the payments linked to your registration and studies.
          </p>
          <p className="mt-3 text-sm font-medium text-green-600">
            Total amount paid: ${totalPaid.toFixed(2)}
          </p>
        </div>

        {userLoading || loading ? (
          <div
            className={`p-6 rounded-xl shadow ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <p className={isDark ? "text-gray-300" : "text-gray-700"}>
              Loading payment history...
            </p>
          </div>
        ) : error ? (
          <div
            className={`p-6 rounded-xl shadow border border-red-200 ${
              isDark ? "bg-red-900/20" : "bg-red-50"
            }`}
          >
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        ) : payments.length === 0 ? (
          <div
            className={`p-6 rounded-xl shadow ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <p className={isDark ? "text-gray-300" : "text-gray-700"}>
              You do not have any recorded payments yet.
            </p>
          </div>
        ) : (
          <div
            className={`overflow-x-auto rounded-xl shadow ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={isDark ? "bg-gray-700" : "bg-gray-50"}>
                <tr>
                  <Th>Date</Th>
                  <Th>Amount</Th>
                  <Th>Currency</Th>
                  <Th>Method</Th>
                  <Th>Status</Th>
                  <Th>Transaction ID</Th>
                </tr>
              </thead>
              <tbody className={isDark ? "bg-gray-800" : "bg-white"}>
                {payments.map((p) => (
                  <tr
                    key={p.id}
                    className={
                      isDark
                        ? "border-b border-gray-700 last:border-0"
                        : "border-b border-gray-100 last:border-0"
                    }
                  >
                    <Td>
                      {p.created_at
                        ? new Date(p.created_at).toLocaleString()
                        : "-"}
                    </Td>
                    <Td>${Number(p.amount || 0).toFixed(2)}</Td>
                    <Td>{p.currency || "USD"}</Td>
                    <Td className="capitalize">{p.method || "-"}</Td>
                    <Td>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          p.status === "paid" || p.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {p.status || "pending"}
                      </span>
                    </Td>
                    <Td>{p.provider_transaction_id || "-"}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Th({ children }) {
  return (
    <th
      scope="col"
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
    >
      {children}
    </th>
  );
}

function Td({ children }) {
  return (
    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
      {children}
    </td>
  );
}


