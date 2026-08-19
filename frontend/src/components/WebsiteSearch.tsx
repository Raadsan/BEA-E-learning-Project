"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

interface SiteSearchItem {
  id: string;
  title: string;
  category: "Programs" | "Values" | "Exams & Tests" | "Policies" | "About & Support";
  href: string;
  keywords: string[];
  description: string;
}

const WEBSITE_INDEX: SiteSearchItem[] = [
  // Programs
  {
    id: "p-general-english",
    title: "General English Program For Adults",
    category: "Programs",
    href: "/website/programs/8-level-general-english",
    keywords: ["general english", "adults", "beginner", "intermediate", "advanced", "8 levels", "speaking", "grammar", "reading", "writing"],
    description: "Comprehensive 8-level English program from beginner to advanced fluency."
  },
  {
    id: "p-esp",
    title: "English for Specific Purposes (ESP) Program",
    category: "Programs",
    href: "/website/programs/esp",
    keywords: ["esp", "business english", "medical english", "legal english", "aviation english", "professional fields", "specialized"],
    description: "Tailored English training designed for specific industry and career needs."
  },
  {
    id: "p-ielts-toefl",
    title: "IELTS and TOEFL Exam Preparation Courses",
    category: "Programs",
    href: "/website/programs/ielts-toefl",
    keywords: ["ielts", "toefl", "band score", "international exam", "study abroad", "test preparation", "listening", "speaking"],
    description: "Targeted preparation courses for international English certification exams."
  },
  {
    id: "p-soft-skills",
    title: "Soft Skills & Workplace Training Programs",
    category: "Programs",
    href: "/website/programs/professional-skills",
    keywords: ["soft skills", "workplace", "leadership", "public speaking", "presentation", "communication", "career"],
    description: "Essential workplace competencies, communication, and professional growth."
  },
  {
    id: "p-academic-writing",
    title: "BEA Academic Writing Program",
    category: "Programs",
    href: "/website/programs/academic-writing",
    keywords: ["academic writing", "research paper", "essay writing", "thesis", "citations", "formal writing", "publications"],
    description: "Master scholarly and professional writing with rigorous university standards."
  },
  {
    id: "p-digital-literacy",
    title: "Digital Literacy & Virtual Communication Skills",
    category: "Programs",
    href: "/website/programs/digital-literacy",
    keywords: ["digital literacy", "virtual communication", "remote work", "computer skills", "email etiquette", "online collaboration"],
    description: "Build modern digital competencies for remote work and global communication."
  },
  {
    id: "p-all-programs",
    title: "All Academic Programs",
    category: "Programs",
    href: "/website/programs",
    keywords: ["programs", "courses", "curriculum", "all programs", "catalogue", "degrees"],
    description: "Explore all available academic programs and learning pathways."
  },

  // Values
  {
    id: "v-all-values",
    title: "BEA Core Values & Principles",
    category: "Values",
    href: "/website/bea-values",
    keywords: ["values", "principles", "mission", "vision", "philosophy", "ethos"],
    description: "Discover the foundational values that drive the Blueprint English Academy."
  },
  {
    id: "v-rational",
    title: "Rational Values",
    category: "Values",
    href: "/website/rational-values",
    keywords: ["rational values", "critical thinking", "logic", "reasoning", "thoughtful learners", "intellectual honesty"],
    description: "Guiding principles that cultivate critical thinking, evidence-based reasoning, and intellectual integrity."
  },
  {
    id: "v-pedagogical",
    title: "Pedagogical Values",
    category: "Values",
    href: "/website/pedagogical-values",
    keywords: ["pedagogical values", "teaching principles", "student-centered", "active learning", "interactive classroom", "methodology"],
    description: "Student-centered instructional methodologies and world-class language acquisition."
  },
  {
    id: "v-civic",
    title: "Civic Values",
    category: "Values",
    href: "/website/civic-values",
    keywords: ["civic values", "community", "citizenship", "ethics", "social responsibility", "respect", "diversity"],
    description: "Fostering ethical leadership, community responsibility, and mutual respect."
  },

  // Exams & Tests
  {
    id: "e-all-exams",
    title: "Exams & Assessments Hub",
    category: "Exams & Tests",
    href: "/website/exams",
    keywords: ["exams", "assessments", "tests", "evaluations", "exam center", "register for exam"],
    description: "Information on all official tests, testing dates, and registration procedures."
  },
  {
    id: "e-ielts-registration",
    title: "IELTS & TOEFL Exam Registration",
    category: "Exams & Tests",
    href: "/website/exams/ielts-toefl",
    keywords: ["ielts registration", "toefl registration", "book exam", "sign up ielts", "exam dates", "fees"],
    description: "Official registration portal for IELTS and TOEFL preparation cycles."
  },
  {
    id: "e-proficiency-test",
    title: "English Proficiency Test Registration",
    category: "Exams & Tests",
    href: "/website/exams/proficiency-test",
    keywords: ["proficiency test", "placement", "english test", "take test", "assessment fee"],
    description: "Register and take the standardized BEA English proficiency assessment."
  },

  // About & Support
  {
    id: "a-about",
    title: "About Us",
    category: "About & Support",
    href: "/website/about-us",
    keywords: ["about", "about bea", "blueprint english academy", "who we are", "leadership", "story", "campus"],
    description: "Learn about the mission, history, and vision of Blueprint English Academy."
  },
  {
    id: "a-why-choose-us",
    title: "Why Choose BEA",
    category: "About & Support",
    href: "/website/why-choose-us",
    keywords: ["why choose us", "benefits", "advantages", "features", "success rate", "reasons"],
    description: "Discover what makes BEA the premier English academy in East Africa."
  },
  {
    id: "a-contact",
    title: "Contact Us & Inquiries",
    category: "About & Support",
    href: "/website/contact-us",
    keywords: ["contact", "email", "phone", "location", "address", "inquiry", "support", "help", "whatsapp"],
    description: "Get in touch with our admissions and student support teams."
  },
  {
    id: "a-faqs",
    title: "Frequently Asked Questions (FAQs)",
    category: "About & Support",
    href: "/website/faqs",
    keywords: ["faq", "questions", "answers", "tuition", "classes schedule", "how to enroll", "payments"],
    description: "Answers to common questions about enrollment, classes, and payments."
  },
  {
    id: "a-support-centre",
    title: "Student Support Centre",
    category: "About & Support",
    href: "/website/support-centre",
    keywords: ["support", "helpdesk", "student support", "assistance", "technical support", "advising"],
    description: "Dedicated assistance and advising for current and prospective students."
  },

  // Policies
  {
    id: "pol-terms",
    title: "Terms and Conditions",
    category: "Policies",
    href: "/website/terms-and-conditions",
    keywords: ["terms", "conditions", "user agreement", "terms of service", "legal"],
    description: "General terms and conditions governing the use of BEA services."
  },
  {
    id: "pol-data",
    title: "Data Protection & Privacy Policy",
    category: "Policies",
    href: "/website/data-policy",
    keywords: ["data policy", "privacy policy", "personal data", "security", "gdpr"],
    description: "How we collect, protect, and handle your private data."
  },
  {
    id: "pol-conduct",
    title: "Student Code of Conduct",
    category: "Policies",
    href: "/website/student-code-of-conduct",
    keywords: ["code of conduct", "student rules", "ethics", "discipline", "academic honesty", "plagiarism"],
    description: "Behavioral and academic standards expected from all enrolled students."
  },
  {
    id: "pol-engagement",
    title: "Student Engagement Policy",
    category: "Policies",
    href: "/website/student-engagement-policy",
    keywords: ["engagement policy", "attendance policy", "participation", "deadlines", "assignment submission"],
    description: "Guidelines on class participation, attendance benchmarks, and academic milestones."
  },
  {
    id: "pol-refund",
    title: "Payment & Refund Policy",
    category: "Policies",
    href: "/website/payment-refund-policy",
    keywords: ["refund policy", "tuition refund", "payment terms", "waafi", "cancellation", "fees"],
    description: "Clear rules regarding tuition fees, payment processing, and refund eligibility."
  },
  {
    id: "pol-copyright",
    title: "Copyright & Intellectual Property Policy",
    category: "Policies",
    href: "/website/copyright-policy",
    keywords: ["copyright", "intellectual property", "materials usage", "trademark", "proprietary content"],
    description: "Regulations on the use and distribution of BEA curriculum and media."
  },
];

export default function WebsiteSearch({
  className = "",
  placeholder = "Search programs, tests, values...",
}: {
  className?: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return WEBSITE_INDEX.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchCategory = item.category.toLowerCase().includes(q);
      const matchDescription = item.description.toLowerCase().includes(q);
      const matchKeywords = item.keywords.some((k) => k.toLowerCase().includes(q));
      return matchTitle || matchCategory || matchDescription || matchKeywords;
    });
  }, [query]);

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

  const getCategoryColor = (category: SiteSearchItem["category"]) => {
    switch (category) {
      case "Programs":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
      case "Exams & Tests":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300";
      case "Values":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300";
      case "Policies":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className={`flex items-center w-full px-2.5 md:px-3 py-1.5 md:py-2 rounded-lg border transition-all duration-300 focus-within:shadow-md ${
          isDarkMode
            ? "bg-[#050040] border-blue-900/50 focus-within:border-blue-500"
            : "bg-gray-50 border-gray-200 focus-within:bg-white focus-within:border-blue-500"
        }`}
      >
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
          className={`outline-none text-[11px] md:text-xs bg-transparent w-full ${
            isDarkMode ? "text-gray-200 placeholder-gray-500" : "text-gray-700 placeholder-gray-400"
          }`}
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className={`text-xs ml-1.5 ${isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-400 hover:text-gray-700"}`}
          >
            ✕
          </button>
        ) : (
          <svg
            className={`w-3.5 h-3.5 md:w-4 md:h-4 ml-1.5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
      </div>

      {/* Live Dropdown Results */}
      {isOpen && query.trim() !== "" && (
        <div
          className={`absolute left-0 right-0 md:left-auto md:right-0 top-full z-[100] mt-2 w-full md:w-[420px] lg:w-[480px] max-h-96 overflow-y-auto rounded-xl border p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-150 ${
            isDarkMode ? "bg-[#050040] border-blue-900/60" : "bg-white border-gray-200"
          }`}
        >
          {filteredResults.length === 0 ? (
            <div className="p-6 text-center text-xs">
              <p className={`font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                No matches found for &ldquo;{query}&rdquo;
              </p>
              <p className={`mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                Try searching for General English, IELTS, Values, Exams, or Policies.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-400"}`}>
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
                    className={`flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                      isSelected
                        ? isDarkMode
                          ? "bg-blue-900/40 text-blue-200"
                          : "bg-blue-50 text-blue-900"
                        : isDarkMode
                        ? "text-gray-200 hover:bg-white/5"
                        : "text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`font-semibold text-xs ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                          {item.title}
                        </span>
                        <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </span>
                      </div>
                      <p className={`text-[11px] leading-snug line-clamp-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {item.description}
                      </p>
                    </div>
                    <svg className={`h-3.5 w-3.5 shrink-0 mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
