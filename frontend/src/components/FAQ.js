"use client";

import { useState } from "react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

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
    <section className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-gray-800 text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12">
            Frequently Asking Questions
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 sm:p-6 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                >
                  <span className="text-gray-800 font-medium text-sm sm:text-base pr-4">
                    {faq.question}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-600 flex-shrink-0 transition-transform ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {openIndex === index && (
                  <div className="p-4 sm:p-6 bg-white text-gray-600 text-sm sm:text-base">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
