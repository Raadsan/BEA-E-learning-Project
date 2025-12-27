"use client";

import { useState } from "react";
import { useDarkMode } from "@/context/ThemeContext";

export default function TestsPage() {
  const { isDark } = useDarkMode();
  const [tests] = useState([]);

  const bg = isDark ? "bg-gray-900" : "bg-gray-100";
  const card = isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900";

  return (
    <div className={`min-h-screen transition-colors ${bg}`}>
      <div className="py-6">
        <div className={`mb-6 p-6 rounded-xl shadow ${card}`}>
          <h1 className="text-2xl font-bold mb-2">Tests</h1>
          <p className={isDark ? "text-gray-300" : "text-gray-600"}>
            View and take your scheduled tests and quizzes.
          </p>
        </div>

        {tests.length === 0 ? (
          <div className={`p-6 rounded-xl shadow ${card} text-center`}>
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
              No tests available at the moment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl shadow">
            <table className="w-full text-left">
              <thead className="bg-[#010080] text-white">
                <tr>
                  <Th>Test Name</Th>
                  <Th>Course</Th>
                  <Th>Date</Th>
                  <Th>Duration</Th>
                  <Th>Status</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-gray-700 bg-gray-800" : "divide-gray-200 bg-white"}`}>
                {tests.map((test, index) => (
                  <tr key={test.id} className={index % 2 === 0 ? (isDark ? "bg-gray-800" : "bg-white") : (isDark ? "bg-gray-800/50" : "bg-gray-50")}>
                    <Td isDark={isDark}>{test.name}</Td>
                    <Td isDark={isDark}>{test.course}</Td>
                    <Td isDark={isDark}>{test.date ? new Date(test.date).toLocaleDateString() : "N/A"}</Td>
                    <Td isDark={isDark}>{test.duration || "N/A"}</Td>
                    <Td isDark={isDark}>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${test.status === "completed" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : test.status === "available" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"}`}>
                        {test.status || "Pending"}
                      </span>
                    </Td>
                    <Td isDark={isDark}>
                      <button className="px-3 py-1 bg-[#010080] text-white rounded text-sm hover:bg-[#0200a0] transition-colors">
                        {test.status === "completed" ? "View Results" : "Take Test"}
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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

