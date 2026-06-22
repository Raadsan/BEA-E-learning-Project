export function formatAuditDateTime(value) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function wasRecordUpdated(record, { createdAtKey = "created_at", updatedAtKey = "updated_at" } = {}) {
  if (record?.updated_by || record?.updated_by_name) return true;
  const createdAt = record?.[createdAtKey];
  const updatedAt = record?.[updatedAtKey];
  if (!createdAt || !updatedAt) return false;
  return new Date(updatedAt).getTime() - new Date(createdAt).getTime() > 1000;
}

export function getCreatedAtValue(record, keys = ["created_at", "registration_date"]) {
  for (const key of keys) {
    if (record?.[key]) return record[key];
  }
  return null;
}

export const createdByColumn = {
  key: "created_info",
  label: "Created By",
  render: (_, row) => (
    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5 font-medium min-w-[180px]">
      <div className="flex items-start gap-1">
        <span className="text-gray-400 font-bold shrink-0">By:</span>
        <span className="text-gray-700 dark:text-gray-200">{row.created_by_name || "Not recorded"}</span>
      </div>
      <div className="flex items-start gap-1">
        <span className="text-gray-400 font-bold shrink-0">At:</span>
        <span>{formatAuditDateTime(getCreatedAtValue(row))}</span>
      </div>
    </div>
  ),
};
