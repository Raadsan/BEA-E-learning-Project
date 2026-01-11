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

  useEffect(() => {
    if (user && user.approval_status) {
      setIsApproved(user.approval_status === 'approved');

      // If not approved and trying to access restricted pages, redirect to dashboard.
      // Pending students can only visit: dashboard, profile, and payment history.
      if (user.approval_status !== 'approved' && typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const allowedPaths = [
          "/portal/student",
          "/portal/student/",
          "/portal/student/profile",
          "/portal/student/payments",
          "/portal/student/placement-test",
        ];

        const isAllowed = allowedPaths.some((path) =>
          currentPath === path || currentPath.startsWith(path + "/")
        );

        if (!isAllowed) {
          router.replace("/portal/student");
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
      {/* Sidebar - Always visible, but items depend on approval status */}
      <StudentSidebar isApproved={isApproved} />

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

