"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";

export default function WhatMakesUsSpecial() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      id: 1,
      icon: "certificate",
      title: "CEFR and GSE Aligned English Curriculum",
      description: "Our curriculum follows the internationally recognized Common European Framework of Reference (CEFR) and Global Scale of English (GSE), ensuring your progress is measured against global standards."
    },
    {
      id: 2,
      icon: "chart",
      title: "Progress Analytics",
      description: "Track your learning journey with detailed analytics and personalized feedback. Monitor your improvement across all language skills and see your growth in real-time."
    },
    {
      id: 3,
      icon: "video",
      title: "Live & Recorded Classes",
      description: "Attend live interactive sessions with expert instructors or access recorded classes at your convenience. Learn at your own pace with flexible scheduling options."
    },
    {
      id: 4,
      icon: "user",
      title: "Experienced Instructors",
      description: "Learn from internationally certified teachers who are passionate about student success. Our instructors use student-centered teaching methods to ensure optimal learning outcomes."
    },
    {
      id: 5,
      icon: "graduation",
      title: "Comprehensive Programs",
      description: "From General English to specialized courses like IELTS, TOEFL, ESP, and Professional Skills—we offer a complete range of programs to meet your learning goals."
    },
    {
      id: 6,
      icon: "computer",
      title: "Digital Learning Platform",
      description: "Access our state-of-the-art e-learning portal with interactive materials, e-books, audio-visual content, and practice exercises available 24/7."
    },
  ];

  const getIcon = (iconName) => {
    switch (iconName) {
      case "certificate":
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        );
      case "chart":
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case "video":
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case "user":
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case "graduation":
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v9M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        );
      case "computer":
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <section ref={sectionRef} className={`py-12 sm:py-16 lg:py-20 overflow-hidden ${isDarkMode ? 'bg-[#03002e]' : 'bg-white'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className={`text-center mb-8 sm:mb-12 lg:mb-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
              What Makes Us Special
            </h2>
            <p className={`text-sm sm:text-base lg:text-lg px-4 sm:px-0 ${isDarkMode ? 'text-white' : 'text-gray-600'}`}>
              Discover the unique features that set BEA apart as Somalia&apos;s premier English language academy
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className={`special-card rounded-lg p-4 sm:p-5 md:p-6 border cursor-pointer ${
                  isVisible ? 'animate-fade-in-up' : 'opacity-0'
                } ${isDarkMode ? 'bg-[#050040] border-[#1a1a3e]' : 'bg-white border-gray-200'}`}
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                <div className={`special-card-icon flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg mb-3 sm:mb-4 transition-all duration-300 ${isDarkMode ? 'bg-[#03002e] text-white' : 'bg-blue-100 text-blue-600'}`}>
                  {getIcon(feature.icon)}
                </div>
                <h3 className="special-card-title text-base sm:text-lg font-bold mb-2 sm:mb-3 transition-colors duration-300" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
                  {feature.title}
                </h3>
                <p className={`special-card-description text-xs sm:text-sm leading-relaxed transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-600'}`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

