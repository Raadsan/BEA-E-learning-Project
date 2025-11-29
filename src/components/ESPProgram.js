"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function ESPProgram() {
  const [visibleSections, setVisibleSections] = useState({});
  const sectionRefs = {
    hero: useRef(null),
    intro: useRef(null),
    courses: useRef(null),
    outcome: useRef(null),
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

  const espCourses = [
    {
      field: "Aviation Industry (Pilots, Air Traffic Controllers, Cabin Crew)",
      features: "Focus on Aviation English terminology, standard ICAO phraseology, emergency communication, and passenger interaction. Real-world simulations and pronunciation drills ensure clear, precise, and safety-oriented communication."
    },
    {
      field: "Journalism and Media Professionals",
      features: "Emphasis on news writing, interviewing, reporting, editorial vocabulary, and critical reading. Learners practice real media tasks, ethical reporting, and script writing to enhance clarity, accuracy, and narrative flow."
    },
    {
      field: "Entrepreneurs and Business Leaders",
      features: "Training in Business English communication, negotiation, proposal writing, presentations, and networking. Learners develop persuasive language skills and intercultural competence for global business growth."
    },
    {
      field: "Healthcare and Medical Professionals",
      features: "Modules on patient communication, medical terminology, case reporting, and cross-cultural interaction in healthcare. Designed to improve bedside communication and professional documentation accuracy."
    },
    {
      field: "Information Technology (IT) Specialists",
      features: "Focus on technical vocabulary, documentation writing, software presentations, and remote collaboration. Learners master communication in tech-based teams and global client settings."
    },
    {
      field: "Hospitality and Tourism",
      features: "Training in service interaction, customer handling, complaint resolution, and professional etiquette. Learners gain confidence in delivering exceptional service in international hospitality environments."
    },
    {
      field: "Law and Public Administration",
      features: "Specialized legal English for drafting, debating, and public communication. The course develops precision in legal terminology, case analysis, and formal documentation."
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Background Image with Left Shadow */}
      <section
        ref={sectionRefs.hero}
        className="relative overflow-hidden h-[350px] sm:h-[420px] lg:h-[500px]"
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/English for Specific Purposes (ESP).webp"
            alt="English for Specific Purposes - Professional Team"
            fill
            className="object-cover object-center lg:object-right"
            priority
          />
        </div>
        
        {/* Left Shadow/Gradient Overlay - Footer Blue Color */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, rgba(1, 0, 128, 0.95) 0%, rgba(1, 0, 128, 0.8) 20%, rgba(1, 0, 128, 0.4) 40%, rgba(1, 0, 128, 0.1) 55%, transparent 65%)'
          }}
        />
        
        {/* Title Content */}
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`max-w-xl ${visibleSections.hero ? 'animate-fade-in-left' : 'opacity-0'}`}>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-serif font-bold text-white leading-tight">
                English for Specific<br />
                Purposes (ESP) Program
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section ref={sectionRefs.intro} className="py-10 sm:py-14 lg:py-16 bg-white overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-5 text-gray-700 leading-relaxed text-sm sm:text-base">
            <p className={`${visibleSections.intro ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
              Our English for Specific Purposes (ESP) program is designed to equip learners with the precise language skills they need to excel in their chosen professions. Whether communicating in the boardroom, writing for publication, or engaging with global clients, our ESP courses merge linguistic accuracy with real-world professional relevance.
            </p>
            
            <p className={`${visibleSections.intro ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              With our expert instructors, dynamic course materials, and practical communication approach, BEA ensures that learners achieve fluency, precision, and professionalization. Our ESP Program is more than language training—it&apos;s a gateway to success in global industries.
            </p>
          </div>
        </div>
      </section>

      {/* ESP Courses Table Section */}
      <section ref={sectionRefs.courses} className="py-10 sm:py-14 lg:py-16 bg-white overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className={`mb-8 ${visibleSections.courses ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <h2 className="text-gray-900 text-xl sm:text-2xl lg:text-3xl font-serif font-bold">
                Our ESP Courses Are Designed for these Professional Fields
              </h2>
            </div>
            
            {/* Table */}
            <div className={`overflow-hidden border border-gray-200 ${visibleSections.courses ? 'animate-scale-in' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: '#dc2626' }}>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-white w-1/3 border-r border-red-700">
                        Professional Field
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-white">
                        Tailored Course Features for career Success
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {espCourses.map((course, index) => (
                      <tr 
                        key={index} 
                        className={`border-b border-gray-200 ${
                          index % 2 === 0 ? "bg-white" : "bg-blue-50/30"
                        }`}
                      >
                        <td className="px-4 sm:px-6 py-4 align-top border-r border-gray-200">
                          <span className="text-blue-900 font-semibold text-xs sm:text-sm">
                            {course.field}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-gray-600 text-xs sm:text-sm leading-relaxed">
                          {course.features}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Program Outcome Section */}
      <section ref={sectionRefs.outcome} className="py-10 sm:py-14 lg:py-16 bg-white overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className={`text-gray-900 text-xl sm:text-2xl lg:text-3xl font-serif font-bold mb-5 ${visibleSections.outcome ? 'animate-fade-in-up' : 'opacity-0'}`}>
              Program Outcome
            </h2>
            
            <div className={`text-gray-700 leading-relaxed text-sm sm:text-base ${visibleSections.outcome ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
              <p>
                Graduates of BEA&apos;s ESP program will emerge as confident, articulate professionals ready to navigate the linguistic challenges of their fields. By mastering both general fluency and sector-specific elements, learners gain a competitive edge in the global market. The BEA approach ensures every professional not only speaks English—but speaks the language of their career success.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
