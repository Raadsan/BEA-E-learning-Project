"use client";

import { useEffect, useState } from "react";
import { useDarkMode } from "@/context/ThemeContext";

export default function NotificationsPage() {
  const { isDark } = useDarkMode();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";
        const res = await fetch(`${baseUrl}/api/announcements`);
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(json.message || "Failed to load notifications");
        }
        setAnnouncements(json || []);
      } catch (err) {
        setError(err.message || "Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const bg = isDark ? "bg-gray-900" : "bg-gray-100";
  const card = isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900";

  return (
    <div className={`min-h-screen ${bg}`}>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className={`p-6 rounded-xl shadow ${card}`}>
          <h1 className="text-2xl font-bold mb-2">Notifications</h1>
          <p className={isDark ? "text-gray-300" : "text-gray-600"}>
            Announcements and updates from the academy.
          </p>
        </div>

        {loading ? (
          <div className={`p-6 rounded-xl shadow ${card}`}>
            <p className="text-sm">Loading notifications...</p>
          </div>
        ) : error ? (
          <div
            className={`p-6 rounded-xl shadow border border-red-200 ${
              isDark ? "bg-red-900/20" : "bg-red-50"
            }`}
          >
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className={`p-6 rounded-xl shadow ${card}`}>
            <p className="text-sm">
              There are no notifications at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((a) => (
              <div
                key={a.id}
                className="p-4 rounded-xl bg-white shadow border border-gray-200"
              >
                <div className="flex justify-between items-start mb-1">
                  <h2 className="text-sm font-semibold text-gray-900">
                    {a.title}
                  </h2>
                  <span className="text-xs text-gray-500">
                    {a.publish_date
                      ? new Date(a.publish_date).toLocaleDateString()
                      : ""}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-1">{a.content}</p>
                <p className="text-[11px] text-gray-500">
                  Audience: {a.target_audience || "All students"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}




