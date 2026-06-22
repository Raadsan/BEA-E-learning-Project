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
] as const;

export type AdminPermissionKey = (typeof TECHNICAL_ADMIN_PERMISSION_OPTIONS)[number]["key"];

export const ADMIN_ROUTE_RULES: { prefix: string; permission: AdminPermissionKey; superOnly?: boolean }[] = [
  { prefix: "/portal/admin/admins", permission: "dashboard", superOnly: true },
  { prefix: "/portal/admin/users", permission: "users" },
  { prefix: "/portal/admin/teachers", permission: "teachers" },
  { prefix: "/portal/admin/students-requests", permission: "student_requests" },
  { prefix: "/portal/admin/students", permission: "student_management" },
  { prefix: "/portal/admin/programs", permission: "academic_management" },
  { prefix: "/portal/admin/subprograms", permission: "academic_management" },
  { prefix: "/portal/admin/certificates", permission: "academic_management" },
  { prefix: "/portal/admin/learning-resources/materials", permission: "academic_management" },
  { prefix: "/portal/admin/learning-resources/sessions", permission: "class_management" },
  { prefix: "/portal/admin/learning-resources/timetable", permission: "class_management" },
  { prefix: "/portal/admin/learning-resources", permission: "class_management" },
  { prefix: "/portal/admin/classes", permission: "class_management" },
  { prefix: "/portal/admin/shifts", permission: "class_management" },
  { prefix: "/portal/admin/assessments", permission: "assessments" },
  { prefix: "/portal/admin/reviews", permission: "reviews" },
  { prefix: "/portal/admin/communication/contacts", permission: "inquiries" },
  { prefix: "/portal/admin/communication/newsletter", permission: "inquiries" },
  { prefix: "/portal/admin/communication", permission: "communication" },
  { prefix: "/portal/admin/payments", permission: "payments" },
  { prefix: "/portal/admin/reports", permission: "reports" },
];

export function isSuperAdminRole(adminRole?: string | null) {
  return !adminRole || adminRole === "super" || adminRole === "admin";
}

export function parsePermissions(raw: unknown): AdminPermissionKey[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.filter((item): item is AdminPermissionKey =>
      TECHNICAL_ADMIN_PERMISSION_OPTIONS.some((option) => option.key === item)
    );
  }
  if (typeof raw === "string") {
    try {
      return parsePermissions(JSON.parse(raw));
    } catch {
      return [];
    }
  }
  return [];
}

export function getRouteAccess(pathname: string) {
  if (!pathname?.startsWith("/portal/admin")) {
    return { allowed: true as const };
  }
  if (pathname === "/portal/admin/profile" || pathname.startsWith("/portal/admin/profile/")) {
    return { allowed: true as const };
  }
  if (pathname === "/portal/admin" || pathname === "/portal/admin/") {
    return { allowed: true as const, permission: "dashboard" as AdminPermissionKey };
  }

  const rule = [...ADMIN_ROUTE_RULES]
    .sort((a, b) => b.prefix.length - a.prefix.length)
    .find((entry) => pathname.startsWith(entry.prefix));

  if (!rule) {
    return { allowed: true as const };
  }

  return {
    allowed: true as const,
    permission: rule.permission,
    superOnly: rule.superOnly,
  };
}

export function getFirstAllowedAdminPath(permissions: AdminPermissionKey[]) {
  const order: AdminPermissionKey[] = [
    "dashboard",
    "users",
    "teachers",
    "student_management",
    "academic_management",
    "class_management",
    "assessments",
    "student_requests",
    "reviews",
    "communication",
    "inquiries",
    "payments",
    "reports",
  ];

  const paths: Record<AdminPermissionKey, string> = {
    dashboard: "/portal/admin",
    users: "/portal/admin/users",
    teachers: "/portal/admin/teachers",
    student_management: "/portal/admin/students",
    academic_management: "/portal/admin/programs",
    class_management: "/portal/admin/classes",
    assessments: "/portal/admin/assessments/placement-tests",
    student_requests: "/portal/admin/students-requests/session",
    reviews: "/portal/admin/reviews/teacher-questions",
    communication: "/portal/admin/communication/announcements",
    inquiries: "/portal/admin/communication/contacts",
    payments: "/portal/admin/payments/packages",
    reports: "/portal/admin/reports/students",
  };

  const next = order.find((key) => permissions.includes(key));
  return next ? paths[next] : "/portal/admin";
}
