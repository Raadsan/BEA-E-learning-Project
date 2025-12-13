"use client";

import AdminSidebar from "./AdminSidebar";
import { DarkModeProvider, useDarkMode } from "@/context/ThemeContext";

function AdminLayoutContent({ children }) {
  const { isDark } = useDarkMode();
  
  return (
    <div className="flex h-screen transition-colors bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-80">
        {children}
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <DarkModeProvider>
      <AdminLayoutContent>
        {children}
      </AdminLayoutContent>
    </DarkModeProvider>
  );
}

