"use client";

import { useState } from "react";
import { useDarkMode } from "@/context/ThemeContext";

export default function WritingTasksPage() {
  const { isDark } = useDarkMode();
  const [tasks] = useState([]);

  const bg = isDark ? "bg-gray-900" : "bg-gray-100";
  const card = isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900";

  return (
    <div className={`min-h-screen transition-colors ${bg}`}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
        <div className={`mb-6 p-6 rounded-xl shadow ${card}`}>
          <h1 className="text-2xl font-bold mb-2">Writing Tasks</h1>
          <p className={isDark ? "text-gray-300" : "text-gray-600"}>
            View and submit your writing assignments.
          </p>
        </div>

        {tasks.length === 0 ? (
          <div className={`p-6 rounded-xl shadow ${card} text-center`}>
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
              No writing tasks assigned yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl shadow">
            <table className="w-full text-left">
              <thead className="bg-[#010080] text-white">
                <tr>
                  <Th>Task Title</Th>
                  <Th>Due Date</Th>
                  <Th>Status</Th>
                  <Th>Grade</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-gray-700 bg-gray-800" : "divide-gray-200 bg-white"}`}>
                {tasks.map((task, index) => (
                  <tr key={task.id} className={index % 2 === 0 ? (isDark ? "bg-gray-800" : "bg-white") : (isDark ? "bg-gray-800/50" : "bg-gray-50")}>
                    <Td isDark={isDark}>{task.title}</Td>
                    <Td isDark={isDark}>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}</Td>
                    <Td isDark={isDark}>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${task.status === "completed" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"}`}>
                        {task.status || "Pending"}
                      </span>
                    </Td>
                    <Td isDark={isDark}>{task.grade || "N/A"}</Td>
                    <Td isDark={isDark}>
                      <button className="px-3 py-1 bg-[#010080] text-white rounded text-sm hover:bg-[#0200a0] transition-colors">
                        {task.status === "completed" ? "View" : "Submit"}
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
    </div>
  );
}

function Th({ children }) {
  return <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">{children}</th>;
}

function Td({ children, isDark }) {
  return <td className={`px-6 py-4 whitespace-nowrap ${isDark ? "text-gray-200" : "text-gray-900"}`}>{children}</td>;
}

