"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";

export default function PedagogicalValues() {
  const { isDarkMode } = useTheme();
  const [visibleSections, setVisibleSections] = useState({});
  const sectionRefs = {
    hero: useRef(null),
    content: useRef(null),
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

  const values = [
    {
      id: 1,
      title: "Authenticity",
      description: "At BEA, we believe that authentic, real-world materials and tasks are essential for effective language learning. We use authentic resources—such as real articles, videos, conversations, and practical tasks—that mirror how English is used in everyday life. This approach enhances student engagement, motivation, and the practical application of language skills, preparing learners to communicate confidently in real-world contexts."
    },
    {
      id: 2,
      title: "Collaborative Learning",
      description: "From an institutional perspective, we build a strong English learning community which is crucial for fostering collaboration, support, and a sense of belonging. This value promotes collaborative learning activities, group projects, and discussions that encourage students to learn from each other and build relationships with their peers."
    },
    {
      id: 3,
      title: "Transformation",
      description: " Our main focus is on to bring about positive change in students' lives, both academically and personally. This encourages our educators to design learning experiences that challenge students to think critically, and become active and engaged citizens. The goal is to empower students to become lifelong learners and positive contributors to society."
    },
    {
      id: 4,
      title: "Reflective Pedagogical Practices",
      description: "We use reflective pedagogy, a teaching approach centred on continuous self-assessment and critical reflection, which holds significant value in enhancing teaching practices and improving student learning. By regularly analyzing their teaching methods, instructors can identify areas for improvement, adjust their strategies, and foster a more effective and engaging learning environment for students."
    }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#03002e]' : 'bg-white'}`}>
      {/* Hero Section */}
      <section 
        ref={sectionRefs.hero}
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          background: isDarkMode 
            ? 'linear-gradient(135deg, #03002e 0%, #050040 50%, #03002e 100%)'
            : 'linear-gradient(135deg, #1a237e 0%, #311b92 50%, #b71c1c 100%)',
          height: '170px'
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className={`text-5xl sm:text-6xl lg:text-7xl font-serif italic text-white mb-4 ${visibleSections.hero ? 'animate-fade-in-down' : 'opacity-0'}`}>
            Pedagogical Values
          </h1>
        </div>
      </section>

      {/* Main Content Area */}
      <section ref={sectionRefs.content} className={`py-12 sm:py-16 lg:py-20 overflow-hidden ${isDarkMode ? 'bg-[#03002e]' : 'bg-white'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Introductory Paragraphs */}
            <div className="mb-10 sm:mb-12 space-y-6">
              <p className={`text-base sm:text-lg leading-relaxed ${isDarkMode ? 'text-white' : 'text-gray-800'} ${visibleSections.content ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
                Our Pedagogical Values define the principles that shape how we teach, inspire, and support our learners. These values reflect our belief that education should be student-centered, purposeful, and transformative. We focus on creating a learning environment that promotes curiosity, critical thinking, creativity, and meaningful engagement.
              </p>
              <p className={`text-base sm:text-lg leading-relaxed ${isDarkMode ? 'text-white' : 'text-gray-800'} ${visibleSections.content ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
                Every lesson at BEA is guided by care, inclusivity, and innovation. We aim to empower learners to think independently, solve problems creatively, and apply their learning confidently in the real world. Our pedagogical approach ensures that education goes beyond the classroom, preparing students for success in their academic, professional, and personal lives.
              </p>
            </div>

            {/* Value Cards */}
            <div className="space-y-6 sm:space-y-8">
              {values.map((value, index) => (
                <div
                  key={value.id}
                  className={`rounded-xl shadow-md p-6 sm:p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${isDarkMode ? 'bg-[#050040]' : 'bg-white'} ${visibleSections.content ? 'animate-fade-in-up' : 'opacity-0'}`}
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      {value.id === 1 && (
                        /* Authenticity - Badge/Certificate icon */
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      )}
                      {value.id === 2 && (
                        /* Collaborative Learning - Users icon */
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      )}
                      {value.id === 3 && (
                        /* Transformation - Sparkles/Magic icon */
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      )}
                      {value.id === 4 && (
                        /* Reflective Practices - Light bulb icon */
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      )}
                    </div>
                    {/* Content */}
                    <div className="flex-1">
                      <h3 className={`text-xl sm:text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {value.title}
                      </h3>
                      <p className={`text-sm sm:text-base leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {value.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
