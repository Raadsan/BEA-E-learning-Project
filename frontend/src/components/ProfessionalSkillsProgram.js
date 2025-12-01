"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";

export default function ProfessionalSkillsProgram() {
  const { isDarkMode } = useTheme();
  const [visibleSections, setVisibleSections] = useState({ table: true, benefits: true });
  const sectionRefs = {
    hero: useRef(null),
    intro: useRef(null),
    table: useRef(null),
    description: useRef(null),
    benefits: useRef(null),
    register: useRef(null),
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

  const courses = [
    {
      course: "Communication & Interpersonal Skills",
      focus: "Active listening, verbal clarity, body language, rapport building",
      objectives: [
        "Listen actively and respectfully to each other's concerns.",
        "Communicate ideas clearly and confidently.",
        "Use body language effectively."
      ]
    },
    {
      course: "Leadership & Teamwork Development",
      focus: "Leadership styles, team collaboration, delegation, conflict resolution",
      objectives: [
        "Understand personal leadership styles.",
        "Work effectively in teams.",
        "Delegate and motivate team members."
      ]
    },
    {
      course: "Critical Thinking & Problem-Solving Skills",
      focus: "Analytical reasoning, creative thinking, decision-making, scenario analysis",
      objectives: [
        "Analyze problems critically.",
        "Apply creative problem-solving techniques.",
        "Use structured decision-making frameworks."
      ]
    },
    {
      course: "Customer Service & Client Relations",
      focus: "Service etiquette, handling complaints, service recovery, client satisfaction",
      objectives: [
        "Demonstrate professional service etiquette.",
        "Handle difficult clients with confidence.",
        "Apply service recovery strategies."
      ]
    },
    {
      course: "Time Management & Personal Productivity",
      focus: "Prioritization, goal setting, productivity tools, stress reduction",
      objectives: [
        "Prioritize and plan tasks.",
        "Set and achieve personal and professional goals.",
        "Manage stress effectively."
      ]
    },
    {
      course: "Professional Ethics & Workplace Conduct",
      focus: "Integrity, professionalism, cultural sensitivity, ethical decision-making",
      objectives: [
        "Uphold integrity and accountability. Demonstrate professional conduct.",
        "Show cultural sensitivity and respect.",
        "Make ethical decisions in professional contexts."
      ]
    },
  ];

  const benefits = [
    {
      icon: "book",
      title: "Practical Learning",
      description: "Every module connects theory to real-world performance."
    },
    {
      icon: "globe",
      title: "Global Relevance",
      description: "Programs are aligned with the UNESCO 21st Century Skills Framework and international workplace standards."
    },
    {
      icon: "mentor",
      title: "Expert Mentorship",
      description: "Delivered by experienced trainers, educators, and industry professionals."
    },
    {
      icon: "transform",
      title: "Career Transformation",
      description: "Empowering learners to move from competence to confidence in any professional field."
    },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#03002e]' : 'bg-white'}`}>
      {/* Hero Section - Background Image with Left Shadow */}
      <section
        ref={sectionRefs.hero}
        className="relative overflow-hidden h-[350px] sm:h-[420px] lg:h-[500px]"
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/images/Professional Skills and Training Programs.jpg"
            alt="Professional Skills and Training Programs"
            className="w-full h-full object-cover scale-110"
          />
        </div>
        
        {/* Left Shadow/Gradient Overlay */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, rgba(1, 0, 128, 0.95) 0%, rgba(1, 0, 128, 0.8) 20%, rgba(1, 0, 128, 0.4) 40%, rgba(1, 0, 128, 0.1) 55%, transparent 65%)'
          }}
        />
        
        {/* Title Content */}
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className={`max-w-md ${visibleSections.hero ? 'animate-fade-in-left' : 'opacity-0'}`}>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white leading-tight">
                Soft Skills and Workplace<br />
                Training Program
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section ref={sectionRefs.intro} className={`py-8 sm:py-12 overflow-hidden ${isDarkMode ? 'bg-[#03002e]' : 'bg-white'}`}>
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="space-y-6 leading-relaxed text-base sm:text-lg">
            <p className={`${visibleSections.intro ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s', color: isDarkMode ? '#ffffff' : '#010080' }}>
              As an institution we go beyond language learning and empower individuals with the 21st century essential skills they need to succeed in their careers.
            </p>
            
            <p className={`${visibleSections.intro ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s', color: isDarkMode ? '#ffffff' : '#010080' }}>
              We believe that true excellence stems from the right skillset and mindset. This is why all of our courses in this program are carefully designed to address the demands of the modern world and that of international employers.
            </p>
            
            <p className={`${visibleSections.intro ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s', color: isDarkMode ? '#ffffff' : '#010080' }}>
              In this program we teach our students 6 soft kills courses that will automatically make their CVs standout from the rest of the competition.
            </p>
          </div>
        </div>
      </section>

      {/* Table Section */}
      <section ref={sectionRefs.table} className={`py-10 sm:py-14 lg:py-16 overflow-hidden ${isDarkMode ? 'bg-[#03002e]' : 'bg-white'}`}>
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Section Title */}
            <h2 className={`text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-center mb-8 ${visibleSections.table ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
              Soft Skills and Workplace Training Program Courses We Offer
            </h2>
            
            {/* Table */}
            <div className={`overflow-hidden border ${isDarkMode ? 'border-[#1a1a3e]' : 'border-gray-200'} ${visibleSections.table ? 'animate-scale-in' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: '#dc2626' }}>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-white w-1/4 border-r border-red-700">
                        Course
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-white w-1/4 border-r border-red-700">
                        Focus Area
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-white">
                        Learning Objectives
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((item, index) => (
                      <tr 
                        key={index} 
                        className={`transition-colors ${isDarkMode ? 'border-b border-[#1a1a3e]' : 'border-b border-gray-200'} ${
                          isDarkMode 
                            ? (index % 2 === 0 ? "bg-[#050040]" : "bg-[#03002e]/50")
                            : (index % 2 === 0 ? "bg-white" : "bg-blue-50/30")
                        }`}
                      >
                        <td className={`px-4 sm:px-6 py-5 align-top border-r ${isDarkMode ? 'border-[#1a1a3e]' : 'border-gray-200'}`}>
                          <span className="font-semibold text-xs sm:text-sm" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
                            {item.course}
                          </span>
                        </td>
                        <td className={`px-4 sm:px-6 py-5 text-xs sm:text-sm leading-relaxed border-r ${isDarkMode ? 'border-[#1a1a3e]' : 'border-gray-200'}`} style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
                          {item.focus}
                        </td>
                        <td className="px-4 sm:px-6 py-5 text-xs sm:text-sm leading-relaxed" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
                          <ul className="space-y-1">
                            {item.objectives.map((obj, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5">✓</span>
                                <span>{obj}</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section ref={sectionRefs.description} className={`py-8 sm:py-12 overflow-hidden ${isDarkMode ? 'bg-[#03002e]' : 'bg-white'}`}>
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="space-y-6">
            <h2 className={`text-xl sm:text-2xl lg:text-3xl font-serif font-bold ${visibleSections.description ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
              Soft Skills and Workplace Training Program
            </h2>
            
            <p className={`leading-relaxed text-base sm:text-lg ${visibleSections.description ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s', color: isDarkMode ? '#ffffff' : '#010080' }}>
              As an institution we go beyond language learning and empower individuals with the 21st century essential skills they need to succeed in their careers. We believe that true excellence stems from the right skillset and mindset. This is why all of our courses in this program are carefully designed to address the demands of the modern world and that of international employers. In this program we teach our students 6 soft kills courses that will automatically make their CVs standout from the rest of the competition.
            </p>
            
            <h3 className={`text-lg sm:text-xl lg:text-2xl font-serif font-bold mt-8 ${visibleSections.description ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s', color: isDarkMode ? '#ffffff' : '#010080' }}>
              Soft Skills and Workplace Training Program Courses We Offer
            </h3>
            
            <p className={`leading-relaxed text-base sm:text-lg ${visibleSections.description ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s', color: isDarkMode ? '#ffffff' : '#010080' }}>
              To learn more about the admission requirements for this program, course durations, weekly hours, learning method—in class or online, etc. Click the &quot;Register Now&quot; button below.
            </p>
            
            <div className={`text-center ${visibleSections.description ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
              <button className={`px-8 py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-white header-keep-white text-[#010080] hover:bg-gray-100' : 'bg-blue-900 text-white hover:bg-blue-800'}`}>
                Register Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Why You Should Join Section */}
      <section ref={sectionRefs.benefits} className={`py-12 sm:py-16 lg:py-20 overflow-hidden ${isDarkMode ? 'bg-[#04003a]' : ''}`} style={{ backgroundColor: isDarkMode ? undefined : '#f5f7fa' }}>
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-serif italic font-bold text-center mb-12 ${visibleSections.benefits ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ color: isDarkMode ? '#ffffff' : '#1a1a80' }}>
              Why You Should Join Our Professional<br />
              Skills Training Programs?
            </h2>
            
            <div className="space-y-5">
              {/* Practical Learning - Star/Sparkle icon */}
              <div 
                className={`rounded-lg p-6 sm:p-8 flex items-center gap-6 shadow-sm ${visibleSections.benefits ? 'animate-fade-in-up' : 'opacity-0'} ${isDarkMode ? 'bg-[#050040]' : 'bg-white'}`}
                style={{ animationDelay: '0.1s' }}
              >
                <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center">
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3v4M12 17v4M3 12h4M17 12h4"/>
                    <path d="M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>
                  </svg>
                </div>
                <p className="text-sm sm:text-base" style={{ color: isDarkMode ? '#ffffff' : '#1a1a80' }}>
                  <span className="font-semibold">Practical Learning</span>{" "}
                  <span className={`font-normal ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>— Every module connects theory to real-world performance.</span>
                </p>
              </div>

              {/* Global Relevance - Globe on stand icon */}
              <div 
                className={`rounded-lg p-6 sm:p-8 flex items-center gap-6 shadow-sm ${visibleSections.benefits ? 'animate-fade-in-up' : 'opacity-0'} ${isDarkMode ? 'bg-[#050040]' : 'bg-white'}`}
                style={{ animationDelay: '0.2s' }}
              >
                <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center">
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke={isDarkMode ? '#ffffff' : '#1a1a80'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="10" r="6"/>
                    <ellipse cx="12" cy="10" rx="6" ry="2.5"/>
                    <path d="M12 4v12"/>
                    <path d="M12 16v3"/>
                    <path d="M8 21h8"/>
                    <path d="M12 19v2"/>
                  </svg>
                </div>
                <p className="text-sm sm:text-base" style={{ color: isDarkMode ? '#ffffff' : '#1a1a80' }}>
                  <span className="font-semibold">Global Relevance</span>{" "}
                  <span className={`font-normal ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>— Programs are aligned with the UNESCO 21st Century Skills Framework and international workplace standards.</span>
                </p>
              </div>

              {/* Expert Mentorship - Presentation/Monitor icon */}
              <div 
                className={`rounded-lg p-6 sm:p-8 flex items-center gap-6 shadow-sm ${visibleSections.benefits ? 'animate-fade-in-up' : 'opacity-0'} ${isDarkMode ? 'bg-[#050040]' : 'bg-white'}`}
                style={{ animationDelay: '0.3s' }}
              >
                <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center">
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="#9b59b6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="12" rx="1"/>
                    <path d="M8 20h8"/>
                    <path d="M12 16v4"/>
                    <circle cx="7" cy="10" r="2"/>
                    <path d="M12 8h6"/>
                    <path d="M12 11h4"/>
                  </svg>
                </div>
                <p className="text-sm sm:text-base" style={{ color: isDarkMode ? '#ffffff' : '#1a1a80' }}>
                  <span className="font-semibold">Expert Mentorship</span>{" "}
                  <span className={`font-normal ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>— Delivered by experienced trainers, educators, and industry professionals.</span>
                </p>
              </div>

              {/* Career Transformation - Double arrow icon */}
              <div 
                className={`rounded-lg p-6 sm:p-8 flex items-center gap-6 shadow-sm ${visibleSections.benefits ? 'animate-fade-in-up' : 'opacity-0'} ${isDarkMode ? 'bg-[#050040]' : 'bg-white'}`}
                style={{ animationDelay: '0.4s' }}
              >
                <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center">
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="#9b59b6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 8l4-4 4 4"/>
                    <path d="M8 4v8"/>
                    <path d="M12 16l4 4 4-4"/>
                    <path d="M16 12v8"/>
                  </svg>
                </div>
                <p className="text-sm sm:text-base" style={{ color: isDarkMode ? '#ffffff' : '#1a1a80' }}>
                  <span className="font-semibold">Career Transformation</span>{" "}
                  <span className={`font-normal ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>— Empowering learners to move from competence to confidence in any professional field.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

