"use client";

import { useState, useEffect } from "react";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";
import { useGetStudentsQuery, useCreateStudentMutation, useUpdateStudentMutation, useDeleteStudentMutation, useApproveStudentMutation, useRejectStudentMutation } from "@/redux/api/studentApi";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useGetSubprogramsQuery } from "@/redux/api/subprogramApi";
import { useGetClassesQuery } from "@/redux/api/classApi";
import { useDarkMode } from "@/context/ThemeContext";
import { useToast } from "@/components/Toast";

export default function StudentsPage() {
  const { isDark } = useDarkMode();
  const { toast, showToast, hideToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAssignClassModalOpen, setIsAssignClassModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [assigningStudent, setAssigningStudent] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState("");

  const { data: backendStudents, isLoading, isError, error, refetch } = useGetStudentsQuery();
  const { data: programs = [] } = useGetProgramsQuery();
  const { data: classes = [] } = useGetClassesQuery();

  const [createStudent, { isLoading: isCreating }] = useCreateStudentMutation();
  const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();
  const [deleteStudent, { isLoading: isDeleting }] = useDeleteStudentMutation();

  const students = backendStudents || [];

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    age: "",
    residency_country: "",
    residency_city: "",
    chosen_program: "",
    chosen_subprogram: "",
    password: "",
    parent_name: "",
    parent_email: "",
    parent_phone: "",
    parent_relation: "",
    parent_res_county: "",
    parent_res_city: "",
  });

  const handleAddStudent = () => {
    setEditingStudent(null);
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      age: "",
      residency_country: "",
      residency_city: "",
      chosen_program: "",
      chosen_subprogram: "",
      password: "",
      parent_name: "",
      parent_email: "",
      parent_phone: "",
      parent_relation: "",
      parent_res_county: "",
      parent_res_city: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      full_name: student.full_name || "",
      email: student.email || "",
      phone: student.phone || "",
      age: student.age || "",
      residency_country: student.residency_country || "",
      residency_city: student.residency_city || "",
      chosen_program: student.chosen_program || "",
      chosen_subprogram: student.chosen_subprogram || "",
      password: "",
      parent_name: student.parent_name || "",
      parent_email: student.parent_email || "",
      parent_phone: student.parent_phone || "",
      parent_relation: student.parent_relation || "",
      parent_res_county: student.parent_res_county || "",
      parent_res_city: student.parent_res_city || "",
    });
    setIsModalOpen(true);
  };

  const handleView = (student) => {
    setViewingStudent(student);
    setIsViewModalOpen(true);
  };

  const handleAssignClass = (student) => {
    setAssigningStudent(student);
    setSelectedClassId(student.class_id || "");
    setIsAssignClassModalOpen(true);
  };

  const handleCloseAssignClassModal = () => {
    setIsAssignClassModalOpen(false);
    setAssigningStudent(null);
    setSelectedClassId("");
  };

  const submitAssignClass = async () => {
    if (!assigningStudent) return;
    try {
      await updateStudent({
        id: assigningStudent.id,
        class_id: selectedClassId || null
      }).unwrap();
      showToast("Class assigned successfully!", "success");
      handleCloseAssignClassModal();
    } catch (error) {
      console.error("Failed to assign class:", error);
      showToast("Failed to assign class.", "error");
    }
  };


  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await deleteStudent(id).unwrap();
        showToast("Student deleted successfully!", "success");
      } catch (error) {
        console.error("Failed to delete student:", error);
        showToast("Failed to delete student. Please try again.", "error");
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      age: "",
      residency_country: "",
      residency_city: "",
      chosen_program: "",
      chosen_subprogram: "",
      password: "",
      parent_name: "",
      parent_email: "",
      parent_phone: "",
      parent_relation: "",
      parent_res_county: "",
      parent_res_city: "",
    });
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
      handleCloseAssignClassModal();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const showParentInfo = formData.age && parseInt(formData.age) < 18;

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const submitData = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null,
      };

      if (!submitData.password || submitData.password.trim() === "") {
        delete submitData.password;
      }

      if (submitData.chosen_subprogram === "") {
        submitData.chosen_subprogram = null;
      }

      if (editingStudent) {
        await updateStudent({ id: editingStudent.id, ...submitData }).unwrap();
        showToast("Student updated successfully!", "success");
      } else {
        if (!submitData.password || submitData.password.trim() === "") {
          showToast("Password is required for new students", "error");
          return;
        }
        await createStudent(submitData).unwrap();
        showToast("Student registered successfully!", "success");
      }

      handleCloseModal();
    } catch (error) {
      console.error("Failed to save student:", error);
      showToast(error?.data?.error || "Failed to save student. Please try again.", "error");
    }

    return false;
  };

  const [approveStudent, { isLoading: isApproving }] = useApproveStudentMutation();
  const [rejectStudent, { isLoading: isRejecting }] = useRejectStudentMutation();

  const handleApprove = async (student) => {
    if (!confirm("Are you sure you want to approve this student?")) return;
    try {
      await approveStudent(student.id).unwrap();
      showToast("Student approved successfully! Please assign a class.", "success");
      handleAssignClass(student);
    } catch (error) {
      showToast(error?.data?.error || "Failed to approve student.", "error");
    }
  };

  const handleReject = async (id) => {
    if (!confirm("Are you sure you want to reject this student?")) return;
    try {
      await rejectStudent(id).unwrap();
      showToast("Student rejected successfully!", "success");
    } catch (error) {
      showToast(error?.data?.error || "Failed to reject student.", "error");
    }
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
      render: (row) => row.phone || "N/A",
    },
    {
      key: "age",
      label: "Age",
      render: (row) => row.age || "N/A",
    },
    {
      key: "residency_country",
      label: "Country",
      render: (row) => row.residency_country || "N/A",
    },
    {
      key: "chosen_program",
      label: "Program",
      render: (row) => row.chosen_program || <span className="text-gray-500">Not assigned</span>,
    },
    {
      key: "class_name",
      label: "Class",
      render: (row) => row.class_name ? <span className="text-black dark:text-white font-medium">{row.class_name}</span> : <span className="text-gray-500">Not assigned</span>
    },
    {
      key: "approval_status",
      label: "Status",
      render: (row) => {
        const status = row.approval_status || 'pending';
        const statusColors = {
          pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
          approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
          rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[status] || statusColors.pending}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => {
        const status = row.approval_status || 'pending';
        const isPending = status === 'pending';
        const isApproved = status === 'approved';
        const isRejected = status === 'rejected';

        return (
          <div className="flex gap-2">
            {(isPending || isRejected) && (
              <button
                onClick={() => handleApprove(row)}
                disabled={isApproving || isRejecting}
                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Approve"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            )}
            {(isPending || isApproved) && (
              <button
                onClick={() => handleReject(row.id)}
                disabled={isApproving || isRejecting}
                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Reject"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <button
              onClick={() => handleView(row)}
              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
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
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <>
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-gray-50 mt-20">
          <div className="w-full px-6 py-6">
            <div className="text-center py-12">
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading students...</p>
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
              <p className="text-red-600 dark:text-red-400">Error loading students: {error?.data?.error || "Unknown error"}</p>
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
            title="Student Management"
            columns={columns}
            data={students}
            onAddClick={handleAddStudent}
            showAddButton={true}
          />
        </div>
      </main>

      {/* Add/Edit Student Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm"
          style={{ pointerEvents: 'none' }}
        >
          <div
            className="absolute inset-0"
            onClick={handleBackdropClick}
            style={{ pointerEvents: 'auto' }}
          />

          <div
            className={`relative rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4 border-2 ${isDark ? 'bg-gray-800/95 border-gray-600' : 'bg-white/95 border-gray-300'
              }`}
            onClick={(e) => e.stopPropagation()}
            style={{ pointerEvents: 'auto', backdropFilter: 'blur(2px)' }}
          >
            <div className={`sticky top-0 border-b px-6 py-4 flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'
                }`}>
                {editingStudent ? "Edit Student" : "Add New Student"}
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
              {/* Student Information Section */}
              <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-blue-50/50 border-blue-200'
                }`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'
                  }`}>
                  Student Information
                </h3>
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
                    <label htmlFor="age" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                      Age
                    </label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      min="1"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                        }`}
                    />
                  </div>

                  <div>
                    <label htmlFor="residency_country" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                      Residency Country
                    </label>
                    <input
                      type="text"
                      id="residency_country"
                      name="residency_country"
                      value={formData.residency_country}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                        }`}
                    />
                  </div>

                  <div>
                    <label htmlFor="residency_city" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                      Residency City
                    </label>
                    <input
                      type="text"
                      id="residency_city"
                      name="residency_city"
                      value={formData.residency_city}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                        }`}
                    />
                  </div>

                  <div>
                    <label htmlFor="chosen_program" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                      Chosen Program
                    </label>
                    <select
                      id="chosen_program"
                      name="chosen_program"
                      value={formData.chosen_program}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                        }`}
                    >
                      <option value="">Select Program</option>
                      {programs.map((program) => (
                        <option key={program.id} value={program.title}>
                          {program.title}
                        </option>
                      ))}
                    </select>
                  </div>


                  {!editingStudent && (
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
                        required={!editingStudent}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                          }`}
                      />
                    </div>
                  )}

                  {editingStudent && (
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
              </div>

              {/* Parent Information Section - Only show if age < 18 */}
              {showParentInfo && (
                <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-purple-50/50 border-purple-200'
                  }`}>
                  <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'
                    }`}>
                    Parent/Guardian Information <span className="text-sm font-normal text-gray-500">(Required for students under 18)</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="parent_name" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        Parent Name
                      </label>
                      <input
                        type="text"
                        id="parent_name"
                        name="parent_name"
                        value={formData.parent_name}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                          }`}
                      />
                    </div>

                    <div>
                      <label htmlFor="parent_email" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        Parent Email
                      </label>
                      <input
                        type="email"
                        id="parent_email"
                        name="parent_email"
                        value={formData.parent_email}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                          }`}
                      />
                    </div>

                    <div>
                      <label htmlFor="parent_phone" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        Parent Phone
                      </label>
                      <input
                        type="tel"
                        id="parent_phone"
                        name="parent_phone"
                        value={formData.parent_phone}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                          }`}
                      />
                    </div>

                    <div>
                      <label htmlFor="parent_relation" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        Parent Relation
                      </label>
                      <input
                        type="text"
                        id="parent_relation"
                        name="parent_relation"
                        value={formData.parent_relation}
                        onChange={handleInputChange}
                        placeholder="e.g., Father, Mother, Guardian"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                          }`}
                      />
                    </div>

                    <div>
                      <label htmlFor="parent_res_county" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        Parent Residency Country
                      </label>
                      <input
                        type="text"
                        id="parent_res_county"
                        name="parent_res_county"
                        value={formData.parent_res_county}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                          }`}
                      />
                    </div>

                    <div>
                      <label htmlFor="parent_res_city" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        Parent Residency City
                      </label>
                      <input
                        type="text"
                        id="parent_res_city"
                        name="parent_res_city"
                        value={formData.parent_res_city}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                          }`}
                      />
                    </div>
                  </div>
                </div>
              )}

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
                  {editingStudent ? "Update Student" : "Add Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Class Modal */}
      {isAssignClassModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm"
          style={{ pointerEvents: 'none' }}
        >
          <div
            className="absolute inset-0"
            onClick={handleCloseAssignClassModal}
            style={{ pointerEvents: 'auto' }}
          />

          <div
            className={`relative rounded-lg shadow-2xl w-full max-w-md mx-4 border-2 p-6 ${isDark ? 'bg-gray-800/95 border-gray-600' : 'bg-white/95 border-gray-300'
              }`}
            onClick={(e) => e.stopPropagation()}
            style={{ pointerEvents: 'auto', backdropFilter: 'blur(2px)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Assign Class to {assigningStudent?.full_name}
              </h2>
              <button
                onClick={handleCloseAssignClassModal}
                className={`transition-colors ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Select Class
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
              >
                <option value="">-- No Class Assigned --</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.class_name} {cls.schedule ? `(${cls.schedule})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleCloseAssignClassModal}
                className={`px-4 py-2 border rounded-lg transition-colors ${isDark
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Cancel
              </button>
              <button
                onClick={submitAssignClass}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Save Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Student Modal */}
      {isViewModalOpen && viewingStudent && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm"
          style={{ pointerEvents: 'none' }}
        >
          <div
            className="absolute inset-0"
            onClick={() => setIsViewModalOpen(false)}
            style={{ pointerEvents: 'auto' }}
          />

          <div
            className={`relative rounded-lg shadow-2xl w-full max-w-2xl mx-4 border-2 p-6 ${isDark ? 'bg-gray-800/95 border-gray-600' : 'bg-white/95 border-gray-300'
              }`}
            onClick={(e) => e.stopPropagation()}
            style={{ pointerEvents: 'auto', backdropFilter: 'blur(2px)' }}
          >
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Student Details
              </h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className={`transition-colors ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className={`space-y-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold block text-sm opacity-70">Full Name</label>
                  <p>{viewingStudent.full_name}</p>
                </div>
                <div>
                  <label className="font-semibold block text-sm opacity-70">Email</label>
                  <p>{viewingStudent.email}</p>
                </div>
                <div>
                  <label className="font-semibold block text-sm opacity-70">Phone</label>
                  <p>{viewingStudent.phone || "N/A"}</p>
                </div>
                <div>
                  <label className="font-semibold block text-sm opacity-70">Age</label>
                  <p>{viewingStudent.age || "N/A"}</p>
                </div>
                <div>
                  <label className="font-semibold block text-sm opacity-70">Country</label>
                  <p>{viewingStudent.residency_country || "N/A"}</p>
                </div>
                <div>
                  <label className="font-semibold block text-sm opacity-70">City</label>
                  <p>{viewingStudent.residency_city || "N/A"}</p>
                </div>
                <div>
                  <label className="font-semibold block text-sm opacity-70">Program</label>
                  <p>{viewingStudent.chosen_program || "N/A"}</p>
                </div>
                <div>
                  <label className="font-semibold block text-sm opacity-70">Class</label>
                  <p>{viewingStudent.class_name || "Not assigned"}</p>
                </div>
                <div>
                  <label className="font-semibold block text-sm opacity-70">Status</label>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1 ${viewingStudent.approval_status === 'approved' ? 'bg-green-100 text-green-800' :
                    viewingStudent.approval_status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                    {viewingStudent.approval_status ? viewingStudent.approval_status.charAt(0).toUpperCase() + viewingStudent.approval_status.slice(1) : 'Pending'}
                  </span>
                </div>
              </div>

              {viewingStudent.age && parseInt(viewingStudent.age) < 18 && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold mb-3">Parent Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold block text-sm opacity-70">Name</label>
                      <p>{viewingStudent.parent_name || "N/A"}</p>
                    </div>
                    <div>
                      <label className="font-semibold block text-sm opacity-70">Email</label>
                      <p>{viewingStudent.parent_email || "N/A"}</p>
                    </div>
                    <div>
                      <label className="font-semibold block text-sm opacity-70">Phone</label>
                      <p>{viewingStudent.parent_phone || "N/A"}</p>
                    </div>
                    <div>
                      <label className="font-semibold block text-sm opacity-70">Relation</label>
                      <p>{viewingStudent.parent_relation || "N/A"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-6">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
