"use client";

import { useState } from "react";
import StudentPageHeader from "@/components/student/StudentPageHeader";
import { useToast } from "@/components/Toast";
import {
  useCreateSupportRequestMutation,
  useGetMySupportRequestsQuery,
  useDeleteSupportRequestMutation,
} from "@/lib/api/contactApi";

const initial = { category: "", subject: "", message: "" };

function ConfirmDeleteModal({ isOpen, onClose, onConfirm, subject, isLoading }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl shadow-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Delete Request</h3>
            <p className="text-xs text-gray-500 mt-0.5">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Are you sure you want to delete the support request{" "}
          {subject && <span className="font-bold text-gray-900 dark:text-white">"{subject}"</span>}?
        </p>
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isLoading} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors disabled:opacity-50">
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StudentSupportPage() {
  const { showToast } = useToast();
  const { data: requests = [], isLoading } = useGetMySupportRequestsQuery();
  const [createRequest, { isLoading: submitting }] = useCreateSupportRequestMutation();
  const [deleteRequest, { isLoading: deleting }] = useDeleteSupportRequestMutation();
  const [form, setForm] = useState(initial);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; item: any }>({ open: false, item: null });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await createRequest(form).unwrap();
      setForm(initial);
      showToast("Support request sent successfully", "success");
    } catch (error: any) {
      showToast(error?.data?.error || "Could not send support request", "error");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteRequest(deleteModal.item.id).unwrap();
      showToast("Support request deleted successfully", "success");
      setDeleteModal({ open: false, item: null });
    } catch (error: any) {
      showToast(error?.data?.error || "Could not delete support request", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 pb-20 pt-4 dark:bg-gray-900 sm:px-10">
      <StudentPageHeader
        title="Student Support Centre"
        description="Send a message to the support team and follow their reply here."
      />
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <form
          onSubmit={submit}
          className="h-fit space-y-4 rounded-2xl border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <h2 className="text-lg font-bold dark:text-white">New support request</h2>
          <label className="block text-sm font-semibold dark:text-gray-200">
            Category
            <select
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="mt-1 w-full rounded-lg border px-3 py-2.5 text-gray-900"
            >
              <option value="">Select category</option>
              <option value="technical">Technical Issue</option>
              <option value="academic">Academic Question</option>
              <option value="payment">Payment Issue</option>
              <option value="account">Account Problem</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="block text-sm font-semibold dark:text-gray-200">
            Subject
            <input
              required
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="mt-1 w-full rounded-lg border px-3 py-2.5 text-gray-900"
              placeholder="Brief description"
            />
          </label>
          <label className="block text-sm font-semibold dark:text-gray-200">
            Message
            <textarea
              required
              rows={6}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="mt-1 w-full rounded-lg border px-3 py-2.5 text-gray-900"
              placeholder="Describe how we can help..."
            />
          </label>
          <button
            disabled={submitting}
            className="w-full rounded-lg bg-[#010080] py-3 font-semibold text-white disabled:opacity-50"
          >
            {submitting ? "Sending..." : "Send to Support"}
          </button>
        </form>

        <section>
          <h2 className="mb-4 text-xl font-bold dark:text-white">My requests</h2>
          {isLoading ? (
            <p>Loading...</p>
          ) : requests.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-10 text-center text-gray-500">
              No support requests yet.
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((item: any) => (
                <article
                  key={item.id}
                  className="rounded-2xl border bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase text-blue-600">{item.category}</p>
                      <h3 className="text-lg font-bold dark:text-white">{item.subject}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          item.status === "answered"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {item.status}
                      </span>
                      <button
                        onClick={() => setDeleteModal({ open: true, item })}
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30 transition-all"
                        title="Delete request"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300">
                    {item.message}
                  </p>
                  {item.admin_reply && (
                    <div className="mt-4 rounded-xl border-l-4 border-green-500 bg-green-50 p-4">
                      <p className="mb-1 text-xs font-bold uppercase text-green-700">Support reply</p>
                      <p className="whitespace-pre-wrap text-sm text-gray-800">{item.admin_reply}</p>
                    </div>
                  )}
                  <p className="mt-3 text-xs text-gray-400">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>

      <ConfirmDeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, item: null })}
        onConfirm={handleDeleteConfirm}
        subject={deleteModal.item?.subject}
        isLoading={deleting}
      />
  );
}