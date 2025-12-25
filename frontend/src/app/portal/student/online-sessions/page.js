"use client";

import { useState } from "react";
import { useDarkMode } from "@/context/ThemeContext";

export default function OnlineSessionsPage() {
  const { isDark } = useDarkMode();
  const [sessions] = useState([]);

  const bg = isDark ? "bg-gray-900" : "bg-gray-100";
  const card = isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900";

  return (
    <div className={`min-h-screen transition-colors ${bg}`}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
        <div className={`mb-6 p-6 rounded-xl shadow ${card}`}>
          <h1 className="text-2xl font-bold mb-2">Online Sessions</h1>
          <p className={isDark ? "text-gray-300" : "text-gray-600"}>
            View and join your scheduled online class sessions.
          </p>
        </div>

        {sessions.length === 0 ? (
          <div className={`p-6 rounded-xl shadow ${card} text-center`}>
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
              No online sessions scheduled at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className={`p-6 rounded-xl shadow ${card}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                      {session.title}
                    </h3>
                    <p className={isDark ? "text-gray-300" : "text-gray-700"}>{session.description}</p>
                    <div className="mt-2 flex items-center gap-4 text-sm">
                      <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                        📅 {session.date ? new Date(session.date).toLocaleDateString() : "N/A"}
                      </span>
                      <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                        ⏰ {session.time || "N/A"}
                      </span>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-[#010080] text-white rounded-lg text-sm font-medium hover:bg-[#0200a0] transition-colors">
                    Join Session
                  </button>
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

