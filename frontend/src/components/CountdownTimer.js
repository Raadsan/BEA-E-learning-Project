"use client";

import { useState, useEffect } from "react";

export default function CountdownTimer() {
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

  return (
    <section 
      className="py-16 sm:py-20 lg:py-24 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #010080 0%, #4a148c 50%, #6a1b9a 100%)'
      }}
    >
      {/* Decorative wavy lines in bottom right */}
      <div className="absolute bottom-0 right-0 w-64 h-64 opacity-20">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <path
            d="M0,100 Q50,50 100,100 T200,100"
            stroke="white"
            strokeWidth="2"
            fill="none"
            className="opacity-30"
          />
          <path
            d="M0,120 Q50,70 100,120 T200,120"
            stroke="white"
            strokeWidth="2"
            fill="none"
            className="opacity-20"
          />
        </svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h2 className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-12 sm:mb-16">
          Next Time Stream Start in
        </h2>
        
        <div className="flex flex-wrap justify-center gap-6 sm:gap-8 lg:gap-10">
          {/* Days */}
          <div className="flex flex-col items-center">
            <div 
              className="rounded-xl p-6 sm:p-8 lg:p-10 text-center min-w-[100px] sm:min-w-[120px] lg:min-w-[140px] shadow-lg"
              style={{
                background: 'rgba(106, 27, 154, 0.4)',
                boxShadow: '0 8px 32px rgba(106, 27, 154, 0.3), 0 0 20px rgba(106, 27, 154, 0.2)'
              }}
            >
              <div className="text-white text-4xl sm:text-5xl lg:text-6xl font-bold">
                {String(timeLeft.days).padStart(2, "0")}
              </div>
            </div>
            <div className="text-white text-sm sm:text-base mt-3 font-medium">Days</div>
          </div>
          
          {/* Hours */}
          <div className="flex flex-col items-center">
            <div 
              className="rounded-xl p-6 sm:p-8 lg:p-10 text-center min-w-[100px] sm:min-w-[120px] lg:min-w-[140px] shadow-lg"
              style={{
                background: 'rgba(106, 27, 154, 0.4)',
                boxShadow: '0 8px 32px rgba(106, 27, 154, 0.3), 0 0 20px rgba(106, 27, 154, 0.2)'
              }}
            >
              <div className="text-white text-4xl sm:text-5xl lg:text-6xl font-bold">
                {String(timeLeft.hours).padStart(2, "0")}
              </div>
            </div>
            <div className="text-white text-sm sm:text-base mt-3 font-medium">Hours</div>
          </div>
          
          {/* Minutes */}
          <div className="flex flex-col items-center">
            <div 
              className="rounded-xl p-6 sm:p-8 lg:p-10 text-center min-w-[100px] sm:min-w-[120px] lg:min-w-[140px] shadow-lg"
              style={{
                background: 'rgba(106, 27, 154, 0.4)',
                boxShadow: '0 8px 32px rgba(106, 27, 154, 0.3), 0 0 20px rgba(106, 27, 154, 0.2)'
              }}
            >
              <div className="text-white text-4xl sm:text-5xl lg:text-6xl font-bold">
                {String(timeLeft.minutes).padStart(2, "0")}
              </div>
            </div>
            <div className="text-white text-sm sm:text-base mt-3 font-medium">Minutes</div>
          </div>
          
          {/* Seconds */}
          <div className="flex flex-col items-center">
            <div 
              className="rounded-xl p-6 sm:p-8 lg:p-10 text-center min-w-[100px] sm:min-w-[120px] lg:min-w-[140px] shadow-lg"
              style={{
                background: 'rgba(106, 27, 154, 0.4)',
                boxShadow: '0 8px 32px rgba(106, 27, 154, 0.3), 0 0 20px rgba(106, 27, 154, 0.2)'
              }}
            >
              <div className="text-white text-4xl sm:text-5xl lg:text-6xl font-bold">
                {String(timeLeft.seconds).padStart(2, "0")}
              </div>
            </div>
            <div className="text-white text-sm sm:text-base mt-3 font-medium">Seconds</div>
          </div>
        </div>
      </div>
    </section>
  );
}
