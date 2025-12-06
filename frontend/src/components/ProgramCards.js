"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { getProgramRoute } from "@/utils/programRoutes";

// Video Card Component
function VideoProgramCard({ program, index, isDarkMode, isVisible }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  return (
    <Link
      key={program.id}
      href={program.link || "#"}
      className={`rounded-lg border overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
        isVisible ? 'animate-fade-in-up' : 'opacity-0'
      } ${isDarkMode ? 'bg-[#050040] border-[#1a1a3e]' : 'bg-white border-gray-200'}`}
      style={{ animationDelay: `${0.1 + index * 0.1}s` }}
    >
      {/* Video/Image with Play Icon */}
      <div className="relative h-40 sm:h-44 md:h-48 bg-black overflow-hidden">
        {program.video ? (
          <>
            <video
              ref={videoRef}
              src={program.video}
              className="w-full h-full object-cover"
              width="100%"
              height="100%"
              controls
              controlsList="nodownload"
              muted
              loop
              playsInline
              preload="metadata"
              poster={program.image}
              onPlay={handleVideoPlay}
              onPause={handleVideoPause}
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
              style={{ display: 'block' }}
            >
              Your browser does not support the video tag.
            </video>
            {/* Play Icon Overlay - Only show when video is paused */}
            {!isPlaying && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors cursor-pointer"
                onClick={handlePlayClick}
                style={{ pointerEvents: 'auto' }}
              >
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg pointer-events-none">
                  <svg className="w-6 h-6 text-gray-700 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <Image
              src={program.image}
              alt={program.title}
              fill
              className="object-cover"
            />
            {/* Play Icon Overlay for images */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-gray-700 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        {/* Title with Heart Icon */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm sm:text-base md:text-lg font-bold flex-1" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
            {program.title}
          </h3>
          <button className={`transition-colors ml-2 ${isDarkMode ? 'text-white hover:text-red-500' : 'text-gray-400 hover:text-red-500'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
        
        {/* Description */}
        <p className={`text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 ${isDarkMode ? 'text-white' : 'text-gray-600'}`}>
          {program.description}
        </p>
        
        {/* Explore more */}
        <div
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
        </div>
      </div>
    </Link>
  );
}

export default function ProgramCards() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const { isDarkMode } = useTheme();

  // Fetch programs from backend
  const { data: backendPrograms, isLoading, isError, error } = useGetProgramsQuery();

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

  // Map backend data to frontend format
  const programs = backendPrograms?.map((program) => ({
    id: program.id,
    title: program.title,
    description: program.description || "",
    video: program.video ? `http://localhost:5000${program.video}` : null,
    image: program.image ? `http://localhost:5000${program.image}` : "/images/book1.jpg",
    link: getProgramRoute(program.title), // Map to correct route based on title
  })) || [];

  // Sort programs: id 3 first, id 9 last, others in between
  const sortedPrograms = [...programs].sort((a, b) => {
    // Program 3 should be first
    if (a.id === 3) return -1;
    if (b.id === 3) return 1;
    // Program 9 should be last
    if (a.id === 9) return 1;
    if (b.id === 9) return -1;
    // Others sorted by id ascending
    return a.id - b.id;
  }).map((program, index) => ({
    ...program,
    color: index % 2 === 0 ? "blue" : "red", // Alternate colors based on sorted position
  }));

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
            <a href="/website/programs" className={`font-semibold text-xs sm:text-sm md:text-base whitespace-nowrap border rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 hover:text-white transition-all duration-300 self-start sm:self-auto ${isDarkMode ? 'text-white border-white hover:bg-white hover:text-[#010080]' : ''}`} style={{ color: isDarkMode ? 'white' : '#010080', borderColor: isDarkMode ? 'white' : '#010080' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = isDarkMode ? 'white' : '#010080'; e.currentTarget.style.color = isDarkMode ? '#010080' : 'white'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = isDarkMode ? 'white' : '#010080'; }}>
              → View all programs
            </a>
          </div>
          
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                Loading programs...
              </div>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="text-center py-12">
              <div className={`text-lg ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                Error loading programs. Please try again later.
              </div>
            </div>
          )}

          {/* Programs Grid */}
          {!isLoading && !isError && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {sortedPrograms.slice(0, 3).map((program, index) => (
                <VideoProgramCard
                  key={program.id}
                  program={program}
                  index={index}
                  isDarkMode={isDarkMode}
                  isVisible={isVisible}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}