"use client";

import { useState } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetCurrentUserQuery } from "@/lib/api/authApi";
import { useCreateSessionRequestMutation, useGetMySessionRequestsQuery } from "@/lib/api/sessionRequestApi";
import { useGetClassesQuery, useGetAvailableSessionClassesQuery } from "@/lib/api/classApi";
import DataTable from "@/components/DataTable";
import StudentPageHeader from "@/components/student/StudentPageHeader";

export default function SessionChangePage() {
  const { isDark } = useDarkMode();
  const { data: user } = useGetCurrentUserQuery();

  // Current student class info
  const { data: allClasses = [] } = useGetClassesQuery();

  // Available sessions for this student's subprogram (dedicated endpoint)
  const { data: availableSessions = [], isLoading: isLoadingAvailable } = useGetAvailableSessionClassesQuery();

  const [createSessionRequest, { isLoading: isSubmitting }] = useCreateSessionRequestMutation();
  const { data: myRequests = [] } = useGetMySessionRequestsQuery(undefined);

  // Determine current class info
  const currentClass = allClasses.find(c => c.id == user?.class_id);
  const currentSessionLabel = currentClass
    ? (currentClass.shift_name && currentClass.shift_session
      ? `${currentClass.shift_name} - ${currentClass.shift_session}`
      : currentClass.shift_session || currentClass.shift_name || "N/A")
    : "Loading...";

  const [requestedClassId, setRequestedClassId] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError("User information not loaded. Please reload.");
      return;
    }
    if (!requestedClassId) {
      setError("Please select a session to switch to.");
      return;
    }

    try {
      const requestedClass = availableSessions.find(c => c.id.toString() === requestedClassId);
      const requestedSessionType = requestedClass
        ? (requestedClass.shift_name && requestedClass.shift_session
          ? `${requestedClass.shift_name} - ${requestedClass.shift_session}`
          : requestedClass.shift_session || requestedClass.shift_name || "")
        : "";

      await createSessionRequest({
        current_class_id: currentClass?.id || null,
        requested_class_id: requestedClass?.id || null,
        requested_session_type: requestedSessionType,
        reason,
      }).unwrap();

      setSubmitted(true);
    } catch (err: any) {
      setError(err?.data?.error || "Failed to submit request. Please try again.");
    }
  };

  const bg = isDark ? "bg-gray-900" : "bg-gray-100";
  const card = isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900";
  const textSub = isDark ? "text-gray-400" : "text-gray-500";
  const inputCls = isDark
    ? "bg-gray-700 border-gray-600 text-white"
    : "border-gray-300 bg-white text-gray-900";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 uppercase tracking-wider">Approved</span>;
      case "rejected":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 uppercase tracking-wider">Rejected</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 uppercase tracking-wider">Pending</span>;
    }
  };

  const columns = [
    {
      label: "Date",
      key: "created_at",
      render: (_: any, row: any) => row?.created_at ? new Date(row.created_at).toLocaleDateString() : "N/A",
    },
    {
      label: "Current Session",
      render: (_: any, row: any) => (
        <div>
          <div className="font-medium text-sm">
            {row?.current_shift_name && row?.current_session_type
              ? `${row.current_shift_name} - ${row.current_session_type}`
              : row?.current_session_type || row?.current_class_name || "N/A"}
          </div>
          {row?.current_class_name && (
            <div className={`text-xs ${textSub}`}>{row.current_class_name}</div>
          )}
        </div>
      ),
    },
    {
      label: "Requested Session",
      render: (_: any, row: any) => (
        <div>
          <div className="font-medium text-sm text-blue-600 dark:text-blue-400">
            {row?.requested_shift_name && row?.requested_class_type
              ? `${row.requested_shift_name} - ${row.requested_class_type}`
              : row?.requested_session_type || "N/A"}
          </div>
          {row?.requested_class_name && (
            <div className={`text-xs ${textSub}`}>{row.requested_class_name}</div>
          )}
        </div>
      ),
    },
    {
      label: "Reason & Response",
      render: (_: any, row: any) => (
        <div className="max-w-xs break-words">
          <div className="text-sm">{row?.reason || "-"}</div>
          {row?.admin_response && (
            <div className="mt-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-xs border border-blue-100 dark:border-blue-800">
              <span className="font-bold text-blue-700 dark:text-blue-300 block mb-1">Academy Feedback:</span>
              <span className="text-gray-700 dark:text-gray-300 italic">{row.admin_response}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      label: "Status",
      key: "status",
      render: (_: any, row: any) => getStatusBadge(row?.status),
    },
  ];

  return (
    <div className={`min-h-screen transition-colors pt-4 w-full px-6 sm:px-10 pb-20 ${bg}`}>
      <div className="w-full">
        <StudentPageHeader
          title="Session Change Request"
          description="Request to change your current class session."
        />

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
              onClick={() => { setSubmitted(false); setRequestedClassId(""); setReason(""); }}
              className="mt-6 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm font-medium transition-colors hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Submit New Request
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={`p-6 rounded-xl shadow ${card} space-y-6 mb-8`}>
            {error && (
              <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Current Session (Read-only) */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Current Session
              </label>
              <input
                type="text"
                value={currentSessionLabel}
                readOnly
                className={`w-full px-4 py-2.5 border rounded-lg cursor-not-allowed ${isDark ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 bg-gray-100 text-gray-700"}`}
              />
              <p className="text-xs text-gray-400 mt-1">Automatically detected based on your enrollment.</p>
            </div>

            {/* Requested Session Dropdown */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Requested Session
              </label>
              {isLoadingAvailable ? (
                <div className="w-full px-4 py-2.5 border rounded-lg text-sm text-gray-400 border-gray-300 dark:border-gray-600">
                  Loading available sessions...
                </div>
              ) : (
                <select
                  value={requestedClassId}
                  onChange={(e) => setRequestedClassId(e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg ${inputCls}`}
                  required
                >
                  <option value="">Select a session</option>
                  {availableSessions.length > 0 ? (
                    availableSessions.map(cls => {
                      // Build a clean human-readable shift label
                      const shiftLabel = [cls.shift_name, cls.shift_session].filter(Boolean).join(" – ");
                      const timeInfo = cls.shift_start && cls.shift_end
                        ? ` (${cls.shift_start} – ${cls.shift_end})`
                        : "";
                      const label = shiftLabel
                        ? `${shiftLabel}${timeInfo}`
                        : cls.shift_name || cls.class_name || `Session #${cls.id}`;
                      return (
                        <option key={cls.id} value={cls.id}>
                          {label}
                        </option>
                      );
                    })
                  ) : (
                    <option disabled>No other sessions available for your course</option>
                  )}
                </select>
              )}
            </div>

            {/* Reason */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Reason for Change
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className={`w-full px-4 py-2.5 border rounded-lg ${inputCls}`}
                placeholder="Please explain why you need to change your session..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !requestedClassId}
              className="w-full px-6 py-3 bg-[#010080] text-white rounded-lg font-semibold hover:bg-[#0200a0] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : "Submit Request"}
            </button>
          </form>
        )}

        {/* Request History */}
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
