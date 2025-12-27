"use client";

import { useState } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";

export default function StudentSupportPage() {
  const { isDark } = useDarkMode();
  const { data: user } = useGetCurrentUserQuery();
  const [formData, setFormData] = useState({
    subject: "",
    category: "",
    message: "",
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
          <h1 className="text-2xl font-bold mb-2">Student Support</h1>
          <p className={isDark ? "text-gray-300" : "text-gray-600"}>
            Get help and support from our team. We're here to assist you!
          </p>
        </div>

        {submitted ? (
          <div className={`p-6 rounded-xl shadow ${card}`}>
            <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-semibold">Support ticket submitted successfully! We'll get back to you soon.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={`p-6 rounded-xl shadow ${card} space-y-6`}>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg ${isDark ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"}`}
                required
              >
                <option value="">Select a category</option>
                <option value="technical">Technical Issue</option>
                <option value="academic">Academic Question</option>
                <option value="payment">Payment Issue</option>
                <option value="account">Account Problem</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg ${isDark ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"}`}
                placeholder="Brief description of your issue"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={6}
                className={`w-full px-4 py-2 border rounded-lg ${isDark ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"}`}
                placeholder="Please provide detailed information about your issue..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-3 bg-[#010080] text-white rounded-lg font-semibold hover:bg-[#0200a0] transition-colors disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Support Ticket"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

