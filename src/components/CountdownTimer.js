"use client";

import { useState, useEffect, useRef } from "react";

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 20,
    minutes: 59,
    seconds: 45,
  });
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

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              hours = 23;
              if (days > 0) {
                days--;
              }
            }
          }
        }

        return { days, hours, minutes, seconds };
      });
    }, 1000);

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
            <div className="text-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
              {String(value).padStart(2, "0")}
            </div>
          </div>
        </div>
        {/* Label */}
        <div className="text-black text-xs sm:text-sm md:text-base mt-1 sm:mt-2 font-medium">{label}</div>
      </div>
    );
  };

  return (
    <section 
      ref={sectionRef}
      className="py-8 sm:py-12 lg:py-16 relative overflow-hidden"
      style={{
        background: 'linear-gradient(90deg, #010080 0%, #6766B3 100%)'
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`text-center mb-6 sm:mb-8 md:mb-12 ${isVisible ? 'animate-fade-in-down' : 'opacity-0'}`}>
          <h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-2 sm:mb-3">
            Next Time Stream Start in
          </h2>
          <p className="text-white text-sm sm:text-base md:text-lg px-4 sm:px-0">
            Get ready! Something exciting is about to drop.
          </p>
        </div>
        
        {/* White Card with Countdown Timers */}
        <div className={`bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 lg:p-12 max-w-4xl mx-auto ${isVisible ? 'animate-scale-in' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
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
