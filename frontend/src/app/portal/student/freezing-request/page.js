"use client";
import { useState } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import {
  useCreateFreezingRequestMutation,
  useGetMyFreezingRequestsQuery
} from "@/redux/api/freezingApi";
import DataTable from "@/components/DataTable";

export default function FreezingRequestPage() {
  const { isDark } = useDarkMode();
  const [createRequest, { isLoading: submitting }] = useCreateFreezingRequestMutation();
  const { data: history = [], isLoading: loadingHistory } = useGetMyFreezingRequestsQuery();

  const [formData, setFormData] = useState({
    reason: "",
    startDate: "",
    endDate: "",
    description: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await createRequest({
        reason: formData.reason,
        start_date: formData.startDate,
        end_date: formData.endDate,
        description: formData.description
      }).unwrap();
      setSubmitted(true);
      setFormData({ reason: "", startDate: "", endDate: "", description: "" });
    } catch (err) {
      setError(err?.data?.error || "Failed to submit request");
    }
  };

  const bg = isDark ? "bg-gray-900" : "bg-gray-100";
  const card = isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900";
  const textSub = isDark ? "text-gray-400" : "text-gray-500";

  const columns = [
    {
      key: "created_at",
      label: "Date Submitted",
      render: (row) => new Date(row.created_at).toLocaleDateString()
    },
    {
      key: "reason",
      label: "Reason",
      render: (row) => <span className="capitalize">{row.reason}</span>
    },
    {
      key: "period",
      label: "Period",
      render: (row) => (
        <span className="text-sm">
          {new Date(row.start_date).toLocaleDateString()} - {new Date(row.end_date).toLocaleDateString()}
        </span>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${row.status === 'approved' ? 'bg-green-100 text-green-700' :
          row.status === 'rejected' ? 'bg-red-100 text-red-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
          {row.status}
        </span>
      )
    },
    {
      key: "admin_response",
      label: "Academy Feedback",
      render: (row) => row.admin_response ? (
        <div className="max-w-xs truncate text-xs italic opacity-80" title={row.admin_response}>
          "{row.admin_response}"
        </div>
      ) : <span className="text-gray-400">-</span>
    }
  ];

  return (
    <div className={`min-h-screen transition-colors pt-12 w-full px-6 sm:px-10 pb-20 ${bg}`}>
      <div className="w-full space-y-8">
        {/* Header */}
        <div className={`p-6 rounded-xl shadow ${card}`}>
          <h1 className="text-2xl font-bold mb-2">Freezing Request</h1>
          <p className={isDark ? "text-gray-300" : "text-gray-600"}>
            Request to freeze your enrollment temporarily. This will be reviewed by the academy management.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-6">
            {submitted ? (
              <div className={`p-6 rounded-xl shadow ${card} border-t-4 border-green-500`}>
                <div className="flex items-center gap-3 text-green-600 dark:text-green-400 mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xl font-bold">Request Submitted!</p>
                </div>
                <p className="mb-6 opacity-80">Your freezing request is now pending review. You'll receive a notification once it's processed.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={`p-6 rounded-xl shadow ${card} space-y-6`}>
                {error && (
                  <div className="p-4 bg-red-100 text-red-700 rounded-lg text-sm font-bold">
                    {error}
                  </div>
                )}

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
                    placeholder="Provide additional details..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-6 py-3 bg-[#010080] text-white rounded-lg font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {submitting ? "Processing..." : "Submit Freezing Request"}
                </button>
              </form>
            )}
          </div>

          {/* Guidelines */}
          <div className={`p-6 rounded-xl shadow ${card} h-fit`}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Important Guidelines
            </h2>
            <ul className={`space-y-4 text-sm ${textSub}`}>
              <li className="flex gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>Students may freeze their course up to **two times** during their study period.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>Requests must be submitted at least **one week** before the intended start date.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>Consecutive freezing for more than 2 months may require a level reassessment.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>Once a new term starts, freezing requests for the current term may not be accepted.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* History */}
        <div className={`p-6 rounded-xl shadow ${card}`}>
          <h2 className="text-xl font-bold mb-6">Request History</h2>
          <DataTable
            columns={columns}
            data={history}
            isLoading={loadingHistory}
            searchKey="reason"
          />
        </div>
      </div>
    </div>
  );
}

