"use client";

import AdminSidebar from "./AdminSidebar";
import { DarkModeProvider, useDarkMode } from "@/context/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";

function AdminLayoutContent({ children }) {
  const { isDark } = useDarkMode();

  return (
    <div className="flex h-screen w-screen overflow-hidden transition-colors bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-80 min-w-0 overflow-hidden">
        {children}
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

