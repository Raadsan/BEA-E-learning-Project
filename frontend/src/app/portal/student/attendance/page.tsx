"use client";

import { useState, useEffect, useMemo } from "react";
import { useGetCurrentUserQuery } from "@/lib/api/authApi";
import { useGetStudentAttendanceQuery } from "@/lib/api/attendanceApi";
import { useGetMyClassesQuery } from "@/lib/api/studentApi";
import { useDarkMode } from "@/context/ThemeContext";
import StudentPageHeader from "@/components/student/StudentPageHeader";
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

  const levels = useMemo(() => {
    return myClasses?.reduce((acc: any[], cls: any) => {
      if (cls.subprogram_name && !acc.find((l: any) => l.subprogram_name === cls.subprogram_name)) {
        acc.push({
          subprogram_id: cls.subprogram_id,
          subprogram_name: cls.subprogram_name,
          program_name: cls.program_name
        });
      }
      return acc;
    }, []) || [];
  }, [myClasses]);

  useEffect(() => {
    if (levels.length > 0 && !selectedSubprogramName) {
      const currentLevel = levels.find((l: any) => l.subprogram_name === user?.chosen_subprogram);
      setSelectedSubprogramName(currentLevel ? currentLevel.subprogram_name : levels[0].subprogram_name);
    }
  }, [levels, user?.chosen_subprogram, selectedSubprogramName]);

  const allRecords = attendanceData?.records || [];

  const records = useMemo(() => {
    if (!selectedSubprogramName) return allRecords;
    return allRecords.filter((record: any) =>
      record.subprogram_name === selectedSubprogramName ||
      (!record.subprogram_name && record.class_name && levels.find((l: any) => l.subprogram_name === selectedSubprogramName))
    );
  }, [allRecords, selectedSubprogramName, levels]);

  // Calculate attendance statistics across Present, Absent, and Excused
  const stats = useMemo(() => {
    return records.reduce((acc: any, record: any) => {
      // 0 = Absent, 1 = Present, 2 = Excused
      const h1 = record.hour1;
      const h2 = record.hour2;

      acc.totalDays += 1;

      // Present
      if (h1 === 1) acc.presentHours += 1;
      if (h2 === 1) acc.presentHours += 1;

      // Absent
      if (h1 === 0) acc.absentHours += 1;
      if (h2 === 0) acc.absentHours += 1;

      // Excused
      if (h1 === 2) acc.excusedHours += 1;
      if (h2 === 2) acc.excusedHours += 1;

      return acc;
    }, { totalDays: 0, presentHours: 0, absentHours: 0, excusedHours: 0 });
  }, [records]);

  const totalRecordedHours = stats.presentHours + stats.absentHours + stats.excusedHours;
  const presenceRate = totalRecordedHours > 0
    ? ((stats.presentHours / totalRecordedHours) * 100).toFixed(1)
    : "0.0";

  // Pie Chart Data: Present vs Absent vs Excused
  const pieData = useMemo(() => [
    { name: 'Present Hours', value: stats.presentHours, color: '#10B981' },
    { name: 'Absent Hours', value: stats.absentHours, color: '#EF4444' },
    { name: 'Excused Hours', value: stats.excusedHours, color: '#F59E0B' }
  ], [stats]);

  const columns = [
    { label: "Program Name", key: "program_name", render: (_val: any, row: any) => row?.program_name || row?.course_title || "General Program" },
    { label: "Level / Class", key: "subprogram_name", render: (_val: any, row: any) => row?.subprogram_name || row?.class_name || "Basic Level" },
    {
      label: "Date",
      key: "date",
      render: (_val: any, row: any) => {
        const d = row?.date;
        if (!d) return "-";
        try {
          const parsed = new Date(d);
          if (isNaN(parsed.getTime())) return String(d);
          return parsed.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
        } catch { return String(d); }
      }
    },
    {
      label: "Hour One",
      key: "hour1",
      render: (_val: any, row: any) => {
        const h = row?.hour1;
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
            h === 1 ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300' :
            h === 2 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' :
            'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300'
          }`}>
            {h === 1 ? "Present" : h === 2 ? "Excused" : "Absent"}
          </span>
        );
      }
    },
    {
      label: "Hour Two",
      key: "hour2",
      render: (_val: any, row: any) => {
        const h = row?.hour2;
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
            h === 1 ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300' :
            h === 2 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' :
            'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300'
          }`}>
            {h === 1 ? "Present" : h === 2 ? "Excused" : "Absent"}
          </span>
        );
      }
    }
  ];

  const bg = isDark ? "bg-[#0b0f19]" : "bg-gray-50";

  if (userLoading || attendanceLoading) {
    return (
      <div className="flex-1 p-8 space-y-6">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-xl"></div>)}
        </div>
        <div className="h-64 bg-gray-200 animate-pulse rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors pt-4 w-full px-6 sm:px-10 pb-20 ${bg}`}>
      <div className="w-full">

        <StudentPageHeader
          title="Attendance Record"
          description="Your recorded attendance across all classes with Present, Absent, and Excused breakdown."
        />

        {/* Academic Selection Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className={`p-4 rounded-xl border transition-all ${isDark ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Select Level</label>
            <div className="relative">
              <select
                value={selectedSubprogramName}
                onChange={(e) => setSelectedSubprogramName(e.target.value)}
                className={`w-full appearance-none pl-3 pr-8 py-2 rounded-lg border text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all ${
                  isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
              >
                <option value="">{classesLoading ? "Loading..." : "Select Level"}</option>
                {levels?.map((level: any) => (
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

          <div className={`p-4 rounded-xl border flex flex-col justify-center ${isDark ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Program</span>
            <div className={`text-sm font-medium line-clamp-1 ${isDark ? 'text-white' : 'text-black'}`}>
              {user?.chosen_program || user?.exam_type || "General Program"}
            </div>
          </div>
        </div>

        {/* Stats Grid: Total Days, Present Hours, Excused Hours, Absent Hours, Rate */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {/* Total Days */}
          <div className={`p-5 rounded-2xl shadow-sm border flex flex-col justify-between ${isDark ? "bg-[#0f172a] border-gray-800" : "bg-white border-gray-200"}`}>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Days</p>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalDays}</h2>
            <p className="text-[10px] text-gray-400 mt-1">{totalRecordedHours} total hours</p>
          </div>

          {/* Present Hours */}
          <div className={`p-5 rounded-2xl shadow-sm border flex flex-col justify-between ${isDark ? "bg-[#0f172a] border-gray-800" : "bg-white border-gray-200"}`}>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Present Hours</p>
            <h2 className="text-2xl font-black text-emerald-600">{stats.presentHours}</h2>
            <p className="text-[10px] text-emerald-600/70 mt-1">Attended</p>
          </div>

          {/* Excused Hours */}
          <div className={`p-5 rounded-2xl shadow-sm border flex flex-col justify-between ${isDark ? "bg-[#0f172a] border-gray-800" : "bg-white border-gray-200"}`}>
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Excused</p>
            <h2 className="text-2xl font-black text-amber-600">{stats.excusedHours}</h2>
            <p className="text-[10px] text-amber-600/70 mt-1">Cudurdaar</p>
          </div>

          {/* Absent Hours */}
          <div className={`p-5 rounded-2xl shadow-sm border flex flex-col justify-between ${isDark ? "bg-[#0f172a] border-gray-800" : "bg-white border-gray-200"}`}>
            <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">Absent Hours</p>
            <h2 className="text-2xl font-black text-red-600">{stats.absentHours}</h2>
            <p className="text-[10px] text-red-600/70 mt-1">Missed</p>
          </div>

          {/* Presence Rate */}
          <div className={`p-5 rounded-2xl shadow-sm border flex flex-col justify-between col-span-2 md:col-span-1 ${isDark ? "bg-[#0f172a] border-gray-800" : "bg-white border-gray-200"}`}>
            <p className="text-[10px] font-bold text-[#010080] dark:text-blue-400 uppercase tracking-wider mb-1">Presence Rate</p>
            <h2 className="text-2xl font-black text-[#010080] dark:text-blue-400">{presenceRate}%</h2>
            <p className="text-[10px] text-gray-400 mt-1">Based on total hours</p>
          </div>
        </div>

        {/* Overview Chart: 3-Slice Pie Chart */}
        <div className={`p-6 rounded-2xl shadow-sm border mb-8 ${isDark ? "bg-[#0f172a] border-gray-800" : "bg-white border-gray-200"}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-sm font-extrabold uppercase tracking-wide ${isDark ? "text-white" : "text-gray-900"}`}>
              Attendance Allocation (Present, Absent, Excused)
            </h3>
            <span className="text-xs font-bold text-gray-400">Total Recorded: {totalRecordedHours} hrs</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: isDark ? '#1e293b' : '#0b1033',
                    color: '#fff',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                  formatter={(value: any, name: any) => [`${value} Hours`, name]}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: '12px', fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tracking Table */}
        <div className="pb-10">
          <DataTable
            title="Attendance History Log"
            columns={columns}
            data={records}
            showAddButton={false}
          />
        </div>

      </div>
    </div>
  );
}
