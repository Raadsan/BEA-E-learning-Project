"use client";

import { useEffect, useState } from "react";

export default function SecurityWrapper({ children }) {
  const [isBlurred, setIsBlurred] = useState(false);

  useEffect(() => {
    // Prevent Print Screen & Developer Tools Shortcuts
    const handleKeyDown = (e) => {
      // Print Screen
      if (e.key === "PrintScreen") {
        navigator.clipboard.writeText("");
        setIsBlurred(true);
        setTimeout(() => setIsBlurred(false), 3000);
      }
      
      // Prevent Ctrl+P (Print), Ctrl+S (Save), F12, Ctrl+Shift+I (DevTools)
      if (
        (e.ctrlKey && (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S')) || 
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
        (e.ctrlKey && (e.key === 'U' || e.key === 'u'))
      ) {
        e.preventDefault();
      }
    };

    // Blur screen when app loses focus (prevents background screen recording tools)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsBlurred(true);
      } else {
        setIsBlurred(false);
      }
    };

    // Add event listeners
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      // Cleanup
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div 
      className={`min-h-screen transition-all duration-200 ${isBlurred ? "blur-xl select-none opacity-20" : ""}`}
    >
      {children}
      
      {isBlurred && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80">
          <p className="text-white text-2xl font-bold p-8 bg-red-600 rounded-xl">
            Screenshots and Screen Recording are strictly prohibited!
          </p>
        </div>
      )}
    </div>
  );
}
