"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import { useDarkMode } from "@/context/ThemeContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import DataTable from "@/components/DataTable";
import { API_URL } from "@/constants";

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
  const [programs, setPrograms] = useState([]);
  const [subprograms, setSubprograms] = useState([]);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

        // Fetch student details
        const studentRes = await fetch(`${API_URL}/students/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!studentRes.ok) throw new Error("Failed to fetch student details");
        const studentData = await studentRes.json();
        setStudent(studentData.student || studentData);

        // Fetch attendance
        const attendanceRes = await fetch(`${API_URL}/attendance/student/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (attendanceRes.ok) {
          const attendanceData = await attendanceRes.json();
          setAttendance(attendanceData.records || []);
        }

        // Fetch payments
        const paymentsRes = await fetch(`${API_URL}/payments/student/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (paymentsRes.ok) {
          const paymentsData = await paymentsRes.json();
          let fetchedPayments = paymentsData.payments || [];
          const actualStudent = studentData.student || studentData;
          
          // If no payment records exist but student has a funding status, create synthetic entry
          if (fetchedPayments.length === 0 && actualStudent.funding_status && actualStudent.funding_status !== 'Unpaid') {
            fetchedPayments = [{
              id: 'synthetic-reg',
              created_at: actualStudent.created_at || new Date().toISOString(),
              amount: actualStudent.funding_amount || 0,
              method: 'Manual / Registration',
              status: actualStudent.funding_status === 'Paid' ? 'paid' : actualStudent.funding_status?.toLowerCase() || 'pending',
              note: `Funding Month: ${actualStudent.funding_month || 'N/A'}`
            }];
          }
          setPayments(fetchedPayments);
        }

        // Fetch programs
        const programsRes = await fetch(`${API_URL}/programs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (programsRes.ok) {
          const programsData = await programsRes.json();
          setPrograms(programsData.programs || programsData || []);
        }

        // Fetch subprograms
        const subprogramsRes = await fetch(`${API_URL}/subprograms`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (subprogramsRes.ok) {
          const subprogramsData = await subprogramsRes.json();
          setSubprograms(subprogramsData.subprograms || subprogramsData || []);
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

  // Get subprogram name for display
  const getSubprogramName = (subprogramIdOrName) => {
    if (!subprogramIdOrName) return "N/A";
    if (isNaN(Number(subprogramIdOrName))) {
      return subprogramIdOrName;
    }
    const subprogram = subprograms.find(sp => sp.id == subprogramIdOrName);
    return subprogram ? subprogram.subprogram_name : "N/A";
  };

  // Get program name for display
  const getProgramName = (programIdOrName) => {
    if (!programIdOrName) return "N/A";
    if (isNaN(Number(programIdOrName))) {
      return programIdOrName;
    }
    const program = programs.find(p => p.id == programIdOrName);
    return program ? program.title : "N/A";
  };

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
    { label: "Date", key: "date", render: (value) => value ? new Date(value).toLocaleDateString() : "-" },
    { label: "Student", key: "student_name", render: () => student?.full_name || "N/A" },
    { label: "Class Name", key: "class_name", render: (value) => value || "N/A" },
    { label: "Program", key: "program_name", render: (value) => value || "N/A" },
    { label: "Hour 1", key: "hour1", render: (value) => value ? "Present" : "Absent" },
    { label: "Hour 2", key: "hour2", render: (value) => value ? "Present" : "Absent" }
  ];

  // Payment table columns
  const paymentColumns = [
    { label: "Date", key: "created_at", render: (value) => value ? new Date(value).toLocaleDateString() : "-" },
    { label: "Amount", key: "amount", render: (value) => `$${Number(value || 0).toFixed(2)}` },
    { label: "Method", key: "method", render: (value) => value || 'N/A' },
    { label: "Note", key: "note", render: (value) => value || '-' },
    {
      label: "Status", key: "status", render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          (value === 'completed' || value === 'paid') ? 'bg-green-100 text-green-800' :
          value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Pending'}
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
            /* Personal Information - Full Width */
            <div className={`p-6 rounded-xl shadow ${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
              <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                <div className={`flex justify-between py-2 border-b ${isDark ? "border-gray-700" : "border-gray-100"}`}>
                  <span className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Full Name</span>
                  <span className="font-medium">{student.full_name}</span>
                </div>
                <div className={`flex justify-between py-2 border-b ${isDark ? "border-gray-700" : "border-gray-100"}`}>
                  <span className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Email</span>
                  <span className="font-medium">{student.email}</span>
                </div>
                <div className={`flex justify-between py-2 border-b ${isDark ? "border-gray-700" : "border-gray-100"}`}>
                  <span className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Phone</span>
                  <span className="font-medium">{student.phone || 'N/A'}</span>
                </div>
                <div className={`flex justify-between py-2 border-b ${isDark ? "border-gray-700" : "border-gray-100"}`}>
                  <span className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Sex</span>
                  <span className="font-medium">{student.sex ? student.sex.charAt(0).toUpperCase() + student.sex.slice(1) : 'N/A'}</span>
                </div>
                <div className={`flex justify-between py-2 border-b ${isDark ? "border-gray-700" : "border-gray-100"}`}>
                  <span className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Age</span>
                  <span className="font-medium">{student.age || 'N/A'}</span>
                </div>
                <div className={`flex justify-between py-2 border-b ${isDark ? "border-gray-700" : "border-gray-100"}`}>
                  <span className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Approval Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    student.approval_status === 'approved' ? 'bg-green-100 text-green-800' :
                    student.approval_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>{student.approval_status || 'Pending'}</span>
                </div>
                <div className={`flex justify-between py-2 border-b ${isDark ? "border-gray-700" : "border-gray-100"}`}>
                  <span className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Program</span>
                  <span className="font-medium">{getProgramName(student.chosen_program)}</span>
                </div>
                <div className={`flex justify-between py-2 border-b ${isDark ? "border-gray-700" : "border-gray-100"}`}>
                  <span className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Subprogram</span>
                  <span className="font-medium">{getSubprogramName(student.chosen_subprogram)}</span>
                </div>
                <div className={`flex justify-between py-2 border-b ${isDark ? "border-gray-700" : "border-gray-100"}`}>
                  <span className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Funding Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    student.funding_status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                  }`}>{student.funding_status || 'N/A'}</span>
                </div>
                <div className={`flex justify-between py-2 border-b ${isDark ? "border-gray-700" : "border-gray-100"}`}>
                  <span className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Residency</span>
                  <span className="font-medium">{[student.residency_city, student.residency_country].filter(Boolean).join(', ') || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-6">
              {/* Attendance Overview */}
              <div className={`p-6 rounded-xl shadow ${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
                <h2 className="text-xl font-semibold mb-4">Attendance Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"} border border-gray-100 dark:border-gray-700`}>
                      <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"} uppercase font-semibold tracking-wider`}>Total Days</div>
                      <div className="text-2xl font-bold mt-1">{attendanceStats.totalDays}</div>
                    </div>
                    <div className={`p-4 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"} border border-gray-100 dark:border-gray-700`}>
                      <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"} uppercase font-semibold tracking-wider`}>Present Hours</div>
                      <div className="text-2xl font-bold text-green-600 mt-1">{attendanceStats.presentHours}</div>
                    </div>
                    <div className={`p-4 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"} border border-gray-100 dark:border-gray-700`}>
                      <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"} uppercase font-semibold tracking-wider`}>Absent Hours</div>
                      <div className="text-2xl font-bold text-red-500 mt-1">{attendanceStats.absentHours}</div>
                    </div>
                    <div className={`p-4 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"} border border-gray-100 dark:border-gray-700`}>
                      <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"} uppercase font-semibold tracking-wider`}>Attendance Rate</div>
                      <div className="text-2xl font-bold text-blue-500 mt-1">
                        {attendanceStats.totalHours > 0 ? `${Math.round((attendanceStats.presentHours / attendanceStats.totalHours) * 100)}%` : 'N/A'}
                      </div>
                    </div>
                  </div>
                  {attendanceStats.totalHours > 0 && (
                    <div className="h-48 flex justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={65}
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

              {/* Attendance Table */}
              <div className={`p-6 rounded-xl shadow ${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
                <DataTable
                  title="Attendance Records"
                  columns={attendanceColumns}
                  data={attendance}
                  showAddButton={false}
                />
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-6">
              {/* Funding Summary */}
              <div className={`p-6 rounded-xl shadow ${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
                <h2 className="text-xl font-semibold mb-4">Funding Summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"} border border-gray-100 dark:border-gray-700`}>
                    <div className={`text-xs uppercase font-semibold tracking-wider ${isDark ? "text-gray-400" : "text-gray-500"}`}>Funding Status</div>
                    <div className={`text-lg font-bold mt-1 ${
                      student.funding_status === 'Paid' ? 'text-green-600' : 'text-yellow-600'
                    }`}>{student.funding_status || 'N/A'}</div>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"} border border-gray-100 dark:border-gray-700`}>
                    <div className={`text-xs uppercase font-semibold tracking-wider ${isDark ? "text-gray-400" : "text-gray-500"}`}>Amount</div>
                    <div className="text-lg font-bold mt-1">${Number(student.funding_amount || 0).toFixed(2)}</div>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"} border border-gray-100 dark:border-gray-700`}>
                    <div className={`text-xs uppercase font-semibold tracking-wider ${isDark ? "text-gray-400" : "text-gray-500"}`}>Funding Month</div>
                    <div className="text-lg font-bold mt-1">{student.funding_month || 'N/A'}</div>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"} border border-gray-100 dark:border-gray-700`}>
                    <div className={`text-xs uppercase font-semibold tracking-wider ${isDark ? "text-gray-400" : "text-gray-500"}`}>Paid Until</div>
                    <div className="text-lg font-bold mt-1">{student.paid_until ? new Date(student.paid_until).toLocaleDateString() : 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Payment Records Table */}
              <div className={`p-6 rounded-xl shadow ${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
                <DataTable
                  title="Payment History"
                  columns={paymentColumns}
                  data={payments}
                  showAddButton={false}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}