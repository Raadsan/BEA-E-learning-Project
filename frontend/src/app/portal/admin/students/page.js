"use client";

import { useState, useEffect } from "react";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";
import { useGetStudentsQuery, useCreateStudentMutation, useUpdateStudentMutation, useDeleteStudentMutation, useApproveStudentMutation, useRejectStudentMutation } from "@/redux/api/studentApi";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useGetSubprogramsQuery } from "@/redux/api/subprogramApi";
import { useGetClassesQuery } from "@/redux/api/classApi";
import {
  useGetIeltsToeflStudentsQuery,
  useDeleteIeltsToeflStudentMutation,
  useUpdateIeltsToeflStudentMutation,
  useRejectIeltsToeflStudentMutation
} from "@/redux/api/ieltsToeflApi";
import { useGetSessionRequestsQuery } from "@/redux/api/sessionRequestApi";
import { useDarkMode } from "@/context/ThemeContext";
import { useToast } from "@/components/Toast";
import { Country, City } from "country-state-city";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import CountrySelect from '@/components/CountrySelect';

export default function StudentsPage() {
  const { isDark } = useDarkMode();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSubprogramsModalOpen, setIsSubprogramsModalOpen] = useState(false);
  const [isAssignSubprogramModalOpen, setIsAssignSubprogramModalOpen] = useState(false);
  const [isAssignClassModalOpen, setIsAssignClassModalOpen] = useState(false);
  const [selectedProgramForSubprograms, setSelectedProgramForSubprograms] = useState(null);
  const [assigningStudent, setAssigningStudent] = useState(null);
  const [selectedSubprogramId, setSelectedSubprogramId] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [viewingPayments, setViewingPayments] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [studentToApprove, setStudentToApprove] = useState(null);

  // Form Data State - Moved up to avoid initialization error
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
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

  // Location State
  const [cities, setCities] = useState([]);
  const [parentCities, setParentCities] = useState([]);

  // Regular Students Hooks
  const { data: backendStudents = [], isLoading, isError, error, refetch } = useGetStudentsQuery();

  // IELTS/TOEFL Students Hooks (Renamed refetch to refetchIelts)
  const {
    data: ieltsStudents = [],
    isLoading: isIeltsLoading,
    refetch: refetchIelts
  } = useGetIeltsToeflStudentsQuery();

  const { data: programs = [] } = useGetProgramsQuery();
  const { data: subprograms = [] } = useGetSubprogramsQuery();
  const { data: classes = [] } = useGetClassesQuery();
  const { data: sessionRequests = [] } = useGetSessionRequestsQuery();

  // Mutations
  const [createStudent, { isLoading: isCreating }] = useCreateStudentMutation();
  const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();
  const [deleteStudent, { isLoading: isDeleting }] = useDeleteStudentMutation();
  const [approveStudent, { isLoading: isApproving }] = useApproveStudentMutation();
  const [rejectStudent, { isLoading: isRejecting }] = useRejectStudentMutation();

  const [deleteIeltsStudent, { isLoading: isDeletingIelts }] = useDeleteIeltsToeflStudentMutation();
  const [updateIeltsStudent, { isLoading: isUpdatingIelts }] = useUpdateIeltsToeflStudentMutation();
  const [rejectIeltsStudent, { isLoading: isRejectingIelts }] = useRejectIeltsToeflStudentMutation();

  // Merge and format students
  const mergedStudents = [
    ...(backendStudents || []).map(s => ({
      ...s,
      type: 'regular',
      approval_status: (s.approval_status || 'pending').toLowerCase()
    })),
    ...ieltsStudents.map(s => ({
      ...s,
      full_name: `${s.first_name} ${s.last_name}`,
      chosen_program: s.exam_type,
      approval_status: (s.status || 'pending').toLowerCase(),
      id: `ielts_${s.id}`, // Unique ID for the table key
      original_id: s.id,   // Real ID for API calls
      type: 'ielts',
      class_name: s.class_id ? classes.find(c => c.id == s.class_id)?.class_name : null
    }))
  ];


  const handleAddStudent = () => {
    setEditingStudent(null);
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      age: "",
      gender: "",
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
    // Basic editing is primarily for regular students in this form structure
    // If you need to edit IELTS student details, you might need a separate modal or logic check here
    setEditingStudent(student);
    setFormData({
      full_name: student.full_name || "",
      email: student.email || "",
      phone: student.phone || "",
      age: student.age || "",
      gender: student.gender || "",
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

  const handleView = async (student) => {
    setViewingStudent(student);
    setIsViewModalOpen(true);

    // Fetch payments for this student
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
      // Use original_id if it exists (for IELTS), otherwise normal id
      const searchId = student.original_id || student.id;
      const res = await fetch(`${baseUrl}/api/payments/student/${searchId}`);
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        setViewingPayments(json.payments || []);
      } else {
        setViewingPayments([]);
      }
    } catch (err) {
      console.error('Failed to fetch payments for student', err);
      setViewingPayments([]);
    }
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingStudent(null);
    setViewingPayments([]);
  };

  const handleAssignSubprogram = (student) => {
    if (student.type === 'ielts') {
      showToast("Subprograms are currently managed differently for IELTS/TOEFL students.", "info");
      return;
    }
    setAssigningStudent(student);
    setIsAssignSubprogramModalOpen(true);
  };

  const handleAssignClass = (student) => {
    setAssigningStudent(student);
    setSelectedClassId(student.class_id || "");
    setIsAssignClassModalOpen(true);
  };

  const handleCloseAssignSubprogramModal = () => {
    setIsAssignSubprogramModalOpen(false);
    setAssigningStudent(null);
    setSelectedClassId("");
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
    // Find the student object to check type
    const studentToDelete = students.find(s => s.id === id);
    if (!studentToDelete) return;

    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        if (studentToDelete.type === 'ielts') {
          await deleteIeltsStudent(studentToDelete.original_id).unwrap();
        } else {
          await deleteStudent(id).unwrap();
        }
        showToast("Student deleted successfully!", "success");
      } catch (error) {
        console.error("Failed to delete student:", error);
        showToast("Failed to delete student. Please try again.", "error");
      }
    }
  };

  const handleViewProgramSubprograms = (programName) => {
    const program = programs.find(p => p.title === programName);
    if (program) {
      setSelectedProgramForSubprograms({ name: programName, id: program.id });
      setIsSubprogramsModalOpen(true);
    } else {
      showToast(`Program "${programName}" not found`, "error");
    }
  };

  const handleCloseSubprogramsModal = () => {
    setIsSubprogramsModalOpen(false);
    setSelectedProgramForSubprograms(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      age: "",
      gender: "",
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
        if (editingStudent.type === 'ielts') {
          // Logic for updating IELTS basics could go here if the API supports similar fields
          // For now, assume this modal is mostly for Regular students or shared basic info
          showToast("Editing detailed IELTS info via this modal is limited.", "info");
          await updateStudent({ id: editingStudent.id, ...submitData }).unwrap();
        } else {
          await updateStudent({ id: editingStudent.id, ...submitData }).unwrap();
        }
        showToast("Student updated successfully!", "success");
      } else {
        if (!submitData.password || submitData.password.trim() === "") {
          showToast("Password is required for new students", "error");
          return;
        }
        await createStudent(submitData).unwrap();
        showToast("Student created successfully!", "success");
      }

      handleCloseModal();
    } catch (error) {
      console.error("Failed to save student:", error);
      showToast(error?.data?.error || "Failed to save student.", "error");
    }

    return false;
  };

  const handleApprove = async (student) => {
    // If student passed, it means we're approving from the new modal or old action button
    const targetStudent = student || studentToApprove;
    if (!targetStudent) return;

    try {
      if (targetStudent.type === 'ielts') {
        await updateIeltsStudent({ id: targetStudent.original_id, status: 'approved' }).unwrap();
        refetchIelts();
      } else {
        await approveStudent(targetStudent.id).unwrap();
        refetch();
      }
      showToast("Student approved successfully!", "success");
      setIsApprovalModalOpen(false);
      // Removed automatic class assignment trigger as per request
    } catch (error) {
      showToast(error?.data?.error || "Failed to approve student.", "error");
    }
  };

  const handleReject = async (idOrStudent) => {
    const targetStudent = typeof idOrStudent === 'object' ? idOrStudent : students.find(s => s.id === idOrStudent);
    if (!targetStudent) return;

    try {
      if (targetStudent.type === 'ielts') {
        await rejectIeltsStudent(targetStudent.original_id).unwrap();
        refetchIelts();
      } else {
        await rejectStudent(targetStudent.id).unwrap();
        refetch();
      }
      showToast("Student rejected successfully!", "success");
      setIsApprovalModalOpen(false);
    } catch (error) {
      showToast(error?.data?.error || "Failed to reject student.", "error");
    }
  };

  const columns = [
    {
      key: "student_id",
      label: "Student ID",
      width: "150px",
      render: (row) => (
        <span className="font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">
          {row.student_id || "N/A"}
        </span>
      ),
    },
    {
      key: "full_name",
      label: "Full Name",
      width: "180px",
    },
    {
      key: "email",
      label: "Email",
      width: "220px",
    },
    {
      key: "phone",
      label: "Phone",
      width: "150px",
      render: (row) => row.phone || "N/A",
    },
    {
      key: "age",
      label: "Age",
      width: "80px",
      render: (row) => row.age || "N/A",
    },
    {
      key: "gender",
      label: "Gender",
      width: "100px",
      render: (row) => row.gender || "N/A",
    },
    {
      key: "residency_country",
      label: "Country",
      width: "150px",
      render: (row) => row.residency_country || "N/A",
    },
    {
      key: "residency_city",
      label: "City",
      width: "150px",
      render: (row) => row.residency_city || "N/A",
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
      key: "approval_status",
      label: "Status",
      render: (row) => {
        const status = row.approval_status || 'pending';

        if (status === 'pending') {
          return (
            <button
              onClick={() => {
                setStudentToApprove(row);
                setIsApprovalModalOpen(true);
              }}
              className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
            >
              Pending
            </button>
          );
        }

        if (status === 'approved') {
          return (
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
              Approved
            </span>
          );
        }

        if (status === 'inactive') {
          return (
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
              Inactive
            </span>
          );
        }

        if (status === 'rejected') {
          return (
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
              Rejected
            </span>
          );
        }

        return (
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
            {status}
          </span>
        );
      }
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
              disabled={isDeleting || isDeletingIelts}
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
        <main className="flex-1 min-w-0 flex flex-col items-center bg-gray-50 pt-20 transition-colors">
          <div className="flex-1 w-full max-w-full px-4 sm:px-8 py-6 flex items-center justify-center">
            <div className="text-center">
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
        <main className="flex-1 min-w-0 flex flex-col items-center bg-gray-50 pt-20 transition-colors">
          <div className="flex-1 w-full max-w-full px-4 sm:px-8 py-6 flex items-center justify-center">
            <div className="text-center">
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

      <main className="flex-1 min-w-0 flex flex-col items-center overflow-y-auto overflow-x-hidden bg-gray-50 pt-20">
        <div className="w-full max-w-full px-4 sm:px-8 py-6 min-w-0 flex flex-col">
          <DataTable
            title="Student Management"
            columns={columns}
            data={mergedStudents}
            onAddClick={handleAddStudent}
            showAddButton={true}
          />
        </div>
      </main>

      {/* Approval Confirmation Modal */}
      {isApprovalModalOpen && studentToApprove && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsApprovalModalOpen(false)}
          />
          <div className={`relative w-full max-w-md rounded-xl shadow-2xl overflow-hidden border-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
            }`}>
            <div className={`sticky top-0 z-10 px-6 py-4 border-b flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Student Approval
              </h3>
              <button
                onClick={() => setIsApprovalModalOpen(false)}
                className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-600'
                  }`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{studentToApprove.full_name}</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{studentToApprove.email}</p>
                </div>
              </div>

              <div className={`p-4 rounded-lg mb-6 text-sm border ${isDark ? 'bg-gray-700/30 border-gray-600 text-gray-300' : 'bg-blue-50/50 border-blue-100 text-blue-800'
                }`}>
                <p>Give him approve or reject for this student application.</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleReject(studentToApprove)}
                  disabled={isRejecting || isRejectingIelts}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(studentToApprove)}
                  disabled={isApproving}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Student Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
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
                  {/* ... (Other form fields remain the same) ... */}
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
                    <div>
                      <label htmlFor="residency_country" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        Residency Country
                      </label>
                      <CountrySelect
                        value={formData.residency_country}
                        onChange={(value) => {
                          handleInputChange({ target: { name: 'residency_country', value } });
                          handleInputChange({ target: { name: 'residency_city', value: '' } });
                        }}
                        isDark={isDark}
                        placeholder="Select Country"
                      />
                    </div>

                    <div>
                      <label htmlFor="residency_city" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        Residency City
                      </label>
                      <select
                        id="residency_city"
                        name="residency_city"
                        value={formData.residency_city}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                          }`}
                        disabled={!formData.residency_country}
                      >
                        <option value="">Select City</option>
                        {cities.map((city) => (
                          <option key={city.name} value={city.name}>{city.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="phone" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        Phone
                      </label>
                      <PhoneInput
                        country={(() => {
                          if (formData.residency_country) {
                            const c = Country.getAllCountries().find(c => c.name === formData.residency_country);
                            return c ? c.isoCode.toLowerCase() : 'us';
                          }
                          return 'us';
                        })()}
                        enableSearch={true}
                        separateDialCode={true}
                        disableDropdown={true}
                        value={formData.phone}
                        onChange={phone => setFormData(prev => ({ ...prev, phone }))}
                        inputStyle={{
                          width: '100%',
                          height: '42px',
                          fontSize: '16px',
                          paddingLeft: '12px',
                          borderRadius: '0.5rem',
                          border: 'none',
                          borderLeft: isDark ? '1px solid #4b5563' : '1px solid #d1d5db',
                          backgroundColor: 'transparent',
                          color: isDark ? 'white' : 'inherit',
                          boxShadow: 'none'
                        }}
                        containerStyle={{
                          width: '100%',
                          border: isDark ? '1px solid #4b5563' : '1px solid #d1d5db',
                          borderRadius: '0.5rem',
                          backgroundColor: isDark ? '#374151' : 'white'
                        }}
                        buttonStyle={{
                          border: 'none',
                          borderRight: isDark ? '1px solid #4b5563' : '1px solid #d1d5db',
                          backgroundColor: 'transparent',
                          borderRadius: '0.5rem 0 0 0.5rem',
                          paddingLeft: '8px',
                          paddingRight: '8px',
                          cursor: 'default'
                        }}
                        dropdownStyle={{
                          color: 'black',
                          width: '300px'
                        }}
                        placeholder="Phone Number"
                      />
                    </div>
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
                    <label htmlFor="gender" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                        }`}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="residency_country" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                      Residency Country
                    </label>
                    <select
                      id="residency_country"
                      name="residency_country"
                      value={formData.residency_country}
                      onChange={(e) => {
                        handleInputChange({ target: { name: 'residency_country', value: e.target.value } });
                        // Also clear city manually or let effect handle it (effect resets list, but value might stick if not cleared)
                        // Ideally we clear the city value too
                        handleInputChange({ target: { name: 'residency_city', value: '' } });
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                        }`}
                    >
                      <option value="">Select Country</option>
                      {Country.getAllCountries().map((country) => (
                        <option key={country.isoCode} value={country.name}>{country.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="residency_city" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                      Residency City
                    </label>
                    <select
                      id="residency_city"
                      name="residency_city"
                      value={formData.residency_city}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                        }`}
                      disabled={!formData.residency_country}
                    >
                      <option value="">Select City</option>
                      {cities.map((city, index) => (
                        <option key={`${city.name}-${index}`} value={city.name}>{city.name}</option>
                      ))}
                    </select>
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
                </div>
              </div>

              {/* Payment Summary Section */}
              <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-yellow-50/60 border-yellow-200'
                }`}>
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'
                  }`}>
                  Payment Summary
                </h3>
                <div className="space-y-3">
                  <p className={isDark ? 'text-gray-200' : 'text-gray-800'}>
                    {viewingPayments.length === 0
                      ? "This student has no recorded payments yet."
                      : (() => {
                        const totalPaid = viewingPayments
                          .filter(p => p.status === 'paid' || p.status === 'completed')
                          .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
                        return `This student has paid a total of $${totalPaid.toFixed(2)} so far.`;
                      })()}
                  </p>
                </div>
              </div>

              {/* Parent Information Section */}
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
                      <label htmlFor="parent_res_county" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        Parent Residency Country
                      </label>
                      <CountrySelect
                        value={formData.parent_res_county}
                        onChange={(value) => {
                          handleInputChange({ target: { name: 'parent_res_county', value } });
                          handleInputChange({ target: { name: 'parent_res_city', value: '' } });
                        }}
                        isDark={isDark}
                        placeholder="Select Country"
                      />
                    </div>

                    <div>
                      <label htmlFor="parent_res_city" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        Parent Residency City
                      </label>
                      <select
                        id="parent_res_city"
                        name="parent_res_city"
                        value={formData.parent_res_city}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                          }`}
                        disabled={!formData.parent_res_county}
                      >
                        <option value="">Select City</option>
                        {parentCities.map((city, index) => (
                          <option key={`${city.name}-${index}`} value={city.name}>{city.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="parent_phone" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        Parent Phone
                      </label>
                      <PhoneInput
                        country={(() => {
                          if (formData.parent_res_county) {
                            const c = Country.getAllCountries().find(c => c.name === formData.parent_res_county);
                            return c ? c.isoCode.toLowerCase() : 'us';
                          }
                          return 'us';
                        })()}
                        enableSearch={true}
                        separateDialCode={true}
                        disableDropdown={true}
                        value={formData.parent_phone}
                        onChange={phone => setFormData(prev => ({ ...prev, parent_phone: phone }))}
                        inputStyle={{
                          width: '100%',
                          height: '42px',
                          fontSize: '16px',
                          paddingLeft: '12px',
                          borderRadius: '0.5rem',
                          border: 'none',
                          borderLeft: isDark ? '1px solid #4b5563' : '1px solid #d1d5db',
                          backgroundColor: 'transparent',
                          color: isDark ? 'white' : 'inherit',
                          boxShadow: 'none'
                        }}
                        containerStyle={{
                          width: '100%',
                          border: isDark ? '1px solid #4b5563' : '1px solid #d1d5db',
                          borderRadius: '0.5rem',
                          backgroundColor: isDark ? '#374151' : 'white'
                        }}
                        buttonStyle={{
                          border: 'none',
                          borderRight: isDark ? '1px solid #4b5563' : '1px solid #d1d5db',
                          backgroundColor: 'transparent',
                          borderRadius: '0.5rem 0 0 0.5rem',
                          paddingLeft: '8px',
                          paddingRight: '8px',
                          cursor: 'default'
                        }}
                        dropdownStyle={{
                          color: 'black',
                          width: '300px'
                        }}
                        placeholder="Phone Number"
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
                      <select
                        id="parent_res_county"
                        name="parent_res_county"
                        value={formData.parent_res_county}
                        onChange={(e) => {
                          handleInputChange({ target: { name: 'parent_res_county', value: e.target.value } });
                          handleInputChange({ target: { name: 'parent_res_city', value: '' } });
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                          }`}
                      >
                        <option value="">Select Country</option>
                        {Country.getAllCountries().map((country) => (
                          <option key={country.isoCode} value={country.name}>{country.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="parent_res_city" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        Parent Residency City
                      </label>
                      <select
                        id="parent_res_city"
                        name="parent_res_city"
                        value={formData.parent_res_city}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                          }`}
                        disabled={!formData.parent_res_county}
                      >
                        <option value="">Select City</option>
                        {parentCities.map((city, index) => (
                          <option key={`${city.name}-${index}`} value={city.name}>{city.name}</option>
                        ))}
                      </select>
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
                  disabled={isCreating || isUpdating || isUpdatingIelts}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating || isUpdating ? "Saving..." : editingStudent ? "Update Student" : "Add Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Subprograms Modal */}
      {isSubprogramsModalOpen && selectedProgramForSubprograms && (
        <SubprogramsModal
          program={selectedProgramForSubprograms}
          onClose={handleCloseSubprogramsModal}
          isDark={isDark}
        />
      )}

      {/* Assign to Class Modal */}
      {isAssignSubprogramModalOpen && assigningStudent && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
            onClick={handleCloseAssignSubprogramModal}
          />

          <div
            className={`relative rounded-xl shadow-2xl w-full max-w-lg overflow-y-auto border-2 ${isDark
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-100"
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`sticky top-0 z-10 border-b px-6 py-4 flex items-center justify-between ${isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
                }`}
            >
              <h2
                className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"
                  }`}
              >
                Assign to Class
              </h2>
              <button
                onClick={handleCloseAssignSubprogramModal}
                className={`transition-colors ${isDark
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-gray-400 hover:text-gray-600"
                  }`}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!assigningStudent) return;

                const formData = new FormData(e.target);
                const subprogramName = formData.get("subprogram_name");

                try {
                  await updateStudent({
                    id: assigningStudent.id,
                    chosen_subprogram: subprogramName || null,
                  }).unwrap();
                  showToast("Select successfull", "success");
                  refetch();
                  handleCloseAssignSubprogramModal();
                } catch (error) {
                  console.error("Failed to assign subprogram:", error);
                  showToast(
                    error?.data?.error || "Failed to assign subprogram.",
                    "error"
                  );
                }
              }}
              className="p-6 space-y-4"
            >
              {/* Student Info Section */}
              <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-blue-50/50 border-blue-200'}`}>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Student ID</p>
                      <p className={`font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{assigningStudent.student_id || 'N/A'}</p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Full Name</p>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{assigningStudent.full_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Email:</span>
                    <span className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{assigningStudent.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Program:</span>
                    <span className={`text-base font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{assigningStudent.chosen_program || 'Not assigned'}</span>
                  </div>
                </div>
              </div>

              {/* Subprogram Selection */}
              {assigningStudent.chosen_program ? (
                <div>
                  <label
                    htmlFor="subprogram_name"
                    className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                  >
                    Select Subprogram
                  </label>
                  {(() => {
                    const program = programs.find(
                      (p) => p.title === assigningStudent.chosen_program
                    );
                    const programSubprograms = program
                      ? allSubprograms.filter((sp) => sp.program_id === program.id)
                      : [];

                    if (programSubprograms.length === 0) {
                      return (
                        <p
                          className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                        >
                          No subprograms available for this program.
                        </p>
                      );
                    }

                    return (
                      <select
                        id="subprogram_name"
                        name="subprogram_name"
                        defaultValue={assigningStudent.chosen_subprogram || ""}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "border-gray-300"
                          }`}
                        required
                      >
                        <option value="">Select a subprogram</option>
                        {programSubprograms.map((sp) => (
                          <option key={sp.id} value={sp.subprogram_name}>
                            {sp.subprogram_name}
                          </option>
                        ))}
                      </select>
                    );
                  })()}
                </div>
              ) : (
                <div
                  className={`p-4 rounded-lg ${isDark
                    ? "bg-yellow-900/20 border border-yellow-700"
                    : "bg-yellow-50 border border-yellow-200"
                    }`}
                >
                  <p
                    className={`text-sm ${isDark ? "text-yellow-300" : "text-yellow-800"
                      }`}
                  >
                    Please assign a program to this student first before
                    assigning a subprogram.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCloseAssignSubprogramModal}
                  className={`px-4 py-2 border rounded-lg transition-colors ${isDark
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || !assigningStudent.chosen_program}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? "Assigning..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Class Modal - FIXED LOGIC */}
      {isAssignClassModalOpen && assigningStudent && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
            onClick={handleCloseAssignClassModal}
          />

          <div
            className={`relative rounded-xl shadow-2xl w-full max-w-lg overflow-y-auto border-2 ${isDark
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-100"
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`sticky top-0 z-10 border-b px-6 py-4 flex items-center justify-between ${isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
                }`}
            >
              <h2
                className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"
                  }`}
              >
                Assign Class to {assigningStudent.full_name}
              </h2>
              <button
                onClick={handleCloseAssignClassModal}
                className={`transition-colors ${isDark
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-gray-400 hover:text-gray-600"
                  }`}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!assigningStudent) return;
                try {
                  // LOGIC FIX: Check student type to call the correct API
                  if (assigningStudent.type === 'ielts') {
                    await updateIeltsStudent({
                      id: assigningStudent.original_id, // Use original ID
                      class_id: selectedClassId || null,
                    }).unwrap();
                    refetchIelts(); // Refetch IELTS list
                  } else {
                    await updateStudent({
                      id: assigningStudent.id,
                      class_id: selectedClassId || null,
                    }).unwrap();
                    refetch(); // Refetch Regular list
                  }

                  showToast("Class assigned successfully!", "success");
                  handleCloseAssignClassModal();
                } catch (error) {
                  console.error("Failed to assign class:", error);
                  showToast(error?.data?.error || "Failed to assign class.", "error");
                }
              }}
              className="p-6 space-y-4"
            >
              {classes.length === 0 ? (
                <div
                  className={`p-4 rounded-lg ${isDark
                    ? "bg-yellow-900/20 border border-yellow-700"
                    : "bg-yellow-50 border-yellow-200"
                    }`}
                >
                  <p
                    className={`text-sm ${isDark ? "text-yellow-200" : "text-yellow-800"
                      }`}
                  >
                    There are no classes available yet. Please create classes
                    first in the Class Management page.
                  </p>
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="class_id"
                    className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                  >
                    Select Class
                  </label>
                  <select
                    id="class_id"
                    name="class_id"
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "border-gray-300"
                      }`}
                    required
                  >
                    <option value="">Select a class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.class_name} — {cls.description || "No description"}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCloseAssignClassModal}
                  className={`px-4 py-2 border rounded-lg transition-colors ${isDark
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || isUpdatingIelts || classes.length === 0}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating || isUpdatingIelts ? "Assigning..." : "Save Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Student Modal */}
      {isViewModalOpen && viewingStudent && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          <div
            className="absolute inset-0  backdrop-blur-sm"
            aria-hidden="true"
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
                Student Profile: {viewingStudent.full_name}
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
                      {viewingStudent.full_name || 'N/A'}
                    </p>
                  </div>
                  {/* ... other profile fields ... */}
                  <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>Email</label>
                    <p className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                      {viewingStudent.email || 'N/A'}
                    </p>
                  </div>
                  <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>Phone</label>
                    <p className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                      {viewingStudent.phone || 'N/A'}
                    </p>
                  </div>
                  <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>Age</label>
                    <p className={`text-base font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                      {viewingStudent.age || 'N/A'} {viewingStudent.age ? 'years' : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location Information Section */}
              <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-purple-50/50 border-purple-200'
                }`}>
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'
                  }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Location Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>Country</label>
                    <p className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                      {viewingStudent.residency_country || 'N/A'}
                    </p>
                  </div>
                  <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>City</label>
                    <p className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                      {viewingStudent.residency_city || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Academic Information Section */}
              <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-green-50/50 border-green-200'
                }`}>
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'
                  }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Academic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>Program</label>
                    <p className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {viewingStudent.chosen_program || 'Not assigned'}
                    </p>
                  </div>
                  <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>Subprogram</label>
                    <p className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                      {viewingStudent.chosen_subprogram && viewingStudent.chosen_subprogram.trim() !== "" && viewingStudent.chosen_subprogram !== "null"
                        ? viewingStudent.chosen_subprogram
                        : 'Not assigned'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Parent/Guardian Information Section - Only show if age < 18 */}
              {viewingStudent.age && parseInt(viewingStudent.age) < 18 && (
                <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-orange-50/50 border-orange-200'
                  }`}>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'
                    }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Parent/Guardian Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                      <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>Parent Name</label>
                      <p className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                        {viewingStudent.parent_name || 'N/A'}
                      </p>
                    </div>
                    <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                      <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>Parent Email</label>
                      <p className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                        {viewingStudent.parent_email || 'N/A'}
                      </p>
                    </div>
                    <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                      <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>Parent Phone</label>
                      <p className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                        {viewingStudent.parent_phone || 'N/A'}
                      </p>
                    </div>
                    <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                      <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>Relation</label>
                      <p className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                        {viewingStudent.parent_relation || 'N/A'}
                      </p>
                    </div>
                    <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                      <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>Parent Country</label>
                      <p className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                        {viewingStudent.parent_res_county || 'N/A'}
                      </p>
                    </div>
                    <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                      <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>Parent City</label>
                      <p className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                        {viewingStudent.parent_res_city || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Information Section */}
              <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-indigo-50/50 border-indigo-200'}`}>
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Payment Information
                </h3>
                {viewingPayments && viewingPayments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Total Paid */}
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                      <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Paid</label>
                      <p className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                        ${viewingPayments
                          .filter(p => p.status === 'paid' || p.status === 'completed')
                          .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
                          .toFixed(2)}
                      </p>
                    </div>
                    {/* Payment Method */}
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                      <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Payment Method</label>
                      <p className={`text-base font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                        {[...new Set(viewingPayments.map(p => p.payment_method).filter(Boolean))].join(', ') || 'N/A'}
                      </p>
                    </div>
                    {/* Total Payments */}
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                      <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Payments</label>
                      <p className={`text-base font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                        {viewingPayments.length} payment{viewingPayments.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    No payment records found for this student.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Subprograms Modal Component (unchanged logic, just helper)
function SubprogramsModal({ program, onClose, isDark }) {
  // NOTE: This component needs the import if it was external, but since it's internal we need the hook.
  // Assuming the hook is available in the file or imported. 
  // Based on your initial code, useGetSubprogramsByProgramIdQuery wasn't imported.
  // I will assume it's part of api/subprogramApi or needs to be filtered from allSubprograms if the hook doesn't exist.
  // To stay safe based on your imports, I will filter from 'allSubprograms' passed as prop if possible, 
  // OR if the hook exists in your project but wasn't in the import list, it needs to be added.
  // However, usually it's cleaner to just fetch all subprograms and filter in frontend if the dataset is small, 
  // or use the specific query.

  // Since I cannot see the API definition file, I will use a placeholder query assuming it exists 
  // OR rely on the fact that you might have `useGetSubprogramsByProgramIdQuery` in the actual file imports but missed it in the snippet.
  // **Correction**: In your provided code, you didn't import `useGetSubprogramsByProgramIdQuery`.
  // I will use `useGetSubprogramsQuery` and filter to avoid crashes.

  const { data: allSubprograms, isLoading, isError } = useGetSubprogramsQuery();
  const subprograms = allSubprograms ? allSubprograms.filter(s => s.program_id === program.id) : [];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
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
            Subprograms for {program.name}
          </h2>
          <button
            onClick={onClose}
            className={`transition-colors ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 bg-gray-50">
          {isLoading ? (
            <div className="text-center py-8">
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading subprograms...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400">Error loading subprograms</p>
            </div>
          ) : !subprograms || subprograms.length === 0 ? (
            <div className="text-center py-8">
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No subprograms found for this program.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subprograms.map((subprogram) => (
                <div
                  key={subprogram.id}
                  className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}
                >
                  <h3 className={`font-semibold text-lg mb-2 ${isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                    {subprogram.subprogram_name}
                  </h3>
                  <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                    {subprogram.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${subprogram.status === 'active'
                      ? isDark
                        ? 'bg-green-900/30 text-green-300 border border-green-700'
                        : 'bg-green-100 text-green-800'
                      : isDark
                        ? 'bg-gray-700 text-gray-400 border border-gray-600'
                        : 'bg-gray-200 text-gray-600'
                      }`}>
                      {subprogram.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}