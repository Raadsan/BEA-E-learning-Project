"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

export default function DigitalLiteracyProgram() {
  const { isDarkMode } = useTheme();
  const [visibleSections, setVisibleSections] = useState({ table: true });
  const sectionRefs = {
    hero: useRef(null),
    intro: useRef(null),
    table: useRef(null),
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
      course: "1. Digital Literacy and Basic ICT Skills",
      description: "Foundational computer skills, operating systems, internet basics, email use, file management, online safety, and essential ICT terminology."
    },
    {
      course: "2. Virtual Communication Language",
      description: "Professional online communication, email writing, chat etiquette, digital language proficiency, and virtual meeting protocols."
    },
    {
      course: "3. Remote Work and Virtual Team Management Skills",
      description: "Core competencies for remote environments: virtual teamwork, communication channels, task delegation, time management, remote professionalism, and team collaboration tools."
    },
    {
      course: "4. Online Productivity Tools and Digital Collaboration Skills",
      description: "Practical mastery of Google/Microsoft tools, cloud storage, shared documents, task boards (Trello/Notion), project coordination, and digital workflow management."
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
            src="/images/Digital Literacy & Virtual Communication Skills Program1.jpg"
            alt="Digital Literacy and Virtual Communication Skills Program"
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
                Digital Literacy and<br />
                Virtual Communication
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
              In today&apos;s fast-changing technology-driven world, the ability to use digital tools and communicate effectively online has become a must have skill to survive in living in an ever evolving digital world.
            </p>
            
            <p className={`${visibleSections.intro ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s', color: isDarkMode ? '#ffffff' : '#010080' }}>
              Digital Literacy is more than just knowing how to use technology—it is about using it smartly, creatively, and responsibly.
            </p>
            
            <p className={`${visibleSections.intro ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s', color: isDarkMode ? '#ffffff' : '#010080' }}>
              This program focuses on developing core digital competencies—such as navigating online platforms, creating and managing digital documents while using virtual collaboration tools like Microsoft Teams, Project Management Systems—Asana or Trello, and Video Conferencing Services like Zoom, Google Meet as well as document collaboration sites like Google Workspace.
            </p>
            
            <p className={`${visibleSections.intro ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s', color: isDarkMode ? '#ffffff' : '#010080' }}>
              In this program, we teach four general but essential courses which would transform every learner into a digitally literate and a competent individual in today&apos;s digital world.
            </p>
          </div>
        </div>
      </section>

      {/* Table Section */}
      <section ref={sectionRefs.table} className={`py-10 sm:py-14 lg:py-16 overflow-hidden ${isDarkMode ? 'bg-[#03002e]' : 'bg-white'}`}>
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Section Title */}
            <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-8 ${visibleSections.table ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
              Our Digital Literacy Courses and their Focus Areas
            </h2>
            
            {/* Table */}
            <div className={`overflow-hidden border ${isDarkMode ? 'border-[#1a1a3e]' : 'border-gray-200'} ${visibleSections.table ? 'animate-scale-in' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: '#dc2626' }}>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-white w-1/3 border-r border-red-700">
                        Courses
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-white">
                        Description / Focus Areas
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
                        <td className="px-4 sm:px-6 py-5 text-xs sm:text-sm leading-relaxed" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
                          {item.description}
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

      {/* Registration Section */}
      <section ref={sectionRefs.register} className={`py-10 sm:py-14 lg:py-16 overflow-hidden ${isDarkMode ? 'bg-[#03002e]' : 'bg-white'}`}>
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className={`text-sm sm:text-base leading-relaxed mb-8 ${visibleSections.register ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
              To learn more about the admission requirements for this program, course duration, weekly hours, learning method—in class or online, etc. Click the &quot;Register Now&quot; button below.
            </p>
            
            <div className={`${visibleSections.register ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
              <Link href="/auth/registration" className={`px-8 py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 hover:scale-105 inline-block header-keep-white ${
                isDarkMode ? 'bg-white hover:bg-gray-100' : 'bg-blue-800 text-white hover:bg-blue-900'
              }`}
              style={isDarkMode ? { color: '#010080' } : {}}
              >
                Register Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

