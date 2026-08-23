"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import DataTable from "@/components/DataTable";
import {
  useGetDeletedStudentsQuery,
  useRestoreStudentMutation,
  usePermanentDeleteStudentMutation,
  useEmptyTrashMutation
} from "@/lib/api/studentApi";
import { useDarkMode } from "@/context/ThemeContext";
import { useToast } from "@/components/Toast";
import { usePagePermissions } from "@/hooks/usePagePermissions";

const ConfirmationModal = dynamic(() => import("@/components/ConfirmationModal"), { ssr: false });

export default function DeletedStudentsTrashPage() {
  const { isDark } = useDarkMode();
  const { showToast } = useToast();
  const { canDelete } = usePagePermissions("student_management", "deleted_students");

  // API Hooks
  const { data: deletedStudents = [], isLoading, isFetching, refetch } = useGetDeletedStudentsQuery();
  const [restoreStudent, { isLoading: isRestoring }] = useRestoreStudentMutation();
  const [permanentDeleteStudent, { isLoading: isDeletingPermanent }] = usePermanentDeleteStudentMutation();
  const [emptyTrash, { isLoading: isEmptyingTrash }] = useEmptyTrashMutation();

  // Modal States
  const [studentToRestore, setStudentToRestore] = useState<any>(null);
  const [studentToPermanentDelete, setStudentToPermanentDelete] = useState<any>(null);
  const [isEmptyTrashModalOpen, setIsEmptyTrashModalOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isBulkRestoreModalOpen, setIsBulkRestoreModalOpen] = useState(false);

  // Single Restore Handler
  const handleRestore = async (student: any) => {
    try {
      await restoreStudent(student.id || student.student_id).unwrap();
      showToast(`${student.full_name || "Student"} has been restored successfully!`, "success");
      setStudentToRestore(null);
      refetch();
    } catch (err: any) {
      showToast(err?.data?.error || "Failed to restore student.", "error");
    }
  };

  // Single Permanent Delete Handler
  const handlePermanentDelete = async () => {
    if (!studentToPermanentDelete) return;
    try {
      await permanentDeleteStudent(studentToPermanentDelete.id || studentToPermanentDelete.student_id).unwrap();
      showToast(`${studentToPermanentDelete.full_name || "Student"} permanently deleted from database.`, "success");
      setStudentToPermanentDelete(null);
      refetch();
    } catch (err: any) {
      showToast(err?.data?.error || "Failed to permanently delete student.", "error");
    }
  };

  // Empty Trash Handler
  const handleEmptyTrash = async () => {
    try {
      const res = await emptyTrash().unwrap();
      showToast(res.message || "Trash emptied successfully!", "success");
      setIsEmptyTrashModalOpen(false);
      setSelectedStudents([]);
      refetch();
    } catch (err: any) {
      showToast(err?.data?.error || "Failed to empty trash.", "error");
    }
  };

  // Bulk Restore Handler
  const handleBulkRestore = async () => {
    if (selectedStudents.length === 0) return;
    try {
      for (const id of selectedStudents) {
        await restoreStudent(id).unwrap();
      }
      showToast(`Restored ${selectedStudents.length} student(s) successfully!`, "success");
      setIsBulkRestoreModalOpen(false);
      setSelectedStudents([]);
      refetch();
    } catch (err: any) {
      showToast(err?.data?.error || "Failed to restore selected students.", "error");
    }
  };

  // Bulk Permanent Delete Handler
  const handleBulkPermanentDelete = async () => {
    if (selectedStudents.length === 0) return;
    try {
      for (const id of selectedStudents) {
        await permanentDeleteStudent(id).unwrap();
      }
      showToast(`Permanently deleted ${selectedStudents.length} student(s)!`, "success");
      setIsBulkDeleteModalOpen(false);
      setSelectedStudents([]);
      refetch();
    } catch (err: any) {
      showToast(err?.data?.error || "Failed to delete selected students.", "error");
    }
  };

  const columns = [
    {
      key: "student_id",
      label: "Student ID",
      render: (_val: any, row: any) => (
        <span className="font-mono text-xs font-bold text-gray-700 dark:text-gray-300">
          {row.student_id || "N/A"}
        </span>
      ),
      width: "150px"
    },
    {
      key: "full_name",
      label: "Student",
      render: (val: string, row: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-sm text-gray-900 dark:text-white">
            {val || "Unnamed Student"}
          </span>
          <span className="text-[11px] text-gray-400 font-medium">{row.email}</span>
        </div>
      )
    },
    {
      key: "phone",
      label: "Phone",
      render: (val: string) => <span className="text-xs text-gray-600 dark:text-gray-300">{val || "-"}</span>,
      width: "130px"
    },
    {
      key: "chosen_program",
      label: "Program",
      render: (val: string) => (
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 block truncate max-w-[160px]" title={val}>
          {val || "-"}
        </span>
      ),
      width: "160px"
    },
    {
      key: "status",
      label: "Trash Status",
      render: () => (
        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 flex items-center gap-1.5 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          In Trash (Inactive)
        </span>
      ),
      width: "160px"
    },
    {
      key: "actions",
      label: "Actions",
      width: "200px",
      render: (_: any, row: any) => (
        <div className="flex items-center gap-2">
          {/* Restore / Recover Button */}
          <button
            type="button"
            onClick={() => setStudentToRestore(row)}
            disabled={isRestoring}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-300 dark:hover:bg-green-950/60 border border-green-200 dark:border-green-800 transition-all active:scale-95 shadow-xs"
            title="Restore student to active status"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 015 5v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Restore
          </button>

          {/* Delete Permanently Button */}
          <button
            type="button"
            onClick={() => setStudentToPermanentDelete(row)}
            disabled={isDeletingPermanent || !canDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/60 border border-red-200 dark:border-red-800 transition-all active:scale-95 shadow-xs"
            title="Permanently remove from database"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <main className="flex-1 min-w-0 flex flex-col bg-gray-50 dark:bg-gray-900 px-4 sm:px-8 py-6">
      {/* Top Banner Notice */}
      <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              Deleted Students (Trash Bin)
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Students in Trash are completely inactive and excluded from classes, sessions, attendance, and Star Students. You can restore them anytime or delete them permanently.
            </p>
          </div>
        </div>
        <Link
          href="/portal/admin/students"
          className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#010080] hover:text-[#010080] transition-all flex items-center gap-2 w-fit"
        >
          <span>←</span> Back to All Students
        </Link>
      </div>

      <DataTable
        title={`Trash Bin (${deletedStudents.length})`}
        columns={columns}
        data={deletedStudents}
        isLoading={isLoading || isFetching}
        showAddButton={false}
        emptyMessage="Trash is empty. No deleted students found."
        customActions={
          <div className="flex items-center gap-2">
            {/* Selection Actions */}
            {selectedStudents.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setIsBulkRestoreModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-green-600 hover:bg-green-700 text-white shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 015 5v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  Restore Selected ({selectedStudents.length})
                </button>
                <button
                  type="button"
                  onClick={() => setIsBulkDeleteModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Selected ({selectedStudents.length})
                </button>
              </>
            )}

            {/* Empty Trash Button */}
            {deletedStudents.length > 0 && canDelete && (
              <button
                type="button"
                onClick={() => setIsEmptyTrashModalOpen(true)}
                disabled={isEmptyingTrash}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {isEmptyingTrash ? "Emptying..." : "Empty Trash"}
              </button>
            )}

            {/* Refresh */}
            <button
              type="button"
              onClick={() => refetch()}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-[#010080] transition-all shadow-xs"
              title="Refresh"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18v3" />
              </svg>
            </button>
          </div>
        }
      />

      {/* Confirmation Modal for Restore */}
      {studentToRestore && (
        <ConfirmationModal
          isOpen={!!studentToRestore}
          title="Restore Student"
          message={`Are you sure you want to restore "${studentToRestore.full_name}" (${studentToRestore.student_id}) back to active status? All previous submissions and records will be retained.`}
          confirmText="Yes, Restore Student"
          cancelText="Cancel"
          onConfirm={() => handleRestore(studentToRestore)}
          onClose={() => setStudentToRestore(null)}
          isDanger={false}
          isLoading={isRestoring}
        />
      )}

      {/* Confirmation Modal for Permanent Delete */}
      {studentToPermanentDelete && (
        <ConfirmationModal
          isOpen={!!studentToPermanentDelete}
          title="Permanently Delete Student"
          message={`WARNING: This will PERMANENTLY remove "${studentToPermanentDelete.full_name}" (${studentToPermanentDelete.student_id}) and ALL related records (attendance, submissions, exam results, etc.) from the database. This action CANNOT be undone.`}
          confirmText="Yes, Delete Permanently"
          cancelText="Cancel"
          onConfirm={handlePermanentDelete}
          onClose={() => setStudentToPermanentDelete(null)}
          isDanger={true}
          isLoading={isDeletingPermanent}
        />
      )}

      {/* Confirmation Modal for Empty Trash */}
      {isEmptyTrashModalOpen && (
        <ConfirmationModal
          isOpen={isEmptyTrashModalOpen}
          title="Empty Entire Trash Bin"
          message={`WARNING: You are about to PERMANENTLY delete all ${deletedStudents.length} student(s) in the trash. All their database records will be erased forever. Are you absolutely sure?`}
          confirmText="Yes, Empty Trash Now"
          cancelText="Cancel"
          onConfirm={handleEmptyTrash}
          onClose={() => setIsEmptyTrashModalOpen(false)}
          isDanger={true}
          isLoading={isEmptyingTrash}
        />
      )}

      {/* Bulk Restore Modal */}
      {isBulkRestoreModalOpen && (
        <ConfirmationModal
          isOpen={isBulkRestoreModalOpen}
          title="Restore Selected Students"
          message={`Are you sure you want to restore ${selectedStudents.length} selected student(s) back to active status?`}
          confirmText="Yes, Restore Selected"
          cancelText="Cancel"
          onConfirm={handleBulkRestore}
          onClose={() => setIsBulkRestoreModalOpen(false)}
          isDanger={false}
          isLoading={isRestoring}
        />
      )}

      {/* Bulk Delete Modal */}
      {isBulkDeleteModalOpen && (
        <ConfirmationModal
          isOpen={isBulkDeleteModalOpen}
          title="Permanently Delete Selected"
          message={`WARNING: Are you sure you want to PERMANENTLY delete ${selectedStudents.length} selected student(s)? This action cannot be undone.`}
          confirmText="Yes, Delete Selected"
          cancelText="Cancel"
          onConfirm={handleBulkPermanentDelete}
          onClose={() => setIsBulkDeleteModalOpen(false)}
          isDanger={true}
          isLoading={isDeletingPermanent}
        />
      )}
    </main>
  );
}
