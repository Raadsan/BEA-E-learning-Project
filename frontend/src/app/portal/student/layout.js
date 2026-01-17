"use client";

import { useState, useEffect } from "react";
import StudentSidebar from "./StudentSidebar";
import StudentHeader from "./StudentHeader";
import { DarkModeProvider, useDarkMode } from "@/context/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useRouter, usePathname } from "next/navigation";

function StudentLayoutContent({ children }) {
  const { isDark } = useDarkMode();
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, isLoading } = useGetCurrentUserQuery();
  const [isApproved, setIsApproved] = useState(false);
  const [isPaid, setIsPaid] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Close sidebar on route change for mobile
    setIsSidebarOpen(false);
  }, [pathname]);

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

  return (
    <div
      className="flex h-screen transition-colors overflow-hidden"
      style={isDark ? { background: 'linear-gradient(135deg, #03002e 0%, #050040 50%, #03002e 100%)' } : { backgroundColor: '#f3f4f6' }}
    >
      {/* Sidebar - Always visible on desktop, toggleable on mobile */}
      <StudentSidebar isApproved={isApproved} isPaid={isPaid} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[45] lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col lg:ml-80 ml-0 transition-all duration-300 min-w-0 h-full`}>
        <StudentHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto w-full">
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

