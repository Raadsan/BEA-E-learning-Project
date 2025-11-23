"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const [programsOpen, setProgramsOpen] = useState(false);
  const [beaValuesOpen, setBeaValuesOpen] = useState(false);
  const [toggleOn, setToggleOn] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const programsMenu = [
    {
      title: "8- Level General English Course for Adults",
      description: "Comprehensive program from beginner to advanced",
      icon: "chart"
    },
    {
      title: "English for Specific Purposes (ESP)",
      description: "Tailored English for professional fields",
      icon: "grid"
    },
    {
      title: "IELTS & TOFEL Preparation Course",
      description: "Prepare for international English exams",
      icon: "user"
    },
    {
      title: "Professional Skills and Training Programs",
      description: "Develop essential workplace competencies",
      icon: "wave"
    },
    {
      title: "Advanced Academic Writing Program",
      description: "Master academic and professional writing",
      icon: "pie"
    },
    {
      title: "Digital Literacy and Virtual Communication",
      description: "Build digital skills for modern communication",
      icon: "network"
    },
  ];

  const beaValuesMenu = [
    "Our Mission",
    "Our Vision",
    "Our Values",
    "Why Choose BEA",
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Image
              src="/images/headerlogo.png"
              alt="BEA Logo"
              width={200}
              height={100}
              className="h-10 sm:h-12 md:h-14 lg:h-24 xl:h-28 w-auto object-contain"
              priority
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
            <Link href="/" className="text-sm xl:text-base text-gray-700 hover:text-red-600 transition-colors">
              Home
            </Link>
            
            {/* Programs Dropdown */}
            <div className="relative">
              <div className="flex items-center gap-1">
                <Link
                  href="/programs"
                  className="text-sm xl:text-base text-red-600 font-semibold hover:text-red-700 transition-colors"
                >
                  Programs
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setProgramsOpen(!programsOpen);
                    setBeaValuesOpen(false);
                  }}
                  className="flex items-center text-red-600 hover:text-red-700"
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
                <div className="absolute top-full left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 mt-2 w-[calc(100vw-2rem)] sm:w-[90vw] max-w-[480px] sm:max-w-[520px] md:max-w-[560px] rounded-lg shadow-lg border border-gray-200 p-2 sm:p-3 z-50" style={{ backgroundColor: '#010080' }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 grid-rows-6 sm:grid-rows-3 gap-2 sm:gap-3">
                    {programsMenu.map((item, index) => {
                      const href = index === 0 ? "/programs/8-level-general-english" : "#";
                      return (
                      <Link
                        key={index}
                        href={href}
                        className="flex items-start gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-lg hover:bg-blue-900 transition-colors group"
                        onClick={() => setProgramsOpen(false)}
                      >
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          {item.icon === "chart" && (
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                            </svg>
                          )}
                          {item.icon === "grid" && (
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                          )}
                          {item.icon === "user" && (
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          )}
                          {item.icon === "wave" && (
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          )}
                          {item.icon === "pie" && (
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                            </svg>
                          )}
                          {item.icon === "network" && (
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                            </svg>
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-white mb-0.5 sm:mb-1 text-xs sm:text-sm group-hover:text-blue-200 leading-tight">
                            {item.title}
                          </div>
                          <div className="text-[10px] sm:text-xs text-gray-300 leading-tight">
                            {item.description}
                          </div>
                        </div>
                      </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* BEA Values Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setBeaValuesOpen(!beaValuesOpen);
                  setProgramsOpen(false);
                }}
                className="flex items-center gap-1 text-sm xl:text-base text-gray-700 hover:text-red-600 transition-colors"
              >
                BEA Values
                <svg
                  className={`w-4 h-4 transition-transform ${beaValuesOpen ? "rotate-90" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              {beaValuesOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 md:w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {beaValuesMenu.map((item, index) => (
                    <a
                      key={index}
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                      onClick={() => setBeaValuesOpen(false)}
                    >
                      {item}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <a href="#" className="text-sm xl:text-base text-gray-700 hover:text-red-600 transition-colors">
              Exams
            </a>
            <a href="#" className="text-sm xl:text-base text-gray-700 hover:text-red-600 transition-colors">
              Contact us
            </a>
          </nav>

          {/* Search and User Actions */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            {/* Search Input - Hidden on mobile, visible on tablet+ */}
            <div className="hidden md:flex items-center border border-gray-300 rounded-lg bg-white">
              <input
                type="text"
                placeholder="Search"
                className="outline-none text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2 text-gray-400 placeholder-gray-400 bg-transparent w-24 md:w-32 lg:w-40"
              />
              <div className="px-2 md:px-3 flex items-center">
                <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Toggle Switch - Hidden on mobile, visible on tablet+ */}
            <button
              onClick={() => setToggleOn(!toggleOn)}
              className="hidden md:flex items-center relative w-12 md:w-14 h-6 md:h-7 rounded-full bg-pink-200 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              <div
                className={`absolute w-5 h-5 md:w-6 md:h-6 rounded-full transition-all duration-200 flex items-center justify-center ${
                  toggleOn ? "bg-pink-500 right-0.5" : "bg-gray-400 left-0.5"
                }`}
              >
                <svg className="w-3 h-3 md:w-3.5 md:h-3.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </button>

            {/* Login Button */}
            <button className="bg-red-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-red-700 transition-colors text-xs sm:text-sm font-bold whitespace-nowrap">
              Login
            </button>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-gray-700 p-1"
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
              <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                <input
                  type="text"
                  placeholder="Search"
                  className="outline-none text-sm px-3 py-2 text-gray-400 placeholder-gray-400 bg-transparent flex-1"
                />
                <div className="px-3 flex items-center">
                  <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      href="/programs"
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
                    <div className="mt-2 ml-4 space-y-1" style={{ backgroundColor: '#010080' }}>
                      {programsMenu.map((item, index) => {
                        const href = index === 0 ? "/programs/8-level-general-english" : "#";
                        return (
                        <Link
                          key={index}
                          href={href}
                          className="block px-4 py-2 text-white hover:bg-blue-900 transition-colors rounded-lg text-sm"
                          onClick={() => {
                            setProgramsOpen(false);
                            setMobileMenuOpen(false);
                          }}
                        >
                          {item.title}
                        </Link>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Mobile BEA Values Dropdown */}
                <div>
                  <button
                    onClick={() => setBeaValuesOpen(!beaValuesOpen)}
                    className="w-full flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors rounded-lg"
                  >
                    <span>BEA Values</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${beaValuesOpen ? "rotate-90" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  {beaValuesOpen && (
                    <div className="mt-2 ml-4 space-y-1">
                      {beaValuesMenu.map((item, index) => (
                        <a
                          key={index}
                          href="#"
                          className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors rounded-lg text-sm"
                          onClick={() => {
                            setBeaValuesOpen(false);
                            setMobileMenuOpen(false);
                          }}
                        >
                          {item}
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors rounded-lg">
                  Exams
                </a>
                <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors rounded-lg">
                  Contact us
                </a>
              </nav>

              {/* Mobile Toggle Switch */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between px-4">
                  <span className="text-sm text-gray-700">Theme</span>
                  <button
                    onClick={() => setToggleOn(!toggleOn)}
                    className="flex items-center relative w-14 h-7 rounded-full bg-pink-200 transition-colors duration-200"
                    aria-label="Toggle theme"
                  >
                    <div
                      className={`absolute w-6 h-6 rounded-full transition-all duration-200 flex items-center justify-center ${
                        toggleOn ? "bg-pink-500 right-0.5" : "bg-gray-400 left-0.5"
                      }`}
                    >
                      <svg className="w-3.5 h-3.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </button>
                </div>
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
