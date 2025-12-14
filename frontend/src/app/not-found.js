"use client";

import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

export default function NotFound() {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="text-center px-4">
        <div className="mb-8">
          <h1 className={`text-9xl font-bold ${isDarkMode ? 'text-gray-700' : 'text-gray-300'}`}>404</h1>
          <h2 className={`text-3xl font-semibold mt-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Page Not Found
          </h2>
          <p className={`text-lg mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Sorry, the page you are looking for does not exist.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-[#010080] hover:bg-[#010080]/90 text-white'
            }`}
          >
            Go to Homepage
          </Link>
          <button
            onClick={() => window.history.back()}
            className={`px-6 py-3 rounded-lg font-medium transition-colors border ${
              isDarkMode
                ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

