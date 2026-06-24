"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/DataTable";
import { useDarkMode } from "@/context/ThemeContext";
import {
  useGetIeltsToeflStudentsQuery,
  useApproveIeltsToeflStudentMutation,
  useRejectIeltsToeflStudentMutation,
  useUpdateIeltsToeflStudentMutation,
  useDeleteIeltsToeflStudentMutation,
  useExtendIeltsDeadlineMutation,
  useAssignIeltsClassMutation
} from "@/lib/api/ieltsToeflApi";
import { useGetClassesQuery } from "@/lib/api/classApi";
import { useGetProgramsQuery } from "@/lib/api/programApi";
import { useGetSubprogramsQuery } from "@/lib/api/subprogramApi";
import { useGetSessionRequestsQuery } from "@/lib/api/sessionRequestApi";
import { useToast } from "@/components/Toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import Modal from "@/components/Modal";
import StudentApprovalModal from "@/components/admin/students/StudentApprovalModal";
import StudentViewModal from "@/components/admin/students/StudentViewModal";
import StudentForm from "@/components/admin/students/StudentForm";
import { Country, City } from "country-state-city";
import { API_URL } from "@/constants";
import { usePagePermissions } from "@/hooks/usePagePermissions";
import AdminTableActions from "@/components/admin/AdminTableActions";

const LiveAdminTimer = ({ expiryDate, label, colorClass, onClick, isExtended }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!expiryDate) return;
    const calculate = () => {
      const diff = Math.max(0, Math.floor((new Date(expiryDate).getTime() - new Date().getTime()) / 1000));
      setTimeLeft(diff);
    };
    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [expiryDate]);

  const format = (s) => {
    if (s === null) return "--:--";
    if (s <= 0) return "00:00";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const showCountdown = label === "Active" || label === "Pending Time";

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 cursor-pointer rounded-full text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 border flex flex-col items-center min-w-[100px] ${colorClass}`}
    >
      <span>{label}</span>
      {showCountdown && timeLeft > 0 && (
        <span className="font-mono text-[9px] opacity-80 mt-0.5">
          {format(timeLeft)} left
        </span>
      )}
    </button>
  );
};

export default function IELTSTOEFLStudentsPage() {
  const { isDark } = useDarkMode();
  const { showToast } = useToast();
  const { canView, canEdit, canDelete, canAssign, showBulkActions } = usePagePermissions("student_management", "ielts_students");
  const { data: ieltsStudents, isLoading, isError, error } = useGetIeltsToeflStudentsQuery();
  const { data: classes = [] } = useGetClassesQuery();
  const { data: programs = [] } = useGetProgramsQuery();
  const { data: subprograms = [] } = useGetSubprogramsQuery();

  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [isBulkActionsModalOpen, setIsBulkActionsModalOpen] = useState(false);
  const [bulkActions, setBulkActions] = useState({
    changeStatus: false,
    assignClass: false,
    manageLifeStatus: false
  });
  const [bulkStep, setBulkStep] = useState(1);
  const [bulkStatusValue, setBulkStatusValue] = useState("");
  const [bulkLevelId, setBulkLevelId] = useState("");
  const [bulkShiftName, setBulkShiftName] = useState("");
  const [bulkSessionType, setBulkSessionType] = useState("");
  const [bulkClassId, setBulkClassId] = useState("");
  const [bulkExtraTime, setBulkExtraTime] = useState("");
  const [bulkTimeUnit, setBulkTimeUnit] = useState("minutes");

  const [approveStudent] = useApproveIeltsToeflStudentMutation();
  const [rejectStudent] = useRejectIeltsToeflStudentMutation();
  const [updateStudent, { isLoading: isUpdatingIelts }] = useUpdateIeltsToeflStudentMutation();
  const [deleteStudent] = useDeleteIeltsToeflStudentMutation();
  const [extendDeadline] = useExtendIeltsDeadlineMutation();
  const [assignClass] = useAssignIeltsClassMutation();

  const [statusFilter, setStatusFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [lifeStatusFilter, setLifeStatusFilter] = useState("all");

  // Approval Modal State
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [studentToApprove, setStudentToApprove] = useState(null);

  // Extension Modal State
  const [isExtending, setIsExtending] = useState(false);
  const [selectedForExt, setSelectedForExt] = useState(null);
  const [extraTime, setExtraTime] = useState("");
  const [timeUnit, setTimeUnit] = useState("minutes");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [studentToDelete, setStudentToDelete] = useState(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [studentToAssign, setStudentToAssign] = useState(null);
  const [assignSubprogramId, setAssignSubprogramId] = useState("");
  const [assignClassId, setAssignClassId] = useState("");

  const getClassName = (classId) => {
    if (!classId) return null;
    return classes.find((c) => c.id == classId)?.class_name || null;
  };

  const programMatchesStudent = (programTitle, student) => {
    if (!programTitle || !student) return false;
    const studentProgram = student.chosen_program || student.exam_type;
    if (!studentProgram) return false;
    if (programTitle === studentProgram) return true;
    const norm = (v) => String(v).toLowerCase().replace(/[^a-z0-9]/g, "");
    if (norm(programTitle) === norm(studentProgram)) return true;
    const ieltsLike = (v) => {
      const n = norm(v);
      return n.includes("ielts") || n.includes("toefl");
    };
    return ieltsLike(programTitle) && ieltsLike(studentProgram);
  };

  const getStudentProgram = (student) => {
    if (!student) return null;
    const programName = student.chosen_program || student.exam_type;
    if (!programName) return null;

    const exact = programs.find(
      (p) => p.title === programName || p.title?.toLowerCase() === programName?.toLowerCase()
    );
    if (exact) return exact;

    const norm = programName.toLowerCase();
    if (norm.includes("ielts") || norm.includes("toefl")) {
      return programs.find((p) => {
        const t = p.title?.toLowerCase() || "";
        return t.includes("ielts") || t.includes("toefl");
      }) || null;
    }
    return null;
  };

  const getSubprogramsForStudentProgram = (student) => {
    const program = getStudentProgram(student);
    if (!program) return [];
    return subprograms.filter((sp) => sp.program_id === program.id);
  };

  const getClassesForStudentProgram = (student) => {
    if (!student) return [];

    const program = getStudentProgram(student);
    if (program) {
      const subprogramIds = subprograms
        .filter((sp) => sp.program_id === program.id)
        .map((sp) => sp.id);
      if (subprogramIds.length > 0) {
        return classes.filter((cls) => subprogramIds.includes(cls.subprogram_id));
      }
    }

    return classes.filter((cls) => programMatchesStudent(cls.program_name, student));
  };

  const getBulkEligibleSubprograms = () => {
    const selected = (ieltsStudents || []).filter((s) => selectedStudentIds.includes(s.student_id));
    const programIds = new Set();
    selected.forEach((student) => {
      const program = getStudentProgram(student);
      if (program) programIds.add(program.id);
    });
    return subprograms.filter((sp) => programIds.has(sp.program_id));
  };

  const getBulkEligibleClasses = () => {
    const selected = (ieltsStudents || []).filter((s) => selectedStudentIds.includes(s.student_id));
    const classMap = new Map();
    selected.forEach((student) => {
      getClassesForStudentProgram(student).forEach((cls) => {
        if (!bulkLevelId || cls.subprogram_id === parseInt(bulkLevelId, 10)) {
          classMap.set(cls.id, cls);
        }
      });
    });
    return [...classMap.values()];
  };

  const handleOpenAssignModal = (student) => {
    setStudentToAssign(student);
    setAssignClassId(student.class_id?.toString() || "");
    const cls = classes.find((c) => c.id == student.class_id);
    setAssignSubprogramId(cls?.subprogram_id?.toString() || "");
    setIsAssignModalOpen(true);
  };

  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false);
    setStudentToAssign(null);
    setAssignClassId("");
    setAssignSubprogramId("");
  };

  const handleAssignClassSubmit = async () => {
    if (!studentToAssign || !assignClassId) {
      showToast("Please select a class", "error");
      return;
    }
    try {
      await assignClass({
        id: studentToAssign.student_id,
        classId: parseInt(assignClassId, 10),
      }).unwrap();
      showToast("Class assigned successfully!", "success");
      handleCloseAssignModal();
    } catch (err) {
      showToast(err?.data?.error || "Failed to assign class", "error");
    }
  };

  // View/Edit state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [viewingPayments, setViewingPayments] = useState([]);
  const [editFormData, setEditFormData] = useState({
    first_name: "",
    last_name: "",
    full_name: "",
    email: "",
    phone: "",
    age: "",
    sex: "Male",
    date_of_birth: "",
    place_of_birth: "",
    exam_type: "",
    chosen_program: "",
    chosen_subprogram: "",
    residency_country: "",
    residency_city: "",
    approval_status: "",
    parent_name: "",
    parent_email: "",
    parent_phone: "",
    parent_relation: "",
    parent_res_county: "",
    parent_res_city: "",
    funding_status: "Paid",
    sponsorship_package: "",
    funding_amount: "",
    funding_month: "",
    scholarship_percentage: "",
    sponsor_name: "",
    verification_method: "Proficiency Exam",
    certificate_institution: "",
    certificate_date: "",
    certificate_document: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const cities = (() => {
    if (!editFormData.residency_country) return [];
    const country = Country.getAllCountries().find(c => c.name === editFormData.residency_country);
    return country ? City.getCitiesOfCountry(country.isoCode) : [];
  })();

  const parentCities = (() => {
    if (!editFormData.parent_res_county) return [];
    const country = Country.getAllCountries().find(c => c.name === editFormData.parent_res_county);
    return country ? City.getCitiesOfCountry(country.isoCode) : [];
  })();

  const showParentInfo = !!(editFormData.age && parseInt(editFormData.age) < 18);

  const filteredStudents = (ieltsStudents || []).filter(student => {
    // Filter by status
    if (statusFilter !== "all" && student.status?.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    // Filter by verification method
    if (verificationFilter !== "all" && student.verification_method !== verificationFilter) {
      return false;
    }
    // Filter by life status
    if (lifeStatusFilter !== "all") {
      const isExpired = student.is_expired;
      const isExtended = student.is_extended;
      const status = student.status?.toLowerCase();

      if (lifeStatusFilter === "active" && (isExpired || isExtended || status === 'approved')) {
        return false;
      }
      if (lifeStatusFilter === "time_end" && !isExpired) {
        return false;
      }
      if (lifeStatusFilter === "pending_time" && !isExtended) {
        return false;
      }
      if (lifeStatusFilter === "entered_exam" && status !== 'approved') {
        return false;
      }
    }
    return true;
  });

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    try {
      await deleteStudent(studentToDelete.student_id).unwrap();
      showToast("Student deleted successfully", 'success');
      setStudentToDelete(null);
    } catch (err) {
      showToast(err.data?.error || "Failed to delete student", 'error');
    }
  };

  const handleExtendSubmit = async () => {
    if (!extraTime || isNaN(Number(extraTime))) {
      showToast("Please enter a valid number", 'error');
      return;
    }

    const durationMinutes = timeUnit === "hours" ? parseInt(extraTime) * 60 : parseInt(extraTime);

    try {
      await extendDeadline({ id: selectedForExt.student_id, durationMinutes }).unwrap();
      showToast("Extra time added successfully!", 'success');
      setIsExtending(false);
      setSelectedForExt(null);
      setExtraTime("");
    } catch (err) {
      showToast(err.data?.error || "Failed to extend deadline", 'error');
    }
  };

  const handleApprove = async (student) => {
    const target = student || studentToApprove;
    if (!target) return;

    try {
      if (selectedClassId) {
        await assignClass({ id: target.student_id, classId: selectedClassId }).unwrap();
        showToast("Student approved and assigned to class!", 'success');
      } else {
        await approveStudent(target.student_id).unwrap();
        showToast("Student approved successfully", 'success');
      }
      setIsApprovalModalOpen(false);
      setStudentToApprove(null);
      setSelectedClassId("");
    } catch (err) {
      showToast(err.data?.error || "Action failed", 'error');
    }
  };

  const handleReject = async (student) => {
    const target = student || studentToApprove;
    if (!target) return;
    try {
      await rejectStudent(target.student_id).unwrap();
      showToast("Student rejected successfully", 'success');
      setIsApprovalModalOpen(false);
      setStudentToApprove(null);
    } catch (err) {
      showToast(err.data?.error || "Failed to reject student", 'error');
    }
  };

  const handleEditSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      const sanitizedData = { ...editFormData };
      await updateStudent({
        id: selectedCandidate.student_id,
        formData: sanitizedData
      }).unwrap();
      showToast("Student info updated successfully", 'success');
      setIsEditModalOpen(false);
    } catch (err) {
      showToast(err.data?.error || "Update failed", 'error');
    }
  };

  const handleEditClick = (student) => {
    setSelectedCandidate(student);
    setEditFormData({
      first_name: student.first_name || "",
      last_name: student.last_name || "",
      full_name: `${student.first_name || ""} ${student.last_name || ""}`.trim(),
      email: student.email || "",
      phone: student.phone || "",
      age: student.age || "",
      sex: student.sex || "Male",
      date_of_birth: student.date_of_birth ? new Date(student.date_of_birth).toISOString().split('T')[0] : "",
      place_of_birth: student.place_of_birth || "",
      exam_type: student.exam_type || "",
      chosen_program: student.chosen_program || student.exam_type || "",
      chosen_subprogram: student.chosen_subprogram || "",
      residency_country: student.residency_country || "",
      residency_city: student.residency_city || "",
      approval_status: student.status || "pending",
      parent_name: student.parent_name || "",
      parent_email: student.parent_email || "",
      parent_phone: student.parent_phone || "",
      parent_relation: student.parent_relation || "",
      parent_res_county: student.parent_res_county || "",
      parent_res_city: student.parent_res_city || "",
      funding_status: student.funding_status || "Paid",
      sponsorship_package: student.sponsorship_package || "",
      funding_amount: student.funding_amount || "",
      funding_month: student.funding_month || "",
      scholarship_percentage: student.scholarship_percentage || "",
      sponsor_name: student.sponsor_name || "",
      verification_method: student.verification_method || "Proficiency Exam",
      certificate_institution: student.certificate_institution || "",
      certificate_date: student.certificate_date || "",
      certificate_document: student.certificate_document || "",
    });
    setIsEditModalOpen(true);
  };

  const handleViewClick = async (student) => {
    setSelectedCandidate(student);
    setIsViewModalOpen(true);
    try {
      const searchId = student.original_id || student.student_id || student.id;
      const res = await fetch(`${API_URL}/payments/student/${searchId}`);
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) setViewingPayments(json.payments || []);
    } catch (err) {
      console.error('Failed to fetch payments', err);
    }
  };

  const handleBulkActions = async () => {
    if (selectedStudentIds.length === 0) return;

    try {
      if (bulkActions.changeStatus) {
        await Promise.all(
          selectedStudentIds.map(id =>
            updateStudent({
              id: id,
              status: bulkStatusValue
            }).unwrap()
          )
        );
        showToast(`Successfully updated status for ${selectedStudentIds.length} students`, "success");
      } else if (bulkActions.assignClass) {
        if (!bulkClassId) {
          showToast("Please select a class to assign", "error");
          return;
        }
        await Promise.all(
          selectedStudentIds.map(id =>
            assignClass({
              id: id,
              classId: bulkClassId
            }).unwrap()
          )
        );
        showToast(`Successfully assigned ${selectedStudentIds.length} students to class`, "success");
      } else if (bulkActions.manageLifeStatus) {
        if (!bulkExtraTime || isNaN(Number(bulkExtraTime))) {
          showToast("Please enter a valid number for extra time", "error");
          return;
        }

        const durationMinutes = bulkTimeUnit === "hours" ? parseInt(bulkExtraTime) * 60 : parseInt(bulkExtraTime);

        await Promise.all(
          selectedStudentIds.map(id =>
            extendDeadline({ id: id, durationMinutes }).unwrap()
          )
        );
        showToast(`Successfully extended deadline for ${selectedStudentIds.length} students`, "success");
      }

      setIsBulkActionsModalOpen(false);
      setSelectedStudentIds([]);
      setBulkActions({ changeStatus: false, assignClass: false, manageLifeStatus: false });
      setBulkStep(1);
      setBulkLevelId("");
      setBulkShiftName("");
      setBulkSessionType("");
      setBulkClassId("");
      setBulkStatusValue("");
      setBulkExtraTime("");
      setBulkTimeUnit("minutes");
    } catch (err) {
      console.error('Bulk action error:', err);
      showToast(err.data?.error || "Bulk action failed", "error");
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
      key: "fullName",
      label: "Full Name",
      width: "150px",
      render: (_, row) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {`${row.first_name || ''} ${row.last_name || ''}`}
        </span>
      ),
    },
    {
      key: "email",
      label: "Email",
      width: "150px",
      render: (val) => (
        <span className="text-gray-700 dark:text-gray-300 truncate block font-sans text-xs" title={val}>
          {val}
        </span>
      ),
    },
    {
      key: "address",
      label: "Address",
      width: "150px",
      render: (_, row) => {
        const city = row.residency_city;
        const country = row.residency_country;
        if (city && country) return <span className="text-gray-700 dark:text-gray-300 text-xs">{`${city}, ${country}`}</span>;
        return <span className="text-gray-700 dark:text-gray-300 text-xs">{city || country || '-'}</span>;
      }
    },
    // {
    //   key: "date_of_birth",
    //   label: "Date Of Birth",
    //   width: "120px",
    //   render: (val) => val ? new Date(val).toLocaleDateString() : <span className="text-gray-400">-</span>,
    // },
    // {
    //   key: "place_of_birth",
    //   label: "Place Of Birth",
    //   width: "120px",
    //   render: (val) => val || <span className="text-gray-400">-</span>,
    // },
    {
      key: "chosen_program",
      label: "Program",
      width: "140px",
      render: (_, row) => (
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate block" title={row.chosen_program || row.exam_type}>
          {row.chosen_program || row.exam_type || "-"}
        </span>
      ),
    },
    {
      key: "class_name",
      label: "Assigned Class",
      width: "130px",
      render: (_, row) => {
        const name = row.class_name || getClassName(row.class_id);
        return name ? (
          <span className="text-xs font-semibold text-[#010080] dark:text-blue-300">{name}</span>
        ) : (
          <span className="text-xs text-gray-400 italic">Not assigned</span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      width: "150px",
      render: (val, row) => {
        const s = (val || 'Pending').toLowerCase();
        const colors = {
          "approved": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
          "pending": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
          "rejected": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
          "paid": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        };
        return (
          <div className="flex flex-col gap-1 items-start">
            {s === 'pending' ? (
              canAssign ? (
              <button
                onClick={() => {
                  setStudentToApprove({ ...row, full_name: `${row.first_name} ${row.last_name}` });
                  setIsApprovalModalOpen(true);
                }}
                className={`px-3 py-1 inline-flex text-[10px] leading-4 font-bold rounded-full uppercase transition-all hover:scale-105 ${colors[s]}`}
              >
                {row.status || 'Pending'}
              </button>
              ) : (
              <span className={`px-3 py-1 inline-flex text-[10px] leading-4 font-bold rounded-full uppercase ${colors[s]}`}>
                {row.status || 'Pending'}
              </span>
              )
            ) : (
              <span className={`px-3 py-1 inline-flex text-[10px] leading-4 font-bold rounded-full uppercase ${colors[s] || "bg-gray-100 text-gray-800"}`}>
                {row.status || 'Pending'}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      width: "150px",
      render: (_, row) => (
        <AdminTableActions
          canView={canView}
          canEdit={canEdit}
          canDelete={canDelete}
          canAssign={canAssign}
          onView={() => handleViewClick(row)}
          onEdit={() => handleEditClick(row)}
          onDelete={() => handleDeleteClick(row)}
          onAssign={() => handleOpenAssignModal(row)}
          assignTitle="Assign Class"
        />
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

  return (
    <>
      <main className="flex-1 min-w-0 flex flex-col items-center bg-gray-50 transition-colors">
        <div className="w-full max-w-full px-4 sm:px-8 py-6 min-w-0 flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <LoadingSpinner />
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-10">
              <div className="text-center text-red-500">Error loading data</div>
            </div>
          ) : (
            <DataTable
              title="IELTS / TOEFL Students"
              columns={columns}
              data={filteredStudents}
              showAddButton={false}
              selectable={showBulkActions}
              selectedItems={selectedStudentIds}
              onSelectionChange={setSelectedStudentIds}
              customHeaderLeft={(
                <div className="flex gap-4 items-center">
                  {selectedStudentIds.length > 0 && (
                    <div className="px-3 py-1.5 bg-[#010080] text-white rounded-lg shadow-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="font-bold text-[13px] whitespace-nowrap">{selectedStudentIds.length} selected</span>
                      <button onClick={() => setSelectedStudentIds([])} className="ml-1 text-white hover:text-gray-200 transition-colors" title="Clear selection">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  )}
                  <div className="flex gap-3 flex-wrap">
                    {/* Status Filter */}
                    <div className="relative group min-w-[180px]">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#010080] transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                      </div>
                      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full pl-10 pr-10 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 font-bold text-[13px] focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none appearance-none transition-all shadow-sm hover:border-gray-300 cursor-pointer">
                        <option value="all">All Status</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="paid">Paid</option><option value="rejected">Rejected</option>
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                    </div>
                    {/* Verification Filter */}
                    <div className="relative group min-w-[200px]">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#010080] transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                      <select value={verificationFilter} onChange={(e) => setVerificationFilter(e.target.value)} className="w-full pl-10 pr-10 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 font-bold text-[13px] focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none appearance-none transition-all shadow-sm hover:border-gray-300 cursor-pointer">
                        <option value="all">All Verification</option><option value="Proficiency Exam">Proficiency Exam</option><option value="IELTS Certificate">IELTS Certificate</option><option value="TOEFL Certificate">TOEFL Certificate</option>
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                    </div>
                    {/*
                    <div className="relative group min-w-[180px]">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#010080] transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                      <select value={lifeStatusFilter} onChange={(e) => setLifeStatusFilter(e.target.value)} className="w-full pl-10 pr-10 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 font-bold text-[13px] focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none appearance-none transition-all shadow-sm hover:border-gray-300 cursor-pointer">
                        <option value="all">All Life Status</option><option value="active">Active</option><option value="time_end">Time End</option><option value="pending_time">Pending Time</option><option value="entered_exam">Entered Exam</option>
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                    </div> */}
                  </div>
                </div>
              )}
              customActions={showBulkActions ? (
                <button onClick={() => setIsBulkActionsModalOpen(true)} disabled={selectedStudentIds.length === 0} className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all active:scale-95 shadow-lg ${selectedStudentIds.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none opacity-50' : 'bg-[#010080] text-white hover:bg-[#010080]/90 shadow-[#010080]/20'}`} title={selectedStudentIds.length === 0 ? "Select students to perform actions" : "Perform bulk actions"}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  <span className="font-semibold">Actions</span>
                </button>
              ) : null}
            />
          )}
        </div>

        <StudentApprovalModal
          isOpen={isApprovalModalOpen}
          onClose={() => { setIsApprovalModalOpen(false); setStudentToApprove(null); setSelectedClassId(""); }}
          student={studentToApprove}
          onApprove={handleApprove}
          onReject={handleReject}
          isApproving={isLoading}
          isRejecting={isLoading}
          isDark={isDark}
          classes={getClassesForStudentProgram(studentToApprove)}
          subprograms={getSubprogramsForStudentProgram(studentToApprove)}
          selectedClassId={selectedClassId}
          setSelectedClassId={setSelectedClassId}
        />

        {isAssignModalOpen && studentToAssign && (() => {
          const programClasses = getClassesForStudentProgram(studentToAssign);
          const programSubprograms = getSubprogramsForStudentProgram(studentToAssign);
          const classesForLevel = assignSubprogramId
            ? programClasses.filter((cls) => String(cls.subprogram_id) === String(assignSubprogramId))
            : programClasses;

          return (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCloseAssignModal} />
              <div className={`relative w-full max-w-lg rounded-xl shadow-2xl border-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div>
                    <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Assign to Class</h3>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {studentToAssign.first_name} {studentToAssign.last_name} · {studentToAssign.chosen_program || studentToAssign.exam_type}
                    </p>
                  </div>
                  <button onClick={handleCloseAssignModal} className={`p-1 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className={`p-3 rounded-lg text-sm ${isDark ? 'bg-blue-900/20 text-blue-200' : 'bg-blue-50 text-blue-800'}`}>
                    Current class: <strong>{studentToAssign.class_name || getClassName(studentToAssign.class_id) || "Not assigned"}</strong>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Only classes under <strong>{studentToAssign.chosen_program || studentToAssign.exam_type}</strong> are listed.
                  </p>
                  {programSubprograms.length > 0 && (
                    <div>
                      <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Subprogram (optional)</label>
                      <select
                        value={assignSubprogramId}
                        onChange={(e) => { setAssignSubprogramId(e.target.value); setAssignClassId(""); }}
                        className={`w-full px-3 py-2.5 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      >
                        <option value="">All subprograms</option>
                        {programSubprograms.map((sp) => (
                          <option key={sp.id} value={sp.id}>{sp.subprogram_name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Class</label>
                    <select
                      value={assignClassId}
                      onChange={(e) => setAssignClassId(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-lg border font-semibold ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-blue-50 border-[#010080] text-[#010080]'}`}
                    >
                      <option value="">Select class...</option>
                      {classesForLevel.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.class_name} {cls.shift_name ? `(${cls.shift_name})` : ""}
                        </option>
                      ))}
                    </select>
                    {classesForLevel.length === 0 && (
                      <p className={`text-xs mt-2 ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>No classes found for this program.</p>
                    )}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={handleCloseAssignModal} className={`flex-1 py-2.5 rounded-lg border font-semibold ${isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'}`}>Cancel</button>
                    <button onClick={handleAssignClassSubmit} disabled={!assignClassId} className="flex-1 py-2.5 rounded-lg bg-[#010080] text-white font-semibold disabled:opacity-50">Assign Class</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        <Modal isOpen={isExtending} onClose={() => { setIsExtending(false); setSelectedForExt(null); setExtraTime(""); }} title="Manage Life Status">
          {selectedForExt && (
            <div className="space-y-6">
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-100"><p className="text-sm text-amber-800 leading-relaxed">Student <span className="font-bold">{selectedForExt.first_name} {selectedForExt.last_name}</span>'s time to enter the exam has {selectedForExt.is_expired ? 'expired' : 'started'}. {selectedForExt.is_expired && " You can grant them extra time to reactivate their access."}</p></div>
              <div className="space-y-4 shadow-sm p-4 bg-white rounded-lg">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Add Extra Time</label>
                <div className="flex gap-2">
                  <input type="number" value={extraTime} onChange={(e) => setExtraTime(e.target.value)} placeholder="Amount..." className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#010080]" />
                  <select value={timeUnit} onChange={(e) => setTimeUnit(e.target.value)} className="px-4 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#010080]">
                    <option value="minutes">Minutes</option><option value="hours">Hours</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4"><button onClick={() => setIsExtending(false)} className="px-6 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 font-medium">Cancel</button><button onClick={handleExtendSubmit} className="px-8 py-2.5 bg-[#010080] text-white rounded-lg font-bold shadow-md">Confirm</button></div>
            </div>
          )}
        </Modal>

        <Modal isOpen={!!studentToDelete} onClose={() => setStudentToDelete(null)} title="Delete Student">
          {studentToDelete && (
            <div className="space-y-6">
              <div className="p-4 bg-red-50 rounded-lg border border-red-100"><p className="text-sm text-red-800 leading-relaxed">Are you sure you want to delete <span className="font-bold">{studentToDelete.first_name} {studentToDelete.last_name}</span>? This action cannot be undone.</p></div>
              <div className="flex justify-end gap-3 pt-4"><button onClick={() => setStudentToDelete(null)} className="px-6 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 font-medium">Cancel</button><button onClick={handleConfirmDelete} className="px-8 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700">Yes, Delete</button></div>
            </div>
          )}
        </Modal>

        <StudentViewModal
          isOpen={isViewModalOpen}
          onClose={() => { setIsViewModalOpen(false); setSelectedCandidate(null); setViewingPayments([]); }}
          viewingStudent={selectedCandidate ? { ...selectedCandidate, full_name: `${selectedCandidate.first_name} ${selectedCandidate.last_name}` } : null}
          viewingPayments={viewingPayments}
          isDark={isDark}
        />

        <StudentForm
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setSelectedCandidate(null); }}
          editingStudent={selectedCandidate}
          formData={editFormData}
          handleInputChange={handleInputChange}
          setFormData={setEditFormData}
          handleSubmit={handleEditSubmit}
          isDark={isDark}
          programs={programs}
          cities={cities}
          showParentInfo={showParentInfo}
          parentCities={parentCities}
          viewingPayments={undefined}
          isUpdatingIelts={isUpdatingIelts}
          isCreating={false}
          isUpdating={false}
          isCreatingIelts={false}
        />
      </main>

      {isBulkActionsModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => { setIsBulkActionsModalOpen(false); setBulkActions({ changeStatus: false, assignClass: false, manageLifeStatus: false }); setBulkStep(1); }} />
          <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className={`px-6 py-4 flex items-center justify-between border-b ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50/50'}`}>
              <h3 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <div className="w-8 h-8 rounded-lg bg-[#010080] flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                Bulk Student Actions
              </h3>
              <button onClick={() => { setIsBulkActionsModalOpen(false); setBulkActions({ changeStatus: false, assignClass: false, manageLifeStatus: false }); setBulkStep(1); }} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>

            <div className={`p-6 overflow-y-auto ${bulkStep === 2 && (bulkActions.assignClass || bulkActions.manageLifeStatus) ? 'max-h-[70vh]' : 'max-h-[85vh]'}`}>
              {bulkStep === 1 && (
                <>
                  <div className={`p-4 rounded-lg mb-6 text-sm border ${isDark ? 'bg-gray-700/30 border-gray-600 text-gray-300' : 'bg-blue-50/50 border-blue-100 text-blue-800'}`}>
                    <p className="font-semibold">{selectedStudentIds.length} students selected</p>
                  </div>
                  <div className="space-y-4 mb-6">
                    {/* Change Status Option */}
                    <div className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${bulkActions.changeStatus ? (isDark ? 'border-[#010080] bg-[#010080]/10' : 'border-[#010080] bg-[#010080]/5') : (isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300')}`}
                      onClick={() => setBulkActions({ changeStatus: true, assignClass: false, manageLifeStatus: false })}
                    >
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={bulkActions.changeStatus}
                          readOnly
                          className="mt-1 w-5 h-5 text-[#010080] border-gray-300 rounded focus:ring-[#010080]"
                        />
                        <div className="flex-1">
                          <div className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Change Status</div>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Update the administrative status for all selected students</p>
                        </div>
                      </label>
                    </div>

                    {/* Assign to Class Option */}
                    <div className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${bulkActions.assignClass ? (isDark ? 'border-[#010080] bg-[#010080]/10' : 'border-[#010080] bg-[#010080]/5') : (isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300')}`}
                      onClick={() => setBulkActions({ changeStatus: false, assignClass: true, manageLifeStatus: false })}
                    >
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={bulkActions.assignClass}
                          readOnly
                          className="mt-1 w-5 h-5 text-[#010080] border-gray-300 rounded focus:ring-[#010080]"
                        />
                        <div className="flex-1">
                          <div className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Assign to Class</div>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Move students to a specific Level and Class</p>
                        </div>
                      </label>
                    </div>

                    {/* Manage Life Status Option */}
                    <div className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${bulkActions.manageLifeStatus ? (isDark ? 'border-[#010080] bg-[#010080]/10' : 'border-[#010080] bg-[#010080]/5') : (isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300')}`}
                      onClick={() => setBulkActions({ changeStatus: false, assignClass: false, manageLifeStatus: true })}
                    >
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={bulkActions.manageLifeStatus}
                          readOnly
                          className="mt-1 w-5 h-5 text-[#010080] border-gray-300 rounded focus:ring-[#010080]"
                        />
                        <div className="flex-1">
                          <div className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Manage Life Status</div>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Extend examination deadlines for all selected students</p>
                        </div>
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        setIsBulkActionsModalOpen(false);
                        setBulkStep(1);
                        setBulkActions({ changeStatus: false, assignClass: false, manageLifeStatus: false });
                      }}
                      className={`flex-1 px-4 py-2.5 rounded-lg border font-semibold transition-all active:scale-95 ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setBulkStep(2)}
                      disabled={!bulkActions.changeStatus && !bulkActions.assignClass && !bulkActions.manageLifeStatus}
                      className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all active:scale-95 shadow-lg ${!bulkActions.changeStatus && !bulkActions.assignClass && !bulkActions.manageLifeStatus
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                        : 'bg-[#010080] text-white hover:bg-[#010080]/90 shadow-[#010080]/20'
                        }`}
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {bulkStep === 2 && (
                <div className="space-y-6">
                  <header>
                    <button
                      onClick={() => setBulkStep(1)}
                      className={`flex items-center gap-1 text-sm font-medium mb-2 ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-[#010080] hover:text-[#010080]/80'}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to selection
                    </button>
                    <h4 className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {bulkActions.changeStatus ? 'Set New Status' : bulkActions.manageLifeStatus ? 'Extend Deadlines' : 'Select Target Class'}
                    </h4>
                  </header>

                  {bulkActions.changeStatus && (
                    <div className={`p-4 rounded-xl border-2 ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-100'}`}>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Select Status</label>
                      <select value={bulkStatusValue} onChange={(e) => setBulkStatusValue(e.target.value)} className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-[#010080] outline-none transition-all ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                        <option value="">Choose status...</option><option value="approved">Approved</option><option value="pending">Pending</option><option value="paid">Paid</option><option value="rejected">Rejected</option>
                      </select>
                    </div>
                  )}

                  {bulkActions.manageLifeStatus && (
                    <div className={`p-4 rounded-xl border-2 space-y-4 ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-100'}`}>
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-xs text-amber-800 font-medium">
                        This will grant additional time to all {selectedStudentIds.length} selected students to access the examination portal.
                      </div>
                      <div className="space-y-4">
                        <label className={`block text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Add Extra Time</label>
                        <div className="flex gap-2">
                          <input type="number" value={bulkExtraTime} onChange={(e) => setBulkExtraTime(e.target.value)} placeholder="Amount..." className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#010080] outline-none ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
                          <select value={bulkTimeUnit} onChange={(e) => setBulkTimeUnit(e.target.value)} className={`px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#010080] ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                            <option value="minutes">Minutes</option><option value="hours">Hours</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {bulkActions.assignClass && (
                    <div className={`p-4 rounded-xl border-2 space-y-4 ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-100'}`}>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Only classes for each student&apos;s enrolled IELTS/TOEFL program are shown.
                      </p>
                      <div>
                        <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Level (Subprogram)</label>
                        <select value={bulkLevelId} onChange={(e) => { setBulkLevelId(e.target.value); setBulkClassId(""); }} className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-[#010080] outline-none ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                          <option value="">All Levels</option>
                          {getBulkEligibleSubprograms().map((level) => (
                            <option key={level.id} value={level.id}>{level.subprogram_name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Class</label>
                        <select value={bulkClassId} onChange={(e) => setBulkClassId(e.target.value)} className={`w-full px-3 py-2.5 text-sm border rounded-lg border-[#010080] focus:ring-2 focus:ring-[#010080] outline-none font-semibold ${isDark ? 'bg-gray-800 text-white' : 'bg-blue-50 text-[#010080]'}`}>
                          <option value="">Select target class...</option>
                          {getBulkEligibleClasses().map((cls) => (
                            <option key={cls.id} value={cls.id}>{cls.class_name} ({cls.shift_name || "No shift"})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        setIsBulkActionsModalOpen(false);
                        setBulkStep(1);
                        setBulkActions({ changeStatus: false, assignClass: false, manageLifeStatus: false });
                      }}
                      className={`flex-1 px-4 py-2.5 rounded-lg border font-semibold transition-all active:scale-95 ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                      Cancel
                    </button>
                    <button onClick={handleBulkActions} disabled={(bulkActions.changeStatus && !bulkStatusValue) || (bulkActions.assignClass && !bulkClassId) || (bulkActions.manageLifeStatus && !bulkExtraTime)} className="flex-1 py-3 rounded-xl bg-[#010080] text-white font-bold disabled:bg-gray-300 shadow-lg shadow-[#010080]/20 transition-all active:scale-95">Apply to {selectedStudentIds.length} Students</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
