"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useGetHomepageQuery } from "@/lib/api/homepageApi";
import { resolveMediaUrl } from "@/constants";

const getYoutubeId = (url = "") => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([^?&/]+)/i);
  return match?.[1] || "";
};

export default function FeaturedVideo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const { isDarkMode } = useTheme();
  const { data } = useGetHomepageQuery();
  const heading = data?.featured_heading || "English for specific purpose (ESP)";
  const label = data?.featured_label || "Featured Video";
  const title = data?.featured_title || "Master English for Specific Purposes";
  const videoUrl = data?.featured_video_url || "https://www.youtube.com/watch?v=erjMgola4fQ";
  const youtubeId = getYoutubeId(videoUrl);
  const thumbnail = data?.featured_thumbnail
    ? (resolveMediaUrl(data.featured_thumbnail) || data.featured_thumbnail)
    : youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : "";

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

  if (data?.featured_enabled === false) return null;

  return (
    <section ref={sectionRef} className={`py-12 sm:py-16 lg:py-20 overflow-hidden ${isDarkMode ? 'bg-[#03002e]' : 'bg-white'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className={`text-xl sm:text-2xl font-semibold mb-6 text-center ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
            {heading}
          </h2>

          <div className={`relative bg-blue-800 rounded-2xl overflow-hidden aspect-video shadow-2xl ${isVisible ? 'animate-scale-in' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
            {!isPlaying ? (
              <div
                className="group relative w-full h-full cursor-pointer overflow-hidden"
                onClick={() => setIsPlaying(true)}
              >
                {/* Cover Image / Thumbnail */}
                <img
                  src={thumbnail}
                  alt={`${heading} Cover`}
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
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">{label}</p>
                    <h3 className="text-lg sm:text-2xl font-black uppercase tracking-tight leading-tight">{title}</h3>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full relative">
                <iframe
                  className="w-full h-full"
                  src={youtubeId ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0` : videoUrl}
                  title={title}
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
