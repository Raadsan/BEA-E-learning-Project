"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { getProgramRoute } from "@/utils/programRoutes";
import { API_BASE_URL } from "@/constants";

// Program Card Component with Video Support
function ProgramCard({ program, index, isDarkMode, isVisible, playingVideos, setPlayingVideos }) {
  const videoRef = useRef(null);
  const isPlaying = playingVideos[program.id] || false;

  const handlePlayClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.play();
      setPlayingVideos(prev => ({ ...prev, [program.id]: true }));
    }
  };

  const handleVideoPlay = () => {
    setPlayingVideos(prev => ({ ...prev, [program.id]: true }));
  };

  const handleVideoPause = () => {
    setPlayingVideos(prev => ({ ...prev, [program.id]: false }));
  };

  return (
    <Link
      href={program.link || "#"}
      className={`rounded-xl shadow-lg overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col cursor-pointer ${isDarkMode ? 'bg-[#050040]' : 'bg-white'} ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
      style={{ animationDelay: `${0.1 + index * 0.1}s` }}
    >
      {/* Video/Image with Play Icon - Matching Home Section Style */}
      <div className="relative w-full h-48 sm:h-56 overflow-hidden rounded-tl-xl rounded-tr-xl group bg-black">
        {program.video ? (
          <>
            <video
              ref={videoRef}
              src={program.video}
              className="w-full h-full object-cover rounded-tl-xl rounded-tr-xl transition-transform duration-300 group-hover:scale-110"
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
                className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors cursor-pointer rounded-tl-xl rounded-tr-xl"
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
              alt={program.alt}
              fill
              className="object-cover rounded-tl-xl rounded-tr-xl transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized
              onError={(e) => {
                // Fallback to default image if backend image fails to load
                e.target.src = "/images/book1.jpg";
              }}
            />
            {/* Play Icon Overlay for images */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors rounded-tl-xl rounded-tr-xl">
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
      <div className="p-6 flex-1 flex flex-col">
        <h3 className={`text-sm sm:text-base font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {program.title}
        </h3>

        <p className={`text-[12px] sm:text-xs leading-relaxed mb-4 flex-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {program.description}
        </p>

        {/* Read More Button */}
        <div
          className={`px-6 py-2 rounded-lg font-semibold transition-colors text-sm sm:text-base w-full text-center block header-keep-white ${isDarkMode ? 'bg-white hover:bg-gray-100' : 'bg-blue-800 text-white hover:bg-blue-900'}`}
          style={isDarkMode ? { color: '#010080' } : {}}
        >
          {program.buttonText || "Read more"}
        </div>
      </div>
    </Link>
  );
}

export default function ProgramsPage() {
  const { isDarkMode } = useTheme();
  const [visibleSections, setVisibleSections] = useState({});
  const [playingVideos, setPlayingVideos] = useState({});
  const sectionRefs = {
    hero: useRef(null),
    intro: useRef(null),
    portfolio: useRef(null),
  };

  // Fetch programs from backend
  const { data: backendPrograms, isLoading, isError, error } = useGetProgramsQuery();

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

  // Map backend data to frontend format
  const programs = backendPrograms?.map((program) => {
    // Ensure image URL is properly formatted from backend
    let imageUrl = "/images/book1.jpg"; // Default fallback
    if (program.image) {
      // If image path starts with /, use it directly with backend URL
      if (program.image.startsWith('/')) {
        imageUrl = `${API_BASE_URL}${program.image}`;
      } else {
        // If image path doesn't start with /, add it
        imageUrl = `${API_BASE_URL}/${program.image}`;
      }
    }

    // Ensure video URL is properly formatted from backend
    let videoUrl = null;
    if (program.video) {
      if (program.video.startsWith('/')) {
        videoUrl = `${API_BASE_URL}${program.video}`;
      } else {
        videoUrl = `${API_BASE_URL}/${program.video}`;
      }
    }

    return {
      id: program.id,
      title: program.title,
      description: program.description || "",
      video: videoUrl,
      image: imageUrl, // Image from backend
      alt: program.title || "Program image",
      buttonText: "Read more",
      link: getProgramRoute(program.title) // Map to correct route based on title
    };
  }) || [];

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
  });

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
          <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 ${visibleSections.hero ? 'animate-fade-in-down' : 'opacity-0'}`}>
            Programs
          </h1>
        </div>
      </section>

      {/* Introductory Text Section */}
      <section ref={sectionRefs.intro} className="py-8 sm:py-12 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`max-w-5xl mx-auto space-y-6 leading-relaxed text-base sm:text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            <p className={`${visibleSections.intro ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
              We offer a unique portfolio of programs designed to redefine English learning through purpose, innovation, and global relevance.
            </p>

            <p className={`${visibleSections.intro ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              From our 8-Level General English Course for Adults to ESP (English For Specific Purposes), IELTS & TOEFL preparation, and Advanced Academic Writing, every program builds confidence, fluency, and real-world communication skills.
            </p>

            <p className={`${visibleSections.intro ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
              What truly sets BEA apart is our focus on connecting language with life skills. Through our Professional Skills and Training Programs and Digital Literacy & Virtual Skills Program, students gain the tools to thrive in today&apos;s workplace and digital world—making BEA a true blueprint for personal and professional growth.
            </p>
          </div>
        </div>
      </section>

      {/* BEA Programs Portfolio Section */}
      <section ref={sectionRefs.portfolio} className={`py-12 sm:py-16 lg:py-20 overflow-hidden ${isDarkMode ? 'bg-[#04003a]' : 'bg-white'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className={`mb-10 sm:mb-12 ${visibleSections.portfolio ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                BEA Programs Portfolio
              </h2>
              <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Learn more about BEA&apos;s unique program portfolio.
              </p>
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
                <div className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                  {error?.status === 'FETCH_ERROR'
                    ? 'Cannot connect to backend server'
                    : error?.status === 'PARSING_ERROR'
                      ? 'Invalid response from server'
                      : error?.status
                        ? `Error ${error.status}`
                        : 'Error loading programs'}
                </div>
                <div className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {error?.status === 'FETCH_ERROR' ? (
                    <>
                      The backend server is not responding.<br />
                      Please make sure the backend server (Render) is running at <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{API_BASE_URL}</code>
                    </>
                  ) : error?.data?.error ? (
                    error.data.error
                  ) : error?.error ? (
                    error.error
                  ) : error?.message ? (
                    error.message
                  ) : (
                    'Please check your connection and try again.'
                  )}
                </div>
                <div className={`text-xs mt-4 p-4 rounded max-w-2xl mx-auto text-left ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                  <strong>Debug Info:</strong><br />
                  <div className="mt-2 space-y-1">
                    <div>Status: <code>{error?.status || 'N/A'}</code></div>
                    {error?.data && <div>Response: <code className="text-xs break-all">{JSON.stringify(error.data, null, 2)}</code></div>}
                    {error?.error && <div>Error: <code>{error.error}</code></div>}
                    {error?.message && <div>Message: <code>{error.message}</code></div>}
                  </div>
                </div>
              </div>
            )}

            {/* Programs Grid */}
            {!isLoading && !isError && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {sortedPrograms.length === 0 ? (
                  <div className={`col-span-full text-center py-12 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                    No programs available.
                  </div>
                ) : (
                  sortedPrograms.map((program, index) => (
                    <ProgramCard
                      key={program.id}
                      program={program}
                      index={index}
                      isDarkMode={isDarkMode}
                      isVisible={visibleSections.portfolio}
                      playingVideos={playingVideos}
                      setPlayingVideos={setPlayingVideos}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
