"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useDarkMode } from "@/context/ThemeContext";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { isDark } = useDarkMode();
  
  // Check if teacher management is active
  const isTeacherManagementActive = pathname?.startsWith("/portal/admin/teachers");
  
  // Check if student management is active
  const isStudentManagementActive = pathname?.startsWith("/portal/admin/students");
  
  // Check if learning management is active
  const isLearningManagementActive = pathname?.startsWith("/portal/admin/programs") ||
                                     pathname?.startsWith("/portal/admin/subprograms") ||
                                     pathname?.startsWith("/portal/admin/courses") ||
                                     pathname?.startsWith("/portal/admin/classes");
  
  const [isTeacherManagementOpen, setIsTeacherManagementOpen] = useState(isTeacherManagementActive);
  const [isStudentManagementOpen, setIsStudentManagementOpen] = useState(isStudentManagementActive);
  const [isLearningManagementOpen, setIsLearningManagementOpen] = useState(isLearningManagementActive);
  
  // Auto-expand teacher management if active (close others)
  useEffect(() => {
    if (isTeacherManagementActive) {
      setIsTeacherManagementOpen(true);
      setIsStudentManagementOpen(false);
      setIsLearningManagementOpen(false);
    }
  }, [isTeacherManagementActive]);

  // Auto-expand student management if active (close others)
  useEffect(() => {
    if (isStudentManagementActive) {
      setIsStudentManagementOpen(true);
      setIsTeacherManagementOpen(false);
      setIsLearningManagementOpen(false);
    }
  }, [isStudentManagementActive]);

  // Auto-expand learning management if active (close others)
  useEffect(() => {
    if (isLearningManagementActive) {
      setIsLearningManagementOpen(true);
      setIsTeacherManagementOpen(false);
      setIsStudentManagementOpen(false);
    }
  }, [isLearningManagementActive]);

  const teacherManagementSubItems = [
    {
      id: "teacher-list",
      label: "Teacher List",
      href: "/portal/admin/teachers",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    
  
  ];

  const studentManagementSubItems = [
    {
      id: "students",
      label: "Students",
      href: "/portal/admin/students",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ];

  const learningManagementSubItems = [
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
      id: "subprograms",
      label: "Subprograms",
      href: "/portal/admin/subprograms",
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
        <div className="px-4 mb-2"></div>
        
        <ul className="space-y-1 px-3">
          {/* Dashboard */}
          <li>
            <Link
              href="/portal/admin"
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                text-white ${isDark ? 'text-gray-200' : ''} hover:bg-[#f95150] hover:text-white
              `}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-medium text-white">Dashboard</span>
            </Link>
          </li>

          {/* Teacher Management Menu Item */}
          <li>
            <button
              onClick={() => {
                setIsTeacherManagementOpen(!isTeacherManagementOpen);
                setIsStudentManagementOpen(false);
                setIsLearningManagementOpen(false);
              }}
              className={`
                w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200
                text-white ${isDark ? 'text-gray-200' : ''} hover:bg-[#f95150] hover:text-white
              `}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="font-medium text-white text-sm whitespace-nowrap">Teacher Management</span>
              </div>
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${isTeacherManagementOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Teacher Management Sub-items */}
            {isTeacherManagementOpen && (
              <ul className={`mt-1 ml-4 space-y-1 border-l-2 ${isDark ? 'border-gray-700' : 'border-white/20'} pl-2`}>
                {teacherManagementSubItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className={`
                          flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm
                          text-white/80 ${isDark ? 'text-gray-300' : ''} hover:bg-[#f95150] hover:text-white
                        `}
                      >
                        <span className="text-white">
                          {item.icon}
                        </span>
                        <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>

          {/* Student Management Menu Item */}
          <li>
            <button
              onClick={() => {
                setIsStudentManagementOpen(!isStudentManagementOpen);
                setIsTeacherManagementOpen(false);
                setIsLearningManagementOpen(false);
              }}
              className={`
                w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200
                text-white ${isDark ? 'text-gray-200' : ''} hover:bg-[#f95150] hover:text-white
              `}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="font-medium text-white text-sm whitespace-nowrap">Student Management</span>
              </div>
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${isStudentManagementOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Student Management Sub-items */}
            {isStudentManagementOpen && (
              <ul className={`mt-1 ml-4 space-y-1 border-l-2 ${isDark ? 'border-gray-700' : 'border-white/20'} pl-2`}>
                {studentManagementSubItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className={`
                          flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm
                          text-white/80 ${isDark ? 'text-gray-300' : ''} hover:bg-[#f95150] hover:text-white
                        `}
                      >
                        <span className="text-white">
                          {item.icon}
                        </span>
                        <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>

          {/* Academic Management Menu Item */}
          <li>
            <button
              onClick={() => {
                setIsLearningManagementOpen(!isLearningManagementOpen);
                setIsTeacherManagementOpen(false);
                setIsStudentManagementOpen(false);
              }}
              className={`
                w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200
                text-white ${isDark ? 'text-gray-200' : ''} hover:bg-[#f95150] hover:text-white
              `}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-medium text-white text-sm whitespace-nowrap">Academic Management</span>
              </div>
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${isLearningManagementOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Academic Management Sub-items */}
            {isLearningManagementOpen && (
              <ul className={`mt-1 ml-4 space-y-1 border-l-2 ${isDark ? 'border-gray-700' : 'border-white/20'} pl-2`}>
                {learningManagementSubItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className={`
                          flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm
                          text-white/80 ${isDark ? 'text-gray-300' : ''} hover:bg-[#f95150] hover:text-white
                        `}
                      >
                        <span className="text-white">
                          {item.icon}
                        </span>
                        <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>

          {/* Learning Resources */}
          <li>
            <Link
              href="/portal/admin/resources"
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                text-white ${isDark ? 'text-gray-200' : ''} hover:bg-[#f95150] hover:text-white
              `}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium text-white">Learning Resources</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Logout Button */}
      <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-white/20'}`}>
        <button className={`flex items-center gap-3 w-full px-4 py-3 text-white ${isDark ? 'text-gray-200' : ''} hover:bg-[#f95150] rounded-lg transition-all duration-200`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
