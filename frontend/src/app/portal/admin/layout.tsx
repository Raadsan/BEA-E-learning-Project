"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import { DarkModeProvider, useDarkMode } from "@/context/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import PortalNavProgress from "@/components/PortalNavProgress";
import { usePortalNavFeedback } from "@/hooks/usePortalNavFeedback";
import AdminAccessGuard from "@/components/admin/AdminAccessGuard";
import AdminRoutePrefetch from "@/components/admin/AdminRoutePrefetch";

function AdminLayoutContent({ children }) {
  const { isDark } = useDarkMode();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { isNavigating, startNavigation } = usePortalNavFeedback(pathname);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen w-screen overflow-hidden transition-colors bg-gray-50 dark:bg-gray-900">
      <AdminRoutePrefetch />
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
        <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} onNavigate={startNavigation} />
        <PortalNavProgress show={isNavigating} />
        <main className="flex-1 overflow-y-auto pt-20">
          <AdminAccessGuard>
            {children}
          </AdminAccessGuard>
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

