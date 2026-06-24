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

function normalizePageActions(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    view: !!raw.view,
    add: !!raw.add,
    edit: !!raw.edit,
    delete: !!raw.delete,
  };
}

function normalizeModuleActions(raw) {
  if (!raw || typeof raw !== "object") return null;
  const mod = {
    view: !!raw.view,
    add: !!raw.add,
    edit: !!raw.edit,
    delete: !!raw.delete,
  };
  if (raw.pages && typeof raw.pages === "object") {
    mod.pages = {};
    for (const [pageKey, pageVal] of Object.entries(raw.pages)) {
      const normalized = normalizePageActions(pageVal);
      if (normalized) mod.pages[pageKey] = normalized;
    }
  }
  return mod;
}

export function isSuperAdminRole(adminRole) {
  return !adminRole || adminRole === "super" || adminRole === "admin";
}

export function parsePermissionMap(raw) {
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      return parsePermissionMap(JSON.parse(raw));
    } catch {
      return {};
    }
  }
  if (Array.isArray(raw)) {
    const map = {};
    for (const key of raw) {
      if (VALID_KEYS.has(key)) {
        map[key] = { view: true, add: true, edit: true, delete: true };
      }
    }
    return map;
  }
  if (typeof raw === "object" && raw !== null) {
    const map = {};
    for (const [key, val] of Object.entries(raw)) {
      if (!VALID_KEYS.has(key)) continue;
      if (val === true) {
        map[key] = { view: true, add: true, edit: true, delete: true };
      } else if (typeof val === "object" && val) {
        const normalized = normalizeModuleActions(val);
        if (normalized) map[key] = normalized;
      }
    }
    return map;
  }
  return {};
}

export function parseAdminPermissions(raw) {
  const map = parsePermissionMap(raw);
  return TECHNICAL_ADMIN_PERMISSION_OPTIONS.map((o) => o.key).filter((key) => map[key]?.view === true);
}

export function hasAnyPermission(map) {
  return Object.values(map).some((mod) => {
    if (!mod?.view) return false;
    if (mod.pages && Object.keys(mod.pages).length > 0) {
      return Object.values(mod.pages).some((page) => page?.view);
    }
    return true;
  });
}

export function serializeAdminPermissions(permissions) {
  const map = parsePermissionMap(permissions);
  const cleaned = {};
  for (const opt of TECHNICAL_ADMIN_PERMISSION_OPTIONS) {
    const mod = map[opt.key];
    if (!mod?.view) continue;
    const entry = {
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

export function validateTechnicalPermissions(permissions) {
  const map = parsePermissionMap(permissions);
  if (!hasAnyPermission(map)) {
    return { valid: false, error: "Select at least one permission for Technical Admin." };
  }
  return { valid: true, permissions: map };
}
