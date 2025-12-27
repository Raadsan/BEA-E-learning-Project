"use client";

import { useState } from "react";
import { useDarkMode } from "@/context/ThemeContext";

export default function ClassUpdatesPage() {
  const { isDark } = useDarkMode();
  const [updates] = useState([]);

  const bg = isDark ? "bg-gray-900" : "bg-gray-100";
  const card = isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900";

  return (
    <div className={`min-h-screen transition-colors ${bg}`}>
      <div className="py-6">
        <div className={`mb-6 p-6 rounded-xl shadow ${card}`}>
          <h1 className="text-2xl font-bold mb-2">Class Updates</h1>
          <p className={isDark ? "text-gray-300" : "text-gray-600"}>
            Stay informed with the latest updates and announcements from your classes.
          </p>
        </div>

        {updates.length === 0 ? (
          <div className={`p-6 rounded-xl shadow ${card} text-center`}>
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
              No class updates available at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {updates.map((update) => (
              <div key={update.id} className={`p-6 rounded-xl shadow ${card}`}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {update.title}
                  </h3>
                  <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    {update.date ? new Date(update.date).toLocaleDateString() : "N/A"}
                  </span>
                </div>
                <p className={isDark ? "text-gray-300" : "text-gray-700"}>{update.content}</p>
                {update.attachments && update.attachments.length > 0 && (
                  <div className="mt-4">
                    <p className={`text-sm font-medium mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>Attachments:</p>
                    <div className="flex gap-2">
                      {update.attachments.map((file, idx) => (
                        <a key={idx} href={file.url} className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded text-sm hover:underline">
                          {file.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

