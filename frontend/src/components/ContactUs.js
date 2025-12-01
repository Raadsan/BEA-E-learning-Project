"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";

export default function ContactUs() {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  
  const [visibleSections, setVisibleSections] = useState({});
  const sectionRefs = {
    hero: useRef(null),
    contact: useRef(null),
    schedule: useRef(null),
    form: useRef(null),
  };

  useEffect(() => {
    const observers = [];
    Object.entries(sectionRefs).forEach(([key, ref]) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => ({ ...prev, [key]: true }));
          }
        },
        { threshold: 0.1 }
      );
      if (ref.current) observer.observe(ref.current);
      observers.push(observer);
    });
    return () => observers.forEach(obs => obs.disconnect());
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
    // Reset form
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#03002e]' : 'bg-gray-50'}`}>
      {/* Get In Touch Section */}
      <section 
        ref={sectionRefs.hero}
        className="relative flex items-center justify-center py-16 sm:py-20 overflow-hidden"
        style={{
          background: isDarkMode 
            ? 'linear-gradient(135deg, #03002e 0%, #050040 50%, #03002e 100%)'
            : 'linear-gradient(135deg, #1a237e 0%, #311b92 50%, #b71c1c 100%)'
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 ${visibleSections.hero ? 'animate-fade-in-down' : 'opacity-0'}`}>
            Get In Touch With Us
          </h1>
          <p className={`text-2xl sm:text-3xl font-bold text-white mb-6 ${visibleSections.hero ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            We&apos;re here to help you <span className="text-3xl sm:text-4xl">24/7</span>
          </p>
          <p className={`text-white text-base sm:text-lg max-w-3xl mx-auto ${visibleSections.hero ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
            Have questions about our courses, need support, or want to discuss your learning goals? Our team is ready to assist you on your educational journey.
          </p>
        </div>
      </section>

      {/* Contact Information Section */}
      <section ref={sectionRefs.contact} className={`py-12 sm:py-16 lg:py-20 overflow-hidden ${isDarkMode ? 'bg-[#03002e]' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className={`rounded-lg shadow-md p-6 sm:p-8 ${visibleSections.contact ? 'animate-scale-in' : 'opacity-0'} ${isDarkMode ? 'bg-[#050040]' : 'bg-white'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Address */}
              <div className={`flex items-start gap-4 ${visibleSections.contact ? 'animate-fade-in-left' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-white header-keep-white' : 'bg-[#010080]'}`}>
                    <svg className={`w-6 h-6 ${isDarkMode ? 'text-[#010080]' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Address</h3>
                  <p className={isDarkMode ? 'text-white' : 'text-gray-700'}>HQ: Taleex, Hodan Distract Mogadishu Somalia</p>
                </div>
              </div>

              {/* Phone */}
              <div className={`flex items-start gap-4 ${visibleSections.contact ? 'animate-fade-in-right' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-white header-keep-white' : 'bg-[#010080]'}`}>
                    <svg className={`w-6 h-6 ${isDarkMode ? 'text-[#010080]' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Phone</h3>
                  <p className={isDarkMode ? 'text-white' : 'text-gray-700'}>+252 61 123-4567</p>
                </div>
              </div>

              {/* Email */}
              <div className={`flex items-start gap-4 ${visibleSections.contact ? 'animate-fade-in-left' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-white header-keep-white' : 'bg-[#010080]'}`}>
                    <svg className={`w-6 h-6 ${isDarkMode ? 'text-[#010080]' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Email</h3>
                  <p className={isDarkMode ? 'text-white' : 'text-gray-700'}>admission@beaportal.com</p>
                </div>
              </div>

              {/* Follow Us */}
              <div className={`flex items-start gap-4 ${visibleSections.contact ? 'animate-fade-in-right' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-white header-keep-white' : 'bg-[#010080]'}`}>
                    <svg className={`w-6 h-6 ${isDarkMode ? 'text-[#010080]' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Follow Us</h3>
                  <div className="flex gap-2">
                    {/* Facebook */}
                    <a href="#" className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'bg-white header-keep-white hover:bg-gray-100' : 'bg-[#010080] hover:bg-[#010060]'}`}>
                      <svg className={`w-5 h-5 ${isDarkMode ? 'text-[#010080]' : 'text-white'}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>
                    {/* Instagram */}
                    <a href="#" className={`w-10 h-10 rounded-md flex items-center justify-center transition-colors ${isDarkMode ? 'bg-white header-keep-white hover:bg-gray-100' : 'bg-[#010080] hover:bg-[#010060]'}`}>
                      <svg className={`w-5 h-5 ${isDarkMode ? 'text-[#010080]' : 'text-white'}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                    {/* Twitter/X */}
                    <a href="#" className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'bg-white header-keep-white hover:bg-gray-100' : 'bg-[#010080] hover:bg-[#010060]'}`}>
                      <svg className={`w-5 h-5 ${isDarkMode ? 'text-[#010080]' : 'text-white'}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </a>
                    {/* YouTube */}
                    <a href="#" className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'bg-white header-keep-white hover:bg-gray-100' : 'bg-[#010080] hover:bg-[#010060]'}`}>
                      <svg className={`w-5 h-5 ${isDarkMode ? 'text-[#010080]' : 'text-white'}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </a>
                    {/* LinkedIn */}
                    <a href="#" className={`w-10 h-10 rounded-md flex items-center justify-center transition-colors ${isDarkMode ? 'bg-white header-keep-white hover:bg-gray-100' : 'bg-[#010080] hover:bg-[#010060]'}`}>
                      <svg className={`w-5 h-5 ${isDarkMode ? 'text-[#010080]' : 'text-white'}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                    {/* Telegram */}
                    <a href="#" className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'bg-white header-keep-white hover:bg-gray-100' : 'bg-[#010080] hover:bg-[#010060]'}`}>
                      <svg className={`w-5 h-5 ${isDarkMode ? 'text-[#010080]' : 'text-white'}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                      </svg>
                    </a>
                    {/* TikTok */}
                    <a href="#" className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'bg-white header-keep-white hover:bg-gray-100' : 'bg-[#010080] hover:bg-[#010060]'}`}>
                      <svg className={`w-5 h-5 ${isDarkMode ? 'text-[#010080]' : 'text-white'}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Operational Schedule Section */}
      <section ref={sectionRefs.schedule} className={`py-12 sm:py-16 lg:py-20 overflow-hidden ${isDarkMode ? 'bg-[#03002e]' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${visibleSections.schedule ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
              Operational Schedule
            </h2>
            <p className={`text-base sm:text-lg mb-8 ${visibleSections.schedule ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s', color: isDarkMode ? '#ffffff' : '#010080' }}>
              If you were wondering how many days or hours we work, here is our day-to-day operational schedule for your reference.
            </p>
            
            <div className={`rounded-lg shadow-md p-6 sm:p-8 ${visibleSections.schedule ? 'animate-scale-in' : 'opacity-0'} ${isDarkMode ? 'bg-[#050040]' : 'bg-white'}`} style={{ animationDelay: '0.2s' }}>
              <div className="space-y-4">
                <div className={`flex justify-between items-center py-3 border-b ${isDarkMode ? 'border-[#1a1a3e]' : 'border-gray-200'}`}>
                  <span className="font-semibold" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>Saturday</span>
                  <span style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>9:00 AM - 6:00 PM</span>
                </div>
                <div className={`flex justify-between items-center py-3 border-b ${isDarkMode ? 'border-[#1a1a3e]' : 'border-gray-200'}`}>
                  <span className="font-semibold" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>Sunday</span>
                  <span style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>9:00 AM - 6:00 PM</span>
                </div>
                <div className={`flex justify-between items-center py-3 border-b ${isDarkMode ? 'border-[#1a1a3e]' : 'border-gray-200'}`}>
                  <span className="font-semibold" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>Monday</span>
                  <span style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>9:00 AM - 6:00 PM</span>
                </div>
                <div className={`flex justify-between items-center py-3 border-b ${isDarkMode ? 'border-[#1a1a3e]' : 'border-gray-200'}`}>
                  <span className="font-semibold" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>Tuesday</span>
                  <span style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>9:00 AM - 6:00 PM</span>
                </div>
                <div className={`flex justify-between items-center py-3 border-b ${isDarkMode ? 'border-[#1a1a3e]' : 'border-gray-200'}`}>
                  <span className="font-semibold" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>Wednesday</span>
                  <span style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>9:00 AM - 6:00 PM</span>
                </div>
                <div className={`flex justify-between items-center py-3 border-b ${isDarkMode ? 'border-[#1a1a3e]' : 'border-gray-200'}`}>
                  <span className="font-semibold" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>Thursday</span>
                  <span style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="font-semibold" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>Friday</span>
                  <span style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>Closed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section ref={sectionRefs.form} className={`py-12 sm:py-16 lg:py-20 overflow-hidden ${isDarkMode ? 'bg-[#03002e]' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${visibleSections.form ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
              Send us a message
            </h2>
            
            <form onSubmit={handleSubmit} className={`rounded-lg shadow-md p-6 sm:p-8 ${visibleSections.form ? 'animate-fade-in-up' : 'opacity-0'} ${isDarkMode ? 'bg-[#050040]' : 'bg-white'}`} style={{ animationDelay: '0.1s' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="block font-semibold mb-2" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
                    Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={`header-search-input w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010080] focus:border-transparent ${isDarkMode ? 'border-[#1a1a3e] text-gray-800 placeholder-[#010080]' : 'border-gray-300 text-gray-800 placeholder-gray-400'}`}
                    style={isDarkMode ? { backgroundColor: 'white' } : {}}
                    placeholder="Enter your name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block font-semibold mb-2" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
                    Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`header-search-input w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010080] focus:border-transparent ${isDarkMode ? 'border-[#1a1a3e] text-gray-800 placeholder-[#010080]' : 'border-gray-300 text-gray-800 placeholder-gray-400'}`}
                    style={isDarkMode ? { backgroundColor: 'white' } : {}}
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="phone" className="block font-semibold mb-2" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
                  Phone <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className={`header-search-input w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010080] focus:border-transparent ${isDarkMode ? 'border-[#1a1a3e] text-gray-800 placeholder-[#010080]' : 'border-gray-300 text-gray-800 placeholder-gray-400'}`}
                  style={isDarkMode ? { backgroundColor: 'white' } : {}}
                  placeholder="Enter your phone"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="message" className="block font-semibold mb-2" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
                  Message <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className={`header-search-input w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010080] focus:border-transparent resize-none ${isDarkMode ? 'border-[#1a1a3e] text-gray-800 placeholder-[#010080]' : 'border-gray-300 text-gray-800 placeholder-gray-400'}`}
                  style={isDarkMode ? { backgroundColor: 'white' } : {}}
                  placeholder="Enter your message"
                />
              </div>
              
              <button
                type="submit"
                className={`w-full px-6 py-4 rounded-lg font-semibold text-lg transition-colors ${isDarkMode ? 'bg-white header-keep-white text-[#010080] hover:bg-gray-100' : 'bg-[#010080] text-white hover:bg-[#010060]'}`}
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
