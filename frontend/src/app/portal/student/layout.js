"use client";

import { useState, useEffect } from "react";
import StudentSidebar from "./StudentSidebar";
import StudentHeader from "./StudentHeader";
import { DarkModeProvider, useDarkMode } from "@/context/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useRouter } from "next/navigation";

function StudentLayoutContent({ children }) {
  const { isDark } = useDarkMode();
  const router = useRouter();
  const { data: user, isLoading } = useGetCurrentUserQuery();
  const [isApproved, setIsApproved] = useState(false);
  
  useEffect(() => {
    if (user && user.approval_status) {
      setIsApproved(user.approval_status === 'approved');
      
      // If not approved and trying to access other pages, redirect to dashboard
      if (user.approval_status !== 'approved' && typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (currentPath !== '/portal/student' && currentPath !== '/portal/student/') {
          router.replace('/portal/student');
        }
      }
    }
  }, [user, router]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className="flex h-screen transition-colors"
      style={isDark ? { background: 'linear-gradient(135deg, #03002e 0%, #050040 50%, #03002e 100%)' } : { backgroundColor: '#f3f4f6' }}
    >
      {/* Sidebar - Only show if approved */}
      {isApproved && <StudentSidebar />}

      {/* Main Content Area */}
<<<<<<< HEAD
      <div className={`flex-1 flex flex-col ${isApproved ? 'ml-64' : ''}`}>
        {isApproved && <StudentHeader />}
=======
      <div className="flex-1 flex flex-col ml-80">
        <StudentHeader />
>>>>>>> 95511f9e1de13423ced4db06a8193edbf9df3c4b
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

