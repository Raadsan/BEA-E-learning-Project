"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useLogoutMutation } from "@/redux/api/authApi";
import { useGetAnnouncementsQuery } from "@/redux/api/announcementApi";
import { useState, useEffect } from "react";

// Course-related paths that should show My Courses menu
const coursePaths = [
  '/portal/student/my-courses',
  '/portal/student/online-sessions',
  '/portal/student/writing-tasks',
  '/portal/student/course-work',
  '/portal/student/exams',
  '/portal/student/class-updates',
  '/portal/student/term-cycle-info',
  '/portal/student/student-review',
  '/portal/student/attendance',
  '/portal/student/resources',
  '/portal/student/oral-assignment',
  '/portal/student/progress-report',
  '/portal/student/grades',
  '/portal/student/my-certification'
];

export default function StudentSidebar({ isApproved, isPaid = true, isTestExpired = false, user, isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const [logout] = useLogoutMutation();
  const [showMyCourses, setShowMyCourses] = useState(false);

  const { data: announcements } = useGetAnnouncementsQuery();
  const [hasNewUpdates, setHasNewUpdates] = useState(false);

  // Check for new updates
  useEffect(() => {
    if (announcements && announcements.length > 0) {
      const lastSeenId = localStorage.getItem("last_seen_announcement_id");
      const latestId = announcements[0].id.toString();

      if (lastSeenId !== latestId && pathname !== "/portal/student/class-updates") {
        setHasNewUpdates(true);
      }
    }
  }, [announcements, pathname]);

  // Reset update status when visiting the page
  useEffect(() => {
    if (pathname === "/portal/student/class-updates" && announcements && announcements.length > 0) {
      localStorage.setItem("last_seen_announcement_id", announcements[0].id.toString());
      setHasNewUpdates(false);
    }
  }, [pathname, announcements]);

  const prog = (user?.chosen_program || user?.program || "").toString().toLowerCase();
  const sub = user?.chosen_subprogram_name?.toString().toLowerCase() || "";
  const isProficiencyOnly = prog.trim() === "proficiency test" || user?.role === 'proficiency_student';

  // Auto-detect if we're on a course-related page
  useEffect(() => {
    if (isProficiencyOnly) {
      setShowMyCourses(false);
      return;
    }
    const isCoursePage = coursePaths.some(path => pathname?.startsWith(path));
    setShowMyCourses(isCoursePage);
  }, [pathname, isProficiencyOnly]);

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
    return `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${active
      ? 'text-white font-semibold'
      : 'text-gray-100 hover:bg-white/10 hover:text-white'
      }`;
  };

  // Helper function to get active background style for main menu items
  const getActiveStyle = (href, exact = false) => {
    const active = exact ? (pathname === href) : isActive(href);
    return active ? { backgroundColor: '#f40606' } : {};
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
    <div className={`fixed left-0 top-0 h-screen w-80 bg-[#010080] border-r border-blue-900 flex flex-col shadow-sm overflow-y-auto transition-transform duration-300 lg:translate-x-0 z-50 portal-nav ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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
        {showMyCourses ? (
          /* My Courses Submenu */
          <ul className="space-y-0.5">
            {/* Back Button */}
            <li>
              <button
                onClick={() => setShowMyCourses(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray-100 hover:bg-white/10 w-full text-left"
              >
                <svg
                  className="w-5 h-5 text-gray-100"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span className="font-medium text-sm text-gray-100">Back to Menu</span>
              </button>
            </li>

            {/* Submenu items (only for approved and paid) */}
            {!isPaid && (
              <li className="px-4 py-3 mb-4 bg-orange-500/10 border border-orange-500/20 rounded-xl mx-2 shadow-inner">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-[11px] text-orange-500 font-extrabold uppercase tracking-widest">Access Locked</p>
                </div>
                <p className="text-[10px] text-gray-300 leading-relaxed font-medium">Please upgrade your account to unlock your courses.</p>
              </li>
            )}

            {isPaid && (
              <>
                <li>
                  <Link
                    href="/portal/student/my-courses"
                    className={getMenuItemClasses("/portal/student/my-courses")}
                    style={getActiveStyle("/portal/student/my-courses")}
                  >
                    <svg className={getIconClasses("/portal/student/my-courses")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className={getTextClasses("/portal/student/my-courses")}>My Courses</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/portal/student/online-sessions"
                    className={getMenuItemClasses("/portal/student/online-sessions")}
                    style={getActiveStyle("/portal/student/online-sessions")}
                  >
                    <svg className={getIconClasses("/portal/student/online-sessions")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className={getTextClasses("/portal/student/online-sessions")}>Online Sessions</span>
                  </Link>
                </li>
              </>
            )}
            <li>
              <Link href="/portal/student/attendance" className={getMenuItemClasses("/portal/student/attendance")} style={getActiveStyle("/portal/student/attendance")}>
                <svg className={getIconClasses("/portal/student/attendance")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span className={getTextClasses("/portal/student/attendance")}>Attendance</span>
              </Link>
            </li>
            <li>
              <Link href="/portal/student/resources" className={getMenuItemClasses("/portal/student/resources")} style={getActiveStyle("/portal/student/resources")}>
                <svg className={getIconClasses("/portal/student/resources")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className={getTextClasses("/portal/student/resources")}>Resources</span>
              </Link>
            </li>
            <li>
              <Link href="/portal/student/class-updates" className={getMenuItemClasses("/portal/student/class-updates")} style={getActiveStyle("/portal/student/class-updates")}>
                <svg className={getIconClasses("/portal/student/class-updates")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <div className="flex items-center gap-2">
                  <span className={getTextClasses("/portal/student/class-updates")}>Class Updates</span>
                  {hasNewUpdates && (
                    <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
                  )}
                </div>
              </Link>
            </li>
            <li>
              <Link href="/portal/student/writing-tasks" className={getMenuItemClasses("/portal/student/writing-tasks")} style={getActiveStyle("/portal/student/writing-tasks")}>
                <svg className={getIconClasses("/portal/student/writing-tasks")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className={getTextClasses("/portal/student/writing-tasks")}>Writing Tasks</span>
              </Link>
            </li>
            <li>
              <Link href="/portal/student/course-work" className={getMenuItemClasses("/portal/student/course-work")} style={getActiveStyle("/portal/student/course-work")}>
                <svg className={getIconClasses("/portal/student/course-work")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className={getTextClasses("/portal/student/course-work")}>Course Work</span>
              </Link>
            </li>
            <li>
              <Link href="/portal/student/exams" className={getMenuItemClasses("/portal/student/exams")} style={getActiveStyle("/portal/student/exams")}>
                <svg className={getIconClasses("/portal/student/exams")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span className={getTextClasses("/portal/student/exams")}>Exams</span>
              </Link>
            </li>
            <li>
              <Link href="/portal/student/oral-assignment" className={getMenuItemClasses("/portal/student/oral-assignment")} style={getActiveStyle("/portal/student/oral-assignment")}>
                <svg className={getIconClasses("/portal/student/oral-assignment")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <span className={getTextClasses("/portal/student/oral-assignment")}>Oral Assignment</span>
              </Link>
            </li>
            <li>
              <Link href="/portal/student/term-cycle-info" className={getMenuItemClasses("/portal/student/term-cycle-info")} style={getActiveStyle("/portal/student/term-cycle-info")}>
                <svg className={getIconClasses("/portal/student/term-cycle-info")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className={getTextClasses("/portal/student/term-cycle-info")}>Term Cycle Info</span>
              </Link>
            </li>
            <li>
              <Link href="/portal/student/student-review" className={getMenuItemClasses("/portal/student/student-review")} style={getActiveStyle("/portal/student/student-review")}>
                <svg className={getIconClasses("/portal/student/student-review")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <span className={getTextClasses("/portal/student/student-review")}>Student Review</span>
              </Link>
            </li>
            <li>
              <Link href="/portal/student/progress-report" className={getMenuItemClasses("/portal/student/progress-report")} style={getActiveStyle("/portal/student/progress-report")}>
                <svg className={getIconClasses("/portal/student/progress-report")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className={getTextClasses("/portal/student/progress-report")}>Progress Report</span>
              </Link>
            </li>
            <li>
              <Link href="/portal/student/grades" className={getMenuItemClasses("/portal/student/grades")} style={getActiveStyle("/portal/student/grades")}>
                <svg className={getIconClasses("/portal/student/grades")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <span className={getTextClasses("/portal/student/grades")}>Grades</span>
              </Link>
            </li>
            <li>
              <Link href="/portal/student/my-certification" className={getMenuItemClasses("/portal/student/my-certification")} style={getActiveStyle("/portal/student/my-certification")}>
                <svg className={getIconClasses("/portal/student/my-certification")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <span className={getTextClasses("/portal/student/my-certification")}>My Certification</span>
              </Link>
            </li>
          </ul>
        ) : (
          /* Main Menu */
          <ul className="space-y-0.5">
            {/* Dashboard (Visible to all) */}
            <li>
              <Link
                href="/portal/student"
                className={getMenuItemClasses("/portal/student", true)}
                style={getActiveStyle("/portal/student", true)}
              >
                <svg className={getIconClasses("/portal/student", true)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span className={getTextClasses("/portal/student", true)}>Dashboard</span>
              </Link>
            </li>

            {/* Payment (Visible to all students) */}
            <li>
              <Link
                href="/portal/student/payments"
                className={getMenuItemClasses("/portal/student/payments")}
                style={getActiveStyle("/portal/student/payments")}
              >
                <svg className={getIconClasses("/portal/student/payments")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 .895-4 2s1.79 2 4 2 4 .895 4 2-1.79 2-4 2m0-8c2.21 0 4 .895 4 2m-4-2V6m0 8v2m8-4a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={getTextClasses("/portal/student/payments")}>Payment</span>
              </Link>
            </li>

            {/* Placement / Proficiency Test (Visible if required by program) */}
            {(() => {
              // Use the setting from the student's program (or fallback logic if undefined)
              const needsPlacement = user?.program_test_required === 'placement';
              const needsProficiency = user?.program_test_required === 'proficiency' || user?.role === 'proficiency_student';

              if (needsPlacement) {
                return (
                  <li>
                    {isTestExpired ? (
                      <div className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray-400 cursor-not-allowed mx-2 bg-red-950/20 border border-red-900/10">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="font-medium text-xs">Placement Blocked</span>
                      </div>
                    ) : (
                      <Link
                        href="/portal/student/placement-test"
                        className={getMenuItemClasses("/portal/student/placement-test")}
                        style={getActiveStyle("/portal/student/placement-test")}
                      >
                        <svg className={getIconClasses("/portal/student/placement-test")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <span className={getTextClasses("/portal/student/placement-test")}>Placement Test</span>
                      </Link>
                    )}
                  </li>
                );
              }

              if (needsProficiency) {
                return (
                  <li>
                    {isTestExpired ? (
                      <div className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray-400 cursor-not-allowed mx-2 bg-red-950/20 border border-red-900/10">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="font-medium text-xs">Proficiency Blocked</span>
                      </div>
                    ) : (
                      <Link
                        href="/portal/student/proficiency-test"
                        className={getMenuItemClasses("/portal/student/proficiency-test")}
                        style={getActiveStyle("/portal/student/proficiency-test")}
                      >
                        <svg className={getIconClasses("/portal/student/proficiency-test")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <span className={getTextClasses("/portal/student/proficiency-test")}>Proficiency Test</span>
                      </Link>
                    )}
                  </li>
                );
              }

              return null;
            })()}

            {/* Additional items for Proficiency Only students (visible even if not approved) */}
            {isProficiencyOnly && (
              <>
                {/* Student Support */}
                <li>
                  <Link href="/portal/student/student-support" className={getMenuItemClasses("/portal/student/student-support")} style={getActiveStyle("/portal/student/student-support")}>
                    <svg className={getIconClasses("/portal/student/student-support")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className={getTextClasses("/portal/student/student-support")}>Student Support</span>
                  </Link>
                </li>

                {/* My Certification */}
                <li>
                  <Link href="/portal/student/my-certification" className={getMenuItemClasses("/portal/student/my-certification")} style={getActiveStyle("/portal/student/my-certification")}>
                    <svg className={getIconClasses("/portal/student/my-certification")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <span className={getTextClasses("/portal/student/my-certification")}>My Certification</span>
                  </Link>
                </li>
              </>
            )}

            {isApproved && (
              <>
                {/* Academic Content Block - Only if paid and NOT proficiency only */}
                {isPaid && !isProficiencyOnly && (
                  <>

                    {/* My Courses */}
                    <li>
                      <Link
                        href="/portal/student/my-courses"
                        className={getMenuItemClasses("/portal/student/my-courses")}
                        style={getActiveStyle("/portal/student/my-courses")}
                      >
                        <svg className={getIconClasses("/portal/student/my-courses")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span className={getTextClasses("/portal/student/my-courses")}>My Courses</span>
                        <svg className="w-4 h-4 ml-auto text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </li>

                    {/* Freezing Request */}
                    <li>
                      <Link href="/portal/student/freezing-request" className={getMenuItemClasses("/portal/student/freezing-request")} style={getActiveStyle("/portal/student/freezing-request")}>
                        <svg className={getIconClasses("/portal/student/freezing-request")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className={getTextClasses("/portal/student/freezing-request")}>Freezing Request</span>
                      </Link>
                    </li>

                    {/* Session Change */}
                    <li>
                      <Link href="/portal/student/session-change" className={getMenuItemClasses("/portal/student/session-change")} style={getActiveStyle("/portal/student/session-change")}>
                        <svg className={getIconClasses("/portal/student/session-change")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className={getTextClasses("/portal/student/session-change")}>Session Change</span>
                      </Link>
                    </li>

                    {/* Tutorials */}
                    <li>
                      <Link href="/portal/student/tutorials" className={getMenuItemClasses("/portal/student/tutorials")} style={getActiveStyle("/portal/student/tutorials")}>
                        <svg className={getIconClasses("/portal/student/tutorials")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span className={getTextClasses("/portal/student/tutorials")}>Tutorials</span>
                      </Link>
                    </li>

                    {/* News & Events */}
                    <li>
                      <Link href="/portal/student/news" className={getMenuItemClasses("/portal/student/news")} style={getActiveStyle("/portal/student/news")}>
                        <svg className={getIconClasses("/portal/student/news")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                        <span className={getTextClasses("/portal/student/news")}>News & Events</span>
                      </Link>
                    </li>
                  </>
                )}


                <div className={!isPaid ? "mt-4" : ""}>
                  {/* Student Support (Only if NOT proficiency only - already handled above) */}
                  {!isProficiencyOnly && (
                    <li>
                      <Link href="/portal/student/student-support" className={getMenuItemClasses("/portal/student/student-support")} style={getActiveStyle("/portal/student/student-support")}>
                        <svg className={getIconClasses("/portal/student/student-support")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span className={getTextClasses("/portal/student/student-support")}>Student Support</span>
                      </Link>
                    </li>
                  )}

                  {/* Policies */}
                  {!isProficiencyOnly && (
                    <li>
                      <Link href="/portal/student/policies" className={getMenuItemClasses("/portal/student/policies")} style={getActiveStyle("/portal/student/policies")}>
                        <svg className={getIconClasses("/portal/student/policies")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className={getTextClasses("/portal/student/policies")}>Policies</span>
                      </Link>
                    </li>
                  )}
                </div>
              </>
            )}
          </ul>
        )}
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
    </div >
  );
}
