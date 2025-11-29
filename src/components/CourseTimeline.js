"use client";

import { useEffect, useRef, useState } from "react";

export default function CourseTimeline() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

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

  const timelineData = [
    { 
      course: "BEA - 01", 
      startDate: "Dec 2, 2025", 
      endDate: "Dec 2, 2025", 
      schedule: "Mon, Wed, Fri",
      lessons: "45 lessons"
    },
    { 
      course: "BEA - 02", 
      startDate: "Dec 2, 2025", 
      endDate: "Dec 2, 2025", 
      schedule: "Mon, Wed, Fri",
      lessons: "45 lessons"
    },
    { 
      course: "BEA - 03", 
      startDate: "Dec 2, 2025", 
      endDate: "Dec 2, 2025", 
      schedule: "Mon, Wed, Fri",
      lessons: "45 lessons"
    },
    { 
      course: "BEA - 04", 
      startDate: "Dec 2, 2025", 
      endDate: "Dec 2, 2025", 
      schedule: "Mon, Wed, Fri",
      lessons: "45 lessons"
    },
    { 
      course: "BEA - 05", 
      startDate: "Dec 2, 2025", 
      endDate: "Dec 2, 2025", 
      schedule: "Mon, Wed, Fri",
      lessons: "45 lessons"
    },
    { 
      course: "BEA - 06", 
      startDate: "Dec 2, 2025", 
      endDate: "Dec 2, 2025", 
      schedule: "Mon, Wed, Fri",
      lessons: "45 lessons"
    },
    { 
      course: "BEA - 07", 
      startDate: "Dec 2, 2025", 
      endDate: "Dec 2, 2025", 
      schedule: "Mon, Wed, Fri",
      lessons: "45 lessons"
    },
    { 
      course: "BEA - 08", 
      startDate: "Dec 2, 2025", 
      endDate: "Dec 2, 2025", 
      schedule: "Mon, Wed, Fri",
      lessons: "45 lessons"
    },
  ];

  return (
    <section ref={sectionRef} className="bg-gray-50 py-12 sm:py-16 lg:py-20 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className={`mb-8 sm:mb-10 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h2 className="text-gray-900 text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-3">
              Course Timeline
            </h2>
            <p className="text-gray-700 text-base sm:text-lg">
              Plan ahead with our comprehensive course calendar. All courses include recorded sessions if you miss a live class.
            </p>
          </div>
          
          <div className={`overflow-hidden border border-gray-200 ${isVisible ? 'animate-scale-in' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#dc2626' }}>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-white border-r border-red-700">
                      Course
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-white border-r border-red-700">
                      Start Date
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-white border-r border-red-700">
                      End Date
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-white border-r border-red-700">
                      Schedule
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-white">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {timelineData.map((item, index) => (
                    <tr 
                      key={index} 
                      className={`border-b border-gray-200 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-blue-50/30"
                      } hover:bg-blue-50`}
                    >
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap border-r border-gray-200">
                        <span className="text-blue-900 font-semibold text-xs sm:text-sm">{item.course}</span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap border-r border-gray-200">
                        <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{item.startDate}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap border-r border-gray-200">
                        <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{item.endDate}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 border-r border-gray-200">
                        <div className="text-gray-600 text-xs sm:text-sm">
                          <div>{item.schedule}</div>
                          <div className="text-gray-500">{item.lessons}</div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <button className="bg-blue-800 text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors text-xs sm:text-sm font-semibold">
                          Book now
                        </button>
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
  );
}
