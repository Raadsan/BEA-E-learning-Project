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
    <section className="relative w-full overflow-hidden" style={{ height: '460px' }}>
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
              className="object-cover"
              priority={index === 0}
              sizes="100vw"
            />
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}
      </div>

      {/* Text Overlay */}
      <div className="absolute inset-0 z-20 flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-4 leading-tight">
              Master English with
              <br />
              <span className="text-red-600">Global Standards</span>
            </h1>
            <p className="text-white text-base sm:text-lg mb-6 leading-relaxed">
              Structured learning from A1 to C2, powered by CEFR framework and GSE scoring. Join thousands of learners across Somalia achieving their English language goals.
            </p>
            <button className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors text-base flex items-center gap-2">
              <span>→</span>
              <span>Start Learning Today</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`rounded-full transition-all ${
              index === currentSlide ? "bg-red-600 w-8 h-3" : "bg-white w-3 h-3"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
