"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { useGetProgramsQuery } from "@/lib/api/programApi";
import { getProgramRoute } from "@/utils/programRoutes";
import {
  getWebsitePrograms,
  sortProgramsForDisplay,
  formatProgramDescription,
  isEslProficiencyCertificationProgram,
} from "@/utils/programCatalog";

import { resolveMediaUrl, API_BASE_URL } from "@/constants";
import { getYouTubeEmbedUrl, isYouTubeUrl } from "@/utils/youtube";

// Program Card Component with Video Support
function ProgramCard({ program, index, isDarkMode, isVisible, playingVideos, setPlayingVideos }) {
  const videoRef = useRef(null);
  const isPlaying = playingVideos[program.id] || false;

  const handlePlayClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPlayingVideos(prev => ({ ...prev, [program.id]: true }));
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
        {program.video && isPlaying ? (
          <>
            <iframe
              src={`${getYouTubeEmbedUrl(program.video)}?autoplay=1`}
              className="w-full h-full object-cover rounded-tl-xl rounded-tr-xl transition-transform duration-300 group-hover:scale-110"
              width="100%"
              height="100%"
              onClick={(e) => e.stopPropagation()}
              style={{ display: 'block' }}
              title={program.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
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
                (e.target as HTMLImageElement).src = "/images/book1.jpg";
              }}
            />
            {(program.video || !isEslProficiencyCertificationProgram(program.title)) && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors rounded-tl-xl rounded-tr-xl" onClick={program.video ? handlePlayClick : undefined}>
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-gray-700 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <h3 className={`text-xs sm:text-sm font-bold mb-2 line-clamp-2 leading-snug ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {program.title}
        </h3>

        <p className={`text-[10px] sm:text-[11px] leading-relaxed mb-3 flex-1 line-clamp-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {program.description}
        </p>

        {/* Read More Button */}
        <div
          className={`px-4 py-1.5 rounded-lg font-semibold transition-colors text-xs w-full text-center block header-keep-white ${isDarkMode ? 'bg-white hover:bg-gray-100' : 'bg-blue-800 text-white hover:bg-blue-900'}`}
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
  const [visibleSections, setVisibleSections] = useState<any>({});
  const [playingVideos, setPlayingVideos] = useState<any>({});
  const sectionRefs = {
    hero: useRef(null),
    intro: useRef(null),
    portfolio: useRef(null),
  };

  // Fetch programs from backend
  const { data: backendPrograms, isLoading, isError, error } = useGetProgramsQuery();
  const err = error as any;

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

  // Filter active programs from API first (status lives on raw backend rows)
  const activePrograms = sortProgramsForDisplay(getWebsitePrograms(backendPrograms || []));

  // Map backend data to frontend format
  const programs = activePrograms.map((program) => {
    // Ensure image URL is properly formatted from backend
    let imageUrl = "/images/book1.jpg";
    if (program.image) {
      imageUrl = resolveMediaUrl(program.image) || "/images/book1.jpg";
    }

    let videoUrl = null;
    if (program.video) {
      videoUrl = isYouTubeUrl(program.video) ? program.video : resolveMediaUrl(program.video);
    }

    return {
      id: program.id,
      title: program.title,
      description: formatProgramDescription(program.description),
      video: videoUrl,
      image: imageUrl, // Image from backend
      alt: program.title || "Program image",
      buttonText: "Read more",
      link: getProgramRoute(program.title) // Map to correct route based on title
    };
  });

  const sortedPrograms = programs;

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
          <div className={`max-w-5xl mx-auto space-y-4 leading-relaxed text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
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
          <div className="max-w-7xl mx-auto">
            <div className={`mb-8 sm:mb-10 ${visibleSections.portfolio ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                BEA Programs Portfolio
              </h2>
              <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
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
                  {err?.status === 'FETCH_ERROR'
                    ? 'Cannot connect to backend server'
                    : err?.status === 'PARSING_ERROR'
                      ? 'Invalid response from server'
                      : err?.status
                        ? `Error ${err.status}`
                        : 'Error loading programs'}
                </div>
                <div className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {err?.status === 'FETCH_ERROR' ? (
                    <>
                      The backend server is not responding.<br />
                      Please make sure the backend server (Render) is running at <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{API_BASE_URL}</code>
                    </>
                  ) : err?.data?.error ? (
                    err.data.error
                  ) : err?.error ? (
                    err.error
                  ) : err?.message ? (
                    err.message
                  ) : (
                    'Please check your connection and try again.'
                  )}
                </div>
                <div className={`text-xs mt-4 p-4 rounded max-w-2xl mx-auto text-left ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                  <strong>Debug Info:</strong><br />
                  <div className="mt-2 space-y-1">
                    <div>Status: <code>{err?.status || 'N/A'}</code></div>
                    {err?.data && <div>Response: <code className="text-xs break-all">{JSON.stringify(err.data, null, 2)}</code></div>}
                    {err?.error && <div>Error: <code>{err.error}</code></div>}
                    {err?.message && <div>Message: <code>{err.message}</code></div>}
                  </div>
                </div>
              </div>
            )}

            {/* Programs Grid */}
            {!isLoading && !isError && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                      isVisible={visibleSections.portfolio || sortedPrograms.length > 0}
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
