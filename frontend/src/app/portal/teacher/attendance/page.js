"use client";

import { useState, useEffect } from "react";
import TeacherHeader from "../TeacherHeader";
import DataTable from "@/components/DataTable";
import { useGetClassesQuery } from "@/redux/api/classApi";
import { useGetStudentsQuery } from "@/redux/api/studentApi";
import { useGetAttendanceQuery, useSaveAttendanceMutation } from "@/redux/api/attendanceApi";
import { useDarkMode } from "@/context/ThemeContext";
import { Toast, useToast } from "@/components/Toast";

export default function AttendancePage() {
  const { isDark } = useDarkMode();
  const { toast, showToast, hideToast } = useToast();

  const { data: classesData = [], isLoading: classesLoading } = useGetClassesQuery();
  const { data: studentsData = [], isLoading: studentsLoading } = useGetStudentsQuery();

  const [selectedClass, setSelectedClass] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD

  // API Query for attendance
  const { data: attendanceData, isLoading: attendanceLoading, refetch } = useGetAttendanceQuery(
    { classId: selectedClass?.id, date },
    { skip: !selectedClass?.id }
  );

  const [saveAttendance, { isLoading: isSaving }] = useSaveAttendanceMutation();

  const [attendance, setAttendance] = useState({});
  const [markAll, setMarkAll] = useState(false);

  const classes = classesData || [];
  const students = Array.isArray(studentsData) ? studentsData : (studentsData?.students || []);

  // If we have a class selected, optionally filter students based on some heuristics.
  // For now, show all students if no direct relation can be determined.
  // Only show students if a class is selected
  let filteredStudents = [];
  if (selectedClass) {
    // Start with all students (or filter by class_id if you have that relation)
    // currently using heuristic matching as per previous logic
    filteredStudents = students.filter((s) => {
      // If the student records actually have class_id, we should use that:
      if (s.class_id && selectedClass.id) {
        return String(s.class_id) === String(selectedClass.id);
      }

      // Fallback to existing heuristic if class_id not reliable yet
      if (!s.chosen_subprogram && !s.chosen_program) return true;
      const classSubprogram = selectedClass.subprogram_name || selectedClass.program_name || null;
      if (!classSubprogram) return true; // Show all if class has no subprogram?? Or maybe restrictive?

      const chosen = s.chosen_subprogram || s.chosen_program;
      if (!chosen) return true;
      if (typeof chosen === 'string') {
        return chosen.toLowerCase().includes(String(classSubprogram).toLowerCase());
      }
      return true;
    });
  }


  // Sync local state with API data when it loads
  useEffect(() => {
    if (attendanceData) {
      setAttendance(attendanceData);
      // Check if all filtered students marked? (Might need to wait for filteredStudents calculation)
    } else {
      setAttendance({});
    }
  }, [attendanceData, selectedClass, date]);

  const handleToggle = (studentId, hour) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [hour]: !prev[studentId]?.[hour],
      },
    }));
  };

  const handleMarkAll = (value) => {
    const updated = {};
    filteredStudents.forEach((s) => (updated[s.id] = { hr1: value, hr2: value }));
    setAttendance(updated);
    setMarkAll(value);
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
        attendanceData: attendance
      }).unwrap();
      showToast("Attendance saved successfully!", "success");
    } catch (error) {
      console.error("Failed to save attendance:", error);
      showToast("Failed to save attendance.", "error");
    }
  };


  // Calculate statistics based on at least one hour present? 
  // Or maybe we treat "Present" as fully present (both hours) or partially?
  // Let's count "Present" if at least one hour is marked for now, or maybe separate counts.
  // User asked for checkboxes like hr1 and hr2.
  const presentCount = Object.values(attendance).filter(s => s?.hr1 || s?.hr2).length;
  const totalCount = filteredStudents.length;
  const absentCount = totalCount - presentCount;

  const columns = [
    {
      key: "id",
      label: "#",
      render: (_, index) => index + 1,
    },
    {
      key: "full_name",
      label: "Name",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "phone",
      label: "Phone",
      render: (row) => row.phone || 'N/A',
    },
    {
      key: "hr1",
      label: "Hr 1",
      render: (row) => (
        <input
          type="checkbox"
          checked={!!attendance[row.id]?.hr1}
          onChange={(e) => {
            e.stopPropagation();
            handleToggle(row.id, "hr1");
          }}
          className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />
      ),
    },
    {
      key: "hr2",
      label: "Hr 2",
      render: (row) => (
        <input
          type="checkbox"
          checked={!!attendance[row.id]?.hr2}
          onChange={(e) => {
            e.stopPropagation();
            handleToggle(row.id, "hr2");
          }}
          className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />
      ),
    },
  ];

  useEffect(() => {
    // Update markAll when attendance changes (if all students have both hours marked)
    const allPresent = filteredStudents.length > 0 && filteredStudents.every((s) => attendance[s.id]?.hr1 && attendance[s.id]?.hr2);
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

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
            duration={toast.duration}
          />
        )}

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

          <DataTable
            title="Student Attendance"
            columns={columns}
            data={filteredStudents}
            showAddButton={false}
          />
        </div>
      </div>
    </div>
  );
}
