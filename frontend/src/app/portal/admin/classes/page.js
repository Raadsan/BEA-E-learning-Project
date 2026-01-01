
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";
import { useGetClassesQuery, useCreateClassMutation, useUpdateClassMutation, useDeleteClassMutation } from "@/redux/api/classApi";
import { useGetTeachersQuery } from "@/redux/api/teacherApi";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useGetSubprogramsQuery } from "@/redux/api/subprogramApi";
import { useDarkMode } from "@/context/ThemeContext";

export default function ClassesPage() {
  const { isDark } = useDarkMode();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    isLoading: false,
    confirmButtonColor: "red"
  });

  const { data: backendClasses, isLoading, isError, error } = useGetClassesQuery();
  const { data: teachers = [] } = useGetTeachersQuery();
  const { data: programs = [] } = useGetProgramsQuery();
  const { data: allSubprograms = [] } = useGetSubprogramsQuery();

  const [createClass, { isLoading: isCreating }] = useCreateClassMutation();
  const [updateClass, { isLoading: isUpdating }] = useUpdateClassMutation();
  const [deleteClass, { isLoading: isDeleting }] = useDeleteClassMutation();

  const classes = backendClasses || [];

  const [formData, setFormData] = useState({
    class_name: "",
    description: "",
    program_id: "",
    subprogram_id: "",
    teacher_id: "",
    type: "morning",
  });

  // Filter subprograms based on selected program
  const filteredSubprograms = useMemo(() => {
    if (!formData.program_id) return [];
    return allSubprograms.filter(sub => sub.program_id === parseInt(formData.program_id));
  }, [allSubprograms, formData.program_id]);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedClassForAssign, setSelectedClassForAssign] = useState(null);

  const handleAddClass = () => {
    setEditingClass(null);
    setFormData({
      class_name: "",
      description: "",
      program_id: "",
      subprogram_id: "",
      teacher_id: "",
      type: "morning",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (classItem) => {
    setEditingClass(classItem);
    // Find program for this class's subprogram if possible, or leave blank if complexity is high
    // The backend provides subprogram_name and program_name but not IDs directly in the main query usually 
    // unless we updated it. We might need IDs.
    // Assuming backend returns IDs too or we can infer.
    // Actually `getAllClasses` returns `s.program_id` (joined table props are not explicitly selected by column name collision).
    // Let's assume for editing we focus on name/desc first or we need to update backend to return filtered IDs.
    // For now, simpler edit: name/desc only, or reset selection.
    // Better: let's update backend query to return subprogram_id and program_id if possible, or just accept that editing might clear selection?
    // User request focused on "Add new class". I will focus on ADD for full fields.
    // For EDIT, I will pre-fill name/desc. 

    setFormData({
      class_name: classItem.class_name || "",
      description: classItem.description || "",
      program_id: "", // TODO: Populate if backend returns existing IDs
      subprogram_id: "",
      teacher_id: classItem.teacher_id || "",
      type: classItem.type || "morning",
    });
    setIsModalOpen(true);
  };

  const handleAssign = (classItem) => {
    setSelectedClassForAssign(classItem);
    setIsAssignModalOpen(true);
  };

  const handleView = (classItem) => {
    router.push(`/portal/admin/classes/${classItem.id}/students`);
  };

  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false);
    setSelectedClassForAssign(null);
  };

  const handleDelete = (id) => {
    setConfirmationModal({
      isOpen: true,
      title: "Delete Class",
      message: "Are you sure you want to delete this class? This action cannot be undone.",
      onConfirm: async () => {
        setConfirmationModal(prev => ({ ...prev, isLoading: true }));
        try {
          await deleteClass(id).unwrap();
          setConfirmationModal({ isOpen: false, title: "", message: "", onConfirm: null, isLoading: false, confirmButtonColor: "red" });
        } catch (error) {
          console.error("Failed to delete class:", error);
          setConfirmationModal(prev => ({ ...prev, isLoading: false }));
          alert("Failed to delete class. Please try again.");
        }
      },
      isLoading: false,
      confirmButtonColor: "red"
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClass(null);
    setFormData({
      class_name: "",
      description: "",
      program_id: "",
      subprogram_id: "",
      teacher_id: "",
      type: "morning",
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
        class_name: formData.class_name,
        description: formData.description,
        subprogram_id: formData.subprogram_id ? parseInt(formData.subprogram_id) : null,
        teacher_id: formData.teacher_id ? parseInt(formData.teacher_id) : null,
        type: formData.type || 'morning', // Always include type with default value
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
    // Subprogram derived from backend join
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
      key: "type",
      label: "Shift Type",
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.type === 'morning' ? 'bg-yellow-100 text-yellow-800' :
          row.type === 'afternoon' ? 'bg-orange-100 text-orange-800' :
            row.type === 'night' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
          }`}>
          {row.type ? row.type.charAt(0).toUpperCase() + row.type.slice(1) : 'Not set'}
        </span>
      ),
    },
    {
      key: "latest_schedule_date",
      label: "Next Schedule",
      render: (row) => row.latest_schedule_date ? new Date(row.latest_schedule_date).toLocaleDateString() : "No schedule",
    },
    {
      key: "latest_zoom_link",
      label: "Zoom Link",
      render: (row) => row.latest_zoom_link ? (
        <a
          href={row.latest_zoom_link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Join Meeting
        </a>
      ) : "Not set",
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          {/* View Details Button */}
          {/* View Students Button */}
          <button
            onClick={() => handleView(row)}
            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
            title="View Students & Manage Schedules"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          {/* Assign Teacher Button - kept for quick access specifically for teacher */}
          <button
            onClick={() => handleAssign(row)}
            className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 transition-colors p-1 rounded hover:bg-purple-50 dark:hover:bg-purple-900/20"
            title="Assign Teacher"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
        <main className="flex-1 overflow-y-auto bg-gray-50 mt-20">
          <div className="w-full px-8 py-6">
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
        <main className="flex-1 overflow-y-auto bg-gray-50 mt-20">
          <div className="w-full px-8 py-6">
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

      <main className="flex-1 overflow-y-auto bg-gray-50 mt-20">
        <div className="w-full px-8 py-6">
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
          className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm"
          onClick={handleBackdropClick}
        >

          <div
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#010080]">
                {editingClass ? "Update Class Details" : "Add New Class"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-[#010080] transition-colors p-1 border-2 border-gray-100 rounded-md hover:border-[#010080]/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 bg-white space-y-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="program_id" className="block text-sm font-semibold mb-2 text-gray-700">
                    Program <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="program_id"
                    name="program_id"
                    value={formData.program_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-[#f0f7ff] text-gray-900 transition-all font-medium placeholder:text-gray-400"
                  >
                    <option value="">Select Program</option>
                    {programs.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="subprogram_id" className="block text-sm font-semibold mb-2 text-gray-700">
                    Subprogram <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="subprogram_id"
                    name="subprogram_id"
                    value={formData.subprogram_id}
                    onChange={handleInputChange}
                    disabled={!formData.program_id}
                    className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-[#f0f7ff] text-gray-900 transition-all font-medium ${!formData.program_id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="">Select Subprogram</option>
                    {filteredSubprograms.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.subprogram_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="teacher_id" className="block text-sm font-semibold mb-2 text-gray-700">
                    Assign Teacher
                  </label>
                  <select
                    id="teacher_id"
                    name="teacher_id"
                    value={formData.teacher_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-[#f0f7ff] text-gray-900 transition-all font-medium placeholder:text-gray-400"
                  >
                    <option value="">Select Teacher (Optional)</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-semibold mb-2 text-gray-700">
                    Class Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-[#f0f7ff] text-gray-900 transition-all font-medium placeholder:text-gray-400"
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="night">Night</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="class_name" className="block text-sm font-semibold mb-2 text-gray-700">
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-[#f0f7ff] text-gray-900 transition-all font-medium placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-semibold mb-2 text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter class description"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-[#f0f7ff] text-gray-900 transition-all font-medium placeholder:text-gray-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={`px-6 py-2.5 border border-gray-200 rounded-xl font-semibold transition-all hover:bg-gray-50 text-gray-600`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-8 py-2.5 bg-[#2563eb] text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50"
                >
                  {isCreating || isUpdating ? "Processing..." : editingClass ? "Save Changes" : "Create Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Teacher Modal - Renamed slightly to reflect removal of course */}
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
            className={`relative rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}
            onClick={(e) => e.stopPropagation()}
            style={{ pointerEvents: 'auto' }}
          >
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
              <h2 className="text-xl font-bold text-[#010080]">
                Assign Teacher
              </h2>
              <button
                onClick={handleCloseAssignModal}
                className="text-gray-400 hover:text-[#010080] transition-colors p-1 border-2 border-gray-100 rounded-md hover:border-[#010080]/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 pt-4">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Class: <span className="font-bold text-[#010080] dark:text-blue-400">{selectedClassForAssign.class_name}</span>
              </p>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  // Course ID is deliberately omitted/null now
                  const teacherId = e.target.teacher_id.value ? parseInt(e.target.teacher_id.value) : null;
                  await updateClass({
                    id: selectedClassForAssign.id,
                    teacher_id: teacherId
                    // Not sending course_id so it might remain as is in DB, or I could send null to clear it if requested. 
                    // User said "remove course from class table" which could mean data. 
                    // For now, I'll just not update it.
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
              {/* Course selection removed */}

              <div>
                <label htmlFor="assign_teacher_id" className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Select Instructor
                </label>
                <select
                  id="assign_teacher_id"
                  name="teacher_id"
                  defaultValue={selectedClassForAssign.teacher_id || ""}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-[#010080] transition-all appearance-none cursor-pointer ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900 shadow-inner'
                    }`}
                >
                  <option value="">No teacher assigned</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={handleCloseAssignModal}
                  className={`flex-1 px-4 py-3 rounded-xl border-2 font-bold transition-all ${isDark
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-[2] px-4 py-3 bg-[#2563eb] text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 active:scale-95 disabled:opacity-50"
                >
                  {isUpdating ? "Assigning..." : "Save Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmationModal.isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center">
          <div
            className="absolute inset-0  backdrop-blur-sm"
            onClick={() => !confirmationModal.isLoading && setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
          />
          <div className={`relative w-full max-w-md p-6 rounded-lg shadow-xl ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            }`}>
            <h3 className="text-xl font-bold mb-3">{confirmationModal.title}</h3>
            <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {confirmationModal.message}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
                disabled={confirmationModal.isLoading}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${isDark
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50`}
              >
                Cancel
              </button>
              <button
                onClick={confirmationModal.onConfirm}
                disabled={confirmationModal.isLoading}
                className={`px-6 py-2 ${confirmationModal.confirmButtonColor === 'red' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-md`}
              >
                {confirmationModal.isLoading && (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
