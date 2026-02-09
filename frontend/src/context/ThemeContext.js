"use client";

import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => { },
  setDarkMode: () => { },
});

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check localStorage for saved theme preference
    try {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        setIsDarkMode(savedTheme === "dark");
      } else {
        // Default to light mode (false) - no longer checking system preference
        setIsDarkMode(false);
      }
    } catch (e) {
      // localStorage not available
      console.log("localStorage not available");
      setIsDarkMode(false);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      // Update document class and localStorage
      if (isDarkMode) {
        document.documentElement.classList.add("dark");
        try {
          localStorage.setItem("theme", "dark");
        } catch (e) { }
      } else {
        document.documentElement.classList.remove("dark");
        try {
          localStorage.setItem("theme", "light");
        } catch (e) { }
      }
    }
  }, [isDarkMode, mounted]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const setDarkMode = (dark) => {
    setIsDarkMode(dark);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode: mounted ? isDarkMode : false, toggleTheme, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  return context;
}

// Backward compatibility exports for old DarkModeContext API
export const DarkModeProvider = ThemeProvider;

export function useDarkMode() {
  const { isDarkMode, toggleTheme } = useTheme();
  return {
    isDark: isDarkMode,
    toggleDarkMode: toggleTheme,
  };
}

