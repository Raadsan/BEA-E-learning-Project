"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

export default function Footer() {
  const { isDarkMode, toggleTheme, setDarkMode } = useTheme();
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setThemeDropdownOpen(false);
      }
    };

    if (themeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [themeDropdownOpen]);

  const handleThemeSelect = (theme) => {
    if (theme === 'dark') {
      setDarkMode(true);
    } else if (theme === 'light') {
      setDarkMode(false);
    }
    setThemeDropdownOpen(false);
  };

  return (
    <footer className="text-white py-6 sm:py-8 lg:py-10" style={{ backgroundColor: isDarkMode ? '#03002e' : '#010080' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Logo Section */}
          <div className="flex flex-col items-center sm:items-start">
            <div className="mb-4 sm:mb-0">
              <Image
                src="/images/footerlogo-removebg-preview.png"
                alt="BEA THE BLUEPRINT ENGLISH ACADEMY"
                width={320}
                height={100}
                className="h-auto w-[220px] sm:w-[260px] md:w-[320px]"
                priority
              />
            </div>
            {/* Follow Us - aligned with Quick Links */}
            <div className="mt-4 sm:mt-auto sm:ml-5 text-center sm:text-left">
              <h3 className="text-sm font-semibold mb-3 text-white" style={{ fontFamily: 'var(--font-playfair)' }}>Follow Us</h3>
              <div className="flex gap-2 justify-center sm:justify-start">
                {/* Facebook */}
                <a href="#" className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'bg-transparent border border-white hover:bg-white/20' : 'bg-white hover:bg-gray-200'}`}>
                  <svg className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-[#010080]'}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                {/* Instagram */}
                <a href="#" className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${isDarkMode ? 'bg-transparent border border-white hover:bg-white/20' : 'bg-white hover:bg-gray-200'}`}>
                  <svg className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-[#010080]'}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                {/* Twitter/X */}
                <a href="#" className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'bg-transparent border border-white hover:bg-white/20' : 'bg-white hover:bg-gray-200'}`}>
                  <svg className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-[#010080]'}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                {/* YouTube */}
                <a href="#" className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'bg-transparent border border-white hover:bg-white/20' : 'bg-white hover:bg-gray-200'}`}>
                  <svg className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-[#010080]'}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
                {/* LinkedIn */}
                <a href="#" className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${isDarkMode ? 'bg-transparent border border-white hover:bg-white/20' : 'bg-white hover:bg-gray-200'}`}>
                  <svg className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-[#010080]'}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                {/* Telegram */}
                <a href="#" className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'bg-transparent border border-white hover:bg-white/20' : 'bg-white hover:bg-gray-200'}`}>
                  <svg className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-[#010080]'}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                </a>
                {/* TikTok */}
                <a href="#" className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'bg-transparent border border-white hover:bg-white/20' : 'bg-white hover:bg-gray-200'}`}>
                  <svg className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-[#010080]'}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h3 className="text-sm font-semibold mb-3 sm:mb-4" style={{ color: '#87CEEB', fontFamily: 'var(--font-playfair)' }}>Quick Links</h3>
            <ul className="space-y-2 text-sm text-white" style={{ fontFamily: 'var(--font-playfair)' }}>
              <li><Link href="/website/about-us" className="hover:text-gray-300 transition-colors">About Us</Link></li>
              <li><Link href="/website/programs" className="hover:text-gray-300 transition-colors">Our Programs</Link></li>
              <li><Link href="/website/bea-values" className="hover:text-gray-300 transition-colors">BEA Values</Link></li>
              <li><Link href="/website/exams" className="hover:text-gray-300 transition-colors">BEA Exams</Link></li>
              <li><a href="#" className="hover:text-gray-300 transition-colors">Student E-Learning Portal</a></li>
              <li><Link href="/website/student-support-centre" className="hover:text-gray-300 transition-colors">Student Support Centre</Link></li>
              <li><Link href="/website/contact-us" className="hover:text-gray-300 transition-colors">Contact Us</Link></li>
              <li><Link href="/#faq" className="hover:text-gray-300 transition-colors">FAQs</Link></li>
              <li><Link href="/website/blogs" className="hover:text-gray-300 transition-colors">Blogs</Link></li>
              <li><Link href="/website/events-news" className="hover:text-gray-300 transition-colors">Events and News</Link></li>
            </ul>
          </div>

          {/* Our Policies */}
          <div className="text-center sm:text-left">
            <h3 className="text-sm font-semibold mb-3 sm:mb-4" style={{ color: '#87CEEB', fontFamily: 'var(--font-playfair)' }}>Our Policies</h3>
            <ul className="space-y-2 text-sm text-white" style={{ fontFamily: 'var(--font-playfair)' }}>
              <li><Link href="/website/data-policy" className="hover:text-gray-300 transition-colors">Data Policy</Link></li>
              <li><Link href="/website/copyright-policy" className="hover:text-gray-300 transition-colors">Copyright Policy</Link></li>
              <li><Link href="/website/student-code-of-conduct" className="hover:text-gray-300 transition-colors">BEA Student Code of Conduct</Link></li>
              <li><Link href="/website/payment-refund-policy" className="hover:text-gray-300 transition-colors">Payment and Refund Policy</Link></li>
              <li><Link href="/student-engagement-policy" className="hover:text-gray-300 transition-colors">Student Engagement Policy</Link></li>
            </ul>
          </div>

          {/* Downloads */}
          <div className="text-center sm:text-left">
            <h3 className="text-sm font-semibold mb-3 sm:mb-4" style={{ color: '#87CEEB', fontFamily: 'var(--font-playfair)' }}>Downloads</h3>
            <ul className="space-y-2 text-sm text-white" style={{ fontFamily: 'var(--font-playfair)' }}>
              <li><a href="#" className="hover:text-gray-300 transition-colors">The BEA Handbook</a></li>
              <li><a href="#" className="hover:text-gray-300 transition-colors">BEA Programs Portfolio</a></li>
              <li><a href="#" className="hover:text-gray-300 transition-colors">IELTS and TOEFL Test Guide</a></li>
              <li><a href="#" className="hover:text-gray-300 transition-colors">A-Z Academic Writing Program Guide</a></li>
              <li><a href="#" className="hover:text-gray-300 transition-colors">ESP Program Guide</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar - aligned with Events and News */}
        <div className="border-t border-white/20 pt-4 sm:pt-6 mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm text-white" style={{ fontFamily: 'var(--font-playfair)' }}>
          <div>© Copyright 2025, All Rights Reserved</div>
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4">
            {/* Theme Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className="flex items-center gap-2 hover:text-gray-300 transition-colors"
                aria-label="Theme selection"
              >
                <span>Theme</span>
                <svg
                  className={`w-4 h-4 transition-transform ${themeDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {themeDropdownOpen && (
                <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 rounded-lg shadow-xl border overflow-hidden z-50 ${isDarkMode ? 'bg-white border-gray-300' : 'bg-white border-gray-200'
                  }`}>
                  <button
                    onClick={() => handleThemeSelect('light')}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center gap-3 ${!isDarkMode
                        ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        : 'text-black hover:bg-gray-50'
                      }`}
                  >
                    <svg className={`w-5 h-5 ${!isDarkMode ? 'text-blue-600' : 'text-black'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="font-medium">Light Mode</span>
                    {!isDarkMode && (
                      <svg className="w-4 h-4 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => handleThemeSelect('dark')}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center gap-3 border-t ${isDarkMode
                        ? 'bg-blue-50 hover:bg-blue-100 border-gray-200'
                        : 'text-black hover:bg-gray-50 border-gray-200'
                      }`}
                    style={isDarkMode ? { color: '#000000' } : {}}
                  >
                    <svg className={`w-5 h-5 ${isDarkMode ? 'text-blue-600' : 'text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    <span className="font-medium" style={isDarkMode ? { color: '#000000' } : {}}>Dark Mode</span>
                    {isDarkMode && (
                      <svg className="w-4 h-4 ml-auto" style={{ color: '#000000' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              )}
            </div>
            <Link href="/website/data-policy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms-and-conditions" className="hover:text-gray-300 transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

