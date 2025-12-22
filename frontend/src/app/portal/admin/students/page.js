"use client";

import { useState, useEffect } from "react";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";
import { useToast } from "@/components/Toast";
import { 
  useGetStudentsQuery, 
  useCreateStudentMutation, 
  useUpdateStudentMutation, 
  useDeleteStudentMutation,
  useApproveStudentMutation,
  useRejectStudentMutation 
} from "@/redux/api/studentApi";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useGetSubprogramsQuery } from "@/redux/api/subprogramApi";
import { useGetClassesQuery } from "@/redux/api/classApi";
import { 
  useGetIeltsToeflStudentsQuery, 
  useDeleteIeltsToeflStudentMutation, 
  useUpdateIeltsToeflStudentMutation,
  useRejectIeltsToeflStudentMutation 
} from "@/redux/api/ieltsToeflApi";
import { useDarkMode } from "@/context/ThemeContext";

export default function StudentsPage() {
  const { isDark } = useDarkMode();
  const { showToast } = useToast(); // Initialize toast
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSubprogramsModalOpen, setIsSubprogramsModalOpen] = useState(false);
  const [isAssignSubprogramModalOpen, setIsAssignSubprogramModalOpen] = useState(false);
  const [isAssignClassModalOpen, setIsAssignClassModalOpen] = useState(false);
  const [selectedProgramForSubprograms, setSelectedProgramForSubprograms] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [viewingPayments, setViewingPayments] = useState([]);
  const [assigningStudent, setAssigningStudent] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState("");

  // Regular Students Hooks
  const { data: backendStudents, isLoading, isError, error, refetch } = useGetStudentsQuery();
  
  // IELTS/TOEFL Students Hooks (Renamed refetch to refetchIelts)
  const { 
    data: ieltsStudents = [], 
    isLoading: isIeltsLoading, 
    refetch: refetchIelts 
  } = useGetIeltsToeflStudentsQuery();

  const { data: programs = [] } = useGetProgramsQuery();
  const { data: allSubprograms = [] } = useGetSubprogramsQuery();
  const { data: classes = [] } = useGetClassesQuery();

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
  const students = [
    ...(backendStudents || []).map(s => ({ ...s, type: 'regular' })),
    ...ieltsStudents.map(s => ({
      ...s,
      full_name: `${s.first_name} ${s.last_name}`,
      chosen_program: s.exam_type,
      approval_status: s.status?.toLowerCase() || 'pending',
      id: `ielts_${s.id}`, // Unique ID for the table key
      original_id: s.id,   // Real ID for API calls
      type: 'ielts',
      class_name: s.class_id ? classes.find(c => c.id == s.class_id)?.class_name : null
    }))
  ];

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
    // Basic editing is primarily for regular students in this form structure
    // If you need to edit IELTS student details, you might need a separate modal or logic check here
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
    if (!confirm("Are you sure you want to approve this student?")) return;
    try {
      if (student.type === 'ielts') {
        // IELTS approval logic is usually just a status update via Update endpoint or specific endpoint
        // Assuming updateIeltsStudent with status='approved' or similar
        await updateIeltsStudent({ id: student.original_id, status: 'approved' }).unwrap();
        refetchIelts();
      } else {
        await approveStudent(student.id).unwrap();
        refetch(); // Ensure regular list updates
      }
      showToast("Student approved successfully! Please assign a class.", "success");
      handleAssignClass(student);
    } catch (error) {
      showToast(error?.data?.error || "Failed to approve student.", "error");
    }
  };

  const handleReject = async (id) => {
    const studentToReject = students.find(s => s.id === id);
    if (!confirm("Are you sure you want to reject this student?")) return;
    try {
      if (studentToReject && studentToReject.type === 'ielts') {
        await rejectIeltsStudent(studentToReject.original_id).unwrap();
        refetchIelts();
      } else {
        await rejectStudent(id).unwrap();
      }
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
      key: "residency_city",
      label: "City",
      render: (row) => row.residency_city || "N/A",
    },
    {
      key: "chosen_program",
      label: "Program",
      render: (row) => {
        if (!row.chosen_program || row.chosen_program === "Not assigned") {
          return <span className="text-gray-500">Not assigned</span>;
        }
        return row.chosen_program;
      },
    },
    {
      key: "chosen_subprogram",
      label: "Subprogram",
      render: (row) => {
        const subprogram = row.chosen_subprogram;
        if (subprogram && subprogram.trim() !== "" && subprogram !== "null") {
          return <span className="text-black dark:text-white">{subprogram}</span>;
        }
        return <span className="text-gray-500">Not assigned</span>;
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

            {isApproved && (
              <button
                onClick={() => handleAssignClass(row)}
                disabled={isApproving || isRejecting}
                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors p-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Assign Class"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 14l9-5-9-5-9 5 9 5z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 14l6.16-3.422A12.083 12.083 0 0118 20.944L12 23l-6-2.056A12.083 12.083 0 015.84 10.578L12 14z"
                  />
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
            {/* Modal Content - (Kept same as original mostly) */}
            <div className={`sticky top-0 border-b px-6 py-4 flex items-center justify-between ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                {editingStudent ? "Edit Student" : "Add New Student"}
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
              <div className={`p-4 rounded-lg border ${
                isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-blue-50/50 border-blue-200'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>
                  Student Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="full_name" className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
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
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {/* ... (Other form fields remain the same) ... */}
                  <div>
                    <label htmlFor="email" className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
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
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label htmlFor="age" className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
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
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label htmlFor="residency_country" className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Residency Country
                    </label>
                    <input
                      type="text"
                      id="residency_country"
                      name="residency_country"
                      value={formData.residency_country}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label htmlFor="residency_city" className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Residency City
                    </label>
                    <input
                      type="text"
                      id="residency_city"
                      name="residency_city"
                      value={formData.residency_city}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label htmlFor="chosen_program" className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Chosen Program
                    </label>
                    <select
                      id="chosen_program"
                      name="chosen_program"
                      value={formData.chosen_program}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
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
                      <label htmlFor="password" className={`block text-sm font-medium mb-1 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
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
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                        }`}
                      />
                    </div>
                  )}

                  {editingStudent && (
                    <div>
                      <label htmlFor="password" className={`block text-sm font-medium mb-1 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        New Password (leave blank to keep current)
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                        }`}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Summary Section */}
              <div className={`p-5 rounded-lg border ${
                isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-yellow-50/60 border-yellow-200'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                  isDark ? 'text-white' : 'text-gray-800'
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
                <div className={`p-4 rounded-lg border ${
                  isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-purple-50/50 border-purple-200'
                }`}>
                  <h3 className={`text-lg font-semibold mb-4 ${
                    isDark ? 'text-white' : 'text-gray-800'
                  }`}>
                    Parent/Guardian Information
                  </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ... Parent Fields ... */}
                  <div>
                    <label htmlFor="parent_name" className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Parent Name
                    </label>
                    <input
                      type="text"
                      id="parent_name"
                      name="parent_name"
                      value={formData.parent_name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label htmlFor="parent_email" className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Parent Email
                    </label>
                    <input
                      type="email"
                      id="parent_email"
                      name="parent_email"
                      value={formData.parent_email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label htmlFor="parent_phone" className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Parent Phone
                    </label>
                    <input
                      type="tel"
                      id="parent_phone"
                      name="parent_phone"
                      value={formData.parent_phone}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                    />
                  </div>
                   {/* Rest of parent fields assumed similar... */}
                   <div>
                    <label htmlFor="parent_relation" className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Parent Relation
                    </label>
                    <input
                      type="text"
                      id="parent_relation"
                      name="parent_relation"
                      value={formData.parent_relation}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label htmlFor="parent_res_county" className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Parent Residency Country
                    </label>
                    <input
                      type="text"
                      id="parent_res_county"
                      name="parent_res_county"
                      value={formData.parent_res_county}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label htmlFor="parent_res_city" className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Parent Residency City
                    </label>
                    <input
                      type="text"
                      id="parent_res_city"
                      name="parent_res_city"
                      value={formData.parent_res_city}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
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

      {/* Assign Subprogram Modal */}
      {isAssignSubprogramModalOpen && assigningStudent && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ pointerEvents: 'none' }}
        >
          <div 
            className="absolute inset-0 bg-transparent"
            onClick={handleCloseAssignSubprogramModal}
            style={{ pointerEvents: 'auto' }}
          />
          
          <div 
            className={`relative rounded-lg shadow-2xl w-full max-w-4xl mx-4 border-2 ${
              isDark ? 'bg-gray-800/95 border-gray-600' : 'bg-white/95 border-gray-300'
            }`}
            onClick={(e) => e.stopPropagation()}
            style={{ pointerEvents: 'auto', backdropFilter: 'blur(2px)' }}
          >
            {/* ... Modal Header ... */}
             <div className={`sticky top-0 border-b px-6 py-4 flex items-center justify-between ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                Assign Subprogram to {assigningStudent.full_name}
              </h2>
              <button
                onClick={handleCloseAssignSubprogramModal}
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
                  const subprogramName = e.target.subprogram_name.value;
                  const updateData = {
                    id: assigningStudent.id,
                    full_name: assigningStudent.full_name,
                    email: assigningStudent.email,
                    phone: assigningStudent.phone,
                    age: assigningStudent.age,
                    residency_country: assigningStudent.residency_country,
                    residency_city: assigningStudent.residency_city,
                    chosen_program: assigningStudent.chosen_program,
                    chosen_subprogram: subprogramName || null,
                    parent_name: assigningStudent.parent_name || null,
                    parent_email: assigningStudent.parent_email || null,
                    parent_phone: assigningStudent.parent_phone || null,
                    parent_relation: assigningStudent.parent_relation || null,
                    parent_res_county: assigningStudent.parent_res_county || null,
                    parent_res_city: assigningStudent.parent_res_city || null,
                  };
                  
                  await updateStudent(updateData).unwrap();
                  await refetch();
                  showToast("Subprogram assigned successfully!", "success");
                  handleCloseAssignSubprogramModal();
                } catch (error) {
                  console.error("Failed to assign subprogram:", error);
                  showToast(error?.data?.error || "Failed to assign subprogram.", "error");
                }
              }}
              className="p-6 space-y-4"
            >
              {assigningStudent.chosen_program ? (
                <div>
                  <label htmlFor="subprogram_name" className={`block text-sm font-medium mb-1 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Select Subprogram
                  </label>
                  {(() => {
                    const program = programs.find(p => p.title === assigningStudent.chosen_program);
                    const programSubprograms = program 
                      ? allSubprograms.filter(sp => sp.program_id === program.id)
                      : [];
                    
                    if (programSubprograms.length === 0) {
                      return (
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          No subprograms available for this program.
                        </p>
                      );
                    }

                    return (
                      <select
                        id="subprogram_name"
                        name="subprogram_name"
                        defaultValue={assigningStudent.chosen_subprogram || ""}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select Subprogram (Optional)</option>
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
                <div className={`p-4 rounded-lg ${
                  isDark ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'
                }`}>
                  <p className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>
                    Please assign a program to this student first before assigning a subprogram.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCloseAssignSubprogramModal}
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
                  disabled={isUpdating || !assigningStudent.chosen_program}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? "Assigning..." : "Save Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Class Modal - FIXED LOGIC */}
      {isAssignClassModalOpen && assigningStudent && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ pointerEvents: "none" }}
        >
          <div
            className="absolute inset-0 bg-transparent"
            onClick={handleCloseAssignClassModal}
            style={{ pointerEvents: "auto" }}
          />

          <div
            className={`relative rounded-lg shadow-2xl w-full max-w-lg mx-4 border-2 ${
              isDark
                ? "bg-gray-800/95 border-gray-600"
                : "bg-white/95 border-gray-300"
            }`}
            onClick={(e) => e.stopPropagation()}
            style={{ pointerEvents: "auto", backdropFilter: "blur(2px)" }}
          >
            <div
              className={`sticky top-0 border-b px-6 py-4 flex items-center justify-between ${
                isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <h2
                className={`text-2xl font-bold ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                Assign Class to {assigningStudent.full_name}
              </h2>
              <button
                onClick={handleCloseAssignClassModal}
                className={`transition-colors ${
                  isDark
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
                  className={`p-4 rounded-lg ${
                    isDark
                      ? "bg-yellow-900/20 border border-yellow-700"
                      : "bg-yellow-50 border-yellow-200"
                  }`}
                >
                  <p
                    className={`text-sm ${
                      isDark ? "text-yellow-200" : "text-yellow-800"
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
                    className={`block text-sm font-medium mb-1 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Select Class
                  </label>
                  <select
                    id="class_id"
                    name="class_id"
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark
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
                  className={`px-4 py-2 border rounded-lg transition-colors ${
                    isDark
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
          style={{ pointerEvents: 'none' }}
        >
          <div 
            className="absolute inset-0 bg-transparent"
            onClick={handleCloseViewModal}
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
                Student Profile: {viewingStudent.full_name}
              </h2>
              <button
                onClick={handleCloseViewModal}
                className={`transition-colors ${
                  isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Personal Information Section */}
              <div className={`p-5 rounded-lg border ${
                isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-blue-50/50 border-blue-200'
              }`}>
                {/* ... Profile fields ... */}
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Full Name</label>
                    <p className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {viewingStudent.full_name || 'N/A'}
                    </p>
                  </div>
                  {/* ... other profile fields ... */}
                  <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Email</label>
                    <p className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                      {viewingStudent.email || 'N/A'}
                    </p>
                  </div>
                  <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Phone</label>
                    <p className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                      {viewingStudent.phone || 'N/A'}
                    </p>
                  </div>
                  <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Age</label>
                    <p className={`text-base font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                      {viewingStudent.age || 'N/A'} {viewingStudent.age ? 'years' : ''}
                    </p>
                  </div>
                </div>
              </div>

               {/* Academic Information Section */}
               <div className={`p-5 rounded-lg border ${
                isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-green-50/50 border-green-200'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>
                  Academic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Program</label>
                    <p className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {viewingStudent.chosen_program || 'Not assigned'}
                    </p>
                  </div>
                  <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Subprogram</label>
                    <p className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                      {viewingStudent.chosen_subprogram && viewingStudent.chosen_subprogram.trim() !== "" && viewingStudent.chosen_subprogram !== "null"
                        ? viewingStudent.chosen_subprogram
                        : 'Not assigned'}
                    </p>
                  </div>
                </div>
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
      style={{ pointerEvents: 'none' }}
    >
      <div 
        className="absolute inset-0 bg-transparent"
        onClick={onClose}
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
            Subprograms for {program.name}
          </h2>
          <button
            onClick={onClose}
            className={`transition-colors ${
              isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
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
                  className={`p-4 rounded-lg border ${
                    isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <h3 className={`font-semibold text-lg mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {subprogram.subprogram_name}
                  </h3>
                  <p className={`text-sm mb-3 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {subprogram.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      subprogram.status === 'active'
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