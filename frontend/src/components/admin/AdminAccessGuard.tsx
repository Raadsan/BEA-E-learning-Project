"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  getFirstAllowedAdminPath,
  getRouteAccess,
} from "@/constants/adminPermissions";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";

export default function AdminAccessGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isSuperAdmin, can, canPage, permissions, permissionMap } = useAdminPermissions();

  useEffect(() => {
    if (!pathname?.startsWith("/portal/admin")) return;

    const search = searchParams?.toString() ? `?${searchParams.toString()}` : "";
    const access = getRouteAccess(pathname, search);

    if (access.superOnly && !isSuperAdmin) {
      router.replace(getFirstAllowedAdminPath(permissions));
      return;
    }

    if (access.permission && !can(access.permission)) {
      router.replace(getFirstAllowedAdminPath(permissions));
      return;
    }

    if (
      access.permission &&
      access.pageKey &&
      !isSuperAdmin &&
      !canPage(access.permission, access.pageKey)
    ) {
      router.replace(getFirstAllowedAdminPath(permissions));
    }
  }, [pathname, searchParams, isSuperAdmin, can, canPage, permissions, permissionMap, router]);

  return <>{children}</>;
}
