"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";

export default function ProgramCards() {
  const [isVisible, setIsVisible] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(null);
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

  const programs = [
    {
      id: 1,
      title: "General English Program For Adults",
      description: "Our 8-Level General English Course is a comprehensive program designed to take learners from beginner to advanced proficiency.",
      color: "blue",
      image: "/images/8- Level General English Course for Adults.jpg",
      video: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Replace with actual video URL
    },
    {
      id: 2,
      title: "English for Specific Purposes (ESP) Program",
      description: "English for Specific Purposes (ESP) Program is tailored to meet the unique communication needs of professionals and learners across various fields.",
      color: "red",
      image: "/images/English for Specific Purposes (ESP).jpg",
      video: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Replace with actual video URL
    },
    {
      id: 3,
      title: "IELTS and TOEFL Exam Preparation Courses",
      description: "Our IELTS and TOEFL Preparation Course is designed to enrich our students with the strategies, skills, and confidence needed to excel in international English proficiency exams.",
      color: "blue",
      image: "/images/IELTS & TOEFL Preparation Courses1.jpg",
      video: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Replace with actual video URL
    },
    {
      id: 4,
      title: "Soft Skills and Workplace Training Programs",
      description: "Perfect your fluency with advanced vocabulary, idioms, and expressions.",
      color: "red",
      image: "/images/Soft Skills and Workplace Training Programs.jpg",
    },
    {
      id: 5,
      title: "BEA Academic Writing Program",
      description: "Enhance your professional dialogue.",
      color: "blue",
      image: "/images/A Path to Global Opportunities.jpg",
    },
    {
      id: 6,
      title: "Digital Literacy and Virtual Communication Skills Program",
      description: "Engage in everyday discussions.",
      color: "red",
      image: "/images/A Path to Global Opportunities.jpg",
    },
  ];

  return (
    <section ref={sectionRef} className={`py-12 sm:py-16 lg:py-20 overflow-hidden ${isDarkMode ? 'bg-[#03002e]' : 'bg-white'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 sm:mb-10 lg:mb-12 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
                BEA Programs Portfolio
              </h2>
              <p className={`text-sm sm:text-base lg:text-lg ${isDarkMode ? 'text-white' : 'text-gray-600'}`}>
                Choose from our expertly designed courses tailored to your level and goals.
              </p>
            </div>
            <a href="/programs" className={`font-semibold text-xs sm:text-sm md:text-base whitespace-nowrap border rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 hover:text-white transition-all duration-300 self-start sm:self-auto ${isDarkMode ? 'text-white border-white hover:bg-white hover:text-[#010080]' : ''}`} style={{ color: isDarkMode ? 'white' : '#010080', borderColor: isDarkMode ? 'white' : '#010080' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = isDarkMode ? 'white' : '#010080'; e.currentTarget.style.color = isDarkMode ? '#010080' : 'white'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = isDarkMode ? 'white' : '#010080'; }}>
              → View all programs
            </a>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {programs.slice(0, 3).map((program, index) => (
              <div
                key={program.id}
                className={`rounded-lg border overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                  isVisible ? 'animate-fade-in-up' : 'opacity-0'
                } ${isDarkMode ? 'bg-[#050040] border-[#1a1a3e]' : 'bg-white border-gray-200'}`}
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                {/* Video/Image with Play Icon */}
                <div className="relative h-40 sm:h-44 md:h-48 bg-gray-200 overflow-hidden">
                  {playingVideo === program.id ? (
                    // Video Player
                    <div className="w-full h-full relative">
                      <iframe
                        className="w-full h-full"
                        src={program.video}
                        title={program.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                      {/* Close Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlayingVideo(null);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center transition-colors z-10"
                        aria-label="Close video"
                      >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    // Image Thumbnail with Play Icon
                    <>
                      <Image
                        src={program.image}
                        alt={program.title}
                        fill
                        className="object-cover"
                      />
                      {/* Play Icon Overlay */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlayingVideo(program.id);
                        }}
                        className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors"
                        aria-label="Play video"
                      >
                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                          <svg className="w-6 h-6 text-gray-700 ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      </button>
                    </>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5">
                  {/* Title */}
                  <div className="mb-2">
                    <h3 className="text-sm sm:text-base md:text-lg font-bold" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
                      {program.title}
                    </h3>
                  </div>
                  
                  {/* Description */}
                  <p className={`text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 ${isDarkMode ? 'text-white' : 'text-gray-600'}`}>
                    {program.description}
                  </p>
                  
                  {/* Explore more */}
                  <a
                    href={
                      program.id === 1 ? "/programs/8-level-general-english" : 
                      program.id === 2 ? "/programs/esp" : 
                      program.id === 3 ? "/programs/ielts-toefl" : "#"
                    }
                    className={`text-sm font-semibold inline-flex items-center gap-1 ${
                      program.color === "red" 
                        ? "text-red-600 hover:text-red-700" 
                        : "text-blue-600 hover:text-blue-700"
                    }`}
                  >
                    <span>Explore more</span>
                    <svg 
                      className="w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}