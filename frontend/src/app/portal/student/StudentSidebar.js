"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useLogoutMutation } from "@/redux/api/authApi";

export default function StudentSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [logout] = useLogoutMutation();

  const isActive = (href) => {
    if (href === "/portal/student") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

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

  // Helper function for menu item classes
  const getMenuItemClasses = (href, exact = false) => {
    const active = exact ? (pathname === href) : isActive(href);
    return `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active ? 'text-white font-semibold' : 'text-gray-900 hover:bg-gray-100'
    }`;
  };

  // Helper function to get active background style for main menu items
  const getActiveStyle = (href, exact = false) => {
    const active = exact ? (pathname === href) : isActive(href);
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
            <Link href="/portal/student" className={getMenuItemClasses("/portal/student", true)} style={getActiveStyle("/portal/student", true)}>
              <svg className={getIconClasses("/portal/student", true)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className={getTextClasses("/portal/student", true)}>Dashboard</span>
            </Link>
          </li>

          {/* My Courses */}
          <li>
            <Link href="/portal/student/my-courses" className={getMenuItemClasses("/portal/student/my-courses")} style={getActiveStyle("/portal/student/my-courses")}>
              <svg className={getIconClasses("/portal/student/my-courses")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className={getTextClasses("/portal/student/my-courses")}>My Courses</span>
            </Link>
          </li>

          {/* Browse Courses */}
          <li>
            <Link href="/portal/student/browse-courses" className={getMenuItemClasses("/portal/student/browse-courses")} style={getActiveStyle("/portal/student/browse-courses")}>
              <svg className={getIconClasses("/portal/student/browse-courses")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className={getTextClasses("/portal/student/browse-courses")}>Browse Courses</span>
            </Link>
          </li>

          {/* Assignments */}
          <li>
            <Link href="/portal/student/assignments" className={getMenuItemClasses("/portal/student/assignments")} style={getActiveStyle("/portal/student/assignments")}>
              <svg className={getIconClasses("/portal/student/assignments")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className={getTextClasses("/portal/student/assignments")}>Assignments</span>
            </Link>
          </li>

          {/* Certificates */}
          <li>
            <Link href="/portal/student/certificates" className={getMenuItemClasses("/portal/student/certificates")} style={getActiveStyle("/portal/student/certificates")}>
              <svg className={getIconClasses("/portal/student/certificates")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <span className={getTextClasses("/portal/student/certificates")}>Certificates</span>
            </Link>
          </li>

          {/* Community */}
          <li>
            <Link href="/portal/student/community" className={getMenuItemClasses("/portal/student/community")} style={getActiveStyle("/portal/student/community")}>
              <svg className={getIconClasses("/portal/student/community")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className={getTextClasses("/portal/student/community")}>Community</span>
            </Link>
          </li>

          {/* Settings */}
          <li>
            <Link href="/portal/student/settings" className={getMenuItemClasses("/portal/student/settings")} style={getActiveStyle("/portal/student/settings")}>
              <svg className={getIconClasses("/portal/student/settings")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className={getTextClasses("/portal/student/settings")}>Settings</span>
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
