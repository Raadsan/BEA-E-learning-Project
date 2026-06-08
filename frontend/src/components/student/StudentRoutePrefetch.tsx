"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const STUDENT_ROUTES = [
    "/portal/student",
    "/portal/student/my-courses",
    "/portal/student/writing-tasks",
    "/portal/student/course-work",
    "/portal/student/exams",
    "/portal/student/attendance",
    "/portal/student/placement-test",
    "/portal/student/payments",
];

export default function StudentRoutePrefetch() {
    const router = useRouter();

    useEffect(() => {
        const timer = window.setTimeout(() => {
            STUDENT_ROUTES.forEach((route) => router.prefetch(route));
        }, 1500);

        return () => window.clearTimeout(timer);
    }, [router]);

    return null;
}
