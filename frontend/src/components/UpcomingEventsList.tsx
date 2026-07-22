"use client";

import Link from "next/link";
import { useGetNewsQuery } from "@/lib/api/newsApi";
import { useDarkMode } from "@/context/ThemeContext";

type Props = { limit?: number; viewAllHref?: string };

export default function UpcomingEventsList({ limit, viewAllHref }: Props) {
  const { isDark } = useDarkMode();
  const { data: newsList, isLoading, isError } = useGetNewsQuery();
  const colors: Record<string, string> = {
    exam: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    event: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    training: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    deadline: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    meeting: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    news: "bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300",
  };
  const icons: Record<string, string> = { exam: "\u{1F4DD}", event: "\u{1F389}", training: "\u{1F4DA}", deadline: "\u{23F0}", meeting: "\u{1F465}", news: "\u{1F4F0}" };
  const events = Array.isArray(newsList)
    ? [...newsList].filter((item) => item.status === "active").sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime()).slice(0, limit)
    : [];

  return (
    <div className={`flex h-[420px] min-h-0 w-full flex-col overflow-hidden rounded-xl border p-4 shadow-md sm:p-6 ${isDark ? "border-gray-800 bg-[#0f172a]" : "border-gray-100 bg-white"}`}>
      <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
        <h3 className={`flex min-w-0 items-center gap-2 text-lg font-bold ${isDark ? "text-white" : "text-[#010080]"}`}><span>{"\u{1F4C5}"}</span><span className="truncate">Upcoming Events & News</span></h3>
        {viewAllHref && <Link href={viewAllHref} className={`whitespace-nowrap text-xs font-bold hover:underline ${isDark ? "text-blue-400" : "text-[#010080]"}`}>View All &rarr;</Link>}
      </div>

      {isLoading ? <div className="flex flex-1 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#010080]" /></div>
        : isError ? <div className="flex flex-1 items-center justify-center text-red-500">Failed to load events</div>
        : events.length === 0 ? <div className={`flex flex-1 flex-col items-center justify-center ${isDark ? "text-gray-500" : "text-gray-400"}`}><span className="mb-2 text-4xl">{"\u{1F4ED}"}</span><p>No events or news</p></div>
        : <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
          {events.map((event) => (
            <div key={event.id} className={`rounded-lg border p-3 transition-all hover:shadow-md ${isDark ? "border-gray-800 hover:bg-[#151c2f]" : "border-gray-200 hover:bg-gray-50"}`}>
              <div className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-start gap-x-3">
                <span className="row-span-2 text-xl leading-6">{icons[event.type] || "\u{1F4CC}"}</span>
                <div className="min-w-0"><h4 className={`truncate text-sm font-semibold leading-5 ${isDark ? "text-gray-100" : "text-gray-900"}`}>{event.title}</h4><p className={`mt-0.5 text-xs leading-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{new Date(event.event_date).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}</p></div>
                <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${colors[event.type] || colors.news}`}>{event.type}</span>
                <p className={`col-start-2 col-end-4 mt-2 line-clamp-2 text-sm leading-5 ${isDark ? "text-gray-400" : "text-gray-600"}`}>{event.description}</p>
              </div>
            </div>
          ))}
        </div>}
    </div>
  );
}
