"use client";

import { useEffect, useRef, useState } from "react";

export default function CivicValues() {
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section 
        ref={sectionRefs.hero}
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1a237e 0%, #311b92 50%, #b71c1c 100%)',
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
      <section ref={sectionRefs.content} className="py-12 sm:py-16 lg:py-20 bg-white overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Introductory Paragraphs */}
            <div className="mb-10 sm:mb-12 space-y-6">
              <p className={`text-gray-800 text-base sm:text-lg leading-relaxed ${visibleSections.content ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
                Our Civic Values emphasize the importance of responsibility, participation, and respect within the community. We believe that education extends beyond the classroom—it prepares individuals to become active, ethical, and compassionate members of society.
              </p>
              <p className={`text-gray-800 text-base sm:text-lg leading-relaxed ${visibleSections.content ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
                Through our programs, students learn the value of cooperation, social awareness, and civic responsibility, developing the mindset to contribute positively to their communities and the wider world. BEA nurtures learners who not only pursue personal success but also strive to make a meaningful impact through service, leadership, and integrity.
              </p>
            </div>

            {/* Value Cards */}
            <div className="space-y-6 sm:space-y-8">
              {values.map((value, index) => (
                <div
                  key={value.id}
                  className={`bg-white rounded-xl shadow-md p-6 sm:p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${visibleSections.content ? 'animate-fade-in-up' : 'opacity-0'}`}
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                        {value.title}
                      </h3>
                      <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
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

