"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const slides = [
    {
      id: 1,
      image: "/images/A Path to Global Opportunities.jpg",
      alt: "A Path to Global Opportunities"
    },
    {
      id: 2,
      image: "/images/Innovative Learning Environment.jpg",
      alt: "Innovative Learning Environment"
    },
    {
      id: 3,
      image: "/images/Student—Centered Learning.jpg",
      alt: "Student-Centered Learning"
    },
  ];

  // Auto-play slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000); // Change slide every 6 seconds

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index) => {
    if (!isAnimating && index !== currentSlide) {
      setIsAnimating(true);
      setCurrentSlide(index);
      setTimeout(() => setIsAnimating(false), 1000);
    }
  };

  const goToPrevious = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      setTimeout(() => setIsAnimating(false), 1000);
    }
  };

  const goToNext = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      setTimeout(() => setIsAnimating(false), 1000);
    }
  };

  return (
    <section className="relative w-full overflow-hidden h-[400px] sm:h-[480px] md:h-[560px] lg:h-[650px] xl:h-[720px] 2xl:h-[800px]">
      {/* Slideshow Container with Ken Burns Effect */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-[1500ms] ease-in-out ${index === currentSlide ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-110"
              }`}
          >
            <div className={`relative w-full h-full ${index === currentSlide ? 'animate-ken-burns' : ''}`}>
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                className="object-cover object-center"
                priority={index === 0}
                sizes="100vw"
                quality={95}
              />
            </div>

            {/* Lighter Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#010080]/50 via-[#010080]/45 to-[#03002e]/55" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </div>
        ))}
      </div>

      {/* Animated Text Overlay - Centered */}
      <div className="absolute inset-0 z-20 flex items-center justify-start">
        <div className="container mx-auto px-5 sm:px-8 md:px-10 lg:px-14 xl:px-20 2xl:px-24">
          <div className="max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl animate-fade-in-up">
            {/* Main Heading - Balanced Sizes */}
            <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif font-extrabold mb-3 sm:mb-4 md:mb-5 lg:mb-7 leading-[1.15] tracking-tight">
              <span className="inline-block drop-shadow-2xl animate-slide-in-left">
                Master English with
              </span>
              <br />
              <span className="inline-block bg-gradient-to-r from-red-500 via-red-600 to-red-700 bg-clip-text text-transparent drop-shadow-lg animate-slide-in-right" style={{ WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text' }}>
                Global Standards
              </span>
            </h1>

            {/* Description - Balanced Sizes */}
            <p className="text-white/95 text-sm sm:text-base md:text-lg lg:text-xl mb-5 sm:mb-6 md:mb-7 lg:mb-8 leading-relaxed max-w-lg md:max-w-xl lg:max-w-2xl drop-shadow-lg font-medium animate-fade-in delay-300">
              Structured learning from A1 to C2, powered by CEFR framework and GSE scoring. Join thousands of learners across Somalia achieving their English language goals.
            </p>

            {/* Premium CTA Button */}
            <div className="animate-fade-in delay-500">
              <Link
                href="/auth/registration"
                className="group inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-red-600 to-red-700 text-white px-5 sm:px-6 md:px-8 lg:px-10 py-2.5 sm:py-3 md:py-4 lg:py-5 rounded-xl font-bold hover:from-red-700 hover:to-red-800 transition-all duration-500 text-sm sm:text-base md:text-lg lg:text-xl shadow-2xl hover:shadow-red-600/50 transform hover:scale-105 hover:-translate-y-1 active:scale-95 ring-2 ring-white/20 hover:ring-white/40"
              >
                <span className="text-base sm:text-lg md:text-xl lg:text-2xl transition-transform duration-300 group-hover:translate-x-1">→</span>
                <span className="relative">
                  Start Learning Today
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white/50 group-hover:w-full transition-all duration-300"></span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Navigation Arrows with Glassmorphism */}
      <button
        onClick={goToPrevious}
        disabled={isAnimating}
        className="absolute left-3 sm:left-5 md:left-6 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-white/10 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 backdrop-blur-md border border-white/20 hover:border-white/40 shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 group"
        aria-label="Previous slide"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={goToNext}
        disabled={isAnimating}
        className="absolute right-3 sm:right-5 md:right-6 lg:right-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-white/10 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 backdrop-blur-md border border-white/20 hover:border-white/40 shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 group"
        aria-label="Next slide"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Enhanced Pagination Dots */}
      <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 lg:bottom-10 left-1/2 transform -translate-x-1/2 z-30 flex gap-2 sm:gap-3 bg-black/20 backdrop-blur-md px-4 sm:px-5 py-2 sm:py-3 rounded-full border border-white/10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            disabled={isAnimating}
            className={`rounded-full transition-all duration-500 transform hover:scale-125 disabled:cursor-not-allowed ${index === currentSlide
              ? "bg-gradient-to-r from-red-500 to-red-600 w-8 sm:w-10 md:w-12 h-2.5 sm:h-3 shadow-lg shadow-red-500/50"
              : "bg-white/60 hover:bg-white/90 w-2.5 sm:w-3 h-2.5 sm:h-3"
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes ken-burns {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.08);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.8s ease-out forwards;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.8s ease-out 0.2s forwards;
          opacity: 0;
        }

        .animate-fade-in {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }

        .delay-300 {
          animation-delay: 0.3s;
        }

        .delay-500 {
          animation-delay: 0.5s;
        }

        .animate-ken-burns {
          animation: ken-burns 6s ease-out forwards;
        }
      `}</style>
    </section>
  );
}
