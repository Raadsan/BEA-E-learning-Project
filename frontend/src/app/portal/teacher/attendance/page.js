"use client";

import { useState, useEffect } from "react";
import TeacherHeader from "../TeacherHeader";
import { useGetClassesQuery } from "@/redux/api/classApi";
import { useGetStudentsQuery } from "@/redux/api/studentApi";
import { useDarkMode } from "@/context/ThemeContext";

export default function AttendancePage() {
  const { isDark } = useDarkMode();
  const { data: classesData = [], isLoading: classesLoading } = useGetClassesQuery();
  const { data: studentsData = [], isLoading: studentsLoading } = useGetStudentsQuery();

  const [selectedClass, setSelectedClass] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
  const [attendance, setAttendance] = useState({});
  const [markAll, setMarkAll] = useState(false);

  const classes = classesData || [];
  const students = Array.isArray(studentsData) ? studentsData : (studentsData?.students || []);

  // If we have a class selected, optionally filter students based on some heuristics.
  // For now, show all students if no direct relation can be determined.
  let filteredStudents = students;
  if (selectedClass) {
    // Prefer to filter by program/subprogram name if present on class
    const classSubprogram = selectedClass.subprogram_name || selectedClass.program_name || null;
    if (classSubprogram) {
      filteredStudents = students.filter((s) => {
        if (!s.chosen_subprogram && !s.chosen_program) return true;
        const chosen = s.chosen_subprogram || s.chosen_program;
        if (!chosen) return true;
        if (typeof chosen === 'string') {
          // compare names
          return chosen.toLowerCase().includes(String(classSubprogram).toLowerCase());
        }
        return true;
      });
    }
  }

  useEffect(() => {
    if (selectedClass) {
      const key = `attendance:${selectedClass.id}:${date}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setAttendance(parsed);
          setMarkAll(Object.values(parsed).every(Boolean));
          return;
        } catch (e) {
          // invalid json - ignore
        }
      }
    }
    // reset when class or date changes
    setAttendance({});
    setMarkAll(false);
  }, [selectedClass, date]);

  const handleToggle = (studentId) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleMarkAll = (value) => {
    const updated = {};
    filteredStudents.forEach((s) => (updated[s.id] = value));
    setAttendance(updated);
    setMarkAll(value);
  };

  const handleSave = () => {
    if (!selectedClass) {
      alert("Please select a class before saving attendance.");
      return;
    }
    const key = `attendance:${selectedClass.id}:${date}`;
    localStorage.setItem(key, JSON.stringify(attendance));
    alert("Attendance saved locally.");
  };


  const presentCount = Object.values(attendance).filter(Boolean).length;
  const totalCount = filteredStudents.length;
  const absentCount = totalCount - presentCount;

  useEffect(() => {
    // Update markAll when attendance changes
    const allPresent = filteredStudents.length > 0 && filteredStudents.every((s) => attendance[s.id]);
    setMarkAll(allPresent);
  }, [attendance, filteredStudents]);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#03081d] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <TeacherHeader />
      <div className="p-6">
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

            <label className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <input type="checkbox" checked={markAll} onChange={(e) => handleMarkAll(e.target.checked)} />
              <span>Mark All Present</span>
            </label>

            <button
              className="px-4 py-2 rounded-lg bg-[#010080] text-white"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>

        <div className="mt-6">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-[#06102b] text-white' : 'bg-white text-gray-900'} shadow-sm`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Class</div>
              <div className="font-semibold">{selectedClass ? `${selectedClass.class_name}` : 'Not selected'}</div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-[#06102b] text-white' : 'bg-white text-gray-900'} shadow-sm`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Present</div>
              <div className="font-semibold text-green-600">{presentCount}</div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-[#06102b] text-white' : 'bg-white text-gray-900'} shadow-sm`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Absent</div>
              <div className="font-semibold text-red-600">{absentCount}</div>
            </div>
          </div>

          <div className={`rounded-lg ${isDark ? 'bg-[#06102b] text-white' : 'bg-white text-gray-900'} shadow overflow-hidden`}>
            <table className="w-full table-auto">
              <thead className={`${isDark ? 'bg-[#07203c]' : 'bg-gray-100'}`}>
                <tr>
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Phone</th>
                  <th className="px-4 py-2 text-left">Present</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center" colSpan={5}>No students found.</td>
                  </tr>
                )}
                {filteredStudents.map((s, idx) => (
                  <tr key={s.id} className="border-t">
                    <td className="px-4 py-3">{idx + 1}</td>
                    <td className="px-4 py-3">{s.full_name}</td>
                    <td className="px-4 py-3">{s.email}</td>
                    <td className="px-4 py-3">{s.phone || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={!!attendance[s.id]}
                        onChange={() => handleToggle(s.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
