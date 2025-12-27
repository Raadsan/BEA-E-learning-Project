"use client";

import { useState } from "react";
import { useDarkMode } from "@/context/ThemeContext";

export default function TutorialsPage() {
  const { isDark } = useDarkMode();
  const [tutorials] = useState([]);

  const bg = isDark ? "bg-gray-900" : "bg-gray-100";
  const card = isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900";

  return (
    <div className={`min-h-screen transition-colors ${bg}`}>
      <div className="py-6">
        <div className={`mb-6 p-6 rounded-xl shadow ${card}`}>
          <h1 className="text-2xl font-bold mb-2">Tutorials</h1>
          <p className={isDark ? "text-gray-300" : "text-gray-600"}>
            Access helpful tutorials and guides to enhance your learning experience.
          </p>
        </div>

        {tutorials.length === 0 ? (
          <div className={`p-6 rounded-xl shadow ${card} text-center`}>
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
              No tutorials available at the moment. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutorials.map((tutorial) => (
              <div key={tutorial.id} className={`p-6 rounded-xl shadow ${card} hover:shadow-lg transition-shadow`}>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                  {tutorial.title}
                </h3>
                <p className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  {tutorial.description}
                </p>
                <button className="px-4 py-2 bg-[#010080] text-white rounded-lg text-sm font-medium hover:bg-[#0200a0] transition-colors">
                  View Tutorial
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

