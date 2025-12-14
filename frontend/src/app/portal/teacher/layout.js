"use client";

import TeacherSidebar from "./TeacherSidebar";
import { DarkModeProvider, useDarkMode } from "@/context/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";

function TeacherLayoutContent({ children }) {
  const { isDark } = useDarkMode();
  
  return (
    <div 
      className="flex h-screen transition-colors"
      style={isDark ? { background: 'linear-gradient(135deg, #03002e 0%, #050040 50%, #03002e 100%)' } : { backgroundColor: '#f3f4f6' }}
    >
      {/* Sidebar */}
      <TeacherSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-64">
        {children}
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

