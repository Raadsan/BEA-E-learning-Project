"use client";

import StudentSidebar from "./StudentSidebar";
import StudentHeader from "./StudentHeader";
import { DarkModeProvider, useDarkMode } from "@/context/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";

function StudentLayoutContent({ children }) {
  const { isDark } = useDarkMode();
  
  return (
    <div 
      className="flex h-screen transition-colors"
      style={isDark ? { background: 'linear-gradient(135deg, #03002e 0%, #050040 50%, #03002e 100%)' } : { backgroundColor: '#f3f4f6' }}
    >
      {/* Sidebar */}
      <StudentSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-80">
        <StudentHeader />
        <main className="flex-1 overflow-y-auto">
          {children}
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

