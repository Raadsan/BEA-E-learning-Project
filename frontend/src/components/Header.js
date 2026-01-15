"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

export default function Header() {
  const [programsOpen, setProgramsOpen] = useState(false);
  const [beaValuesOpen, setBeaValuesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <header className={`sticky top-0 z-50 shadow-sm transition-colors duration-300 ${isDarkMode ? 'bg-[#03002e]' : 'bg-white'}`} style={{ fontFamily: 'var(--font-opensans)' }}>
      {/* Top Blue Line Container */}
      <div className="w-full h-8 bg-[#010080]"></div>
      <div className={`container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 ${isDarkMode ? 'bg-[#03002e]' : 'bg-white'}`}>
        {/* First Row: Logo, Search, Icons */}
        <div className={`flex items-center justify-between pt-10 pb-8 -mt-0 h-12 ${isDarkMode ? 'bg-[#03002e]' : 'bg-white'}`}>
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Image
              src={isDarkMode ? "/images/footerlogo-removebg-preview.png" : "/images/headerlogo.png"}
              alt="BEA Logo"
              width={280}
              height={140}
              className="h-16 sm:h-20 md:h-24 lg:h-28 xl:h-32 w-auto object-contain"
              priority
            />
          </div>

          {/* Search Bar - Center */}
          <div className="hidden md:flex items-center flex-1 justify-center mx-4 max-w-2xl">
            <div className={`flex items-center rounded-xl px-4 py-2.5 w-full ${isDarkMode ? 'bg-white header-keep-white' : 'bg-gray-200'}`}>
              <input
                type="text"
                placeholder="Search course..."
                className={`header-search-input outline-none text-sm bg-transparent flex-1 ${isDarkMode ? 'text-gray-800 placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'}`}
              />
              <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Theme Toggle (Sun/Moon Icon) */}
            <button
              onClick={toggleTheme}
              className={`hidden lg:block transition-colors ${isDarkMode ? 'text-yellow-300 hover:text-yellow-100' : 'text-gray-600 hover:text-gray-800'}`}
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

            {/* Login Button */}
            <Link
              href="/auth/login"
              className={`hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 hover:opacity-90 ${isDarkMode ? 'bg-white header-keep-white' : 'bg-[#010080] text-white'}`}
              style={isDarkMode ? { color: '#010080' } : {}}
            >
              <svg className="w-5 h-5" fill="none" stroke={isDarkMode ? '#010080' : 'currentColor'} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span style={isDarkMode ? { color: '#010080' } : {}}>Login</span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-1 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Second Row: Navigation Links */}
        <div className={`pb-4 pt-2 ml-8 ${isDarkMode ? 'bg-[#03002e]' : 'bg-white'}`}>
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6 py-0 h-8 ml-0">
            <Link href="/" className={`text-sm xl:text-base hover:opacity-80 transition-colors ${isDarkMode ? 'text-white' : ''}`} style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
              Home
            </Link>

            {/* Programs Dropdown */}
            <div className="relative">
              <div className="flex items-center gap-1">
                <Link
                  href="/website/programs"
                  className="text-sm xl:text-base hover:opacity-80 transition-colors"
                  style={{ color: isDarkMode ? '#ffffff' : '#010080' }}
                >
                  Programs
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setProgramsOpen(!programsOpen);
                    setBeaValuesOpen(false);
                  }}
                  className="flex items-center hover:opacity-80"
                  style={{ color: isDarkMode ? '#ffffff' : '#010080' }}
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
                <div className={`absolute top-full left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 mt-2 w-[calc(100vw-2rem)] sm:w-[90vw] max-w-[480px] sm:max-w-[520px] md:max-w-[560px] rounded-lg shadow-lg border p-2 sm:p-3 z-50 ${isDarkMode ? 'border-[#1a1a3e] bg-[#050040]' : 'border-gray-200'}`} style={{ backgroundColor: isDarkMode ? '#050040' : '#010080' }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 grid-rows-6 sm:grid-rows-3 gap-2 sm:gap-3">
                    {programsMenu.map((item, index) => (
                      <Link
                        key={index}
                        href={item.href}
                        className={`flex items-start gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-lg transition-colors group ${isDarkMode ? 'hover:bg-[#03002e]' : 'hover:bg-blue-900'}`}
                        onClick={() => setProgramsOpen(false)}
                      >
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          {item.icon === "chart" && (
                            <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-300'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                            </svg>
                          )}
                          {item.icon === "grid" && (
                            <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-300'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                          )}
                          {item.icon === "user" && (
                            <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-300'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          )}
                          {item.icon === "wave" && (
                            <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          )}
                          {item.icon === "pie" && (
                            <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-300'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                            </svg>
                          )}
                          {item.icon === "network" && (
                            <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-300'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
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
                </div>
              )}
            </div>

            {/* BEA Values Dropdown */}
            <div className="relative">
              <div className="flex items-center gap-1">
                <Link
                  href="/website/bea-values"
                  className="text-sm xl:text-base hover:opacity-80 transition-colors"
                  style={{ color: isDarkMode ? '#ffffff' : '#010080' }}
                >
                  BEA Values
                </Link>
                <button
                  onClick={() => {
                    setBeaValuesOpen(!beaValuesOpen);
                    setProgramsOpen(false);
                  }}
                  className="flex items-center hover:opacity-80"
                  style={{ color: isDarkMode ? '#ffffff' : '#010080' }}
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
                <div className={`absolute top-full left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 mt-2 w-[calc(100vw-2rem)] sm:w-[90vw] max-w-[480px] sm:max-w-[520px] md:max-w-[560px] rounded-lg shadow-lg border p-2 sm:p-3 z-50 ${isDarkMode ? 'border-[#1a1a3e] bg-[#050040]' : 'border-gray-200'}`} style={{ backgroundColor: isDarkMode ? '#050040' : '#010080' }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 grid-rows-3 gap-2 sm:gap-3">
                    {beaValuesMenu.map((item, index) => (
                      <Link
                        key={index}
                        href={item.href}
                        className={`flex items-start gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-lg transition-colors group ${isDarkMode ? 'hover:bg-[#03002e]' : 'hover:bg-blue-900'}`}
                        onClick={() => setBeaValuesOpen(false)}
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
                </div>
              )}
            </div>

            <Link href="/website/exams" className="text-sm xl:text-base hover:opacity-80 transition-colors" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
              Exams
            </Link>
            <Link href="/website/contact-us" className="text-sm xl:text-base hover:opacity-80 transition-colors" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
              Contact
            </Link>
          </nav>
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
