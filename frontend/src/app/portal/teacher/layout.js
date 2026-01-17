"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import TeacherSidebar from "./TeacherSidebar";
import TeacherHeader from "./TeacherHeader";
import { DarkModeProvider, useDarkMode } from "@/context/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";

function TeacherLayoutContent({ children }) {
  const { isDark } = useDarkMode();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Close sidebar on route change for mobile
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div
      className="flex h-screen w-screen overflow-hidden transition-colors"
      style={isDark ? { background: 'linear-gradient(135deg, #03002e 0%, #050040 50%, #03002e 100%)' } : { backgroundColor: '#f3f4f6' }}
    >
      {/* Sidebar */}
      <TeacherSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[45] lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-80 ml-0 transition-all duration-300 min-w-0 overflow-hidden h-full">
        <TeacherHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto pt-20">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function TeacherLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <DarkModeProvider>
        <TeacherLayoutContent>
          {children}
        </TeacherLayoutContent>
      </DarkModeProvider>
    </ProtectedRoute>
  );
}

