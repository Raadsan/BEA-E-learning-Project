"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const faqs = [
    {
      question: "What kind of General English Course do you offer?",
      answer: "We offer an 8-Level General English Program for adults, guiding them from a complete beginner to an advanced level communicator.",
    },
    {
      question: "Do you have online classes?",
      answer: "Yes, BEA offers both in-class and virtual learning programs via the E-Learning Portal.",
    },
    {
      question: "What is ESP?",
      answer: "English for Specific Purposes (ESP)—These are tailored English programs for professions like medicine, business, law etc.",
    },
    {
      question: "Do you prepare students for IELTS and TOFEL?",
      answer: "Yes, we offer IELTS and TOEFL preparation Courses with practice tests and strategies.",
    },
    {
      question: "How long is each level?",
      answer: "Each level from A1 to C2 runs for 8-10 weeks depending on the course schedule.",
    },
    {
      question: "How well are the teachers qualified?",
      answer: "All BEA teachers are internationally certified and trained in student-centered teaching.",
    },
    {
      question: "Do you provide study materials?",
      answer: "Yes, we provide e-books and audio-visual contents to support our students.",
    },
    {
      question: "Do you have part-time classes?",
      answer: "Yes, we offer flexible schedules and weekend classes.",
    },
    {
      question: "What is BEA's placement test?",
      answer: "A short online or in-person test that helps us place you in the right class.",
    },
    {
      question: "Do you offer Professional Skills and Training programs?",
      answer: "Yes, our Professional Skills and Training Program covers a wide range of soft skills such as communication skills, public speaking skills, presentation skills, report writing skills etc.",
    },
    {
      question: "Can I pay in installments?",
      answer: "No, all tuition fees are one-time, non-refundable charges and are billed monthly by term.",
    },
    {
      question: "Do you offer an internationally recognized English curriculum?",
      answer: "Yes, at the BEA we teach English File—4th Edition published by the Oxford University Press. It is an 8-Level General English Course that incorporates the CEFR (Common European Framework of Reference for Languages) standard for designing language syllabuses, teaching materials, and proficiency assessments across the globe.",
    },
    {
      question: "Do you offer an Academic Writing Program?",
      answer: "Yes, our Advanced Academic Writing Program trains students for research and formal writing.",
    },
    {
      question: "Do you offer Digital Literacy training?",
      answer: "Yes, our Digital Literacy Program covers essential online and Virtual Engagement skills.",
    },
    {
      question: "Where are you located?",
      answer: "We are located in Mogadishu, with details in the Contact Us section below.",
    },
  ];

  // Show only 5 FAQs initially, or all if showAll is true
  const displayedFaqs = showAll ? faqs : faqs.slice(0, 5);

  return (
    <section ref={sectionRef} className={`py-12 sm:py-16 lg:py-20 overflow-hidden ${isDarkMode ? 'bg-[#03002e]' : 'bg-white'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
              <div className={`mb-6 sm:mb-8 lg:mb-12 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-2 sm:mb-3" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
                  Frequently Asked Questions
                </h2>
                <p className={`text-sm sm:text-base lg:text-lg ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  Have questions? We&apos;ve got answers. Can&apos;t find what you&apos;re looking for? Contact our support team 24/7.
                </p>
              </div>
          
          <div className="space-y-4">
            {displayedFaqs.map((faq, index) => (
              <div 
                key={index} 
                className={`rounded-lg overflow-hidden ${isVisible ? 'animate-fade-in-up' : 'opacity-0'} ${isDarkMode ? 'bg-[#050040]' : 'bg-gray-100'}`}
                style={{ animationDelay: `${0.1 + index * 0.05}s` }}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className={`w-full flex items-center justify-between p-4 sm:p-6 transition-colors text-left ${isDarkMode ? 'bg-[#050040] hover:bg-[#060050]' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <span className="font-bold text-sm sm:text-base pr-4" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
                    {faq.question}
                  </span>
                  <svg
                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
                      openIndex === index ? "rotate-180" : ""
                    } ${isDarkMode ? 'text-white' : 'text-gray-600'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className={`p-4 sm:p-6 text-sm sm:text-base ${isDarkMode ? 'bg-[#050040] text-white' : 'bg-gray-100 text-gray-700'}`}>
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* See All / Show Less Button */}
          {faqs.length > 5 && (
            <div className={`mt-8 text-center ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
              <button
                onClick={() => setShowAll(!showAll)}
                className={`inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-white text-[#010080] hover:bg-gray-100' : 'bg-blue-800 text-white hover:bg-blue-900'}`}
              >
                <span>{showAll ? 'Show Less' : 'See All FAQs'}</span>
                <svg 
                  className={`w-5 h-5 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <p className={`mt-2 text-sm ${isDarkMode ? 'text-white' : 'text-gray-500'}`}>
                {showAll ? `Showing all ${faqs.length} questions` : `Showing 5 of ${faqs.length} questions`}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
