"use client";

import { useEffect, useState } from "react";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useDarkMode } from "@/context/ThemeContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import DataTable from "@/components/DataTable";

export default function AttendancePage() {
  const { isDark } = useDarkMode();
  const { data: user, isLoading: userLoading } = useGetCurrentUserQuery();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTable, setShowTable] = useState(false);

  // Calculate attendance statistics
  const attendanceStats = records.reduce((acc, record) => {
    const hour1Present = record.hour1 ? 1 : 0;
    const hour2Present = record.hour2 ? 1 : 0;
    const totalPresent = hour1Present + hour2Present;
    const totalPossible = 2; // 2 hours per day

    acc.totalDays += 1;
    acc.presentHours += totalPresent;
    acc.absentHours += (totalPossible - totalPresent);
    acc.totalHours += totalPossible;

    return acc;
  }, { totalDays: 0, presentHours: 0, absentHours: 0, totalHours: 0 });

  // Pie chart data
  const pieData = [
    { name: 'Present', value: attendanceStats.presentHours, color: '#10B981' },
    { name: 'Absent', value: attendanceStats.absentHours, color: '#EF4444' }
  ];

  // Table columns for detailed attendance
  const columns = [
    { label: "Date", key: "date", render: (row) => row.date ? new Date(row.date).toLocaleDateString() : "-" },
    { label: "Student", key: "student_name", render: (row) => user?.full_name || "N/A" },
    { label: "Class Name", key: "class_name", render: (row) => row.class_name || "N/A" },
    { label: "Course", key: "course_title", render: (row) => row.course_title || "N/A" },
    { label: "Program", key: "program_name", render: (row) => row.program_name || "N/A" },
    { label: "Hour 1", key: "hour1", render: (row) => row.hour1 ? "Present" : "Absent" },
    { label: "Hour 2", key: "hour2", render: (row) => row.hour2 ? "Present" : "Absent" }
  ];

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
    <div className={`min-h-screen transition-colors ${bg}`}>
      <div className="py-6">
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
          <div className="space-y-6">
            {/* Attendance Overview */}
            <div className={`p-6 rounded-xl shadow ${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
              <h2 className="text-xl font-semibold mb-4">Attendance Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className={`p-4 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
                  <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Total Days</div>
                  <div className="text-2xl font-bold">{attendanceStats.totalDays}</div>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
                  <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Present Hours</div>
                  <div className="text-2xl font-bold text-green-600">{attendanceStats.presentHours}</div>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
                  <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Absent Hours</div>
                  <div className="text-2xl font-bold text-red-600">{attendanceStats.absentHours}</div>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      onClick={() => setShowTable(!showTable)}
                      style={{ cursor: 'pointer' }}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} hours`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <p className={`text-center mt-2 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Click on the chart to {showTable ? 'hide' : 'show'} detailed attendance table
                </p>
              </div>
            </div>

            {/* Detailed Attendance Table */}
            {showTable && (
              <div className={`p-6 rounded-xl shadow ${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
                <DataTable
                  title="Detailed Attendance Records"
                  columns={columns}
                  data={records}
                  showAddButton={false}
                />
              </div>
            )}
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


