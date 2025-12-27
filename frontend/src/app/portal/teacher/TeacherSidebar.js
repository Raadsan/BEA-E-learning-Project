"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useDarkMode } from "@/context/ThemeContext";

export default function TeacherSidebar() {
  const { isDark } = useDarkMode();
  const pathname = usePathname();
  const [isMyClassesOpen, setIsMyClassesOpen] = useState(false);

  // Auto-expand dropdowns based on current route
  useEffect(() => {
    if (pathname?.includes("/portal/teacher/my-classes")) {
      setIsMyClassesOpen(true);
    }
  }, [pathname]);

  const handleMyClassesToggle = () => {
    setIsMyClassesOpen(!isMyClassesOpen);
  };

  const isActive = (path) => pathname === path;
  const isMyClassesActive = pathname?.includes("/portal/teacher/my-classes");

  return (
    <div className={`fixed left-0 top-0 h-screen w-80 ${isDark ? 'bg-[#000060] text-white' : 'bg-white text-gray-900'} admin-sidebar flex flex-col shadow-lg transition-colors`}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} w-full h-24 relative ${isDark ? 'bg-gray-800/50' : 'bg-white'} flex items-center justify-center px-2 py-2`}>
          <Image
            src="/images/headerlogo.png"
            alt="BEA Logo"
            width={200}
            height={80}
            className="object-contain"
            priority
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* Dashboard */}
          <Link
            href="/portal/teacher"
            className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive("/portal/teacher") || (pathname === "/portal/teacher" && !pathname.includes("/portal/teacher/"))
                ? 'bg-[#010080] text-white'
                : isDark
                  ? 'text-gray-300 hover:bg-[#010080] hover:text-white'
                  : 'text-gray-700 hover:bg-[#010080] hover:text-white'
              }`}
          >
            <svg className={`w-5 h-5 ${isActive("/portal/teacher") ? 'text-white' : 'text-[#010080]'} group-hover:text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Dashboard</span>
          </Link>

          {/* Announcements */}
          <Link
            href="/portal/teacher/announcements"
            className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive("/portal/teacher/announcements")
                ? 'bg-[#f95150] text-white'
                : isDark
                  ? 'text-gray-300 hover:bg-[#010080] hover:text-white'
                  : 'text-gray-700 hover:bg-[#010080] hover:text-white'
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            <span>Announcements</span>
          </Link>

          {/* My Classes Dropdown */}
          <div>
            <button
              onClick={handleMyClassesToggle}
              className={`group w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors ${isMyClassesActive || isMyClassesOpen
                  ? 'bg-[#f95150] text-white'
                  : isDark
                    ? 'text-gray-300 hover:bg-[#010080] hover:text-white'
                    : 'text-gray-700 hover:bg-[#010080] hover:text-white'
                }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>My Classes</span>
              </div>
              <svg
                className={`w-4 h-4 transition-transform ${isMyClassesOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isMyClassesOpen && (
              <div className="ml-4 mt-2 space-y-1">
                <Link
                  href="/portal/teacher/my-classes"
                  className={`group block px-4 py-2 rounded-lg text-sm transition-colors ${isActive("/portal/teacher/my-classes")
                      ? 'bg-[#f95150] text-white'
                      : isDark
                        ? 'text-gray-400 hover:bg-[#010080] hover:text-white'
                        : 'text-gray-700 hover:bg-[#010080] hover:text-white'
                    }`}
                >
                  Class List
                </Link>
              </div>
            )}
          </div>

          {/* Attendance */}
          <Link
            href="/portal/teacher/attendance"
            className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive("/portal/teacher/attendance")
                ? 'bg-[#f95150] text-white'
                : isDark
                  ? 'text-gray-300 hover:bg-[#010080] hover:text-white'
                  : 'text-gray-700 hover:bg-[#010080] hover:text-white'
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Attendance</span>
          </Link>

          {/* Classes & Courses */}
          <Link
            href="/portal/teacher/classes-courses"
            className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive("/portal/teacher/classes-courses")
                ? 'bg-[#f95150] text-white'
                : isDark
                  ? 'text-gray-300 hover:bg-[#010080] hover:text-white'
                  : 'text-gray-700 hover:bg-[#010080] hover:text-white'
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Classes & Courses</span>
          </Link>

          {/* Student Progress */}
          <Link
            href="/portal/teacher/student-progress"
            className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive("/portal/teacher/student-progress")
                ? 'bg-[#f95150] text-white'
                : isDark
                  ? 'text-gray-300 hover:bg-[#010080] hover:text-white'
                  : 'text-gray-700 hover:bg-[#010080] hover:text-white'
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Student Progress</span>
          </Link>

          {/* Reports */}
          <Link
            href="/portal/teacher/reports"
            className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive("/portal/teacher/reports")
                ? 'bg-[#f95150] text-white'
                : isDark
                  ? 'text-gray-300 hover:bg-[#010080] hover:text-white'
                  : 'text-gray-700 hover:bg-[#010080] hover:text-white'
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Reports</span>
          </Link>

          {/* Separator */}
          <div className="border-t border-blue-800/50 my-2"></div>

          {/* Settings */}
          <Link
            href="/portal/teacher/settings"
            className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive("/portal/teacher/settings")
                ? 'bg-[#f95150] text-white'
                : isDark
                  ? 'text-gray-300 hover:bg-[#010080] hover:text-white'
                  : 'text-gray-700 hover:bg-[#010080] hover:text-white'
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Settings</span>
          </Link>

          {/* Logout */}
          <Link
            href="/auth/login"
            className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isDark
                ? 'text-gray-300 hover:bg-[#010080] hover:text-white'
                : 'text-gray-700 hover:bg-[#010080] hover:text-white'
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}

