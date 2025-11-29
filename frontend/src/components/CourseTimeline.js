"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function CourseTimeline() {
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.1 });
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
    <section ref={ref} className="bg-gray-50 py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className={`mb-6 sm:mb-8 lg:mb-10 transition-all duration-700 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
            <h2 className="text-gray-900 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-2 sm:mb-3">
              Course Timeline
            </h2>
            <p className="text-gray-700 text-sm sm:text-base lg:text-lg">
              Plan ahead with our comprehensive course calendar. All courses include recorded sessions if you miss a live class.
            </p>
          </div>
          
          <div className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-700 delay-200 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-700">
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {timelineData.map((item, index) => (
                  <tr 
                    key={index} 
                    className={`transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50`}
                  >
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className="text-gray-900 font-bold text-sm sm:text-base">{item.course}</span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-gray-900 font-medium text-xs sm:text-sm">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{item.startDate}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-gray-900 font-medium text-xs sm:text-sm">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{item.endDate}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="text-gray-700 text-xs sm:text-sm">
                        <div>{item.schedule}</div>
                        <div className="text-gray-600">{item.lessons}</div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <button className="bg-blue-800 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-blue-900 transition-colors text-xs sm:text-sm font-semibold">
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