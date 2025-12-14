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
      router.replace("/auth/login");
      setIsLoading(false);
      return;
    }

    // Quick check: Use cached user data from localStorage for immediate redirect
    const cachedUser = typeof window !== "undefined" 
      ? JSON.parse(localStorage.getItem("user") || "null")
      : null;

    // If we have cached user and allowedRoles, check immediately
    if (cachedUser && allowedRoles.length > 0) {
      if (!allowedRoles.includes(cachedUser.role)) {
        // User doesn't have required role, redirect immediately using cached data
        if (cachedUser.role === "admin") {
          router.replace("/portal/admin");
        } else if (cachedUser.role === "teacher") {
          router.replace("/portal/teacher");
        } else if (cachedUser.role === "student") {
          router.replace("/portal/student");
        } else {
          router.replace("/");
        }
        setIsLoading(false);
        return;
      } else {
        // User has correct role, allow access (don't wait for API call)
        setIsAuthorized(true);
        setIsLoading(false);
        return;
      }
    }

    if (userLoading) {
      setIsLoading(true);
      return;
    }

    if (error || !user) {
      // If API call failed but we have valid cached user, allow access
      if (cachedUser && cachedUser.role && allowedRoles.length > 0) {
        if (allowedRoles.includes(cachedUser.role)) {
          // Valid cached user with correct role, allow access
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }
      }
      
      // No valid cached user or wrong role, redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      router.replace("/auth/login");
      setIsLoading(false);
      return;
    }

    // Final check: Verify with API response
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      // User doesn't have required role, redirect to appropriate portal immediately
      if (user.role === "admin") {
        router.replace("/portal/admin");
      } else if (user.role === "teacher") {
        router.replace("/portal/teacher");
      } else if (user.role === "student") {
        router.replace("/portal/student");
      } else {
        router.replace("/");
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

