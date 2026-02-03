"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useDarkMode } from "@/context/ThemeContext";
import { useLogoutMutation } from "@/redux/api/authApi";

export default function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isDark } = useDarkMode();
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      router.replace("/auth/login");
    } catch (error) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      router.replace("/auth/login");
    }
  };

  // State for all collapsible sections - only one can be open at a time
  const [openSection, setOpenSection] = useState(null);
  const [openSubSection, setOpenSubSection] = useState(null);

  // Auto-open sections based on current path
  useEffect(() => {
    if (pathname?.includes("students-requests")) {
      setOpenSection('studentRequests');
      setOpenSubSection(null);
    } else if (pathname?.startsWith("/portal/admin/students")) {
      setOpenSection('studentManagement');
      if (pathname?.includes('/general')) {
        setOpenSubSection('generalStudents');
      } else if (pathname?.includes('/ielts')) {
        setOpenSubSection('ieltsStudents');
      } else {
        setOpenSubSection(null);
      }
    } else if (pathname?.startsWith("/portal/admin/teachers")) {
      setOpenSection('teacherManagement');
      setOpenSubSection(null);
    } else if (pathname?.startsWith("/portal/admin/programs") ||
      pathname?.startsWith("/portal/admin/subprograms") ||
      pathname?.startsWith("/portal/admin/certificates") ||
      pathname?.startsWith("/portal/admin/courses") ||
      pathname?.includes("/learning-resources/materials")) {
      setOpenSection('academicManagement');
      setOpenSubSection(null);
    } else if (pathname?.startsWith("/portal/admin/classes") ||
      pathname?.startsWith("/portal/admin/learning-resources/timetable") ||
      pathname?.startsWith("/portal/admin/learning-resources/sessions") ||
      pathname?.startsWith("/portal/admin/shifts") ||
      pathname?.startsWith("/portal/admin/learning-resources")) {
      setOpenSection('learningResources');
      setOpenSubSection(null);
    } else if (pathname?.startsWith("/portal/admin/assessments")) {
      setOpenSection('assessments');
      if (pathname?.includes('placement-tests')) {
        setOpenSubSection('placementTests');
      } else if (pathname?.includes('professional-tests')) {
        setOpenSubSection('professionalTests');
      } else if (pathname?.includes('assignments')) {
        setOpenSubSection('assignments');
      } else if (pathname?.includes('exams')) {
        setOpenSubSection('exams');
      } else {
        setOpenSubSection(null);
      }
    } else if (pathname?.startsWith("/portal/admin/payments")) {
      setOpenSection('payments');
      if (pathname === '/portal/admin/payments/packages') {
        setOpenSubSection('paymentPackages');
      } else {
        setOpenSubSection(null);
      }
    } else if (pathname?.startsWith("/portal/admin/communication")) {
      setOpenSection('communication');
      setOpenSubSection(null);
    } else if (pathname?.startsWith("/portal/admin/reports")) {
      setOpenSection('reports');
      setOpenSubSection(null);
    } else if (pathname?.startsWith("/portal/admin/reviews")) {
      setOpenSection('reviews');
      if (pathname.includes('/teacher-')) {
        setOpenSubSection('reviewTeacher');
      } else if (pathname.includes('/student-')) {
        setOpenSubSection('reviewStudent');
      } else {
        setOpenSubSection(null);
      }
    } else {
      setOpenSection(null);
      setOpenSubSection(null);
    }
  }, [pathname]);

  const toggleSection = (section) => {
    if (openSection === section) {
      setOpenSection(null);
      setOpenSubSection(null);
    } else {
      setOpenSection(section);
      setOpenSubSection(null);
    }
  };

  const toggleSubSection = (subSection) => {
    if (openSubSection === subSection) {
      setOpenSubSection(null);
    } else {
      setOpenSubSection(subSection);
    }
  };

  const isActive = (href) => {
    if (href === "/portal/admin") {
      return pathname === href;
    }
    // For /portal/admin/students, only active if exact match (not /general or /ielts-toefl)
    if (href === "/portal/admin/students") {
      return pathname === href || pathname === href + "/";
    }
    return pathname?.startsWith(href);
  };

  // Helper function for menu item classes
  const getMenuItemClasses = (href, exact = false) => {
    const active = exact ? (pathname === href) : isActive(href);
    return `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${active
      ? 'text-white font-semibold'
      : 'text-gray-100 hover:bg-white/10 hover:text-white'
      }`;
  };

  const getSubMenuItemClasses = (href) => {
    const active = isActive(href);
    return `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${active
      ? 'text-white font-semibold'
      : 'text-gray-300 hover:bg-white/10 hover:text-white'
      }`;
  };

  // Helper function to get active background style for main menu items
  const getActiveStyle = (href, exact = false) => {
    const active = exact ? (pathname === href) : isActive(href);
    return active ? { backgroundColor: '#FF4D4D' } : {};
  };

  // Helper function to get active background style for sub-menu items
  const getSubActiveStyle = (href) => {
    const active = isActive(href);
    return active ? { backgroundColor: '#FF4D4D' } : {};
  };

  // Helper function to get active background style for dropdown buttons
  const getDropdownButtonStyle = (sectionId) => {
    return openSection === sectionId ? { backgroundColor: '#FF4D4D', color: '#ffffff' } : {};
  };

  const getDropdownButtonClasses = (sectionId) => {
    const isOpen = openSection === sectionId;
    return `w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isOpen
      ? 'text-white font-semibold'
      : 'text-gray-100 hover:bg-white/10 hover:text-white'
      }`;
  };

  const getIconClasses = (href, exact = false) => {
    const active = exact ? (pathname === href) : isActive(href);
    return `w-5 h-5 ${active ? 'text-white' : 'text-gray-100'}`;
  };

  const getTextClasses = (href, exact = false) => {
    const active = exact ? (pathname === href) : isActive(href);
    return `font-medium text-sm ${active ? 'text-white' : 'text-gray-100'}`;
  };

  return (
    <div className={`fixed left-0 top-0 h-screen w-80 bg-[#010080] border-r border-blue-900 flex flex-col shadow-sm overflow-y-auto transition-transform duration-300 lg:translate-x-0 z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Logo Section */}
      <div className="border-b border-blue-900 w-full h-32 lg:h-24 relative bg-[#010080] flex items-center justify-between px-4 py-2 flex-shrink-0">
        <div className="h-full flex items-center justify-start relative flex-grow overflow-hidden">
          <Image
            src="/images/headerlogo.png"
            alt="BEA THE BLUEPRINT ENGLISH ACADEMY"
            width={1024}
            height={384}
            className="h-full w-auto object-contain object-left brightness-0 invert"
            priority
            style={{ width: '100%', height: 'auto' }}
          />
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 ml-4"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        <ul className="space-y-0.5">
          {/* Dashboard */}
          <li>
            <Link href="/portal/admin" className={getMenuItemClasses("/portal/admin", true)} style={getActiveStyle("/portal/admin", true)}>
              <svg className={getIconClasses("/portal/admin", true)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className={getTextClasses("/portal/admin", true)}>Dashboard</span>
            </Link>
          </li>

          {/* Users */}
          <li>
            <Link href="/portal/admin/users" className={getMenuItemClasses("/portal/admin/users")} style={getActiveStyle("/portal/admin/users")}>
              <svg className={getIconClasses("/portal/admin/users")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className={getTextClasses("/portal/admin/users")}>Users</span>
            </Link>
          </li>

          {/* Admins */}
          <li>
            <Link href="/portal/admin/admins" className={getMenuItemClasses("/portal/admin/admins")} style={getActiveStyle("/portal/admin/admins")}>
              <svg className={getIconClasses("/portal/admin/admins")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className={getTextClasses("/portal/admin/admins")}>Admins</span>
            </Link>
          </li>

          {/* Student Management */}
          <li>
            <button
              onClick={() => toggleSection('studentManagement')}
              className={getDropdownButtonClasses('studentManagement')}
              style={getDropdownButtonStyle('studentManagement')}
            >
              <div className="flex items-center gap-3">
                <svg className={`w-5 h-5 ${openSection === 'studentManagement' ? 'text-white' : 'text-gray-100'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className={`font-medium text-sm ${openSection === 'studentManagement' ? 'text-white' : 'text-gray-100'}`}>Student Management</span>
              </div>
              <svg className={`w-4 h-4 ${openSection === 'studentManagement' ? 'text-white' : 'text-gray-100'} transition-transform duration-200 ${openSection === 'studentManagement' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openSection === 'studentManagement' && (
              <ul className="mt-1 ml-4 space-y-1 border-l-2 border-white/20 pl-2">
                <li>
                  <Link
                    href="/portal/admin/students"
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${(pathname === "/portal/admin/students" || pathname === "/portal/admin/students/")
                      ? 'text-white font-semibold'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    style={(pathname === "/portal/admin/students" || pathname === "/portal/admin/students/") ? getSubActiveStyle("/portal/admin/students") : {}}
                  >
                    <svg className={`w-4 h-4 ${(pathname === "/portal/admin/students" || pathname === "/portal/admin/students/") ? 'text-white' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <span className={(pathname === "/portal/admin/students" || pathname === "/portal/admin/students/") ? 'text-white' : 'text-gray-100'}>All Students</span>
                  </Link>
                </li>
                <li>
                  <Link href="/portal/admin/students/general" className={getSubMenuItemClasses("/portal/admin/students/general")} style={getSubActiveStyle("/portal/admin/students/general")}>
                    <svg className={`w-4 h-4 ${isActive("/portal/admin/students/general") ? 'text-white' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className={isActive("/portal/admin/students/general") ? 'text-white' : 'text-gray-100'}>General Program Students</span>
                  </Link>
                </li>
                <li>
                  <Link href="/portal/admin/students/ielts-toefl" className={getSubMenuItemClasses("/portal/admin/students/ielts-toefl")} style={getSubActiveStyle("/portal/admin/students/ielts-toefl")}>
                    <svg className={`w-4 h-4 ${isActive("/portal/admin/students/ielts-toefl") ? 'text-white' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className={isActive("/portal/admin/students/ielts-toefl") ? 'text-white' : 'text-gray-100'}>IELTS / TOEFL Students</span>
                  </Link>
                </li>
                <li>
                  <Link href="/portal/admin/students/proficiency-only" className={getSubMenuItemClasses("/portal/admin/students/proficiency-only")} style={getSubActiveStyle("/portal/admin/students/proficiency-only")}>
                    <svg className={`w-4 h-4 ${isActive("/portal/admin/students/proficiency-only") ? 'text-white' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className={isActive("/portal/admin/students/proficiency-only") ? 'text-white' : 'text-gray-100'}>Proficiency Test Students</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Teacher Management */}
          <li>
            <Link href="/portal/admin/teachers" className={getSubMenuItemClasses("/portal/admin/teachers")} style={getSubActiveStyle("/portal/admin/teachers")}>
              <svg className={`w-4 h-4 ${isActive("/portal/admin/teachers") && !pathname?.includes('/assign') ? 'text-white' : 'text-gray-100'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className={isActive("/portal/admin/teachers") && !pathname?.includes('/assign') ? 'text-white' : 'text-gray-100'}>Teachers</span>
            </Link>
          </li>

          {/* Academic Management */}
          <li>
            <button
              onClick={() => toggleSection('academicManagement')}
              className={getDropdownButtonClasses('academicManagement')} style={getDropdownButtonStyle('academicManagement')}
            >
              <div className="flex items-center gap-3">
                <svg className={`w-5 h-5 ${openSection === 'academicManagement' ? 'text-white' : 'text-gray-100'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className={`font-medium text-sm ${openSection === 'academicManagement' ? 'text-white' : 'text-gray-100'}`}>Academic Management</span>
              </div>
              <svg className={`w-4 h-4 ${openSection === 'academicManagement' ? 'text-white' : 'text-gray-100'} transition-transform duration-200 ${openSection === 'academicManagement' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openSection === 'academicManagement' && (
              <ul className="mt-1 ml-4 space-y-1 border-l-2 border-white/20 pl-2">
                <li>
                  <Link href="/portal/admin/programs" className={getSubMenuItemClasses("/portal/admin/programs")} style={getSubActiveStyle("/portal/admin/programs")}>
                    <svg className={`w-4 h-4 ${isActive("/portal/admin/programs") ? 'text-white' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className={isActive("/portal/admin/programs") ? 'text-white' : 'text-gray-100'}>Programs</span>
                  </Link>
                </li>
                <li>
                  <Link href="/portal/admin/subprograms" className={getSubMenuItemClasses("/portal/admin/subprograms")} style={getSubActiveStyle("/portal/admin/subprograms")}>
                    <svg className={`w-4 h-4 ${isActive("/portal/admin/subprograms") ? 'text-white' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className={isActive("/portal/admin/subprograms") ? 'text-white' : 'text-gray-100'}>Courses</span>
                  </Link>
                </li>
                <li>
                  <Link href="/portal/admin/learning-resources/materials" className={getSubMenuItemClasses("/portal/admin/learning-resources/materials")} style={getSubActiveStyle("/portal/admin/learning-resources/materials")}>
                    <svg className={`w-4 h-4 ${isActive("/portal/admin/learning-resources/materials") ? 'text-white' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className={isActive("/portal/admin/learning-resources/materials") ? 'text-white' : 'text-gray-100'}>Course Materials</span>
                  </Link>
                </li>
                <li>
                  <Link href="/portal/admin/certificates" className={getSubMenuItemClasses("/portal/admin/certificates")} style={getSubActiveStyle("/portal/admin/certificates")}>
                    <svg className={`w-4 h-4 ${isActive("/portal/admin/certificates") ? 'text-white' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a.75.75 0 00-1.217.14L3.25 10.25M17.25 10.25l-3.368-5.413a.75.75 0 00-1.217-.14l-1.415 1.414M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className={isActive("/portal/admin/certificates") ? 'text-white' : 'text-gray-100'}>Certificates</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Class Management */}
          <li>
            <button
              onClick={() => toggleSection('learningResources')}
              className={getDropdownButtonClasses('learningResources')} style={getDropdownButtonStyle('learningResources')}
            >
              <div className="flex items-center gap-3">
                <svg className={`w-5 h-5 ${openSection === 'learningResources' ? 'text-white' : 'text-gray-100'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className={`font-medium text-sm ${openSection === 'learningResources' ? 'text-white' : 'text-gray-100'}`}>Class Management</span>
              </div>
              <svg className={`w-4 h-4 ${openSection === 'learningResources' ? 'text-white' : 'text-gray-100'} transition-transform duration-200 ${openSection === 'learningResources' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openSection === 'learningResources' && (
              <ul className="mt-1 ml-4 space-y-1 border-l-2 border-white/20 pl-2">
                <li>
                  <Link href="/portal/admin/classes" className={getSubMenuItemClasses("/portal/admin/classes")} style={getSubActiveStyle("/portal/admin/classes")}>
                    <svg className={`w-4 h-4 ${isActive("/portal/admin/classes") ? 'text-white' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H2v-2a4 4 0 014-4h12.356M20 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className={isActive("/portal/admin/classes") ? 'text-white' : 'text-gray-100'}>Classes</span>
                  </Link>
                </li>
                <li>
                  <Link href="/portal/admin/learning-resources/sessions" className={getSubMenuItemClasses("/portal/admin/learning-resources/sessions")} style={getSubActiveStyle("/portal/admin/learning-resources/sessions")}>
                    <svg className={`w-4 h-4 ${isActive("/portal/admin/learning-resources/sessions") ? 'text-white' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className={isActive("/portal/admin/learning-resources/sessions") ? 'text-white' : 'text-gray-100'}>Online Session Links</span>
                  </Link>
                </li>
                <li>
                  <Link href="/portal/admin/learning-resources/timetable" className={getSubMenuItemClasses("/portal/admin/learning-resources/timetable")} style={getSubActiveStyle("/portal/admin/learning-resources/timetable")}>
                    <svg className={`w-4 h-4 ${isActive("/portal/admin/learning-resources/timetable") ? 'text-white' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className={isActive("/portal/admin/learning-resources/timetable") ? 'text-white' : 'text-gray-100'}>Academic Timetable</span>
                  </Link>
                </li>
                <li>
                  <Link href="/portal/admin/shifts" className={getSubMenuItemClasses("/portal/admin/shifts")} style={getSubActiveStyle("/portal/admin/shifts")}>
                    <svg className={`w-4 h-4 ${isActive("/portal/admin/shifts") ? 'text-white' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className={isActive("/portal/admin/shifts") ? 'text-white' : 'text-gray-100'}>Shifts</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Assessments & Assignments */}
          <li>
            <button
              onClick={() => toggleSection('assessments')}
              className={getDropdownButtonClasses('assessments')} style={getDropdownButtonStyle('assessments')}
            >
              <div className="flex items-center gap-3">
                <svg className={`w-5 h-5 ${openSection === 'assessments' ? 'text-white' : 'text-gray-100'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span className={`font-medium text-sm ${openSection === 'assessments' ? 'text-white' : 'text-gray-100'}`}>Assessments & Assignments</span>
              </div>
              <svg className={`w-4 h-4 ${openSection === 'assessments' ? 'text-white' : 'text-gray-100'} transition-transform duration-200 ${openSection === 'assessments' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openSection === 'assessments' && (
              <ul className="mt-1 ml-4 space-y-1 border-l-2 border-white/20 pl-2">
                {/* Placement Tests */}
                <li>
                  <button
                    onClick={() => toggleSubSection('placementTests')}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm text-gray-300 hover:bg-white/10 ${openSubSection === 'placementTests' ? 'bg-white/10' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-gray-100">Placement Tests</span>
                    </div>
                    <svg className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${openSubSection === 'placementTests' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openSubSection === 'placementTests' && (
                    <ul className="mt-1 ml-4 space-y-1 border-l-2 border-white/20 pl-2">
                      <li>
                        <Link href="/portal/admin/assessments/placement-tests" className="flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-xs text-gray-300 hover:bg-white/10">
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="text-gray-100">Placement Tests</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/portal/admin/assessments/placement-tests/results" className="flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-xs text-gray-300 hover:bg-white/10">
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span className="text-gray-100">Placement Results</span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>

                {/* Professional Tests */}
                <li>
                  <button
                    onClick={() => toggleSubSection('professionalTests')}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm text-gray-300 hover:bg-white/10 ${openSubSection === 'professionalTests' ? 'bg-white/10' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-gray-100">Professional Tests</span>
                    </div>
                    <svg className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${openSubSection === 'professionalTests' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openSubSection === 'professionalTests' && (
                    <ul className="mt-1 ml-4 space-y-1 border-l-2 border-white/20 pl-2">
                      <li>
                        <Link href="/portal/admin/assessments/proficiency-tests" className="flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-xs text-gray-300 hover:bg-white/10">
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="text-gray-100">Professional Tests</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/portal/admin/assessments/proficiency-tests/results" className="flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-xs text-gray-300 hover:bg-white/10">
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span className="text-gray-100">Professional Results</span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>

              </ul>
            )}
          </li>

          {/* Communication */}
          <li>
            <button
              onClick={() => toggleSection('communication')}
              className={getDropdownButtonClasses('communication')} style={getDropdownButtonStyle('communication')}
            >
              <div className="flex items-center gap-3">
                <svg className={`w-5 h-5 ${openSection === 'communication' ? 'text-white' : 'text-gray-100'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className={`font-medium text-sm ${openSection === 'communication' ? 'text-white' : 'text-gray-100'}`}>Communication</span>
              </div>
              <svg className={`w-4 h-4 ${openSection === 'communication' ? 'text-white' : 'text-gray-100'} transition-transform duration-200 ${openSection === 'communication' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openSection === 'communication' && (
              <ul className="mt-1 ml-4 space-y-1 border-l-2 border-white/20 pl-2">
                <li>
                  <Link href="/portal/admin/communication/announcements" className={getSubMenuItemClasses("/portal/admin/communication/announcements")} style={getSubActiveStyle("/portal/admin/communication/announcements")}>
                    <svg className={`w-4 h-4 ${isActive("/portal/admin/communication/announcements") ? 'text-white' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                    <span className={isActive("/portal/admin/communication/announcements") ? 'text-white' : 'text-gray-100'}>Announcements</span>
                  </Link>
                </li>
                <li>
                  <Link href="/portal/admin/communication/news" className={getSubMenuItemClasses("/portal/admin/communication/news")} style={getSubActiveStyle("/portal/admin/communication/news")}>
                    <svg className={`w-4 h-4 ${isActive("/portal/admin/communication/news") ? 'text-white' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                    <span className={isActive("/portal/admin/communication/news") ? 'text-white' : 'text-gray-100'}>News & Events</span>
                  </Link>
                </li>
                <li>
                  <Link href="/portal/admin/communication/course-timeline" className={getSubMenuItemClasses("/portal/admin/communication/course-timeline")} style={getSubActiveStyle("/portal/admin/communication/course-timeline")}>
                    <svg className={`w-4 h-4 ${isActive("/portal/admin/communication/course-timeline") ? 'text-white' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className={isActive("/portal/admin/communication/course-timeline") ? 'text-white' : 'text-gray-100'}>Course Timeline</span>
                  </Link>
                </li>
                <li>
                  <Link href="/portal/admin/communication/testimonials" className={getSubMenuItemClasses("/portal/admin/communication/testimonials")} style={getSubActiveStyle("/portal/admin/communication/testimonials")}>
                    <svg className={`w-4 h-4 ${isActive("/portal/admin/communication/testimonials") ? 'text-white' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <span className={isActive("/portal/admin/communication/testimonials") ? 'text-white' : 'text-gray-100'}>Testimonials</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Student Requests Dropdown */}
          <li>
            <button
              onClick={() => toggleSection('studentRequests')}
              className={getDropdownButtonClasses('studentRequests')}
              style={getDropdownButtonStyle('studentRequests')}
            >
              <div className="flex items-center gap-3">
                <svg className={`w-5 h-5 ${openSection === 'studentRequests' ? 'text-white' : 'text-gray-100'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span className={`font-medium text-sm ${openSection === 'studentRequests' ? 'text-white' : 'text-gray-100'}`}>Students Requests</span>
              </div>
              <svg className={`w-4 h-4 ${openSection === 'studentRequests' ? 'text-white' : 'text-gray-100'} transition-transform duration-200 ${openSection === 'studentRequests' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openSection === 'studentRequests' && (
              <ul className="mt-1 ml-4 space-y-1 border-l-2 border-white/20 pl-2">
                <li>
                  <Link href="/portal/admin/students-requests/session" className={getSubMenuItemClasses("/portal/admin/students-requests/session")} style={getSubActiveStyle("/portal/admin/students-requests/session")}>
                    <svg className={`w-4 h-4 ${isActive("/portal/admin/students-requests/session") ? 'text-white' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className={isActive("/portal/admin/students-requests/session") ? 'text-white' : 'text-gray-100'}>Session Change Requests</span>
                  </Link>
                </li>
                <li>
                  <Link href="/portal/admin/students-requests/freezing" className={getSubMenuItemClasses("/portal/admin/students-requests/freezing")} style={getSubActiveStyle("/portal/admin/students-requests/freezing")}>
                    <svg className={`w-4 h-4 ${isActive("/portal/admin/students-requests/freezing") ? 'text-white' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className={isActive("/portal/admin/students-requests/freezing") ? 'text-white' : 'text-gray-100'}>Freezing Requests</span>
                  </Link>
                </li>
                <li>
                  <Link href="/portal/admin/students-requests/level-up" className={getSubMenuItemClasses("/portal/admin/students-requests/level-up")} style={getSubActiveStyle("/portal/admin/students-requests/level-up")}>
                    <svg className={`w-4 h-4 ${isActive("/portal/admin/students-requests/level-up") ? 'text-white' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className={isActive("/portal/admin/students-requests/level-up") ? 'text-white' : 'text-gray-100'}>Level Up Requests</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Payments */}
          <li>
            <button
              onClick={() => toggleSection('payments')}
              className={getDropdownButtonClasses('payments')}
              style={getDropdownButtonStyle('payments')}
            >
              <div className="flex items-center gap-3">
                <svg className={`w-5 h-5 ${openSection === 'payments' ? 'text-white' : 'text-gray-100'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={`font-medium text-sm ${openSection === 'payments' ? 'text-white' : 'text-gray-100'}`}>Payments</span>
              </div>
              <svg className={`w-4 h-4 ${openSection === 'payments' ? 'text-white' : 'text-gray-100'} transition-transform duration-200 ${openSection === 'payments' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openSection === 'payments' && (
              <ul className="mt-1 ml-4 space-y-1 border-l-2 border-white/20 pl-2">
                <li>
                  <Link href="/portal/admin/payments/packages" className={getSubMenuItemClasses("/portal/admin/payments/packages")} style={getSubActiveStyle("/portal/admin/payments/packages")}>
                    <svg className={`w-4 h-4 ${isActive("/portal/admin/payments/packages") ? 'text-white' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className={isActive("/portal/admin/payments/packages") ? 'text-white' : 'text-gray-100'}>Payment Packages</span>
                  </Link>
                </li>
                <li>
                  <Link href="/portal/admin/payments/history" className={getSubMenuItemClasses("/portal/admin/payments/history")} style={getSubActiveStyle("/portal/admin/payments/history")}>
                    <svg className={`w-4 h-4 ${isActive("/portal/admin/payments/history") ? 'text-white' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className={isActive("/portal/admin/payments/history") ? 'text-white' : 'text-gray-100'}>Payment History</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Reviews Management */}
          <li>
            <button
              onClick={() => toggleSection('reviews')}
              className={getDropdownButtonClasses('reviews')}
              style={getDropdownButtonStyle('reviews')}
            >
              <div className="flex items-center gap-3">
                <svg className={`w-5 h-5 ${openSection === 'reviews' ? 'text-white' : 'text-gray-100'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <span className={`font-medium text-sm ${openSection === 'reviews' ? 'text-white' : 'text-gray-100'}`}>Reviews</span>
              </div>
              <svg className={`w-4 h-4 ${openSection === 'reviews' ? 'text-white' : 'text-gray-100'} transition-transform duration-200 ${openSection === 'reviews' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openSection === 'reviews' && (
              <ul className="mt-1 ml-4 space-y-1 border-l-2 border-white/20 pl-2">
                {/* Teacher Subsection */}
                <li className="ml-2">
                  <button
                    onClick={() => toggleSubSection('reviewTeacher')}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm text-gray-300 hover:bg-white/10 ${openSubSection === 'reviewTeacher' ? 'bg-white/10' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-gray-100">Teacher</span>
                    </div>
                    <svg className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${openSubSection === 'reviewTeacher' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openSubSection === 'reviewTeacher' && (
                    <ul className="mt-1 ml-4 space-y-1 border-l-2 border-white/20 pl-2">
                      <li>
                        <Link href="/portal/admin/reviews/teacher-questions" className={getSubMenuItemClasses("/portal/admin/reviews/teacher-questions")} style={getSubActiveStyle("/portal/admin/reviews/teacher-questions")}>
                          <span className={isActive("/portal/admin/reviews/teacher-questions") ? 'text-white' : 'text-gray-100'}>Questions</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/portal/admin/reviews/teacher-reviews" className={getSubMenuItemClasses("/portal/admin/reviews/teacher-reviews")} style={getSubActiveStyle("/portal/admin/reviews/teacher-reviews")}>
                          <span className={isActive("/portal/admin/reviews/teacher-reviews") ? 'text-white' : 'text-gray-100'}>Reviews</span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>

                {/* Student Subsection */}
                <li className="ml-2">
                  <button
                    onClick={() => toggleSubSection('reviewStudent')}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm text-gray-300 hover:bg-white/10 ${openSubSection === 'reviewStudent' ? 'bg-white/10' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-gray-100">Student</span>
                    </div>
                    <svg className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${openSubSection === 'reviewStudent' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openSubSection === 'reviewStudent' && (
                    <ul className="mt-1 ml-4 space-y-1 border-l-2 border-white/20 pl-2">
                      <li>
                        <Link href="/portal/admin/reviews/student-questions" className={getSubMenuItemClasses("/portal/admin/reviews/student-questions")} style={getSubActiveStyle("/portal/admin/reviews/student-questions")}>
                          <span className={isActive("/portal/admin/reviews/student-questions") ? 'text-white' : 'text-gray-100'}>Questions</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/portal/admin/reviews/student-reviews" className={getSubMenuItemClasses("/portal/admin/reviews/student-reviews")} style={getSubActiveStyle("/portal/admin/reviews/student-reviews")}>
                          <span className={isActive("/portal/admin/reviews/student-reviews") ? 'text-white' : 'text-gray-100'}>Reviews</span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              </ul>
            )}
          </li>

          {/* Reports & Analytics */}
          <li>
            <button
              onClick={() => toggleSection('reports')}
              className={getDropdownButtonClasses('reports')} style={getDropdownButtonStyle('reports')}
            >
              <div className="flex items-center gap-3">
                <svg className={`w-5 h-5 ${openSection === 'reports' ? 'text-white' : 'text-gray-100'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className={`font-medium text-sm ${openSection === 'reports' ? 'text-white' : 'text-gray-100'}`}>Reports & Analytics</span>
              </div>
              <svg className={`w-4 h-4 ${openSection === 'reports' ? 'text-white' : 'text-gray-100'} transition-transform duration-200 ${openSection === 'reports' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openSection === 'reports' && (
              <ul className="mt-1 ml-4 space-y-1 border-l-2 border-white/20 pl-2">
                <li>
                  <Link href="/portal/admin/reports/students" className={getSubMenuItemClasses("/portal/admin/reports/students")} style={getSubActiveStyle("/portal/admin/reports/students")}>
                    <svg className={`w-4 h-4 ${isActive("/portal/admin/reports/students") ? 'text-white' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className={isActive("/portal/admin/reports/students") ? 'text-white' : 'text-gray-100'}>Student Reports</span>
                  </Link>
                </li>
                {/* <li>
                  <Link href="/portal/admin/reports/teachers" className={getSubMenuItemClasses("/portal/admin/reports/teachers")} style={getSubActiveStyle("/portal/admin/reports/teachers")}>
                    <svg className={`w-4 h-4 ${isActive("/portal/admin/reports/teachers") ? 'text-white' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className={isActive("/portal/admin/reports/teachers") ? 'text-white' : 'text-gray-100'}>Teacher Reports</span>
                  </Link>
                </li> */}
                <li>
                  <Link href="/portal/admin/reports/assessments" className={getSubMenuItemClasses("/portal/admin/reports/assessments")} style={getSubActiveStyle("/portal/admin/reports/assessments")}>
                    <svg className={`w-4 h-4 ${isActive("/portal/admin/reports/assessments") ? 'text-white' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <span className={isActive("/portal/admin/reports/assessments") ? 'text-white' : 'text-gray-100'}>Assessment Reports</span>
                  </Link>
                </li>
                <li>
                  <Link href="/portal/admin/reports/financial" className={getSubMenuItemClasses("/portal/admin/reports/financial")} style={getSubActiveStyle("/portal/admin/reports/financial")}>
                    <svg className={`w-4 h-4 ${isActive("/portal/admin/reports/financial") ? 'text-white' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className={isActive("/portal/admin/reports/financial") ? 'text-white' : 'text-gray-100'}>Financial Reports</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>



        </ul>
      </nav >

      {/* Logout Button */}
      < div className="p-4 border-t border-blue-900 mt-auto" >
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </div >
    </div >
  );
}
