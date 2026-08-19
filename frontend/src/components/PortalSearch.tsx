"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDarkMode } from "@/context/ThemeContext";

interface SearchItem {
  id: string;
  title: string;
  category: "Navigation" | "Courses & Classes" | "Assessments" | "Resources & Settings" | "Administration";
  href: string;
  keywords: string[];
  description?: string;
  icon?: string;
}

const PORTAL_ITEMS: Record<"student" | "teacher" | "admin", SearchItem[]> = {
  student: [
    {
      id: "s-dash",
      title: "Dashboard",
      category: "Navigation",
      href: "/portal/student",
      keywords: ["home", "overview", "dashboard", "stats", "progress", "summary"],
      description: "Student portal home overview"
    },
    {
      id: "s-classes",
      title: "My Classes",
      category: "Courses & Classes",
      href: "/portal/student/classes",
      keywords: ["class", "classes", "schedule", "lessons", "teacher", "room", "groups"],
      description: "View enrolled classes and schedules"
    },
    {
      id: "s-sessions",
      title: "Online Sessions",
      category: "Courses & Classes",
      href: "/portal/student/sessions",
      keywords: ["zoom", "live", "meeting", "online", "session", "class live", "google meet"],
      description: "Join live class video sessions"
    },
    {
      id: "s-coursework",
      title: "Coursework & Materials",
      category: "Courses & Classes",
      href: "/portal/student/coursework",
      keywords: ["coursework", "materials", "units", "lessons", "curriculum", "books", "download"],
      description: "Access course materials and study units"
    },
    {
      id: "s-writing",
      title: "Writing Tasks",
      category: "Assessments",
      href: "/portal/student/writing",
      keywords: ["writing", "essay", "paragraph", "draft", "task", "composition", "grammar"],
      description: "Submit and review writing assignments"
    },
    {
      id: "s-oral",
      title: "Oral Assignments",
      category: "Assessments",
      href: "/portal/student/oral-assignments",
      keywords: ["oral", "speaking", "voice", "audio", "recording", "pronunciation", "speech"],
      description: "Record and submit speaking assignments"
    },
    {
      id: "s-exams",
      title: "Exams & Tests",
      category: "Assessments",
      href: "/portal/student/exams",
      keywords: ["exam", "test", "midterm", "final", "quiz", "assessment", "score", "grade"],
      description: "Take assigned exams and view results"
    },
    {
      id: "s-placement",
      title: "Placement Test",
      category: "Assessments",
      href: "/portal/student/placement-test",
      keywords: ["placement", "level test", "entry test", "proficiency", "evaluation"],
      description: "Take or view placement test evaluation"
    },
    {
      id: "s-proficiency",
      title: "Proficiency Test",
      category: "Assessments",
      href: "/portal/student/proficiency-test",
      keywords: ["proficiency", "certificate test", "english test", "exam"],
      description: "Proficiency testing portal"
    },
    {
      id: "s-attendance",
      title: "Attendance Record",
      category: "Resources & Settings",
      href: "/portal/student/attendance",
      keywords: ["attendance", "present", "absent", "late", "history", "streak"],
      description: "Check your class attendance history"
    },
    {
      id: "s-timetable",
      title: "Timetable & Schedule",
      category: "Resources & Settings",
      href: "/portal/student/timetable",
      keywords: ["timetable", "schedule", "calendar", "time", "days", "routine"],
      description: "Weekly class schedule"
    },
    {
      id: "s-announcements",
      title: "Announcements",
      category: "Resources & Settings",
      href: "/portal/student/announcements",
      keywords: ["announcements", "news", "updates", "alerts", "noticeboard", "admin notice"],
      description: "Latest academy notices and updates"
    },
    {
      id: "s-tutorials",
      title: "Tutorials & Guides",
      category: "Resources & Settings",
      href: "/portal/student/tutorials",
      keywords: ["tutorials", "help", "guide", "how to", "videos", "instructions"],
      description: "Platform tutorials and help videos"
    },
    {
      id: "s-policies",
      title: "Academy Policies",
      category: "Resources & Settings",
      href: "/portal/student/policies",
      keywords: ["policies", "rules", "code of conduct", "terms", "regulations"],
      description: "BEA student guidelines and policies"
    },
    {
      id: "s-profile",
      title: "My Profile",
      category: "Resources & Settings",
      href: "/portal/student/profile",
      keywords: ["profile", "account", "settings", "password", "email", "photo", "personal info"],
      description: "Manage your personal student profile"
    },
    {
      id: "s-reviews",
      title: "Teacher Reviews",
      category: "Resources & Settings",
      href: "/portal/student/reviews",
      keywords: ["review", "feedback", "rating", "evaluate teacher", "survey"],
      description: "Submit feedback and reviews for teachers"
    },
  ],
  teacher: [
    {
      id: "t-dash",
      title: "Dashboard",
      category: "Navigation",
      href: "/portal/teacher",
      keywords: ["home", "overview", "teacher dashboard", "stats", "active classes", "summary"],
      description: "Teacher overview and quick metrics"
    },
    {
      id: "t-classes",
      title: "My Classes",
      category: "Courses & Classes",
      href: "/portal/teacher/classes",
      keywords: ["classes", "assigned classes", "students", "roster", "class list", "programs"],
      description: "Manage your assigned classes and student rosters"
    },
    {
      id: "t-sessions",
      title: "Online Sessions",
      category: "Courses & Classes",
      href: "/portal/teacher/sessions",
      keywords: ["zoom", "live session", "host meeting", "online class", "video lesson"],
      description: "Start and manage live online teaching sessions"
    },
    {
      id: "t-coursework",
      title: "Coursework Management",
      category: "Courses & Classes",
      href: "/portal/teacher/coursework",
      keywords: ["coursework", "lessons", "materials", "curriculum", "resources", "upload"],
      description: "Upload and manage course study materials"
    },
    {
      id: "t-writing",
      title: "Writing Tasks",
      category: "Assessments",
      href: "/portal/teacher/writing",
      keywords: ["writing", "essays", "submissions", "grading", "feedback", "marking", "rubric"],
      description: "Review, grade, and feedback student writing submissions"
    },
    {
      id: "t-exams",
      title: "Exams Management",
      category: "Assessments",
      href: "/portal/teacher/exams",
      keywords: ["exams", "create exam", "exam list", "publish", "results", "midterm", "final"],
      description: "Create, edit, and grade class exams"
    },
    {
      id: "t-exams-create",
      title: "Create New Exam",
      category: "Assessments",
      href: "/portal/teacher/exams/create",
      keywords: ["new exam", "create test", "add questions", "exam builder", "writing reading listening oral"],
      description: "Build a new comprehensive 4-paper exam"
    },
    {
      id: "t-oral",
      title: "Oral Assignments",
      category: "Assessments",
      href: "/portal/teacher/oral-assignments",
      keywords: ["oral", "speaking", "audio", "recordings", "voice submission", "grading speaking"],
      description: "Listen to and score student oral recordings"
    },
    {
      id: "t-attendance",
      title: "Attendance Tracking",
      category: "Resources & Settings",
      href: "/portal/teacher/attendance",
      keywords: ["attendance", "mark attendance", "roll call", "present", "absent", "daily attendance"],
      description: "Mark and view student class attendance"
    },
    {
      id: "t-announcements",
      title: "Announcements",
      category: "Resources & Settings",
      href: "/portal/teacher/announcements",
      keywords: ["announcements", "broadcast", "post notice", "updates", "news"],
      description: "Post and read class announcements"
    },
    {
      id: "t-tutorials",
      title: "Tutorials & Guides",
      category: "Resources & Settings",
      href: "/portal/teacher/tutorials",
      keywords: ["tutorials", "teaching guides", "videos", "how to teach"],
      description: "Faculty teaching guides and platform help"
    },
    {
      id: "t-policies",
      title: "Faculty Policies",
      category: "Resources & Settings",
      href: "/portal/teacher/policies",
      keywords: ["policies", "rules", "grading policies", "guidelines", "code of conduct"],
      description: "Faculty guidelines and academic policies"
    },
    {
      id: "t-reviews",
      title: "Student Reviews & Ratings",
      category: "Resources & Settings",
      href: "/portal/teacher/reviews",
      keywords: ["reviews", "ratings", "feedback from students", "evaluation"],
      description: "View student feedback and ratings"
    },
    {
      id: "t-reports",
      title: "Academic Reports",
      category: "Resources & Settings",
      href: "/portal/teacher/reports",
      keywords: ["reports", "class performance", "grades report", "analytics", "attendance rate"],
      description: "Generate student and class performance reports"
    },
    {
      id: "t-profile",
      title: "Teacher Profile",
      category: "Resources & Settings",
      href: "/portal/teacher/profile",
      keywords: ["profile", "bio", "photo", "specialization", "phone", "email", "password"],
      description: "Edit your teacher account and profile details"
    },
  ],
  admin: [
    {
      id: "a-dash",
      title: "Admin Dashboard",
      category: "Navigation",
      href: "/portal/admin",
      keywords: ["home", "admin overview", "metrics", "total students", "revenue", "summary", "analytics"],
      description: "Main administrative metrics & statistics"
    },
    {
      id: "a-students-gen",
      title: "General Students",
      category: "Administration",
      href: "/portal/admin/students/general",
      keywords: ["students", "enrolled students", "student list", "register student", "admissions"],
      description: "Manage general English students and enrollments"
    },
    {
      id: "a-students-ielts",
      title: "IELTS & TOEFL Students",
      category: "Administration",
      href: "/portal/admin/students/ielts-toefl",
      keywords: ["ielts", "toefl", "test prep students", "candidates", "international exam"],
      description: "Manage IELTS and TOEFL registered candidates"
    },
    {
      id: "a-students-prof",
      title: "Proficiency Test Students",
      category: "Administration",
      href: "/portal/admin/students/proficiency-test",
      keywords: ["proficiency students", "level test students", "evaluation candidates"],
      description: "Manage English proficiency test applicants"
    },
    {
      id: "a-teachers",
      title: "Teachers Directory",
      category: "Administration",
      href: "/portal/admin/teachers",
      keywords: ["teachers", "faculty", "instructors", "staff", "add teacher", "teacher assignments"],
      description: "Manage teaching faculty and instructor profiles"
    },
    {
      id: "a-classes",
      title: "Classes Management",
      category: "Administration",
      href: "/portal/admin/classes",
      keywords: ["classes", "sections", "create class", "assign teacher", "shift", "classroom"],
      description: "Create and organize academy classes"
    },
    {
      id: "a-programs",
      title: "Programs & Curriculum",
      category: "Courses & Classes",
      href: "/portal/admin/programs",
      keywords: ["programs", "courses", "subprograms", "levels", "curriculum", "add program"],
      description: "Manage academic programs and level structure"
    },
    {
      id: "a-placement-tests",
      title: "Placement Tests",
      category: "Assessments",
      href: "/portal/admin/assessments/placement-tests",
      keywords: ["placement tests", "entry tests", "create placement test", "mcqs", "reading", "essay"],
      description: "Configure student placement testing"
    },
    {
      id: "a-proficiency-tests",
      title: "Proficiency Tests",
      category: "Assessments",
      href: "/portal/admin/assessments/proficiency-tests",
      keywords: ["proficiency tests", "certificate assessments", "create test", "test bank"],
      description: "Configure official proficiency test papers"
    },
    {
      id: "a-reports",
      title: "Analytics & Reports",
      category: "Resources & Settings",
      href: "/portal/admin/reports",
      keywords: ["reports", "financial", "attendance reports", "enrollment reports", "assessment reports"],
      description: "Comprehensive institutional reporting"
    },
    {
      id: "a-timetables",
      title: "Academic Timetables",
      category: "Resources & Settings",
      href: "/portal/admin/timetables",
      keywords: ["timetables", "schedules", "shifts", "calendar", "class routine"],
      description: "Master academic timetable and schedules"
    },
    {
      id: "a-announcements",
      title: "Academy Announcements",
      category: "Resources & Settings",
      href: "/portal/admin/announcements",
      keywords: ["announcements", "broadcast", "publish notice", "alerts"],
      description: "Post system-wide and class announcements"
    },
    {
      id: "a-users",
      title: "Admin Users & Roles",
      category: "Administration",
      href: "/portal/admin/users",
      keywords: ["admin users", "roles", "permissions", "technical admin", "super admin", "staff access"],
      description: "Manage administrator accounts and role permissions"
    },
    {
      id: "a-profile",
      title: "Admin Profile Settings",
      category: "Resources & Settings",
      href: "/portal/admin/profile",
      keywords: ["profile", "admin account", "password", "email", "change photo"],
      description: "Update your administrator profile"
    },
  ]
};

export default function PortalSearch({
  role = "student",
  placeholder = "Search Course...",
  className = "",
}: {
  role?: "student" | "teacher" | "admin";
  placeholder?: string;
  className?: string;
}) {
  const router = useRouter();
  const { isDark } = useDarkMode();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useMemo(() => PORTAL_ITEMS[role] || PORTAL_ITEMS.student, [role]);

  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return items.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchCategory = item.category.toLowerCase().includes(q);
      const matchDescription = item.description?.toLowerCase().includes(q);
      const matchKeywords = item.keywords.some((k) => k.toLowerCase().includes(q));
      return matchTitle || matchCategory || matchDescription || matchKeywords;
    });
  }, [query, items]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredResults]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (href: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filteredResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredResults.length) % filteredResults.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        handleSelect(filteredResults[selectedIndex].href);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative flex-1 ${className}`}>
      <div className="relative w-full">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-9 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        />
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            ✕
          </button>
        )}
      </div>

      {/* Live Dropdown Results */}
      {isOpen && query.trim() !== "" && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-150 dark:border-gray-700 dark:bg-gray-800">
          {filteredResults.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
              <p className="font-semibold text-gray-700 dark:text-gray-300">No results found for &ldquo;{query}&rdquo;</p>
              <p className="mt-1 text-xs text-gray-400">Try searching for classes, exams, coursework, announcements, or profile.</p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {filteredResults.length} Result{filteredResults.length > 1 ? "s" : ""}
              </div>
              {filteredResults.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.href)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                      isSelected
                        ? "bg-blue-50 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200"
                        : "text-gray-800 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-900 dark:text-white">
                          {item.title}
                        </span>
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                          {item.category}
                        </span>
                      </div>
                      {item.description && (
                        <p className="truncate text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
