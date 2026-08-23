"use client";

import { useState, useEffect, useMemo } from "react";
import { useGetStudentsByClassQuery } from "@/lib/api/studentApi";
import { useGetAttendanceQuery, useSaveAttendanceMutation } from "@/lib/api/attendanceApi";
import { useGetTeacherClassesQuery } from "@/lib/api/teacherApi";
import { useDarkMode } from "@/context/ThemeContext";
import DataTable from "@/components/DataTable";
import { Toast } from "@/components/Toast";

// Status: 0 = Absent, 1 = Present, 2 = Excused
type AttendanceStatus = 0 | 1 | 2;

export default function AttendancePage() {
  const { isDark } = useDarkMode();
  const { data: classesData = [], isLoading: classesLoading } = useGetTeacherClassesQuery();

  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  const classes = classesData || [];

  const { data: studentsRaw = [], isLoading: studentsLoading } = useGetStudentsByClassQuery(
    selectedClass?.id,
    { skip: !selectedClass?.id }
  );
  const students = Array.isArray(studentsRaw) ? studentsRaw : ((studentsRaw as any)?.students || []);

  const historyDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().slice(0, 10);
    });
  }, []);

  const { data: attendanceData, isLoading: attendanceLoading } = useGetAttendanceQuery(
    selectedClass && date ? { classId: selectedClass.id, date } : { classId: '', date: '' },
    { skip: !selectedClass || !date }
  );

  const [saveAttendance, { isLoading: saving }] = useSaveAttendanceMutation();
  const filteredStudents = students;

  // Convert backend {hour1, hour2} → single status (use hour1)
  useEffect(() => {
    if (attendanceData && typeof attendanceData === 'object') {
      const converted: Record<string, AttendanceStatus> = {};
      Object.entries(attendanceData).forEach(([sid, val]: [string, any]) => {
        converted[sid] = (val?.hour1 ?? 0) as AttendanceStatus;
      });
      setAttendance(converted);
    } else {
      setAttendance({});
    }
  }, [attendanceData]);

  const setStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAllStatus = (status: AttendanceStatus) => {
    const updated: Record<string, AttendanceStatus> = {};
    filteredStudents.forEach((s: any) => {
      if (!s.student_id) return;
      updated[s.student_id] = status;
    });
    setAttendance(updated);
  };

  const handleSave = async () => {
    if (!selectedClass) {
      setToast({ message: "Please select a class before saving attendance.", type: "error" });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    try {
      // Convert single status → {hour1, hour2} for backend compatibility
      const backendData: Record<string, { hour1: number; hour2: number }> = {};
      Object.entries(attendance).forEach(([sid, status]) => {
        backendData[sid] = { hour1: status, hour2: status };
      });
      await saveAttendance({ class_id: selectedClass.id, date, attendanceData: backendData }).unwrap();
      setToast({ message: "Attendance saved successfully.", type: "success" });
      setTimeout(() => setToast(null), 3000);
    } catch (error: any) {
      setToast({ message: "Failed to save attendance: " + (error?.data?.error || error.message), type: "error" });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const statsSummary = useMemo(() => {
    let presentCount = 0, excusedCount = 0, absentCount = 0;
    filteredStudents.forEach((s: any) => {
      const status = attendance[s.student_id] ?? 0;
      if (status === 1) presentCount++;
      else if (status === 2) excusedCount++;
      else absentCount++;
    });
    return { presentCount, excusedCount, absentCount, total: filteredStudents.length };
  }, [filteredStudents, attendance]);

  // Present / Absent toggle buttons
  const renderPresentAbsent = (studentId: string) => {
    const status = attendance[studentId] ?? 0;
    const isPresent = status === 1;
    const isAbsent = status === 0;
    return (
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setStudentStatus(studentId, 1)}
          className={`flex items-center gap-1 px-3 py-1 rounded text-xs transition-all border ${
            isPresent
              ? "bg-green-500 border-green-500 text-white"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-500 hover:border-green-400 hover:text-green-600"
          }`}
        >
          <span>✓</span> Present
        </button>
        <button
          type="button"
          onClick={() => setStudentStatus(studentId, 0)}
          className={`flex items-center gap-1 px-3 py-1 rounded text-xs transition-all border ${
            isAbsent
              ? "bg-red-500 border-red-500 text-white"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-500 hover:border-red-400 hover:text-red-600"
          }`}
        >
          <span>✕</span> Absent
        </button>
      </div>
    );
  };

  // Excuse toggle in separate column
  const renderExcuse = (studentId: string) => {
    const status = attendance[studentId] ?? 0;
    const isExcused = status === 2;
    return (
      <button
        type="button"
        onClick={() => setStudentStatus(studentId, isExcused ? 0 : 2)}
        className={`flex items-center gap-1 px-3 py-1 rounded text-xs transition-all border ${
          isExcused
            ? "bg-amber-400 border-amber-400 text-white"
            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-500 hover:border-amber-400 hover:text-amber-600"
        }`}
      >
        <span>⚑</span> Excuse
      </button>
    );
  };

  const columns = [
    {
      label: "#",
      key: "index",
      render: (_val: any, _row: any, idx: number) => <span className="font-bold text-xs text-gray-400">{idx + 1}</span>,
      width: "40px",
      className: "hidden sm:table-cell"
    },
    {
      label: "Student Name",
      key: "full_name",
      render: (val: string, row: any) => (
        <div>
          <p className="font-bold text-sm text-gray-900 dark:text-white">{val || row.name || "Student"}</p>
          <p className="text-[11px] text-gray-400 font-mono">{row.student_id}</p>
        </div>
      )
    },
    {
      label: "Present / Absent",
      key: "present_absent",
      render: (_val: any, row: any) => row?.student_id ? renderPresentAbsent(row.student_id) : null,
      width: "240px",
      className: "text-center"
    },
    {
      label: "Excuse",
      key: "excuse",
      render: (_val: any, row: any) => row?.student_id ? renderExcuse(row.student_id) : null,
      width: "130px",
      className: "text-center"
    }
  ];

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {toast && <Toast message={toast.message} type={toast.type as any} onClose={() => setToast(null)} />}
      <div className="w-full px-6 sm:px-10 py-8">
        {classes.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-8">
            <p className="text-lg text-gray-500 font-bold">No assigned classes found for your account.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  Attendance Manager
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  Mark daily attendance with Present (P), Absent (A), and Excused (E) status.
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300">
                <span className="text-[#010080] font-bold">Selected Date:</span>
                <span>{new Date(date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>
            </div>

            {/* Selection & Batch Action Toolbar */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-6 space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Select Class</label>
                  <select
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-bold focus:ring-2 focus:ring-[#010080]/20 outline-none transition-all ${
                      isDark ? 'bg-gray-900 text-white border-gray-700' : 'bg-gray-50 text-gray-900 border-gray-200'
                    }`}
                    value={selectedClass?.id || ''}
                    onChange={(e) => {
                      const cid = e.target.value;
                      const cls = classes.find((c: any) => String(c.id) === String(cid));
                      setSelectedClass(cls || null);
                    }}
                  >
                    <option value="">-- Choose Class --</option>
                    {classes.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.class_name} {c.course_title ? `— ${c.course_title}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-6 space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Attendance Date</label>
                  <input
                    type="date"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-bold focus:ring-2 focus:ring-[#010080]/20 outline-none transition-all ${
                      isDark ? 'bg-gray-900 text-white border-gray-700' : 'bg-gray-50 text-gray-900 border-gray-200'
                    }`}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              {selectedClass && (
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-end gap-2.5">
                  <button type="button" onClick={() => handleMarkAllStatus(1)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:border-green-500 hover:text-green-600 hover:bg-green-50/50 dark:hover:bg-green-950/20 transition-all shadow-xs active:scale-95">
                    <span className="text-green-600 font-bold">✓</span> Mark All Present
                  </button>
                  <button type="button" onClick={() => handleMarkAllStatus(0)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:border-red-500 hover:text-red-600 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-all shadow-xs active:scale-95">
                    <span className="text-red-600 font-bold">✕</span> Mark All Absent
                  </button>
                  <button type="button" onClick={() => handleMarkAllStatus(2)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:border-amber-500 hover:text-amber-600 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-all shadow-xs active:scale-95">
                    <span className="text-amber-500 font-bold">⚑</span> Mark All Excused
                  </button>
                  <button type="button" onClick={handleSave} disabled={saving}
                    className="px-6 py-2 rounded-xl bg-[#010080] hover:bg-[#000066] text-white text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2">
                    {saving && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {saving ? "Saving..." : "Save Attendance"}
                  </button>
                </div>
              )}
            </div>

            {/* Quick 7-Day History Chips */}
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-gray-500 mr-2">Recent Dates:</span>
              {historyDates.map((histDate) => (
                <button key={histDate} type="button" onClick={() => setDate(histDate)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    date === histDate
                      ? "bg-[#010080] text-white border-[#010080] shadow-xs"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-[#010080]"
                  }`}
                >
                  {new Date(histDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  {histDate === new Date().toISOString().slice(0, 10) && " (Today)"}
                </button>
              ))}
            </div>

            {/* Table */}
            {!selectedClass ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-8">
                <p className="text-base font-bold text-gray-400">Please select a class from the dropdown above to load the student roster.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <DataTable
                  title={`Roster & Attendance — ${selectedClass.class_name}`}
                  columns={columns}
                  data={filteredStudents}
                  showAddButton={false}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
