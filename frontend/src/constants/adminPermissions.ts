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

/** Sub-pages shown under a module in the sidebar and permission form. */
export const PERMISSION_MODULE_PAGES: Partial<
  Record<AdminPermissionKey, { key: string; label: string; path: string; tab?: string }[]>
> = {
  student_management: [
    { key: "all_students", label: "All Students", path: "/portal/admin/students" },
    { key: "admitted_students", label: "All Admitted Students", path: "/portal/admin/students/general" },
    { key: "ielts_students", label: "IELTOEF Program Students", path: "/portal/admin/students/ielts-toefl" },
    { key: "proficiency_students", label: "Proficiency Test Students", path: "/portal/admin/students/proficiency-only" },
    { key: "student_discounts", label: "Student Discounts", path: "/portal/admin/students/discounts" },
  ],
  academic_management: [
    { key: "programs", label: "Programs", path: "/portal/admin/programs" },
    { key: "courses", label: "Courses", path: "/portal/admin/subprograms" },
    { key: "course_materials", label: "Course Materials", path: "/portal/admin/learning-resources/materials" },
    { key: "certificate_configuration", label: "Certificate Configuration", path: "/portal/admin/certificates", tab: "configuration" },
    { key: "certificate_issued", label: "Issued Certificates Log", path: "/portal/admin/certificates", tab: "issued" },
  ],
  class_management: [
    { key: "classes", label: "Classes", path: "/portal/admin/classes" },
    { key: "online_sessions", label: "Online Session Links", path: "/portal/admin/learning-resources/sessions" },
    { key: "timetable", label: "Academic Timetable", path: "/portal/admin/learning-resources/timetable" },
    { key: "shifts", label: "Shifts", path: "/portal/admin/shifts" },
  ],
  assessments: [
    { key: "placement_tests", label: "Placement Tests", path: "/portal/admin/assessments/placement-tests" },
    { key: "placement_results", label: "Placement Results", path: "/portal/admin/assessments/placement-tests/results" },
    { key: "proficiency_tests", label: "Proficiency Tests", path: "/portal/admin/assessments/proficiency-tests" },
    { key: "proficiency_results", label: "Proficiency Results", path: "/portal/admin/assessments/proficiency-tests/results" },
  ],
  student_requests: [
    { key: "session_requests", label: "Session Change Requests", path: "/portal/admin/students-requests/session" },
    { key: "freezing_requests", label: "Freezing Requests", path: "/portal/admin/students-requests/freezing" },
  ],
  reviews: [
    { key: "teacher_questions", label: "Teacher", path: "/portal/admin/reviews/teacher-questions" },
    { key: "student_reviews", label: "Student", path: "/portal/admin/reviews/student-reviews" },
  ],
  communication: [
    { key: "announcements", label: "Announcements", path: "/portal/admin/communication/announcements" },
    { key: "news_events", label: "News & Events", path: "/portal/admin/communication/news" },
    { key: "course_timeline", label: "Course Timeline", path: "/portal/admin/communication/course-timeline" },
    { key: "testimonials", label: "Testimonials", path: "/portal/admin/communication/testimonials" },
    { key: "tutorials", label: "Tutorials", path: "/portal/admin/communication/tutorials" },
    { key: "policies", label: "Policies", path: "/portal/admin/communication/policies" },
  ],
  inquiries: [
    { key: "contact_messages", label: "Contact Messages", path: "/portal/admin/communication/contacts" },
    { key: "newsletter", label: "Newsletter Subscribers", path: "/portal/admin/communication/newsletter" },
  ],
  payments: [
    { key: "payment_packages", label: "Payment Packages", path: "/portal/admin/payments/packages" },
    { key: "payment_history", label: "Payment History", path: "/portal/admin/payments/history" },
  ],
  reports: [
    { key: "student_reports", label: "Student Reports", path: "/portal/admin/reports/students" },
    { key: "assessment_reports", label: "Assessment Reports", path: "/portal/admin/reports/assessments" },
    { key: "financial_reports", label: "Financial Reports", path: "/portal/admin/reports/financial" },
  ],
};

export type AdminPermissionKey = (typeof TECHNICAL_ADMIN_PERMISSION_OPTIONS)[number]["key"];
export type PermissionAction = "view" | "add" | "edit" | "delete";
export type PageActions = Partial<Record<PermissionAction, boolean>>;
export type ModuleActions = PageActions & {
  pages?: Record<string, PageActions>;
};
export type AdminPermissionMap = Partial<Record<AdminPermissionKey, ModuleActions>>;

export const PERMISSION_ACTIONS: { key: PermissionAction; label: string }[] = [
  { key: "view", label: "View" },
  { key: "add", label: "Add" },
  { key: "edit", label: "Edit" },
  { key: "delete", label: "Delete" },
];

const VALID_KEYS = new Set(TECHNICAL_ADMIN_PERMISSION_OPTIONS.map((p) => p.key));

function normalizePageActions(raw: unknown): PageActions | null {
  if (!raw || typeof raw !== "object") return null;
  const actions = raw as PageActions;
  return {
    view: !!actions.view,
    add: !!actions.add,
    edit: !!actions.edit,
    delete: !!actions.delete,
  };
}

function normalizeModuleActions(raw: unknown): ModuleActions | null {
  if (!raw || typeof raw !== "object") return null;
  const val = raw as ModuleActions;
  const mod: ModuleActions = {
    view: !!val.view,
    add: !!val.add,
    edit: !!val.edit,
    delete: !!val.delete,
  };
  if (val.pages && typeof val.pages === "object") {
    mod.pages = {};
    for (const [pageKey, pageVal] of Object.entries(val.pages)) {
      const normalized = normalizePageActions(pageVal);
      if (normalized) mod.pages[pageKey] = normalized;
    }
  }
  return mod;
}

export function createEmptyPermissionMap(): AdminPermissionMap {
  return {};
}

export function parsePermissionMap(raw: unknown): AdminPermissionMap {
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      return parsePermissionMap(JSON.parse(raw));
    } catch {
      return {};
    }
  }
  if (Array.isArray(raw)) {
    const map: AdminPermissionMap = {};
    for (const key of raw) {
      if (VALID_KEYS.has(key as AdminPermissionKey)) {
        map[key as AdminPermissionKey] = {
          view: true,
          add: true,
          edit: true,
          delete: true,
        };
      }
    }
    return map;
  }
  if (typeof raw === "object" && raw !== null) {
    const map: AdminPermissionMap = {};
    for (const [key, val] of Object.entries(raw)) {
      if (!VALID_KEYS.has(key as AdminPermissionKey)) continue;
      if (val === true) {
        map[key as AdminPermissionKey] = {
          view: true,
          add: true,
          edit: true,
          delete: true,
        };
      } else if (typeof val === "object" && val) {
        const normalized = normalizeModuleActions(val);
        if (normalized) map[key as AdminPermissionKey] = normalized;
      }
    }
    return map;
  }
  return {};
}

/** Module keys the admin can see in the sidebar (view access). */
export function parsePermissions(raw: unknown): AdminPermissionKey[] {
  const map = parsePermissionMap(raw);
  return TECHNICAL_ADMIN_PERMISSION_OPTIONS.map((o) => o.key).filter((key) =>
    moduleVisibleInSidebar(map, key)
  );
}

export function hasAnyPermission(map: AdminPermissionMap): boolean {
  return Object.entries(map).some(([moduleKey, mod]) => {
    if (!mod?.view) return false;
    const subPages = PERMISSION_MODULE_PAGES[moduleKey as AdminPermissionKey];
    if (!subPages?.length) return true;
    return subPages.some((page) => mod.pages?.[page.key]?.view === true);
  });
}

export function moduleVisibleInSidebar(map: AdminPermissionMap, key: AdminPermissionKey): boolean {
  const mod = map[key];
  if (!mod?.view) return false;
  const subPages = PERMISSION_MODULE_PAGES[key];
  if (!subPages?.length) return true;
  return subPages.some((page) => mod.pages?.[page.key]?.view === true);
}

export function canPageView(
  map: AdminPermissionMap,
  moduleKey: AdminPermissionKey,
  pageKey: string
): boolean {
  const mod = map[moduleKey];
  if (!mod?.view) return false;
  const subPages = PERMISSION_MODULE_PAGES[moduleKey];
  if (subPages?.length) {
    return mod.pages?.[pageKey]?.view === true;
  }
  return mod.view === true;
}

export function canPageAction(
  map: AdminPermissionMap,
  moduleKey: AdminPermissionKey,
  pageKey: string,
  action: PermissionAction
): boolean {
  const mod = map[moduleKey];
  if (!mod?.view) return false;
  const subPages = PERMISSION_MODULE_PAGES[moduleKey];
  if (subPages?.length) {
    const page = mod.pages?.[pageKey];
    if (!page?.view) return false;
    if (action === "view") return true;
    return page[action] === true;
  }
  return canModuleAction(map, moduleKey, action);
}

export function getPageKeyFromPath(
  moduleKey: AdminPermissionKey,
  pathname: string,
  search = ""
): string | null {
  const subPages = PERMISSION_MODULE_PAGES[moduleKey];
  if (!subPages) return null;
  const normalized = pathname.replace(/\/$/, "") || "/";
  const tab = new URLSearchParams(search).get("tab");

  const match = [...subPages]
    .sort((a, b) => b.path.length - a.path.length)
    .find((page) => {
      const pagePath = page.path.replace(/\/$/, "");
      const pathMatches =
        normalized === pagePath || normalized.startsWith(`${pagePath}/`);
      if (!pathMatches) return false;
      if (page.tab) return tab === page.tab;
      if (page.path === "/portal/admin/certificates") return false;
      return true;
    });

  return match?.key ?? null;
}

export function canViewModule(map: AdminPermissionMap, key: AdminPermissionKey): boolean {
  return map[key]?.view === true;
}

export function canModuleAction(
  map: AdminPermissionMap,
  key: AdminPermissionKey,
  action: PermissionAction
): boolean {
  const mod = map[key];
  if (!mod?.view) return false;
  if (action === "view") return true;
  return mod[action] === true;
}

export function serializePermissionMap(map: AdminPermissionMap): string | null {
  const cleaned: AdminPermissionMap = {};
  for (const opt of TECHNICAL_ADMIN_PERMISSION_OPTIONS) {
    const mod = map[opt.key];
    if (!mod?.view) continue;
    const entry: ModuleActions = {
      view: true,
      add: !!mod.add,
      edit: !!mod.edit,
      delete: !!mod.delete,
    };
    if (mod.pages && Object.keys(mod.pages).length > 0) {
      entry.pages = {};
      for (const [pageKey, pageVal] of Object.entries(mod.pages)) {
        if (!pageVal?.view) continue;
        entry.pages[pageKey] = {
          view: true,
          add: !!pageVal.add,
          edit: !!pageVal.edit,
          delete: !!pageVal.delete,
        };
      }
    }
    cleaned[opt.key] = entry;
  }
  return Object.keys(cleaned).length ? JSON.stringify(cleaned) : null;
}

export function setModuleAction(
  map: AdminPermissionMap,
  moduleKey: AdminPermissionKey,
  action: PermissionAction,
  enabled: boolean
): AdminPermissionMap {
  const next = { ...map };
  const current = { ...(next[moduleKey] || {}) };

  if (action === "view") {
    if (!enabled) {
      delete next[moduleKey];
      return next;
    }
    current.view = true;
    next[moduleKey] = current;
    return next;
  }

  if (enabled) {
    current.view = true;
  }
  current[action] = enabled;
  if (!current.view && !current.add && !current.edit && !current.delete) {
    delete next[moduleKey];
  } else {
    next[moduleKey] = current;
  }
  return next;
}

export function setPageAction(
  map: AdminPermissionMap,
  moduleKey: AdminPermissionKey,
  pageKey: string,
  action: PermissionAction,
  enabled: boolean
): AdminPermissionMap {
  const next = { ...map };
  const mod = { ...(next[moduleKey] || { view: true }) };
  const pages = { ...(mod.pages || {}) };
  const current = { ...(pages[pageKey] || {}) };

  if (action === "view") {
    if (!enabled) {
      delete pages[pageKey];
    } else {
      current.view = true;
      pages[pageKey] = current;
    }
  } else if (enabled) {
    current.view = true;
    current[action] = true;
    pages[pageKey] = current;
  } else {
    current[action] = false;
    pages[pageKey] = current;
  }

  mod.pages = Object.keys(pages).length ? pages : undefined;
  mod.view = true;
  next[moduleKey] = mod;
  return next;
}

export function initModuleSubPages(
  map: AdminPermissionMap,
  moduleKey: AdminPermissionKey,
  enabled: boolean
): AdminPermissionMap {
  if (!enabled) {
    const next = { ...map };
    delete next[moduleKey];
    return next;
  }

  const next = { ...map };
  next[moduleKey] = { view: true };
  return next;
}

export const ADMIN_ROUTE_RULES: {
  prefix: string;
  permission: AdminPermissionKey;
  pageKey?: string;
  superOnly?: boolean;
}[] = [
  { prefix: "/portal/admin/admins", permission: "dashboard", superOnly: true },
  { prefix: "/portal/admin/users", permission: "users" },
  { prefix: "/portal/admin/teachers", permission: "teachers" },
  { prefix: "/portal/admin/students/discounts", permission: "student_management", pageKey: "student_discounts" },
  { prefix: "/portal/admin/students/proficiency-only", permission: "student_management", pageKey: "proficiency_students" },
  { prefix: "/portal/admin/students/ielts-toefl", permission: "student_management", pageKey: "ielts_students" },
  { prefix: "/portal/admin/students/general", permission: "student_management", pageKey: "admitted_students" },
  { prefix: "/portal/admin/students", permission: "student_management", pageKey: "all_students" },
  { prefix: "/portal/admin/learning-resources/materials", permission: "academic_management", pageKey: "course_materials" },
  { prefix: "/portal/admin/subprograms", permission: "academic_management", pageKey: "courses" },
  { prefix: "/portal/admin/programs", permission: "academic_management", pageKey: "programs" },
  { prefix: "/portal/admin/learning-resources/sessions", permission: "class_management", pageKey: "online_sessions" },
  { prefix: "/portal/admin/learning-resources/timetable", permission: "class_management", pageKey: "timetable" },
  { prefix: "/portal/admin/shifts", permission: "class_management", pageKey: "shifts" },
  { prefix: "/portal/admin/classes", permission: "class_management", pageKey: "classes" },
  { prefix: "/portal/admin/assessments/placement-tests/results", permission: "assessments", pageKey: "placement_results" },
  { prefix: "/portal/admin/assessments/placement-tests", permission: "assessments", pageKey: "placement_tests" },
  { prefix: "/portal/admin/assessments/proficiency-tests/results", permission: "assessments", pageKey: "proficiency_results" },
  { prefix: "/portal/admin/assessments/proficiency-tests", permission: "assessments", pageKey: "proficiency_tests" },
  { prefix: "/portal/admin/students-requests/session", permission: "student_requests", pageKey: "session_requests" },
  { prefix: "/portal/admin/students-requests/freezing", permission: "student_requests", pageKey: "freezing_requests" },
  { prefix: "/portal/admin/reviews/teacher-questions", permission: "reviews", pageKey: "teacher_questions" },
  { prefix: "/portal/admin/reviews/teacher-reviews", permission: "reviews", pageKey: "teacher_questions" },
  { prefix: "/portal/admin/reviews/student-reviews", permission: "reviews", pageKey: "student_reviews" },
  { prefix: "/portal/admin/communication/announcements", permission: "communication", pageKey: "announcements" },
  { prefix: "/portal/admin/communication/news", permission: "communication", pageKey: "news_events" },
  { prefix: "/portal/admin/communication/course-timeline", permission: "communication", pageKey: "course_timeline" },
  { prefix: "/portal/admin/communication/testimonials", permission: "communication", pageKey: "testimonials" },
  { prefix: "/portal/admin/communication/tutorials", permission: "communication", pageKey: "tutorials" },
  { prefix: "/portal/admin/communication/policies", permission: "communication", pageKey: "policies" },
  { prefix: "/portal/admin/communication/contacts", permission: "inquiries", pageKey: "contact_messages" },
  { prefix: "/portal/admin/communication/newsletter", permission: "inquiries", pageKey: "newsletter" },
  { prefix: "/portal/admin/payments/packages", permission: "payments", pageKey: "payment_packages" },
  { prefix: "/portal/admin/payments/history", permission: "payments", pageKey: "payment_history" },
  { prefix: "/portal/admin/reports/students", permission: "reports", pageKey: "student_reports" },
  { prefix: "/portal/admin/reports/assessments", permission: "reports", pageKey: "assessment_reports" },
  { prefix: "/portal/admin/reports/financial", permission: "reports", pageKey: "financial_reports" },
];

export function isSuperAdminRole(adminRole?: string | null) {
  return !adminRole || adminRole === "super" || adminRole === "admin";
}

export function getRouteAccess(pathname: string, search = "") {
  if (!pathname?.startsWith("/portal/admin")) {
    return { allowed: true as const };
  }
  if (pathname === "/portal/admin/profile" || pathname.startsWith("/portal/admin/profile/")) {
    return { allowed: true as const };
  }
  if (pathname === "/portal/admin" || pathname === "/portal/admin/") {
    return { allowed: true as const, permission: "dashboard" as AdminPermissionKey };
  }

  if (pathname.startsWith("/portal/admin/certificates")) {
    const tab = new URLSearchParams(search).get("tab") || "configuration";
    return {
      allowed: true as const,
      permission: "academic_management" as AdminPermissionKey,
      pageKey: tab === "issued" ? "certificate_issued" : "certificate_configuration",
    };
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
    pageKey: rule.pageKey,
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


