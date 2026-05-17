"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";

export default function EventsNews() {
  const { isDarkMode } = useTheme();
  const [visibleSections, setVisibleSections] = useState({});
  const [activeTab, setActiveTab] = useState("upcoming");
  const sectionRefs = {
    hero: useRef(null),
    content: useRef(null),
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

  const upcomingEvents = [
    {
      id: 1,
      title: "BEA Open Day 2025",
      description: "Join us for a campus tour, meet our teachers, and learn about our programs. Free placement tests available!",
      date: "December 15, 2025",
      time: "9:00 AM - 4:00 PM",
      location: "BEA Campus, Taleex",
      type: "Open Day",
      color: "blue"
    },
    {
      id: 2,
      title: "IELTS Preparation Workshop",
      description: "A comprehensive one-day workshop covering all four IELTS modules with expert tips and practice sessions.",
      date: "December 20, 2025",
      time: "10:00 AM - 3:00 PM",
      location: "Virtual (Zoom)",
      type: "Workshop",
      color: "green"
    },
    {
      id: 3,
      title: "New Term Registration Opens",
      description: "Registration for the January 2026 term begins. Early bird discounts available for the first 50 students!",
      date: "January 5, 2026",
      time: "8:00 AM onwards",
      location: "Online & On-campus",
      type: "Registration",
      color: "purple"
    },
    {
      id: 4,
      title: "English Speaking Competition",
      description: "Annual inter-class English speaking competition. Showcase your fluency and win exciting prizes!",
      date: "January 15, 2026",
      time: "2:00 PM - 6:00 PM",
      location: "BEA Auditorium",
      type: "Competition",
      color: "red"
    }
  ];

  const news = [
    {
      id: 1,
      title: "BEA Celebrates 500+ Successful IELTS Graduates",
      excerpt: "We are proud to announce that over 500 students have successfully achieved their target IELTS scores through our preparation program.",
      date: "November 30, 2025",
      category: "Achievement"
    },
    {
      id: 2,
      title: "New Digital Literacy Program Launched",
      excerpt: "BEA introduces a comprehensive Digital Literacy and Virtual Communication Skills program to prepare students for the modern workplace.",
      date: "November 25, 2025",
      category: "New Program"
    },
    {
      id: 3,
      title: "Partnership with Oxford University Press",
      excerpt: "BEA continues its partnership with Oxford University Press, bringing the latest English File 4th Edition materials to our classrooms.",
      date: "November 20, 2025",
      category: "Partnership"
    },
    {
      id: 4,
      title: "BEA Student Wins Regional English Competition",
      excerpt: "Congratulations to Fatima Ahmed, a Level 6 student, who won first place in the Regional English Speaking Competition.",
      date: "November 15, 2025",
      category: "Student Achievement"
    },
    {
      id: 5,
      title: "Extended Evening Classes Now Available",
      excerpt: "To accommodate working professionals, BEA now offers extended evening classes from 6:00 PM to 9:00 PM.",
      date: "November 10, 2025",
      category: "Announcement"
    }
  ];

  const getEventColor = (color) => {
    const colors = {
      blue: isDarkMode ? 'bg-blue-600/20 text-blue-400 border-blue-500' : 'bg-blue-100 text-blue-700 border-blue-300',
      green: isDarkMode ? 'bg-green-600/20 text-green-400 border-green-500' : 'bg-green-100 text-green-700 border-green-300',
      purple: isDarkMode ? 'bg-purple-600/20 text-purple-400 border-purple-500' : 'bg-purple-100 text-purple-700 border-purple-300',
      red: isDarkMode ? 'bg-red-600/20 text-red-400 border-red-500' : 'bg-red-100 text-red-700 border-red-300',
    };
    return colors[color] || colors.blue;
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 ${visibleSections.hero ? 'animate-fade-in-down' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
            Events & News
          </h1>
          <p className={`text-base sm:text-lg text-white/90 max-w-2xl mx-auto ${visibleSections.hero ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            Stay updated with the latest happenings at Blueprint English Academy
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section ref={sectionRefs.content} className={`py-10 sm:py-14 ${isDarkMode ? 'bg-[#03002e]' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tab Buttons */}
          <div className={`flex justify-center gap-4 mb-8 sm:mb-12 ${visibleSections.content ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === "upcoming"
                  ? isDarkMode 
                    ? 'bg-white text-[#010080]' 
                    : 'bg-[#010080] text-white'
                  : isDarkMode
                    ? 'bg-[#050040] text-gray-300 hover:bg-[#060050]'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                Upcoming Events
              </span>
            </button>
            <button
              onClick={() => setActiveTab("news")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === "news"
                  ? isDarkMode 
                    ? 'bg-white text-[#010080]' 
                    : 'bg-[#010080] text-white'
                  : isDarkMode
                    ? 'bg-[#050040] text-gray-300 hover:bg-[#060050]'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
                </svg>
                Latest News
              </span>
            </button>
          </div>

          {/* Upcoming Events */}
          {activeTab === "upcoming" && (
            <div className="max-w-4xl mx-auto space-y-6">
              {upcomingEvents.map((event, index) => (
                <div 
                  key={event.id}
                  className={`rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl ${isDarkMode ? 'bg-[#050040]' : 'bg-white'} ${visibleSections.content ? 'animate-fade-in-up' : 'opacity-0'}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Date Badge */}
                    <div className={`md:w-32 p-4 md:p-6 flex md:flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r ${isDarkMode ? 'bg-[#03002e] border-[#1a1a3e]' : 'bg-gray-50 border-gray-200'}`}>
                      <div className={`text-3xl md:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-[#010080]'}`}>
                        {event.date.split(' ')[1].replace(',', '')}
                      </div>
                      <div className={`text-sm md:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {event.date.split(' ')[0]}
                      </div>
                    </div>
                    
                    {/* Event Content */}
                    <div className="flex-1 p-5 md:p-6">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getEventColor(event.color)}`}>
                          {event.type}
                        </span>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {event.time}
                        </span>
                      </div>
                      <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {event.title}
                      </h3>
                      <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {event.description}
                      </p>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                          </svg>
                          {event.location}
                        </div>
                        <button className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors header-keep-white ${isDarkMode ? 'bg-white text-[#010080] hover:bg-gray-100' : 'bg-[#010080] text-white hover:bg-[#010060]'}`}>
                          Register Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Latest News */}
          {activeTab === "news" && (
            <div className="max-w-4xl mx-auto space-y-6">
              {news.map((item, index) => (
                <div 
                  key={item.id}
                  className={`rounded-2xl p-5 md:p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isDarkMode ? 'bg-[#050040]' : 'bg-white'} ${visibleSections.content ? 'animate-fade-in-up' : 'opacity-0'}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${isDarkMode ? 'bg-red-600/20 text-red-400' : 'bg-red-100 text-red-700'}`}>
                      {item.category}
                    </span>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {item.date}
                    </span>
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {item.title}
                  </h3>
                  <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.excerpt}
                  </p>
                  <button className={`text-sm font-semibold flex items-center gap-1 transition-colors ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-[#010080] hover:text-blue-700'}`}>
                    Read Full Story
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Subscribe Section */}
          <div className={`mt-12 sm:mt-16 max-w-2xl mx-auto text-center p-6 sm:p-8 rounded-2xl ${isDarkMode ? 'bg-[#050040]' : 'bg-white'} ${visibleSections.content ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.5s' }}>
            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 ${isDarkMode ? 'bg-blue-600/20' : 'bg-blue-100'}`}>
              <svg className={`w-7 h-7 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </div>
            <h3 className={`text-xl sm:text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Stay Updated
            </h3>
            <p className={`text-sm sm:text-base mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Subscribe to our newsletter to receive the latest news and event updates directly to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className={`flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 header-search-input ${isDarkMode ? 'bg-white text-gray-800 placeholder-gray-500 border border-gray-200' : 'bg-gray-100 text-gray-800 placeholder-gray-400'}`}
              />
              <button className={`px-6 py-3 rounded-lg font-semibold transition-colors header-keep-white ${isDarkMode ? 'bg-white text-[#010080] hover:bg-gray-100' : 'bg-[#010080] text-white hover:bg-[#010060]'}`}>
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

