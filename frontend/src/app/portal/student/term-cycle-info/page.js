"use client";

import { useState } from "react";
import { useDarkMode } from "@/context/ThemeContext";

export default function TermCycleInfoPage() {
  const { isDark } = useDarkMode();
  const [termInfo] = useState(null);

  const bg = isDark ? "bg-gray-900" : "bg-gray-100";
  const card = isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900";

  return (
    <div className={`min-h-screen transition-colors ${bg}`}>
      <div className="py-6">
        <div className={`mb-6 p-6 rounded-xl shadow ${card}`}>
          <h1 className="text-2xl font-bold mb-2">Term Cycle Information</h1>
          <p className={isDark ? "text-gray-300" : "text-gray-600"}>
            View information about your current term cycle, dates, and important deadlines.
          </p>
        </div>

        {!termInfo ? (
          <div className={`p-6 rounded-xl shadow ${card} text-center`}>
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
              No term cycle information available at the moment.
            </p>
          </div>
        ) : (
          <div className={`p-6 rounded-xl shadow ${card}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className={`text-sm font-semibold mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>Current Term</h3>
                <p className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{termInfo.term || "N/A"}</p>
              </div>
              <div>
                <h3 className={`text-sm font-semibold mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>Start Date</h3>
                <p className={`text-lg ${isDark ? "text-white" : "text-gray-900"}`}>{termInfo.startDate ? new Date(termInfo.startDate).toLocaleDateString() : "N/A"}</p>
              </div>
              <div>
                <h3 className={`text-sm font-semibold mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>End Date</h3>
                <p className={`text-lg ${isDark ? "text-white" : "text-gray-900"}`}>{termInfo.endDate ? new Date(termInfo.endDate).toLocaleDateString() : "N/A"}</p>
              </div>
              <div>
                <h3 className={`text-sm font-semibold mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>Status</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${termInfo.status === "active" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"}`}>
                  {termInfo.status || "N/A"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

