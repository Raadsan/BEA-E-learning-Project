"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";

export default function StudentCodeOfConduct() {
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

  const conductSections = [
    {
      id: 1,
      title: "Classroom and Learning Etiquette",
      icon: "classroom",
      items: [
        {
          subtitle: "Be Prepared and Connected",
          content: "Make sure you have a stable internet connection, a reliable device (computer or smartphone), and working headphones before class begins."
        },
        {
          subtitle: "Create a Focused Environment",
          content: "Join your lessons from a quiet space where you can concentrate and participate without distractions."
        },
        {
          subtitle: "Engage Respectfully",
          content: "If you wish to ask a question, kindly raise your hand (virtually or physically) and wait for your teacher's acknowledgment before speaking."
        },
        {
          subtitle: "Keep Your Camera On",
          content: "To ensure active participation, students are required to keep their cameras on throughout the class. Repeated failure to do so will count as an absence."
        },
        {
          subtitle: "Maintain Professional Behaviour",
          content: "Please avoid eating, chewing, or engaging in off-topic discussions during class. This helps keep our sessions focused and respectful."
        },
        {
          subtitle: "Respectful Dialogue Only",
          content: "Discussions involving sensitive or divisive topics—such as politics, or clan identity—are not allowed during class sessions."
        }
      ]
    },
    {
      id: 2,
      title: "Attendance and Participation",
      icon: "attendance",
      items: [
        {
          subtitle: "Attendance Matters",
          content: "Attendance is tracked hourly. Missing even one hour will affect your overall attendance record."
        },
        {
          subtitle: "Punctuality is Key",
          content: "Students joining classes 15 minutes late without prior notice will be marked absent."
        },
        {
          subtitle: "Minimum Attendance Requirement",
          content: "Students must maintain at least 80% attendance to successfully complete their course, regardless of their academic performance."
        },
        {
          subtitle: "Passing Grade",
          content: "The minimum passing score for all BEA programs is 75%."
        }
      ]
    },
    {
      id: 3,
      title: "Course Adjustments and Freezing Policy",
      icon: "policy",
      items: [
        {
          subtitle: "Changing Class Time",
          content: "Requests to change class schedules must be submitted through the Class Change Form during the final week of the current term. Approval depends on seat availability."
        },
        {
          subtitle: "Course Freezing Policy",
          content: "Students may freeze their course up to two times during their study period. The Course Freeze Form must be submitted in the final week of the course. If a student freezes for two consecutive months, they will undergo a reassessment to determine their current English level and may be placed in a different class."
        },
        {
          subtitle: "No Changes After New Class Begins",
          content: "Once a new class has started, students cannot change their class time or freeze the course."
        }
      ]
    },
    {
      id: 4,
      title: "Academic Evaluation and Assignments",
      icon: "evaluation",
      items: [
        {
          subtitle: "Teacher's Evaluation",
          content: "Teachers continuously monitor each student's performance. If a student appears to be in the wrong level, BEA reserves the right to reassign them to a more suitable class."
        },
        {
          subtitle: "Timely Assignment Submission",
          content: "Workbook assignments must be handwritten and submitted within the given timeframe. Late submissions will not be accepted."
        },
        {
          subtitle: "Progress Monitoring",
          content: "Every student's first interview is recorded and used as a benchmark to measure improvement over the course of the program."
        }
      ]
    },
    {
      id: 5,
      title: "Dress Code and Cultural Respect",
      icon: "dresscode",
      items: [
        {
          subtitle: "Cultural and Religious Respect",
          content: "Students are encouraged to dress modestly and respectfully. Islamic attire such as hijab or niqab is required."
        },
        {
          subtitle: "Professional Standards",
          content: "Non-Somali students are also expected to maintain appropriate and professional dress standards."
        }
      ]
    }
  ];

  const getIcon = (iconType) => {
    switch (iconType) {
      case "classroom":
        return (
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
          </svg>
        );
      case "attendance":
        return (
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "policy":
        return (
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        );
      case "evaluation":
        return (
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
          </svg>
        );
      case "dresscode":
        return (
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 ${visibleSections.hero ? 'animate-fade-in-down' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
            BEA Student Code of Conduct
          </h1>
          <p className={`text-base sm:text-lg text-white/90 max-w-2xl mx-auto ${visibleSections.hero ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            Guidelines for a respectful, engaging, and productive learning environment
          </p>
        </div>
      </section>

      {/* Introduction Section */}
      <section ref={sectionRefs.intro} className={`py-10 sm:py-14 ${isDarkMode ? 'bg-[#03002e]' : 'bg-white'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div 
              className={`rounded-2xl p-6 sm:p-8 md:p-10 shadow-lg border-l-4 border-red-600 ${isDarkMode ? 'bg-[#050040]' : 'bg-white'} ${visibleSections.intro ? 'animate-scale-in' : 'opacity-0'}`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-red-600/20' : 'bg-red-100'}`}>
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className={`text-xl sm:text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Our Commitment
                  </h2>
                  <p className={`text-base sm:text-lg leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    We&apos;re committed to creating a respectful, engaging, and productive learning environment for every student. 
                    To help us maintain the quality and integrity of our programs, all learners are expected to follow these 
                    simple but important guidelines.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conduct Sections */}
      <section ref={sectionRefs.sections} className={`py-10 sm:py-14 pb-16 sm:pb-20 ${isDarkMode ? 'bg-[#04003a]' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="space-y-8 sm:space-y-10">
              {conductSections.map((section, sectionIndex) => (
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
                    <div className="space-y-5 sm:space-y-6">
                      {section.items.map((item, itemIndex) => (
                        <div 
                          key={itemIndex} 
                          className={`flex gap-4 p-4 sm:p-5 rounded-xl transition-all duration-300 hover:scale-[1.01] ${isDarkMode ? 'bg-[#03002e]/50 hover:bg-[#03002e]' : 'bg-gray-50 hover:bg-gray-100'}`}
                        >
                          <div className="flex-shrink-0 mt-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isDarkMode ? 'bg-red-600/20 text-red-400' : 'bg-red-100 text-red-600'}`}>
                              {itemIndex + 1}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className={`text-base sm:text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {item.subtitle}
                            </h3>
                            <p className={`text-sm sm:text-base leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {item.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Note */}
            <div className={`mt-10 sm:mt-12 text-center p-6 sm:p-8 rounded-2xl ${isDarkMode ? 'bg-[#050040]' : 'bg-white'} ${visibleSections.sections ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.5s' }}>
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 ${isDarkMode ? 'bg-green-600/20' : 'bg-green-100'}`}>
                <svg className={`w-7 h-7 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className={`text-xl sm:text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Thank You for Your Cooperation
              </h3>
              <p className={`text-sm sm:text-base max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                By following these guidelines, you help us maintain a positive and productive learning environment 
                where everyone can thrive. Together, we can achieve excellence in education.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

