"use client";

import { useState, useEffect } from "react";
import TeacherHeader from "../TeacherHeader";
import { useGetTeacherClassesQuery, useGetAttendanceQuery, useSaveAttendanceMutation } from "@/redux/api/teacherApi";
import { useGetStudentsQuery } from "@/redux/api/studentApi";
import { useDarkMode } from "@/context/ThemeContext";

export default function AttendancePage() {
  const { isDark } = useDarkMode();
  const { data: classesData = [], isLoading: classesLoading } = useGetTeacherClassesQuery();
  const { data: studentsData = [], isLoading: studentsLoading } = useGetStudentsQuery();

  const [selectedClass, setSelectedClass] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
  const [attendance, setAttendance] = useState({}); // { studentId: { hour1: boolean, hour2: boolean } }
  const [markAll, setMarkAll] = useState(false);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [timePeriod, setTimePeriod] = useState('week'); // 'week' or 'month'

  // API Hooks
  const { data: attendanceData, refetch: refetchAttendance } = useGetAttendanceQuery(
    { classId: selectedClass?.id, date },
    { skip: !selectedClass?.id || !date }
  );
  const [saveAttendance] = useSaveAttendanceMutation();

  const classes = classesData || [];
  const students = Array.isArray(studentsData) ? studentsData : (studentsData?.students || []);

  // If we have a class selected, optionally filter students based on some heuristics.
  // For now, show all students if no direct relation can be determined.
  // Only show students if a class is selected
  let filteredStudents = [];
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

  // Apply search filter
  const searchFilteredStudents = filteredStudents.filter((s) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      s.full_name?.toLowerCase().includes(searchLower) ||
      s.email?.toLowerCase().includes(searchLower) ||
      s.phone?.toLowerCase().includes(searchLower)
    );
  });

  // Pagination
  const startIdx = (currentPage - 1) * entriesPerPage;
  const endIdx = startIdx + entriesPerPage;
  const totalPages = Math.ceil(searchFilteredStudents.length / entriesPerPage);
  const paginatedStudents = searchFilteredStudents.slice(startIdx, endIdx);

  useEffect(() => {
    if (selectedClass) {
      const key = `attendance:${selectedClass.id}:${date}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setAttendance(parsed);
          // Check if all students have both hours marked
          const allMarked = searchFilteredStudents.length > 0 &&
            searchFilteredStudents.every((s) =>
              parsed[s.id]?.hour1 && parsed[s.id]?.hour2
            );
          setMarkAll(allMarked);
          return;
        } catch (e) {
          // invalid json - ignore
        }
      }
    }
    // reset when class or date changes
    setAttendance({});
    setMarkAll(false);
    setCurrentPage(1);
  }, [selectedClass, date]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleToggleHour = (studentId, hour) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { hour1: false, hour2: false }),
        [hour]: !prev[studentId]?.[hour],
      },
    }));
  };

  const handleMarkAll = (value) => {
    const updated = {};
    searchFilteredStudents.forEach((s) => {
      updated[s.id] = {
        hour1: value,
        hour2: value,
      };
    });
    setAttendance(updated);
    setMarkAll(value);
  };

  const handleSave = async () => {
    if (!selectedClass) {
      alert("Please select a class before saving attendance.");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    if (date > today) {
      alert("Cannot save attendance for future dates.");
      return;
    }

    try {
      await saveAttendance({
        class_id: selectedClass.id,
        date,
        attendanceData: attendance
      }).unwrap();
      alert("Attendance saved to database.");
      refetchAttendance();
    } catch (err) {
      console.error("Failed to save:", err);
      const errorMessage = err?.data?.error || err?.error || "Failed to save attendance.";
      alert(`Error: ${errorMessage}`);
    }
  };

  // Calculate statistics
  const totalHours = searchFilteredStudents.length * 2;
  const attendedHours = searchFilteredStudents.reduce((sum, s) => {
    const studentAttendance = attendance[s.id] || { hour1: false, hour2: false };
    return sum + (studentAttendance.hour1 ? 1 : 0) + (studentAttendance.hour2 ? 1 : 0);
  }, 0);
  const presentCount = searchFilteredStudents.filter((s) => {
    const studentAttendance = attendance[s.id] || { hour1: false, hour2: false };
    return studentAttendance.hour1 || studentAttendance.hour2;
  }).length;
  const totalCount = searchFilteredStudents.length;
  const absentCount = totalCount - presentCount;

  useEffect(() => {
    // Update markAll when attendance changes
    const allMarked = searchFilteredStudents.length > 0 &&
      searchFilteredStudents.every((s) => {
        const studentAttendance = attendance[s.id] || { hour1: false, hour2: false };
        return studentAttendance.hour1 && studentAttendance.hour2;
      });
    setMarkAll(allMarked);
  }, [attendance, searchFilteredStudents]);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#03081d] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <TeacherHeader />
      <div className="p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-2xl font-semibold">Attendance</h2>
          <div className="flex items-center gap-3 flex-wrap">
            <select
              className={`px-3 py-2 rounded-lg border transition-colors ${isDark ? 'bg-[#06102b] text-white border-[#07203c] hover:border-[#0a2d4f]' : 'bg-white text-gray-900 border-gray-300 hover:border-gray-400'} focus:outline-none focus:ring-2 focus:ring-[#010080]`}
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
              className={`px-3 py-2 rounded-lg border transition-colors ${isDark ? 'bg-[#06102b] text-white border-[#07203c] hover:border-[#0a2d4f]' : 'bg-white text-gray-900 border-gray-300 hover:border-gray-400'} focus:outline-none focus:ring-2 focus:ring-[#010080]`}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <input
                type="checkbox"
                checked={markAll}
                onChange={(e) => handleMarkAll(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#010080] focus:ring-2 focus:ring-[#010080] cursor-pointer"
              />
              <span className="text-sm">Mark All Present</span>
            </label>

            <button
              className="px-4 py-2 rounded-lg bg-[#010080] text-white hover:bg-[#010080]/90 transition-colors font-medium shadow-sm"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>

        <div className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {/* Total Students Card */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-[#06102b] border border-[#07203c]' : 'bg-white border border-gray-200'} shadow-md transition-shadow hover:shadow-lg relative overflow-hidden`}>
              <div className={`text-xs font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Students</div>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className={`text-2xl font-bold mb-1.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>{totalCount}</div>
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-xs font-medium">+100% last month</span>
                  </div>
                </div>
                <div className="relative w-16 h-16 flex-shrink-0">
                  <svg className="transform -rotate-90 w-16 h-16">
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      stroke={isDark ? '#1a1a2e' : '#e5e7eb'}
                      strokeWidth="5"
                      fill="none"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      stroke="#3b82f6"
                      strokeWidth="5"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 26}`}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>100%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Present Students Card */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-[#06102b] border border-[#07203c]' : 'bg-white border border-gray-200'} shadow-md transition-shadow hover:shadow-lg relative overflow-hidden`}>
              <div className={`text-xs font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Present Students</div>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className={`text-2xl font-bold mb-1.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>{presentCount}</div>
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-xs font-medium">
                      {totalCount > 0 ? `+${((presentCount / totalCount) * 100).toFixed(2)}% last month` : '+0% last month'}
                    </span>
                  </div>
                </div>
                <div className="relative w-16 h-16 flex-shrink-0">
                  <svg className="transform -rotate-90 w-16 h-16">
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      stroke={isDark ? '#1a1a2e' : '#e5e7eb'}
                      strokeWidth="5"
                      fill="none"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      stroke="#3b82f6"
                      strokeWidth="5"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 26}`}
                      strokeDashoffset={`${2 * Math.PI * 26 * (1 - (totalCount > 0 ? presentCount / totalCount : 0))}`}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hours Attended Card */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-[#06102b] border border-[#07203c]' : 'bg-white border border-gray-200'} shadow-md transition-shadow hover:shadow-lg relative overflow-hidden`}>
              <div className={`text-xs font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Hours Attended</div>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className={`text-2xl font-bold mb-1.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>{attendedHours}</div>
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-xs font-medium">
                      {totalHours > 0 ? `+${((attendedHours / totalHours) * 100).toFixed(2)}% last month` : '+0% last month'}
                    </span>
                  </div>
                </div>
                <div className="relative w-16 h-16 flex-shrink-0">
                  <svg className="transform -rotate-90 w-16 h-16">
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      stroke={isDark ? '#1a1a2e' : '#e5e7eb'}
                      strokeWidth="5"
                      fill="none"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      stroke="#3b82f6"
                      strokeWidth="5"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 26}`}
                      strokeDashoffset={`${2 * Math.PI * 26 * (1 - (totalHours > 0 ? attendedHours / totalHours : 0))}`}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {totalHours > 0 ? Math.round((attendedHours / totalHours) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Absent Students Card */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-[#06102b] border border-[#07203c]' : 'bg-white border border-gray-200'} shadow-md transition-shadow hover:shadow-lg relative overflow-hidden`}>
              <div className={`text-xs font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Absent Students</div>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className={`text-2xl font-bold mb-1.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>{absentCount}</div>
                  <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                    <span className="text-xs font-medium">
                      {totalCount > 0 ? `-${((absentCount / totalCount) * 100).toFixed(2)}% last month` : '-0% last month'}
                    </span>
                  </div>
                </div>
                <div className="relative w-16 h-16 flex-shrink-0">
                  <svg className="transform -rotate-90 w-16 h-16">
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      stroke={isDark ? '#1a1a2e' : '#e5e7eb'}
                      strokeWidth="5"
                      fill="none"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      stroke="#ef4444"
                      strokeWidth="5"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 26}`}
                      strokeDashoffset={`${2 * Math.PI * 26 * (1 - (totalCount > 0 ? absentCount / totalCount : 0))}`}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {totalCount > 0 ? Math.round((absentCount / totalCount) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>



          {/* Custom Table Container */}
          <div className={`rounded-xl ${isDark ? 'bg-[#06102b] border border-[#07203c]' : 'bg-white border border-gray-200'} shadow-lg overflow-hidden`}>
            {/* Search and Pagination Controls */}
            <div className="p-4 border-b border-gray-200 dark:border-[#07203c] flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${isDark ? 'bg-[#03081d] text-white border-[#07203c] placeholder-gray-500' : 'bg-gray-50 text-gray-900 border-gray-300 placeholder-gray-400'} focus:outline-none focus:ring-2 focus:ring-[#010080]`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Show</label>
                <select
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-2 rounded-lg border transition-colors ${isDark ? 'bg-[#03081d] text-white border-[#07203c]' : 'bg-white text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#010080]`}
                >
                  {[5, 10, 25, 50, 100].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>entries</span>
              </div>
            </div>

            {/* Custom Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${isDark ? 'bg-[#07203c]' : 'bg-[#010080]'} text-white`}>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">#</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Hour 1</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Hour 2</th>
                  </tr>
                </thead>
                <tbody className={`${isDark ? 'divide-[#07203c]' : 'divide-gray-200'}`}>
                  {!selectedClass ? (
                    <tr>
                      <td className="px-6 py-12 text-center" colSpan={6}>
                        <div className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Please select a class to view students.
                        </div>
                      </td>
                    </tr>
                  ) : paginatedStudents.length === 0 ? (
                    <tr>
                      <td className="px-6 py-12 text-center" colSpan={6}>
                        <div className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {search ? 'No students found matching your search.' : 'No students found.'}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedStudents.map((s, idx) => {
                      const studentAttendance = attendance[s.id] || { hour1: false, hour2: false };
                      return (
                        <tr
                          key={s.id}
                          className={`
                            ${idx % 2 === 0
                              ? isDark ? 'bg-[#06102b]' : 'bg-white'
                              : isDark ? 'bg-[#0a1525]' : 'bg-gray-50'
                            }
                            ${isDark ? 'hover:bg-[#0d1a2e]' : 'hover:bg-gray-100'}
                            transition-colors duration-150
                            border-b ${isDark ? 'border-[#07203c]' : 'border-gray-200'}
                          `}
                        >
                          <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-700'} font-medium`}>
                            {startIdx + idx + 1}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-white' : 'text-gray-900'} font-medium`}>
                            {s.full_name || 'N/A'}
                          </td>
                          <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {s.email || 'N/A'}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {s.phone || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <label className="flex items-center justify-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={studentAttendance.hour1}
                                onChange={() => handleToggleHour(s.id, 'hour1')}
                                className={`w-5 h-5 rounded border-2 transition-colors ${studentAttendance.hour1
                                  ? 'bg-[#010080] border-[#010080] text-white'
                                  : isDark
                                    ? 'border-gray-500 bg-transparent'
                                    : 'border-gray-300 bg-white'
                                  } focus:ring-2 focus:ring-[#010080] focus:ring-offset-0 cursor-pointer`}
                              />
                            </label>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <label className="flex items-center justify-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={studentAttendance.hour2}
                                onChange={() => handleToggleHour(s.id, 'hour2')}
                                className={`w-5 h-5 rounded border-2 transition-colors ${studentAttendance.hour2
                                  ? 'bg-[#010080] border-[#010080] text-white'
                                  : isDark
                                    ? 'border-gray-500 bg-transparent'
                                    : 'border-gray-300 bg-white'
                                  } focus:ring-2 focus:ring-[#010080] focus:ring-offset-0 cursor-pointer`}
                              />
                            </label>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {searchFilteredStudents.length > 0 && (
              <div className={`px-4 py-3 border-t ${isDark ? 'border-[#07203c] bg-[#0a1525]' : 'border-gray-200 bg-gray-50'} flex flex-col sm:flex-row justify-between items-center gap-4`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Showing {startIdx + 1} to {Math.min(endIdx, searchFilteredStudents.length)} of {searchFilteredStudents.length} entries
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className={`px-3 py-1.5 rounded-lg transition-colors ${currentPage === 1
                      ? isDark ? 'bg-[#07203c] text-gray-600 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : isDark ? 'bg-[#07203c] text-white hover:bg-[#0a2d4f]' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                      }`}
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                  >
                    Previous
                  </button>
                  <div className={`px-3 py-1.5 rounded-lg ${isDark ? 'bg-[#07203c] text-white' : 'bg-white text-gray-700 border border-gray-300'}`}>
                    Page {currentPage} of {totalPages || 1}
                  </div>
                  <button
                    className={`px-3 py-1.5 rounded-lg transition-colors ${currentPage === totalPages || totalPages === 0
                      ? isDark ? 'bg-[#07203c] text-gray-600 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : isDark ? 'bg-[#07203c] text-white hover:bg-[#0a2d4f]' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                      }`}
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
