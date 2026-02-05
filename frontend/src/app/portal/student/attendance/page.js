"use client";

import { useState, useEffect, useMemo } from "react";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useGetStudentAttendanceQuery } from "@/redux/api/attendanceApi";
import { useGetMyClassesQuery } from "@/redux/api/studentApi";
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
  const { data: myClasses, isLoading: classesLoading } = useGetMyClassesQuery();
  const { data: attendanceData, isLoading: attendanceLoading } = useGetStudentAttendanceQuery(user?.id, {
    skip: !user?.id,
  });

  const [selectedSubprogramName, setSelectedSubprogramName] = useState("");

  // Extract unique levels from myClasses using useMemo to prevent recalculation
  const levels = useMemo(() => {
    return myClasses?.reduce((acc, cls) => {
      if (cls.subprogram_name && !acc.find(l => l.subprogram_name === cls.subprogram_name)) {
        acc.push({
          subprogram_id: cls.subprogram_id,
          subprogram_name: cls.subprogram_name,
          program_name: cls.program_name
        });
      }
      return acc;
    }, []) || [];
  }, [myClasses]);

  // Auto-select level matching user's current level or the first available
  useEffect(() => {
    if (levels.length > 0 && !selectedSubprogramName) {
      const currentLevel = levels.find(l => l.subprogram_name === user?.chosen_subprogram);
      setSelectedSubprogramName(currentLevel ? currentLevel.subprogram_name : levels[0].subprogram_name);
    }
  }, [levels, user?.chosen_subprogram, selectedSubprogramName]);

  const allRecords = attendanceData?.records || [];

  // Filter records by selected subprogram
  const records = useMemo(() => {
    if (!selectedSubprogramName) return allRecords;
    return allRecords.filter(record =>
      record.subprogram_name === selectedSubprogramName ||
      (!record.subprogram_name && record.class_name && levels.find(l => l.subprogram_name === selectedSubprogramName))
    );
  }, [allRecords, selectedSubprogramName, levels]);

  // Calculate attendance statistics
  const stats = records.reduce((acc, record) => {
    // 0 = Absent, 1 = Present, 2 = Excused
    const h1 = record.hour1 === 1 ? 1 : 0;
    const h2 = record.hour2 === 1 ? 1 : 0;

    acc.totalDays += 1;
    acc.presentHours += (h1 + h2);

    // Absent means hour is 0
    const h1Absent = record.hour1 === 0 ? 1 : 0;
    const h2Absent = record.hour2 === 0 ? 1 : 0;

    acc.absentHours += (h1Absent + h2Absent);
    return acc;
  }, { totalDays: 0, presentHours: 0, absentHours: 0 });

  // Pie Chart Data: Present vs Absent
  const pieData = [
    { name: 'Present Hours', value: stats.presentHours, color: '#10B981' },
    { name: 'Absent Hours', value: stats.absentHours, color: '#EF4444' }
  ];

  const columns = [
    { label: "Program Name", key: "program_name", render: (row) => row.program_name || row.course_title || "General Program" },
    { label: "Level / Class", key: "subprogram_name", render: (row) => row.subprogram_name || row.class_name || "Basic Level" },
    { label: "Date", key: "date", render: (row) => row.date ? new Date(row.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : "-" },
    {
      label: "Hour One",
      key: "hour1",
      render: (row) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${row.hour1 === 1 ? 'bg-green-100 text-green-700' :
          row.hour1 === 2 ? 'bg-orange-100 text-orange-700' :
            'bg-red-100 text-red-700'
          }`}>
          {row.hour1 === 1 ? "Present" : row.hour1 === 2 ? "Excused" : "Absent"}
        </span>
      )
    },
    {
      label: "Hour Two",
      key: "hour2",
      render: (row) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${row.hour2 === 1 ? 'bg-green-100 text-green-700' :
          row.hour2 === 2 ? 'bg-orange-100 text-orange-700' :
            'bg-red-100 text-red-700'
          }`}>
          {row.hour2 === 1 ? "Present" : row.hour2 === 2 ? "Excused" : "Absent"}
        </span>
      )
    }
  ];

  const bg = isDark ? "bg-[#0b0f19]" : "bg-gray-50";

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
    <div className={`min-h-screen transition-colors pt-12 w-full px-6 sm:px-10 pb-20 ${bg}`}>
      <div className="w-full">

        {/* Header */}
        <div className="mb-12">
          <h1 className={`text-4xl font-bold tracking-tight mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
            Attendance
          </h1>
          <p className={`text-lg font-medium opacity-60 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Your recorded attendance by date and class.
          </p>
        </div>

        {/* Academic Selection Dashboard - Matching Grades Page */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Level Selection */}
          <div className={`p-4 rounded-xl border transition-all ${isDark ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Select Level</label>
            <div className="relative">
              <select
                value={selectedSubprogramName}
                onChange={(e) => setSelectedSubprogramName(e.target.value)}
                className={`w-full appearance-none pl-3 pr-8 py-2 rounded-lg border text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all ${isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
              >
                <option value="">{classesLoading ? "Loading..." : "Select Level"}</option>
                {levels?.map(level => (
                  <option key={level.subprogram_name} value={level.subprogram_name}>
                    {level.subprogram_name}
                  </option>
                ))}
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {/* Program Info */}
          <div className={`p-4 rounded-xl border flex flex-col justify-center ${isDark ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Program</span>
            <div className={`text-sm font-medium line-clamp-1 ${isDark ? 'text-white' : 'text-black'}`}>
              {user?.chosen_program || user?.exam_type || "General Program"}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Total Days */}
          <div className={`p-6 rounded-2xl shadow-md border-2 flex items-center justify-between transition-all hover:shadow-lg ${isDark ? "bg-[#0f172a] border-gray-800 text-white" : "bg-white border-gray-100 text-gray-900"}`}>
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Total Days</p>
              <h2 className="text-2xl font-extrabold">{stats.totalDays}</h2>
            </div>
            <div className={`p-3 rounded-xl ${isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          {/* Present Hours */}
          <div className={`p-6 rounded-2xl shadow-md border-2 flex items-center justify-between transition-all hover:shadow-lg ${isDark ? "bg-[#0f172a] border-gray-800 text-white" : "bg-white border-gray-100 text-gray-900"}`}>
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Present Hours</p>
              <h2 className="text-2xl font-extrabold text-green-500">{stats.presentHours}</h2>
            </div>
            <div className={`p-3 rounded-xl ${isDark ? "bg-green-500/10 text-green-400" : "bg-green-50 text-green-600"}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Absent Hours */}
          <div className={`p-6 rounded-2xl shadow-md border-2 flex items-center justify-between transition-all hover:shadow-lg ${isDark ? "bg-[#0f172a] border-gray-800 text-white" : "bg-white border-gray-100 text-gray-900"}`}>
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Absent Hours</p>
              <h2 className="text-2xl font-extrabold text-red-500">{stats.absentHours}</h2>
            </div>
            <div className={`p-3 rounded-xl ${isDark ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600"}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Absent Percentage */}
          <div className={`p-6 rounded-2xl shadow-md border-2 flex items-center justify-between transition-all hover:shadow-lg ${isDark ? "bg-[#0f172a] border-gray-800 text-white" : "bg-white border-gray-100 text-gray-900"}`}>
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Absent Rate</p>
              <h2 className="text-2xl font-extrabold text-orange-500">
                {stats.presentHours + stats.absentHours > 0
                  ? `${((stats.absentHours / (stats.presentHours + stats.absentHours)) * 100).toFixed(1)}%`
                  : '0%'}
              </h2>
            </div>
            <div className={`p-3 rounded-xl ${isDark ? "bg-orange-500/10 text-orange-400" : "bg-orange-50 text-orange-600"}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Overview Chart */}
        <div className={`p-5 rounded-xl shadow-sm border mb-8 ${isDark ? "bg-[#0f172a] border-gray-800" : "bg-white border-gray-100"}`}>
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
        <div className="pb-10 ">
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






