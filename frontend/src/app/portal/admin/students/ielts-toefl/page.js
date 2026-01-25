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
import { useGetSessionRequestsQuery } from "@/redux/api/sessionRequestApi";
import { toast } from "react-hot-toast";
import Modal from "@/components/Modal";
import StudentApprovalModal from "../components/StudentApprovalModal";

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
  const { data: ieltsStudents, isLoading, isError, error } = useGetIeltsToeflStudentsQuery();
  const { data: classes = [] } = useGetClassesQuery();

  const [approveStudent] = useApproveIeltsToeflStudentMutation();
  const [rejectStudent] = useRejectIeltsToeflStudentMutation();
  const [updateStudent] = useUpdateIeltsToeflStudentMutation();
  const [deleteStudent] = useDeleteIeltsToeflStudentMutation();
  const [extendDeadline] = useExtendIeltsDeadlineMutation();
  const [assignClass] = useAssignIeltsClassMutation();

  const [statusFilter, setStatusFilter] = useState("all");

  // Approval Modal State
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [studentToApprove, setStudentToApprove] = useState(null);

  // Extension Modal State
  const [isExtending, setIsExtending] = useState(false);
  const [selectedForExt, setSelectedForExt] = useState(null);
  const [extraTime, setExtraTime] = useState("");
  const [timeUnit, setTimeUnit] = useState("minutes");
  const [selectedClassId, setSelectedClassId] = useState("");

  const filteredStudents = (ieltsStudents || []).filter(student => {
    if (statusFilter === "all") return true;
    return student.status?.toLowerCase() === statusFilter.toLowerCase();
  });

  const handleExtendSubmit = async () => {
    if (!extraTime || isNaN(extraTime)) {
      toast.error("Please enter a valid number");
      return;
    }

    const durationMinutes = timeUnit === "hours" ? extraTime * 60 : parseInt(extraTime);

    try {
      await extendDeadline({ id: selectedForExt.student_id, durationMinutes }).unwrap();
      toast.success("Extra time added successfully!");
      setIsExtending(false);
      setSelectedForExt(null);
      setExtraTime("");
    } catch (err) {
      toast.error(err.data?.error || "Failed to extend deadline");
    }
  };

  const handleApprove = async (student) => {
    const target = student || studentToApprove;
    if (!target) return;

    try {
      if (selectedClassId) {
        // If a class is selected, use the integrated assignment endpoint
        await assignClass({ id: target.student_id, classId: selectedClassId }).unwrap();
        toast.success("Student approved and assigned to class!");
      } else {
        // Standard approval
        await approveStudent(target.student_id).unwrap();
        toast.success("Student approved successfully");
      }
      setIsApprovalModalOpen(false);
      setStudentToApprove(null);
      setSelectedClassId(""); // Reset selection
    } catch (err) {
      toast.error(err.data?.error || "Action failed");
    }
  };

  const handleReject = async (student) => {
    const target = student || studentToApprove;
    if (!target) return;
    try {
      await rejectStudent(target.student_id).unwrap();
      toast.success("Student rejected successfully");
      setIsApprovalModalOpen(false);
      setStudentToApprove(null);
    } catch (err) {
      toast.error(err.data?.error || "Failed to reject student");
    }
  };

  // Equal width configuration for balanced UI
  const COL_WIDTH = "150px";

  const columns = [
    {
      key: "student_id",
      label: "Student ID",
      width: COL_WIDTH,
      render: (row) => (
        <span className="font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">
          {row.student_id || "N/A"}
        </span>
      ),
    },
    {
      key: "fullName",
      label: "Full Name",
      width: COL_WIDTH,
      render: (row) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {`${row.first_name || ''} ${row.last_name || ''}`}
        </span>
      ),
    },
    {
      key: "email",
      label: "Email",
      width: COL_WIDTH,
      render: (row) => (
        <span className="text-gray-700 dark:text-gray-300 truncate block font-sans text-xs" title={row.email}>
          {row.email}
        </span>
      ),
    },
    {
      key: "examType",
      label: "Exam Type",
      width: COL_WIDTH,
      render: (row) => (
        <span
          className="text-sm text-black dark:text-white truncate block font-medium"
          title={row.exam_type}
        >
          {row.exam_type?.length > 15 ? `${row.exam_type.substring(0, 15)}...` : row.exam_type}
        </span>
      ),
    },
    {
      key: "verification_method",
      label: "Verification",
      width: COL_WIDTH,
      render: (row) => (
        <span
          className="text-sm text-black dark:text-white truncate block font-medium"
          title={row.verification_method}
        >
          {row.verification_method === "Proficiency Exam" ? "Proficiency..." :
            (row.verification_method?.length > 15 ? `${row.verification_method.substring(0, 15)}...` : row.verification_method)}
        </span>
      ),
    },
    {
      key: "time_status",
      label: "Life Status",
      width: COL_WIDTH,
      render: (row) => {
        const isExpired = row.is_expired;
        const isExtended = row.is_extended; // From backend SELECT *
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
      width: COL_WIDTH,
      render: (row) => {
        const s = (row.status || 'Pending').toLowerCase();
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
      width: COL_WIDTH,
      render: (row) => (
        <div className="flex gap-3 items-center justify-center">
          {/* View Details */}
          <button
            className="text-blue-600 hover:text-blue-900 transition-colors"
            title="View Details"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>

          {/* Edit */}
          <button
            className="text-gray-600 hover:text-gray-900 transition-colors"
            title="Edit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          {/* Delete */}
          <button
            onClick={() => handleDelete(row.student_id)}
            className="text-red-500 hover:text-red-700 transition-colors"
            title="Delete"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <main className="flex-1 min-w-0 flex flex-col items-center bg-gray-50 transition-colors">
        <div className="w-full max-w-full px-4 sm:px-8 py-6 min-w-0 flex flex-col">
          {(isLoading) ? (
            <div className="flex items-center justify-center py-10">
              <div className="text-center">Loading...</div>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-10">
              <div className="text-center text-red-500">Error loading data</div>
            </div>
          ) : (
            !filteredStudents || filteredStudents.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400 text-lg">No students found for this status</p>
                </div>
              </div>
            ) : (
              <DataTable
                title="IELTS / TOEFL Students"
                columns={columns}
                data={filteredStudents}
                showAddButton={false}
                customHeaderLeft={
                  <div className="relative group min-w-[200px]">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#010080] transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full pl-10 pr-10 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 font-bold text-[13px] focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none appearance-none transition-all shadow-sm hover:border-gray-300 cursor-pointer"
                    >
                      <option value="all">Everywhere</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="paid">Paid</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                }
              />
            )
          )}
        </div>

        {/* --- Approval Modal --- */}
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

        {/* --- Extension Modal --- */}
        <Modal
          isOpen={isExtending}
          onClose={() => { setIsExtending(false); setSelectedForExt(null); setExtraTime(""); }}
          title="Manage Life Status"
        >
          {selectedForExt && (
            <div className="space-y-6">
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-sm text-amber-800 leading-relaxed">
                  Student <span className="font-bold">{selectedForExt.first_name} {selectedForExt.last_name}</span>'s time to enter the exam has {selectedForExt.is_expired ? 'expired' : 'started'}.
                  {selectedForExt.is_expired && " You can grant them extra time to reactivate their access."}
                </p>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Add Extra Time
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      value={extraTime}
                      onChange={(e) => setExtraTime(e.target.value)}
                      placeholder="Enter amount..."
                      className="w-full pl-4 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-[#010080] outline-none dark:bg-gray-800 dark:border-gray-700"
                    />
                  </div>
                  <select
                    value={timeUnit}
                    onChange={(e) => setTimeUnit(e.target.value)}
                    className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#010080] outline-none dark:bg-gray-800 dark:border-gray-700 bg-white"
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setIsExtending(false)}
                  className="px-6 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExtendSubmit}
                  className="px-8 py-2.5 bg-[#010080] text-white rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all shadow-md"
                >
                  Confirm Extra Time
                </button>
              </div>
            </div>
          )}
        </Modal>
      </main>
    </>
  );
}
