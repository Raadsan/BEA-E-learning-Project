"use client";

import { useState } from "react";
import { useDarkMode } from "@/context/ThemeContext";

export default function PoliciesPage() {
  const { isDark } = useDarkMode();
  const [policies] = useState([]);

  const bg = isDark ? "bg-gray-900" : "bg-gray-100";
  const card = isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900";

  return (
    <div className={`min-h-screen transition-colors ${bg}`}>
      <div className="py-6">
        <div className={`mb-6 p-6 rounded-xl shadow ${card}`}>
          <h1 className="text-2xl font-bold mb-2">Policies</h1>
          <p className={isDark ? "text-gray-300" : "text-gray-600"}>
            Review important policies and guidelines for students.
          </p>
        </div>

        {policies.length === 0 ? (
          <div className={`p-6 rounded-xl shadow ${card} text-center`}>
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
              No policies available at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {policies.map((policy) => (
              <div key={policy.id} className={`p-6 rounded-xl shadow ${card}`}>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                  {policy.title}
                </h3>
                <p className={isDark ? "text-gray-300" : "text-gray-700"}>
                  {policy.content}
                </p>
                <p className={`text-xs mt-4 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                  Last updated: {policy.updated_at ? new Date(policy.updated_at).toLocaleDateString() : "N/A"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

