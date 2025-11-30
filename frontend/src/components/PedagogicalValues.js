"use client";

import { useEffect, useRef, useState } from "react";

export default function PedagogicalValues() {
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
      description: " Our main focus is on to bring about positive change in students’ lives, both academically and personally. This encourages our educators to design learning experiences that challenge students to think critically, and become active and engaged citizens. The goal is to empower students to become lifelong learners and positive contributors to society."
    },
    {
      id: 4,
      title: "Reflective Pedagogical Practices",
      description: "We use reflective pedagogy, a teaching approach centred on continuous self-assessment and critical reflection, which holds significant value in enhancing teaching practices and improving student learning. By regularly analyzing their teaching methods, instructors can identify areas for improvement, adjust their strategies, and foster a more effective and engaging learning environment for students."
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
            Pedagogical Values
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
                Our Pedagogical Values define the principles that shape how we teach, inspire, and support our learners. These values reflect our belief that education should be student-centered, purposeful, and transformative. We focus on creating a learning environment that promotes curiosity, critical thinking, creativity, and meaningful engagement.
              </p>
              <p className={`text-gray-800 text-base sm:text-lg leading-relaxed ${visibleSections.content ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
                Every lesson at BEA is guided by care, inclusivity, and innovation. We aim to empower learners to think independently, solve problems creatively, and apply their learning confidently in the real world. Our pedagogical approach ensures that education goes beyond the classroom, preparing students for success in their academic, professional, and personal lives.
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

