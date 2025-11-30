"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";

export default function FeaturedVideo() {
  const [isPlaying, setIsPlaying] = useState(false);
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

  return (
    <section ref={sectionRef} className={`py-12 sm:py-16 lg:py-20 overflow-hidden ${isDarkMode ? 'bg-[#03002e]' : 'bg-white'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className={`text-xl sm:text-2xl font-semibold mb-6 text-center ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
            English for specific purpose (ESP)
          </h2>
        
          <div className={`relative bg-blue-800 rounded-lg overflow-hidden aspect-video ${isVisible ? 'animate-scale-in' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
            {/* Video Placeholder */}
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
              {!isPlaying ? (
                <button
                  onClick={() => setIsPlaying(true)}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-all duration-300 hover:scale-110"
                  aria-label="Play video"
                >
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </button>
              ) : (
                <div className="w-full h-full relative">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                    title="English for specific purpose"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
            
            {/* Video Controls (when playing) */}
            {isPlaying && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
                <div className="flex items-center gap-2 text-white text-xs sm:text-sm">
                  <span>00:03:33</span>
                  <div className="flex-1 h-1 bg-white/30 rounded-full relative">
                    <div className="absolute left-0 top-0 h-full bg-red-600 rounded-full" style={{ width: "20%" }} />
                  </div>
                  <span>01:42:04</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
