"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

export default function Header() {
  const [programsOpen, setProgramsOpen] = useState(false);
  const [beaValuesOpen, setBeaValuesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileProgramsOpen, setMobileProgramsOpen] = useState(false);
  const [mobileValuesOpen, setMobileValuesOpen] = useState(false);
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
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isDarkMode ? 'bg-[#03002e]' : (mobileMenuOpen ? 'bg-white' : 'bg-white/95 backdrop-blur-sm')}`} style={{ fontFamily: 'var(--font-opensans)' }}>
      {/* Top Blue Line Container */}
      <div className="w-full h-8 bg-[#010080] flex items-center justify-center">
        <span className="text-white text-[10px] sm:text-xs font-semibold tracking-widest uppercase">Blue Print English Academy</span>
      </div>

      <div className="container mx-auto px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 md:h-24 lg:h-28 xl:h-32">
          {/* 1. Logo (Left Column) */}
          <div className="flex items-center relative h-full">
            <Link href="/" className="flex-shrink-0 flex items-center transition-transform hover:scale-105 duration-300 relative z-10">
              <Image
                src={isDarkMode ? "/images/footerlogo-removebg-preview.png" : "/images/headerlogo.png"}
                alt="BEA Logo"
                width={380}
                height={120}
                className="h-12 sm:h-16 md:h-20 lg:h-32 xl:h-40 2xl:h-44 w-auto object-contain drop-shadow-md"
                priority
              />
            </Link>
          </div>

          <nav className="hidden lg:flex items-center justify-start gap-2 lg:gap-3 xl:gap-4 2xl:gap-6 ml-2 lg:ml-5 xl:ml-10 2xl:ml-14 mr-2 lg:mr-3 xl:mr-4 flex-1 font-nav">
            <Link href="/" className={`text-base 2xl:text-lg font-medium tracking-wide transition-colors ${isDarkMode ? 'text-gray-200 hover:text-white' : 'text-[#010080] hover:text-blue-700'}`}>
              Home
            </Link>

            {/* Programs Dropdown (Cloudflare Style: Hover + Clickable) */}
            <div
              className="relative group flex items-center py-1"
              onMouseEnter={() => { setProgramsOpen(true); setBeaValuesOpen(false); }}
              onMouseLeave={() => setProgramsOpen(false)}
            >
              <Link href="/website/programs" className={`flex items-center gap-1.5 text-base 2xl:text-lg font-medium tracking-wide font-nav transition-colors py-2 px-1 rounded-lg ${isDarkMode ? 'text-gray-200 hover:text-white hover:bg-white/5' : 'text-[#010080] hover:text-blue-700 hover:bg-gray-50'}`}>
                Programs
                <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${programsOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
              </Link>
              {programsOpen && (
                <div className="absolute top-full left-0 lg:left-[-100px] xl:left-[-200px] pt-3 w-full lg:w-[700px] xl:w-[900px] z-[60] animate-fade-in translate-y-1.5">
                  {/* Dropdown Pointer (The Arrow) - Responsive Positioning */}
                  <div className={`absolute -top-1.5 left-[150px] lg:left-[200px] xl:left-[290px] w-4 h-4 rotate-45 ${isDarkMode ? 'bg-[#050040]' : 'bg-white'}`}></div>

                  <div className={`relative p-4 lg:p-5 xl:p-6 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border ${isDarkMode ? 'bg-[#050040] border-blue-900/30' : 'bg-white border-gray-100'}`}>
                    <div className="mb-3 lg:mb-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500/80 border-b border-blue-500/5 pb-2 lg:pb-3">Explore Our Programs</div>
                    <div className="grid grid-cols-3 gap-x-2 lg:gap-x-3 xl:gap-x-4 gap-y-3 lg:gap-y-4 xl:gap-y-5">
                      {programsMenu.map((item, index) => (
                        <Link key={index} href={item.href} className={`flex items-start gap-2 lg:gap-3 p-2 lg:p-3 rounded-lg lg:rounded-xl transition-all duration-300 font-nav group/item ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100/50'}`} onClick={() => setProgramsOpen(false)}>
                          <div className={`flex-shrink-0 p-1.5 lg:p-2 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                            {item.icon === "chart" && <svg className="w-4 h-4 lg:w-5 lg:h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V9l-7 7-7-7" /></svg>}
                            {item.icon === "grid" && <svg className="w-4 h-4 lg:w-5 lg:h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>}
                            {item.icon === "user" && <svg className="w-4 h-4 lg:w-5 lg:h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>}
                            {item.icon === "wave" && <svg className="w-4 h-4 lg:w-5 lg:h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                            {item.icon === "pie" && <svg className="w-4 h-4 lg:w-5 lg:h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
                            {item.icon === "network" && <svg className="w-4 h-4 lg:w-5 lg:h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                          </div>
                          <div>
                            <div className={`font-bold text-[11px] lg:text-xs mb-1 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900 group-hover/item:text-blue-600'}`}>{item.title}</div>
                            <div className={`text-[9px] lg:text-[10px] leading-snug tracking-normal transition-colors ${isDarkMode ? 'text-gray-400 group-hover/item:text-gray-300' : 'text-gray-600 group-hover/item:text-gray-800'}`}>{item.description}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Values Dropdown (Cloudflare Style: Hover + Clickable) */}
            <div
              className="relative group flex items-center py-1"
              onMouseEnter={() => { setBeaValuesOpen(true); setProgramsOpen(false); }}
              onMouseLeave={() => setBeaValuesOpen(false)}
            >
              <Link href="/website/bea-values" className={`flex items-center gap-1.5 text-base 2xl:text-lg font-medium tracking-wide font-nav transition-colors py-2 px-1 rounded-lg ${isDarkMode ? 'text-gray-200 hover:text-white hover:bg-white/5' : 'text-[#010080] hover:text-blue-700 hover:bg-gray-50'}`}>
                Values
                <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${beaValuesOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
              </Link>
              {beaValuesOpen && (
                <div className="absolute top-full left-0 lg:left-[-50px] xl:left-[-150px] pt-3 w-full lg:w-[700px] xl:w-[800px] 2xl:w-[850px] z-[60] animate-fade-in translate-y-1.5">
                  {/* Dropdown Pointer (The Arrow) - Responsive Positioning */}
                  <div className={`absolute -top-1.5 left-[100px] lg:left-[135px] xl:left-[185px] w-4 h-4 rotate-45 ${isDarkMode ? 'bg-[#050040]' : 'bg-white'}`}></div>

                  <div className={`relative p-8 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border ${isDarkMode ? 'bg-[#050040] border-blue-900/30' : 'bg-white border-gray-100'}`}>
                    <div className="mb-6 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-blue-500/80 border-b border-blue-500/5 pb-4">Values & Principles</div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 lg:gap-x-8 gap-y-6 lg:gap-y-10">
                      {beaValuesMenu.map((item, index) => (
                        <Link key={index} href={item.href} className={`flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 font-nav group/item ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100/50'}`} onClick={() => setBeaValuesOpen(false)}>
                          <div className={`flex-shrink-0 p-3 rounded-xl ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                            {item.icon === "lightbulb" && <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}
                            {item.icon === "book" && <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
                            {item.icon === "users" && <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                          </div>
                          <div>
                            <div className={`font-bold text-sm mb-1.5 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900 group-hover/item:text-blue-600'}`}>{item.title}</div>
                            <div className={`text-xs leading-normal tracking-normal transition-colors ${isDarkMode ? 'text-gray-400 group-hover/item:text-gray-300' : 'text-gray-600 group-hover/item:text-gray-800'}`}>{item.description}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link href="/website/exams" className={`text-base 2xl:text-lg font-medium tracking-wide transition-colors ${isDarkMode ? 'text-gray-200 hover:text-white' : 'text-[#010080] hover:text-blue-700'}`}>Exams</Link>
            <Link href="/website/contact-us" className={`text-base 2xl:text-lg font-medium tracking-wide transition-colors ${isDarkMode ? 'text-gray-200 hover:text-white' : 'text-[#010080] hover:text-blue-700'}`}>Contact</Link>
          </nav>

          {/* 3. Actions (Right Column) - Compact Spacing */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 xl:gap-5">
            {/* Responsive Search Bar - Fixed Widths */}
            <div className="hidden md:block w-40 lg:w-52 xl:w-64 2xl:w-80">
              <div className={`flex items-center w-full px-2 md:px-3 lg:px-4 py-2 md:py-2.5 lg:py-3 rounded-lg lg:rounded-xl border transition-all duration-300 focus-within:shadow-md ${isDarkMode ? 'bg-[#050040] border-blue-900/50' : 'bg-gray-50 border-gray-200 focus-within:bg-white'}`}>
                <input type="text" placeholder="Search..." className={`outline-none text-[11px] md:text-xs bg-transparent w-full ${isDarkMode ? 'text-gray-200 placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'}`} />
                <svg className={`w-3.5 h-3.5 md:w-4 md:h-4 lg:w-4.5 lg:h-4.5 ml-1.5 md:ml-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>

            <button onClick={toggleTheme} className={`p-2 rounded-xl transition-all duration-300 ${isDarkMode ? 'text-yellow-300 hover:text-yellow-200' : 'text-gray-600 hover:text-blue-600'}`}>
              {isDarkMode ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
            </button>
            <Link href="/auth/login" className={`hidden lg:flex items-center justify-center w-24 py-2.5 rounded-lg font-semibold transition-all duration-300 shadow-sm hover:shadow-md text-base ${isDarkMode ? '!bg-white !text-black hover:!bg-white/90' : 'bg-[#010080] text-white hover:bg-[#010060]'}`}>
              <span className={isDarkMode ? '!text-[#03002e]' : ''}>Sign In</span>
            </Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-lg transition-colors text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Responsive Positioning */}
      <div className={`lg:hidden fixed inset-x-0 top-[calc(2rem+4rem)] sm:top-[calc(2rem+5rem)] md:top-[calc(2rem+6rem)] bg-white dark:bg-[#03002e] shadow-[0_15px_30px_rgba(0,0,0,0.05)] transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-[85vh] opacity-100' : 'max-h-0 opacity-0'}`} style={{ zIndex: 45 }}>
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[80vh]">
          {/* Mobile Search Bar - Compact & Borderless Side */}
          <div className={`flex items-center w-full px-4 py-2.5 rounded-xl border-b transition-all duration-300 ${isDarkMode ? 'bg-white/5 border-blue-900/20' : 'bg-[#f8fafc]/50 border-gray-100/50'}`}>
            <input type="text" placeholder="Search course..." className={`outline-none text-sm bg-transparent w-full ${isDarkMode ? 'text-gray-200 placeholder-gray-500' : 'text-gray-600 placeholder-gray-400'}`} />
            <svg className={`w-4 h-4 ml-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>

          {/* Mobile Navigation - Plain Background (Qafiif) */}
          <div className="flex flex-col">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-50 dark:border-white/5 group" onClick={() => setMobileMenuOpen(false)}>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              <span className={`font-bold text-sm sm:text-base ${isDarkMode ? 'text-gray-200' : 'text-[#010060]'}`}>Home</span>
            </Link>

            <div className="border-b border-gray-50 dark:border-white/5">
              <div className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                <Link href="/website/programs" className="flex items-center gap-3 flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  <span className={`font-bold text-sm sm:text-base ${isDarkMode ? 'text-gray-200' : 'text-[#010060]'}`}>Programs</span>
                </Link>
                <button onClick={(e) => { e.stopPropagation(); setMobileProgramsOpen(!mobileProgramsOpen); }} className="p-1 -mr-1">
                  <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${mobileProgramsOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>
              {mobileProgramsOpen && (
                <div className="mb-2 space-y-0.5 pl-12 bg-gray-50/30 dark:bg-white/5">
                  {programsMenu.map((p, i) => (
                    <Link key={i} href={p.href} className="block py-2 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white transition-colors" onClick={() => { setMobileMenuOpen(false); setMobileProgramsOpen(false); }}>
                      {p.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="border-b border-gray-50 dark:border-white/5">
              <div className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                <Link href="/website/bea-values" className="flex items-center gap-3 flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  <span className={`font-bold text-sm sm:text-base ${isDarkMode ? 'text-gray-200' : 'text-[#010060]'}`}>BEA Values</span>
                </Link>
                <button onClick={(e) => { e.stopPropagation(); setMobileValuesOpen(!mobileValuesOpen); }} className="p-1 -mr-1">
                  <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${mobileValuesOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>
              {mobileValuesOpen && (
                <div className="mb-2 space-y-0.5 pl-12 bg-gray-50/30 dark:bg-white/5">
                  {beaValuesMenu.map((v, i) => (
                    <Link key={i} href={v.href} className="block py-2 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white transition-colors" onClick={() => { setMobileMenuOpen(false); setMobileValuesOpen(false); }}>
                      {v.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/website/exams" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-50 dark:border-white/5 group" onClick={() => setMobileMenuOpen(false)}>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              <span className={`font-bold text-sm sm:text-base ${isDarkMode ? 'text-gray-200' : 'text-[#010060]'}`}>Exams</span>
            </Link>

            <Link href="/website/contact-us" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-50 dark:border-white/5 group" onClick={() => setMobileMenuOpen(false)}>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              <span className={`font-bold text-sm sm:text-base ${isDarkMode ? 'text-gray-200' : 'text-[#010060]'}`}>Contact</span>
            </Link>
          </div>

          {/* Bottom Actions - Responsive Sign In Button */}
          <div className="pt-2">
            <Link
              href="/auth/login"
              className={`block w-full px-4 py-3.5 rounded-xl font-bold text-center shadow-lg transition-all duration-300 text-sm sm:text-base ${isDarkMode
                ? '!bg-white !text-black hover:!bg-white/90 shadow-white/5'
                : 'bg-[#010080] text-white hover:bg-[#010060]'
                }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className={isDarkMode ? '!text-black' : ''}>Sign In</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Overlay - Starts below header so it doesn't darken the header itself */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 top-[112px] sm:top-[128px] lg:top-[160px] bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      {(programsOpen || beaValuesOpen) && !mobileMenuOpen && (
        <div
          className="fixed inset-0 top-[112px] sm:top-[128px] lg:top-[160px] z-40 lg:hidden"
          onClick={() => { setProgramsOpen(false); setBeaValuesOpen(false); }}
        />
      )}
    </header>
  );
}
