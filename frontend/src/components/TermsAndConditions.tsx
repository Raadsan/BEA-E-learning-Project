"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";

export default function TermsAndConditions() {
  const { isDarkMode } = useTheme();
  const [visibleSections, setVisibleSections] = useState({});
  const sectionRefs = {
    hero: useRef(null),
    intro: useRef(null),
    sections: useRef(null),
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

  const getIcon = (iconType) => {
    switch (iconType) {
      case "document":
        return (
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        );
      case "user":
        return (
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        );
      case "shield":
        return (
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        );
      case "certificate":
        return (
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h11.25c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          </div>
          <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 ${visibleSections.hero ? 'animate-fade-in-down' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
            Terms and Conditions
          </h1>
          <p className={`text-base sm:text-lg text-white/90 max-w-2xl mx-auto ${visibleSections.hero ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            Effective Date: 30/11/2025
          </p>
        </div>
      </section>

      {/* Introduction Section */}
      <section ref={sectionRefs.intro} className={`py-10 sm:py-14 ${isDarkMode ? 'bg-[#03002e]' : 'bg-white'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div 
              className={`rounded-2xl p-6 sm:p-8 md:p-10 shadow-lg border-l-4 border-blue-600 ${isDarkMode ? 'bg-[#050040]' : 'bg-white'} ${visibleSections.intro ? 'animate-scale-in' : 'opacity-0'}`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-blue-600/20' : 'bg-blue-100'}`}>
                  <svg className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h11.25c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className={`text-xl sm:text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Welcome to The Blueprint English Academy
                  </h2>
                  <p className={`text-base sm:text-lg leading-relaxed mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    ("BEA", "we", "our", "the Academy"). By accessing our website, enrolling in a program, or using any BEA service, you agree to comply with the following Terms and Conditions. These terms govern all interactions between BEA and our students, clients, and website users.
                  </p>
                  <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    If you do not agree to these Terms and Conditions, you should not use BEA's services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Policy Sections */}
      <section ref={sectionRefs.sections} className={`py-10 sm:py-14 pb-16 sm:pb-20 ${isDarkMode ? 'bg-[#04003a]' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="space-y-8 sm:space-y-10">
              
              {/* Section 1: Definitions */}
              <div 
                className={`rounded-2xl overflow-hidden shadow-lg ${isDarkMode ? 'bg-[#050040]' : 'bg-white'} ${visibleSections.sections ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: '0s' }}
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
                    <span className="text-white">
                      {getIcon("document")}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      1. Definitions
                    </h2>
                  </div>
                </div>
                
                <div className="p-6 sm:p-8">
                  <ul className="space-y-3">
                    {[
                      '"Student" refers to any individual enrolled in BEA programs.',
                      '"User" refers to any visitor to BEA\'s website or digital platforms.',
                      '"Services" include all courses, programs, resources, and digital content provided by BEA.',
                      '"Materials" include all BEA-produced educational resources, documents, digital content, and branding.'
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isDarkMode ? 'bg-green-600/20 text-green-400' : 'bg-green-100 text-green-600'}`}>
                          {idx + 1}
                        </span>
                        <span className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Section 2: Enrolment & Admissions */}
              <div 
                className={`rounded-2xl overflow-hidden shadow-lg ${isDarkMode ? 'bg-[#050040]' : 'bg-white'} ${visibleSections.sections ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: '0.1s' }}
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
                    <span className="text-white">
                      {getIcon("user")}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      2. Enrolment & Admissions
                    </h2>
                  </div>
                </div>
                
                <div className="p-6 sm:p-8">
                  <div className="space-y-6">
                    <div className={`p-4 sm:p-5 rounded-xl ${isDarkMode ? 'bg-[#03002e]/50' : 'bg-gray-50'}`}>
                      <h3 className={`text-lg sm:text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        2.1 Eligibility
                      </h3>
                      <p className={`text-sm sm:text-base mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        To enrol in any BEA program, students must:
                      </p>
                      <ul className="space-y-2 mb-4">
                        {[
                          'Provide accurate personal information',
                          'Complete required placement or proficiency tests (where applicable)',
                          'Agree to all BEA policies (Payment and Refund Policy, Student Engagement Policy, Student Code of Conduct, etc.)'
                        ].map((item, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${isDarkMode ? 'bg-green-400' : 'bg-green-600'}`}></span>
                            <span className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className={`mt-4 p-3 rounded-lg border-l-4 ${isDarkMode ? 'bg-yellow-900/20 border-yellow-500' : 'bg-yellow-50 border-yellow-400'}`}>
                        <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                          <span className="font-bold">NOTE:</span> All BEA Students must ensure that the information they provide is:
                        </p>
                        <ul className="space-y-1 ml-4">
                          <li className={`text-sm ${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>1. Accurate</li>
                          <li className={`text-sm ${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>2. Complete</li>
                          <li className={`text-sm ${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>3. Up to date</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Conduct and Behaviour */}
              <div 
                className={`rounded-2xl overflow-hidden shadow-lg ${isDarkMode ? 'bg-[#050040]' : 'bg-white'} ${visibleSections.sections ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: '0.2s' }}
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
                    <span className="text-white">
                      {getIcon("shield")}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      3. Conduct and Behaviour
                    </h2>
                  </div>
                </div>
                
                <div className="p-6 sm:p-8">
                  <p className={`text-sm sm:text-base mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Students must maintain appropriate behaviour during all BEA Programs.
                  </p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-start gap-3">
                      <span className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${isDarkMode ? 'bg-green-400' : 'bg-green-600'}`}></span>
                      <span className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Be respectful to teachers, staff, and fellow students.
                      </span>
                    </li>
                  </ul>
                  <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Disruptive, abusive, or inappropriate behaviour may lead to disciplinary action, including removal from BEA programs.
                  </p>
                </div>
              </div>

              {/* Section 4: Certificates and Academic Records */}
              <div 
                className={`rounded-2xl overflow-hidden shadow-lg ${isDarkMode ? 'bg-[#050040]' : 'bg-white'} ${visibleSections.sections ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: '0.3s' }}
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
                    <span className="text-white">
                      {getIcon("certificate")}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      4. Certificates and Academic Records
                    </h2>
                  </div>
                </div>
                
                <div className="p-6 sm:p-8">
                  <p className={`text-sm sm:text-base mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Certificates, transcripts, and other academic documents will only be issued when:
                  </p>
                  <ul className="space-y-2 mb-4">
                    {[
                      'All payments have been completed',
                      'Attendance and assessment requirements are met',
                      'The student complies with all BEA policies'
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${isDarkMode ? 'bg-green-400' : 'bg-green-600'}`}></span>
                        <span className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className={`mt-4 p-3 rounded-lg border-l-4 ${isDarkMode ? 'bg-yellow-900/20 border-yellow-500' : 'bg-yellow-50 border-yellow-400'}`}>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                      <span className="font-bold">NOTE:</span> BEA reserves the right to withhold documents until obligations are fulfilled.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
