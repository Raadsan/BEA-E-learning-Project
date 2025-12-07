"use client";

import AdminSidebar from "./AdminSidebar";
import { DarkModeProvider } from "@/context/ThemeContext";

export default function AdminLayout({ children }) {
  return (
    <DarkModeProvider>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col ml-64">
          {children}
        </div>
      </div>
    </DarkModeProvider>
  );
}

