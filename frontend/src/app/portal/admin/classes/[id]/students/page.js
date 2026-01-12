"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminHeader from "@/components/AdminHeader";
import Modal from "@/components/Modal";
import DataTable from "@/components/DataTable";
import { useGetStudentsQuery } from "@/redux/api/studentApi";
import { useGetClassesQuery, useGetClassSchedulesQuery } from "@/redux/api/classApi";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useGetSubprogramsQuery } from "@/redux/api/subprogramApi";
import { useGetTeachersQuery } from "@/redux/api/teacherApi";
import { useGetAdminsQuery } from "@/redux/api/adminApi";
import { useDarkMode } from "@/context/ThemeContext";

export default function ClassStudentsPage() {
  const { isDark } = useDarkMode();
  const router = useRouter();
  const params = useParams();
  const classId = params.id;

  const { data: allStudents, isLoading: studentsLoading, isError: studentsError } = useGetStudentsQuery();
  const { data: classes, isLoading: classesLoading } = useGetClassesQuery();
  const { data: programs = [] } = useGetProgramsQuery();
  const { data: subprograms = [] } = useGetSubprogramsQuery();
  const { data: teachers = [] } = useGetTeachersQuery();
  const { data: admins = [] } = useGetAdminsQuery();
  const { data: schedules = [], isLoading: schedulesLoading } = useGetClassSchedulesQuery(classId);

  // Tab state
  const [activeTab, setActiveTab] = useState('students');

  // Notification state
  const [notificationForm, setNotificationForm] = useState({
    title: "",
    content: "",
    targetType: "all_students", // Default to students only
    studentId: "",
    teacherId: "",
    adminId: "",
  });
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // Find the current class
  const currentClass = classes?.find(cls => cls.id == classId);

  // Filter students in this class
  const classStudents = useMemo(() => {
    if (!allStudents || !classId) return [];
    return allStudents.filter(student => student.class_id == classId);
  }, [allStudents, classId]);

  // Get subprogram name for display
  const getSubprogramName = (subprogramId) => {
    if (!subprogramId) return "N/A";
    const subprogram = subprograms.find(sp => sp.id == subprogramId);
    return subprogram ? subprogram.subprogram_name : "N/A";
  };

  // Get program name for display
  const getProgramName = (programId) => {
    if (!programId) return "N/A";
    const program = programs.find(p => p.id == programId);
    return program ? program.title : "N/A";
  };

  // Notification handlers
  const handleSendNotification = () => {
    setIsNotificationModalOpen(true);
  };

  const handleNotificationSubmit = async (e) => {
    e.preventDefault();

    try {
      const notificationData = {
        title: notificationForm.title,
        content: notificationForm.content,
        classId: classId,
        targetType: notificationForm.targetType,
        studentId: notificationForm.targetType === 'student_by_id' ? notificationForm.studentId : null,
        teacherId: notificationForm.targetType === 'teacher_by_id' ? notificationForm.teacherId : null,
        adminId: notificationForm.targetType === 'admin_by_id' ? notificationForm.adminId : null,
      };

      // Send notification to backend
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/api/announcements/classes/${classId}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title: notificationForm.title,
          content: notificationForm.content,
          targetType: notificationForm.targetType,
          ...(notificationForm.targetType === 'student_by_id' && { studentId: notificationForm.studentId }),
          ...(notificationForm.targetType === 'teacher_by_id' && { teacherId: notificationForm.teacherId }),
          ...(notificationForm.targetType === 'admin_by_id' && { adminId: notificationForm.adminId })
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      alert('Notification sent successfully!');
      setIsNotificationModalOpen(false);
      setNotificationForm({
        title: "",
        content: "",
        targetType: "all_students",
        studentId: "",
        teacherId: "",
        adminId: "",
      });
    } catch (error) {
      console.error("Failed to send notification:", error);
      alert("Failed to send notification. Please try again.");
    }
  };

  // Custom table columns for students
  const columns = [
    {
      key: "full_name",
      label: "Student Name",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "phone",
      label: "Phone",
    },
    {
      key: "sex",
      label: "Sex",
      render: (row) => row.sex ? row.sex.charAt(0).toUpperCase() + row.sex.slice(1) : "N/A",
    },
    {
      key: "age",
      label: "Age",
    },
    {
      key: "chosen_program",
      label: "Program",
      render: (row) => getProgramName(row.chosen_program_id || row.chosen_program),
    },
    {
      key: "chosen_subprogram",
      label: "Subprogram",
      render: (row) => getSubprogramName(row.chosen_subprogram),
    },
    {
      key: "approval_status",
      label: "Status",
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.approval_status === 'approved' ? 'bg-green-100 text-green-800' :
          row.approval_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
          {row.approval_status ? row.approval_status.charAt(0).toUpperCase() + row.approval_status.slice(1) : 'Pending'}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <button
          onClick={() => router.push(`/portal/admin/students/${row.id}`)}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${isDark
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          title="View Student Details"
        >
          View
        </button>
      ),
    },
  ];

  if (classesLoading || studentsLoading) {
    return (
      <>
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-gray-50 mt-20">
          <div className="w-full px-8 py-6">
            <div className="text-center py-12">
              <p className="text-gray-600">Loading class students...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!currentClass) {
    return (
      <>
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-gray-50 mt-20">
          <div className="w-full px-8 py-6">
            <div className="text-center py-12">
              <p className="text-red-600">Class not found</p>
              <button
                onClick={() => router.back()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go Back
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AdminHeader />

      <main className="flex-1 overflow-y-auto bg-gray-50 mt-20">
        <div className="w-full px-8 py-6">
          {/* Class Info Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Students in {currentClass.class_name}
                </h1>
                <p className="text-gray-600 mt-1">
                  {currentClass.subprogram_name} • {currentClass.program_name}
                  {currentClass.type && (
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${currentClass.type === 'morning' ? 'bg-yellow-100 text-yellow-800' :
                      currentClass.type === 'afternoon' ? 'bg-orange-100 text-orange-800' :
                        currentClass.type === 'night' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                      }`}>
                      {currentClass.type.charAt(0).toUpperCase() + currentClass.type.slice(1)} Shift
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('students')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'students'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  View Students ({classStudents.length})
                </button>
                <button
                  onClick={() => setActiveTab('schedules')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'schedules'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  View Schedules ({schedules.length})
                </button>
              </nav>
            </div>
          </div>

          {/* Students Tab Content */}
          {activeTab === 'students' && (
            <>
              {/* Class Stats */}


              {/* Students Table */}
              <DataTable
                title={`Students in ${currentClass.class_name}`}
                columns={columns}
                data={classStudents}
                showAddButton={false}
              />
            </>
          )}

          {/* Schedules Tab Content */}
          {activeTab === 'schedules' && (
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Class Schedules</h2>
              </div>

              {schedules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No schedules added for this class.
                </div>
              ) : (
                <div className="space-y-3">
                  {schedules.map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {new Date(schedule.schedule_date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        {schedule.zoom_link && (
                          <div className="text-sm text-blue-600 mt-1">
                            <a href={schedule.zoom_link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              Zoom Link
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Modal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        title="Send Notification"
      >
        <form onSubmit={handleNotificationSubmit}>
          <div className="mb-4">
            <label htmlFor="notificationTitle" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="notificationTitle"
              value={notificationForm.title}
              onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="notificationContent" className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              id="notificationContent"
              value={notificationForm.content}
              onChange={(e) => setNotificationForm({ ...notificationForm, content: e.target.value })}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Send To *
            </label>
            <select
              value={notificationForm.targetType}
              onChange={(e) => setNotificationForm({ ...notificationForm, targetType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all_students">All Students (Class Only)</option>
              <option value="student_by_id">Specific Student</option>
              <option value="teacher_by_id">Specific Teacher</option>
              <option value="admin_by_id">Specific Admin</option>
            </select>
          </div>

          {notificationForm.targetType === 'student_by_id' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student *
              </label>
              <select
                value={notificationForm.studentId}
                onChange={(e) => setNotificationForm({ ...notificationForm, studentId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required={notificationForm.targetType === 'student_by_id'}
              >
                <option value="">Select a student</option>
                {classStudents.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.full_name} ({student.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {notificationForm.targetType === 'teacher_by_id' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teacher *
              </label>
              <select
                value={notificationForm.teacherId}
                onChange={(e) => setNotificationForm({ ...notificationForm, teacherId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required={notificationForm.targetType === 'teacher_by_id'}
              >
                <option value="">Select a teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.full_name} ({teacher.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {notificationForm.targetType === 'admin_by_id' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin *
              </label>
              <select
                value={notificationForm.adminId}
                onChange={(e) => setNotificationForm({ ...notificationForm, adminId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required={notificationForm.targetType === 'admin_by_id'}
              >
                <option value="">Select an admin</option>
                {admins.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.full_name} ({admin.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsNotificationModalOpen(false);
                setNotificationForm({
                  title: "",
                  content: "",
                  targetType: "all_students",
                  studentId: "",
                  teacherId: "",
                  adminId: "",
                });
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Send Notification
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}