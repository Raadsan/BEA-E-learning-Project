"use client";

import { formatAuditDateTime, wasRecordUpdated, getCreatedAtValue } from "@/utils/auditDisplay";

const ReadField = ({ label, value, isDark, span = false }) => (
  <div className={span ? "md:col-span-2" : ""}>
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

export default function AuditTrailSection({
  record,
  isDark,
  createdAtKey = undefined,
  updatedAtKey = undefined,
}: {
  record: Record<string, unknown> | null | undefined;
  isDark: boolean;
  createdAtKey?: string;
  updatedAtKey?: string;
}) {
  if (!record) return null;

  const createdAt = getCreatedAtValue(record, createdAtKey ? [createdAtKey, "created_at", "registration_date"] : undefined);
  const updatedAt = updatedAtKey ? record[updatedAtKey] : record.updated_at;

  return (
    <div className={`rounded-xl border p-4 ${isDark ? "border-gray-700 bg-gray-900/30" : "border-blue-100 bg-blue-50/40"}`}>
      <h3 className={`text-sm font-bold mb-3 ${isDark ? "text-white" : "text-[#010080]"}`}>Audit Trail</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReadField label="Created By" value={record.created_by_name || "Not recorded"} isDark={isDark} />
        <ReadField label="Created At" value={formatAuditDateTime(createdAt)} isDark={isDark} />
        {wasRecordUpdated(record, {
          createdAtKey: createdAtKey || (record.registration_date ? "registration_date" : "created_at"),
          updatedAtKey: updatedAtKey || "updated_at",
        }) && (
          <>
            <ReadField label="Updated By" value={record.updated_by_name || "N/A"} isDark={isDark} />
            <ReadField label="Updated At" value={formatAuditDateTime(updatedAt)} isDark={isDark} />
          </>
        )}
      </div>
    </div>
  );
}
