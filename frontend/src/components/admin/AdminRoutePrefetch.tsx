"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const ADMIN_ROUTES = [
    "/portal/admin",
    "/portal/admin/students",
    "/portal/admin/students/general",
    "/portal/admin/students/discounts",
    "/portal/admin/teachers",
    "/portal/admin/programs",
    "/portal/admin/classes",
    "/portal/admin/users",
    "/portal/admin/admins",
];

export default function AdminRoutePrefetch() {
    const router = useRouter();

    useEffect(() => {
        const timer = window.setTimeout(() => {
            ADMIN_ROUTES.forEach((route) => router.prefetch(route));
        }, 1200);

        return () => window.clearTimeout(timer);
    }, [router]);

    return null;
}
