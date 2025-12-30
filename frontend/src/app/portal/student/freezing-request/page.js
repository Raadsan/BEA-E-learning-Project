"use client";

import { useState } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";

export default function FreezingRequestPage() {
  const { isDark } = useDarkMode();
  const { data: user } = useGetCurrentUserQuery();
  const [formData, setFormData] = useState({
    reason: "",
    startDate: "",
    endDate: "",
    description: "",
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
    <div className={`min-h-screen transition-colors px-8 ${bg}`}>
      <div className="py-6">
        <div className={`mb-6 p-6 rounded-xl shadow ${card}`}>
          <h1 className="text-2xl font-bold mb-2">Freezing Request</h1>
          <p className={isDark ? "text-gray-300" : "text-gray-600"}>
            Request to freeze your enrollment temporarily.
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
                Reason for Freezing
              </label>
              <select
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg ${isDark ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"}`}
                required
              >
                <option value="">Select a reason</option>
                <option value="medical">Medical Reasons</option>
                <option value="personal">Personal Reasons</option>
                <option value="travel">Travel</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg ${isDark ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"}`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg ${isDark ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"}`}
                  required
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Additional Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg ${isDark ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"}`}
                placeholder="Provide additional details about your freezing request..."
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

