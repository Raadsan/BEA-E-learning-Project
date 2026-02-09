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
} from "@/redux/api/ieltsToeflApi";
import { useGetClassesQuery } from "@/redux/api/classApi";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useGetSubprogramsQuery } from "@/redux/api/subprogramApi";
import { useGetSessionRequestsQuery } from "@/redux/api/sessionRequestApi";
import { useToast } from "@/components/Toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import Modal from "@/components/Modal";
import StudentApprovalModal from "../components/StudentApprovalModal";
import StudentViewModal from "../components/StudentViewModal";
import StudentForm from "../components/StudentForm";

const LiveAdminTimer = ({ expiryDate, label, colorClass, onClick, isExtended }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!expiryDate) return;
    const calculate = () => {
      const diff = Math.max(0, Math.floor((new Date(expiryDate) - new Date()) / 1000));
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
  const [updateStudent] = useUpdateIeltsToeflStudentMutation();
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

  // View/Edit state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [editFormData, setEditFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    sex: "",
    date_of_birth: "",
    place_of_birth: "",
    exam_type: "",
    residency_country: "",
    residency_city: "",
  });

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
    if (!extraTime || isNaN(extraTime)) {
      showToast("Please enter a valid number", 'error');
      return;
    }

    const durationMinutes = timeUnit === "hours" ? extraTime * 60 : parseInt(extraTime);

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
      email: student.email || "",
      phone: student.phone || "",
      sex: student.sex || "",
      date_of_birth: student.date_of_birth ? new Date(student.date_of_birth).toISOString().split('T')[0] : "",
      place_of_birth: student.place_of_birth || "",
      exam_type: student.exam_type || "",
      residency_country: student.residency_country || "",
      residency_city: student.residency_city || "",
    });
    setIsEditModalOpen(true);
  };

  const handleViewClick = (student) => {
    setSelectedCandidate(student);
    setIsViewModalOpen(true);
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
        if (!bulkExtraTime || isNaN(bulkExtraTime)) {
          showToast("Please enter a valid number for extra time", "error");
          return;
        }

        const durationMinutes = bulkTimeUnit === "hours" ? bulkExtraTime * 60 : parseInt(bulkExtraTime);

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
      key: "verification_method",
      label: "Verification",
      width: "150px",
      render: (val) => (
        <span className="text-sm text-black dark:text-white truncate block font-medium" title={val}>
          {val === "Proficiency Exam" ? "Proficiency..." : (val?.length > 15 ? `${val.substring(0, 15)}...` : val)}
        </span>
      ),
    },
    {
      key: "time_status",
      label: "Life Status",
      width: "150px",
      render: (_, row) => {
        const isExpired = row.is_expired;
        const isExtended = row.is_extended;
        const status = row.status?.toLowerCase();
        let label = "Active";
        let colorClass = "bg-green-100 text-green-700 border-green-200";
        if (status === 'approved') {
          label = "Intered Exam";
          colorClass = "bg-blue-100 text-blue-700 border-blue-200";
        } else if (isExpired) {
          label = "Time End";
          colorClass = "bg-red-100 text-red-700 border-red-200";
        } else if (isExtended) {
          label = "Pending Time";
          colorClass = "bg-amber-100 text-amber-700 border-amber-200";
        }
        return (
          <LiveAdminTimer
            expiryDate={row.expiry_date}
            label={label}
            colorClass={colorClass}
            isExtended={isExtended}
            onClick={() => {
              setSelectedForExt(row);
              setIsExtending(true);
            }}
          />
        );
      }
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
        <div className="flex gap-3 items-center justify-center">
          <button className="text-blue-600 hover:text-blue-900 transition-colors" title="View Details" onClick={() => handleViewClick(row)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          </button>
          <button className="text-gray-600 hover:text-gray-900 transition-colors" title="Edit" onClick={() => handleEditClick(row)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
          <button onClick={() => handleDeleteClick(row)} className="text-red-500 hover:text-red-700 transition-colors" title="Delete">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      ),
    },
  ];

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
              selectable={true}
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
                    {/* Life Status Filter */}
                    <div className="relative group min-w-[180px]">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#010080] transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                      <select value={lifeStatusFilter} onChange={(e) => setLifeStatusFilter(e.target.value)} className="w-full pl-10 pr-10 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 font-bold text-[13px] focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none appearance-none transition-all shadow-sm hover:border-gray-300 cursor-pointer">
                        <option value="all">All Life Status</option><option value="active">Active</option><option value="time_end">Time End</option><option value="pending_time">Pending Time</option><option value="entered_exam">Entered Exam</option>
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                    </div>
                  </div>
                </div>
              )}
              customActions={(
                <button onClick={() => setIsBulkActionsModalOpen(true)} disabled={selectedStudentIds.length === 0} className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all active:scale-95 shadow-lg ${selectedStudentIds.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none opacity-50' : 'bg-[#010080] text-white hover:bg-[#010080]/90 shadow-[#010080]/20'}`} title={selectedStudentIds.length === 0 ? "Select students to perform actions" : "Perform bulk actions"}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  <span className="font-semibold">Actions</span>
                </button>
              )}
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
          classes={classes.filter(c => c.program_name?.toLowerCase().includes('ielts') || c.program_name?.toLowerCase().includes('toefl'))}
          selectedClassId={selectedClassId}
          setSelectedClassId={setSelectedClassId}
        />

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

        <StudentViewModal isOpen={isViewModalOpen} onClose={() => { setIsViewModalOpen(false); setSelectedCandidate(null); }} candidate={selectedCandidate ? { ...selectedCandidate, full_name: `${selectedCandidate.first_name} ${selectedCandidate.last_name}` } : null} isDark={isDark} />

        <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setSelectedCandidate(null); }} title="Edit Student Info">
          {selectedCandidate && <StudentForm formData={editFormData} setFormData={setEditFormData} onSubmit={handleEditSubmit} onClose={() => setIsEditModalOpen(false)} isDark={isDark} isEdit={true} isIeltsToefl={true} />}
        </Modal>
      </main>

      {isBulkActionsModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => { setIsBulkActionsModalOpen(false); setBulkActions({ changeStatus: false, assignClass: false }); setBulkStep(1); }} />
          <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className={`px-6 py-4 flex items-center justify-between border-b ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50/50'}`}>
              <h3 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <div className="w-8 h-8 rounded-lg bg-[#010080] flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                Bulk Student Actions
              </h3>
              <button onClick={() => { setIsBulkActionsModalOpen(false); setBulkActions({ changeStatus: false, assignClass: false }); setBulkStep(1); }} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg></button>
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
                      <div>
                        <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Level</label>
                        <select value={bulkLevelId} onChange={(e) => setBulkLevelId(e.target.value)} className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-[#010080] outline-none ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                          <option value="">All Levels</option>
                          {subprograms.filter(sp => sp.program_name?.toLowerCase().includes('ielts') || sp.program_name?.toLowerCase().includes('toefl')).map(level => (
                            <option key={level.id} value={level.id}>{level.subprogram_name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Final Class</label>
                        <select value={bulkClassId} onChange={(e) => setBulkClassId(e.target.value)} className={`w-full px-3 py-2.5 text-sm border rounded-lg border-[#010080] focus:ring-2 focus:ring-[#010080] outline-none font-semibold ${isDark ? 'bg-gray-800 text-white' : 'bg-blue-50 text-[#010080]'}`}>
                          <option value="">Select target class...</option>
                          {classes.filter(c => (!bulkLevelId || c.subprogram_id === parseInt(bulkLevelId)) && (c.program_name?.toLowerCase().includes('ielts') || c.program_name?.toLowerCase().includes('toefl'))).map(cls => (
                            <option key={cls.id} value={cls.id}>{cls.class_name} ({cls.shift_name})</option>
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
