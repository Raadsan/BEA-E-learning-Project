"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { normalizeTimelineRecords } from "@/lib/timelineData";
import { API_URL } from "@/constants";

type TimelineRecord = ReturnType<typeof normalizeTimelineRecords>[number];

export default function CourseTimeline() {
  const [isVisible, setIsVisible] = useState(false);
  const [timelineData, setTimelineData] = useState<TimelineRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sectionRef = useRef(null);
  const { isDarkMode } = useTheme();

  // Only show active timeline records returned by the database API.
  useEffect(() => {
    let active = true;

    const fetchTimelineData = async () => {
      try {
        const response = await fetch(`${API_URL}/course-timeline`);

        if (!response.ok) {
          if (active) {
            setTimelineData([]);
            setError("Unable to load timeline data. Please try again later.");
          }
          return;
        }

        const data = await response.json();
        if (!active) return;

        const finalData = normalizeTimelineRecords(Array.isArray(data) ? data : []);
        setTimelineData(finalData);
        setError(null);
      } catch {
        if (active) {
          setTimelineData([]);
          setError("Unable to load timeline data. Please try again later.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchTimelineData();

    return () => {
      active = false;
    };
  }, []);

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

  return (
    <section ref={sectionRef} className={`py-12 sm:py-16 lg:py-20 overflow-hidden ${isDarkMode ? 'bg-[#04003a]' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className={`mb-8 sm:mb-10 text-center ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-3" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
              Course Timeline
            </h2>
            <p className={`text-base sm:text-lg ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
              Plan ahead with our comprehensive course calendar. All courses include recorded sessions if you miss a live class.
            </p>
          </div>

          <div className={`overflow-hidden border ${isDarkMode ? 'border-[#1a1a3e]' : 'border-gray-200'} ${isVisible ? 'animate-scale-in' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className={`text-lg ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                  Unable to load timeline data. Please try again later.
                </p>
              </div>
            ) : timelineData.length === 0 ? (
              <div className="p-8 text-center">
                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No course timeline data is available yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full" style={{ tableLayout: 'fixed' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#010080' }}>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-white border-r border-blue-900" style={{ width: '25%' }}>
                        Term Serial Number
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-white border-r border-blue-900" style={{ width: '25%' }}>
                        Start Date
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-white border-r border-blue-900" style={{ width: '25%' }}>
                        End Date
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-white" style={{ width: '25%' }}>
                        Holidays
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {timelineData.map((item, index) => (
                      <tr
                        key={index}
                        className="bg-white"
                      >
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap border-r border-blue-900 bg-[#010080]">
                          <span className="font-bold text-xs sm:text-sm text-white">{item.termSerial}</span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap border-r border-b border-gray-200">
                          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-600">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="font-bold">{item.startDate}</span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap border-r border-b border-gray-200">
                          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-600">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="font-bold">{item.endDate}</span>
                          </div>
                        </td>
                        {(item.holidayRowspan === undefined || item.holidayRowspan !== 0) && (
                          <td
                            className="px-4 sm:px-6 py-4 border-b border-gray-200"
                            rowSpan={item.holidayRowspan && item.holidayStartRow ? item.holidayRowspan : 1}
                          >
                            {item.holidays ? (
                              <div className="text-xs sm:text-sm leading-relaxed font-bold text-gray-600">
                                {item.holidays}
                              </div>
                            ) : (
                              <div className="text-xs sm:text-sm text-gray-400">&nbsp;</div>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
