"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get token from localStorage
  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  };

  const token = getToken();
  const { data: user, isLoading: userLoading, error } = useGetCurrentUserQuery(
    undefined,
    {
      skip: !token, // Skip query if no token
    }
  );

  useEffect(() => {
    if (!token) {
      // No token, redirect to login
      router.push("/auth/login");
      setIsLoading(false);
      return;
    }

    if (userLoading) {
      setIsLoading(true);
      return;
    }

    if (error || !user) {
      // Invalid token or user not found
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      router.push("/auth/login");
      setIsLoading(false);
      return;
    }

    // Check if user role is allowed
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      // User doesn't have required role, redirect to appropriate portal
      if (user.role === "admin") {
        router.push("/portal/admin");
      } else if (user.role === "teacher") {
        router.push("/portal/teacher");
      } else if (user.role === "student") {
        router.push("/portal/student");
      } else {
        router.push("/");
      }
      setIsLoading(false);
      return;
    }

    setIsAuthorized(true);
    setIsLoading(false);
  }, [user, userLoading, error, allowedRoles, router, token]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect, so return nothing
  }

  return <>{children}</>;
}

