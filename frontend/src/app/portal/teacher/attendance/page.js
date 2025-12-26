"use client";

import { useState, useEffect } from "react";
import TeacherHeader from "../TeacherHeader";
import { useGetClassesQuery } from "@/redux/api/classApi";
import { useGetStudentsQuery } from "@/redux/api/studentApi";
import { useGetAttendanceQuery, useSaveAttendanceMutation } from "@/redux/api/attendanceApi";
import { useDarkMode } from "@/context/ThemeContext";
import DataTable from "@/components/DataTable";

export default function AttendancePage() {
  const { isDark } = useDarkMode();
  const { data: classesData = [], isLoading: classesLoading } = useGetClassesQuery();
  const { data: studentsData = [], isLoading: studentsLoading } = useGetStudentsQuery();

  const [selectedClass, setSelectedClass] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
  const [attendance, setAttendance] = useState({}); // { studentId: { hour1: bool, hour2: bool } }

  const classes = classesData || [];
  const students = Array.isArray(studentsData) ? studentsData : (studentsData?.students || []);

  // Define table columns
  const columns = [
    {
      label: "#",
      key: "index",
      render: (row, idx) => idx + 1,
      width: "60px"
    },
    { label: "Name", key: "full_name" },
    { label: "Email", key: "email" },
    { label: "Phone", key: "phone", render: (row) => row.phone || 'N/A' },
    {
      label: "Hour 1",
      key: "hour1",
      render: (row) => (
        <input
          type="checkbox"
          checked={!!attendance[row.id]?.hour1}
          onChange={() => handleToggleHour1(row.id)}
        />
      ),
      width: "80px"
    },
    {
      label: "Hour 2",
      key: "hour2",
      render: (row) => (
        <input
          type="checkbox"
          checked={!!attendance[row.id]?.hour2}
          onChange={() => handleToggleHour2(row.id)}
        />
      ),
      width: "80px"
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
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        hour1: !prev[studentId]?.hour1,
      },
    }));
  };

  const handleToggleHour2 = (studentId) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        hour2: !prev[studentId]?.hour2,
      },
    }));
  };

  const handleMarkAllHour1 = (value) => {
    const updated = { ...attendance };
    filteredStudents.forEach((s) => {
      updated[s.id] = {
        ...updated[s.id],
        hour1: value,
      };
    });
    setAttendance(updated);
  };

  const handleMarkAllHour2 = (value) => {
    const updated = { ...attendance };
    filteredStudents.forEach((s) => {
      updated[s.id] = {
        ...updated[s.id],
        hour2: value,
      };
    });
    setAttendance(updated);
  };

  const handleSave = async () => {
    if (!selectedClass) {
      alert("Please select a class before saving attendance.");
      return;
    }
    try {
      await saveAttendance({
        class_id: selectedClass.id,
        date,
        attendanceData: attendance,
      }).unwrap();
      alert("Attendance saved successfully.");
    } catch (error) {
      alert("Failed to save attendance: " + error.message);
    }
  };


  const presentHour1Count = filteredStudents.filter(s => attendance[s.id]?.hour1).length;
  const presentHour2Count = filteredStudents.filter(s => attendance[s.id]?.hour2).length;
  const totalCount = filteredStudents.length;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#03081d] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <TeacherHeader />
      <div className="p-6">
        {classes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg text-gray-500">Not assigned class yet</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-2xl font-semibold">Attendance</h2>
              <div className="flex items-center gap-3">
                <select
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-[#06102b] text-white border-[#07203c]' : 'bg-white text-gray-900'}`}
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
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-[#06102b] text-white border-[#07203c]' : 'bg-white text-gray-900'}`}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />

                {selectedClass && (
                  <>
                    <label className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <input type="checkbox" onChange={(e) => handleMarkAllHour1(e.target.checked)} />
                      <span>Mark All Hour 1</span>
                    </label>
                    <label className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <input type="checkbox" onChange={(e) => handleMarkAllHour2(e.target.checked)} />
                      <span>Mark All Hour 2</span>
                    </label>
                    <button
                      className="px-4 py-2 rounded-lg bg-[#010080] text-white disabled:opacity-50"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </>
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
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-[#06102b] text-white' : 'bg-white text-gray-900'} shadow-sm`}>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Class</div>
                      <div className="font-semibold">{selectedClass.class_name}</div>
                    </div>
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-[#06102b] text-white' : 'bg-white text-gray-900'} shadow-sm`}>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Present Hour 1</div>
                      <div className="font-semibold text-green-600">{presentHour1Count}</div>
                    </div>
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-[#06102b] text-white' : 'bg-white text-gray-900'} shadow-sm`}>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Present Hour 2</div>
                      <div className="font-semibold text-green-600">{presentHour2Count}</div>
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