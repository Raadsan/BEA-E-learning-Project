"use client";

import AuditTrailSection from "@/components/admin/AuditTrailSection";

const ReadField = ({ label, value, isDark }) => (
  <div>
    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? "text-gray-400" : "text-gray-500"}`}>{label}</label>
    <input
      type="text"
      readOnly
      value={value !== undefined && value !== null && value !== "" ? String(value) : "N/A"}
      className={`w-full px-3 py-2 rounded-md border text-sm font-medium outline-none cursor-default ${isDark ? "bg-gray-800/60 border-gray-600 text-gray-100" : "bg-gray-50 border-gray-200 text-gray-900"}`}
    />
  </div>
);

export default function SubprogramViewModal({ subprogram, onClose, isDark }) {
  if (!subprogram) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-2xl rounded-xl shadow-2xl border-2 max-h-[90vh] overflow-y-auto ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`} onClick={(e) => e.stopPropagation()}>
        <div className={`sticky top-0 border-b px-6 py-4 flex items-center justify-between ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>Course: {subprogram.subprogram_name}</h2>
          <button onClick={onClose} className={isDark ? "text-gray-400" : "text-gray-500"}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ReadField label="Course Name" value={subprogram.subprogram_name} isDark={isDark} />
            <ReadField label="Program" value={subprogram.program_name || subprogram.programs?.title} isDark={isDark} />
            <ReadField label="Status" value={subprogram.status} isDark={isDark} />
            <ReadField label="Description" value={subprogram.description} isDark={isDark} />
          </div>
          <AuditTrailSection record={subprogram} isDark={isDark} />
        </div>
      </div>
    </div>
  );
}
