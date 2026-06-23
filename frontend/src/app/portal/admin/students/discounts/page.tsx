"use client";

import { useMemo, useState } from "react";
import DataTable from "@/components/DataTable";
import { useDarkMode } from "@/context/ThemeContext";
import { useToast } from "@/components/Toast";
import { useGetStudentsQuery, useUpdateStudentMutation } from "@/lib/api/studentApi";
import StudentDiscountModal from "@/components/admin/students/StudentDiscountModal";

function hasStudentDiscount(student: {
  funding_status?: string;
  scholarship_percentage?: number | string | null;
}) {
  if (student.funding_status === "Full Scholarship") return true;
  if (student.funding_status === "Partial Scholarship") return true;
  return Boolean(student.scholarship_percentage && Number(student.scholarship_percentage) > 0);
}

function discountLabel(student: {
  funding_status?: string;
  scholarship_percentage?: number | string | null;
}) {
  if (student.funding_status === "Full Scholarship") return "100% (Full)";
  if (student.scholarship_percentage) return `${student.scholarship_percentage}%`;
  if (student.funding_status === "Partial Scholarship") return "Partial (no %)";
  return "—";
}

export default function StudentDiscountsPage() {
  const { isDark } = useDarkMode();
  const { showToast } = useToast();
  const { data: allStudents = [], isLoading, refetch } = useGetStudentsQuery();
  const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();

  const [typeFilter, setTypeFilter] = useState("all");
  const [modalMode, setModalMode] = useState<"edit" | "assign">("edit");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [assignStudentId, setAssignStudentId] = useState("");

  const discountedStudents = useMemo(() => {
    return (allStudents || [])
      .filter(hasStudentDiscount)
      .filter((student) => {
        if (typeFilter === "full") return student.funding_status === "Full Scholarship";
        if (typeFilter === "partial") return student.funding_status === "Partial Scholarship";
        return true;
      })
      .sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""));
  }, [allStudents, typeFilter]);

  const studentsWithoutDiscount = useMemo(() => {
    return (allStudents || [])
      .filter(
        (s) =>
          (s.approval_status === "approved" || s.approval_status === "inactive") &&
          !hasStudentDiscount(s)
      )
      .sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""));
  }, [allStudents]);

  const openEditModal = (student: any) => {
    setModalMode("edit");
    setEditingStudent(student);
    setAssignStudentId("");
    setIsModalOpen(true);
  };

  const openAssignModal = () => {
    setModalMode("assign");
    setEditingStudent(null);
    setAssignStudentId("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    setAssignStudentId("");
  };

  const handleSaveDiscount = async (data: {
    funding_status: string;
    scholarship_percentage: number | null;
  }) => {
    const targetId =
      modalMode === "edit" ? editingStudent?.student_id : assignStudentId;

    if (!targetId) {
      showToast("Please select a student", "error");
      return;
    }

    try {
      await updateStudent({
        id: targetId,
        funding_status: data.funding_status,
        scholarship_percentage: data.scholarship_percentage,
      }).unwrap();
      showToast("Student discount saved successfully", "success");
      closeModal();
      refetch();
    } catch (err: any) {
      showToast(err?.data?.error || "Failed to save discount", "error");
    }
  };

  const handleRemoveDiscount = async (student: any) => {
    if (
      !window.confirm(
        `Remove discount for ${student.full_name}? They will be set to Paid with no scholarship.`
      )
    ) {
      return;
    }

    try {
      await updateStudent({
        id: student.student_id,
        funding_status: "Paid",
        scholarship_percentage: null,
      }).unwrap();
      showToast("Discount removed", "success");
      refetch();
    } catch (err: any) {
      showToast(err?.data?.error || "Failed to remove discount", "error");
    }
  };

  const columns = [
    {
      key: "student_id",
      label: "ID",
      width: "90px",
      render: (val: string | number) => (
        <span className="font-semibold whitespace-nowrap">{val || "—"}</span>
      ),
    },
    {
      key: "full_name",
      label: "Student",
      render: (val: string, row: any) => (
        <div>
          <span className="font-medium">{val}</span>
          <span className="block text-[11px] text-gray-400">{row.email}</span>
        </div>
      ),
    },
    {
      key: "chosen_program",
      label: "Program",
      render: (val: string) => val || <span className="text-gray-400">—</span>,
    },
    {
      key: "funding_status",
      label: "Type",
      render: (val: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            val === "Full Scholarship"
              ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
              : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
          }`}
        >
          {val === "Full Scholarship" ? "Full Scholarship" : "Partial / Discount"}
        </span>
      ),
    },
    {
      key: "scholarship_percentage",
      label: "Discount",
      render: (_: unknown, row: any) => (
        <span className="font-semibold text-[#010080] dark:text-blue-300">
          {discountLabel(row)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: "160px",
      render: (_: unknown, row: any) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openEditModal(row)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#010080] text-white hover:opacity-90"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => handleRemoveDiscount(row)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${
              isDark
                ? "border-red-700 text-red-400 hover:bg-red-900/20"
                : "border-red-200 text-red-600 hover:bg-red-50"
            }`}
          >
            Remove
          </button>
        </div>
      ),
    },
  ];

  const filters = (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={typeFilter}
        onChange={(e) => setTypeFilter(e.target.value)}
        className={`px-3 py-2 rounded-lg border text-sm ${
          isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200"
        }`}
      >
        <option value="all">All discounts</option>
        <option value="full">Full scholarship only</option>
        <option value="partial">Partial discount only</option>
      </select>
      <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
        {discountedStudents.length} student{discountedStudents.length !== 1 ? "s" : ""} with discount
      </span>
    </div>
  );

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
          Student Discounts
        </h1>
        <p className={`mt-1 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          Manage scholarship and discount rates applied to student upgrade payments.
        </p>
      </div>

      <DataTable
        title="Students with Discounts"
        columns={columns}
        data={discountedStudents}
        isLoading={isLoading}
        showAddButton={true}
        onAddClick={openAssignModal}
        customHeaderLeft={filters}
        emptyMessage="No students with discounts yet. Click + to assign a discount."
        searchKey="full_name"
        isDark={isDark}
      />

      <StudentDiscountModal
        isOpen={isModalOpen}
        onClose={closeModal}
        mode={modalMode}
        student={editingStudent}
        studentsForAssign={studentsWithoutDiscount}
        selectedStudentId={assignStudentId}
        onSelectStudent={setAssignStudentId}
        onSubmit={handleSaveDiscount}
        isSubmitting={isUpdating}
        isDark={isDark}
      />
    </div>
  );
}
