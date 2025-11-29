"use client";

import Image from "next/image";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function PopularCourses() {
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.1 });
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
    <section ref={ref} className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-10 lg:mb-12 gap-4 transition-all duration-700 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
            <div>
              <h2 className="text-gray-800 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-2">
                Popular Courses
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Choose from our expertly designed courses tailored to your level and goals.
              </p>
            </div>
            <a href="/programs" className="text-gray-800 font-semibold hover:underline text-sm sm:text-base border border-purple-300 rounded-lg px-3 sm:px-4 py-2 whitespace-nowrap transition-all duration-300 hover:scale-105 hover:border-purple-400">
              → View all courses
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {courses.map((course, index) => (
              <div
                key={course.id}
                className={`bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 ${
                  isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Course Image */}
                <div className="relative h-48 bg-gray-200 overflow-hidden group">
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
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
                  <button className="w-full bg-blue-800 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-900 transition-all duration-300 transform hover:scale-105 text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
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

