"use client";

import { AdminPermissionKey, PermissionAction } from "@/constants/adminPermissions";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";

/** View / Add / Edit / Delete for a module or a specific sub-page. Assign & approve map to Edit. */
export function usePagePermissions(
  moduleKey: AdminPermissionKey,
  pageKey?: string
) {
  const { canAction, canPageAction } = useAdminPermissions();

  const can = (action: PermissionAction) =>
    pageKey ? canPageAction(moduleKey, pageKey, action) : canAction(moduleKey, action);

  return {
    canView: can("view"),
    canAdd: can("add"),
    canEdit: can("edit"),
    canDelete: can("delete"),
    can,
    /** Assign class, assign teacher, approve, etc. */
    canAssign: can("edit"),
    showBulkActions: can("edit") || can("delete"),
  };
}
