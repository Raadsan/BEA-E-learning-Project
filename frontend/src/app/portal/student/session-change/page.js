"use client";

import { useState, useEffect } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useCreateSessionRequestMutation, useGetMySessionRequestsQuery } from "@/redux/api/sessionRequestApi";
import { useGetClassesQuery } from "@/redux/api/classApi";
import DataTable from "@/components/DataTable";

export default function SessionChangePage() {
  const { isDark } = useDarkMode();
  const { data: user } = useGetCurrentUserQuery();
  const { data: classes = [], isLoading: isLoadingClasses } = useGetClassesQuery();

  // Use session request API
  const [createSessionRequest, { isLoading: isSubmitting }] = useCreateSessionRequestMutation();
  const { data: myRequests = [], isLoading: isLoadingRequests } = useGetMySessionRequestsQuery();

  const [formData, setFormData] = useState({
    currentSession: "",
    requestedSession: "",
    reason: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const [availableSessions, setAvailableSessions] = useState([]);

  useEffect(() => {
    if (user && classes.length > 0) {
      // Find current class
      const currentClass = classes.find(c => c.id == user.class_id);

      if (currentClass) {
        // Set current session name
        setFormData(prev => ({
          ...prev,
          currentSession: currentClass.type
        }));

        // Filter classes with same subprogram_id
        const sameSubprogramClasses = classes.filter(c =>
          c.subprogram_id === currentClass.subprogram_id && c.id !== currentClass.id
        );
        setAvailableSessions(sameSubprogramClasses);
      } else {
        setAvailableSessions([]);
        setFormData(prev => ({
          ...prev,
          currentSession: "No active session found"
        }));
      }
    }
  }, [user, classes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate user available
    if (!user) {
      setError("User information not loaded. Please reload.");
      return;
    }

    try {
      // Find current class details
      const currentClass = classes.find(c => c.id == user.class_id);

      // Find a class that matches the requested session type (from available sessions)
      const requestedClass = availableSessions.find(c => c.type === formData.requestedSession);

      // Submit to dedicated Session Request API
      await createSessionRequest({
        current_class_id: currentClass ? currentClass.id : null,
        requested_class_id: requestedClass ? requestedClass.id : null,
        requested_session_type: formData.requestedSession,
        reason: formData.reason
      }).unwrap();

      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit request", err);
      setError("Failed to submit request. Please try again.");
    }
  };

  const bg = isDark ? "bg-gray-900" : "bg-gray-100";
  const card = isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900";
  const textSub = isDark ? "text-gray-400" : "text-gray-500";
  const border = isDark ? "border-gray-700" : "border-gray-200";

  // Helper for status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 uppercase tracking-wider">Approved</span>;
      case 'rejected': return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 uppercase tracking-wider">Rejected</span>;
      default: return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 uppercase tracking-wider">Pending</span>;
    }
  };

  const columns = [
    {
      label: "Date",
      key: "created_at",
      render: (row) => new Date(row.created_at).toLocaleDateString()
    },
    {
      label: "Current Session",
      render: (row) => (
        <div>
          <div className="font-medium text-sm">{row.current_session_type || "N/A"}</div>
          {row.current_class_name && (
            <div className={`text-xs ${textSub}`}>{row.current_class_name}</div>
          )}
        </div>
      )
    },
    {
      label: "Requested Session",
      render: (row) => (
        <div>
          <div className="font-medium text-sm text-blue-600 dark:text-blue-400">{row.requested_session_type}</div>
          {row.requested_class_name && (
            <div className={`text-xs ${textSub}`}>{row.requested_class_name}</div>
          )}
        </div>
      )
    },
    {
      label: "Reason & Response",
      render: (row) => (
        <div className="max-w-xs break-words">
          <div className="text-sm">{row.reason}</div>
          {row.admin_response && (
            <div className="mt-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-xs border border-blue-100 dark:border-blue-800 shadow-sm animate-in fade-in slide-in-from-top-1 duration-300">
              <span className="font-bold text-blue-700 dark:text-blue-300 block mb-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Academy Feedback:
              </span>
              <span className="text-gray-700 dark:text-gray-300 italic">{row.admin_response}</span>
            </div>
          )}
        </div>
      )
    },
    {
      label: "Status",
      render: (row) => getStatusBadge(row.status)
    }
  ];

  return (
    <div className={`min-h-screen transition-colors pt-12 w-full px-6 sm:px-10 pb-20 ${bg}`}>
      <div className="w-full">
        <div className={`mb-6 p-6 rounded-xl shadow ${card}`}>
          <h1 className="text-2xl font-bold mb-2">Session Change Request</h1>
          <p className={isDark ? "text-gray-300" : "text-gray-600"}>
            Request to change your current class session.
          </p>
        </div>

        {/* Form Section */}
        {submitted ? (
          <div className={`p-6 rounded-xl shadow ${card} mb-8`}>
            <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold text-lg">Request submitted successfully!</p>
                <p className="text-sm opacity-80 mt-1">The administration has been notified and will review your request shortly.</p>
              </div>
            </div>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({ currentSession: formData.currentSession, requestedSession: "", reason: "" });
              }}
              className="mt-6 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm font-medium transition-colors hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Submit New Request
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={`p-6 rounded-xl shadow ${card} space-y-6 mb-8`}>
            {error && (
              <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Current Session
              </label>
              <input
                type="text"
                value={formData.currentSession}
                readOnly
                className={`w-full px-4 py-2 border rounded-lg ${isDark ? "bg-gray-700 border-gray-600 text-white bg-opacity-50" : "border-gray-300 bg-gray-100"} cursor-not-allowed`}
                placeholder="Loading..."
              />
              <p className="text-xs text-gray-400 mt-1">Automatically detected based on your enrollment.</p>
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
                {isLoadingClasses ? (
                  <option disabled>Loading available sessions...</option>
                ) : availableSessions.length > 0 ? (
                  // Get unique types from available sessions
                  [...new Set(availableSessions.map(s => s.type).filter(Boolean))].map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))
                ) : (
                  <option disabled>No other sessions available for your course</option>
                )}
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
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-[#010080] text-white rounded-lg font-semibold hover:bg-[#0200a0] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : "Submit Request"}
            </button>
          </form>
        )}

        {/* Requests History Table */}
        <div className="mt-12">
          <DataTable
            title="Your Request History"
            columns={columns}
            data={myRequests}
            showAddButton={false}
          />
        </div>

      </div>
    </div>
  );
}
