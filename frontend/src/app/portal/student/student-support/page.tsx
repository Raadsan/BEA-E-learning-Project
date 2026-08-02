"use client";

import { useState } from "react";
import StudentPageHeader from "@/components/student/StudentPageHeader";
import { useToast } from "@/components/Toast";
import { useCreateSupportRequestMutation, useGetMySupportRequestsQuery } from "@/lib/api/contactApi";

const initial = { category: "", subject: "", message: "" };

export default function StudentSupportPage() {
  const { showToast } = useToast();
  const { data: requests = [], isLoading } = useGetMySupportRequestsQuery();
  const [createRequest, { isLoading: submitting }] = useCreateSupportRequestMutation();
  const [form, setForm] = useState(initial);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await createRequest(form).unwrap(); setForm(initial); showToast("Support request sent successfully", "success");
    } catch (error: any) { showToast(error?.data?.error || "Could not send support request", "error"); }
  };

  return <div className="min-h-screen bg-gray-50 px-6 pb-20 pt-4 dark:bg-gray-900 sm:px-10">
    <StudentPageHeader title="Student Support" description="Send a message to the support team and follow their reply here." />
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <form onSubmit={submit} className="h-fit space-y-4 rounded-2xl border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-lg font-bold dark:text-white">New support request</h2>
        <label className="block text-sm font-semibold dark:text-gray-200">Category<select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2.5 text-gray-900"><option value="">Select category</option><option value="technical">Technical Issue</option><option value="academic">Academic Question</option><option value="payment">Payment Issue</option><option value="account">Account Problem</option><option value="other">Other</option></select></label>
        <label className="block text-sm font-semibold dark:text-gray-200">Subject<input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2.5 text-gray-900" placeholder="Brief description" /></label>
        <label className="block text-sm font-semibold dark:text-gray-200">Message<textarea required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2.5 text-gray-900" placeholder="Describe how we can help..." /></label>
        <button disabled={submitting} className="w-full rounded-lg bg-[#010080] py-3 font-semibold text-white disabled:opacity-50">{submitting ? "Sending..." : "Send to Support"}</button>
      </form>
      <section><h2 className="mb-4 text-xl font-bold dark:text-white">My requests</h2>{isLoading ? <p>Loading...</p> : requests.length === 0 ? <div className="rounded-2xl border border-dashed p-10 text-center text-gray-500">No support requests yet.</div> : <div className="space-y-4">{requests.map((item: any) => <article key={item.id} className="rounded-2xl border bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase text-blue-600">{item.category}</p><h3 className="text-lg font-bold dark:text-white">{item.subject}</h3></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${item.status === "answered" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{item.status}</span></div><p className="mt-3 whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300">{item.message}</p>{item.admin_reply && <div className="mt-4 rounded-xl border-l-4 border-green-500 bg-green-50 p-4"><p className="mb-1 text-xs font-bold uppercase text-green-700">Support reply</p><p className="whitespace-pre-wrap text-sm text-gray-800">{item.admin_reply}</p></div>}<p className="mt-3 text-xs text-gray-400">{new Date(item.created_at).toLocaleString()}</p></article>)}</div>}</section>
    </div>
  </div>;
}