"use client";

import { useState } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";

export default function SessionChangePage() {
  const { isDark } = useDarkMode();
  const { data: user } = useGetCurrentUserQuery();
  const [formData, setFormData] = useState({
    currentSession: "",
    requestedSession: "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // TODO: Implement API call
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1000);
  };

  const bg = isDark ? "bg-gray-900" : "bg-gray-100";
  const card = isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900";

  return (
    <div className={`min-h-screen transition-colors ${bg}`}>
      <div className="py-6">
        <div className={`mb-6 p-6 rounded-xl shadow ${card}`}>
          <h1 className="text-2xl font-bold mb-2">Session Change Request</h1>
          <p className={isDark ? "text-gray-300" : "text-gray-600"}>
            Request to change your current class session.
          </p>
        </div>

        {submitted ? (
          <div className={`p-6 rounded-xl shadow ${card}`}>
            <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-semibold">Request submitted successfully!</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={`p-6 rounded-xl shadow ${card} space-y-6`}>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Current Session
              </label>
              <input
                type="text"
                value={formData.currentSession}
                onChange={(e) => setFormData({ ...formData, currentSession: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg ${isDark ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"}`}
                placeholder="e.g., Morning Session"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Requested Session
              </label>
              <select
                value={formData.requestedSession}
                onChange={(e) => setFormData({ ...formData, requestedSession: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg ${isDark ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"}`}
                required
              >
                <option value="">Select a session</option>
                <option value="morning">Morning Session</option>
                <option value="afternoon">Afternoon Session</option>
                <option value="evening">Evening Session</option>
                <option value="weekend">Weekend Session</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Reason for Change
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg ${isDark ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"}`}
                placeholder="Please explain why you need to change your session..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-3 bg-[#010080] text-white rounded-lg font-semibold hover:bg-[#0200a0] transition-colors disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

