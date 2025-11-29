"use client";

import { useEffect, useRef, useState } from "react";

export default function IELTSTOEFLProgram() {
  const [visibleSections, setVisibleSections] = useState({});
  const sectionRefs = {
    hero: useRef(null),
    intro: useRef(null),
    table: useRef(null),
    comparison: useRef(null),
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

  const exams = [
    {
      exam: "IELTS (International English Language Testing System)",
      objectives: "This course prepares candidates for both Academic and General Training modules. Students develop listening accuracy, analytical reading skills, structured academic writing, and fluent speaking ability. BEA integrates practice tests, examiner-style feedback, and vocabulary enhancement to ensure familiarity with all question types and scoring criteria."
    },
    {
      exam: "TOEFL (Test of English as a Foreign Language - iBT)",
      objectives: "Designed for university-bound and professional candidates, this course focuses on integrated skills development—combining reading, listening, speaking, and writing in academic contexts. Learners build confidence through timed exercises, note-taking strategies, and digital test techniques to achieve top scores in the internet-based TOEFL (iBT) format."
    },
  ];

  const comparisonData = [
    {
      feature: "Purpose",
      ielts: "Study, migration and employment in English-speaking countries",
      toefl: "Academic and professional entry, especially in U.S.-based institutions"
    },
    {
      feature: "Test Format",
      ielts: "Paper-based or Computer-delivered (4 modules)",
      toefl: "Fully Computer-based (4 sections)"
    },
    {
      feature: "Test Sections",
      ielts: "Listening, Reading, Writing, Speaking",
      toefl: "Reading, Listening, Speaking, Writing"
    },
    {
      feature: "Scoring System",
      ielts: "Band scale 1-9 (overall and per skill)",
      toefl: "Score range 0-120 (each skill scored 0-30)"
    },
    {
      feature: "Duration",
      ielts: "Approximately 2 hours 45 minutes",
      toefl: "Approximately 3 hours"
    },
    {
      feature: "Speaking Test Format",
      ielts: "Face-to-face with an examiner",
      toefl: "Recorded responses via microphone"
    },
    {
      feature: "Writing Focus",
      ielts: "Task 1: Report or Letter, Task 2: Essay",
      toefl: "Task 1: Integrated Writing, Task 2: Independent Essay"
    },
    {
      feature: "Success Strategies",
      ielts: "Focus on paraphrasing, coherence, and time control",
      toefl: "Focus on note-taking, integrated task management, and vocabulary expansion"
    },
    {
      feature: "Ideal Candidates",
      ielts: "For learners targeting the UK, Canada, Australia, and New Zealand",
      toefl: "For learners targeting U.S. universities and international academic programs"
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - IELTS & TOEFL Logos */}
      <section
        ref={sectionRefs.hero}
        className="bg-white py-10 sm:py-14 lg:py-16 overflow-hidden"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex flex-col items-center justify-center gap-4 ${visibleSections.hero ? 'animate-fade-in-down' : 'opacity-0'}`}>
            {/* IELTS Logo */}
            <div className="text-center">
              <span className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight" style={{ color: '#c8102e' }}>
                IELTS
              </span>
              <span className="text-xl sm:text-2xl align-top" style={{ color: '#c8102e' }}>™</span>
            </div>
            
            {/* TOEFL Logo */}
            <div className="text-center">
              <span className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight" style={{ color: '#00529b' }}>
                TOEFL
              </span>
              <span className="text-lg sm:text-xl align-top" style={{ color: '#00529b' }}>®</span>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section ref={sectionRefs.intro} className="py-10 sm:py-14 lg:py-16 overflow-hidden" style={{ backgroundColor: '#f0f4f8' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Title */}
            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-900 mb-6 ${visibleSections.intro ? 'animate-fade-in-up' : 'opacity-0'}`}>
              IELTS and TOEFL<br />
              Preparation Courses
            </h1>
            
            {/* First Paragraph */}
            <p className={`text-gray-700 text-sm sm:text-base leading-relaxed mb-6 ${visibleSections.intro ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
              Our IELTS And TOEFL Preparation Programs Are Strategically Developed To Help Learners Succeed In The World&apos;s Most Recognized English Proficiency Exams. Both Programs Focus On Building Test-Specific Skills, Academic Communication Strategies, And Confidence Through Comprehensive Lessons And Simulated Testing Experiences.
            </p>
            
            {/* Second Paragraph */}
            <p className={`text-gray-700 text-sm sm:text-base leading-relaxed ${visibleSections.intro ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              Under Our Mentorship Each Learner Receives Individualized Attention, Continuous Feedback, And Practice Opportunities That Replicate Real Test Conditions.
            </p>
          </div>
        </div>
      </section>

      {/* Table Section */}
      <section ref={sectionRefs.table} className="py-10 sm:py-14 lg:py-16 bg-white overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Section Title */}
            <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-8 ${visibleSections.table ? 'animate-fade-in-up' : 'opacity-0'}`}>
              Introduction to IELTS and TOEFL Exams
            </h2>
            
            {/* Table */}
            <div className={`overflow-hidden border border-gray-200 ${visibleSections.table ? 'animate-scale-in' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: '#dc2626' }}>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-white w-1/4 border-r border-red-700">
                        Exam
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-white">
                        Course focus and objectives
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {exams.map((item, index) => (
                      <tr 
                        key={index} 
                        className={`border-b border-gray-200 ${
                          index % 2 === 0 ? "bg-white" : "bg-blue-50/30"
                        }`}
                      >
                        <td className="px-4 sm:px-6 py-5 align-top border-r border-gray-200">
                          <span className="text-blue-900 font-semibold text-xs sm:text-sm">
                            {item.exam}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-5 text-gray-600 text-xs sm:text-sm leading-relaxed">
                          {item.objectives}
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

      {/* IELTS vs TOEFL Comparison Section */}
      <section ref={sectionRefs.comparison} className="py-10 sm:py-14 lg:py-16 bg-white overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Section Title */}
            <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-8 ${visibleSections.comparison ? 'animate-fade-in-up' : 'opacity-0'}`}>
              IELTS vs TOEFL - A side-byside comparison
            </h2>
            
            {/* Comparison Table */}
            <div className={`overflow-hidden border border-gray-200 ${visibleSections.comparison ? 'animate-scale-in' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: '#dc2626' }}>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-white w-1/4 border-r border-red-700">
                        Feature
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-white w-[37.5%] border-r border-red-700">
                        IELTS
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-white w-[37.5%]">
                        TOEFL iBT
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((item, index) => (
                      <tr 
                        key={index} 
                        className={`border-b border-gray-200 ${
                          index % 2 === 0 ? "bg-white" : "bg-blue-50/30"
                        }`}
                      >
                        <td className="px-4 sm:px-6 py-5 align-top border-r border-gray-200">
                          <span className="text-blue-900 font-semibold text-xs sm:text-sm">
                            {item.feature}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-5 text-gray-600 text-xs sm:text-sm leading-relaxed border-r border-gray-200">
                          {item.ielts}
                        </td>
                        <td className="px-4 sm:px-6 py-5 text-gray-600 text-xs sm:text-sm leading-relaxed">
                          {item.toefl}
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
      <section ref={sectionRefs.outcome} className="py-10 sm:py-14 lg:py-16 overflow-hidden" style={{ backgroundColor: '#e8eef3' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-gray-900 mb-6 ${visibleSections.outcome ? 'animate-fade-in-up' : 'opacity-0'}`}>
              Program Outcome
            </h2>
            
            <p className={`text-blue-800 text-sm sm:text-base leading-relaxed ${visibleSections.outcome ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
              Graduates of BEA&apos;s IELTS and TOEFL preparation programs emerge ready to meet global English proficiency standards. Beyond achieving their target scores, students gain lasting confidence in academic and professional communication. With BEA&apos;s expert guidance, strategic training, and supportive learning environment, success in IELTS or TOEFL becomes the foundation for international opportunity and lifelong achievement.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

