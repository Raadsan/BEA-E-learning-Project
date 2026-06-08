"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGetCurrentUserQuery } from "@/lib/api/authApi";

const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

const getCachedUser = () => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const redirectByRole = (router, role) => {
  if (role === "admin") {
    router.replace("/portal/admin");
  } else if (role === "teacher") {
    router.replace("/portal/teacher");
  } else if (role === "student" || role === "proficiency_student") {
    router.replace("/portal/student");
  } else {
    router.replace("/");
  }
};

function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#010080]" />
        <p className="mt-3 text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
}

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [clientToken, setClientToken] = useState(null);

  useLayoutEffect(() => {
    setHydrated(true);

    const token = getToken();
    setClientToken(token);

    if (!token) {
      router.replace("/auth/login");
      setIsLoading(false);
      return;
    }

    const cachedUser = getCachedUser();
    if (cachedUser?.role) {
      if (allowedRoles.length > 0 && !allowedRoles.includes(cachedUser.role)) {
        redirectByRole(router, cachedUser.role);
        setIsLoading(false);
        return;
      }

      setIsAuthorized(true);
      setIsLoading(false);
    }
  }, [allowedRoles, router]);

  const { data: user, isLoading: userLoading, error } = useGetCurrentUserQuery(undefined, {
    skip: !hydrated || !clientToken || isAuthorized,
  });

  useEffect(() => {
    if (!hydrated || isAuthorized) return;

    const token = getToken();
    if (!token) return;

    if (userLoading) {
      setIsLoading(true);
      return;
    }

    const cachedUser = getCachedUser();

    if (error || !user) {
      if (cachedUser?.role && (allowedRoles.length === 0 || allowedRoles.includes(cachedUser.role))) {
        setIsAuthorized(true);
        setIsLoading(false);
        return;
      }

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.replace("/auth/login");
      setIsLoading(false);
      return;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      redirectByRole(router, user.role);
      setIsLoading(false);
      return;
    }

    setIsAuthorized(true);
    setIsLoading(false);
  }, [hydrated, isAuthorized, user, userLoading, error, allowedRoles, router]);

  if (!hydrated || isLoading) {
    return <AuthLoading />;
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
