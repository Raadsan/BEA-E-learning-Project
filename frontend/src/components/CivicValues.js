"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";

export default function CivicValues() {
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
      title: "Responsibility",
      description: "Our students should be accountable for their learning, meeting deadlines, and contributing to group work. In an English class, this can involve completing assignments on time, preparing for presentations, and taking ownership of their language development."
    },
    {
      id: 2,
      title: "Empathy",
      description: "Understanding and sharing the feelings of others is crucial for building a positive classroom environment. In an English class, this can be fostered through activities that encourage students to consider different perspectives, such as role-playing, case studies, or analyzing characters' motivations in literature."
    },
    {
      id: 3,
      title: "Active Participation",
      description: "Encouraging students to engage in discussions, ask questions, and contribute their ideas is essential. This can involve participating in debates, sharing personal experiences related to the topic, and collaborating on projects."
    },
    {
      id: 4,
      title: "Perseverance",
      description: "In the context of English language learning, perseverance is vital for overcoming challenges and setbacks. Encouraging students to persist in their efforts, even when faced with difficult tasks, is crucial for developing their language skills and overall confidence."
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
            Civic Values
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
                Our Civic Values emphasize the importance of responsibility, participation, and respect within the community. We believe that education extends beyond the classroom—it prepares individuals to become active, ethical, and compassionate members of society.
              </p>
              <p className={`text-base sm:text-lg leading-relaxed ${isDarkMode ? 'text-white' : 'text-gray-800'} ${visibleSections.content ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
                Through our programs, students learn the value of cooperation, social awareness, and civic responsibility, developing the mindset to contribute positively to their communities and the wider world. BEA nurtures learners who not only pursue personal success but also strive to make a meaningful impact through service, leadership, and integrity.
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
                        /* Responsibility - Clipboard/Checklist icon */
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      )}
                      {value.id === 2 && (
                        /* Empathy - Heart/Hand icon */
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      )}
                      {value.id === 3 && (
                        /* Active Participation - Hand raised icon */
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                        </svg>
                      )}
                      {value.id === 4 && (
                        /* Perseverance - Mountain/Flag icon */
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 21l9-9m0 0l9 9m-9-9v-8m0 0l3.5 3.5M12 4l-3.5 3.5" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 4h4v4" />
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
