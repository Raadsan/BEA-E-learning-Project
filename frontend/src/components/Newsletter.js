"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";

export default function Newsletter() {
  const [email, setEmail] = useState("");
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Subscribed:", email);
    setEmail("");
  };

  return (
    <section ref={sectionRef} className={`py-12 sm:py-16 lg:py-20 overflow-hidden ${isDarkMode ? 'bg-[#03002e]' : 'bg-white'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-center mb-3 sm:mb-4 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
            Subscribe to our newsletter
          </h2>
          
          <p className={`text-sm sm:text-base lg:text-lg text-center mb-6 sm:mb-8 max-w-2xl mx-auto px-4 sm:px-0 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'} ${isDarkMode ? 'text-white' : 'text-gray-700'}`} style={{ animationDelay: '0.1s' }}>
            Join 50,000+ students who are already improving their English skills with EnglishMaster. Start your free trial and see results in weeks, not years.
          </p>
          
          <form onSubmit={handleSubmit} className={`max-w-2xl mx-auto flex flex-col sm:flex-row gap-2 sm:gap-3 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className={`header-search-input flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-sm sm:text-base ${isDarkMode ? 'text-gray-800 placeholder-gray-500' : 'bg-gray-100 text-gray-800 placeholder-gray-400 focus:bg-white'}`}
              style={isDarkMode ? { backgroundColor: 'white' } : {}}
              required
            />
            <button
              type="submit"
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:scale-105 transition-all duration-300 whitespace-nowrap text-sm sm:text-base ${isDarkMode ? 'bg-white header-keep-white text-[#010080] hover:bg-gray-100' : 'bg-blue-800 text-white hover:bg-blue-900'}`}
            >
              Subscribe Now
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

