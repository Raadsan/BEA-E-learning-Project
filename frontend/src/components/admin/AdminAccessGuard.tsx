"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  getFirstAllowedAdminPath,
  getRouteAccess,
} from "@/constants/adminPermissions";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";

export default function AdminAccessGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isSuperAdmin, can, permissions } = useAdminPermissions();

  useEffect(() => {
    if (!pathname?.startsWith("/portal/admin")) return;

    const access = getRouteAccess(pathname);

    if (access.superOnly && !isSuperAdmin) {
      router.replace(getFirstAllowedAdminPath(permissions));
      return;
    }

    if (access.permission && !can(access.permission)) {
      router.replace(getFirstAllowedAdminPath(permissions));
    }
  }, [pathname, isSuperAdmin, can, permissions, router]);

  return <>{children}</>;
}
