"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";

export default function StudentEngagementPolicy() {
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
      title: "Purpose of the Policy",
      icon: "target",
      content: {
        description: "The Student Engagement Policy aims to:",
        items: [
          "Ensure students are active participants in their learning experience",
          "Promote consistent attendance, communication, and class participation",
          "Foster respect, collaboration, and professionalism within the BEA community",
          "Support students in achieving their academic and personal development goals",
          "Clarify expectations for student behaviour and performance"
        ],
        footer: "This policy applies to all learners enrolled in BEA programs, whether in-person or online."
      }
    },
    {
      id: 2,
      title: "Principles of Student Engagement",
      icon: "principles",
      content: {
        description: "BEA promotes engagement based on the following core principles:",
        subsections: [
          {
            subtitle: "2.1 Responsibility",
            description: "Students are expected to take ownership of their learning by attending classes consistently, completing tasks, and managing their time effectively."
          },
          {
            subtitle: "2.2 Communication",
            description: "Open and respectful communication between students, teachers, and staff is essential to success at the BEA."
          },
          {
            subtitle: "2.3 Collaboration",
            description: "Engagement includes working cooperatively with peers, participating actively in group tasks, and contributing positively to the learning environment."
          },
          {
            subtitle: "2.4 Professionalism",
            description: "Students are expected to demonstrate respectful conduct, punctuality, and commitment to BEA values during all academic interactions."
          }
        ]
      }
    },
    {
      id: 3,
      title: "Student Responsibilities",
      icon: "responsibilities",
      content: {
        subsections: [
          {
            subtitle: "3.1 Attendance & Punctuality",
            listItems: [
              "Attend all scheduled classes consistently.",
              "Arrive on time for every session.",
              "Notify the Administration or teacher in advance if they will be absent or late."
            ]
          },
          {
            subtitle: "3.2 Class Participation",
            listItems: [
              "Actively contribute to discussions and activities.",
              "Engage respectfully with teachers and classmates.",
              "Complete assigned classwork, assessments, and projects on time."
            ]
          },
          {
            subtitle: "3.3 Communication with BEA Staff",
            listItems: [
              "Communicate any academic or personal challenges that may affect participation.",
              "Respond promptly to messages from BEA administration or instructors.",
              "Maintain respectful and professional communication at all times."
            ]
          },
          {
            subtitle: "3.4 Technology Use (For Remote Learning)",
            listItems: [
              "Ensure stable internet access and functioning devices.",
              "Keep microphones, cameras, and learning platforms properly managed as instructed by the teacher.",
              "Use BEA digital platforms responsibly and respectfully."
            ]
          }
        ]
      }
    },
    {
      id: 4,
      title: "BEA Instructors' Responsibilities",
      icon: "instructors",
      content: {
        description: "BEA instructors play a central role in supporting student engagement. Teachers are expected to:",
        listItems: [
          "Create interactive, learner-centred lessons",
          "Provide clear instructions and guidance",
          "Give constructive feedback to help students improve",
          "Encourage participation from all students",
          "Monitor attendance and performance",
          "Communicate concerns to the Administration when necessary"
        ]
      }
    },
    {
      id: 5,
      title: "Classroom Conduct and Behavioural Expectations",
      icon: "conduct",
      content: {
        description: "To maintain a productive and respectful learning environment, students must:",
        listItems: [
          "Treat peers and teachers with courtesy and respect",
          "Avoid disruptive behaviour, inappropriate language, or harassment",
          "Follow all classroom and program-specific guidelines",
          "Use electronic devices for educational purposes only",
          "Adhere to BEA's Code of Conduct at all times"
        ],
        note: "Failure to follow conduct expectations may result in disciplinary actions."
      }
    },
    {
      id: 6,
      title: "Engagement in Assessments",
      icon: "assessments",
      content: {
        description: "Students are expected to:",
        listItems: [
          "Complete placement tests, progress tests, and final assessments honestly",
          "Meet deadlines for assignments and exams",
          "Avoid cheating, plagiarism, or unauthorized help",
          "Use assessments as opportunities for growth and improvement"
        ]
      }
    },
    {
      id: 7,
      title: "Student Feedback and Continuous Improvement",
      icon: "feedback",
      content: {
        description: "BEA values feedback as a vital part of engagement. Students are encouraged to:",
        listItems: [
          "Share feedback about courses, teachers, or support services",
          "Participate in surveys and evaluation forms",
          "Communicate suggestions to help improve BEA programs"
        ],
        note: "All feedback is confidential and will only be used to improve the student experience."
      }
    },
    {
      id: 8,
      title: "Support Services",
      icon: "support",
      content: {
        description: "BEA provides various support channels to assist students with:",
        listItems: [
          "Academic challenges",
          "Attendance or scheduling conflicts",
          "Technical difficulties (for online learners)",
          "Personal circumstances affecting participation"
        ],
        note: "Students are encouraged to seek support early to avoid falling behind."
      }
    }
  ];

  const getIcon = (iconType) => {
    switch (iconType) {
      case "target":
        return (
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        );
      case "principles":
        return (
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        );
      case "responsibilities":
        return (
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        );
      case "instructors":
        return (
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443a55.381 55.381 0 015.25 2.882v3.675m-9.75 0h9.75" />
          </svg>
        );
      case "conduct":
        return (
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        );
      case "assessments":
        return (
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        );
      case "feedback":
        return (
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
        );
      case "support":
        return (
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.645-5.888-1.8A5.971 5.971 0 015.25 18.5m0 0v-.228c0-.597.237-1.17.659-1.591l.621-.622a20.533 20.533 0 003.15-3.15l.622-.621a2.25 2.25 0 011.591-.659h3.182a2.25 2.25 0 012.25 2.25v3.182a2.25 2.25 0 01-.659 1.591l-.621.622a20.533 20.533 0 01-3.15 3.15l-.622.621a2.25 2.25 0 01-1.591.659H5.25m0 0a2.25 2.25 0 01-2.25-2.25V15.5m2.25 0h.008v.008H3.25zm0 0h.008v.008H3.25z" />
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 ${visibleSections.hero ? 'animate-fade-in-down' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
            Student Engagement Policy
          </h1>
          <p className={`text-base sm:text-lg text-white/90 max-w-2xl mx-auto ${visibleSections.hero ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            Empowering active participation and meaningful learning
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
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className={`text-xl sm:text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Our Commitment to Student Engagement
                  </h2>
                  <p className={`text-base sm:text-lg leading-relaxed mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    At the Blueprint English Academy (&quot;BEA&quot;, &quot;we&quot;, &quot;our&quot;), we are committed to creating a learning environment where every student is empowered to actively participate, communicate confidently, and take responsibility for their educational progress.
                  </p>
                  <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    This Student Engagement Policy outlines our expectations, responsibilities, and standards for meaningful engagement in all BEA programs.
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
                    
                    {section.content.items && Array.isArray(section.content.items) && section.content.items.length > 0 && typeof section.content.items[0] === 'string' && (
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
                                      {listItem}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {section.content.listItems && (
                      <ul className="space-y-2">
                        {section.content.listItems.map((listItem, listIdx) => (
                          <li key={listIdx} className="flex items-start gap-3">
                            <span className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${isDarkMode ? 'bg-green-400' : 'bg-green-600'}`}></span>
                            <span className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {listItem}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    {section.content.note && (
                      <div className={`mt-4 p-3 rounded-lg border-l-4 ${isDarkMode ? 'bg-yellow-900/20 border-yellow-500' : 'bg-yellow-50 border-yellow-400'}`}>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                          <span className="font-bold">NOTE:</span> {section.content.note}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

