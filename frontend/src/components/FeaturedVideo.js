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

          <div className={`relative bg-blue-800 rounded-2xl overflow-hidden aspect-video shadow-2xl ${isVisible ? 'animate-scale-in' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
            {!isPlaying ? (
              <div
                className="group relative w-full h-full cursor-pointer overflow-hidden"
                onClick={() => setIsPlaying(true)}
              >
                {/* Cover Image / Thumbnail */}
                <img
                  src="https://img.youtube.com/vi/erjMgola4fQ/maxresdefault.jpg"
                  alt="English for specific purpose (ESP) Cover"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300" />

                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-white/90 flex items-center justify-center backdrop-blur-sm group-hover:bg-white transition-all duration-300 group-hover:scale-110 shadow-2xl">
                    <svg className="w-8 h-8 sm:w-12 sm:h-12 text-[#010080] ml-1.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </div>

                {/* Title Overlay (Internal) */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="text-white">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">Featured Video</p>
                    <h3 className="text-lg sm:text-2xl font-black uppercase tracking-tight leading-tight">Master English for <br /> Specific Purposes</h3>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full relative">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/erjMgola4fQ?autoplay=1&rel=0"
                  title="English for specific purpose"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
