"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useLogoutMutation } from "@/redux/api/authApi";

export default function TeacherSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [logout] = useLogoutMutation();
  const [isMyClassesOpen, setIsMyClassesOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      router.replace("/auth/login");
    } catch (error) {
      // Even if logout fails, clear local storage and redirect
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      router.replace("/auth/login");
    }
  };

  // Auto-expand dropdowns based on current route
  useEffect(() => {
    if (pathname?.includes("/portal/teacher/my-classes")) {
      setIsMyClassesOpen(true);
    }
  }, [pathname]);

  const handleMyClassesToggle = () => {
    setIsMyClassesOpen(!isMyClassesOpen);
  };

  const isActive = (href) => {
    if (href === "/portal/teacher") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  // Helper function for menu item classes
  const getMenuItemClasses = (href, exact = false) => {
    const active = exact ? (pathname === href) : isActive(href);
    return `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active ? 'text-white font-semibold' : 'text-gray-900 hover:bg-gray-100'
    }`;
  };

  const getSubMenuItemClasses = (href) => {
    const active = isActive(href);
    return `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
      active ? 'text-white font-semibold' : 'text-gray-700 hover:bg-gray-100'
    }`;
  };

  // Helper function to get active background style for main menu items
  const getActiveStyle = (href, exact = false) => {
    const active = exact ? (pathname === href) : isActive(href);
    return active ? { backgroundColor: '#010080' } : {};
  };

  // Helper function to get active background style for sub-menu items
  const getSubActiveStyle = (href) => {
    const active = isActive(href);
    return active ? { backgroundColor: '#010080' } : {};
  };

  const getIconClasses = (href, exact = false) => {
    const active = exact ? (pathname === href) : isActive(href);
    return `w-5 h-5 ${active ? 'text-white' : 'text-gray-700'}`;
  };

  const getTextClasses = (href, exact = false) => {
    const active = exact ? (pathname === href) : isActive(href);
    return `font-medium text-sm ${active ? 'text-white' : 'text-gray-900'}`;
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm overflow-y-auto">
      {/* Logo Section */}
      <div className="border-b border-gray-200 w-full h-24 relative bg-white flex items-center justify-center px-4 py-2 flex-shrink-0">
        <Image
          src="/images/headerlogo.png"
          alt="BEA THE BLUEPRINT ENGLISH ACADEMY"
          width={1024}
          height={384}
          className="h-full w-full object-contain max-w-full"
          priority
          style={{ width: '100%', height: 'auto' }}
        />
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        <ul className="space-y-0.5">
          {/* Dashboard */}
          <li>
            <Link href="/portal/teacher" className={getMenuItemClasses("/portal/teacher", true)} style={getActiveStyle("/portal/teacher", true)}>
              <svg className={getIconClasses("/portal/teacher", true)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className={getTextClasses("/portal/teacher", true)}>Dashboard</span>
            </Link>
          </li>

          {/* My Classes Dropdown */}
          <li>
            <button
              onClick={handleMyClassesToggle}
              className={`
                w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${isMyClassesOpen || isActive("/portal/teacher/my-classes") ? 'text-white font-semibold' : 'text-gray-900 hover:bg-gray-100'}
              `}
              style={isMyClassesOpen || isActive("/portal/teacher/my-classes") ? { backgroundColor: '#010080' } : {}}
            >
              <div className="flex items-center gap-3">
                <svg className={`w-5 h-5 ${isMyClassesOpen || isActive("/portal/teacher/my-classes") ? 'text-white' : 'text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-medium text-sm">My Classes</span>
              </div>
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${isMyClassesOpen ? 'rotate-180' : ''} ${isMyClassesOpen || isActive("/portal/teacher/my-classes") ? 'text-white' : 'text-gray-700'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* My Classes Sub-items */}
            {isMyClassesOpen && (
              <ul className="mt-1 ml-4 space-y-1 border-l-2 border-gray-200 pl-2">
                <li>
                  <Link 
                    href="/portal/teacher/my-classes" 
                    className={getSubMenuItemClasses("/portal/teacher/my-classes")}
                    style={getSubActiveStyle("/portal/teacher/my-classes")}
                  >
                    <svg className={`w-4 h-4 ${isActive("/portal/teacher/my-classes") ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <span className={isActive("/portal/teacher/my-classes") ? 'text-white' : 'text-gray-900'}>Class List</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Attendance */}
          <li>
            <Link href="/portal/teacher/attendance" className={getMenuItemClasses("/portal/teacher/attendance")} style={getActiveStyle("/portal/teacher/attendance")}>
              <svg className={getIconClasses("/portal/teacher/attendance")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className={getTextClasses("/portal/teacher/attendance")}>Attendance</span>
            </Link>
          </li>

          {/* Classes & Courses */}
          <li>
            <Link href="/portal/teacher/classes-courses" className={getMenuItemClasses("/portal/teacher/classes-courses")} style={getActiveStyle("/portal/teacher/classes-courses")}>
              <svg className={getIconClasses("/portal/teacher/classes-courses")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className={getTextClasses("/portal/teacher/classes-courses")}>Classes & Courses</span>
            </Link>
          </li>

          {/* Student Progress */}
          <li>
            <Link href="/portal/teacher/student-progress" className={getMenuItemClasses("/portal/teacher/student-progress")} style={getActiveStyle("/portal/teacher/student-progress")}>
              <svg className={getIconClasses("/portal/teacher/student-progress")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className={getTextClasses("/portal/teacher/student-progress")}>Student Progress</span>
            </Link>
          </li>

          {/* Reports */}
          <li>
            <Link href="/portal/teacher/reports" className={getMenuItemClasses("/portal/teacher/reports")} style={getActiveStyle("/portal/teacher/reports")}>
              <svg className={getIconClasses("/portal/teacher/reports")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className={getTextClasses("/portal/teacher/reports")}>Reports</span>
            </Link>
          </li>

          {/* Settings */}
          <li>
            <Link href="/portal/teacher/settings" className={getMenuItemClasses("/portal/teacher/settings")} style={getActiveStyle("/portal/teacher/settings")}>
              <svg className={getIconClasses("/portal/teacher/settings")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className={getTextClasses("/portal/teacher/settings")}>Settings</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200 mt-auto">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
