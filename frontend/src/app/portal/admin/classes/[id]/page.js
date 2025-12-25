"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminHeader from "@/components/AdminHeader";
import { useGetClassQuery, useGetClassSchedulesQuery, useCreateClassScheduleMutation, useUpdateClassScheduleMutation, useDeleteClassScheduleMutation } from "@/redux/api/classApi";
import { useDarkMode } from "@/context/ThemeContext";

export default function ClassDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isDark } = useDarkMode();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  const { data: classItem, isLoading: classLoading } = useGetClassQuery(id);
  const { data: schedules = [], isLoading: schedulesLoading } = useGetClassSchedulesQuery(id);
  const [createSchedule, { isLoading: isCreating }] = useCreateClassScheduleMutation();
  const [updateSchedule, { isLoading: isUpdating }] = useUpdateClassScheduleMutation();
  const [deleteSchedule, { isLoading: isDeleting }] = useDeleteClassScheduleMutation();

  const [scheduleForm, setScheduleForm] = useState({
    schedule_date: "",
    zoom_link: "",
  });

  const handleAddSchedule = () => {
    setEditingSchedule(null);
    setScheduleForm({
      schedule_date: "",
      zoom_link: "",
    });
    setIsScheduleModalOpen(true);
  };

  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setScheduleForm({
      schedule_date: schedule.schedule_date.split('T')[0], // Format for date input
      zoom_link: schedule.zoom_link || "",
    });
    setIsScheduleModalOpen(true);
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (window.confirm("Are you sure you want to delete this schedule?")) {
      try {
        await deleteSchedule(scheduleId).unwrap();
      } catch (error) {
        console.error("Failed to delete schedule:", error);
        alert("Failed to delete schedule. Please try again.");
      }
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();

    try {
      const submitData = {
        schedule_date: scheduleForm.schedule_date,
        zoom_link: scheduleForm.zoom_link || null,
      };

      if (editingSchedule) {
        await updateSchedule({ id: editingSchedule.id, ...submitData }).unwrap();
      } else {
        await createSchedule({ classId: id, ...submitData }).unwrap();
      }

      setIsScheduleModalOpen(false);
    } catch (error) {
      console.error("Failed to save schedule:", error);
      alert(error?.data?.error || "Failed to save schedule. Please try again.");
    }
  };

  const handleScheduleInputChange = (e) => {
    const { name, value } = e.target;
    setScheduleForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (classLoading) {
    return (
      <>
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-gray-50 mt-20">
          <div className="w-full px-8 py-6">
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Loading class details...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!classItem) {
    return (
      <>
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-gray-50 mt-20">
          <div className="w-full px-8 py-6">
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400">Class not found</p>
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
          {/* Class Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{classItem.class_name}</h1>
                <p className="text-gray-600 mt-1">{classItem.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>Program: {classItem.program_name}</span>
                  <span>Subprogram: {classItem.subprogram_name}</span>
                  <span>Teacher: {classItem.teacher_name || "Not assigned"}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    classItem.type === 'morning' ? 'bg-yellow-100 text-yellow-800' :
                    classItem.type === 'afternoon' ? 'bg-orange-100 text-orange-800' :
                    classItem.type === 'night' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {classItem.type}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push(`/portal/admin/classes/${id}/students`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Students
                </button>
                <button
                  onClick={() => router.push('/portal/admin/classes')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back to Classes
                </button>
              </div>
            </div>
          </div>

          {/* Schedules Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Class Schedules</h2>
                <button
                  onClick={handleAddSchedule}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Schedule
                </button>
              </div>
            </div>

            <div className="p-6">
              {schedulesLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">Loading schedules...</p>
                </div>
              ) : schedules.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">No schedules added yet.</p>
                  <button
                    onClick={handleAddSchedule}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add First Schedule
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {schedules.map((schedule) => (
                    <div key={schedule.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium text-gray-800">
                              {new Date(schedule.schedule_date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(schedule.schedule_date).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          {schedule.zoom_link && (
                            <a
                              href={schedule.zoom_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                            >
                              Join Zoom
                            </a>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditSchedule(schedule)}
                            className="px-3 py-1 text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSchedule(schedule.id)}
                            className="px-3 py-1 text-red-600 hover:text-red-800 transition-colors"
                            disabled={isDeleting}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Schedule Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden mx-4">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                {editingSchedule ? "Edit Schedule" : "Add Schedule"}
              </h2>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="schedule_date" className="block text-sm font-medium mb-1 text-gray-700">
                  Schedule Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="schedule_date"
                  name="schedule_date"
                  value={scheduleForm.schedule_date}
                  onChange={handleScheduleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="zoom_link" className="block text-sm font-medium mb-1 text-gray-700">
                  Zoom Link
                </label>
                <input
                  type="url"
                  id="zoom_link"
                  name="zoom_link"
                  value={scheduleForm.zoom_link}
                  onChange={handleScheduleInputChange}
                  placeholder="https://zoom.us/j/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating || isUpdating ? "Saving..." : editingSchedule ? "Update Schedule" : "Add Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}