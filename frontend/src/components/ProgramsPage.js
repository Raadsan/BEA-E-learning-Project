"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";

export default function ProgramsPage() {
  const { isDarkMode } = useTheme();
  const [visibleSections, setVisibleSections] = useState({});
  const sectionRefs = {
    hero: useRef(null),
    intro: useRef(null),
    portfolio: useRef(null),
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

  const programs = [
    {
      id: 1,
      title: "General English Program For Adults",
      description: "We teach the internationally acclaimed English File 4th Edition published by the Oxford University Press—one of the world's most trusted and research-driven English language programs.",
      image: "/images/8- Level General English Course for Adults.jpg",
      alt: "General English Program For Adults",
      buttonText: "Read more",
      link: "/programs/8-level-general-english"
    },
    {
      id: 2,
      title: "English for Specific Purposes (ESP) Program",
      description: "Our English for Specific Purposes (ESP) program is designed to equip learners with the precise language skills they need to excel in their chosen professions. Whether communicating in the boardroom, writing for publication, or engaging with global clients, our ESP courses merge linguistic accuracy with real-world professional relevance.",
      image: "/images/English for Specific Purposes (ESP).jpg",
      alt: "English for Specific Purposes (ESP) Program",
      buttonText: "Read more",
      link: "/programs/esp"
    },
    {
      id: 3,
      title: "IELTS and TOEFL Exam Preparation Courses",
      description: "Our IELTS and TOEFL Preparation Programs are strategically developed to help learners succeed in the world's most recognized English proficiency exams. Both programs focus on building test-specific skills, academic communication strategies, and confidence through comprehensive lessons and simulated testing experiences.",
      image: "/images/IELTS & TOEFL Preparation Courses1.jpg",
      alt: "IELTS and TOEFL Exam Preparation Courses",
      buttonText: "Read more",
      link: "/programs/ielts-toefl"
    },
    {
      id: 4,
      title: "Soft Skills and Workplace Training Programs",
      description: "As an institution we go beyond language learning to empower individuals with the professional and 21st century skills essential for success in today's global workplace. Our Professional Skills & Training Programs are carefully designed to develop the communication, critical thinking, leadership, and digital capabilities demanded by modern employers and international industries.",
      image: "/images/Soft Skills and Workplace Training Programs.jpg",
      alt: "Soft Skills and Workplace Training Programs",
      buttonText: "Read more",
      link: "/programs/professional-skills"
    },
    {
      id: 5,
      title: "BEA Academic Writing Program",
      description: "The Advanced Academic Writing Program at The Blueprint English Academy (BEA) is designed for students, researchers, and professionals who wish to refine their written communication for academic success.",
      image: "/images/Advanced Academic Writing Program.jpg",
      alt: "BEA Academic Writing Program",
      buttonText: "Read more",
      link: "/programs/academic-writing"
    },
    {
      id: 6,
      title: "Digital Literacy and Virtual Communication Skills Program",
      description: "In today's fast-changing, technology-driven world, the ability to use digital tools and communicate effectively online has become essential. Our Digital Literacy and Virtual Communication Skills Programs equip learners with the technical and communication skills needed to thrive in academic, professional, and global digital environments.",
      image: "/images/Digital Literacy & Virtual Communication Skills Program1.jpg",
      alt: "Digital Literacy and Virtual Communication Skills Program",
      buttonText: "Enroll now",
      link: "/programs/digital-literacy"
    },
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
          <h1 className={`text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-4 ${visibleSections.hero ? 'animate-fade-in-down' : 'opacity-0'}`}>
            Programs
          </h1>
        </div>
      </section>

      {/* Introductory Text Section */}
      <section ref={sectionRefs.intro} className="py-8 sm:py-12 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`max-w-5xl mx-auto space-y-6 leading-relaxed text-base sm:text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            <p className={`${visibleSections.intro ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
              We offer a unique portfolio of programs designed to redefine English learning through purpose, innovation, and global relevance.
            </p>
            
            <p className={`${visibleSections.intro ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              From our 8-Level General English Course for Adults to ESP (English For Specific Purposes), IELTS & TOEFL preparation, and Advanced Academic Writing, every program builds confidence, fluency, and real-world communication skills.
            </p>
            
            <p className={`${visibleSections.intro ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
              What truly sets BEA apart is our focus on connecting language with life skills. Through our Professional Skills and Training Programs and Digital Literacy & Virtual Skills Program, students gain the tools to thrive in today&apos;s workplace and digital world—making BEA a true blueprint for personal and professional growth.
            </p>
          </div>
        </div>
      </section>

      {/* BEA Programs Portfolio Section */}
      <section ref={sectionRefs.portfolio} className={`py-12 sm:py-16 lg:py-20 overflow-hidden ${isDarkMode ? 'bg-[#04003a]' : 'bg-white'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className={`mb-10 sm:mb-12 ${visibleSections.portfolio ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                BEA Programs Portfolio
              </h2>
              <p className={`text-base sm:text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Learn more about BEA&apos;s unique program portfolio.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {programs.map((program, index) => (
                <div
                  key={program.id}
                  className={`rounded-xl shadow-lg overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col cursor-pointer ${isDarkMode ? 'bg-[#050040]' : 'bg-white'} ${visibleSections.portfolio ? 'animate-fade-in-up' : 'opacity-0'}`}
                  style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                >
                  {/* Image */}
                  <div className="relative w-full h-48 sm:h-56 overflow-hidden rounded-tl-xl rounded-tr-xl group">
                    <Image
                      src={program.image}
                      alt={program.alt}
                      fill
                      className="object-cover rounded-tl-xl rounded-tr-xl transition-transform duration-300 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className={`text-base sm:text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {program.title}
                    </h3>
                    
                    <p className={`text-xs sm:text-sm leading-relaxed mb-4 flex-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {program.description}
                    </p>
                    
                    {/* Read More Button */}
                    <a 
                      href={program.link || "#"} 
                      className={`px-6 py-2 rounded-lg font-semibold transition-colors text-sm sm:text-base w-full text-center block header-keep-white ${isDarkMode ? 'bg-white hover:bg-gray-100' : 'bg-blue-800 text-white hover:bg-blue-900'}`}
                      style={isDarkMode ? { color: '#010080' } : {}}
                    >
                      {program.buttonText || "Read more"}
                    </a>
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
