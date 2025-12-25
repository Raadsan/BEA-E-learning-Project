"use client";

import { useState } from "react";
import { useDarkMode } from "@/context/ThemeContext";

export default function ProgressReportPage() {
  const { isDark } = useDarkMode();
  const [reports] = useState([]);

  const bg = isDark ? "bg-gray-900" : "bg-gray-100";
  const card = isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900";

  return (
    <div className={`min-h-screen transition-colors ${bg}`}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
        <div className={`mb-6 p-6 rounded-xl shadow ${card}`}>
          <h1 className="text-2xl font-bold mb-2">Progress Report</h1>
          <p className={isDark ? "text-gray-300" : "text-gray-600"}>
            Track your academic progress and performance across all courses.
          </p>
        </div>

        {reports.length === 0 ? (
          <div className={`p-6 rounded-xl shadow ${card} text-center`}>
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
              No progress reports available at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className={`p-6 rounded-xl shadow ${card}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {report.course}
                    </h3>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      {report.period || "N/A"}
                    </p>
                  </div>
                  <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    {report.date ? new Date(report.date).toLocaleDateString() : "N/A"}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>Overall Grade</p>
                    <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {report.overallGrade || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>Attendance</p>
                    <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {report.attendance || "N/A"}%
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>Assignments</p>
                    <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {report.assignments || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>Tests</p>
                    <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {report.tests || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

