"use client";

import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useGetStudentAttendanceQuery } from "@/redux/api/attendanceApi";
import { useDarkMode } from "@/context/ThemeContext";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import DataTable from "@/components/DataTable";

export default function AttendancePage() {
  const { isDark } = useDarkMode();
  const { data: user, isLoading: userLoading } = useGetCurrentUserQuery();
  const { data: attendanceData, isLoading: attendanceLoading } = useGetStudentAttendanceQuery(user?.id, {
    skip: !user?.id,
  });

  const records = attendanceData?.records || [];

  // Calculate attendance statistics
  const stats = records.reduce((acc, record) => {
    const h1 = record.hour1 ? 1 : 0;
    const h2 = record.hour2 ? 1 : 0;
    acc.totalDays += 1;
    acc.presentHours += (h1 + h2);
    acc.absentHours += (2 - (h1 + h2));
    return acc;
  }, { totalDays: 0, presentHours: 0, absentHours: 0 });

  // Pie Chart Data: Present vs Absent
  const pieData = [
    { name: 'Present Hours', value: stats.presentHours, color: '#10B981' },
    { name: 'Absent Hours', value: stats.absentHours, color: '#EF4444' }
  ];

  const columns = [
    { label: "Program Name", key: "program_name", render: (row) => row.program_name || "General Program" },
    { label: "Subprogram Name", key: "subprogram_name", render: (row) => row.subprogram_name || "Basic Level" },
    { label: "Date", key: "date", render: (row) => row.date ? new Date(row.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : "-" },
    {
      label: "Hour One",
      key: "hour1",
      render: (row) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${row.hour1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {row.hour1 ? "Present" : "Absent"}
        </span>
      )
    },
    {
      label: "Hour Two",
      key: "hour2",
      render: (row) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${row.hour2 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {row.hour2 ? "Present" : "Absent"}
        </span>
      )
    }
  ];

  const bg = isDark ? "bg-gray-900" : "bg-gray-50";

  if (userLoading || attendanceLoading) {
    return (
      <div className="flex-1 p-8 space-y-6">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-xl"></div>)}
        </div>
        <div className="h-64 bg-gray-200 animate-pulse rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors `}>
      <div className="py-6 space-y-6">

        {/* Simple Header */}
        <div>
          <h1 className={`text-2xl font-bold tracking-tight mb-0.5 ${isDark ? "text-white" : "text-gray-900"}`}>
            Attendance
          </h1>
          <p className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Your recorded attendance by date and class.
          </p>
        </div>

        {/* Stats Grid - Normal Size */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Days */}
          <div className={`p-4 rounded-xl shadow-sm border flex items-center justify-between ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-100 text-gray-900"}`}>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Total Days</p>
              <h2 className="text-xl font-bold">{stats.totalDays}</h2>
            </div>
            <div className={`p-2 rounded-lg ${isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          {/* Present Hours */}
          <div className={`p-4 rounded-xl shadow-sm border flex items-center justify-between ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-100 text-gray-900"}`}>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Present Hours</p>
              <h2 className="text-xl font-bold text-green-500">{stats.presentHours}</h2>
            </div>
            <div className={`p-2 rounded-lg ${isDark ? "bg-green-500/10 text-green-400" : "bg-green-50 text-green-600"}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Absent Hours */}
          <div className={`p-4 rounded-xl shadow-sm border flex items-center justify-between ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-100 text-gray-900"}`}>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Absent Hours</p>
              <h2 className="text-xl font-bold text-red-500">{stats.absentHours}</h2>
            </div>
            <div className={`p-2 rounded-lg ${isDark ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600"}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Overview Chart */}
        <div className={`p-5 rounded-xl shadow-sm border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <h3 className={`text-base font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Overall Allocation</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tracking Table */}
        <div className="pb-10">
          <DataTable
            title="Attendance History"
            columns={columns}
            data={records}
            showAddButton={false}
          />
        </div>

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





