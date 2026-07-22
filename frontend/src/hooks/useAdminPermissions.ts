"use client";

import { useMemo } from "react";
import { useGetCurrentUserQuery } from "@/lib/api/authApi";
import {
  AdminPermissionKey,
  AdminPermissionMap,
  PermissionAction,
  canModuleAction,
  canPageAction,
  canPageView,
  isSuperAdminRole,
  moduleVisibleInSidebar,
  parsePermissionMap,
  parsePermissions,
} from "@/constants/adminPermissions";

type AdminUser = {
  id?: number | string;
  role?: string;
  adminRole?: string;
  permissions?: AdminPermissionMap | string | string[] | null;
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
    const permissionMap = isSuperAdmin ? {} : parsePermissionMap(user?.permissions);
    const permissions = isSuperAdmin ? [] : parsePermissions(user?.permissions);

    const can = (permission: AdminPermissionKey) =>
      isSuperAdmin || moduleVisibleInSidebar(permissionMap, permission);

    const canAction = (permission: AdminPermissionKey, action: PermissionAction) =>
      isSuperAdmin || canModuleAction(permissionMap, permission, action);

    const canPage = (moduleKey: AdminPermissionKey, pageKey: string) =>
      isSuperAdmin || canPageView(permissionMap, moduleKey, pageKey);

    const canPageActionFn = (
      moduleKey: AdminPermissionKey,
      pageKey: string,
      action: PermissionAction
    ) => isSuperAdmin || canPageAction(permissionMap, moduleKey, pageKey, action);

    return {
      user,
      adminRole,
      isSuperAdmin,
      permissions,
      permissionMap,
      can,
      canAction,
      canPage,
      canPageAction: canPageActionFn,
    };
  }, [user]);
}
