"use client";

import { useState, useEffect } from "react";
import Image from "next/image";


export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

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
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="relative w-full overflow-hidden h-[300px] sm:h-[400px] md:h-[460px] lg:h-[520px] xl:h-[580px]">
      {/* Slideshow Container */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              className="object-cover object-center"
              priority={index === 0}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, (max-width: 1280px) 100vw, 100vw"
            />
            {/* Soft blue overlay for better text readability */}
            <div className="absolute inset-0" style={{ backgroundColor: 'rgba(1, 0, 128, 0.65)' }} />
          </div>
        ))}
      </div>

      {/* Text Overlay */}
      <div className="absolute inset-0 z-20 flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl">
            <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif font-bold mb-2 sm:mb-3 md:mb-4 leading-tight">
              Master English with
              <br />
              <span className="text-red-600">Global Standards</span>
            </h1>
            <p className="text-white text-sm sm:text-base md:text-lg mb-4 sm:mb-5 md:mb-6 leading-relaxed">
              Structured learning from A1 to C2, powered by CEFR framework and GSE scoring. Join thousands of learners across Somalia achieving their English language goals.
            </p>
            <button className="bg-red-600 text-white px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm sm:text-base flex items-center gap-2">
              <span>→</span>
              <span>Start Learning Today</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={goToNext}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
        aria-label="Next slide"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex gap-1.5 sm:gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? "bg-red-600 w-6 sm:w-8 h-2 sm:h-3" 
                : "bg-white/70 hover:bg-white w-2 sm:w-3 h-2 sm:h-3"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
