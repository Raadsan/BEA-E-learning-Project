"use client";

import { useState, useEffect, useMemo } from "react";

import { useGetClassesQuery } from "@/redux/api/classApi";
import { useGetStudentsQuery } from "@/redux/api/studentApi";
import { useGetAttendanceQuery, useSaveAttendanceMutation } from "@/redux/api/attendanceApi";
import { useDarkMode } from "@/context/ThemeContext";
import DataTable from "@/components/DataTable";
import { Toast } from "@/components/Toast";

export default function AttendancePage() {
  const { isDark } = useDarkMode();
  const { data: classesData = [], isLoading: classesLoading } = useGetClassesQuery();
  const { data: studentsData = [], isLoading: studentsLoading } = useGetStudentsQuery();

  const [selectedClass, setSelectedClass] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
  const [attendance, setAttendance] = useState({}); // { studentId: { hour1: int, hour2: int } }
  const [toast, setToast] = useState(null);

  const classes = classesData || [];
  const students = Array.isArray(studentsData) ? studentsData : (studentsData?.students || []);

  // Generate last 7 days for history logs
  const historyDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().slice(0, 10);
    });
  }, []);

  // Define table columns
  const columns = [
    {
      label: "#",
      key: "index",
      render: (row, idx) => <span className="font-bold">{idx + 1}</span>,
      width: "50px",
      className: "hidden sm:table-cell"
    },
    { label: "Name", key: "full_name" },
    { label: "Email", key: "email", className: "hidden lg:table-cell" },
    { label: "Phone", key: "phone", render: (row) => row.phone || 'N/A', className: "hidden xl:table-cell text-xs" },
    {
      label: "Hour 1",
      key: "hour1",
      render: (row) => {
        const isPresent = attendance[row.student_id]?.hour1 === 1;
        return (
          <label className="flex items-center justify-center cursor-pointer w-full h-full">
            <input
              type="checkbox"
              className="w-5 h-5 rounded text-[#010080] focus:ring-[#010080]/50 cursor-pointer"
              checked={isPresent}
              onChange={() => handleToggleHour1(row.student_id)}
            />
          </label>
        );
      },
      width: "80px",
      className: "text-center"
    },
    {
      label: "Hour 2",
      key: "hour2",
      render: (row) => {
        const isPresent = attendance[row.student_id]?.hour2 === 1;
        return (
          <label className="flex items-center justify-center cursor-pointer w-full h-full">
            <input
              type="checkbox"
              className="w-5 h-5 rounded text-[#010080] focus:ring-[#010080]/50 cursor-pointer"
              checked={isPresent}
              onChange={() => handleToggleHour2(row.student_id)}
            />
          </label>
        );
      },
      width: "80px",
      className: "text-center"
    },
    {
      label: "Excused",
      key: "excused",
      render: (row) => {
        const h1 = attendance[row.student_id]?.hour1;
        const h2 = attendance[row.student_id]?.hour2;

        const excusedCount = (h1 === 2 ? 1 : 0) + (h2 === 2 ? 1 : 0);
        const isExcused = h1 === 2 || h2 === 2;

        return (
          <div className="flex items-center justify-center gap-2">
            <label className="flex items-center justify-center cursor-pointer">
              <input
                type="checkbox"
                className="w-5 h-5 rounded text-[#f40606] focus:ring-[#f40606]/50 cursor-pointer"
                checked={isExcused}
                onChange={() => handleToggleExcused(row.student_id)}
              />
            </label>
            <span className={`font-bold w-4 text-center ${excusedCount > 0 ? 'text-[#f40606]' : 'text-gray-300'}`}>
              {excusedCount}
            </span>
          </div>
        );
      },
      width: "80px",
      className: "text-center"
    }
  ];

  // Fetch attendance when class and date are selected
  const { data: attendanceData, isLoading: attendanceLoading } = useGetAttendanceQuery(
    selectedClass && date ? { classId: selectedClass.id, date } : { classId: '', date: '' },
    { skip: !selectedClass || !date }
  );

  const [saveAttendance, { isLoading: saving }] = useSaveAttendanceMutation();

  // Filter students by selected class
  const filteredStudents = selectedClass ? students.filter(s => s.class_id == selectedClass.id) : [];

  useEffect(() => {
    if (attendanceData) {
      setAttendance(attendanceData);
    } else {
      setAttendance({});
    }
  }, [attendanceData]);

  const handleToggleHour1 = (studentId) => {
    setAttendance((prev) => {
      const current = prev[studentId] || {};
      const newStatus = current.hour1 === 1 ? 0 : 1;
      return { ...prev, [studentId]: { ...current, hour1: newStatus } };
    });
  };

  const handleToggleHour2 = (studentId) => {
    setAttendance((prev) => {
      const current = prev[studentId] || {};
      const newStatus = current.hour2 === 1 ? 0 : 1;
      return { ...prev, [studentId]: { ...current, hour2: newStatus } };
    });
  };

  const handleToggleExcused = (studentId) => {
    setAttendance((prev) => {
      const current = prev[studentId] || {};
      const h1 = current.hour1 || 0;
      const h2 = current.hour2 || 0;
      const isCurrentlyExcused = h1 === 2 || h2 === 2;
      let newH1 = h1;
      let newH2 = h2;
      if (isCurrentlyExcused) {
        if (newH1 === 2) newH1 = 0;
        if (newH2 === 2) newH2 = 0;
      } else {
        if (newH1 === 0) newH1 = 2;
        if (newH2 === 0) newH2 = 2;
      }
      return { ...prev, [studentId]: { hour1: newH1, hour2: newH2 } };
    });
  };

  const handleMarkAllHour1 = (checked) => {
    const updated = { ...attendance };
    filteredStudents.forEach((s) => {
      if (!s.student_id) return;
      updated[s.student_id] = { ...updated[s.student_id], hour1: checked ? 1 : 0 };
    });
    setAttendance(updated);
  };

  const handleMarkAllHour2 = (checked) => {
    const updated = { ...attendance };
    filteredStudents.forEach((s) => {
      if (!s.student_id) return;
      updated[s.student_id] = { ...updated[s.student_id], hour2: checked ? 1 : 0 };
    });
    setAttendance(updated);
  };

  const handleMarkAllExcused = (checked) => {
    const updated = { ...attendance };
    filteredStudents.forEach((s) => {
      if (!s.student_id) return;
      const current = updated[s.student_id] || {};
      let h1 = current.hour1 || 0;
      let h2 = current.hour2 || 0;
      if (checked) {
        if (h1 === 0) h1 = 2;
        if (h2 === 0) h2 = 2;
      } else {
        if (h1 === 2) h1 = 0;
        if (h2 === 2) h2 = 0;
      }
      updated[s.student_id] = { hour1: h1, hour2: h2 };
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
      await saveAttendance({
        class_id: selectedClass.id,
        date,
        attendanceData: attendance,
      }).unwrap();
      setToast({ message: "Attendance saved successfully.", type: "success" });
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      setToast({ message: "Failed to save attendance: " + (error?.data?.error || error.message), type: "error" });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const presentStudentCount = filteredStudents.filter(s => {
    const h1 = attendance[s.student_id]?.hour1;
    const h2 = attendance[s.student_id]?.hour2;
    return h1 === 1 || h2 === 1;
  }).length;

  const excusedStudentCount = filteredStudents.filter(s => {
    const h1 = attendance[s.student_id]?.hour1;
    const h2 = attendance[s.student_id]?.hour2;
    const isPresent = h1 === 1 || h2 === 1;
    return !isPresent && (h1 === 2 || h2 === 2);
  }).length;

  const absentStudentCount = filteredStudents.length - presentStudentCount - excusedStudentCount;

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="w-full px-8 py-6">
        {classes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg text-gray-500 font-bold">Not assigned class yet</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-6 mb-8">
              <div className="flex items-center justify-between">
                <h1 className="text-4xl font-bold text-[#010080] dark:text-white">Attendance Manager</h1>
                <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-bold text-[#f40606]">Selected Date:</span>
                  <span className="text-sm font-bold">{new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>

              {/* Enhanced Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
                <div className="lg:col-span-4 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Step 1: Select Class</label>
                  <select
                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-[#010080]/20 outline-none transition-all font-bold ${isDark ? 'bg-[#06102b] text-white border-[#07203c]' : 'bg-gray-50 text-gray-900 border-gray-200'}`}
                    value={selectedClass?.id || ''}
                    onChange={(e) => {
                      const cid = e.target.value;
                      const cls = classes.find((c) => String(c.id) === String(cid));
                      setSelectedClass(cls || null);
                    }}
                  >
                    <option value="">-- Select Class --</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.class_name} {c.course_title ? `- ${c.course_title}` : ''}</option>
                    ))}
                  </select>
                </div>

                <div className="lg:col-span-3 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Step 2: Choose Date</label>
                  <input
                    type="date"
                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-[#010080]/20 outline-none transition-all font-bold ${isDark ? 'bg-[#06102b] text-white border-[#07203c]' : 'bg-gray-50 text-gray-900 border-gray-200'}`}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <div className="lg:col-span-5 flex flex-col justify-end gap-3">
                  {selectedClass && (
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input type="checkbox" className="w-5 h-5 rounded text-[#010080] border-gray-300 focus:ring-[#010080]/20" onChange={(e) => handleMarkAllHour1(e.target.checked)} />
                          <span className="text-xs font-bold text-gray-600 dark:text-gray-300 group-hover:text-[#010080] transition-colors uppercase">All H-1</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input type="checkbox" className="w-5 h-5 rounded text-[#010080] border-gray-300 focus:ring-[#010080]/20" onChange={(e) => handleMarkAllHour2(e.target.checked)} />
                          <span className="text-xs font-bold text-gray-600 dark:text-gray-300 group-hover:text-[#010080] transition-colors uppercase">All H-2</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input type="checkbox" className="w-5 h-5 rounded text-[#f40606] border-gray-300 focus:ring-[#f40606]/20" onChange={(e) => handleMarkAllExcused(e.target.checked)} />
                          <span className="text-xs font-bold text-[#f40606] uppercase">Excused</span>
                        </label>
                      </div>
                      <button
                        className="flex-1 lg:flex-none px-10 py-3 rounded-xl bg-[#010080] text-white disabled:opacity-50 hover:bg-blue-800 shadow-lg shadow-blue-900/20 active:scale-95 transition-all font-bold uppercase tracking-wide"
                        onClick={handleSave}
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Save Attendance'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Attendance History Logs */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <svg className="w-5 h-5 text-[#f40606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Attendance History Logs</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {historyDates.map((histDate) => (
                    <button
                      key={histDate}
                      onClick={() => setDate(histDate)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${date === histDate
                        ? 'bg-[#f40606] text-white border-[#f40606] shadow-md'
                        : 'bg-gray-50 dark:bg-[#06102b] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-[#f40606] hover:text-[#f40606]'
                        }`}
                    >
                      {new Date(histDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      {histDate === new Date().toISOString().slice(0, 10) && " (Today)"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {!selectedClass ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-4">
                  <svg className="w-12 h-12 text-[#010080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                </div>
                <p className="text-xl font-bold text-gray-400">Please select a class to start tracking attendance</p>
              </div>
            ) : (
              <>
                <div className="mt-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
                    <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md`}>
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Class Name</div>
                      <div className="text-lg font-bold text-[#010080] dark:text-white truncate">{selectedClass.class_name}</div>
                    </div>
                    <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md border-l-4 border-l-blue-600`}>
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Present</div>
                      <div className="text-3xl font-black text-[#010080]">{presentStudentCount}</div>
                    </div>
                    <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md border-l-4 border-l-[#f40606]`}>
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Excused</div>
                      <div className="text-3xl font-black text-[#f40606]">{excusedStudentCount}</div>
                    </div>
                    <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md border-l-4 border-l-gray-400`}>
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Absent</div>
                      <div className="text-3xl font-black text-gray-400">{absentStudentCount}</div>
                    </div>
                  </div>

                  <div className={`rounded-3xl ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700`}>
                    <DataTable
                      title={`Student Roster - ${selectedClass.class_name}`}
                      columns={columns}
                      data={filteredStudents}
                      showAddButton={false}
                    />
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
