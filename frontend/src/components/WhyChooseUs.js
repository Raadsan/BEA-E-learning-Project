"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";

export default function WhyChooseUs() {
  const { isDarkMode } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

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

  const reasons = [
    {
      id: 1,
      title: "Student-Centered Learning",
      description: "We believe every learner has a unique voice. Our modern teaching style ensures lessons are interactive, practical, and designed around you—not just the textbook.",
      image: "/images/Student—Centered Learning.jpg",
      alt: "Student-Centered Learning"
    },
    {
      id: 2,
      title: "World-Class Resources",
      description: "We teach Oxford University's English File 4th Edition—an internationally recognized English language learning series that builds real-world communication skills step by step.",
      image: "/images/book1.jpg",
      alt: "World-Class Resources"
    },
    {
      id: 3,
      title: "Prioritizing Speaking Confidence",
      description: "Understanding English is one thing, speaking it fluently is another. Our classes emphasize active speaking practice so you can unlock your voice and use English with ease in school, work, or daily life.",
      image: "/images/Prioritizing Speaking Confidence.jpg",
      alt: "Prioritizing Speaking Confidence"
    },
    {
      id: 4,
      title: "Experienced and Supportive Instructors",
      description: "Our team is passionate about helping students overcome fear and hesitation. We guide you patiently, encourage you to try, and celebrate your progress.",
      image: "/images/Experienced and Supportive Instructors.jpg",
      alt: "Experienced and Supportive Instructors"
    },
    {
      id: 5,
      title: "A Path to Global Opportunities",
      description: "English opens doors—to higher education, global careers, and meaningful connections. We prepare you not just to pass exams, but to succeed in the world beyond the classroom.",
      image: "/images/A Path to Global Opportunities.jpg",
      alt: "A Path to Global Opportunities"
    },
    {
      id: 6,
      title: "Innovative Learning Environment",
      description: "BEA provides a vibrant, technology-enhanced classroom experience that blends creativity with academic excellence. From digital media integration to interactive projects, students learn English in dynamic, real-life contexts that make lessons memorable and impactful.",
      image: "/images/Innovative Learning Environment.jpg",
      alt: "Innovative Learning Environment"
    },
  ];

  return (
    <section ref={sectionRef} className={`py-12 sm:py-16 lg:py-20 overflow-hidden ${isDarkMode ? 'bg-[#03002e]' : 'bg-white'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-12 sm:mb-16 max-w-5xl mx-auto ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-blue-900'}`}>
            Why Students Are Choosing Us?
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12 max-w-5xl mx-auto">
          {reasons.map((reason, index) => (
            <div
              key={reason.id}
              className={`rounded-xl shadow-lg overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 h-[450px] flex flex-col ${isDarkMode ? 'bg-[#050040]' : 'bg-white'} ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              {/* Image */}
              <div className="relative w-full h-60 flex-shrink-0">
                <Image
                  src={reason.image}
                  alt={reason.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              
              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className={`text-base font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {reason.title}
                </h3>
                <p className={`text-xs leading-relaxed flex-1 mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {reason.description}
                </p>
                <button className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors mt-auto header-keep-white ${isDarkMode ? 'bg-white text-[#010080] hover:bg-gray-100' : 'bg-blue-800 text-white hover:bg-blue-900'}`}>
                  Enroll now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
