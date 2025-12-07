"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useDarkMode } from "@/context/ThemeContext";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { isDark } = useDarkMode();
  
  // Check if any management sub-item is active
  const isManagementActive = pathname?.startsWith("/portal/admin/teachers") ||
                             pathname?.startsWith("/portal/admin/students");
  
  // Check if any program/course management sub-item is active
  const isProgramCourseActive = pathname?.startsWith("/portal/admin/programs") ||
                                pathname?.startsWith("/portal/admin/courses") ||
                                pathname?.startsWith("/portal/admin/classes");
  
  // Check if any configurations sub-item is active
  const isConfigurationsActive = pathname?.startsWith("/portal/admin/configurations");
  
  const [isManagementOpen, setIsManagementOpen] = useState(isManagementActive);
  const [isProgramCourseOpen, setIsProgramCourseOpen] = useState(isProgramCourseActive);
  const [isConfigurationsOpen, setIsConfigurationsOpen] = useState(isConfigurationsActive);
  
  // Auto-expand management if any sub-item is active (close others)
  useEffect(() => {
    if (isManagementActive) {
      setIsManagementOpen(true);
      setIsProgramCourseOpen(false);
      setIsConfigurationsOpen(false);
    }
  }, [isManagementActive]);

  // Auto-expand program/course management if any sub-item is active (close others)
  useEffect(() => {
    if (isProgramCourseActive) {
      setIsProgramCourseOpen(true);
      setIsManagementOpen(false);
      setIsConfigurationsOpen(false);
    }
  }, [isProgramCourseActive]);

  // Auto-expand configurations if any sub-item is active (close others)
  useEffect(() => {
    if (isConfigurationsActive) {
      setIsConfigurationsOpen(true);
      setIsManagementOpen(false);
      setIsProgramCourseOpen(false);
    }
  }, [isConfigurationsActive]);

  const managementSubItems = [
    {
      id: "teacher-management",
      label: "Teachers",
      href: "/portal/admin/teachers",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      id: "student-management",
      label: "Students",
      href: "/portal/admin/students",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ];

  const programCourseSubItems = [
    {
      id: "programs",
      label: "Programs",
      href: "/portal/admin/programs",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: "courses",
      label: "Course",
      href: "/portal/admin/courses",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      id: "class",
      label: "Class",
      href: "/portal/admin/classes",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
  ];

  const configurationsSubItems = [
    {
      id: "users",
      label: "Users",
      href: "/portal/admin/configurations/users",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ];

  const isActive = (href) => {
    if (href === "/portal/admin") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className={`fixed left-0 top-0 h-screen w-64 ${isDark ? 'bg-[#000060]' : 'bg-[#010080]'} admin-sidebar text-white flex flex-col shadow-lg transition-colors`}>
      {/* Logo Section */}
      <div className={`border-b ${isDark ? 'border-gray-700' : 'border-white/20'} w-full h-24 relative ${isDark ? 'bg-gray-800/50' : 'bg-white/5'} flex items-center justify-center px-2 py-2`}>
        <Image
          src="/images/footerlogo-removebg-preview.png"
          alt="BEA THE BLUEPRINT ENGLISH ACADEMY"
          width={1024}
          height={384}
          className="h-full w-full object-contain max-w-full"
          priority
          style={{ width: '100%', height: 'auto' }}
        />
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-2">
          {/* <div className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-2">
            Dashboard
          </div> */}
        </div>
        
        <ul className="space-y-1 px-3">
          {/* Dashboard */}
          <li>
            <Link
              href="/portal/admin"
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                text-white ${isDark ? 'text-gray-200' : ''} hover:bg-black/20 ${isDark ? 'hover:bg-gray-800' : ''} hover:text-white
              `}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-medium text-white">Dashboard</span>
            </Link>
          </li>

          {/* Management Menu Item */}
          <li>
            <button
              onClick={() => {
                setIsManagementOpen(!isManagementOpen);
                setIsProgramCourseOpen(false);
                setIsConfigurationsOpen(false);
              }}
              className={`
                w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200
                text-white ${isDark ? 'text-gray-200' : ''} hover:bg-black/20 ${isDark ? 'hover:bg-gray-800' : ''} hover:text-white
              `}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span className="font-medium text-white text-sm whitespace-nowrap">Members Management</span>
              </div>
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${isManagementOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Management Sub-items */}
            {isManagementOpen && (
              <ul className={`mt-1 ml-4 space-y-1 border-l-2 ${isDark ? 'border-gray-700' : 'border-white/20'} pl-2`}>
                {managementSubItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className={`
                          flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm
                          text-white/80 ${isDark ? 'text-gray-300' : ''} hover:bg-black/20 ${isDark ? 'hover:bg-gray-800' : ''} hover:text-white
                        `}
                      >
                        <span className="text-white">
                          {item.icon}
                        </span>
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>

          {/* Program / Course Management Menu Item */}
          <li>
            <button
              onClick={() => {
                setIsProgramCourseOpen(!isProgramCourseOpen);
                setIsManagementOpen(false);
                setIsConfigurationsOpen(false);
              }}
              className={`
                w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200
                text-white ${isDark ? 'text-gray-200' : ''} hover:bg-black/20 ${isDark ? 'hover:bg-gray-800' : ''} hover:text-white
              `}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-medium text-white text-sm whitespace-nowrap">Learning Management</span>
              </div>
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${isProgramCourseOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Program / Course Management Sub-items */}
            {isProgramCourseOpen && (
              <ul className={`mt-1 ml-4 space-y-1 border-l-2 ${isDark ? 'border-gray-700' : 'border-white/20'} pl-2`}>
                {programCourseSubItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className={`
                          flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm
                          text-white/80 ${isDark ? 'text-gray-300' : ''} hover:bg-black/20 ${isDark ? 'hover:bg-gray-800' : ''} hover:text-white
                        `}
                      >
                        <span className="text-white">
                          {item.icon}
                        </span>
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>

          {/* Configurations Menu Item */}
          <li>
            <button
              onClick={() => {
                setIsConfigurationsOpen(!isConfigurationsOpen);
                setIsManagementOpen(false);
                setIsProgramCourseOpen(false);
              }}
              className={`
                w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200
                text-white ${isDark ? 'text-gray-200' : ''} hover:bg-black/20 ${isDark ? 'hover:bg-gray-800' : ''} hover:text-white
              `}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium text-white">Configurations</span>
              </div>
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${isConfigurationsOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Configurations Sub-items */}
            {isConfigurationsOpen && (
              <ul className={`mt-1 ml-4 space-y-1 border-l-2 ${isDark ? 'border-gray-700' : 'border-white/20'} pl-2`}>
                {configurationsSubItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className={`
                          flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm
                          text-white/80 ${isDark ? 'text-gray-300' : ''} hover:bg-black/20 ${isDark ? 'hover:bg-gray-800' : ''} hover:text-white
                        `}
                      >
                        <span className="text-white">
                          {item.icon}
                        </span>
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>

          {/* Resources */}
          <li>
            <Link
              href="/portal/admin/resources"
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                text-white ${isDark ? 'text-gray-200' : ''} hover:bg-black/20 ${isDark ? 'hover:bg-gray-800' : ''} hover:text-white
              `}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium text-white">Resources</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Logout Button */}
      <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-white/20'}`}>
        <button className={`flex items-center gap-3 w-full px-4 py-3 text-white ${isDark ? 'text-gray-200' : ''} hover:bg-black/20 ${isDark ? 'hover:bg-gray-800' : ''} rounded-lg transition-all duration-200`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

