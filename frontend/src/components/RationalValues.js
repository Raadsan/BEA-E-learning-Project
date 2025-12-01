"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";

export default function RationalValues() {
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
      title: "Human Dignity",
      description: "We recognize the inherent worth and value of every individual. At BEA, we ensure that every learner, educator, and staff member is treated with compassion, fairness, and respect. We create an environment where everyone feels valued, heard, and empowered to reach their full potential."
    },
    {
      id: 2,
      title: "Cultural Integrity",
      description: "As a Somali institution, BEA is deeply committed to honoring and preserving our cultural heritage while embracing global perspectives. We celebrate cultural diversity, encourage cultural appreciation, and foster an environment where cultural identity is respected and valued. We believe that understanding and respecting different cultures strengthens our community and enriches the learning experience."
    },
    {
      id: 3,
      title: "Respectful",
      description: "Respect is at the heart of everything we do. We treat every individual with dignity, regardless of their background, beliefs, or circumstances. We foster an environment where ideas can be shared openly, differences are celebrated, and collaboration thrives. By modeling respect in all interactions, we build trust, enhance collaboration, and create a foundation for enhanced achievement and well-being."
    },
    {
      id: 4,
      title: "Transparency",
      description: "We believe that transparency is essential for building trust, accountability, and growth. We are open and honest in our communication, policies, and practices. Students, parents, and partners can trust that we operate with integrity and clarity. We ensure that expectations are clear, progress is visible, and feedback is welcomed and acted upon."
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
            Rational Values
          </h1>
        </div>
      </section>

      {/* Main Content Area */}
      <section ref={sectionRefs.content} className={`py-12 sm:py-16 lg:py-20 overflow-hidden ${isDarkMode ? 'bg-[#03002e]' : 'bg-white'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Introductory Paragraph */}
            <div className={`mb-10 sm:mb-12 ${visibleSections.content ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <p className={`text-base sm:text-lg leading-relaxed ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Our foundation is built upon values that guide every action, interaction, and educational decision. We believe that learning is not only about acquiring knowledge—it&apos;s about shaping character and nurturing a respectful, responsible, and inclusive community. Our Rational Values represent the guiding principles that uphold our mission and shape our learners into thoughtful, confident, and ethical individuals.
              </p>
            </div>

            {/* Value Cards */}
            <div className="space-y-6 sm:space-y-8">
              {values.map((value, index) => (
                <div
                  key={value.id}
                  className={`rounded-xl shadow-md p-6 sm:p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${isDarkMode ? 'bg-[#050040]' : 'bg-white'} ${visibleSections.content ? 'animate-fade-in-up' : 'opacity-0'}`}
                  style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      {value.id === 1 && (
                        /* Human Dignity - Heart in hands icon */
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      )}
                      {value.id === 2 && (
                        /* Cultural Integrity - Globe icon */
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a15.3 15.3 0 014 9 15.3 15.3 0 01-4 9 15.3 15.3 0 01-4-9 15.3 15.3 0 014-9z" />
                        </svg>
                      )}
                      {value.id === 3 && (
                        /* Respectful - Handshake/Users icon */
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      )}
                      {value.id === 4 && (
                        /* Transparency - Eye icon */
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
