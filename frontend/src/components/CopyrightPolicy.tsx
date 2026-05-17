"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";

export default function CopyrightPolicy() {
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
      title: "What is the BEA Copyright Policy?",
      icon: "document",
      content: {
        description: "The BEA Copyright Policy is a formal document that outlines the legal standards, guidelines, and responsibilities for the use, reproduction, distribution, and protection of copyrighted materials within BEA's educational programs, digital platforms, marketing materials, and website.",
        purposeTitle: "The purpose of this policy is to ensure that:",
        purposeItems: [
          "All BEA-originally created content is protected as an intellectual property.",
          "All third-party materials used by BEA comply with copyright laws and licensing agreements.",
          "No BEA material is copied, shared, or commercialized without our permission.",
          "Students, employees, and partners understand the legal boundaries regarding the use of BEA resources."
        ],
        warning: "Unauthorized use or reproduction of BEA materials is strictly prohibited and may result in disciplinary action, legal claims, contract termination or revoked access to BEA services."
      }
    },
    {
      id: 2,
      title: "English File 4th Edition — Oxford University Press (OUP) Copyright Policy",
      icon: "book",
      content: {
        description: "English File 4th Edition is a copyrighted publication owned exclusively by Oxford University Press (OUP). BEA uses English File materials under the terms of standard licensing, educational fair use, and authorized purchase of physical or digital copies.",
        subsections: [
          {
            subtitle: "2.1 Ownership",
            items: [
              "All English File textbooks, teacher resources, audio files, online practice tools, and related content are the exclusive intellectual property of Oxford University Press.",
              "BEA does not own, modify, or redistribute English File copyrighted content."
            ]
          },
          {
            subtitle: "2.2 Permitted Use by BEA",
            description: "BEA may:",
            numberedItems: [
              "Use English File materials for teaching within BEA classrooms and digital learning environments.",
              "Display excerpts for educational purposes during official lessons.",
              "Recommend or require learners to purchase original copies or digital licenses."
            ]
          },
          {
            subtitle: "2.3 Prohibited Use",
            description: "BEA students and staff may not:",
            items: [
              "Copy, scan, upload, or redistribute English File textbooks.",
              "Share materials via social media, WhatsApp, Telegram, or cloud storage platforms.",
              "Create derivative versions of copyrighted content."
            ],
            warning: "Any unauthorized reproduction or distribution violates both Oxford University Press copyright law and international intellectual property regulations.",
            footer: "BEA remains fully compliant with OUP licensing rules and does not host, share, or distribute pirated copies of English File materials under any circumstances."
          }
        ]
      }
    },
    {
      id: 3,
      title: "BEA Intellectual Property (IP) Rights",
      icon: "shield",
      content: {
        description: "All original educational content created by BEA is the exclusive property of Blueprint English Academy. This includes all course materials, frameworks, training programs, digital resources, designs, research, documentation, and systems developed by BEA.",
        subsections: [
          {
            subtitle: "3.1 Categories of BEA IP Rights",
            description: "BEA Intellectual Property includes, but is not limited to:",
            categories: [
              {
                title: "All English for Specific Purposes (ESP) Program Courses",
                items: [
                  "Customized ESP curricula",
                  "Course books, worksheets, assessments",
                  "Teacher guides and digital learning modules",
                  "Sector-specific communication materials"
                ]
              },
              {
                title: "All Soft Skills and Workplace Training Program Courses",
                items: [
                  "Professional development frameworks",
                  "Behavioural training modules",
                  "Corporate communication and leadership content",
                  "Assessment tools and competency models"
                ]
              },
              {
                title: "All Digital Literacy and Virtual Communication Skills Program Courses",
                items: [
                  "ICT training materials",
                  "Digital workplace communication curricula",
                  "E-learning modules and virtual teamwork content",
                  "Interactive tools, guides, and assessments"
                ]
              }
            ],
            note: "All IELTS and TOEFL Exam Preparation Course Materials are not BEA intellectual properties and are owned by the Cambridge University Press and ETS respectively while the BEA Academic Writing Program is owned by the Pearson Education, Inc. Copyright 2014."
          },
          {
            subtitle: "3.2 Protected BEA Content Includes:",
            items: [
              "Written materials (PDFs, books, worksheets, articles, and BEA Exams)",
              "Course videos, graphics, animations, and presentations",
              "BEA-developed teaching methodologies and course structures",
              "Digital and printed assessments and placement tools",
              "BEA's proprietary curriculum frameworks",
              "Website content, blog posts, and official communications"
            ]
          },
          {
            subtitle: "3.3 Restrictions & Prohibited Actions",
            description: "Without explicit written consent from BEA, no individual or organization may:",
            numberedItems: [
              "Copy, reproduce, or translate BEA materials",
              "Share BEA course content digitally or physically",
              "Use BEA curricula for commercial training or teaching",
              "Upload BEA materials to any website, LMS, or social platform",
              "Modify or redistribute BEA content in any form",
              "Claim BEA materials as their own"
            ],
            warning: "Violation of these terms may result in legal action, suspension of services, and full enforcement of intellectual property rights under local and international laws."
          }
        ]
      }
    },
    {
      id: 4,
      title: "Our BEA Brand",
      icon: "brand",
      content: {
        description: "The BEA brand represents the identity, values, visual elements, and reputation of Blueprint English Academy. All brand assets are legally protected and may not be used without authorization.",
        subsections: [
          {
            subtitle: "4.1 Our Brand Assets Include:",
            numberedItems: [
              "BEA Name: \"The Blueprint English Academy\"",
              "BEA Acronym: \"BEA\"",
              "BEA Logo(s)",
              "BEA Colors and Themes (Navy Blue #010080, Bright Red #f40606, White #ffffff)",
              "BEA Taglines and Slogans",
              "BEA Marketing Designs and Visual Templates",
              "Website Layouts and Handbook Formats"
            ],
            showColors: true
          },
          {
            subtitle: "4.2 Usage Guidelines",
            description: "Only authorized BEA personnel may use the BEA brand for official purposes such as:",
            items: [
              "Website content",
              "Course materials",
              "Marketing and social media posts",
              "Certificates, student IDs, and administrative documents"
            ]
          },
          {
            subtitle: "4.3 Prohibited Use",
            description: "No student, employee, contractor, or external party may:",
            numberedItems: [
              "Use the BEA logo for personal or business projects",
              "Reproduce or redesign BEA branding without approval",
              "Create merchandise or printed products using BEA assets",
              "Represent BEA in any official capacity without authorization"
            ],
            warning: "Any misuse of BEA branding is strictly prohibited and may result in legal action."
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        );
      case "book":
        return (
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
        );
      case "shield":
        return (
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        );
      case "brand":
        return (
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
          </div>
          <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 ${visibleSections.hero ? 'animate-fade-in-down' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
            Copyright Policy
          </h1>
          <p className={`text-base sm:text-lg text-white/90 max-w-2xl mx-auto ${visibleSections.hero ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            Blueprint English Academy (BEA)
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
              className={`rounded-2xl p-6 sm:p-8 md:p-10 shadow-lg border-l-4 border-purple-600 ${isDarkMode ? 'bg-[#050040]' : 'bg-white'} ${visibleSections.intro ? 'animate-scale-in' : 'opacity-0'}`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-purple-600/20' : 'bg-purple-100'}`}>
                  <svg className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className={`text-xl sm:text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Protecting Intellectual Property
                  </h2>
                  <p className={`text-base sm:text-lg leading-relaxed mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    The Copyright Policy of The Blueprint English Academy (&quot;BEA&quot;, &quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is designed to protect our intellectual property, respect the rights of third-party content owners, and ensure that all materials used within our programs, website, publications, and training resources comply with copyright laws and licensing agreements.
                  </p>
                  <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <strong>Scope:</strong> This policy applies to all BEA students, staff, contractors, partners, website visitors, and users of our educational services.
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
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
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

                    {section.content.purposeTitle && (
                      <div className="mb-4">
                        <p className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {section.content.purposeTitle}
                        </p>
                        <ul className="space-y-2">
                          {section.content.purposeItems.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <span className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${isDarkMode ? 'bg-purple-400' : 'bg-purple-600'}`}></span>
                              <span className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {item}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {section.content.warning && (
                      <div className={`mt-4 p-4 rounded-lg border-l-4 ${isDarkMode ? 'bg-red-900/20 border-red-500' : 'bg-red-50 border-red-400'}`}>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                          <span className="font-bold">⚠️ Warning:</span> {section.content.warning}
                        </p>
                      </div>
                    )}
                    
                    {section.content.subsections && (
                      <div className="space-y-6 mt-4">
                        {section.content.subsections.map((subsection, subIdx) => (
                          <div 
                            key={subIdx} 
                            className={`p-4 sm:p-5 rounded-xl ${isDarkMode ? 'bg-[#03002e]/50' : 'bg-gray-50'}`}
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
                              <ul className="space-y-2 mb-3">
                                {subsection.items.map((item, itemIdx) => (
                                  <li key={itemIdx} className="flex items-start gap-3">
                                    <span className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${isDarkMode ? 'bg-purple-400' : 'bg-purple-600'}`}></span>
                                    <span className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                      {item}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}

                            {subsection.numberedItems && (
                              <ul className="space-y-2 mb-3">
                                {subsection.numberedItems.map((item, itemIdx) => (
                                  <li key={itemIdx} className="flex items-start gap-3">
                                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isDarkMode ? 'bg-purple-600/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                                      {itemIdx + 1}
                                    </span>
                                    <span className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                      {item}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}

                            {subsection.categories && (
                              <div className="space-y-4">
                                {subsection.categories.map((category, catIdx) => (
                                  <div key={catIdx} className={`p-4 rounded-lg ${isDarkMode ? 'bg-[#050040]' : 'bg-white'}`}>
                                    <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                                      {category.title}
                                    </h4>
                                    <ul className="space-y-1">
                                      {category.items.map((item, itemIdx) => (
                                        <li key={itemIdx} className="flex items-start gap-2">
                                          <span className={`flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full ${isDarkMode ? 'bg-gray-500' : 'bg-gray-400'}`}></span>
                                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {item}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            )}

                            {subsection.showColors && (
                              <div className="flex gap-3 mt-4 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: '#010080' }}></div>
                                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Navy Blue</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: '#f40606' }}></div>
                                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Bright Red</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg border" style={{ backgroundColor: '#ffffff' }}></div>
                                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>White</span>
                                </div>
                              </div>
                            )}
                            
                            {subsection.note && (
                              <div className={`mt-4 p-3 rounded-lg border-l-4 ${isDarkMode ? 'bg-yellow-900/20 border-yellow-500' : 'bg-yellow-50 border-yellow-400'}`}>
                                <p className={`text-sm font-medium ${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                                  <span className="font-bold">NOTE:</span> {subsection.note}
                                </p>
                              </div>
                            )}

                            {subsection.warning && (
                              <div className={`mt-4 p-3 rounded-lg border-l-4 ${isDarkMode ? 'bg-red-900/20 border-red-500' : 'bg-red-50 border-red-400'}`}>
                                <p className={`text-sm font-medium ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                                  <span className="font-bold">⚠️</span> {subsection.warning}
                                </p>
                              </div>
                            )}

                            {subsection.footer && (
                              <p className={`mt-3 text-sm italic ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {subsection.footer}
                              </p>
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
         
          </div>
        </div>
      </section>
    </div>
  );
}

