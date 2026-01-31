"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useDarkMode } from "@/context/ThemeContext";
import { useLogoutMutation } from "@/redux/api/authApi";

export default function TeacherSidebar({ isOpen, onClose }) {
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

  // State for collapsible sections
  const [openSection, setOpenSection] = useState(null);

  // Auto-open sections based on current path
  useEffect(() => {
    if (pathname?.startsWith("/portal/teacher/my-classes")) {
      setOpenSection('myClasses');
    } else if (pathname?.includes("writing-tasks") ||
      pathname?.includes("course-work") ||
      pathname?.includes("exams") ||
      pathname?.includes("oral-assignment")) {
      setOpenSection('assessments');
    } else {
      setOpenSection(null);
    }
  }, [pathname]);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const isActive = (href) => {
    if (href === "/portal/teacher") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  // Menu Item Classes
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

  // Active Background Style (Red/Salmon based on inference)
  const getActiveStyle = (href, exact = false) => {
    const active = exact ? (pathname === href) : isActive(href);
    return active ? { backgroundColor: '#FF4D4D' } : {}; // Red/Salmon
  };

  const getSubActiveStyle = (href) => {
    const active = isActive(href);
    return active ? { backgroundColor: '#FF4D4D' } : {};
  };

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

  return (
    <div className={`fixed left-0 top-0 h-screen w-80 bg-[#010080] border-r border-blue-900 flex flex-col shadow-sm overflow-y-auto z-50 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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
            <Link href="/portal/teacher" className={getMenuItemClasses("/portal/teacher", true)} style={getActiveStyle("/portal/teacher", true)}>
              <svg className={getIconClasses("/portal/teacher", true)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-medium text-sm">Dashboard</span>
            </Link>
          </li>



          {/* My Classes */}
          <li>
            <Link href="/portal/teacher/my-classes" className={getMenuItemClasses("/portal/teacher/my-classes")} style={getActiveStyle("/portal/teacher/my-classes")}>
              <svg className={getIconClasses("/portal/teacher/my-classes")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium text-sm">My Classes</span>
            </Link>
          </li>

          {/* Writing Tasks */}
          <li>
            <Link href="/portal/teacher/assessments/writing-tasks" className={getMenuItemClasses("/portal/teacher/assessments/writing-tasks")} style={getActiveStyle("/portal/teacher/assessments/writing-tasks")}>
              <svg className={getIconClasses("/portal/teacher/assessments/writing-tasks")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="font-medium text-sm">Writing Tasks</span>
            </Link>
          </li>

          {/* Course Work */}
          <li>
            <Link href="/portal/teacher/assessments/course-work" className={getMenuItemClasses("/portal/teacher/assessments/course-work")} style={getActiveStyle("/portal/teacher/assessments/course-work")}>
              <svg className={getIconClasses("/portal/teacher/assessments/course-work")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="font-medium text-sm">Course Work</span>
            </Link>
          </li>

          {/* Exams */}
          <li>
            <Link href="/portal/teacher/assessments/exams" className={getMenuItemClasses("/portal/teacher/assessments/exams")} style={getActiveStyle("/portal/teacher/assessments/exams")}>
              <svg className={getIconClasses("/portal/teacher/assessments/exams")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-sm">Exams</span>
            </Link>
          </li>

          {/* Oral Assignment */}
          <li>
            <Link href="/portal/teacher/assessments/oral-assignment" className={getMenuItemClasses("/portal/teacher/assessments/oral-assignment")} style={getActiveStyle("/portal/teacher/assessments/oral-assignment")}>
              <svg className={getIconClasses("/portal/teacher/assessments/oral-assignment")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span className="font-medium text-sm">Oral Assignment</span>
            </Link>
          </li>

          {/* Attendance */}
          <li>
            <Link href="/portal/teacher/attendance" className={getMenuItemClasses("/portal/teacher/attendance")} style={getActiveStyle("/portal/teacher/attendance")}>
              <svg className={getIconClasses("/portal/teacher/attendance")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium text-sm">Attendance</span>
            </Link>
          </li>

          {/* Announcements */}
          <li>
            <Link href="/portal/teacher/announcements" className={getMenuItemClasses("/portal/teacher/announcements")} style={getActiveStyle("/portal/teacher/announcements")}>
              <svg className={getIconClasses("/portal/teacher/announcements")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              <span className="font-medium text-sm">Announcements</span>
            </Link>
          </li>

          {/* News & Events */}
          <li>
            <Link href="/portal/teacher/news" className={getMenuItemClasses("/portal/teacher/news")} style={getActiveStyle("/portal/teacher/news")}>
              <svg className={getIconClasses("/portal/teacher/news")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <span className="font-medium text-sm">News & Events</span>
            </Link>
          </li>


          {/* Reports */}
          <li>
            <Link href="/portal/teacher/reports" className={getMenuItemClasses("/portal/teacher/reports")} style={getActiveStyle("/portal/teacher/reports")}>
              <svg className={getIconClasses("/portal/teacher/reports")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="font-medium text-sm">Reports</span>
            </Link>
          </li>

          {/* Student Reviews */}
          <li>
            <Link href="/portal/teacher/reviews" className={getMenuItemClasses("/portal/teacher/reviews")} style={getActiveStyle("/portal/teacher/reviews")}>
              <svg className={getIconClasses("/portal/teacher/reviews")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.24.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span className="font-medium text-sm">Reviews</span>
            </Link>
          </li>

          {/* My Profile - commented out by user, keeping it commented */}
          {/* <li>
             <Link href="/portal/teacher/settings" className={getMenuItemClasses("/portal/teacher/settings")} style={getActiveStyle("/portal/teacher/settings")}>
               <svg className={getIconClasses("/portal/teacher/settings")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
               </svg>
               <span className="font-medium text-sm">My Profile</span>
             </Link>
           </li> */}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-blue-900 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-medium"
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
