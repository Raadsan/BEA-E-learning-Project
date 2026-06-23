"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Modal";

type StudentDiscountModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    funding_status: string;
    scholarship_percentage: number | null;
  }) => Promise<void>;
  isSubmitting?: boolean;
  student?: {
    student_id?: number | string;
    full_name?: string;
    email?: string;
    chosen_program?: string;
    funding_status?: string;
    scholarship_percentage?: number | string | null;
  } | null;
  mode?: "edit" | "assign";
  studentsForAssign?: Array<{
    student_id?: number | string;
    full_name?: string;
    email?: string;
    chosen_program?: string;
  }>;
  selectedStudentId?: string;
  onSelectStudent?: (id: string) => void;
  isDark?: boolean;
};

export default function StudentDiscountModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  student = null,
  mode = "edit",
  studentsForAssign = [],
  selectedStudentId = "",
  onSelectStudent,
  isDark = false,
}: StudentDiscountModalProps) {
  const [fundingStatus, setFundingStatus] = useState("Partial Scholarship");
  const [scholarshipPct, setScholarshipPct] = useState("");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const status =
      student?.funding_status === "Full Scholarship"
        ? "Full Scholarship"
        : "Partial Scholarship";
    setFundingStatus(status);
    setScholarshipPct(
      status === "Full Scholarship"
        ? ""
        : student?.scholarship_percentage?.toString() || ""
    );
    setValidationError("");
  }, [isOpen, student]);

  const selectedAssignStudent = studentsForAssign.find(
    (s) => String(s.student_id) === String(selectedStudentId)
  );
  const displayStudent = student || selectedAssignStudent;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    const pct =
      fundingStatus === "Partial Scholarship" && scholarshipPct
        ? parseInt(scholarshipPct, 10)
        : null;

    if (fundingStatus === "Partial Scholarship" && (!pct || pct < 1 || pct > 99)) {
      setValidationError("Enter a discount between 1% and 99%.");
      return;
    }

    await onSubmit({
      funding_status: fundingStatus,
      scholarship_percentage: fundingStatus === "Full Scholarship" ? null : pct,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "assign" ? "Assign Student Discount" : "Edit Student Discount"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {mode === "assign" && (
          <div>
            <label
              className={`block text-sm font-semibold mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              Select Student
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => onSelectStudent?.(e.target.value)}
              required
              className={`w-full px-4 py-2.5 border-2 rounded-xl ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200"}`}
            >
              <option value="">Choose a student...</option>
              {studentsForAssign.map((s) => (
                <option key={s.student_id} value={s.student_id}>
                  {s.full_name} — {s.email}
                  {s.chosen_program ? ` (${s.chosen_program})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {displayStudent && (
          <div
            className={`rounded-xl border p-4 text-sm ${isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"}`}
          >
            <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              {displayStudent.full_name}
            </p>
            <p className={isDark ? "text-gray-400" : "text-gray-500"}>{displayStudent.email}</p>
          </div>
        )}

        <div>
          <label
            className={`block text-sm font-semibold mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
            Discount Type
          </label>
          <select
            value={fundingStatus}
            onChange={(e) => {
              setFundingStatus(e.target.value);
              if (e.target.value === "Full Scholarship") setScholarshipPct("");
            }}
            className={`w-full px-4 py-2.5 border-2 rounded-xl ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200"}`}
          >
            <option value="Partial Scholarship">Partial Scholarship / Discount (%)</option>
            <option value="Full Scholarship">Full Scholarship (100%)</option>
          </select>
        </div>

        <div>
          <label
            className={`block text-sm font-semibold mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
            Discount Percentage
          </label>
          <input
            type="number"
            value={scholarshipPct}
            onChange={(e) => setScholarshipPct(e.target.value)}
            min={1}
            max={99}
            placeholder="e.g. 25"
            disabled={fundingStatus === "Full Scholarship"}
            required={fundingStatus === "Partial Scholarship"}
            className={`w-full px-4 py-3 border-2 rounded-xl ${isDark ? "bg-gray-800 border-gray-700 text-white disabled:opacity-50" : "bg-white border-gray-200 disabled:bg-gray-100"}`}
          />
          <p className={`mt-1 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            Applied to upgrade payments. Full scholarship = free.
          </p>
          {validationError && (
            <p className="mt-1 text-xs text-red-500">{validationError}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className={`px-5 py-2.5 rounded-xl font-medium border ${isDark ? "border-gray-600 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || (mode === "assign" && !selectedStudentId)}
            className="px-5 py-2.5 rounded-xl font-medium bg-[#010080] text-white hover:bg-[#010080]/90 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Discount"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
