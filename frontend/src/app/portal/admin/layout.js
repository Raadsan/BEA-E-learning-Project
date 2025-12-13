"use client";

import AdminSidebar from "./AdminSidebar";
import { DarkModeProvider, useDarkMode } from "@/context/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";

function AdminLayoutContent({ children }) {
  const { isDark } = useDarkMode();
  
  return (
    <div 
      className="flex h-screen transition-colors"
      style={isDark ? { background: 'linear-gradient(135deg, #03002e 0%, #050040 50%, #03002e 100%)' } : { backgroundColor: '#f3f4f6' }}
    >
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-64">
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

