"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import { useDarkMode } from "@/context/ThemeContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import DataTable from "@/components/DataTable";

export default function StudentDetailPage() {
  const { isDark } = useDarkMode();
  const router = useRouter();
  const params = useParams();
  const studentId = params.id;

  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";
        const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

        // Fetch student details
        const studentRes = await fetch(`${baseUrl}/api/students/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!studentRes.ok) throw new Error("Failed to fetch student details");
        const studentData = await studentRes.json();
        setStudent(studentData);

        // Fetch attendance
        const attendanceRes = await fetch(`${baseUrl}/api/attendance/student/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (attendanceRes.ok) {
          const attendanceData = await attendanceRes.json();
          setAttendance(attendanceData.records || []);
        }

        // Fetch payments
        const paymentsRes = await fetch(`${baseUrl}/api/payments/student/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (paymentsRes.ok) {
          const paymentsData = await paymentsRes.json();
          setPayments(paymentsData.payments || []);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchStudentData();
    }
  }, [studentId]);

  // Calculate attendance statistics
  const attendanceStats = attendance.reduce((acc, record) => {
    const hour1Present = record.hour1 ? 1 : 0;
    const hour2Present = record.hour2 ? 1 : 0;
    const totalPresent = hour1Present + hour2Present;
    const totalPossible = 2;

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

  // Attendance table columns
  const attendanceColumns = [
    { label: "Date", key: "date", render: (row) => row.date ? new Date(row.date).toLocaleDateString() : "-" },
    { label: "Student", key: "student_name", render: (row) => student?.full_name || "N/A" },
    { label: "Class Name", key: "class_name", render: (row) => row.class_name || "N/A" },
    { label: "Course", key: "course_title", render: (row) => row.course_title || "N/A" },
    { label: "Program", key: "program_name", render: (row) => row.program_name || "N/A" },
    { label: "Hour 1", key: "hour1", render: (row) => row.hour1 ? "Present" : "Absent" },
    { label: "Hour 2", key: "hour2", render: (row) => row.hour2 ? "Present" : "Absent" }
  ];

  // Payment table columns
  const paymentColumns = [
    { label: "Date", key: "payment_date", render: (row) => row.payment_date ? new Date(row.payment_date).toLocaleDateString() : "-" },
    { label: "Amount", key: "amount", render: (row) => `$${row.amount || 0}` },
    { label: "Method", key: "payment_method" },
    {
      label: "Status", key: "status", render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === 'completed' ? 'bg-green-100 text-green-800' :
          row.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
          {row.status || 'Pending'}
        </span>
      )
    }
  ];

  if (loading) {
    return (
      <>
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="w-full px-8 py-6">
            <div className="text-center py-12">
              <p className={`text-gray-600 dark:text-gray-400`}>Loading student details...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error || !student) {
    return (
      <>
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="w-full px-8 py-6">
            <div className="text-center py-12">
              <p className={`text-red-600 dark:text-red-400`}>{error || "Student not found"}</p>
              <button
                onClick={() => router.back()}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Go Back
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="w-full px-8 py-6">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>

          {/* Student Header */}
          <div className={`mb-6 p-6 rounded-xl shadow ${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">{student.full_name}</h1>
                <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  {student.email} • {student.phone || 'No phone'}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${student.approval_status === 'approved' ? 'bg-green-100 text-green-800' :
                student.approval_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                {student.approval_status || 'Pending'}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
              {['overview', 'attendance', 'payments'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === tab
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className={`p-6 rounded-xl shadow ${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
                <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Full Name:</span>
                    <span>{student.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Email:</span>
                    <span>{student.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Phone:</span>
                    <span>{student.phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Sex:</span>
                    <span>{student.sex ? student.sex.charAt(0).toUpperCase() + student.sex.slice(1) : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Age:</span>
                    <span>{student.age || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Program:</span>
                    <span>{student.chosen_program || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Subprogram:</span>
                    <span>{student.chosen_subprogram || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Attendance Overview */}
              <div className={`p-6 rounded-xl shadow ${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
                <h2 className="text-xl font-semibold mb-4">Attendance Overview</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className={`p-3 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
                    <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Total Days</div>
                    <div className="text-lg font-bold">{attendanceStats.totalDays}</div>
                  </div>
                  <div className={`p-3 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
                    <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Present Hours</div>
                    <div className="text-lg font-bold text-green-600">{attendanceStats.presentHours}</div>
                  </div>
                </div>
                {attendanceStats.totalHours > 0 && (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} hours`, 'Count']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className={`p-6 rounded-xl shadow ${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
              <DataTable
                title="Attendance Records"
                columns={attendanceColumns}
                data={attendance}
                showAddButton={false}
              />
            </div>
          )}

          {activeTab === 'payments' && (
            <div className={`p-6 rounded-xl shadow ${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
              <DataTable
                title="Payment History"
                columns={paymentColumns}
                data={payments}
                showAddButton={false}
              />
            </div>
          )}
        </div>
      </main>
    </>
  );
}