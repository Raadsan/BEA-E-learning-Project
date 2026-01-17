"use client";

import { useState, useEffect } from "react";

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

  // Define table columns
  const columns = [
    {
      label: "#",
      key: "index",
      render: (row, idx) => idx + 1,
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
              className="w-5 h-5 rounded text-green-600 focus:ring-green-500 cursor-pointer"
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
              className="w-5 h-5 rounded text-green-600 focus:ring-green-500 cursor-pointer"
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

        // Count excused hours (value 2)
        const excusedCount = (h1 === 2 ? 1 : 0) + (h2 === 2 ? 1 : 0);

        // Checked if ANY hour is marked as 2 (Excused)
        const isExcused = h1 === 2 || h2 === 2;

        return (
          <div className="flex items-center justify-center gap-2">
            <label className="flex items-center justify-center cursor-pointer">
              <input
                type="checkbox"
                className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500 cursor-pointer"
                checked={isExcused}
                onChange={() => handleToggleExcused(row.student_id)}
              />
            </label>
            <span className={`font-semibold w-4 text-center ${excusedCount > 0 ? 'text-orange-500' : 'text-gray-300'}`}>
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
      // Reset to empty if no data
      setAttendance({});
    }
  }, [attendanceData]);

  const handleToggleHour1 = (studentId) => {
    setAttendance((prev) => {
      const current = prev[studentId] || {};
      // Toggle Present(1) <-> Absent(0). 
      const newStatus = current.hour1 === 1 ? 0 : 1;

      return {
        ...prev,
        [studentId]: {
          ...current,
          hour1: newStatus,
        },
      };
    });
  };

  const handleToggleHour2 = (studentId) => {
    setAttendance((prev) => {
      const current = prev[studentId] || {};
      const newStatus = current.hour2 === 1 ? 0 : 1;

      return {
        ...prev,
        [studentId]: {
          ...current,
          hour2: newStatus,
        },
      };
    });
  };

  const handleToggleExcused = (studentId) => {
    setAttendance((prev) => {
      const current = prev[studentId] || {};
      const h1 = current.hour1 || 0;
      const h2 = current.hour2 || 0;

      // "Smart Fill" Logic:
      // If currently checked (Any is 2):
      //    Uncheck -> Set ONLY the '2's to '0'. Leave '1's alone.
      // If currently unchecked (None is 2):
      //    Check -> Set ONLY the '0's to '2'. Leave '1's alone.

      const isCurrentlyExcused = h1 === 2 || h2 === 2;

      let newH1 = h1;
      let newH2 = h2;

      if (isCurrentlyExcused) {
        // Uncheck operation: revert excuses to absent
        if (newH1 === 2) newH1 = 0;
        if (newH2 === 2) newH2 = 0;
      } else {
        // Check operation: fill absent with excuse
        if (newH1 === 0) newH1 = 2;
        if (newH2 === 0) newH2 = 2;
      }

      return {
        ...prev,
        [studentId]: {
          hour1: newH1,
          hour2: newH2,
        }
      };
    });
  };

  const handleMarkAllHour1 = (checked) => {
    const updated = { ...attendance };
    filteredStudents.forEach((s) => {
      if (!s.student_id) return; // Safety check
      // Direct toggle for Present column. Overwrites Excused if Present is checked.
      // If unchecking Present, becomes Absent (0).
      updated[s.student_id] = {
        ...updated[s.student_id],
        hour1: checked ? 1 : 0,
      };
    });
    setAttendance(updated);
  };

  const handleMarkAllHour2 = (checked) => {
    const updated = { ...attendance };
    filteredStudents.forEach((s) => {
      if (!s.student_id) return;
      updated[s.student_id] = {
        ...updated[s.student_id],
        hour2: checked ? 1 : 0,
      };
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
        // Fill gaps
        if (h1 === 0) h1 = 2;
        if (h2 === 0) h2 = 2;
      } else {
        // Clear excuses
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


  // Count Students by Status Priority: Present > Excused > Absent
  const presentStudentCount = filteredStudents.filter(s => {
    const h1 = attendance[s.student_id]?.hour1;
    const h2 = attendance[s.student_id]?.hour2;
    return h1 === 1 || h2 === 1; // Present if ANY hour is 1
  }).length;

  const excusedStudentCount = filteredStudents.filter(s => {
    const h1 = attendance[s.student_id]?.hour1;
    const h2 = attendance[s.student_id]?.hour2;
    // Excused if NOT Present AND (h1 is 2 OR h2 is 2)
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
            <p className="text-lg text-gray-500">Not assigned class yet</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-6 mb-8">
              <h1 className="text-3xl font-bold">Attendance</h1>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                  <select
                    className={`flex-1 md:flex-none md:w-64 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-[#010080]/20 outline-none transition-all ${isDark ? 'bg-[#06102b] text-white border-[#07203c]' : 'bg-white text-gray-900 border-gray-200'}`}
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

                  <input
                    type="date"
                    className={`flex-1 md:flex-none md:w-auto px-3 py-2 rounded-lg border focus:ring-2 focus:ring-[#010080]/20 outline-none transition-all ${isDark ? 'bg-[#06102b] text-white border-[#07203c]' : 'bg-white text-gray-900 border-gray-200'}`}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                {selectedClass && (
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex gap-4">
                      <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <input type="checkbox" className="w-4 h-4 rounded text-green-600" onChange={(e) => handleMarkAllHour1(e.target.checked)} />
                        <span className="text-sm font-medium">All Hour 1</span>
                      </label>
                      <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <input type="checkbox" className="w-4 h-4 rounded text-green-600" onChange={(e) => handleMarkAllHour2(e.target.checked)} />
                        <span className="text-sm font-medium">All Hour 2</span>
                      </label>
                      <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <input type="checkbox" className="w-4 h-4 rounded text-orange-500" onChange={(e) => handleMarkAllExcused(e.target.checked)} />
                        <span className="text-sm font-medium text-orange-500">All Excused</span>
                      </label>
                    </div>
                    <button
                      className="w-full md:w-auto px-6 py-2 rounded-lg bg-[#010080] text-white disabled:opacity-50 hover:bg-[#010080]/90 transition-colors font-semibold"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {!selectedClass ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-lg text-gray-500">Select a class to view attendance</p>
              </div>
            ) : (
              <>
                <div className="mt-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-[#06102b] text-white' : 'bg-white text-gray-900'} shadow-sm`}>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Class</div>
                      <div className="font-semibold">{selectedClass.class_name}</div>
                    </div>
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-[#06102b] text-white' : 'bg-white text-gray-900'} shadow-sm`}>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Present Students</div>
                      <div className="font-semibold text-green-600">{presentStudentCount}</div>
                    </div>
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-[#06102b] text-white' : 'bg-white text-gray-900'} shadow-sm`}>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Excused Students</div>
                      <div className="font-semibold text-orange-500">{excusedStudentCount}</div>
                    </div>
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-[#06102b] text-white' : 'bg-white text-gray-900'} shadow-sm`}>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Absent Students</div>
                      <div className="font-semibold text-red-500">{absentStudentCount}</div>
                    </div>
                  </div>

                  <div className={`rounded-lg ${isDark ? 'bg-[#06102b] text-white' : 'bg-white text-gray-900'} shadow overflow-hidden`}>
                    <DataTable
                      title={`Attendance - ${selectedClass.class_name}`}
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