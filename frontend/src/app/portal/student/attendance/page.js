"use client";

import { useEffect, useState } from "react";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useDarkMode } from "@/context/ThemeContext";

export default function AttendancePage() {
  const { isDark } = useDarkMode();
  const { data: user, isLoading: userLoading } = useGetCurrentUserQuery();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";
        const res = await fetch(
          `${baseUrl}/api/attendance/student/${user.id}`,
          {
            headers: {
              Authorization:
                typeof window !== "undefined"
                  ? `Bearer ${localStorage.getItem("token") || ""}`
                  : "",
            },
          }
        );
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(json.error || "Failed to load attendance");
        }
        setRecords(json.records || []);
      } catch (err) {
        setError(err.message || "Failed to load attendance");
      } finally {
        setLoading(false);
      }
    };

    if (!userLoading) {
      fetchAttendance();
    }
  }, [user, userLoading]);

  const bg = isDark ? "bg-gray-900" : "bg-gray-100";

  return (
    <div className={`min-h-screen ${bg}`}>
      <div className="max-w-5xl mx-auto p-6">
        <div
          className={`mb-6 p-6 rounded-xl shadow ${
            isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"
          }`}
        >
          <h1 className="text-2xl font-bold mb-2">Attendance</h1>
          <p className={isDark ? "text-gray-300" : "text-gray-600"}>
            Your recorded attendance by date and class.
          </p>
        </div>

        {userLoading || loading ? (
          <Card isDark={isDark}>Loading attendance records...</Card>
        ) : error ? (
          <Card isDark={isDark} error>
            {error}
          </Card>
        ) : records.length === 0 ? (
          <Card isDark={isDark}>No attendance records have been saved yet.</Card>
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
                  <Th>Class ID</Th>
                  <Th>Hour 1</Th>
                  <Th>Hour 2</Th>
                </tr>
              </thead>
              <tbody className={isDark ? "bg-gray-800" : "bg-white"}>
                {records.map((r) => (
                  <tr
                    key={r.id}
                    className={
                      isDark
                        ? "border-b border-gray-700 last:border-0"
                        : "border-b border-gray-100 last:border-0"
                    }
                  >
                    <Td>
                      {r.date ? new Date(r.date).toLocaleDateString() : "-"}
                    </Td>
                    <Td>{r.class_id}</Td>
                    <Td>{r.hour1 ? "Present" : "Absent"}</Td>
                    <Td>{r.hour2 ? "Present" : "Absent"}</Td>
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

function Card({ children, isDark, error }) {
  return (
    <div
      className={`p-6 rounded-xl shadow ${
        error
          ? isDark
            ? "bg-red-900/20 border border-red-500 text-red-200"
            : "bg-red-50 border border-red-200 text-red-700"
          : isDark
          ? "bg-gray-800 text-gray-100"
          : "bg-white text-gray-800"
      }`}
    >
      <p className="text-sm">{children}</p>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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


