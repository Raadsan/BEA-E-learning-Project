"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";

export default function PaymentRefundPolicy() {
  const { isDarkMode } = useTheme();
  const [visibleSections, setVisibleSections] = useState({});
  const sectionRefs = {
    hero: useRef(null),
    intro: useRef(null),
    sections: useRef(null),
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

  const policySections = [
    {
      id: 1,
      title: "Tuition Fee Structure",
      icon: "fee",
      subsections: [
        {
          subtitle: "1.1 One-Time, Non-Refundable Charge",
          items: [
            "All students are required to pay a one-time Tuition Fee at the start of their enrolment.",
            "This fee is strictly non-refundable, regardless of:",
          ],
          subItems: [
            "Withdrawal from a program",
            "Non-attendance",
            "Course suspension",
            "Institutional schedule changes",
            "Personal circumstances"
          ]
        },
        {
          subtitle: "1.2 Monthly Term Billing",
          numberedItems: [
            "All Tuition Fees are billed monthly by term based on the program in which the student is enrolled.",
            "Each new term begins a new billing cycle.",
            "Invoices or payment reminders are shared through official BEA communication channels."
          ]
        },
        {
          subtitle: "1.3 Other Possible Charges",
          description: "While the Tuition Fee is one-time and non-refundable, students may incur additional charges such as:",
          items: [
            "Placement Test fees",
            "Certification or Exam fees",
            "Program-specific materials or resources"
          ],
          note: "Late payments may result in the student losing their scheduled class slot if they have not informed the Finance Office of their financial situation in advance."
        }
      ]
    },
    {
      id: 2,
      title: "Payment Instructions",
      icon: "payment",
      subsections: [
        {
          subtitle: "2.1 Official Payment Channels",
          items: [
            "All payments must be made directly to the official BEA bank accounts or approved payment platforms."
          ],
          note: "BEA will never request payments through personal accounts, individuals, or unverified channels."
        },
        {
          subtitle: "2.2 Verification of Payment",
          description: "Students should ensure:",
          items: [
            "The correct BEA account details are used",
            "The student's full name and program are included in the payment reference",
            "Payment receipts are kept for personal verification"
          ],
          note: "Students are required to send a copy of the payment receipt for confirmation."
        },
        {
          subtitle: "2.3 Payment Deadlines",
          items: [
            "Monthly tuition must be paid on or before the stated due date.",
            "Late payments may result in:"
          ],
          subItems: [
            "Missing out on class seats",
            "Withheld certificates, results, or academic records"
          ]
        }
      ]
    },
    {
      id: 3,
      title: "Refund Policy",
      icon: "refund",
      subsections: [
        {
          subtitle: "3.1 Non-Refundable Tuition Fee",
          items: [
            "The one-time Tuition Fee is non-refundable under all circumstances."
          ]
        },
        {
          subtitle: "3.2 Refunds for Monthly Tuition (Rare Scenarios)",
          description: "Monthly tuition payments are generally non-refundable once classes begin, except in rare, specific situations such as:",
          items: [
            "Overpayment",
            "Administrative billing errors",
            "Duplicate transactions"
          ],
          note: "In such cases, refunds are processed within a defined timeframe after verification."
        },
        {
          subtitle: "3.3 No Refunds for:",
          numberedItems: [
            "Missed classes",
            "Student withdrawal or dropout",
            "Personal scheduling conflicts",
            "Lack of participation",
            "Student removal due to misconduct or policy violation"
          ]
        }
      ]
    },
    {
      id: 4,
      title: "Cancellation, Withdrawal, and Changes",
      icon: "changes",
      subsections: [
        {
          subtitle: "4.1 Student-Initiated Withdrawal",
          description: "If a student chooses to withdraw:",
          numberedItems: [
            "No portion of the one-time Tuition Fee will be refunded.",
            "No refunds for current or previous months of instruction."
          ]
        },
        {
          subtitle: "4.2 BEA-Initiated Changes",
          description: "If BEA reschedules or reorganizes classes:",
          numberedItems: [
            "Students will be offered an alternative schedule.",
            "This does not qualify for a fee refund."
          ]
        },
        {
          subtitle: "4.3 Program Changes",
          description: "If a student changes programs:",
          numberedItems: [
            "Previously paid tuition fees cannot be transferred or refunded.",
            "New program fees apply as per the updated pricing."
          ]
        }
      ]
    },
    {
      id: 5,
      title: "Disputes and Financial Queries",
      icon: "support",
      subsections: [
        {
          subtitle: "Contact the BEA Finance Office",
          description: "Students may contact the BEA Finance Office for:",
          numberedItems: [
            "Payment disputes",
            "Receipt verification",
            "Account corrections",
            "Clarifications on charges"
          ],
          note: "All financial matters must be handled through official BEA communication channels."
        }
      ]
    }
  ];

  const getIcon = (iconType) => {
    switch (iconType) {
      case "fee":
        return (
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "payment":
        return (
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
          </svg>
        );
      case "refund":
        return (
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
        );
      case "changes":
        return (
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        );
      case "support":
        return (
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#03002e]' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <section 
        ref={sectionRefs.hero}
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          background: isDarkMode 
            ? 'linear-gradient(135deg, #03002e 0%, #050040 50%, #03002e 100%)'
            : 'linear-gradient(135deg, #1a237e 0%, #311b92 50%, #b71c1c 100%)',
          minHeight: '200px',
          paddingTop: '40px',
          paddingBottom: '40px'
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`inline-block mb-4 ${visibleSections.hero ? 'animate-fade-in-down' : 'opacity-0'}`}>
            <svg className="w-16 h-16 sm:w-20 sm:h-20 text-white mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          </div>
          <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 ${visibleSections.hero ? 'animate-fade-in-down' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
            Payment & Refund Policy
          </h1>
          <p className={`text-base sm:text-lg text-white/90 max-w-2xl mx-auto ${visibleSections.hero ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            The Blueprint English Academy (BEA)
          </p>
        </div>
      </section>

      {/* Introduction Section */}
      <section ref={sectionRefs.intro} className={`py-10 sm:py-14 ${isDarkMode ? 'bg-[#03002e]' : 'bg-white'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Effective Date */}
            <div className={`text-center mb-6 ${visibleSections.intro ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${isDarkMode ? 'bg-[#050040] text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                Effective Date: 30/11/2025
              </span>
            </div>

            <div 
              className={`rounded-2xl p-6 sm:p-8 md:p-10 shadow-lg border-l-4 border-blue-600 ${isDarkMode ? 'bg-[#050040]' : 'bg-white'} ${visibleSections.intro ? 'animate-scale-in' : 'opacity-0'}`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-blue-600/20' : 'bg-blue-100'}`}>
                  <svg className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className={`text-xl sm:text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    About This Policy
                  </h2>
                  <p className={`text-base sm:text-lg leading-relaxed mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    The Payment & Refund Policy outlines how tuition fees, charges, payment schedules, and refunds are managed at The Blueprint English Academy (&quot;BEA&quot;, &quot;we&quot;, &quot;our&quot;). This policy ensures transparency, consistency, and fairness in all financial interactions between The BEA and its students.
                  </p>
                  <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <strong>Scope:</strong> This policy applies to all students enrolled in BEA programs, courses, and services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Policy Sections */}
      <section ref={sectionRefs.sections} className={`py-10 sm:py-14 pb-16 sm:pb-20 ${isDarkMode ? 'bg-[#04003a]' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="space-y-8 sm:space-y-10">
              {policySections.map((section, sectionIndex) => (
                <div 
                  key={section.id} 
                  className={`rounded-2xl overflow-hidden shadow-lg ${isDarkMode ? 'bg-[#050040]' : 'bg-white'} ${visibleSections.sections ? 'animate-fade-in-up' : 'opacity-0'}`}
                  style={{ animationDelay: `${sectionIndex * 0.1}s` }}
                >
                  {/* Section Header */}
                  <div 
                    className="px-6 sm:px-8 py-5 sm:py-6 flex items-center gap-4"
                    style={{
                      background: isDarkMode 
                        ? 'linear-gradient(90deg, #03002e 0%, #050040 100%)'
                        : 'linear-gradient(90deg, #010080 0%, #3949ab 100%)'
                    }}
                  >
                    <div className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-white/10' : 'bg-white/20'}`}>
                      <span className="text-white">
                        {getIcon(section.icon)}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white">
                        {section.title}
                      </h2>
                    </div>
                  </div>
                  
                  {/* Section Content */}
                  <div className="p-6 sm:p-8">
                    <div className="space-y-6 sm:space-y-8">
                      {section.subsections.map((subsection, subIndex) => (
                        <div 
                          key={subIndex} 
                          className={`p-4 sm:p-5 rounded-xl ${isDarkMode ? 'bg-[#03002e]/50' : 'bg-gray-50'}`}
                        >
                          <h3 className={`text-lg sm:text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {subsection.subtitle}
                          </h3>
                          
                          {subsection.description && (
                            <p className={`text-sm sm:text-base mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {subsection.description}
                            </p>
                          )}
                          
                          {subsection.items && (
                            <ul className="space-y-2 mb-3">
                              {subsection.items.map((item, itemIndex) => (
                                <li key={itemIndex} className="flex items-start gap-3">
                                  <span className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${isDarkMode ? 'bg-blue-400' : 'bg-blue-600'}`}></span>
                                  <span className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {item}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                          
                          {subsection.numberedItems && (
                            <ul className="space-y-2 mb-3">
                              {subsection.numberedItems.map((item, itemIndex) => (
                                <li key={itemIndex} className="flex items-start gap-3">
                                  <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isDarkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                                    {itemIndex + 1}
                                  </span>
                                  <span className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {item}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                          
                          {subsection.subItems && (
                            <ul className="ml-6 space-y-2 mb-3">
                              {subsection.subItems.map((subItem, subItemIndex) => (
                                <li key={subItemIndex} className="flex items-start gap-3">
                                  <span className={`flex-shrink-0 text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{subItemIndex + 1}.</span>
                                  <span className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {subItem}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                          
                          {subsection.note && (
                            <div className={`mt-4 p-3 rounded-lg border-l-4 ${isDarkMode ? 'bg-yellow-900/20 border-yellow-500' : 'bg-yellow-50 border-yellow-400'}`}>
                              <p className={`text-sm font-medium ${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                                <span className="font-bold">NOTE:</span> {subsection.note}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Note */}
            
          </div>
        </div>
      </section>
    </div>
  );
}

