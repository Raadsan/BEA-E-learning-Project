"use client";

import { useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";
import { useGetClassesQuery, useCreateClassMutation, useUpdateClassMutation, useDeleteClassMutation } from "@/redux/api/classApi";
import { useGetCoursesQuery } from "@/redux/api/courseApi";
import { useGetTeachersQuery } from "@/redux/api/teacherApi";
import { useDarkMode } from "@/context/ThemeContext";

export default function ClassesPage() {
  const { isDark } = useDarkMode();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  const { data: backendClasses, isLoading, isError, error } = useGetClassesQuery();
  const { data: courses = [] } = useGetCoursesQuery();
  const { data: teachers = [] } = useGetTeachersQuery();
  const [createClass, { isLoading: isCreating }] = useCreateClassMutation();
  const [updateClass, { isLoading: isUpdating }] = useUpdateClassMutation();
  const [deleteClass, { isLoading: isDeleting }] = useDeleteClassMutation();

  const classes = backendClasses || [];

  const [formData, setFormData] = useState({
    class_name: "",
    description: "",
  });

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedClassForAssign, setSelectedClassForAssign] = useState(null);

  const handleAddClass = () => {
    setEditingClass(null);
    setFormData({
      class_name: "",
      description: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (classItem) => {
    setEditingClass(classItem);
    setFormData({
      class_name: classItem.class_name || "",
      description: classItem.description || "",
    });
    setIsModalOpen(true);
  };

  const handleAssign = (classItem) => {
    setSelectedClassForAssign(classItem);
    setIsAssignModalOpen(true);
  };

  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false);
    setSelectedClassForAssign(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this class?")) {
      try {
        await deleteClass(id).unwrap();
      } catch (error) {
        console.error("Failed to delete class:", error);
        alert("Failed to delete class. Please try again.");
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClass(null);
    setFormData({
      class_name: "",
      description: "",
    });
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const submitData = {
        ...formData,
      };

      if (editingClass) {
        await updateClass({ id: editingClass.id, ...submitData }).unwrap();
      } else {
        await createClass(submitData).unwrap();
      }

      handleCloseModal();
    } catch (error) {
      console.error("Failed to save class:", error);
      alert(error?.data?.error || "Failed to save class. Please try again.");
    }

    return false;
  };

  const columns = [
    {
      key: "class_name",
      label: "Class Name",
    },
    {
      key: "description",
      label: "Description",
      render: (row) => row.description || "No description",
    },
    {
      key: "course_title",
      label: "Course",
      render: (row) => row.course_title || "Not assigned",
    },
    {
      key: "subprogram_name",
      label: "Subprogram",
      render: (row) => row.subprogram_name || "Not assigned",
    },
    {
      key: "program_name",
      label: "Program",
      render: (row) => row.program_name || "Not assigned",
    },
    {
      key: "teacher_name",
      label: "Assigned Teacher",
      render: (row) => row.teacher_name || "No assigned teacher",
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleAssign(row)}
            className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 transition-colors p-1 rounded hover:bg-purple-50 dark:hover:bg-purple-900/20"
            title="Assign Course"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
            title="Edit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Delete"
            disabled={isDeleting}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <>
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Loading classes...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400">Error loading classes: {error?.data?.error || "Unknown error"}</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AdminHeader />
      
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          <DataTable
            title="Class Management"
            columns={columns}
            data={classes}
            onAddClick={handleAddClass}
            showAddButton={true}
          />
        </div>
      </main>

      {/* Add/Edit Class Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ pointerEvents: 'none' }}
        >
          <div 
            className="absolute inset-0 bg-transparent"
            onClick={handleBackdropClick}
            style={{ pointerEvents: 'auto' }}
          />
          
          <div 
            className={`relative rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4 border-2 ${
              isDark ? 'bg-gray-800/95 border-gray-600' : 'bg-white/95 border-gray-300'
            }`}
            onClick={(e) => e.stopPropagation()}
            style={{ pointerEvents: 'auto', backdropFilter: 'blur(2px)' }}
          >
            <div className={`sticky top-0 border-b px-6 py-4 flex items-center justify-between ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                {editingClass ? "Edit Class" : "Add New Class"}
              </h2>
              <button
                onClick={handleCloseModal}
                className={`transition-colors ${
                  isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="class_name" className={`block text-sm font-medium mb-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Class Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="class_name"
                  name="class_name"
                  value={formData.class_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter class name"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label htmlFor="description" className={`block text-sm font-medium mb-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter class description"
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={`px-4 py-2 border rounded-lg transition-colors ${
                    isDark
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating || isUpdating ? "Saving..." : editingClass ? "Update Class" : "Add Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Course Modal */}
      {isAssignModalOpen && selectedClassForAssign && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ pointerEvents: 'none' }}
        >
          <div 
            className="absolute inset-0 bg-transparent"
            onClick={handleCloseAssignModal}
            style={{ pointerEvents: 'auto' }}
          />
          
          <div 
            className={`relative rounded-lg shadow-2xl w-full max-w-4xl mx-4 border-2 ${
              isDark ? 'bg-gray-800/95 border-gray-600' : 'bg-white/95 border-gray-300'
            }`}
            onClick={(e) => e.stopPropagation()}
            style={{ pointerEvents: 'auto', backdropFilter: 'blur(2px)' }}
          >
            <div className={`sticky top-0 border-b px-6 py-4 flex items-center justify-between ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                Assign Course & Teacher to {selectedClassForAssign.class_name}
              </h2>
              <button
                onClick={handleCloseAssignModal}
                className={`transition-colors ${
                  isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const courseId = e.target.course_id.value ? parseInt(e.target.course_id.value) : null;
                  const teacherId = e.target.teacher_id.value ? parseInt(e.target.teacher_id.value) : null;
                  await updateClass({
                    id: selectedClassForAssign.id,
                    course_id: courseId,
                    teacher_id: teacherId
                  }).unwrap();
                  alert("Assignment updated successfully!");
                  handleCloseAssignModal();
                } catch (error) {
                  console.error("Failed to assign:", error);
                  alert(error?.data?.error || "Failed to assign. Please try again.");
                }
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label htmlFor="assign_course_id" className={`block text-sm font-medium mb-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Select Course
                </label>
                <select
                  id="assign_course_id"
                  name="course_id"
                  defaultValue={selectedClassForAssign.course_id || ""}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Course (Optional)</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.course_title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="assign_teacher_id" className={`block text-sm font-medium mb-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Select Teacher
                </label>
                <select
                  id="assign_teacher_id"
                  name="teacher_id"
                  defaultValue={selectedClassForAssign.teacher_id || ""}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Teacher (Optional)</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCloseAssignModal}
                  className={`px-4 py-2 border rounded-lg transition-colors ${
                    isDark
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? "Assigning..." : "Save Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
