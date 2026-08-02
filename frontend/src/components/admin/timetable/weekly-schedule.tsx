"use client";

import { useMemo, useState } from "react";
import Modal from "@/components/Modal";
import { useDarkMode } from "@/context/ThemeContext";
import { useToast } from "@/components/Toast";
import { useGetProgramsQuery } from "@/lib/api/programApi";
import { useGetSubprogramsQuery } from "@/lib/api/subprogramApi";
import { useCreateTimelineActivityMutation, useCreateTimelineRangeMutation, useDeleteTimelineActivityMutation, useDeleteTimelineRangeMutation, useGetTimelineActivitiesQuery, useGetTimelineRangesQuery, useUpdateTimelineActivityMutation, useUpdateTimelineRangeMutation } from "@/lib/api/timetableApi";

type Props = { canView?: boolean; canAdd?: boolean; canEdit?: boolean; canDelete?: boolean };
const emptyForm = { activity_title: "", activity_description: "", start_date: "", end_date: "", program_id: "", subprogram_ids: [] as number[] };

export default function WeeklyScheduleView({ canView = true, canAdd = true, canEdit = true, canDelete = true }: Props) {
    const { isDark } = useDarkMode();
    const { showToast } = useToast();
    const { data: timelines = [], isLoading } = useGetTimelineRangesQuery();
    const { data: programs = [] } = useGetProgramsQuery();
    const { data: allSubprograms = [] } = useGetSubprogramsQuery();
    const [createRange, { isLoading: isCreating }] = useCreateTimelineRangeMutation();
    const [updateRange, { isLoading: isUpdating }] = useUpdateTimelineRangeMutation();
    const [deleteRange, { isLoading: isDeleting }] = useDeleteTimelineRangeMutation();
    const [isOpen, setIsOpen] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState(emptyForm);
    const [draftActivities, setDraftActivities] = useState<Record<string, string>>({});
    const [activeTimeline, setActiveTimeline] = useState<any>(null);
    const [planSubprogramId, setPlanSubprogramId] = useState(0);
    const [activityCell, setActivityCell] = useState<{ week: number; day: string; entry?: any } | null>(null);
    const [activityForm, setActivityForm] = useState({ activity_title: "", activity_description: "" });
    const { data: activities = [], isLoading: activitiesLoading } = useGetTimelineActivitiesQuery(
        { groupId: activeTimeline?.timeline_group_id || "", subprogramId: planSubprogramId },
        { skip: !activeTimeline || !planSubprogramId }
    );
    const [createActivity, { isLoading: isCreatingActivity }] = useCreateTimelineActivityMutation();
    const [updateActivity, { isLoading: isUpdatingActivity }] = useUpdateTimelineActivityMutation();
    const [deleteActivity, { isLoading: isDeletingActivity }] = useDeleteTimelineActivityMutation();

    const visibleSubprograms = useMemo(() => form.program_id
        ? allSubprograms.filter((item: any) => Number(item.program_id) === Number(form.program_id))
        : allSubprograms, [allSubprograms, form.program_id]);

    const openCreate = () => { setEditing(null); setForm(emptyForm); setDraftActivities({}); setIsOpen(true); };
    const openEdit = (item: any) => {
        setEditing(item);
        setForm({ activity_title: item.activity_title || "", activity_description: item.activity_description || "", start_date: String(item.date || "").slice(0, 10), end_date: String(item.end_date || "").slice(0, 10), program_id: "", subprogram_ids: (item.subprogram_ids || []).map(Number) });
        setIsOpen(true);
    };
    const toggleSubprogram = (id: number) => setForm((old) => ({ ...old, subprogram_ids: old.subprogram_ids.includes(id) ? old.subprogram_ids.filter((value) => value !== id) : [...old.subprogram_ids, id] }));

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!form.activity_title.trim() || !form.start_date || !form.end_date || !form.subprogram_ids.length) { showToast("Title, From Date, To Date, and at least one subprogram are required.", "error"); return; }
        if (new Date(form.end_date) < new Date(form.start_date)) { showToast("To Date cannot be earlier than From Date.", "error"); return; }
        try {
            const payload = { activity_title: form.activity_title.trim(), activity_description: form.activity_description || null, start_date: form.start_date, end_date: form.end_date, subprogram_ids: form.subprogram_ids };
            if (editing) {
                await updateRange({ groupId: editing.timeline_group_id, ...payload }).unwrap();
            } else {
                const created = await createRange(payload).unwrap();
                const filledActivities = Object.entries(draftActivities).filter(([, title]) => title.trim());
                const rangeStart = new Date(`${form.start_date}T00:00:00Z`);
                const rangeEnd = new Date(`${form.end_date}T00:00:00Z`);
                const monthCount = Math.max(1, (rangeEnd.getUTCFullYear() - rangeStart.getUTCFullYear()) * 12 + rangeEnd.getUTCMonth() - rangeStart.getUTCMonth() + 1);
                const monthlyActivities = Array.from({ length: monthCount }, (_, monthIndex) =>
                    filledActivities.map(([cell, title]) => {
                        const [templateWeek, day] = cell.split("|");
                        return { week: monthIndex * 4 + Number(templateWeek), day, title: title.trim() };
                    })
                ).flat();
                await Promise.all(monthlyActivities.map((activity) => createActivity({ timeline_group_id: created.timeline_group_id, week_number: activity.week, day: activity.day, activity_title: activity.title, activity_description: null }).unwrap()));
            }
            showToast(editing ? "Academic timeline updated." : "Academic timeline created.", "success");
            setIsOpen(false);
        } catch (error: any) { showToast(error?.data?.error || "Failed to save academic timeline.", "error"); }
    };

    const remove = async (item: any) => {
        if (!window.confirm(`Delete ${item.activity_title}?`)) return;
        try { await deleteRange(item.timeline_group_id).unwrap(); showToast("Academic timeline deleted.", "success"); }
        catch (error: any) { showToast(error?.data?.error || "Failed to delete academic timeline.", "error"); }
    };

    const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"];
    const openWeeklyPlan = (item: any) => {
        setActiveTimeline(item);
        setPlanSubprogramId(Number(item.subprogram_ids?.[0] || 0));
    };
    const activityByCell = useMemo(() => new Map(activities.map((entry: any) => [`${entry.week_number}-${entry.day}`, entry])), [activities]);
    const openActivity = (week: number, day: string) => {
        const entry = activityByCell.get(`${week}-${day}`);
        setActivityCell({ week, day, entry });
        setActivityForm({ activity_title: entry?.activity_title || "", activity_description: entry?.activity_description || "" });
    };
    const saveActivity = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!activityCell || !activeTimeline || !planSubprogramId || !activityForm.activity_title.trim()) return;
        try {
            if (activityCell.entry) await updateActivity({ id: activityCell.entry.id, ...activityForm }).unwrap();
            else await createActivity({ timeline_group_id: activeTimeline.timeline_group_id, subprogram_id: planSubprogramId, week_number: activityCell.week, day: activityCell.day, ...activityForm }).unwrap();
            showToast(activityCell.entry ? "Daily activity updated." : "Daily activity added.", "success");
            setActivityCell(null);
        } catch (error: any) { showToast(error?.data?.error || "Failed to save daily activity.", "error"); }
    };
    const removeActivity = async () => {
        if (!activityCell?.entry || !window.confirm("Delete this daily activity?")) return;
        try { await deleteActivity(activityCell.entry.id).unwrap(); showToast("Daily activity deleted.", "success"); setActivityCell(null); }
        catch (error: any) { showToast(error?.data?.error || "Failed to delete daily activity.", "error"); }
    };
    const formatDate = (value: string) => value ? new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
    const duration = (item: any) => Math.max(1, Math.round((new Date(item.end_date).getTime() - new Date(item.date).getTime()) / 86400000) + 1);

    const getMonthGroups = (item: any) => {
        const start = new Date(`${String(item.date).slice(0, 10)}T00:00:00Z`);
        const end = new Date(`${String(item.end_date).slice(0, 10)}T00:00:00Z`);
        const groups: Array<{ label: string; weeks: number[] }> = [];
        let cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
        let weekOffset = 0;
        while (cursor <= end) {
            const monthEnd = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 0));
            const periodStart = cursor < start ? start : cursor;
            const periodEnd = monthEnd > end ? end : monthEnd;
            const weekCount = Math.max(1, Math.ceil(((periodEnd.getTime() - periodStart.getTime()) / 86400000 + 1) / 7));
            groups.push({ label: cursor.toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" }), weeks: Array.from({ length: weekCount }, (_, index) => weekOffset + index + 1) });
            weekOffset += weekCount;
            cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1));
        }
        return groups;
    };
    if (!canView) return <div className="rounded-xl border p-8 text-center text-gray-500">You do not have permission to view the academic timetable.</div>;
    return <div>
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <div><h1 className={`text-3xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Academic Timetable</h1><p className={`mt-2 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Manage monthly course activities and academic schedules</p></div>
            {canAdd && <button type="button" onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-[#010080] px-5 py-2.5 font-semibold text-white shadow-sm hover:bg-blue-900"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>Create Academic Timeline</button>}
        </div>
        {isLoading ? <div className="p-12 text-center text-gray-500">Loading academic timelines...</div> : timelines.length === 0 ? <div className={`rounded-2xl border-2 border-dashed p-16 text-center ${isDark ? "border-gray-700 text-gray-400" : "border-gray-300 text-gray-500"}`}><h3 className="text-lg font-bold">No academic timelines</h3><p className="mt-2 text-sm">Create a date range and assign it to one or more subprograms.</p></div> : <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{timelines.map((item: any) => <article key={item.timeline_group_id} className={`flex min-h-[300px] flex-col rounded-2xl border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-100 bg-white"}`}>
            <div><p className="text-xs font-bold uppercase tracking-wider text-blue-500">Academic Timeline</p><h3 className={`mt-1 text-xl font-bold ${isDark ? "text-white" : "text-[#010080]"}`}>{item.activity_title}</h3>{item.activity_description && <p className="mt-2 line-clamp-2 text-sm text-gray-500">{item.activity_description}</p>}</div>
            <div className={`my-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl p-4 ${isDark ? "bg-gray-900" : "bg-blue-50"}`}><div><p className="text-[10px] font-bold uppercase text-gray-400">From</p><p className={`mt-1 text-sm font-bold ${isDark ? "text-white" : "text-gray-800"}`}>{formatDate(item.date)}</p></div><span className="text-blue-400">→</span><div className="text-right"><p className="text-[10px] font-bold uppercase text-gray-400">To</p><p className={`mt-1 text-sm font-bold ${isDark ? "text-white" : "text-gray-800"}`}>{formatDate(item.end_date)}</p></div></div>
            <p className="mb-3 text-xs font-semibold text-gray-500">{duration(item)} calendar days</p><div className="flex-1"><p className="mb-2 text-xs font-bold uppercase text-gray-400">Assigned subprograms</p><div className="flex flex-wrap gap-2">{(item.subprograms || []).map((sub: any) => <span key={sub.id} className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">{sub.subprogram_name}</span>)}</div></div>
            <button type="button" onClick={() => openWeeklyPlan(item)} className="mt-5 w-full rounded-lg bg-[#010080] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900">Open Weekly Plan</button><div className={`mt-5 flex justify-end gap-2 border-t pt-4 ${isDark ? "border-gray-700" : "border-gray-100"}`}>{canEdit && <button type="button" onClick={() => openEdit(item)} className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50" title="Edit"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>}{canDelete && <button type="button" disabled={isDeleting} onClick={() => remove(item)} className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50" title="Delete"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" /></svg></button>}</div>
        </article>)}</div>}
        {activeTimeline && <section className={`mt-8 rounded-2xl border p-6 ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-blue-500">Weekly Plan</p><h2 className={`mt-1 text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{activeTimeline.activity_title}</h2><p className="mt-1 text-sm text-gray-500">{formatDate(activeTimeline.date)} — {formatDate(activeTimeline.end_date)}</p></div><button type="button" onClick={() => setActiveTimeline(null)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-600">Close Plan</button></div>
            <div className={`mb-6 rounded-lg border-l-4 border-blue-500 p-3 text-sm ${isDark ? "bg-blue-900/20 text-blue-200" : "bg-blue-50 text-blue-800"}`}>Activities entered here are automatically applied to all {(activeTimeline.subprograms || []).length} assigned subprograms.</div>
            {activitiesLoading ? <div className="p-10 text-center text-gray-500">Loading weekly activities...</div> : <div className="space-y-8">{getMonthGroups(activeTimeline).map((month) => <div key={month.label}><div className={`mb-3 inline-flex rounded-lg px-4 py-2 text-sm font-bold ${isDark ? "bg-blue-900/40 text-blue-300" : "bg-blue-100 text-blue-700"}`}>{month.label}</div><div className="overflow-x-auto"><table className="min-w-[900px] w-full border-collapse"><thead><tr className={isDark ? "bg-gray-700" : "bg-gray-100"}><th className="border border-gray-300 p-3 text-left text-xs font-bold uppercase text-gray-500">Week</th>{days.map((day) => <th key={day} className="border border-gray-300 p-3 text-center text-xs font-bold uppercase text-gray-500">{day}</th>)}</tr></thead><tbody>{month.weeks.map((week, monthWeekIndex) => <tr key={week}><td className={`border border-gray-300 p-3 text-sm font-bold ${isDark ? "bg-gray-700 text-white" : "bg-gray-50 text-gray-700"}`}>Week {monthWeekIndex + 1}</td>{days.map((day) => { const entry = activityByCell.get(`${week}-${day}`) || activityByCell.get(`${((week - 1) % 4) + 1}-${day}`); return <td key={day} className="border border-gray-300 p-2 align-top"><button type="button" onClick={() => openActivity(week, day)} className={`min-h-24 w-full rounded-lg border-2 p-3 text-left transition ${entry ? "border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100" : "border-dashed border-gray-300 text-gray-400 hover:border-blue-300 hover:bg-blue-50"}`}>{entry ? <><span className="block text-xs font-bold">{entry.activity_title}</span>{entry.activity_description && <span className="mt-1 block line-clamp-2 text-[11px] opacity-70">{entry.activity_description}</span>}</> : <span className="block text-center text-xs">+ Add activity</span>}</button></td>; })}</tr>)}</tbody></table></div></div>)}</div>}
        </section>}
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? "Edit Academic Timeline" : "Create Academic Timeline"} size="lg" closeOnClickOutside={false}><form onSubmit={submit} className="space-y-5">
            <div><label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-200">Timeline title *</label><input value={form.activity_title} onChange={(e) => setForm({ ...form, activity_title: e.target.value })} required className="w-full rounded-lg border border-gray-300 px-3 py-2.5 dark:border-gray-600 dark:bg-gray-800 dark:text-white" placeholder="e.g. Term 1 — Grammar Foundations" /></div>
            <div><label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-200">Description</label><textarea value={form.activity_description} onChange={(e) => setForm({ ...form, activity_description: e.target.value })} rows={3} className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 dark:border-gray-600 dark:bg-gray-800 dark:text-white" /></div>
            <div className="grid gap-4 sm:grid-cols-2"><div><label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-200">From Date *</label><input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required className="w-full rounded-lg border border-gray-300 px-3 py-2.5 dark:border-gray-600 dark:bg-gray-800 dark:text-white" /></div><div><label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-200">To Date *</label><input type="date" min={form.start_date || undefined} value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} required className="w-full rounded-lg border border-gray-300 px-3 py-2.5 dark:border-gray-600 dark:bg-gray-800 dark:text-white" /></div></div>
            <div><label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-200">Filter by program</label><select value={form.program_id} onChange={(e) => setForm({ ...form, program_id: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 dark:border-gray-600 dark:bg-gray-800 dark:text-white"><option value="">All programs</option>{programs.map((program: any) => <option key={program.id} value={program.id}>{program.title}</option>)}</select></div>
            <div><div className="mb-2 flex items-center justify-between"><label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Assign Subprograms *</label><div className="flex gap-3 text-xs font-semibold"><button type="button" onClick={() => setForm({ ...form, subprogram_ids: visibleSubprograms.map((item: any) => Number(item.id)) })} className="text-blue-600">Select all</button><button type="button" onClick={() => setForm({ ...form, subprogram_ids: [] })} className="text-gray-500">Clear</button></div></div><div className="max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900"><div className="grid gap-2 sm:grid-cols-2">{visibleSubprograms.map((item: any) => { const id = Number(item.id); const selected = form.subprogram_ids.includes(id); return <label key={id} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm ${selected ? "border-blue-300 bg-blue-50 text-blue-800" : "border-gray-200 bg-white text-gray-700"}`}><input type="checkbox" checked={selected} onChange={() => toggleSubprogram(id)} /><span className="font-medium">{item.subprogram_name}</span></label>; })}</div></div></div>
            {!editing && <div><div className="mb-3"><h3 className="text-sm font-bold text-gray-800 dark:text-white">Weekly Plan Template — 4 Weeks</h3><p className="mt-1 text-xs text-gray-500">Optional: enter the plan once. It will repeat in every month and apply to every selected subprogram.</p></div><div className="max-h-[360px] overflow-auto rounded-xl border border-gray-200"><table className="min-w-[820px] w-full border-collapse"><thead><tr className="bg-gray-100"><th className="border border-gray-200 p-2 text-left text-xs font-bold text-gray-500">Week</th>{days.map((day) => <th key={day} className="border border-gray-200 p-2 text-center text-xs font-bold text-gray-500">{day}</th>)}</tr></thead><tbody>{[1, 2, 3, 4].map((week) => <tr key={week}><td className="border border-gray-200 bg-gray-50 p-2 text-xs font-bold text-gray-700">Week {week}</td>{days.map((day) => { const key = `${week}|${day}`; return <td key={day} className="border border-gray-200 p-1.5"><input value={draftActivities[key] || ""} onChange={(e) => setDraftActivities((old) => ({ ...old, [key]: e.target.value }))} className="w-full min-w-28 rounded border border-gray-200 px-2 py-2 text-xs font-medium outline-none focus:border-blue-400" placeholder="Activity..." /></td>; })}</tr>)}</tbody></table></div></div>}
            <div className="flex justify-end gap-3 border-t pt-4"><button type="button" onClick={() => setIsOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 dark:text-gray-200">Cancel</button><button type="submit" disabled={isCreating || isUpdating} className="rounded-lg bg-[#010080] px-5 py-2 font-semibold text-white disabled:opacity-50">{isCreating || isUpdating ? "Saving..." : editing ? "Save Changes" : "Create Timeline"}</button></div>
        </form></Modal>
        <Modal isOpen={!!activityCell} onClose={() => setActivityCell(null)} title={activityCell?.entry ? "Edit Daily Activity" : "Add Daily Activity"} size="sm" closeOnClickOutside={false}>
            {activityCell && <form onSubmit={saveActivity} className="space-y-5"><div className="grid grid-cols-2 gap-3"><div className="rounded-lg bg-gray-50 p-3"><p className="text-[10px] font-bold uppercase text-gray-400">Week</p><p className="font-semibold text-gray-800">Week {activityCell.week}</p></div><div className="rounded-lg bg-gray-50 p-3"><p className="text-[10px] font-bold uppercase text-gray-400">Day</p><p className="font-semibold text-gray-800">{activityCell.day}</p></div></div><div><label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-200">Activity title *</label><input required value={activityForm.activity_title} onChange={(e) => setActivityForm({ ...activityForm, activity_title: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 dark:border-gray-600 dark:bg-gray-800 dark:text-white" placeholder="What will be covered?" /></div><div><label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-200">Description</label><textarea rows={4} value={activityForm.activity_description} onChange={(e) => setActivityForm({ ...activityForm, activity_description: e.target.value })} className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 dark:border-gray-600 dark:bg-gray-800 dark:text-white" /></div><div className="flex justify-between gap-3 border-t pt-4"><div>{activityCell.entry && canDelete && <button type="button" disabled={isDeletingActivity} onClick={removeActivity} className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white disabled:opacity-50">Delete</button>}</div><div className="flex gap-3"><button type="button" onClick={() => setActivityCell(null)} className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700">Cancel</button><button type="submit" disabled={isCreatingActivity || isUpdatingActivity} className="rounded-lg bg-[#010080] px-5 py-2 font-semibold text-white disabled:opacity-50">{isCreatingActivity || isUpdatingActivity ? "Saving..." : activityCell.entry ? "Save Changes" : "Add Activity"}</button></div></div></form>}
        </Modal>
    </div>;
}