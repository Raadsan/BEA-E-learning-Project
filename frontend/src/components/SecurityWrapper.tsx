"use client";

import { useEffect } from "react";

export default function SecurityWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only apply desktop keyboard shortcuts prevention (PrintScreen, DevTools keys)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Print Screen
      if (e.key === "PrintScreen") {
        try {
          navigator.clipboard.writeText("");
        } catch (_) {
          // ignore
        }
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

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="min-h-screen" suppressHydrationWarning>
      {children}
    </div>
  );
}
