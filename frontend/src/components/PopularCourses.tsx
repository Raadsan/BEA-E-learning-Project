"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function PopularCourses() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

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

  const courses = [
    {
      id: 1,
      title: "Advanced Conversation",
      description: "Perfect your fluency with advanced vocabulary, idioms, and natural expressions.",
      image: "/images/A Path to Global Opportunities.jpg",
      duration: "12 weeks",
      lessons: "72 lessons",
      level: "Advanced"
    },
    {
      id: 2,
      title: "Business Communication",
      description: "Enhance your professional dialogue with tailored vocabulary and formal expressions.",
      image: "/images/A Path to Global Opportunities.jpg",
      duration: "8 weeks",
      lessons: "40 lessons",
      level: "Advanced"
    },
    {
      id: 3,
      title: "Conversational Fluency",
      description: "Engage in everyday discussions with ease using practical language skills.",
      image: "/images/A Path to Global Opportunities.jpg",
      duration: "6 weeks",
      lessons: "30 lessons",
      level: "Advanced"
    },
  ];

  return (
    <section ref={sectionRef} className="bg-white py-12 sm:py-16 lg:py-20 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 sm:mb-10 lg:mb-12 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div>
              <h2 className="text-gray-800 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-2">
                Popular Courses
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Choose from our expertly designed courses tailored to your level and goals.
              </p>
            </div>
            <a href="/website/programs" className="text-gray-800 font-semibold hover:underline text-xs sm:text-sm md:text-base border border-purple-300 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 whitespace-nowrap hover:bg-purple-50 transition-colors self-start sm:self-auto">
              → View all courses
            </a>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {courses.map((course, index) => (
              <div
                key={course.id}
                className={`bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ${
                  isVisible ? 'animate-fade-in-up' : 'opacity-0'
                }`}
                style={{ animationDelay: `${0.2 + index * 0.15}s` }}
              >
                {/* Course Image */}
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                  {/* Heart Icon */}
                  <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
                
                {/* Course Content */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {course.title}
                    </h3>
                    <button className="text-gray-400 hover:text-red-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {course.description}
                  </p>
                  
                  {/* Course Info */}
                  <div className="flex flex-wrap gap-4 mb-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>{course.lessons}</span>
                    </div>
                  </div>
                  
                  {/* Enroll Button */}
                  <button className="w-full bg-blue-800 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-900 transition-colors text-sm flex items-center justify-center gap-2">
                    <span>→</span>
                    <span>Enroll now</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

