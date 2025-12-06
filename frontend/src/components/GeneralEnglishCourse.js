"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

export default function GeneralEnglishCourse() {
  const { isDarkMode } = useTheme();
  const [visibleSections, setVisibleSections] = useState({ levels: true });
  
  const sectionRefs = {
    hero: useRef(null),
    intro: useRef(null),
    levels: useRef(null),
  };

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

  const levels = [
    { level: "A1", value: "a1", title: "A1 - Beginner", bookImage: "/images/book1.jpg", overview: "Introduces learners to the basics of English for everyday communication and familiar contexts.", learningObjectives: "Use simple phrases, greet people, introduce oneself, and respond to basic questions.", skillsDeveloped: "Basic grammar, present simple, vocabulary for everyday life, and listening for gist.", outcomes: "Can communicate in predictable, routine situations with simple sentences." },
    { level: "A2", value: "a2", title: "A2 - Elementary", bookImage: "/images/book2.jpg", overview: "Builds on basic knowledge to expand communication confidence and vocabulary range.", learningObjectives: "Handle short exchanges, talk about routines, and describe simple events.", skillsDeveloped: "Past simple, adjectives, comparative forms, pronunciation accuracy.", outcomes: "Can participate in brief social conversations with improved fluency." },
    { level: "A2+", value: "a2plus", title: "A2+ - Pre-Intermediate", bookImage: "/images/book3.jpg", overview: "Bridges learners to independent communication and understanding of common English patterns.", learningObjectives: "Describe experiences, express opinions, and engage in short conversations.", skillsDeveloped: "Present perfect, modals, daily activities, writing short paragraphs.", outcomes: "Can interact effectively in most everyday situations with some confidence." },
    { level: "B1", value: "b1", title: "B1 - Intermediate", bookImage: "/images/book4.jpg", overview: "Develops solid communication skills for education, work, and travel contexts.", learningObjectives: "Understand the main points of clear input and express feelings and experiences.", skillsDeveloped: "Reported speech, conditionals, narrative writing, expressing preferences.", outcomes: "Can communicate confidently on familiar and general topics." },
    { level: "B1+", value: "b1plus", title: "B1+ - Intermediate Plus", bookImage: "/images/book5.jpg", overview: "Strengthens existing abilities while enhancing fluency and natural expression.", learningObjectives: "Express viewpoints, summarize ideas, and engage in extended discussions.", skillsDeveloped: "Advanced grammar control, debate skills, essay writing, fluency improvement.", outcomes: "Can express ideas naturally with some flexibility and confidence." },
    { level: "B2", value: "b2", title: "B2 - Upper-Intermediate", bookImage: "/images/book6.jpg", overview: "Promotes advanced accuracy and fluency across academic and professional environments.", learningObjectives: "Understand complex ideas, debate, and write structured academic content.", skillsDeveloped: "Idiomatic language, complex structures, persuasive writing.", outcomes: "Can communicate effectively with native and fluent speakers in most contexts." },
    { level: "C1", value: "c1", title: "C1 - Advanced", bookImage: "/images/book7.jpg", overview: "Refines language use for academic and professional excellence.", learningObjectives: "Express complex ideas clearly, fluently, and precisely.", skillsDeveloped: "Collocations, register control, presentation skills, analytical writing.", outcomes: "Can communicate fluently and spontaneously with precision and style." },
    { level: "C2", value: "c2", title: "C2 - Advanced Plus", bookImage: "/images/book8.jpg", overview: "Achieves mastery and native-like command of the English language.", learningObjectives: "Understand virtually everything heard or read; express ideas effortlessly.", skillsDeveloped: "Critical thinking, academic discourse, cross-cultural communication.", outcomes: "Can perform effectively in global professional or academic environments." },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Background Image with Left Shadow */}
      <section
        ref={sectionRefs.hero}
        className="relative overflow-hidden h-[350px] sm:h-[420px] lg:h-[500px]"
      >
        {/* Background Image - slightly zoomed to hide edges */}
        <div className="absolute inset-0">
          <img src="/images/8- Level General English Course for Adults.jpg" alt="8-Level General English Course for Adults" className="w-full h-full object-cover scale-110" />
        </div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(1, 0, 128, 0.95) 0%, rgba(1, 0, 128, 0.8) 20%, rgba(1, 0, 128, 0.4) 40%, rgba(1, 0, 128, 0.1) 55%, transparent 65%)' }} />
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`max-w-md ${visibleSections.hero ? 'animate-fade-in-left' : 'opacity-0'}`}>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white leading-tight">
                8-Level General English<br />Course for Adults
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Introductory Text Section */}
      <section ref={sectionRefs.intro} className={`py-8 sm:py-12 overflow-hidden ${isDarkMode ? 'bg-[#03002e]' : 'bg-white'}`}>
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="space-y-6 leading-relaxed text-base sm:text-lg">
            <p className={`${visibleSections.intro ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s', color: isDarkMode ? '#ffffff' : '#010080' }}>
              The BBC Learning English File 4th Edition is a highly successful General English course that combines proven methodology with fresh, motivating content. It provides a comprehensive approach to language learning, focusing on real-world communication skills and building confidence in using English effectively.
            </p>

            <p className={`${visibleSections.intro ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              The program is designed with students and teachers in mind, offering flexible learning paths that adapt to different learning styles and needs. Each level is carefully structured to build upon previous knowledge while introducing new concepts and skills, ensuring a smooth and progressive learning experience from beginner to advanced levels.
            </p>
          </div>
        </div>
      </section>

      {/* English File 4th Edition Language Series */}
      <section ref={sectionRefs.levels} id="levels" className={`py-12 sm:py-16 lg:py-20 overflow-hidden ${isDarkMode ? 'bg-[#03002e]' : 'bg-white'}`}>
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div>
            <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-center mb-3 ${visibleSections.levels ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
              English File 4th Edition Language Series
            </h2>
            <p className={`text-center text-lg sm:text-xl mb-12 ${visibleSections.levels ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s', color: isDarkMode ? '#ffffff' : '#010080' }}>
              8 LEVELS, 8 OPPORTUNITIES
            </p>

            <div className="space-y-12 max-w-2xl mx-auto">
              {levels.map((level, index) => {
                return (
                  <div
                    key={level.level}
                    className={`bg-white rounded-xl shadow-md overflow-hidden relative hover:shadow-xl transition-shadow duration-300 ${visibleSections.levels ? 'animate-fade-in-up' : 'opacity-0'}`}
                    style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                  >
                    {/* Book Image at Top */}
                    <div className="relative w-full h-64 sm:h-80 lg:h-96">
                      <Image
                        src={level.bookImage}
                        alt={`${level.title} Book`}
                        fill
                        className="object-contain"
                      />
                    </div>

                    <div className="p-6 sm:p-8">

                      {/* Content Section */}
                      <div className="space-y-4 text-left mb-6">
                        <div>
                          <h3 className="text-gray-900 font-bold text-base sm:text-lg mb-2">Overview:</h3>
                          <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                            {level.overview || level.description?.split('.')[0]}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-gray-900 font-bold text-base sm:text-lg mb-2">Learning Objectives:</h3>
                          <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                            {level.learningObjectives || "Develop core language skills and build confidence in English communication."}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-gray-900 font-bold text-base sm:text-lg mb-2">Skills Developed:</h3>
                          <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                            {level.skillsDeveloped || "Develop essential grammar structures, expand vocabulary, improve pronunciation, and enhance listening and reading comprehension skills."}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-gray-900 font-bold text-base sm:text-lg mb-2">Outcomes:</h3>
                          <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                            {level.outcomes || "Students will be able to communicate effectively in everyday situations, understand and produce simple texts, and build confidence in using English."}
                          </p>
                        </div>
                      </div>

                      {/* Register Now Button */}
                      <div className="mt-6 text-center">
                        <Link 
                          href="/auth/registration"
                          className={`inline-block px-6 py-2 rounded-lg font-semibold transition-colors text-sm sm:text-base header-keep-white ${
                            isDarkMode ? 'bg-white hover:bg-gray-100' : 'bg-blue-900 text-white hover:bg-blue-800'
                          }`}
                          style={isDarkMode ? { color: '#010080' } : {}}
                        >
                          Register now
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
