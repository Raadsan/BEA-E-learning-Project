"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/components/Toast";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const sectionRef = useRef(null);
  const { isDarkMode } = useTheme();

  const { showToast } = useToast();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast("Subscribe successfully!", "success");
        setIsSubscribed(true);
        setEmail("");
      } else {
        showToast(data.error || "Subscription failed", "error");
      }
    } catch (error) {
      console.error("Newsletter error:", error);
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
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

          {!isSubscribed ? (
            <form onSubmit={handleSubmit} className={`max-w-2xl mx-auto flex flex-col sm:flex-row gap-2 sm:gap-3 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                disabled={isLoading}
                className={`header-search-input flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-sm sm:text-base ${isDarkMode ? 'text-gray-800 placeholder-gray-500' : 'bg-gray-100 text-gray-800 placeholder-gray-400 focus:bg-white'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={isDarkMode ? { backgroundColor: 'white' } : {}}
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:scale-105 transition-all duration-300 whitespace-nowrap text-sm sm:text-base flex items-center justify-center min-w-[140px] ${isDarkMode ? 'bg-white header-keep-white text-[#010080] hover:bg-gray-100' : 'bg-blue-800 text-white hover:bg-blue-900'} ${isLoading ? 'opacity-80 cursor-not-allowed transform-none' : ''}`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Subscribing...
                  </>
                ) : "Subscribe Now"}
              </button>
            </form>
          ) : (
            <div className={`max-w-2xl mx-auto p-6 rounded-lg border-2 border-dashed text-center animate-fade-in-up ${isDarkMode ? 'bg-blue-900/20 border-blue-800 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
              <svg className="w-12 h-12 mx-auto mb-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-bold mb-2">Thank you for subscribing!</h3>
              <p className="text-sm opacity-90 text-balance">We've added your email to our list. Stay tuned for the latest updates and English learning tips!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

