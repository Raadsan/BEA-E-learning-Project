"use client";

import { useMemo, useState } from "react";
import DataTable from "@/components/DataTable";
import { useToast } from "@/components/Toast";
import { useGetSupportRequestsQuery, useReplySupportRequestMutation } from "@/lib/api/contactApi";

export default function AdminStudentSupportPage() {
  const { data: requests = [], isLoading } = useGetSupportRequestsQuery();
  const [replyRequest, { isLoading: sending }] = useReplySupportRequestMutation();
  const { showToast } = useToast();
  const [selected, setSelected] = useState<any>(null);
  const [reply, setReply] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = useMemo(() => [...new Set(requests.map((item: any) => item.category).filter(Boolean))], [requests]);
  const tableRows = useMemo(() => requests.filter((item: any) =>
    (statusFilter === "all" || item.status === statusFilter) &&
    (categoryFilter === "all" || item.category === categoryFilter)
  ).map((item: any) => ({
    ...item,
    student_search: `${item.student?.full_name || "Student"} ${item.student_id} ${item.student?.email || ""}`,
  })), [requests, statusFilter, categoryFilter]);

  const openReply = (item: any) => { setSelected(item); setReply(item.admin_reply || ""); };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await replyRequest({ id: selected.id, reply }).unwrap();
      showToast("Reply sent and student notified", "success");
      setSelected(null);
    } catch (error: any) { showToast(error?.data?.error || "Reply failed", "error"); }
  };

  const columns = [
    { key: "student_search", label: "Student", width: "240px", render: (_: any, item: any) => <div><p className="font-semibold">{item.student?.full_name || "Student"}</p><p className="text-xs text-gray-500">{item.student_id}</p><p className="text-xs text-gray-400">{item.student?.email || "No email"}</p></div> },
    { key: "category", label: "Category", width: "130px", render: (value: string) => <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold capitalize text-blue-700">{value}</span> },
    { key: "subject", label: "Subject / Message", width: "320px", render: (_: any, item: any) => <div className="max-w-[300px]"><p className="font-semibold">{item.subject}</p><p className="mt-1 truncate text-xs text-gray-500" title={item.message}>{item.message}</p></div> },
    { key: "status", label: "Status", width: "120px", render: (value: string) => <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold capitalize ${value === "answered" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}><span className={`h-1.5 w-1.5 rounded-full ${value === "answered" ? "bg-green-500" : "bg-amber-500"}`} />{value}</span> },
    { key: "created_at", label: "Received", width: "160px", render: (value: string) => <div><p>{new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</p><p className="text-xs text-gray-400">{new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p></div> },
    { key: "actions", label: "Actions", width: "100px", render: (_: any, item: any) => <button type="button" onClick={() => openReply(item)} title={item.admin_reply ? "View or edit reply" : "View and reply"} className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#010080]/10 text-[#010080] transition hover:bg-[#010080] hover:text-white"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.8L3 20l1.3-3.9A7.5 7.5 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg></button> },
  ];

  const filters = <>
    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-8 rounded-lg border border-gray-200 bg-white px-3 text-[11px] font-semibold text-gray-700 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"><option value="all">All statuses</option><option value="open">Open</option><option value="answered">Answered</option></select>
    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="h-8 rounded-lg border border-gray-200 bg-white px-3 text-[11px] font-semibold capitalize text-gray-700 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"><option value="all">All categories</option>{categories.map((category: any) => <option key={category} value={category}>{category}</option>)}</select>
    {(statusFilter !== "all" || categoryFilter !== "all") && <button type="button" onClick={() => { setStatusFilter("all"); setCategoryFilter("all"); }} className="h-8 rounded-lg bg-red-50 px-3 text-[11px] font-bold text-red-600">Clear filters</button>}
  </>;

  return <main className="flex-1 min-w-0 bg-gray-50 p-4 dark:bg-gray-900 sm:p-8">
    <div className="mb-6"><h1 className="font-serif text-3xl font-bold text-[#010080] dark:text-white">Student Support</h1><p className="mt-1 text-sm text-gray-500">View student support messages, reply, and notify the student.</p></div>
    <DataTable title="Support Requests" columns={columns} data={tableRows} showAddButton={false} filters={filters} isLoading={isLoading} rowsPerPage={10} emptyMessage="No student support requests match your filters." />

    {selected && <div className="fixed inset-0 z-[120] flex items-center justify-center p-4"><button type="button" aria-label="Close" className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelected(null)} /><form onSubmit={submit} className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800"><div className="flex items-start justify-between border-b p-6 dark:border-gray-700"><div><h2 className="text-xl font-bold dark:text-white">Support Request</h2><p className="mt-1 text-sm text-gray-500">{selected.student?.full_name || selected.student_id} · {selected.student?.email || selected.student_id}</p></div><button type="button" onClick={() => setSelected(null)} className="rounded-full p-2 text-gray-400 hover:bg-gray-100">✕</button></div><div className="max-h-[70vh] space-y-5 overflow-y-auto p-6"><div className="grid gap-4 sm:grid-cols-2"><div><p className="text-xs font-bold uppercase text-gray-400">Category</p><p className="mt-1 font-semibold capitalize dark:text-white">{selected.category}</p></div><div><p className="text-xs font-bold uppercase text-gray-400">Subject</p><p className="mt-1 font-semibold dark:text-white">{selected.subject}</p></div></div><div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900"><p className="mb-2 text-xs font-bold uppercase text-gray-400">Student message</p><p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-200">{selected.message}</p></div><label className="block text-sm font-bold dark:text-white">Your reply<textarea required rows={6} value={reply} onChange={(e) => setReply(e.target.value)} className="mt-2 w-full rounded-xl border border-gray-300 p-3 font-normal text-gray-900 outline-none focus:border-[#010080]" placeholder="Write your reply..." /></label><p className="text-xs text-gray-500">Saving this reply sends an in-app notification to the student.</p></div><div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/50"><button type="button" onClick={() => setSelected(null)} className="rounded-lg border px-4 py-2 font-semibold dark:text-white">Cancel</button><button disabled={sending} className="rounded-lg bg-[#010080] px-5 py-2 font-semibold text-white disabled:opacity-50">{sending ? "Sending..." : selected.admin_reply ? "Update Reply" : "Send Reply"}</button></div></form></div>}
  </main>;
}