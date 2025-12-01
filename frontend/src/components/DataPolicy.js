"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";

export default function DataPolicy() {
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

  const policySections = [
    {
      id: 1,
      title: "What is BEA Data Policy?",
      icon: "document",
      content: {
        description: "The BEA Data Policy is a formal document outlining how we collect, manage, protect, and dispose of all personal and institutional data. Its purpose is to:",
        items: [
          "Ensure ethical and secure handling of all data.",
          "Protect the rights and privacy of learners, parents/guardians, staff, and stakeholders.",
          "Establish standards for responsible data governance and compliance with applicable legal frameworks.",
          "Promote transparency in how BEA manages information throughout its lifecycle."
        ],
        footer: "This policy applies to all BEA employees, contractors, partners, and users who interact with BEA systems or provide data through our website, E-learning platforms, or administrative processes."
      }
    },
    {
      id: 2,
      title: "How Do We Manage Data?",
      icon: "settings",
      content: {
        description: "We follow strict data governance principles to ensure data is accurate, secure, and used responsibly.",
        subsections: [
          {
            subtitle: "2.1 Roles and Responsibilities",
            items: [
              { label: "Data Protection Officer (DPO)", desc: "Oversees data compliance, reporting, and auditing." },
              { label: "IT & Security Team", desc: "Ensures technical safeguards, system monitoring, and access control." },
              { label: "Administrative Departments", desc: "Responsible for accurate collection, secure handling, and lawful use of data." },
              { label: "Staff", desc: "All BEA Employees must follow this policy by signing confidentiality agreements." }
            ]
          },
          {
            subtitle: "2.2 Data Categorization",
            description: "At the BEA, we categorize data into the following four categories:",
            items: [
              { label: "Public Data", desc: "Information published on our website." },
              { label: "Internal Data", desc: "Operational information not intended for public distribution." },
              { label: "Confidential Data", desc: "Personal information of learners, employees, and stakeholders." },
              { label: "Highly Sensitive Data", desc: "Financial, legal, or identification documents (collected only when necessary)." }
            ]
          },
          {
            subtitle: "2.3 Data Accessibility Control",
            description: "Data accessibility is only granted on a need-to-know basis while sensitive data is restricted to authorized personnel only. All access is logged and monitored by our IT & Security Team to ensure accountability and addressing misuses of access privileges."
          }
        ]
      }
    },
    {
      id: 3,
      title: "Data Acquisition",
      icon: "collection",
      content: {
        description: "BEA collects only the information necessary for operational, educational, and administrative purposes.",
        subsections: [
          {
            subtitle: "3.1 What Type of Data Do We Collect?",
            items: [
              { label: "Personal Information", desc: "Name, email, phone number, address, date of birth." },
              { label: "Academic Information", desc: "Placement test results, progress records, attendance, assessments, etc." },
              { label: "Website Data", desc: "Cookies, analytics (non-identifiable), browsing behaviour." },
              { label: "Payment Information", desc: "Receipts or transaction details (handled securely by the Finance and Auditing Officials)." },
              { label: "Supporting Documents", desc: "Identification documents (only when required for registration or certification)." }
            ]
          },
          {
            subtitle: "3.2 How Do We Collect Data?",
            description: "We collect data via these channels only:",
            listItems: [
              "BEA website forms",
              "Registration processes",
              "Payment or billing systems",
              "E-Learning portal system",
              "Student support interactions",
              "Cookies and analytics tools"
            ]
          },
          {
            subtitle: "3.3 Legal Legitimacy for Our Data Collection",
            description: "BEA collects data based on:",
            listItems: [
              "User consent",
              "Contractual necessity (e.g., enrolment, certification)",
              "Legitimate educational interests",
              "Legal obligations, when applicable"
            ]
          }
        ]
      }
    },
    {
      id: 4,
      title: "How Do We Use The Collected Data?",
      icon: "usage",
      content: {
        description: "All collected data is used solely for legitimate educational, operational, and administrative purposes.",
        subsections: [
          {
            subtitle: "4.1 Primary Uses",
            description: "The primary uses for the data we collect include:",
            listItems: [
              "Student registration and program enrolment",
              "Delivering educational services and assessments",
              "Communication regarding courses, updates, or support",
              "Improving our website, curriculum, and services",
              "Issuing certificates, transcripts, or progress reports"
            ]
          },
          {
            subtitle: "4.2 For Internal Use Only",
            description: "The BEA does not sell, trade, or share any personal data with third parties.",
            isHighlight: true
          },
          {
            subtitle: "4.3 Exception for Legal Purposes",
            description: "Data may only be shared with external parties when:",
            listItems: [
              "Required by law",
              "Responding to lawful requests (court orders, law enforcement, government inquiries)",
              "Necessary to protect BEA's rights, safety, or property"
            ],
            note: "Outside of legal obligations, we will never disclose data to third parties."
          }
        ]
      }
    },
    {
      id: 5,
      title: "Data Disposal",
      icon: "disposal",
      content: {
        description: "BEA retains data only as long as necessary for its intended purpose, operational needs, or legal requirements.",
        subsections: [
          {
            subtitle: "5.1 Data Retention Periods",
            items: [
              { label: "Student Records", desc: "Retained for the duration of study + a defined archival period." },
              { label: "Financial Records", desc: "Retained according to accounting and tax regulations." },
              { label: "Website Login Activity", desc: "Automatically deleted after a limited period." }
            ]
          },
          {
            subtitle: "5.2 Secure Disposal Methods",
            listItems: [
              "Permanent deletion from digital systems",
              "Overwriting or anonymizing digital files",
              "Shredding or incineration of paper documents",
              "Revoking system access when employees or contractors exit"
            ]
          }
        ]
      }
    }
  ];

  const getIcon = (iconType) => {
    switch (iconType) {
      case "document":
        return (
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        );
      case "settings":
        return (
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case "collection":
        return (
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
          </svg>
        );
      case "usage":
        return (
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        );
      case "disposal":
        return (
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 ${visibleSections.hero ? 'animate-fade-in-down' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
            BEA Data Policy
          </h1>
          <p className={`text-base sm:text-lg text-white/90 max-w-2xl mx-auto ${visibleSections.hero ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            Protecting your privacy and data with transparency
          </p>
        </div>
      </section>

      {/* Introduction Section */}
      <section ref={sectionRefs.intro} className={`py-10 sm:py-14 ${isDarkMode ? 'bg-[#03002e]' : 'bg-white'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Effective Date */}
            <div className={`text-center mb-6 ${visibleSections.intro ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${isDarkMode ? 'bg-[#050040] text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                Effective Date: 30/11/2025
              </span>
            </div>

            <div 
              className={`rounded-2xl p-6 sm:p-8 md:p-10 shadow-lg border-l-4 border-green-600 ${isDarkMode ? 'bg-[#050040]' : 'bg-white'} ${visibleSections.intro ? 'animate-scale-in' : 'opacity-0'}`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-green-600/20' : 'bg-green-100'}`}>
                  <svg className={`w-6 h-6 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className={`text-xl sm:text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Our Commitment to Your Privacy
                  </h2>
                  <p className={`text-base sm:text-lg leading-relaxed mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    The Blueprint English Academy (&quot;BEA&quot;, &quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting the privacy and confidentiality of all personal information collected from learners, employees, partners, and visitors to our website and digital platforms.
                  </p>
                  <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    This Data Policy explains how we manage, use, store, safeguard, and dispose of data in accordance with relevant data protection standards.
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
              {policySections.map((section, sectionIndex) => (
                <div 
                  key={section.id} 
                  className={`rounded-2xl overflow-hidden shadow-lg ${isDarkMode ? 'bg-[#050040]' : 'bg-white'} ${visibleSections.sections ? 'animate-fade-in-up' : 'opacity-0'}`}
                  style={{ animationDelay: `${sectionIndex * 0.1}s` }}
                >
                  {/* Section Header */}
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
                        {getIcon(section.icon)}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white">
                        {section.title}
                      </h2>
                    </div>
                  </div>
                  
                  {/* Section Content */}
                  <div className="p-6 sm:p-8">
                    {section.content.description && (
                      <p className={`text-base sm:text-lg mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {section.content.description}
                      </p>
                    )}
                    
                    {section.content.items && (
                      <ul className="space-y-2 mb-4">
                        {section.content.items.map((item, idx) => (
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
                    )}
                    
                    {section.content.footer && (
                      <p className={`text-sm sm:text-base mt-4 p-4 rounded-lg ${isDarkMode ? 'bg-[#03002e]/50 text-gray-400' : 'bg-gray-50 text-gray-600'}`}>
                        {section.content.footer}
                      </p>
                    )}
                    
                    {section.content.subsections && (
                      <div className="space-y-6">
                        {section.content.subsections.map((subsection, subIdx) => (
                          <div 
                            key={subIdx} 
                            className={`p-4 sm:p-5 rounded-xl ${subsection.isHighlight ? (isDarkMode ? 'bg-green-900/20 border border-green-700' : 'bg-green-50 border border-green-200') : (isDarkMode ? 'bg-[#03002e]/50' : 'bg-gray-50')}`}
                          >
                            <h3 className={`text-lg sm:text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {subsection.subtitle}
                            </h3>
                            
                            {subsection.description && (
                              <p className={`text-sm sm:text-base mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {subsection.description}
                              </p>
                            )}
                            
                            {subsection.items && (
                              <div className="space-y-3">
                                {subsection.items.map((item, itemIdx) => (
                                  <div key={itemIdx} className="flex items-start gap-3">
                                    <span className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${isDarkMode ? 'bg-green-400' : 'bg-green-600'}`}></span>
                                    <div>
                                      <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.label}:</span>
                                      <span className={`ml-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.desc}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {subsection.listItems && (
                              <ul className="space-y-2">
                                {subsection.listItems.map((listItem, listIdx) => (
                                  <li key={listIdx} className="flex items-start gap-3">
                                    <span className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${isDarkMode ? 'bg-green-400' : 'bg-green-600'}`}></span>
                                    <span className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
         Your Data is Safe With Us                             {listItem}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                            
                            {subsection.note && (
                              <div className={`mt-4 p-3 rounded-lg border-l-4 ${isDarkMode ? 'bg-yellow-900/20 border-yellow-500' : 'bg-yellow-50 border-yellow-400'}`}>
                                <p className={`text-sm font-medium ${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                                  <span className="font-bold">N.B.</span> {subsection.note}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Note */}
            <div className={`mt-10 sm:mt-12 text-center p-6 sm:p-8 rounded-2xl ${isDarkMode ? 'bg-[#050040]' : 'bg-white'} ${visibleSections.sections ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.5s' }}>
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 ${isDarkMode ? 'bg-green-600/20' : 'bg-green-100'}`}>
                <svg className={`w-7 h-7 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h3 className={`text-xl sm:text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Your Data is Safe With Us
              </h3>
              <p className={`text-sm sm:text-base max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                If you have any questions or concerns regarding this Data Policy or how your information is handled, please contact our Data Protection Officer through official BEA communication channels.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

