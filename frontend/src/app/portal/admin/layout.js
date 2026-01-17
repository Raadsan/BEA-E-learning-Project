"use client";

import AdminSidebar from "./AdminSidebar";
import { DarkModeProvider, useDarkMode } from "@/context/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import AdminHeader from "@/app/portal/admin/AdminHeader";

function AdminLayoutContent({ children }) {
  const { isDark } = useDarkMode();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Close sidebar on route change for mobile
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen w-screen overflow-hidden transition-colors bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - Always visible on desktop, toggleable on mobile */}
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[45] lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-80 ml-0 transition-all duration-300 min-w-0 overflow-hidden h-full">
        <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto pt-20">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DarkModeProvider>
        <AdminLayoutContent>
          {children}
        </AdminLayoutContent>
      </DarkModeProvider>
    </ProtectedRoute>
  );
}

