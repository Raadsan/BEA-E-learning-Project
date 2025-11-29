"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function WhatMakesUsSpecial() {
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.1 });
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
    <section ref={ref} className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className={`text-center mb-12 sm:mb-16 transition-all duration-700 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
            <h2 className="text-gray-800 text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              What Makes Us Special
            </h2>
            <p className="text-gray-600 text-base sm:text-lg">
              Discover the unique features that set BEA apart as Somalia&apos;s premier English language academy
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className={`group bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg hover:bg-[#010080] transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 ${
                  isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-lg mb-4 text-blue-600 transition-transform duration-300 group-hover:scale-110 group-hover:bg-blue-200 group-hover:text-white">
                  {getIcon(feature.icon)}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-white transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed group-hover:text-white transition-colors duration-300">
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

