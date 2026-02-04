"use client";

import { useState, useMemo } from "react";

import DataTable from "@/components/DataTable";
import { useGetStudentsQuery, useUpdateStudentMutation } from "@/redux/api/studentApi";
import { useGetSubprogramsQuery } from "@/redux/api/subprogramApi";
import { useGetClassesQuery } from "@/redux/api/classApi";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useGetShiftsQuery } from "@/redux/api/shiftApi";
import { useGetSessionRequestsQuery } from "@/redux/api/sessionRequestApi";
import { useDarkMode } from "@/context/ThemeContext";
import { useToast } from "@/components/Toast";

export default function GeneralStudentsPage() {
  const { isDark } = useDarkMode();
  const { showToast } = useToast();
  const { data: allStudents, isLoading, isError, error, refetch } = useGetStudentsQuery();
  const { data: subprograms = [] } = useGetSubprogramsQuery();
  const { data: classes = [] } = useGetClassesQuery();
  const { data: programs = [] } = useGetProgramsQuery();
  const { data: shifts = [] } = useGetShiftsQuery();
  const { data: sessionRequests = [] } = useGetSessionRequestsQuery();
  const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();

  // Modal state for assigning class
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [studentToAssign, setStudentToAssign] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedLevelId, setSelectedLevelId] = useState("");
  const [selectedShiftName, setSelectedShiftName] = useState("");
  const [selectedSessionType, setSelectedSessionType] = useState("");

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
    sex: "",
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
    approval_status: "approved",
    date_of_birth: "",
    place_of_birth: ""
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
    setSelectedLevelId(student.chosen_subprogram?.toString() || "");

    // Find shift details from class if exists
    if (student.class_id) {
      const cls = classes.find(c => c.id == student.class_id);
      setSelectedShiftName(cls?.shift_name || "");
      setSelectedSessionType(cls?.shift_session || "");
    } else {
      setSelectedShiftName("");
      setSelectedSessionType("");
    }

    setIsAssignModalOpen(true);
  };

  // Handle closing assign class modal
  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false);
    setStudentToAssign(null);
    setSelectedClassId("");
    setSelectedLevelId("");
    setSelectedShiftName("");
    setSelectedSessionType("");
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
        id: studentToAssign.student_id,
        class_id: parseInt(selectedClassId),
        chosen_subprogram: parseInt(selectedLevelId)
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
      sex: student.sex || "",
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
      approval_status: student.approval_status || "approved",
      date_of_birth: student.date_of_birth ? new Date(student.date_of_birth).toISOString().split('T')[0] : "",
      place_of_birth: student.place_of_birth || "",
      funding_status: student.funding_status || "Paid",
      sponsorship_package: student.sponsorship_package || "None",
      funding_amount: student.funding_amount || "",
      funding_month: student.funding_month || "",
      scholarship_percentage: student.scholarship_percentage || "",
      sponsor_name: student.sponsor_name || ""
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
      sex: "",
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
      approval_status: "approved",
      date_of_birth: "",
      place_of_birth: "",
      funding_status: "Paid",
      sponsorship_package: "None",
      funding_amount: "",
      funding_month: "",
      scholarship_percentage: "",
      sponsor_name: ""
    });
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!editingStudent) return;

    try {
      await updateStudent({
        id: editingStudent.student_id,
        full_name: editFormData.full_name,
        email: editFormData.email,
        phone: editFormData.phone,
        age: editFormData.age === "" ? null : parseInt(editFormData.age),
        sex: editFormData.sex,
        residency_country: editFormData.residency_country,
        residency_city: editFormData.residency_city,
        parent_name: editFormData.parent_name,
        parent_email: editFormData.parent_email,
        parent_phone: editFormData.parent_phone,
        parent_relation: editFormData.parent_relation,
        parent_res_county: editFormData.parent_res_county,
        parent_res_city: editFormData.parent_res_city,
        chosen_subprogram: editFormData.chosen_subprogram === "" ? null : parseInt(editFormData.chosen_subprogram),
        class_id: editFormData.class_id === "" ? null : parseInt(editFormData.class_id),
        approval_status: editFormData.approval_status,
        date_of_birth: editFormData.date_of_birth || null,
        place_of_birth: editFormData.place_of_birth || null,
        // Adding missing fields for complete update
        funding_status: editFormData.funding_status || "Paid",
        sponsorship_package: editFormData.sponsorship_package || "None",
        funding_amount: editFormData.funding_amount === "" ? null : parseFloat(editFormData.funding_amount),
        funding_month: editFormData.funding_month === "" ? null : parseInt(editFormData.funding_month),
        scholarship_percentage: editFormData.scholarship_percentage === "" ? null : parseInt(editFormData.scholarship_percentage),
        sponsor_name: editFormData.sponsor_name || null
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
        id: studentToToggleStatus.student_id,
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
      key: "student_id",
      label: "Student ID",
      width: "150px",
      render: (val) => (
        <span className="font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">
          {val || "N/A"}
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
      render: (val) => val || <span className="text-gray-400">-</span>,
    },
    {
      key: "age",
      label: "Age",
      width: "80px",
      render: (val) => val || <span className="text-gray-400">-</span>,
    },

    {
      key: "date_of_birth",
      label: "Date Of Birth",
      width: "120px",
      render: (val) => val ? new Date(val).toLocaleDateString() : <span className="text-gray-400">-</span>,
    },
    {
      key: "place_of_birth",
      label: "Place Of Birth",
      width: "120px",
      render: (val) => val || <span className="text-gray-400">-</span>,
    },
    {
      key: "address",
      label: "Address",
      width: "150px",
      render: (_, row) => {
        const city = row.residency_city;
        const country = row.residency_country;
        if (city && country) return <span className="text-gray-600 font-sans text-xs">{`${city}, ${country}`}</span>;
        return <span className="text-gray-600 font-sans text-xs">{city || country || '-'}</span>;
      }
    },

    {
      key: "chosen_program",
      label: "Program",
      width: "180px",
      render: (val) => (
        <span className="block truncate max-w-[160px]" title={val}>
          {val || <span className="text-gray-400">-</span>}
        </span>
      ),
    },
    {
      key: "chosen_subprogram",
      label: "Subprogram",
      width: "180px",
      render: (val, row) => {
        let subId = val;
        if (!subId && row.class_id) {
          const cls = classes.find(c => c.id == row.class_id);
          if (cls) subId = cls.subprogram_id;
        }
        const subName = getSubprogramName(subId);
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
      key: "class_id",
      label: "Class",
      width: "150px",
      render: (val, row) => {
        const className = getClassName(val);
        if (!className) {
          return (
            <button
              onClick={() => handleOpenAssignModal(row)}
              className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200 transition-colors"
            >
              Assign Class
            </button>
          );
        }
        return (
          <span className="block truncate max-w-[130px] font-medium text-blue-600 dark:text-blue-400">
            {className}
          </span>
        );
      },
    },
    {
      key: "created_at",
      label: "Registration Date",
      render: (val) => {
        if (!val) return <span className="text-gray-400">-</span>;
        const date = new Date(val);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      },
    },
    {
      key: "approval_status",
      label: "Status",
      render: (val, row) => {
        const isActive = val === 'approved';
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
      render: (_, row) => (
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => handleOpenAssignModal(row)}
            className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300 transition-colors p-1 rounded hover:bg-orange-50 dark:hover:bg-orange-900/20"
            title="Assign Class"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
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
        <main className="flex-1 min-w-0 flex flex-col items-center bg-gray-50 transition-colors">
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
        <main className="flex-1 min-w-0 flex flex-col items-center bg-gray-50 transition-colors">
          <div className="flex-1 w-full max-w-full px-4 sm:px-8 py-6 flex items-center justify-center">
            <div className="text-center">
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
      <main className="flex-1 min-w-0 flex flex-col items-center bg-gray-50 transition-colors">
        <div className="w-full max-w-full px-4 sm:px-8 py-6 min-w-0 flex flex-col">
          <DataTable
            title="General Program Students"
            columns={columns}
            data={generalStudents}
            showAddButton={false}
          />
        </div>
      </main>

      {isAssignModalOpen && studentToAssign && (() => {
        // Get subprograms for student's program
        const studentProgram = programs.find(p => p.title === studentToAssign.chosen_program);
        // 1. Available Levels (Subprograms) for the student's program
        const availableLevels = studentProgram
          ? subprograms.filter(sp => sp.program_id === studentProgram.id)
          : [];

        // 2. Shifts available for the selected Level
        // We find which shifts actually have classes for the selected level and program
        const classesForProgram = classes.filter(cls => cls.program_name === studentToAssign.chosen_program);

        const shiftsForLevel = selectedLevelId
          ? classesForProgram.filter(cls => cls.subprogram_id == selectedLevelId)
          : [];

        const uniqueShiftNames = [...new Set(shiftsForLevel.map(cls => cls.shift_name))].filter(Boolean);

        // 3. Sessions available for the selected Level and Shift Name
        const sessionsForShift = selectedShiftName
          ? shiftsForLevel.filter(cls => cls.shift_name === selectedShiftName)
          : [];

        const availableSessions = [...new Set(sessionsForShift.map(cls => cls.shift_session))].filter(Boolean);

        // 4. Final Class list filtered by all criteria
        const filteredClasses = selectedSessionType
          ? sessionsForShift.filter(cls => cls.shift_session === selectedSessionType)
          : [];

        return (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              aria-hidden="true"
              onClick={handleCloseAssignModal}
            />
            <div className={`relative w-full max-w-lg rounded-xl shadow-2xl overflow-y-auto border-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`} style={{ maxHeight: '90vh' }}>
              <div className={`sticky top-0 z-10 px-6 py-4 border-b flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex flex-col">
                  <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Assign to Class
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{studentToAssign.student_id}</p>
                </div>
                <button
                  onClick={handleCloseAssignModal}
                  className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 text-left">
                {/* Student Information Section */}
                <div className={`p-4 rounded-xl mb-6 border-2 ${isDark ? 'bg-blue-900/10 border-blue-800' : 'bg-blue-50/50 border-blue-100'}`}>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                    <div>
                      <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Full Name</p>
                      <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{studentToAssign.full_name}</p>
                    </div>
                    <div>
                      <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Program</p>
                      <p className={`text-sm font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{studentToAssign.chosen_program}</p>
                    </div>
                    <div>
                      <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Current Class</p>
                      <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {getClassName(studentToAssign.class_id) || 'Not Assigned'}
                      </p>
                    </div>
                    <div>
                      <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Subprogram</p>
                      <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {subprograms.find(sp => sp.id == studentToAssign.chosen_subprogram)?.subprogram_name || 'None'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Session Change Request Alert */}
                {(() => {
                  const pendingRequest = sessionRequests.find(
                    r => r.student_id === studentToAssign.student_id && r.status === 'pending'
                  );
                  if (pendingRequest) {
                    return (
                      <div className={`p-3 rounded-lg mb-6 border-l-4 ${isDark ? 'bg-yellow-900/20 border-yellow-600' : 'bg-yellow-50 border-yellow-400'}`}>
                        <div className="flex items-start gap-2">
                          <div className={`p-1 rounded-full ${isDark ? 'bg-yellow-900/40 text-yellow-500' : 'bg-yellow-100 text-yellow-600'}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-xs font-bold mb-1 ${isDark ? 'text-yellow-500' : 'text-yellow-800'}`}>Pending Session Change</h4>
                            <div className="flex items-center gap-2 text-xs">
                              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Wants:</span>
                              <span className={`font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>{pendingRequest.requested_session_type}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Level Selection (FIRST) */}
                <div className="mb-4">
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Select Class Type (Level)
                  </label>
                  <select
                    value={selectedLevelId}
                    onChange={(e) => {
                      setSelectedLevelId(e.target.value);
                      setSelectedShiftName("");
                      setSelectedSessionType("");
                      setSelectedClassId("");
                    }}
                    className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`}
                  >
                    <option value="">Select Level</option>
                    {availableLevels.map((lvl) => (
                      <option key={lvl.id} value={lvl.id}>
                        {lvl.subprogram_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Shift & Session Selection - Parallel (SECOND) */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Select Shift
                    </label>
                    <select
                      value={selectedShiftName}
                      disabled={!selectedLevelId}
                      onChange={(e) => {
                        setSelectedShiftName(e.target.value);
                        setSelectedSessionType("");
                        setSelectedClassId("");
                      }}
                      className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'} disabled:opacity-50`}
                    >
                      <option value="">Select Shift</option>
                      {uniqueShiftNames.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Session
                    </label>
                    <select
                      value={selectedSessionType}
                      disabled={!selectedShiftName}
                      onChange={(e) => {
                        setSelectedSessionType(e.target.value);
                        setSelectedClassId("");
                      }}
                      className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'} disabled:opacity-50`}
                    >
                      <option value="">Select Session</option>
                      {availableSessions.map((session) => (
                        <option key={session} value={session}>
                          {session}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Class Selection (THIRD) */}
                <div className="mb-8">
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Select Class
                  </label>
                  <select
                    value={selectedClassId}
                    disabled={!selectedSessionType}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'} disabled:opacity-50`}
                  >
                    <option value="">Select a class</option>
                    {filteredClasses.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.class_name}
                      </option>
                    ))}
                  </select>
                  {filteredClasses.length === 0 && selectedLevelId && selectedShiftName && selectedSessionType && (
                    <p className="text-xs text-red-500 mt-2 font-medium italic">
                      No matching classes found
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCloseAssignModal}
                    className={`flex-1 px-4 py-3 rounded-xl border font-bold text-sm transition-all ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignClass}
                    disabled={isUpdating || !selectedClassId || !selectedLevelId}
                    className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
            onClick={handleCloseViewModal}
          />
          <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl border-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
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
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Student ID</p>
                    <p className={`font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{viewingStudent.student_id || 'N/A'}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Full Name</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{viewingStudent.full_name}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Age</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{viewingStudent.age || 'N/A'}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Sex</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{viewingStudent.sex || 'N/A'}</p>
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
        const program = programs.find(p => p.title === editFormData.chosen_program);
        const studentSubprograms = program ? subprograms.filter(sp => sp.program_id === program.id) : [];
        const showParentInfo = parseInt(editFormData.age) < 18;

        return (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              aria-hidden="true"
              onClick={handleCloseEditModal}
            />
            <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl border-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
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
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Date of Birth</label>
                      <input
                        type="date"
                        name="date_of_birth"
                        value={editFormData.date_of_birth}
                        onChange={handleEditInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Place of Birth</label>
                      <input
                        type="text"
                        name="place_of_birth"
                        value={editFormData.place_of_birth}
                        onChange={handleEditInputChange}
                        placeholder="City, Country"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Sex</label>
                      <select
                        name="sex"
                        value={editFormData.sex}
                        onChange={handleEditInputChange}
                        className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      >
                        <option value="">Select Sex</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
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
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsStatusModalOpen(false)}
            />
            <div className={`relative w-full max-w-sm rounded-xl shadow-2xl p-6 border-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
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
