"use client";

import { useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";
import { useGetTeachersQuery, useCreateTeacherMutation, useUpdateTeacherMutation, useDeleteTeacherMutation } from "@/redux/api/teacherApi";
import { useGetClassesQuery } from "@/redux/api/classApi";
import { useDarkMode } from "@/context/ThemeContext";
import { useToast } from "@/components/Toast";

export default function TeachersPage() {
  const { isDark } = useDarkMode();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [viewingTeacher, setViewingTeacher] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    isLoading: false
  });

  const { data: backendTeachers, isLoading, isError, error } = useGetTeachersQuery();
  const { data: classes = [] } = useGetClassesQuery();
  const [createTeacher, { isLoading: isCreating }] = useCreateTeacherMutation();
  const [updateTeacher, { isLoading: isUpdating }] = useUpdateTeacherMutation();
  const [deleteTeacher, { isLoading: isDeleting }] = useDeleteTeacherMutation();

  const teachers = backendTeachers || [];

  // Get classes assigned to the viewing teacher
  const getAssignedClasses = (teacherId) => {
    return classes.filter(c => c.teacher_id === teacherId);
  };

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    specialization: "",
    highest_qualification: "",
    years_experience: "",
    bio: "",
    portfolio_link: "",
    skills: "",
    hire_date: "",
    password: "",
  });

  const handleAddTeacher = () => {
    setEditingTeacher(null);
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      country: "",
      city: "",
      specialization: "",
      highest_qualification: "",
      years_experience: "",
      bio: "",
      portfolio_link: "",
      skills: "",
      hire_date: "",
      password: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      full_name: teacher.full_name || "",
      email: teacher.email || "",
      phone: teacher.phone || "",
      country: teacher.country || "",
      city: teacher.city || "",
      specialization: teacher.specialization || "",
      highest_qualification: teacher.highest_qualification || "",
      years_experience: teacher.years_experience || "",
      bio: teacher.bio || "",
      portfolio_link: teacher.portfolio_link || "",
      skills: teacher.skills || "",
      hire_date: teacher.hire_date || "",
      password: "", // Don't pre-fill password
    });
    setIsModalOpen(true);
  };

  const handleStatusToggle = (teacher) => {
    const newStatus = teacher.status === 'active' ? 'inactive' : 'active';
    const confirmMessage = `Do you want to change status of ${teacher.full_name} to ${newStatus}?`;

    setConfirmationModal({
      isOpen: true,
      title: "Confirm Status Change",
      message: confirmMessage,
      onConfirm: async () => {
        setConfirmationModal(prev => ({ ...prev, isLoading: true }));
        try {
          await updateTeacher({ id: teacher.id, status: newStatus }).unwrap();
          setConfirmationModal({ isOpen: false, title: "", message: "", onConfirm: null, isLoading: false });
        } catch (error) {
          console.error("Failed to update status:", error);
          setConfirmationModal(prev => ({ ...prev, isLoading: false }));
          // Ideally use a toast here, but for now I'll stick to not using alert as requested, maybe just log or keep modal open with error
          showToast(error?.data?.error || "Failed to update status.", "error");
        }
      },
      isLoading: false
    });
  };

  const handleDelete = (id) => {
    setConfirmationModal({
      isOpen: true,
      title: "Delete Teacher",
      message: "Are you sure you want to delete this teacher? This action cannot be undone.",
      onConfirm: async () => {
        setConfirmationModal(prev => ({ ...prev, isLoading: true }));
        try {
          await deleteTeacher(id).unwrap();
          setConfirmationModal({ isOpen: false, title: "", message: "", onConfirm: null, isLoading: false });
        } catch (error) {
          console.error("Failed to delete teacher:", error);
          setConfirmationModal(prev => ({ ...prev, isLoading: false }));
          showToast("Failed to delete teacher. Please try again.", "error");
        }
      },
      isLoading: false
    });
  };

  const handleView = (teacher) => {
    setViewingTeacher(teacher);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingTeacher(null);
  };

  const handleAssign = (teacher) => {
    // Note: Teacher assignment to classes has been removed
    // This functionality is no longer available
    showToast("Teacher assignment to classes has been removed. Teachers are no longer directly assigned to classes.", "info");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTeacher(null);
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      country: "",
      city: "",
      specialization: "",
      highest_qualification: "",
      years_experience: "",
      bio: "",
      portfolio_link: "",
      skills: "",
      hire_date: "",
      password: "",
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
      const submitData = { ...formData };

      // Convert years_experience to number
      if (submitData.years_experience) {
        submitData.years_experience = parseInt(submitData.years_experience);
      }

      // Only include password if it's provided (for updates)
      if (!submitData.password || submitData.password.trim() === "") {
        delete submitData.password;
      }

      if (editingTeacher) {
        await updateTeacher({ id: editingTeacher.id, ...submitData }).unwrap();
      } else {
        // Password is required for new teachers
        if (!submitData.password || submitData.password.trim() === "") {
          showToast("Password is required for new teachers", "error");
          return;
        }
        await createTeacher(submitData).unwrap();
      }

      handleCloseModal();
    } catch (error) {
      console.error("Failed to save teacher:", error);
      showToast(error?.data?.error || "Failed to save teacher. Please try again.", "error");
    }

    return false;
  };

  const columns = [
    {
      key: "full_name",
      label: "Full Name",
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
      key: "country",
      label: "Country",
    },
    {
      key: "city",
      label: "City",
    },
    {
      key: "specialization",
      label: "Specialization",
    },
    {
      key: "highest_qualification",
      label: "Qualification",
    },
    {
      key: "years_experience",
      label: "Experience",
      render: (row) => `${row.years_experience || 0} years`,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <button
          onClick={() => handleStatusToggle(row)}
          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer transition-opacity hover:opacity-80 ${row.status === 'active'
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}
          title="Click to toggle status"
        >
          {row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : 'Active'}
        </button>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleView(row)}
            className="text-green-600 bg-green  hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
            title="View"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
          <div className="w-full px-6 py-6">
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Loading teachers...</p>
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
          <div className="w-full px-6 py-6">
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400">Error loading teachers: {error?.data?.error || "Unknown error"}</p>
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
            title="Teachers"
            columns={columns}
            data={teachers}
            onAddClick={handleAddTeacher}
            showAddButton={true}
          />
        </div>
      </main>

      {/* Add/Edit Teacher Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseModal}
          />

          <div
            className={`relative rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`sticky top-0 z-10 border-b px-6 py-4 flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'
                }`}>
                {editingTeacher ? "Edit Teacher" : "Add New Teacher"}
              </h2>
              <button
                onClick={handleCloseModal}
                className={`transition-colors ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="full_name" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                  />
                </div>

                <div>
                  <label htmlFor="email" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                  />
                </div>

                <div>
                  <label htmlFor="country" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                  />
                </div>

                <div>
                  <label htmlFor="city" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                  />
                </div>

                <div>
                  <label htmlFor="specialization" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                    Specialization
                  </label>
                  <input
                    type="text"
                    id="specialization"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                  />
                </div>

                <div>
                  <label htmlFor="highest_qualification" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                    Highest Qualification
                  </label>
                  <input
                    type="text"
                    id="highest_qualification"
                    name="highest_qualification"
                    value={formData.highest_qualification}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                  />
                </div>

                <div>
                  <label htmlFor="years_experience" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    id="years_experience"
                    name="years_experience"
                    value={formData.years_experience}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                  />
                </div>

                <div>
                  <label htmlFor="hire_date" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                    Hire Date
                  </label>
                  <input
                    type="date"
                    id="hire_date"
                    name="hire_date"
                    value={formData.hire_date}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                  />
                </div>

                {!editingTeacher && (
                  <div>
                    <label htmlFor="password" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={!editingTeacher}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                        }`}
                    />
                  </div>
                )}

                {editingTeacher && (
                  <div>
                    <label htmlFor="password" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                      New Password (leave blank to keep current)
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                        }`}
                    />
                  </div>
                )}

              </div>

              <div className="md:col-span-2">
                <label htmlFor="portfolio_link" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  Portfolio Link
                </label>
                <input
                  type="url"
                  id="portfolio_link"
                  name="portfolio_link"
                  value={formData.portfolio_link}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                    }`}
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="skills" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  Skills
                </label>
                <textarea
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  rows={2}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                    }`}
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="bio" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                    }`}
                />
              </div>



              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={`px-4 py-2 border rounded-lg transition-colors ${isDark
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
                  {isCreating || isUpdating ? "Saving..." : editingTeacher ? "Update Teacher" : "Add Teacher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Teacher Modal */}
      {
        isViewModalOpen && viewingTeacher && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={handleCloseViewModal}
            />

            <div
              className={`relative rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`sticky top-0 z-10 border-b px-6 py-4 flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'
                  }`}>
                  Teacher Profile: {viewingTeacher.full_name}
                </h2>
                <button
                  onClick={handleCloseViewModal}
                  className={`transition-colors ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Personal Information Section */}
                <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-blue-50/50 border-blue-200'
                  }`}>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'
                    }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                      <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>Full Name</label>
                      <p className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {viewingTeacher.full_name || 'N/A'}
                      </p>
                    </div>
                    <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                      <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>Email</label>
                      <p className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                        {viewingTeacher.email || 'N/A'}
                      </p>
                    </div>
                    <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                      <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>Phone</label>
                      <p className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                        {viewingTeacher.phone || 'N/A'}
                      </p>
                    </div>
                    <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                      <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>Country</label>
                      <p className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                        {viewingTeacher.country || 'N/A'}
                      </p>
                    </div>
                    <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                      <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>City</label>
                      <p className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                        {viewingTeacher.city || 'N/A'}
                      </p>
                    </div>
                    <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                      <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>Hire Date</label>
                      <p className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                        {viewingTeacher.hire_date ? new Date(viewingTeacher.hire_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Professional Information Section */}
                <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-purple-50/50 border-purple-200'
                  }`}>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'
                    }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Professional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                      <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>Specialization</label>
                      <p className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                        {viewingTeacher.specialization || 'N/A'}
                      </p>
                    </div>
                    <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                      <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>Highest Qualification</label>
                      <p className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                        {viewingTeacher.highest_qualification || 'N/A'}
                      </p>
                    </div>
                    <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                      <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>Years of Experience</label>
                      <p className={`text-base font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                        {viewingTeacher.years_experience || 0} years
                      </p>
                    </div>
                    <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                      <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>Portfolio Link</label>
                      {viewingTeacher.portfolio_link ? (
                        <a
                          href={viewingTeacher.portfolio_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline break-all flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          {viewingTeacher.portfolio_link}
                        </a>
                      ) : (
                        <p className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>N/A</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio and Skills Section */}
                <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-green-50/50 border-green-200'
                  }`}>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'
                    }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Additional Information
                  </h3>
                  <div className="space-y-4">
                    <div className={`p-4 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                      <label className={`block text-xs font-semibold mb-2 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>Bio</label>
                      <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {viewingTeacher.bio || 'No bio available'}
                      </p>
                    </div>
                    <div className={`p-4 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                      <label className={`block text-xs font-semibold mb-2 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>Skills</label>
                      <div className="flex flex-wrap gap-2">
                        {viewingTeacher.skills ? (
                          viewingTeacher.skills.split(',').map((skill, index) => (
                            <span
                              key={index}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${isDark
                                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50'
                                : 'bg-purple-100 text-purple-700 border border-purple-200'
                                }`}
                            >
                              {skill.trim()}
                            </span>
                          ))
                        ) : (
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No skills listed</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assigned Classes Section */}
                <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-orange-50/50 border-orange-200'
                  }`}>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'
                    }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Assigned Classes
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-blue-600/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                      }`}>
                      {getAssignedClasses(viewingTeacher.id).length}
                    </span>
                  </h3>
                  {getAssignedClasses(viewingTeacher.id).length === 0 ? (
                    <div className={`p-6 text-center rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                      <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        No classes assigned to this teacher.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getAssignedClasses(viewingTeacher.id).map((classItem) => (
                        <div
                          key={classItem.id}
                          className={`p-4 rounded-lg border transition-all hover:shadow-lg ${isDark
                            ? 'bg-gradient-to-br from-gray-800/80 to-gray-700/80 border-gray-600 hover:border-gray-500'
                            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-blue-300'
                            }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h4 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {classItem.class_name || 'N/A'}
                            </h4>
                            <div className={`w-2 h-2 rounded-full ${classItem.course_title ? 'bg-green-500' : 'bg-gray-400'
                              }`}></div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <svg className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                              <div className="flex-1">
                                <label className={`block text-xs font-semibold mb-0.5 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                                  }`}>Course</label>
                                <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                                  {classItem.course_title || 'Not assigned'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <div className="flex-1">
                                <label className={`block text-xs font-semibold mb-0.5 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                                  }`}>Subprogram</label>
                                <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                                  {classItem.subprogram_name || 'Not assigned'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg className={`w-4 h-4 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                              <div className="flex-1">
                                <label className={`block text-xs font-semibold mb-0.5 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                                  }`}>Program</label>
                                <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                                  {classItem.program_name || 'Not assigned'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Confirmation Modal */}
      {confirmationModal.isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !confirmationModal.isLoading && setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
          />
          <div className={`relative w-full max-w-md p-6 rounded-xl shadow-2xl border-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
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
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
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
