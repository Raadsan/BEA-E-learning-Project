"use client";

import {
  PERMISSION_ACTIONS,
  TECHNICAL_ADMIN_PERMISSION_OPTIONS,
  parsePermissionMap,
} from "@/constants/adminPermissions";

const ReadField = ({ label, value, isDark, span = false }: {
  label: string;
  value?: string | null;
  isDark: boolean;
  span?: boolean;
}) => (
  <div className={span ? "md:col-span-2" : ""}>
    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? "text-gray-400" : "text-gray-500"}`}>
      {label}
    </label>
    <input
      type="text"
      readOnly
      value={value || "N/A"}
      className={`w-full px-3 py-2 rounded-md border text-sm font-medium outline-none cursor-default select-all ${
        isDark ? "bg-gray-800/60 border-gray-600 text-gray-100" : "bg-gray-50 border-gray-200 text-gray-900"
      }`}
    />
  </div>
);

function formatDateTime(value?: string | null) {
  if (!value) return "N/A";
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function wasUpdated(admin) {
  if (admin?.updated_by || admin?.updated_by_name) return true;
  if (!admin?.created_at || !admin?.updated_at) return false;
  return new Date(admin.updated_at).getTime() - new Date(admin.created_at).getTime() > 1000;
}

function formatPermissionSummary(admin) {
  const map = parsePermissionMap(admin.permissions);
  const lines = TECHNICAL_ADMIN_PERMISSION_OPTIONS.filter((opt) => map[opt.key]?.view).map((opt) => {
    const mod = map[opt.key];
    const actions = PERMISSION_ACTIONS.filter((a) => mod?.[a.key]).map((a) => a.label);
    return `${opt.label}: ${actions.join(", ") || "View"}`;
  });
  return lines.length ? lines.join(" | ") : "None";
}

export default function AdminViewModal({ isOpen, onClose, admin, isDark }) {
  if (!isOpen || !admin) return null;

  const permissionSummary = admin.role === "technical" ? formatPermissionSummary(admin) : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`relative rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`sticky top-0 z-10 border-b px-6 py-4 flex items-center justify-between ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
            Admin Details: {admin.full_name || admin.username}
          </h2>
          <button onClick={onClose} className={`p-1 rounded-lg ${isDark ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100"}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ReadField label="Full Name" value={admin.full_name} isDark={isDark} />
            <ReadField label="Username" value={admin.username} isDark={isDark} />
            <ReadField label="Email" value={admin.email} isDark={isDark} />
            <ReadField label="Phone" value={admin.phone} isDark={isDark} />
            <ReadField
              label="Role"
              value={admin.role === "technical" ? "Technical Admin" : "Super Admin"}
              isDark={isDark}
            />
            <ReadField
              label="Status"
              value={admin.status ? admin.status.charAt(0).toUpperCase() + admin.status.slice(1) : "N/A"}
              isDark={isDark}
            />
            {admin.role === "technical" && (
              <ReadField label="Permissions" value={permissionSummary} isDark={isDark} span />
            )}
          </div>

          <div className={`rounded-xl border p-4 ${isDark ? "border-gray-700 bg-gray-900/30" : "border-blue-100 bg-blue-50/40"}`}>
            <h3 className={`text-sm font-bold mb-3 ${isDark ? "text-white" : "text-[#010080]"}`}>Audit Trail</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ReadField label="Created By" value={admin.created_by_name || "Not recorded"} isDark={isDark} />
              <ReadField label="Created At" value={formatDateTime(admin.created_at)} isDark={isDark} />
              {wasUpdated(admin) && (
                <>
                  <ReadField label="Updated By" value={admin.updated_by_name || "N/A"} isDark={isDark} />
                  <ReadField label="Updated At" value={formatDateTime(admin.updated_at)} isDark={isDark} />
                </>
              )}
            </div>
          </div>
        </div>

        <div className={`sticky bottom-0 border-t px-6 py-4 flex justify-end ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <button
            onClick={onClose}
            className={`px-5 py-2 rounded-lg text-sm font-semibold ${
              isDark ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
