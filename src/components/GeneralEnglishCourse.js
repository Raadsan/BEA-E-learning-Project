"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function GeneralEnglishCourse() {
  const [visibleSections, setVisibleSections] = useState({});
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
    {
      level: "A1",
      title: "A1 - Beginner",
      bookImage: "/images/book1.jpg",
      overview: "Introduces learners to the basics of English for everyday communication and familiar contexts.",
      learningObjectives: "Use simple phrases, greet people, introduce oneself, and respond to basic questions.",
      skillsDeveloped: "Basic grammar, present simple, vocabulary for everyday life, and listening for gist.",
      outcomes: "Can communicate in predictable, routine situations with simple sentences."
    },
    {
      level: "A2",
      title: "A2 - Elementary",
      bookImage: "/images/book2.jpg",
      overview: "Builds on basic knowledge to expand communication confidence and vocabulary range.",
      learningObjectives: "Handle short exchanges, talk about routines, and describe simple events.",
      skillsDeveloped: "Past simple, adjectives, comparative forms, pronunciation accuracy.",
      outcomes: "Can participate in brief social conversations with improved fluency."
    },
    {
      level: "A2+",
      title: "A2+ - Pre-Intermediate",
      bookImage: "/images/book3.jpg",
      overview: "Bridges learners to independent communication and understanding of common English patterns.",
      learningObjectives: "Describe experiences, express opinions, and engage in short conversations.",
      skillsDeveloped: "Present perfect, modals, daily activities, writing short paragraphs.",
      outcomes: "Can interact effectively in most everyday situations with some confidence."
    },
    {
      level: "B1",
      title: "B1 - Intermediate",
      bookImage: "/images/book4.jpg",
      overview: "Develops solid communication skills for education, work, and travel contexts.",
      learningObjectives: "Understand the main points of clear input and express feelings and experiences.",
      skillsDeveloped: "Reported speech, conditionals, narrative writing, expressing preferences.",
      outcomes: "Can communicate confidently on familiar and general topics."
    },
    {
      level: "B1+",
      title: "B1+ - Intermediate Plus",
      bookImage: "/images/book5.jpg",
      overview: "Strengthens existing abilities while enhancing fluency and natural expression.",
      learningObjectives: "Express viewpoints, summarize ideas, and engage in extended discussions.",
      skillsDeveloped: "Advanced grammar control, debate skills, essay writing, fluency improvement.",
      outcomes: "Can express ideas naturally with some flexibility and confidence."
    },
    {
      level: "B2",
      title: "B2 - Upper-Intermediate",
      bookImage: "/images/book6.jpg",
      overview: "Promotes advanced accuracy and fluency across academic and professional environments.",
      learningObjectives: "Understand complex ideas, debate, and write structured academic content.",
      skillsDeveloped: "Idiomatic language, complex structures, persuasive writing.",
      outcomes: "Can communicate effectively with native and fluent speakers in most contexts."
    },
    {
      level: "C1",
      title: "C1 - Advanced",
      bookImage: "/images/book7.jpg",
      overview: "Refines language use for academic and professional excellence.",
      learningObjectives: "Express complex ideas clearly, fluently, and precisely.",
      skillsDeveloped: "Collocations, register control, presentation skills, analytical writing.",
      outcomes: "Can communicate fluently and spontaneously with precision and style."
    },
    {
      level: "C2",
      title: "C2 - Advanced Plus",
      bookImage: "/images/book8.jpg",
      overview: "Achieves mastery and native-like command of the English language.",
      learningObjectives: "Understand virtually everything heard or read; express ideas effortlessly.",
      skillsDeveloped: "Critical thinking, academic discourse, cross-cultural communication.",
      outcomes: "Can perform effectively in global professional or academic environments."
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
        ref={sectionRefs.hero}
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1a237e 0%, #311b92 50%, #b71c1c 100%)',
          minHeight: '300px'
        }}
      >
        {/* Background Overlay Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
          <div className="absolute top-[-50%] left-[-10%] w-[50%] h-[150%] bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-50%] right-[-10%] w-[50%] h-[150%] bg-red-500 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-serif italic text-white mb-4 text-left ${visibleSections.hero ? 'animate-fade-in-left' : 'opacity-0'}`}>
              Introducing Our 8-Level<br />
              General English Course
            </h1>
            <p className={`text-white text-lg sm:text-xl font-medium text-left ${visibleSections.hero ? 'animate-fade-in-left' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              English File 4th Edition Language Series
            </p>
          </div>
        </div>
      </section>

      {/* Introductory Text Section */}
      <section ref={sectionRefs.intro} className="py-8 sm:py-12 bg-white overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-6 text-gray-800 leading-relaxed text-base sm:text-lg">
            <p className={`${visibleSections.intro ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
              The BBC Learning English File 4th Edition is a highly successful General English course that combines proven methodology with fresh, motivating content. It provides a comprehensive approach to language learning, focusing on real-world communication skills and building confidence in using English effectively.
            </p>

            <p className={`${visibleSections.intro ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              The program is designed with students and teachers in mind, offering flexible learning paths that adapt to different learning styles and needs. Each level is carefully structured to build upon previous knowledge while introducing new concepts and skills, ensuring a smooth and progressive learning experience from beginner to advanced levels.
            </p>
          </div>
        </div>
      </section>

      {/* English File 4th Edition Language Series */}
      <section ref={sectionRefs.levels} id="levels" className="py-12 sm:py-16 lg:py-20 bg-white overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-center text-gray-900 mb-3 ${visibleSections.levels ? 'animate-fade-in-up' : 'opacity-0'}`}>
              English File 4th Edition Language Series
            </h2>
            <p className={`text-center text-gray-600 text-lg sm:text-xl mb-12 ${visibleSections.levels ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
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
                      <div className="mt-6">
                        <button className="bg-blue-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-800 transition-colors text-sm sm:text-base">
                          Register now
                        </button>
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