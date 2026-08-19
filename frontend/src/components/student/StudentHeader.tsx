"use client";

import { useState, useEffect } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useGetAnnouncementsQuery } from "@/lib/api/announcementApi";
import { useGetNotificationsQuery } from "@/lib/api/notificationApi";
import { useGetCurrentUserQuery } from "@/lib/api/authApi";
import { resolveProfileImageUrl } from "@/constants";
import { isStudentSubscriptionActive } from "@/utils/studentPayment";
import PortalSearch from "@/components/PortalSearch";

const EMPTY_LIST = [];

const loadReadAnnouncements = () => {
  if (typeof window === "undefined") return [];
  try {
    const stored = JSON.parse(localStorage.getItem("student_read_announcements") || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};

export default function StudentHeader({ onMenuClick, onNavigate }) {
  const { isDark, toggleDarkMode } = useDarkMode();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [deferAlerts, setDeferAlerts] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setDeferAlerts(false), 1200);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  const navigateTo = (href: string) => {
    onNavigate?.();
    router.push(href);
  };

  // Use Redux hook for reactive user data
  const { data: currentStudent } = useGetCurrentUserQuery();

  // Notification Logic
  const { data: notifications } = useGetNotificationsQuery(undefined, {
    skip: deferAlerts,
    pollingInterval: 120000,
  });
  const { data: announcements } = useGetAnnouncementsQuery(undefined, {
    skip: deferAlerts,
    pollingInterval: 120000,
  });

  const notificationList = notifications ?? EMPTY_LIST;
  const announcementList = announcements ?? EMPTY_LIST;

  const [readAnnouncements, setReadAnnouncements] = useState(loadReadAnnouncements);

  // Re-sync from localStorage after navigation or tab focus (e.g. read announcements page)
  useEffect(() => {
    const stored = loadReadAnnouncements();
    setReadAnnouncements((prev) => {
      if (prev.length === stored.length && prev.every((id, i) => id === stored[i])) {
        return prev;
      }
      return stored;
    });
  }, [pathname]);

  useEffect(() => {
    const syncReads = () => {
      const stored = loadReadAnnouncements();
      setReadAnnouncements((prev) => {
        if (prev.length === stored.length && prev.every((id, i) => id === stored[i])) {
          return prev;
        }
        return stored;
      });
    };

    window.addEventListener("focus", syncReads);
    return () => window.removeEventListener("focus", syncReads);
  }, []);

  const unreadNotificationsCount = notificationList.filter((n) => !n.is_read).length;
  const unreadAnnouncementsCount = announcementList.filter((a) => !readAnnouncements.includes(a.id)).length;
  const unreadCount = unreadNotificationsCount + unreadAnnouncementsCount;

  const isPaid = isStudentSubscriptionActive(currentStudent);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  return (
    <header className={`sticky top-0 z-40 border-b transition-colors ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
      {/* Expiry Banner Removed as per request (Main alert is now on Dashboard) */}
      <div className="w-full mx-auto px-4 lg:px-6 xl:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile Menu Button - Left Side */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Dynamic Search Bar */}
          <PortalSearch
            role="student"
            placeholder="Search courses, exams, coursework..."
            className="max-w-sm hidden sm:block"
          />

          {/* Right Side Controls */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? (
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Notification Icon */}
            <button
              onClick={() => navigateTo("/portal/student/notifications")}
              className={`relative p-2 rounded-lg transition-colors ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              title="Notifications"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.032 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white dark:border-gray-800">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* User Profile - Clickable with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors group focus:outline-none"
              >
                {currentStudent?.profile_picture ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 group-hover:border-blue-500 transition-colors">
                    <img
                      src={resolveProfileImageUrl(currentStudent.profile_picture) || ""}
                      alt={currentStudent.full_name || "Student"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center border-2 border-gray-200 dark:border-gray-600 group-hover:border-blue-500 transition-colors text-white font-bold text-sm">
                    {currentStudent?.full_name?.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2) || "ST"}
                  </div>
                )}

              </button>

              {/* Dropdown Menu */}
              {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-50 animate-in fade-in zoom-in duration-200">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 mb-0.5">Signed in as</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {currentStudent?.full_name || "Student"}
                    </p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        navigateTo("/portal/student/profile");
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </button>
                  </div>
                  <div className="border-t border-gray-100 dark:border-gray-700 py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

