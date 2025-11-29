"use client";

import { useState, useEffect } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function CountdownTimer() {
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.2 });
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 20,
    minutes: 59,
    seconds: 45,
  });

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
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Circular Progress Bar */}
          <svg className="absolute inset-0 transform -rotate-90" width="128" height="128">
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke="#E5E7EB"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke={color}
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress / 100)}
              strokeLinecap="round"
            />
          </svg>
          {/* Number */}
          <div className="relative z-10">
            <div className="text-black text-4xl sm:text-5xl font-bold">
              {String(value).padStart(2, "0")}
            </div>
          </div>
        </div>
        {/* Label */}
        <div className="text-black text-sm sm:text-base mt-2 font-medium">{label}</div>
      </div>
    );
  };

  return (
    <section 
      ref={ref}
      className="py-8 sm:py-12 lg:py-16 relative overflow-hidden"
      style={{
        background: 'linear-gradient(90deg, #010080 0%, #6766B3 100%)'
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`text-center mb-8 sm:mb-12 transition-all duration-700 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
          <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-3">
            Next Time Stream Start in
          </h2>
          <p className="text-white text-base sm:text-lg">
            Get ready! Something exciting is about to drop.
          </p>
        </div>
        
        {/* White Card with Countdown Timers */}
        <div className={`bg-white rounded-xl shadow-lg p-8 sm:p-12 max-w-4xl mx-auto transition-all duration-700 delay-200 ${isVisible ? 'animate-scale-in opacity-100' : 'opacity-0'}`}>
          <div className="flex flex-wrap justify-center gap-8 sm:gap-12 lg:gap-16">
            {[timeLeft.days, timeLeft.hours, timeLeft.minutes, timeLeft.seconds].map((value, index) => {
              const labels = ["Days", "Hours", "Minutes", "Seconds"];
              return (
                <div 
                  key={index}
                  className={`transition-all duration-700 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  {renderCircularTimer(value, labels[index], index)}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
