export const TECHNICAL_ADMIN_PERMISSION_OPTIONS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "users", label: "Users" },
  { key: "teachers", label: "Teachers" },
  { key: "student_management", label: "Student Management" },
  { key: "academic_management", label: "Academic Management" },
  { key: "class_management", label: "Class Management" },
  { key: "assessments", label: "Official BEA Assessments" },
  { key: "student_requests", label: "Students Requests" },
  { key: "reviews", label: "Reviews" },
  { key: "communication", label: "Communication" },
  { key: "inquiries", label: "Contact Management" },
  { key: "payments", label: "Payments" },
  { key: "reports", label: "Reports & Analytics" },
];

const VALID_KEYS = new Set(TECHNICAL_ADMIN_PERMISSION_OPTIONS.map((p) => p.key));

export function isSuperAdminRole(adminRole) {
  return !adminRole || adminRole === "super" || adminRole === "admin";
}

export function parseAdminPermissions(raw) {
  if (!raw) return [];
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((key) => VALID_KEYS.has(key));
  } catch {
    return [];
  }
}

export function serializeAdminPermissions(permissions) {
  if (!Array.isArray(permissions)) return null;
  const cleaned = [...new Set(permissions.filter((key) => VALID_KEYS.has(key)))];
  return cleaned.length ? JSON.stringify(cleaned) : null;
}

export function validateTechnicalPermissions(permissions) {
  const cleaned = parseAdminPermissions(permissions);
  if (!cleaned.length) {
    return { valid: false, error: "Select at least one permission for Technical Admin." };
  }
  return { valid: true, permissions: cleaned };
}
