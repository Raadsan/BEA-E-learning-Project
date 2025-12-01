"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";

export default function AcademicWritingProgram() {
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

  const levels = [
    {
      level: "Level 1 (Skill 1)",
      cefr: "A1 - Beginner",
      focus: "Structuring simple sentences and forming basic connected ideas.",
      objectives: "Learners can produce correct sentences and combine them into short, simple paragraphs."
    },
    {
      level: "Level 1 (Skill 2)",
      cefr: "A2 - Beginner",
      focus: "Expanding paragraph structure and organizing multiple paragraphs into passages.",
      objectives: "Learners can write coherent passages with clear paragraph flow."
    },
    {
      level: "Level 2 (Skill 1)",
      cefr: "B1 - Intermediate",
      focus: "Transitioning from paragraphs to essay-building skills (introductions, body paragraphs, conclusions).",
      objectives: "Learners can write structured short essays with clarity and coherence."
    },
    {
      level: "Level 2 (Skill 2)",
      cefr: "B2 - Intermediate",
      focus: "Mastering full essay writing: argumentative, clarity, cohesion, and academic style.",
      objectives: "Learners can produce well-developed essays with logical structure and academic tone."
    },
    {
      level: "Level 3",
      cefr: "C1 - Advanced",
      focus: "Moving from essay mastery to academic research writing: research structure, citations, clarity, and academic formalities.",
      objectives: "Learners can produce polished research papers following academic writing conventions."
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
            src="/images/Advanced Academic Writing Program.jpg"
            alt="BEA Academic Writing Program"
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
                BEA Academic Writing<br />
                Program
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
              Our BEA Academic writing is designed for students, researchers, and professionals who are eager to refine their written communication for success. This program helps you gain the essential skills you need to produce high-quality essays, research papers, and reports that meet international academic standards.
            </p>
            
            <p className={`${visibleSections.intro ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s', color: isDarkMode ? '#ffffff' : '#010080' }}>
              This program covers everything from critical analysis and citation mastery to academic tone, referencing styles, and proofreading strategies.
            </p>
            
            <p className={`${visibleSections.intro ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s', color: isDarkMode ? '#ffffff' : '#010080' }}>
              The curriculum we teach and the other course materials we provide in this program are internationally recognized and academically respected ones.
            </p>
            
            <p className={`${visibleSections.intro ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s', color: isDarkMode ? '#ffffff' : '#010080' }}>
              By the end of this program, students will develop the confidence to express complex ideas with precision, coherence, and academic integrity.
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
              Academic Writing Program Levels
            </h2>
            
            {/* Table */}
            <div className={`overflow-hidden border ${isDarkMode ? 'border-[#1a1a3e]' : 'border-gray-200'} ${visibleSections.table ? 'animate-scale-in' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: '#dc2626' }}>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-white border-r border-red-700">
                        Level
                      </th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-white border-r border-red-700">
                        CEFR Level
                      </th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-white border-r border-red-700">
                        Learning Focus
                      </th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-white">
                        Objectives
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {levels.map((item, index) => (
                      <tr 
                        key={index} 
                        className={`transition-colors ${isDarkMode ? 'border-b border-[#1a1a3e]' : 'border-b border-gray-200'} ${
                          isDarkMode 
                            ? (index % 2 === 0 ? "bg-[#050040]" : "bg-[#03002e]/50")
                            : (index % 2 === 0 ? "bg-white" : "bg-blue-50/30")
                        }`}
                      >
                        <td className={`px-3 sm:px-4 py-5 align-top border-r ${isDarkMode ? 'border-[#1a1a3e]' : 'border-gray-200'}`}>
                          <span className="font-semibold text-xs sm:text-sm" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
                            {item.level}
                          </span>
                        </td>
                        <td className={`px-3 sm:px-4 py-5 align-top text-xs sm:text-sm border-r ${isDarkMode ? 'border-[#1a1a3e]' : 'border-gray-200'}`} style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
                          {item.cefr}
                        </td>
                        <td className={`px-3 sm:px-4 py-5 text-xs sm:text-sm leading-relaxed border-r ${isDarkMode ? 'border-[#1a1a3e]' : 'border-gray-200'}`} style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
                          {item.focus}
                        </td>
                        <td className="px-3 sm:px-4 py-5 text-xs sm:text-sm leading-relaxed" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
                          {item.objectives}
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
              <button className={`px-8 py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-white header-keep-white text-[#010080] hover:bg-gray-100' : 'bg-blue-800 text-white hover:bg-blue-900'}`}>
                Register Now
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

