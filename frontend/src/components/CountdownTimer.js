"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";
import { getCurrentTerm, parseDate, isCurrentlyInTerm } from "@/data/timelineData";

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [currentTerm, setCurrentTerm] = useState(null);
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

  // Calculate countdown to current term's end date - ONLY when currently in a term
  useEffect(() => {
    const calculateTimeLeft = () => {
      // Get the current active term
      const activeTerm = getCurrentTerm();
      
      if (!activeTerm) {
        // Not in any term, show zeros
        setCurrentTerm(null);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      // We're in a term, countdown to the end date of this term
      setCurrentTerm(activeTerm);
      
      const now = new Date();
      const endDate = parseDate(activeTerm.endDate);
      endDate.setHours(23, 59, 59, 999); // Set to end of the end date
      
      const difference = endDate - now;

      if (difference <= 0) {
        // Term has ended, show zeros
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const renderCircularTimer = (value, label, index) => {
    const isRed = index === 1 || index === 3; // Hours and Seconds are red
    const color = isRed ? '#EF4444' : '#9333EA'; // Red or Purple
    const circumference = 2 * Math.PI * 45; // radius = 45
    
    // Calculate progress based on remaining time
    let progress = 0;
    if (index === 0) { // Days
      progress = (value / 30) * 100; // Assuming max 30 days
    } else if (index === 1) { // Hours
      progress = (value / 24) * 100;
    } else if (index === 2) { // Minutes
      progress = (value / 60) * 100;
    } else { // Seconds
      progress = (value / 60) * 100;
    }
    
    // Clamp progress between 0 and 100
    progress = Math.min(100, Math.max(0, progress));
    
    return (
      <div 
        className={`flex flex-col items-center ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
        style={{ animationDelay: `${0.1 + index * 0.1}s` }}
      >
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 flex items-center justify-center">
          {/* Circular Progress Bar */}
          <svg className="absolute inset-0 transform -rotate-90 w-full h-full">
            <circle
              cx="50%"
              cy="50%"
              r="40%"
              stroke="#E5E7EB"
              strokeWidth="6"
              fill="none"
            />
            <circle
              cx="50%"
              cy="50%"
              r="40%"
              stroke={color}
              strokeWidth="6"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress / 100)}
              strokeLinecap="round"
            />
          </svg>
          {/* Number */}
          <div className="relative z-10">
            <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
              {String(value).padStart(2, "0")}
            </div>
          </div>
        </div>
        {/* Label */}
        <div className="text-xs sm:text-sm md:text-base mt-1 sm:mt-2 font-medium" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>{label}</div>
      </div>
    );
  };

  return (
    <section 
      ref={sectionRef}
      className="py-8 sm:py-12 lg:py-16 relative overflow-hidden"
      style={{
        background: isDarkMode ? '#03002e' : 'linear-gradient(90deg, #010080 0%, #6766B3 100%)'
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`text-center mb-6 sm:mb-8 md:mb-12 ${isVisible ? 'animate-fade-in-down' : 'opacity-0'}`}>
          <h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-2 sm:mb-3">
            Next Time Stream Start in
          </h2>
          {currentTerm ? (
            <p className="text-white text-sm sm:text-base md:text-lg px-4 sm:px-0">
              {currentTerm.termSerial} ends on {currentTerm.endDate}
            </p>
          ) : (
            <p className="text-white text-sm sm:text-base md:text-lg px-4 sm:px-0">
              No active term
            </p>
          )}
        </div>
        
        {/* White Card with Countdown Timers */}
        <div className={`rounded-xl shadow-lg p-4 sm:p-6 md:p-8 lg:p-12 max-w-4xl mx-auto ${isVisible ? 'animate-scale-in' : 'opacity-0'} ${isDarkMode ? 'bg-[#03002e]' : 'bg-white'}`} style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-12">
            {renderCircularTimer(timeLeft.days, "Days", 0)}
            {renderCircularTimer(timeLeft.hours, "Hours", 1)}
            {renderCircularTimer(timeLeft.minutes, "Minutes", 2)}
            {renderCircularTimer(timeLeft.seconds, "Seconds", 3)}
          </div>
        </div>
      </div>
    </section>
  );
}
