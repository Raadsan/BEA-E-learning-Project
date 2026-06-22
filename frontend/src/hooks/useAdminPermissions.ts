"use client";

import { useMemo } from "react";
import { useGetCurrentUserQuery } from "@/lib/api/authApi";
import {
  AdminPermissionKey,
  isSuperAdminRole,
  parsePermissions,
} from "@/constants/adminPermissions";

type AdminUser = {
  role?: string;
  adminRole?: string;
  permissions?: AdminPermissionKey[] | string | null;
};

function getCachedAdminUser(): AdminUser | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export function useAdminPermissions() {
  const { data: fetchedUser } = useGetCurrentUserQuery();
  const user = (fetchedUser || getCachedAdminUser()) as AdminUser | null;

  return useMemo(() => {
    const adminRole = user?.adminRole || (user?.role === "admin" ? "super" : user?.role);
    const isSuperAdmin = isSuperAdminRole(adminRole);
    const permissions = isSuperAdmin ? [] : parsePermissions(user?.permissions);

    const can = (permission: AdminPermissionKey) =>
      isSuperAdmin || permissions.includes(permission);

    return {
      user,
      adminRole,
      isSuperAdmin,
      permissions,
      can,
    };
  }, [user]);
}
