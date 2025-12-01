"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";

export default function StudentSupportCentre() {
  const { isDarkMode } = useTheme();
  const [visibleSections, setVisibleSections] = useState({});
  const sectionRefs = {
    hero: useRef(null),
    intro: useRef(null),
    offices: useRef(null),
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

  const offices = [
    {
      id: 1,
      title: "Admission Office",
      icon: "admission",
      phone: "+252-61-xxxxxxx",
      email: "admission@beaportal.com",
      description: "For enrollment inquiries, registration assistance, and program information."
    },
    {
      id: 2,
      title: "Finance Office",
      icon: "finance",
      phone: "+252-61-xxxxxxx",
      email: "finance@beaportal.com",
      description: "For tuition payments, billing inquiries, and financial assistance."
    },
    {
      id: 3,
      title: "Virtual Campus",
      icon: "virtual",
      phone: "+252-61-xxxxxxx",
      email: "virtualcampus@beaportal.com",
      description: "For online learning support, E-Learning portal access, and technical assistance."
    },
    {
      id: 4,
      title: "Student Affairs Office",
      icon: "affairs",
      phone: "+252-61-xxxxxxx",
      email: "studentaffairs@beaportal.com",
      description: "For academic concerns, student welfare, and general support services."
    }
  ];

  const getIcon = (iconType) => {
    switch (iconType) {
      case "admission":
        return (
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
          </svg>
        );
      case "finance":
        return (
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "virtual":
        return (
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
          </svg>
        );
      case "affairs":
        return (
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#03002e]' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <section 
        ref={sectionRefs.hero}
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          background: isDarkMode 
            ? 'linear-gradient(135deg, #03002e 0%, #050040 50%, #03002e 100%)'
            : 'linear-gradient(135deg, #1a237e 0%, #311b92 50%, #b71c1c 100%)',
          minHeight: '200px',
          paddingTop: '40px',
          paddingBottom: '40px'
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`inline-block mb-4 ${visibleSections.hero ? 'animate-fade-in-down' : 'opacity-0'}`}>
            <svg className="w-16 h-16 sm:w-20 sm:h-20 text-white mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 ${visibleSections.hero ? 'animate-fade-in-down' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
            Student Support Centre
          </h1>
          <p className={`text-base sm:text-lg text-white/90 max-w-2xl mx-auto ${visibleSections.hero ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            We&apos;re here to help you succeed in your learning journey
          </p>
        </div>
      </section>

      {/* Introduction Section */}
      <section ref={sectionRefs.intro} className={`py-10 sm:py-14 ${isDarkMode ? 'bg-[#03002e]' : 'bg-white'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div 
              className={`rounded-2xl p-6 sm:p-8 md:p-10 shadow-lg border-l-4 border-cyan-500 ${isDarkMode ? 'bg-[#050040]' : 'bg-white'} ${visibleSections.intro ? 'animate-scale-in' : 'opacity-0'}`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-cyan-600/20' : 'bg-cyan-100'}`}>
                  <svg className={`w-6 h-6 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className={`text-xl sm:text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    How Can We Help You?
                  </h2>
                  <p className={`text-base sm:text-lg leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    The BEA Student Support Centre is dedicated to providing comprehensive assistance to all our students. 
                    Whether you need help with admissions, financial matters, online learning, or general inquiries, 
                    our specialized teams are ready to assist you. Contact the appropriate office below for quick and efficient support.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Offices Section */}
      <section ref={sectionRefs.offices} className={`py-10 sm:py-14 pb-16 sm:pb-20 ${isDarkMode ? 'bg-[#04003a]' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Office Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {offices.map((office, index) => (
                <div 
                  key={office.id} 
                  className={`rounded-2xl overflow-hidden shadow-lg ${isDarkMode ? 'bg-[#050040]' : 'bg-white'} ${visibleSections.offices ? 'animate-fade-in-up' : 'opacity-0'}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Office Header */}
                  <div 
                    className="px-6 py-5 flex items-center gap-4"
                    style={{
                      background: isDarkMode 
                        ? 'linear-gradient(90deg, #03002e 0%, #050040 100%)'
                        : 'linear-gradient(90deg, #010080 0%, #3949ab 100%)'
                    }}
                  >
                    <div className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-white/10' : 'bg-white/20'}`}>
                      <span className="text-white">
                        {getIcon(office.icon)}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">
                      {office.title}
                    </h2>
                  </div>
                  
                  {/* Office Content */}
                  <div className="p-6">
                    <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {office.description}
                    </p>
                    
                    {/* Phone */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-green-600/20' : 'bg-green-100'}`}>
                        <svg className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                      </div>
                      <div>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Phone</p>
                        <a href={`tel:${office.phone}`} className={`text-sm font-medium hover:underline ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {office.phone}
                        </a>
                      </div>
                    </div>
                    
                    {/* Email */}
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-blue-600/20' : 'bg-blue-100'}`}>
                        <svg className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                      </div>
                      <div>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Email</p>
                        <a href={`mailto:${office.email}`} className={`text-sm font-medium hover:underline ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {office.email}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Headquarter Office */}
            <div 
              className={`mt-8 sm:mt-10 rounded-2xl overflow-hidden shadow-lg ${isDarkMode ? 'bg-[#050040]' : 'bg-white'} ${visibleSections.offices ? 'animate-fade-in-up' : 'opacity-0'}`}
              style={{ animationDelay: '0.4s' }}
            >
              <div 
                className="px-6 sm:px-8 py-5 sm:py-6 flex items-center gap-4"
                style={{
                  background: isDarkMode 
                    ? 'linear-gradient(90deg, #03002e 0%, #050040 100%)'
                    : 'linear-gradient(90deg, #010080 0%, #3949ab 100%)'
                }}
              >
                <div className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-white/10' : 'bg-white/20'}`}>
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Headquarter Office
                </h2>
              </div>
              
              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-red-600/20' : 'bg-red-100'}`}>
                      <svg className={`w-6 h-6 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Address</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Taleex, Hodan District<br />
                        Mogadishu, Somalia
                      </p>
                    </div>
                  </div>
                  
                  {/* Operating Hours */}
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-yellow-600/20' : 'bg-yellow-100'}`}>
                      <svg className={`w-6 h-6 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Operating Hours</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Saturday - Thursday<br />
                        8:00 AM - 5:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className={`mt-10 sm:mt-12 text-center p-6 sm:p-8 rounded-2xl ${isDarkMode ? 'bg-[#050040]' : 'bg-white'} ${visibleSections.offices ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.5s' }}>
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 ${isDarkMode ? 'bg-cyan-600/20' : 'bg-cyan-100'}`}>
                <svg className={`w-7 h-7 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
              </div>
              <h3 className={`text-xl sm:text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Need Immediate Assistance?
              </h3>
              <p className={`text-sm sm:text-base max-w-2xl mx-auto mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Our support team is available during office hours to assist you with any questions or concerns. 
                For urgent matters outside office hours, please email us and we&apos;ll respond as soon as possible.
              </p>
              <a 
                href="/contact-us" 
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-white text-[#010080] hover:bg-gray-100' : 'bg-[#010080] text-white hover:bg-[#010060]'}`}
              >
                <span>Contact Us</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

