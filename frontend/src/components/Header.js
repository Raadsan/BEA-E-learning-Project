"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

export default function Header() {
  const [programsOpen, setProgramsOpen] = useState(false);
  const [beaValuesOpen, setBeaValuesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  const programsMenu = [
    {
      title: "General English Program For Adults",
      description: "Comprehensive program from beginner to advanced",
      icon: "chart",
      href: "/website/programs/8-level-general-english"
    },
    {
      title: "English for Specific Purposes (ESP) Program",
      description: "Tailored English for professional fields",
      icon: "grid",
      href: "/website/programs/esp"
    },
    {
      title: "IELTS and TOEFL Exam Preparation Courses",
      description: "Prepare for international English exams",
      icon: "user",
      href: "/website/programs/ielts-toefl"
    },
    {
      title: "Soft Skills and Workplace Training Programs",
      description: "Develop essential workplace competencies",
      icon: "wave",
      href: "/website/programs/professional-skills"
    },
    {
      title: "BEA Academic Writing Program",
      description: "Master academic and professional writing",
      icon: "pie",
      href: "/website/programs/academic-writing"
    },
    {
      title: "Digital Literacy and Virtual Communication Skills Program",
      description: "Build digital skills for modern communication",
      icon: "network",
      href: "/website/programs/digital-literacy"
    },
  ];

  const beaValuesMenu = [
    {
      title: "Rational Values",
      description: "Guiding principles for thoughtful learners",
      href: "/website/rational-values",
      icon: "lightbulb"
    },
    {
      title: "Pedagogical Values",
      description: "Student-centered teaching principles",
      href: "/website/pedagogical-values",
      icon: "book"
    },
    {
      title: "Civic Values",
      description: "Community responsibility and respect",
      href: "/website/civic-values",
      icon: "users"
    },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 backdrop-blur-lg border-b ${isDarkMode ? 'bg-[#03002e]/90 border-slate-800' : 'bg-white/90 border-gray-100 shadow-sm'}`} style={{ fontFamily: 'var(--font-opensans)' }}>
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-20 md:h-24">

          <div className="flex items-center flex-shrink-0 transition-transform duration-300 hover:scale-105">
            <Link href="/">
              <Image
                src={isDarkMode ? "/images/footerlogo-removebg-preview.png" : "/images/headerlogo.png"}
                alt="BEA Logo"
                width={380}
                height={190}
                className="h-20 sm:h-24 md:h-28 lg:h-30 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          {/* Navigation - Moved to the Top Row with tighter spacing */}
          <nav className="hidden xl:flex items-center gap-4 ml-4">
            <Link href="/" className={`text-sm font-semibold hover:opacity-70 transition-colors ${isDarkMode ? 'text-white' : 'text-[#010080]'}`}>
              Home
            </Link>

            <div className="relative group">
              <button
                onClick={() => {
                  setProgramsOpen(!programsOpen);
                  setBeaValuesOpen(false);
                }}
                className={`flex items-center gap-1 text-sm font-semibold hover:opacity-70 transition-colors ${isDarkMode ? 'text-white' : 'text-[#010080]'}`}
              >
                Programs
                <svg className={`w-4 h-4 transition-transform ${programsOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {programsOpen && (
                <div className={`absolute top-full left-0 mt-4 w-[500px] rounded-2xl shadow-2xl border p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-300 ${isDarkMode ? 'border-slate-700 bg-slate-900' : 'border-gray-100 bg-[#010080]'}`}>
                  <div className="grid grid-cols-2 gap-3">
                    {programsMenu.map((item, index) => (
                      <Link
                        key={index}
                        href={item.href}
                        className={`flex items-start gap-3 p-3 rounded-xl transition-all group ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-blue-900'}`}
                        onClick={() => setProgramsOpen(false)}
                      >
                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-700 text-blue-400' : 'bg-blue-800 text-blue-200'}`}>
                          {item.icon === "chart" && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                          {item.icon === "grid" && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
                          {item.icon === "user" && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                          {item.icon === "wave" && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
                          {item.icon === "pie" && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>}
                          {item.icon === "network" && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm mb-0.5 group-hover:text-blue-300 transition-colors">{item.title}</div>
                          <div className="text-[11px] text-gray-400 line-clamp-1 group-hover:text-gray-300">{item.description}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative group">
              <button
                onClick={() => {
                  setBeaValuesOpen(!beaValuesOpen);
                  setProgramsOpen(false);
                }}
                className={`flex items-center gap-1 text-sm font-semibold hover:opacity-70 transition-colors ${isDarkMode ? 'text-white' : 'text-[#010080]'}`}
              >
                BEA Values
                <svg className={`w-4 h-4 transition-transform ${beaValuesOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {beaValuesOpen && (
                <div className={`absolute top-full left-0 mt-4 w-72 rounded-2xl shadow-2xl border p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-300 ${isDarkMode ? 'border-slate-700 bg-slate-900' : 'border-gray-100 bg-[#010080]'}`}>
                  <div className="flex flex-col gap-1">
                    {beaValuesMenu.map((item, index) => (
                      <Link
                        key={index}
                        href={item.href}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all group ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-blue-900'}`}
                        onClick={() => setBeaValuesOpen(false)}
                      >
                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-700 text-blue-400' : 'bg-blue-800 text-blue-200'}`}>
                          {item.icon === "lightbulb" && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="24 24"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}
                          {item.icon === "book" && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
                          {item.icon === "users" && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                        </div>
                        <div className="font-bold text-white text-sm group-hover:text-blue-300 transition-colors">{item.title}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link href="/website/exams" className={`text-sm font-semibold hover:opacity-70 transition-colors ${isDarkMode ? 'text-white' : 'text-[#010080]'}`}>
              Exams
            </Link>
            <Link href="/website/contact-us" className={`text-sm font-semibold hover:opacity-70 transition-colors ${isDarkMode ? 'text-white' : 'text-[#010080]'}`}>
              Contact us
            </Link>
          </nav>

          {/* Right Section: Expandable Search, Actions */}
          <div className="flex items-center gap-3">

            {/* Expandable Search */}
            <div className="relative flex items-center justify-end">
              <div
                className={`flex items-center overflow-hidden transition-all duration-500 ease-in-out px-1 h-10 rounded-full border ${searchExpanded
                    ? `w-48 md:w-64 ${isDarkMode ? 'bg-slate-800 border-blue-500' : 'bg-gray-100 border-[#010080]'}`
                    : 'w-10 border-transparent hover:border-gray-200'
                  }`}
              >
                <button
                  onClick={() => setSearchExpanded(!searchExpanded)}
                  className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-[#010080]'
                    }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                <input
                  type="text"
                  placeholder="Search..."
                  autoFocus={searchExpanded}
                  className={`bg-transparent border-none outline-none text-xs font-medium px-2 transition-all duration-500 ${searchExpanded ? 'opacity-100 w-full' : 'opacity-0 w-0'
                    } ${isDarkMode ? 'text-white placeholder-slate-500' : 'text-[#010080] placeholder-gray-400'}`}
                />
              </div>
            </div>

            {/* Theme & Login */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-xl transition-all ${isDarkMode ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
              </button>

              <Link
                href="/auth/login"
                className={`hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg active:scale-95 ${isDarkMode ? 'bg-white text-[#010080] hover:bg-gray-100' : 'bg-[#010080] text-white hover:bg-[#0100a0]'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Login
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`xl:hidden p-2 rounded-xl border ${isDarkMode ? 'text-white border-slate-700' : 'text-[#010080] border-gray-100 bg-gray-50'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 space-y-4">
              {/* Mobile Search */}
              <div className="flex items-center border border-gray-300 rounded-full bg-gray-200">
                <input
                  type="text"
                  placeholder="Search course..."
                  className="outline-none text-sm px-3 py-2 text-gray-700 placeholder-gray-500 bg-transparent flex-1"
                />
                <div className="px-3 flex items-center">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Mobile Navigation Links */}
              <nav className="space-y-2">
                <Link href="/" className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors rounded-lg">
                  Home
                </Link>

                {/* Mobile Programs Dropdown */}
                <div>
                  <div className="w-full flex items-center justify-between px-4 py-2">
                    <Link
                      href="/website/programs"
                      className="text-gray-700 hover:text-red-600 transition-colors"
                    >
                      Programs
                    </Link>
                    <button
                      onClick={() => setProgramsOpen(!programsOpen)}
                      className="text-gray-700 hover:text-red-600 transition-colors"
                    >
                      <svg
                        className={`w-4 h-4 transition-transform ${programsOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  {programsOpen && (
                    <div className="mt-2 ml-4 space-y-1 bg-gray-50 rounded-lg p-2">
                      {programsMenu.map((item, index) => (
                        <Link
                          key={index}
                          href={item.href}
                          className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors rounded-lg text-sm"
                          onClick={() => {
                            setProgramsOpen(false);
                            setMobileMenuOpen(false);
                          }}
                        >
                          {item.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile BEA Values Dropdown */}
                <div>
                  <div className="w-full flex items-center justify-between px-4 py-2">
                    <Link
                      href="/website/bea-values"
                      className="text-gray-700 hover:text-red-600 transition-colors"
                    >
                      BEA Values
                    </Link>
                    <button
                      onClick={() => setBeaValuesOpen(!beaValuesOpen)}
                      className="text-gray-700 hover:text-red-600 transition-colors"
                    >
                      <svg
                        className={`w-4 h-4 transition-transform ${beaValuesOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  {beaValuesOpen && (
                    <div className="mt-2 ml-4 space-y-1 rounded-lg" style={{ backgroundColor: isDarkMode ? '#050040' : '#010080' }}>
                      {beaValuesMenu.map((item, index) => (
                        <Link
                          key={index}
                          href={item.href}
                          className={`flex items-start gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-lg transition-colors group text-sm ${isDarkMode ? 'hover:bg-[#03002e]' : 'hover:bg-blue-900'}`}
                          onClick={() => {
                            setBeaValuesOpen(false);
                            setMobileMenuOpen(false);
                          }}
                        >
                          {/* Icon */}
                          <div className="flex-shrink-0 mt-0.5">
                            {item.icon === "lightbulb" && (
                              <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.477.859h4z" />
                              </svg>
                            )}
                            {item.icon === "book" && (
                              <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                              </svg>
                            )}
                            {item.icon === "users" && (
                              <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                              </svg>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className={`font-bold text-white mb-0.5 sm:mb-1 text-xs sm:text-sm leading-tight ${isDarkMode ? 'group-hover:text-blue-300' : 'group-hover:text-blue-200'}`}>
                              {item.title}
                            </div>
                            <div className={`text-[10px] sm:text-xs leading-tight ${isDarkMode ? 'text-gray-400' : 'text-gray-300'}`}>
                              {item.description}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <Link href="/exams" className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                  Exams
                </Link>
                <Link href="/contact-us" className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                  Contact us
                </Link>
              </nav>

              {/* Mobile Icons */}
              <div className="pt-4 border-t border-gray-200 flex items-center justify-center">
                <button
                  onClick={toggleTheme}
                  className={`transition-colors ${isDarkMode ? 'text-yellow-300 hover:text-yellow-100' : 'text-gray-700 hover:text-gray-900'}`}
                  aria-label="Toggle theme"
                >
                  {isDarkMode ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Mobile Login Button */}
              <div className="pt-4">
                <Link
                  href="/auth/login"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-semibold text-sm transition-all duration-300 hover:opacity-90"
                  style={{ backgroundColor: '#010080' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Close dropdowns when clicking outside */}
      {(programsOpen || beaValuesOpen) && !mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setProgramsOpen(false);
            setBeaValuesOpen(false);
          }}
        />
      )}
    </header>
  );
}
