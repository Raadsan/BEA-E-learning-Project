"use client";

import { useState, useEffect } from "react";
import StudentSidebar from "./StudentSidebar";
import StudentHeader from "./StudentHeader";
import { DarkModeProvider, useDarkMode } from "@/context/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useRouter } from "next/navigation";

function StudentLayoutContent({ children }) {
  const { isDark } = useDarkMode();
  const router = useRouter();
  const { data: user, isLoading } = useGetCurrentUserQuery();
  const [isApproved, setIsApproved] = useState(false);
  const [isPaid, setIsPaid] = useState(true);

  useEffect(() => {
    if (user && user.approval_status) {
      const approved = user.approval_status === 'approved';
      setIsApproved(approved);

      // Check payment status if approved
      let paid = true;
      if (approved && user.paid_until) {
        const expiryDate = new Date(user.paid_until);
        const today = new Date();
        // Set both to midnight for accurate day comparison
        expiryDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        paid = expiryDate >= today;
      }
      setIsPaid(paid);

      // Restriction Logic
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const baseAllowedPaths = [
          "/portal/student",
          "/portal/student/",
          "/portal/student/profile",
          "/portal/student/payments",
          "/portal/student/payments/upgrade",
          "/portal/student/payments/upgrade/checkout",
          "/portal/student/placement-test",
          "/portal/student/my-certification",
          "/portal/student/student-support",
          "/portal/student/policies",
        ];

        // If NOT approved, can only visit baseAllowedPaths
        if (!approved) {
          const isAllowed = baseAllowedPaths.some((path) =>
            currentPath === path || currentPath.startsWith(path + "/")
          );
          if (!isAllowed) {
            router.replace("/portal/student");
          }
        }
        // If approved but NOT paid, can also only visit baseAllowedPaths
        else if (!paid) {
          const isAllowed = baseAllowedPaths.some((path) =>
            currentPath === path || currentPath.startsWith(path + "/")
          );
          if (!isAllowed) {
            router.replace("/portal/student");
          }
        }
      }
    }
  }, [user, router]);

  // We remove the full-page "isLoading" blocker to provide an "Admin-style" loading experience. 
  // This ensures the sidebar and header stay visible while navigation happens.

  return (
    <div
      className="flex h-screen transition-colors"
      style={isDark ? { background: 'linear-gradient(135deg, #03002e 0%, #050040 50%, #03002e 100%)' } : { backgroundColor: '#f3f4f6' }}
    >
      {/* Sidebar - Always visible, but items depend on approval and payment status */}
      <StudentSidebar isApproved={isApproved} isPaid={isPaid} />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col ml-80`}>
        <StudentHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function StudentLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <DarkModeProvider>
        <StudentLayoutContent>
          {children}
        </StudentLayoutContent>
      </DarkModeProvider>
    </ProtectedRoute>
  );
}

