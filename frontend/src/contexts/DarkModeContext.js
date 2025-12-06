"use client";

import { createContext, useContext, useState, useEffect } from "react";

const DarkModeContext = createContext();

export function DarkModeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) {
      setIsDark(saved === "true");
    } else {
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(prefersDark);
    }
  }, []);

  useEffect(() => {
    // Update localStorage when dark mode changes
    localStorage.setItem("darkMode", isDark.toString());
    
    // Update HTML class - try both html and documentElement
    const htmlElement = document.documentElement;
    if (isDark) {
      htmlElement.classList.add("dark");
      htmlElement.setAttribute("class", htmlElement.className);
    } else {
      htmlElement.classList.remove("dark");
      htmlElement.setAttribute("class", htmlElement.className);
    }
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  return (
    <DarkModeContext.Provider value={{ isDark, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error("useDarkMode must be used within DarkModeProvider");
  }
  return context;
}

