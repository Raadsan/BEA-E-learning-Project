"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import BEAExamRegistration from "./BEAExamRegistration";

export default function BEAExams() {
  const { isDarkMode } = useTheme();
  const [visibleSections, setVisibleSections] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedExamType, setSelectedExamType] = useState("proficiency");

  const handleApplyClick = (examType) => {
    setSelectedExamType(examType);
    setShowModal(true);
  };
  const sectionRefs = {
    hero: useRef(null),
    content: useRef(null),
    placement: useRef(null),
    proficiency: useRef(null),
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

  const placementData = [
    {
      category: "Purpose",
      details: "This course prepares candidates for both Academic and General Training modules. Students develop listening accuracy, analytical reading skills, structured academic writing, and fluent speaking ability. BEA integrates practice tests, examiner-style feedback, and vocabulary enhancement to ensure familiarity with all question types and scoring criteria."
    },
    {
      category: "Mandatory for All New Students",
      details: "The BEA Placement Test is a core component of our admissions process and is designed to place every new student in the class that best matches their language ability. Every incoming student is required to complete the BEA Placement Test before joining any class. This ensures accurate placement and a smooth learning experience."
    },
    {
      category: "Flexible Testing Options",
      details: "Students can take the placement test either in-class at our campus or online through our E-learning portal."
    },
    {
      category: "Comprehensive Assessment Format",
      details: "The test includes both written and oral components, measuring grammar, vocabulary, reading comprehension, listening, and speaking skills."
    },
    {
      category: "Personal Interview Session",
      details: "After receiving the written test results, every student attends a one-on-one interview with our English Teacher Panel, regardless of their written score."
    },
    {
      category: "Expert Level Placement",
      details: "Final placement decisions are made by BEA's teacher panel, ensuring each learner is assigned to the most suitable level for their current ability and growth potential."
    },
    {
      category: "Fast and Transparent Feedback",
      details: "Results and placement recommendations are provided within 24 hours, allowing students to begin their course without delay."
    },
    {
      category: "Progressive Learning Pathway",
      details: "The test results also help BEA design a personalized learning plan to support students' progress across our 8-Level General English Program."
    },
  ];

  const proficiencyData = [
    {
      category: "Purpose",
      details: "The BEA Proficiency Test is an advanced-level assessment designed for experienced English learners seeking formal recognition of their language mastery."
    },
    {
      category: "Optional but Highly Recognized",
      details: "Unlike the placement test, participation is voluntary, but it serves as a benchmark of achievement for advanced learners."
    },
    {
      category: "Flexible Testing Options",
      details: "Available both in-class and online, making it accessible to local and international candidates."
    },
    {
      category: "Dual-Test Format",
      details: "The test includes written and oral components, assessing academic writing, listening, reading, and spoken fluency."
    },
    {
      category: "Certification and Academic Credit",
      details: "Students who pass with distinction may receive the BEA English Proficiency Certificate, often recognized for academic or professional advancement."
    },
    {
      category: "For Advanced and Proficient Learners Only",
      details: "This test is exclusively designed for Advanced Plus students or those demonstrating near-native fluency seeking university admission or professional validation."
    },
    {
      category: "Aligned with Global Standards",
      details: "The test structure reflects international benchmarks such as CEFR, IELTS, and TOEFL scales, ensuring its credibility and relevance."
    },
    {
      category: "Career and Academic Utility",
      details: "Many graduates use the BEA Proficiency Test results to strengthen their university applications or career profiles, both locally and abroad."
    },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#03002e]' : 'bg-white'}`}>
      {/* Hero Section */}
      <section 
        ref={sectionRefs.hero}
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          background: isDarkMode 
            ? 'linear-gradient(135deg, #03002e 0%, #050040 50%, #03002e 100%)'
            : 'linear-gradient(135deg, #1a237e 0%, #311b92 50%, #b71c1c 100%)',
          height: '170px'
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className={`text-5xl sm:text-6xl lg:text-7xl font-serif italic text-white mb-4 ${visibleSections.hero ? 'animate-fade-in-down' : 'opacity-0'}`}>
            BEA Exams
          </h1>
        </div>
      </section>

      {/* Main Content Area */}
      <section ref={sectionRefs.content} className={`py-12 sm:py-16 lg:py-20 overflow-hidden ${isDarkMode ? 'bg-[#03002e]' : 'bg-white'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Introduction */}
            <p className={`leading-relaxed text-base sm:text-lg ${visibleSections.content ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
              As an Educational Institution, we believe every learner&apos;s journey begins with understanding their true level of English proficiency. To ensure every student receives the most effective and personalized learning experience, BEA employs two key assessments — the BEA Placement Test and the BEA Proficiency Test.
            </p>
            
            {/* Call to Action */}
            <p className={`font-serif text-base sm:text-lg font-semibold ${visibleSections.content ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s', color: isDarkMode ? '#ffffff' : '#010080' }}>
              To learn more about BEA Exams, check the two tables below
            </p>
            
            {/* Test Listings */}
            <div className="space-y-12 mt-12">
              {/* Placement Test Table */}
              <div ref={sectionRefs.placement}>
                <h2 className={`text-2xl sm:text-3xl font-bold mb-6 ${visibleSections.placement ? 'animate-fade-in-left' : 'opacity-0'}`} style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
                  1. BEA PLACEMENT TEST
                </h2>
                
                <div className={`overflow-hidden border ${isDarkMode ? 'border-[#1a1a3e]' : 'border-gray-200'} ${visibleSections.placement ? 'animate-scale-in' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ backgroundColor: '#dc2626' }}>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-white w-1/3 border-r border-red-700">
                            Category
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-white">
                            Details
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {placementData.map((item, index) => (
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
                                {item.category}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-5 text-xs sm:text-sm leading-relaxed" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
                              {item.details}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Apply Now Button for Placement Test */}
                <div className={`text-center mt-6 ${visibleSections.placement ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
                  <Link
                    href="/auth/registration"
                    className={`px-8 py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 hover:scale-105 inline-block header-keep-white ${
                      isDarkMode ? 'bg-white hover:bg-gray-100' : 'bg-blue-800 text-white hover:bg-blue-900'
                    }`}
                    style={isDarkMode ? { color: '#010080' } : {}}
                  >
                    Apply Now
                  </Link>
                </div>
              </div>
              
              {/* Proficiency Test Table */}
              <div ref={sectionRefs.proficiency}>
                <h2 className={`text-2xl sm:text-3xl font-bold mb-6 ${visibleSections.proficiency ? 'animate-fade-in-left' : 'opacity-0'}`} style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
                  2. BEA PROFICIENCY TEST
                </h2>
                
                <div className={`overflow-hidden border ${isDarkMode ? 'border-[#1a1a3e]' : 'border-gray-200'} ${visibleSections.proficiency ? 'animate-scale-in' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ backgroundColor: '#dc2626' }}>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-white w-1/3 border-r border-red-700">
                            Category
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-white">
                            Details
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {proficiencyData.map((item, index) => (
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
                                {item.category}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-5 text-xs sm:text-sm leading-relaxed" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
                              {item.details}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Apply Now Button for Proficiency Test */}
                <div className={`text-center mt-6 ${visibleSections.proficiency ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
                  <button
                    onClick={() => handleApplyClick("proficiency")}
                    className={`px-8 py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 hover:scale-105 header-keep-white ${
                      isDarkMode ? 'bg-white hover:bg-gray-100' : 'bg-blue-800 text-white hover:bg-blue-900'
                    }`}
                    style={isDarkMode ? { color: '#010080' } : {}}
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BEA Exam Registration Modal */}
      <BEAExamRegistration 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        examType={selectedExamType}
      />
    </div>
  );
}
