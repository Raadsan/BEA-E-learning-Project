"use client";

import { useState } from "react";
import { useDarkMode } from "@/context/ThemeContext";

export default function CourseWorkPage() {
  const { isDark } = useDarkMode();
  const [courseWork] = useState([]);

  const bg = isDark ? "bg-gray-900" : "bg-gray-100";
  const card = isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900";

  return (
    <div className={`min-h-screen transition-colors ${bg}`}>
      <div className="py-6">
        <div className={`mb-6 p-6 rounded-xl shadow ${card}`}>
          <h1 className="text-2xl font-bold mb-2">Course Work</h1>
          <p className={isDark ? "text-gray-300" : "text-gray-600"}>
            All your course assignments and work submissions.
          </p>
        </div>

        {courseWork.length === 0 ? (
          <div className={`p-6 rounded-xl shadow ${card} text-center`}>
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
              No course work assigned yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl shadow">
            <table className="w-full text-left">
              <thead className="bg-[#010080] text-white">
                <tr>
                  <Th>Assignment</Th>
                  <Th>Course</Th>
                  <Th>Due Date</Th>
                  <Th>Status</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-gray-700 bg-gray-800" : "divide-gray-200 bg-white"}`}>
                {courseWork.map((work, index) => (
                  <tr key={work.id} className={index % 2 === 0 ? (isDark ? "bg-gray-800" : "bg-white") : (isDark ? "bg-gray-800/50" : "bg-gray-50")}>
                    <Td isDark={isDark}>{work.title}</Td>
                    <Td isDark={isDark}>{work.course}</Td>
                    <Td isDark={isDark}>{work.dueDate ? new Date(work.dueDate).toLocaleDateString() : "N/A"}</Td>
                    <Td isDark={isDark}>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${work.status === "submitted" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"}`}>
                        {work.status || "Pending"}
                      </span>
                    </Td>
                    <Td isDark={isDark}>
                      <button className="px-3 py-1 bg-[#010080] text-white rounded text-sm hover:bg-[#0200a0] transition-colors">
                        View
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

