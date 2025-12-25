"use client";

import { useState } from "react";
import { useDarkMode } from "@/context/ThemeContext";

export default function GradesPage() {
  const { isDark } = useDarkMode();
  const [grades] = useState([]);

  const bg = isDark ? "bg-gray-900" : "bg-gray-100";
  const card = isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900";

  return (
    <div className={`min-h-screen transition-colors ${bg}`}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
        <div className={`mb-6 p-6 rounded-xl shadow ${card}`}>
          <h1 className="text-2xl font-bold mb-2">Grades</h1>
          <p className={isDark ? "text-gray-300" : "text-gray-600"}>
            View all your grades and academic performance.
          </p>
        </div>

        {grades.length === 0 ? (
          <div className={`p-6 rounded-xl shadow ${card} text-center`}>
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
              No grades available at the moment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl shadow">
            <table className="w-full text-left">
              <thead className="bg-[#010080] text-white">
                <tr>
                  <Th>Course</Th>
                  <Th>Assignment</Th>
                  <Th>Type</Th>
                  <Th>Grade</Th>
                  <Th>Date</Th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-gray-700 bg-gray-800" : "divide-gray-200 bg-white"}`}>
                {grades.map((grade, index) => (
                  <tr key={grade.id} className={index % 2 === 0 ? (isDark ? "bg-gray-800" : "bg-white") : (isDark ? "bg-gray-800/50" : "bg-gray-50")}>
                    <Td isDark={isDark}>{grade.course}</Td>
                    <Td isDark={isDark}>{grade.assignment}</Td>
                    <Td isDark={isDark}>
                      <span className={`px-2 py-1 rounded text-xs ${grade.type === "test" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"}`}>
                        {grade.type || "N/A"}
                      </span>
                    </Td>
                    <Td isDark={isDark}>
                      <span className={`font-semibold ${parseFloat(grade.grade) >= 70 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {grade.grade || "N/A"}
                      </span>
                    </Td>
                    <Td isDark={isDark}>{grade.date ? new Date(grade.date).toLocaleDateString() : "N/A"}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

function Th({ children }) {
  return <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">{children}</th>;
}

function Td({ children, isDark }) {
  return <td className={`px-6 py-4 whitespace-nowrap ${isDark ? "text-gray-200" : "text-gray-900"}`}>{children}</td>;
}

