"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useDarkMode } from "@/context/ThemeContext";

export default function StudentSidebar() {
  const { isDark } = useDarkMode();
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  return (
    <div className={`fixed left-0 top-0 h-screen w-64 ${isDark ? 'bg-[#000060]' : 'bg-[#010080]'} admin-sidebar text-white flex flex-col shadow-lg transition-colors`}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className={`border-b ${isDark ? 'border-gray-700' : 'border-white/20'} w-full h-24 relative ${isDark ? 'bg-gray-800/50' : 'bg-white/5'} flex items-center justify-center px-2 py-2`}>
          <Image
            src="/images/footerlogo-removebg-preview.png"
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
            href="/portal/student"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive("/portal/student")
                ? 'bg-[#f95150] text-white'
                : 'text-gray-300 hover:bg-[#f95150] hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-sm font-medium">Dashboard</span>
          </Link>

          {/* My Courses */}
          <Link
            href="/portal/student/my-courses"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive("/portal/student/my-courses")
                ? 'bg-[#f95150] text-white'
                : 'text-gray-300 hover:bg-[#f95150] hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-sm font-medium">My Courses</span>
          </Link>

          {/* Browse Courses */}
          <Link
            href="/portal/student/browse-courses"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive("/portal/student/browse-courses")
                ? 'bg-[#f95150] text-white'
                : 'text-gray-300 hover:bg-[#f95150] hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-sm font-medium">Browse Courses</span>
          </Link>

          {/* Assignments */}
          <Link
            href="/portal/student/assignments"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive("/portal/student/assignments")
                ? 'bg-[#f95150] text-white'
                : 'text-gray-300 hover:bg-[#f95150] hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-medium">Assignments</span>
          </Link>

          {/* Certificates */}
          <Link
            href="/portal/student/certificates"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive("/portal/student/certificates")
                ? 'bg-[#f95150] text-white'
                : 'text-gray-300 hover:bg-[#f95150] hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <span className="text-sm font-medium">Certificates</span>
          </Link>

          {/* Community */}
          <Link
            href="/portal/student/community"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive("/portal/student/community")
                ? 'bg-[#f95150] text-white'
                : 'text-gray-300 hover:bg-[#f95150] hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-sm font-medium">Community</span>
          </Link>
        </nav>

        {/* Bottom Section */}
        <div className={`border-t ${isDark ? 'border-gray-700' : 'border-white/20'} p-4 space-y-2`}>
          {/* Settings */}
          <Link
            href="/portal/student/settings"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive("/portal/student/settings")
                ? 'bg-[#f95150] text-white'
                : 'text-gray-300 hover:bg-[#f95150] hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm font-medium">Settings</span>
          </Link>

          {/* Logout */}
          <Link
            href="/login"
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-300 hover:bg-[#f95150] hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-sm font-medium">Logout</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

