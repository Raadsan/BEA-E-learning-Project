"use client";

import { useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.1 });

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

  return (
    <section ref={ref} className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className={`mb-8 sm:mb-12 transition-all duration-700 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
            <h2 className="text-gray-900 text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-700 text-base sm:text-lg">
              Have questions? We&apos;ve got answers. Can&apos;t find what you&apos;re looking for? Contact our support team 24/7.
            </p>
          </div>
          
          <div className="space-y-4">
            {(showAll ? faqs : faqs.slice(0, 5)).map((faq, index) => {
              // Use the actual index from the full array
              const actualIndex = showAll ? index : index;
              
              return (
                <div 
                  key={actualIndex} 
                  className={`bg-gray-100 rounded-lg overflow-hidden transition-all duration-500 ${
                    isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === actualIndex ? null : actualIndex)}
                    className="w-full flex items-center justify-between p-4 sm:p-6 bg-gray-100 hover:bg-gray-200 transition-all duration-300 text-left"
                  >
                    <span className="text-gray-800 font-bold text-sm sm:text-base pr-4">
                      {faq.question}
                    </span>
                    <svg
                      className={`w-5 h-5 text-gray-600 flex-shrink-0 transition-transform ${
                        openIndex === actualIndex ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {openIndex === actualIndex && (
                    <div className="p-4 sm:p-6 bg-gray-100 text-gray-700 text-sm sm:text-base animate-fade-in">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* See All / Show Less Button */}
          {faqs.length > 5 && (
            <div className={`mt-6 sm:mt-8 text-center transition-all duration-700 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
              <button
                onClick={() => {
                  setShowAll(!showAll);
                  setOpenIndex(null); // Close any open FAQs when toggling
                }}
                className="bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-900 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base shadow-md hover:shadow-lg"
              >
                {showAll ? "Show Less" : "See All"}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
