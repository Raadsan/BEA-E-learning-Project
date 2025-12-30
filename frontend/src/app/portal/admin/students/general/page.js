"use client";

import { useState, useMemo } from "react";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";
import { useGetStudentsQuery, useUpdateStudentMutation } from "@/redux/api/studentApi";
import { useGetSubprogramsQuery } from "@/redux/api/subprogramApi";
import { useGetClassesQuery } from "@/redux/api/classApi";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useDarkMode } from "@/context/ThemeContext";
import { useToast } from "@/components/Toast";

export default function GeneralStudentsPage() {
  const { isDark } = useDarkMode();
  const { showToast } = useToast();
  const { data: allStudents, isLoading, isError, error, refetch } = useGetStudentsQuery();
  const { data: subprograms = [] } = useGetSubprogramsQuery();
  const { data: classes = [] } = useGetClassesQuery();
  const { data: programs = [] } = useGetProgramsQuery();
  const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();

  // Modal state for assigning class
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [studentToAssign, setStudentToAssign] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedType, setSelectedType] = useState("");

  // Modal state for status toggle
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [studentToToggleStatus, setStudentToToggleStatus] = useState(null);

  // Modal state for viewing student
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState(null);

  // Modal state for editing student
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editFormData, setEditFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    residency_country: "",
    residency_city: "",
    parent_name: "",
    parent_email: "",
    parent_phone: "",
    parent_relation: "",
    parent_res_county: "",
    parent_res_city: "",
    chosen_program: "",
    chosen_subprogram: "",
    class_id: "",
    approval_status: "approved"
  });
  const [editSelectedSubprogramId, setEditSelectedSubprogramId] = useState("");

  // Filter students: approved general-program students (exclude IELTS/TOEFL)
  const generalStudents = useMemo(() => {
    if (!allStudents) return [];
    return allStudents.filter(
      (student) =>
        (student.approval_status === "approved" || student.approval_status === "inactive") &&
        student.chosen_program !== "IELTS & TOFEL Preparation"
    );
  }, [allStudents]);

  // Get subprogram name for display
  const getSubprogramName = (subprogramId) => {
    if (!subprogramId) return "N/A";
    const subprogram = subprograms.find(sp => sp.id == subprogramId);
    return subprogram ? subprogram.subprogram_name : "N/A";
  };

  // Get class name for display
  const getClassName = (classId) => {
    if (!classId) return null;
    const cls = classes.find(c => c.id == classId);
    return cls ? cls.class_name : null;
  };

  // Get classes filtered by student's program
  const getClassesForStudent = (student) => {
    if (!student?.chosen_program) return [];

    // Find program ID from program name
    const program = programs.find(p => p.title === student.chosen_program);
    if (!program) return [];

    // Get subprograms for this program
    const programSubprograms = subprograms.filter(sp => sp.program_id === program.id);
    const subprogramIds = programSubprograms.map(sp => sp.id);

    // Filter classes that belong to these subprograms
    return classes.filter(cls => subprogramIds.includes(cls.subprogram_id));
  };

  // Handle opening assign class modal
  const handleOpenAssignModal = (student) => {
    setStudentToAssign(student);
    setSelectedClassId(student.class_id?.toString() || "");
    setSelectedType("");
    setIsAssignModalOpen(true);
  };

  // Handle closing assign class modal
  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false);
    setStudentToAssign(null);
    setSelectedClassId("");
    setSelectedType("");
  };

  // Handle assigning class (with auto-subprogram)
  const handleAssignClass = async () => {
    if (!studentToAssign || !selectedClassId) {
      showToast("Please select a class", "error");
      return;
    }

    try {
      // Find selected class to get its subprogram_id
      const selectedClass = classes.find(c => c.id === parseInt(selectedClassId));
      const subprogramId = selectedClass?.subprogram_id || null;

      await updateStudent({
        id: studentToAssign.id,
        class_id: parseInt(selectedClassId),
        chosen_subprogram: subprogramId
      }).unwrap();

      showToast("Class assigned successfully!", "success");
      handleCloseAssignModal();
      refetch();
    } catch (error) {
      console.error("Failed to assign class:", error);
      showToast(error?.data?.error || "Failed to assign class.", "error");
    }
  };

  // Handle opening view modal
  const handleOpenViewModal = (student) => {
    setViewingStudent(student);
    setIsViewModalOpen(true);
  };

  // Handle closing view modal
  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingStudent(null);
  };

  // Handle opening edit modal
  const handleOpenEditModal = (student) => {
    setEditingStudent(student);

    // Get subprogram from class if not set directly
    let subprogramId = student.chosen_subprogram?.toString() || "";
    if (!subprogramId && student.class_id) {
      const cls = classes.find(c => c.id == student.class_id);
      if (cls) subprogramId = cls.subprogram_id?.toString() || "";
    }

    setEditSelectedSubprogramId(subprogramId);
    setEditFormData({
      full_name: student.full_name || "",
      email: student.email || "",
      phone: student.phone || "",
      age: student.age || "",
      gender: student.gender || "",
      residency_country: student.residency_country || "",
      residency_city: student.residency_city || "",
      parent_name: student.parent_name || "",
      parent_email: student.parent_email || "",
      parent_phone: student.parent_phone || "",
      parent_relation: student.parent_relation || "",
      parent_res_county: student.parent_res_county || "",
      parent_res_city: student.parent_res_city || "",
      chosen_program: student.chosen_program || "",
      chosen_subprogram: subprogramId,
      class_id: student.class_id?.toString() || "",
      approval_status: student.approval_status || "approved"
    });
    setIsEditModalOpen(true);
  };

  // Handle generic input change for edit form
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle closing edit modal
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingStudent(null);
    setEditSelectedSubprogramId("");
    setEditFormData({
      full_name: "",
      email: "",
      phone: "",
      age: "",
      gender: "",
      residency_country: "",
      residency_city: "",
      parent_name: "",
      parent_email: "",
      parent_phone: "",
      parent_relation: "",
      parent_res_county: "",
      parent_res_city: "",
      chosen_program: "",
      chosen_subprogram: "",
      class_id: "",
      approval_status: "approved"
    });
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!editingStudent) return;

    try {
      await updateStudent({
        id: editingStudent.id,
        full_name: editFormData.full_name,
        email: editFormData.email,
        phone: editFormData.phone,
        age: editFormData.age ? parseInt(editFormData.age) : null,
        gender: editFormData.gender,
        residency_country: editFormData.residency_country,
        residency_city: editFormData.residency_city,
        parent_name: editFormData.parent_name,
        parent_email: editFormData.parent_email,
        parent_phone: editFormData.parent_phone,
        parent_relation: editFormData.parent_relation,
        parent_res_county: editFormData.parent_res_county,
        parent_res_city: editFormData.parent_res_city,
        chosen_program: editFormData.chosen_program,
        chosen_subprogram: editFormData.chosen_subprogram ? parseInt(editFormData.chosen_subprogram) : null,
        class_id: editFormData.class_id ? parseInt(editFormData.class_id) : null,
        approval_status: editFormData.approval_status
      }).unwrap();

      showToast("Student updated successfully!", "success");
      handleCloseEditModal();
      refetch();
    } catch (error) {
      console.error("Failed to update student:", error);
      showToast(error?.data?.error || "Failed to update student.", "error");
    }
  };

  // Handle status toggle (Active/Inactive)
  // Handle status toggle click
  const handleStatusToggle = (student) => {
    setStudentToToggleStatus(student);
    setIsStatusModalOpen(true);
  };

  // Confirm status toggle
  const confirmStatusToggle = async () => {
    if (!studentToToggleStatus) return;

    const isActive = studentToToggleStatus.approval_status === 'approved';
    const newDbStatus = isActive ? 'inactive' : 'approved';

    try {
      await updateStudent({
        id: studentToToggleStatus.id,
        approval_status: newDbStatus
      }).unwrap();
      showToast("Status updated successfully!", "success");
      refetch();
      setIsStatusModalOpen(false);
      setStudentToToggleStatus(null);
    } catch (error) {
      console.error("Failed to update status:", error);
      showToast("Failed to update status.", "error");
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
      render: (row) => row.phone || <span className="text-gray-400">-</span>,
    },
    {
      key: "age",
      label: "Age",
      render: (row) => row.age || <span className="text-gray-400">-</span>,
    },
    {
      key: "residency_country",
      label: "Country",
      render: (row) => row.residency_country || <span className="text-gray-400">-</span>,
    },

    {
      key: "chosen_program",
      label: "Program",
      width: "180px",
      render: (row) => (
        <span className="block truncate max-w-[160px]" title={row.chosen_program}>
          {row.chosen_program || <span className="text-gray-400">-</span>}
        </span>
      ),
    },
    {
      key: "chosen_subprogram",
      label: "Subprogram",
      render: (row) => {
        // Try to get subprogram from student record first
        let subId = row.chosen_subprogram;

        // If not found, try to find it via assigned class
        if (!subId && row.class_id) {
          const cls = classes.find(c => c.id == row.class_id);
          if (cls) subId = cls.subprogram_id;
        }

        const subName = getSubprogramName(subId);

        // If N/A, show plain text without badge
        if (subName === "N/A") {
          return (
            <div className="flex justify-center">
              <span className="text-gray-400 text-sm">N/A</span>
            </div>
          );
        }

        return (
          <div className="flex justify-start">
            <span
              className="block truncate max-w-[150px] text-sm text-gray-700 dark:text-gray-300"
              title={subName}
            >
              {subName}
            </span>
          </div>
        );
      },
    },
    {
      key: "class_name",
      label: "Class",
      width: "140px",
      render: (row) => {
        // Get class name from classes array using class_id
        const className = getClassName(row.class_id) || row.class_name;
        const hasClass = className && className !== "Not assigned";

        if (hasClass) {
          return (
            <div className="flex justify-center">
              <button
                onClick={() => handleOpenAssignModal(row)}
                className="min-w-[100px] px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
              >
                {className}
              </button>
            </div>
          );
        }

        return (
          <div className="flex justify-center">
            <button
              onClick={() => handleOpenAssignModal(row)}
              className="min-w-[100px] px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
            >
              Assign Class
            </button>
          </div>
        );
      },
    },
    {
      key: "created_at",
      label: "Registration Date",
      render: (row) => {
        if (!row.created_at) return <span className="text-gray-400">-</span>;
        const date = new Date(row.created_at);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      },
    },
    {
      key: "approval_status",
      label: "Status",
      render: (row) => {
        const isActive = row.approval_status === 'approved';
        return (
          <div className="flex justify-center">
            <button
              onClick={() => handleStatusToggle(row)}
              className={`min-w-[80px] px-3 py-1 text-xs font-medium rounded-full border transition-colors ${isActive
                ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/50'
                : 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/50'
                }`}
            >
              {isActive ? 'Active' : 'Inactive'}
            </button>
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => handleOpenViewModal(row)}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
            title="View Details"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            onClick={() => handleOpenEditModal(row)}
            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
            title="Edit Student"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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

  // Get filtered classes for current student
  const availableClasses = studentToAssign ? getClassesForStudent(studentToAssign) : [];

  return (
    <>
      <AdminHeader />
      <main className="flex-1 overflow-y-auto bg-gray-50 mt-20 transition-colors">
        <div className="w-full px-8 py-6">
          <DataTable
            title="General Program Students"
            columns={columns}
            data={generalStudents}
            showAddButton={false}
          />
        </div>
      </main>

      {/* Assign Class Modal */}
      {isAssignModalOpen && studentToAssign && (() => {
        // Get all classes for the student's program
        const programClasses = classes.filter(c => c.program_name === studentToAssign.chosen_program);

        return (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div
              className="absolute inset-0  backdrop-blur-sm"
              aria-hidden="true"
            />
            <div className={`relative w-full max-w-md rounded-xl shadow-2xl overflow-hidden border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50/50 border-gray-200'}`}>
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {studentToAssign.email}
                </h3>
                <button
                  onClick={handleCloseAssignModal}
                  className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                {/* Student Program Description */}
                <div className={`p-3 rounded-lg mb-4 border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {studentToAssign.chosen_program}
                  </p>
                </div>

                {/* Type Selection */}
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Select Class Type
                  </label>
                  <div className="flex gap-2">
                    {['morning', 'afternoon', 'night'].map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setSelectedType(type);
                          setSelectedClassId(""); // Reset class selection
                        }}
                        className={`flex-1 px-3 py-2 rounded-lg border font-medium transition-all ${selectedType === type
                          ? 'bg-blue-600 text-white border-blue-600'
                          : isDark
                            ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {programClasses.length === 0 ? (
                  <div className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'}`}>
                    <p className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>
                      No classes available for "{studentToAssign.chosen_program}". Please create classes first.
                    </p>
                  </div>
                ) : !selectedType ? (
                  <div className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
                    <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                      Please select a class type above to view available classes.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Class Selection */}
                    <div className="mb-6">
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Select Class
                      </label>
                      <select
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`}
                      >
                        <option value="">Select a class</option>
                        {programClasses
                          .filter(cls => {
                            // If type column exists and is set, filter by type; otherwise show all classes
                            if (cls.type && selectedType) {
                              return cls.type === selectedType;
                            }
                            return true; // Show all classes if type column doesn't exist or no type selected
                          })
                          .map((cls) => (
                            <option key={cls.id} value={cls.id}>
                              {cls.class_name} ({cls.subprogram_name || 'No subprogram'})
                            </option>
                          ))}
                      </select>
                      {programClasses.filter(cls => cls.type === selectedType).length === 0 && (
                        <div className={`p-4 rounded-lg mt-2 ${isDark ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'}`}>
                          <p className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>
                            This shift have no class
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCloseAssignModal}
                    className={`flex-1 px-4 py-2.5 rounded-lg border font-semibold transition-all ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignClass}
                    disabled={isUpdating || !selectedClassId}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? "Assigning..." : "Assign Class"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* View Student Modal */}
      {isViewModalOpen && viewingStudent && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 backdrop-blur-sm"
            aria-hidden="true"
          />
          <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className={`sticky top-0 z-10 px-6 py-4 border-b flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Student Details
              </h3>
              <button
                onClick={handleCloseViewModal}
                className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Student Info Header */}
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                  {viewingStudent.full_name?.charAt(0)?.toUpperCase() || 'S'}
                </div>
                <div>
                  <h4 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{viewingStudent.full_name}</h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{viewingStudent.email}</p>
                </div>
              </div>

              {/* Personal Information */}
              <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <h5 className={`text-sm font-semibold uppercase tracking-wide mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Personal Information</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Phone</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{viewingStudent.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Age</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{viewingStudent.age || 'N/A'}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Gender</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{viewingStudent.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Country</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{viewingStudent.residency_country || 'N/A'}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>City</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{viewingStudent.residency_city || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Program Information */}
              <div className={`p-4 rounded-lg border ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-100'}`}>
                <h5 className={`text-sm font-semibold uppercase tracking-wide mb-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Program Information</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Program</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{viewingStudent.chosen_program || 'N/A'}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Subprogram</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{getSubprogramName(viewingStudent.chosen_subprogram)}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Class</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{getClassName(viewingStudent.class_id) || viewingStudent.class_name || 'Not assigned'}</p>
                  </div>
                </div>
              </div>

              {/* Registration Info */}
              <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <h5 className={`text-sm font-semibold uppercase tracking-wide mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Registration</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Status</p>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${viewingStudent.approval_status === 'approved'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : viewingStudent.approval_status === 'inactive'
                        ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                      {viewingStudent.approval_status === 'approved' ? 'Active' : viewingStudent.approval_status.charAt(0).toUpperCase() + viewingStudent.approval_status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Registration Date</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {viewingStudent.created_at ? new Date(viewingStudent.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleCloseViewModal}
                  className={`px-6 py-2.5 rounded-lg border font-semibold transition-all ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {isEditModalOpen && editingStudent && (() => {
        const studentSubprograms = program ? subprograms.filter(sp => sp.program_id === program.id) : [];
        const showParentInfo = parseInt(editFormData.age) < 18;

        return (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div
              className="absolute inset-0  backdrop-blur-sm"
              aria-hidden="true"
            />
            <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className={`sticky top-0 z-20 px-6 py-4 border-b flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Edit Student Details
                </h3>
                <button
                  onClick={handleCloseEditModal}
                  className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
                {/* Student Information Section */}
                <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-blue-50/50 border-blue-100'}`}>
                  <h4 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Student Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</label>
                      <input
                        type="text"
                        name="full_name"
                        value={editFormData.full_name}
                        onChange={handleEditInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={editFormData.email}
                        onChange={handleEditInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Phone</label>
                      <input
                        type="text"
                        name="phone"
                        value={editFormData.phone}
                        onChange={handleEditInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Age</label>
                      <input
                        type="number"
                        name="age"
                        value={editFormData.age}
                        onChange={handleEditInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Gender</label>
                      <select
                        name="gender"
                        value={editFormData.gender}
                        onChange={handleEditInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Country</label>
                      <input
                        type="text"
                        name="residency_country"
                        value={editFormData.residency_country}
                        onChange={handleEditInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>City</label>
                      <input
                        type="text"
                        name="residency_city"
                        value={editFormData.residency_city}
                        onChange={handleEditInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Program & Class Assignment Section */}
                <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-green-50/50 border-green-100'}`}>
                  <h4 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Program & Class Assignment
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Program</label>
                      <input
                        type="text"
                        value={editFormData.chosen_program}
                        disabled
                        className={`w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-600 cursor-not-allowed ${isDark ? 'text-gray-400 border-gray-500' : 'text-gray-500 border-gray-300'}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Subprogram</label>
                      <select
                        name="chosen_subprogram"
                        value={editFormData.chosen_subprogram}
                        onChange={(e) => {
                          handleEditInputChange(e);
                          setEditFormData(prev => ({ ...prev, class_id: "" }));
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                      >
                        <option value="">Select Subprogram</option>
                        {studentSubprograms.map(sp => (
                          <option key={sp.id} value={sp.id}>{sp.subprogram_name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Class</label>
                      <select
                        name="class_id"
                        value={editFormData.class_id}
                        onChange={handleEditInputChange}
                        disabled={!editFormData.chosen_subprogram}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${!editFormData.chosen_subprogram ? 'bg-gray-100 dark:bg-gray-600' : isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                      >
                        <option value="">Select Class</option>
                        {classes.filter(c => c.subprogram_id == editFormData.chosen_subprogram).map(cls => (
                          <option key={cls.id} value={cls.id}>{cls.class_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Management Section */}
                <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-orange-50/50 border-orange-100'}`}>
                  <h4 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Student Management
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
                      <select
                        name="approval_status"
                        value={editFormData.approval_status}
                        onChange={handleEditInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                      >
                        <option value="approved">Approved (Active)</option>
                        <option value="inactive">Inactive</option>
                        <option value="rejected">Rejected</option>
                        <option value="pending">Pending</option>
                      </select>
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Set to "Inactive" to prevent student login without losing their data.
                      </p>
                    </div>
                  </div>
                </div>
                {showParentInfo && (
                  <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-purple-50/50 border-purple-100'}`}>
                    <h4 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Parent/Guardian Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Parent Name</label>
                        <input
                          type="text"
                          name="parent_name"
                          value={editFormData.parent_name}
                          onChange={handleEditInputChange}
                          className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Parent Email</label>
                        <input
                          type="email"
                          name="parent_email"
                          value={editFormData.parent_email}
                          onChange={handleEditInputChange}
                          className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Parent Phone</label>
                        <input
                          type="text"
                          name="parent_phone"
                          value={editFormData.parent_phone}
                          onChange={handleEditInputChange}
                          className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Relation</label>
                        <input
                          type="text"
                          name="parent_relation"
                          value={editFormData.parent_relation}
                          onChange={handleEditInputChange}
                          className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Residency Country</label>
                        <input
                          type="text"
                          name="parent_res_county"
                          value={editFormData.parent_res_county}
                          onChange={handleEditInputChange}
                          className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Residency City</label>
                        <input
                          type="text"
                          name="parent_res_city"
                          value={editFormData.parent_res_city}
                          onChange={handleEditInputChange}
                          className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="flex justify-end gap-3 pt-6 sticky bottom-0 bg-inherit z-10 border-t mt-6">
                  <button
                    type="button"
                    onClick={handleCloseEditModal}
                    className={`px-6 py-2 rounded-lg border font-medium transition-all ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </span>
                    ) : "Update Student"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
      {/* Status Toggle Confirmation Modal */}
      {isStatusModalOpen && studentToToggleStatus && (() => {
        const isActive = studentToToggleStatus.approval_status === 'approved';
        const currentStatusLabel = isActive ? 'Active' : 'Inactive';
        const newStatusLabel = isActive ? 'Inactive' : 'Active';

        return (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 backdrop-blur-sm"
              onClick={() => setIsStatusModalOpen(false)}
            />
            <div className={`relative w-full max-w-sm rounded-xl shadow-2xl p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="mb-6 text-center">
                <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4 ${isActive
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Change Status?
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Do you want to change Status of <strong>{studentToToggleStatus.full_name}</strong> to <strong>{newStatusLabel}</strong>
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsStatusModalOpen(false)}
                  className={`flex-1 px-4 py-2 rounded-lg border font-medium transition-colors ${isDark
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStatusToggle}
                  disabled={isUpdating}
                  className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors shadow-lg disabled:opacity-50 ${isActive
                    ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
                    : 'bg-green-600 hover:bg-green-700 shadow-green-500/20'
                    }`}
                >
                  {isUpdating ? 'Updating...' : `Confirm`}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </>
  );
}
