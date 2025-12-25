"use client";

import { useState } from "react";
import { useDarkMode } from "@/context/ThemeContext";

export default function ResourcesPage() {
  const { isDark } = useDarkMode();
  const [resources] = useState([]);

  const bg = isDark ? "bg-gray-900" : "bg-gray-100";
  const card = isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900";

  return (
    <div className={`min-h-screen transition-colors ${bg}`}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
        <div className={`mb-6 p-6 rounded-xl shadow ${card}`}>
          <h1 className="text-2xl font-bold mb-2">Resources</h1>
          <p className={isDark ? "text-gray-300" : "text-gray-600"}>
            Access learning materials, documents, and resources for your courses.
          </p>
        </div>

        {resources.length === 0 ? (
          <div className={`p-6 rounded-xl shadow ${card} text-center`}>
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
              No resources available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <div key={resource.id} className={`p-6 rounded-xl shadow ${card} hover:shadow-lg transition-shadow`}>
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-8 h-8 text-[#010080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {resource.name}
                    </h3>
                    <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      {resource.type || "File"}
                    </p>
                  </div>
                </div>
                <p className={`text-sm mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  {resource.description}
                </p>
                <button className="w-full px-4 py-2 bg-[#010080] text-white rounded-lg text-sm font-medium hover:bg-[#0200a0] transition-colors">
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

