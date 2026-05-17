"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

export default function IELTSTOEFLProgram() {
  const { isDarkMode } = useTheme();
  const [visibleSections, setVisibleSections] = useState({ table: true, comparison: true });

  const sectionRefs = {
    hero: useRef(null),
    intro: useRef(null),
    table: useRef(null),
    comparison: useRef(null),
    outcome: useRef(null),
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

  const exams = [
    {
      exam: "IELTS (International English Language Testing System)",
      objectives: "This course prepares candidates for both Academic and General Training modules. Students develop listening accuracy, analytical reading skills, structured academic writing, and fluent speaking ability. BEA integrates practice tests, examiner-style feedback, and vocabulary enhancement to ensure familiarity with all question types and scoring criteria."
    },
    {
      exam: "TOEFL (Test of English as a Foreign Language - iBT)",
      objectives: "Designed for university-bound and professional candidates, this course focuses on integrated skills development—combining reading, listening, speaking, and writing in academic contexts. Learners build confidence through timed exercises, note-taking strategies, and digital test techniques to achieve top scores in the internet-based TOEFL (iBT) format."
    },
  ];

  const comparisonData = [
    {
      feature: "Purpose",
      ielts: "Study, migration and employment in English-speaking countries",
      toefl: "Academic and professional entry, especially in U.S.-based institutions"
    },
    {
      feature: "Test Format",
      ielts: "Paper-based or Computer-delivered (4 modules)",
      toefl: "Fully Computer-based (4 sections)"
    },
    {
      feature: "Test Sections",
      ielts: "Listening, Reading, Writing, Speaking",
      toefl: "Reading, Listening, Speaking, Writing"
    },
    {
      feature: "Scoring System",
      ielts: "Band scale 1-9 (overall and per skill)",
      toefl: "Score range 0-120 (each skill scored 0-30)"
    },
    {
      feature: "Duration",
      ielts: "Approximately 2 hours 45 minutes",
      toefl: "Approximately 3 hours"
    },
    {
      feature: "Speaking Test Format",
      ielts: "Face-to-face with an examiner",
      toefl: "Recorded responses via microphone"
    },
    {
      feature: "Writing Focus",
      ielts: "Task 1: Report or Letter, Task 2: Essay",
      toefl: "Task 1: Integrated Writing, Task 2: Independent Essay"
    },
    {
      feature: "Success Strategies",
      ielts: "Focus on paraphrasing, coherence, and time control",
      toefl: "Focus on note-taking, integrated task management, and vocabulary expansion"
    },
    {
      feature: "Ideal Candidates",
      ielts: "For learners targeting the UK, Canada, Australia, and New Zealand",
      toefl: "For learners targeting U.S. universities and international academic programs"
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
            src="/images/IELTS & TOEFL Preparation Courses1.jpg"
            alt="IELTS & TOEFL Preparation Course"
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
                IELTS & TOEFL<br />
                Preparation Course
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
              Our IELTS and TOEFL Preparation Programs are strategically developed to help learners succeed in the world&apos;s most recognized English proficiency exams. Both programs focus on building test-specific skills, academic communication strategies, and confidence through comprehensive lessons and simulated testing experiences.
            </p>
            
            <p className={`${visibleSections.intro ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s', color: isDarkMode ? '#ffffff' : '#010080' }}>
              Under our mentorship each learner receives individualized attention, continuous feedback, and practice opportunities that replicate real test conditions.
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
              Introduction to IELTS and TOEFL Exams
            </h2>
            
            {/* Table */}
            <div className={`overflow-hidden border ${isDarkMode ? 'border-[#1a1a3e]' : 'border-gray-200'} ${visibleSections.table ? 'animate-scale-in' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: '#dc2626' }}>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-white w-1/4 border-r border-red-700">
                        Exam
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-white">
                        Course focus and objectives
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {exams.map((item, index) => (
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
                            {item.exam}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-5 text-xs sm:text-sm leading-relaxed" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
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

      {/* IELTS vs TOEFL Comparison Section */}
      <section ref={sectionRefs.comparison} className={`py-10 sm:py-14 lg:py-16 overflow-hidden ${isDarkMode ? 'bg-[#03002e]' : 'bg-white'}`}>
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Section Title */}
            <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-8 ${visibleSections.comparison ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
              IELTS vs TOEFL - A side-by-side comparison
            </h2>
            
            {/* Comparison Table */}
            <div className={`overflow-hidden border ${isDarkMode ? 'border-[#1a1a3e]' : 'border-gray-200'} ${visibleSections.comparison ? 'animate-scale-in' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: '#dc2626' }}>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-white w-1/4 border-r border-red-700">
                        Feature
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-white w-[37.5%] border-r border-red-700">
                        IELTS
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-white w-[37.5%]">
                        TOEFL iBT
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((item, index) => (
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
                            {item.feature}
                          </span>
                        </td>
                        <td className={`px-4 sm:px-6 py-5 text-xs sm:text-sm leading-relaxed border-r ${isDarkMode ? 'border-[#1a1a3e]' : 'border-gray-200'}`} style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
                          {item.ielts}
                        </td>
                        <td className="px-4 sm:px-6 py-5 text-xs sm:text-sm leading-relaxed" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
                          {item.toefl}
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

      {/* Program Outcome Section */}
      <section ref={sectionRefs.outcome} className={`py-10 sm:py-14 lg:py-16 overflow-hidden ${isDarkMode ? 'bg-[#03002e]' : 'bg-white'}`}>
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-serif font-bold mb-6 ${visibleSections.outcome ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
              Program Outcome
            </h2>
            
            <p className={`text-sm sm:text-base leading-relaxed mb-8 ${visibleSections.outcome ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s', color: isDarkMode ? '#ffffff' : '#010080' }}>
              Graduates of BEA&apos;s IELTS and TOEFL preparation programs emerge ready to meet global English proficiency standards. Beyond achieving their target scores, students gain lasting confidence in academic and professional communication. With BEA&apos;s expert guidance, strategic training, and supportive learning environment, success in IELTS or TOEFL becomes the foundation for international opportunity and lifelong achievement.
            </p>
            
            <div className={`${visibleSections.outcome ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              <Link 
                href="/auth/ielts-toefl-registration"
                className={`px-8 py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 hover:scale-105 inline-block header-keep-white ${isDarkMode ? 'bg-white hover:bg-gray-100' : 'bg-blue-800 text-white hover:bg-blue-900'}`}
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

