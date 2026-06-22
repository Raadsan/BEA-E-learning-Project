"use client";

import AuditTrailSection from "@/components/admin/AuditTrailSection";

const ReadField = ({ label, value, isDark }) => (
  <div>
    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? "text-gray-400" : "text-gray-500"}`}>
      {label}
    </label>
    <input
      type="text"
      readOnly
      value={value !== undefined && value !== null && value !== "" ? String(value) : "N/A"}
      className={`w-full px-3 py-2 rounded-md border text-sm font-medium outline-none cursor-default ${
        isDark ? "bg-gray-800/60 border-gray-600 text-gray-100" : "bg-gray-50 border-gray-200 text-gray-900"
      }`}
    />
  </div>
);

export default function ClassViewModal({ isOpen, onClose, classItem, isDark, onViewStudents }) {
  if (!isOpen || !classItem) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 backdrop-blur-sm" aria-hidden="true" onClick={onClose} />
      <div
        className={`relative rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 border-2 ${
          isDark ? "bg-gray-800/95 border-gray-600" : "bg-white/95 border-gray-300"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`sticky top-0 border-b px-6 py-4 flex items-center justify-between ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>Class: {classItem.class_name}</h2>
          <button onClick={onClose} className={`transition-colors ${isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-400 hover:text-gray-600"}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ReadField label="Class Name" value={classItem.class_name} isDark={isDark} />
            <ReadField label="Subprogram" value={classItem.subprogram_name} isDark={isDark} />
            <ReadField label="Teacher" value={classItem.teacher_name} isDark={isDark} />
            <ReadField label="Shift" value={classItem.shift_name} isDark={isDark} />
            <ReadField label="Description" value={classItem.description} isDark={isDark} />
          </div>

          <AuditTrailSection record={classItem} isDark={isDark} />

          {onViewStudents && (
            <button
              type="button"
              onClick={() => onViewStudents(classItem)}
              className="w-full py-2.5 rounded-lg bg-[#010080] text-white text-sm font-semibold hover:bg-blue-900 transition-colors"
            >
              View Students in This Class
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
