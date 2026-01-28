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
  const [isTestExpired, setIsTestExpired] = useState(false);

  useEffect(() => {
    // Close sidebar on route change for mobile
    setIsSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (user && user.approval_status) {
      const approved = user.approval_status.toLowerCase() === 'approved';
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

      // Check if test window is expired
      const updateExpiryStatus = () => {
        // Proficiency-Only students (role: proficiency_student or program: proficiency test) 
        // are excluded from 24h block.
        const prog = (user?.chosen_program || user?.program || "").toString().toLowerCase();
        const isProficiencyOnly = prog.trim() === "proficiency test" || user?.role === 'proficiency_student';

        if (isProficiencyOnly) {
          setIsTestExpired(false);
          return;
        }

        if (user.expiry_date) {
          const getParsedExpiry = (dateVal) => {
            if (!dateVal) return null;
            if (dateVal instanceof Date) return dateVal;
            const dStr = dateVal.toString();
            const isoStr = dStr.includes('T') ? dStr : dStr.replace(' ', 'T');
            const finalStr = isoStr.includes('Z') || isoStr.includes('+') ? isoStr : `${isoStr}Z`;
            const d = new Date(finalStr);
            return isNaN(d.getTime()) ? null : d;
          };

          const expiry = getParsedExpiry(user.expiry_date);
          if (expiry) {
            setIsTestExpired(new Date() > expiry);
          }
        }
      };

      updateExpiryStatus();
      const expiryInterval = setInterval(updateExpiryStatus, 60000); // Check every minute

      // Restriction Logic (keep existing)
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

      return () => clearInterval(expiryInterval);
    }
  }, [user, router]);

  return (
    <div
      className="flex h-screen transition-colors overflow-hidden"
      style={isDark ? { background: 'linear-gradient(135deg, #03002e 0%, #050040 50%, #03002e 100%)' } : { backgroundColor: '#f3f4f6' }}
    >
      {/* Sidebar - Always visible on desktop, toggleable on mobile */}
      <StudentSidebar
        isApproved={isApproved}
        isPaid={isPaid}
        isTestExpired={isTestExpired}
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

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
    <ProtectedRoute allowedRoles={['student', 'proficiency_student']}>
      <DarkModeProvider>
        <StudentLayoutContent>

          {children}
        </StudentLayoutContent>
      </DarkModeProvider>
    </ProtectedRoute>
  );
}

