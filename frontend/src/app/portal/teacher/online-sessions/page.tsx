"use client";

import { useState } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetTeacherClassesQuery } from "@/lib/api/teacherApi";
import { useGetClassSchedulesQuery } from "@/lib/api/classApi";

function SessionStatus({ dateString, startTime, endTime }: { dateString: string; startTime: any; endTime: any }) {
  const now = new Date();
  if (!dateString) return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500">Scheduled</span>;

  const [year, month, day] = dateString.split("-").map(Number);
  const getCleanTime = (t: any) => {
    if (!t) return "";
    const s = String(t);
    return s.includes("T") ? s.split("T")[1].substring(0, 5) : s.substring(0, 5);
  };
  const st = getCleanTime(startTime);
  const et = getCleanTime(endTime);
  const [sh, sm] = st ? st.split(":").map(Number) : [0, 0];
  const [eh, em] = et ? et.split(":").map(Number) : [23, 59];
  const start = new Date(year, month - 1, day, sh, sm);
  const end = new Date(year, month - 1, day, eh, em);

  if (now >= start && now <= end)
    return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 animate-pulse">🟢 Live Now</span>;
  if (now > end)
    return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500">Completed</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Upcoming</span>;
}

function ClassGrid({ classes, isDark, onSelect }: { classes: any[]; isDark: boolean; onSelect: (c: any) => void }) {
  if (!classes.length) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[400px] rounded-3xl border-2 border-dashed ${isDark ? "border-gray-700 text-gray-500" : "border-gray-200 text-gray-400"}`}>
        <svg className="w-16 h-16 mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <p className="text-lg font-semibold">No classes assigned yet</p>
        <p className="text-sm mt-1 opacity-60">Contact admin to get assigned to a class</p>
      </div>
    );
  }

  const colors = [
    { bg: "from-[#010080] to-blue-700", badge: "bg-blue-100 text-blue-700" },
    { bg: "from-red-600 to-red-800", badge: "bg-red-100 text-red-700" },
    { bg: "from-purple-700 to-purple-900", badge: "bg-purple-100 text-purple-700" },
    { bg: "from-emerald-600 to-emerald-800", badge: "bg-emerald-100 text-emerald-700" },
    { bg: "from-orange-500 to-orange-700", badge: "bg-orange-100 text-orange-700" },
    { bg: "from-cyan-600 to-cyan-800", badge: "bg-cyan-100 text-cyan-700" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {classes.map((cls: any, index: number) => {
        const color = colors[index % colors.length];
        const studentCount = cls._count?.students ?? cls.students_count ?? "—";

        return (
          <button
            key={cls.id}
            onClick={() => onSelect(cls)}
            className={`group relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl active:scale-95 text-left ${isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-100"}`}
          >
            <div className={`bg-gradient-to-br ${color.bg} p-6 pb-8`}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <svg className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white leading-tight">{cls.class_name || "Unnamed Class"}</h3>
              {cls.subprograms?.subprogram_name && (
                <p className="text-white/75 text-sm mt-1">{cls.subprograms.subprogram_name}</p>
              )}
            </div>
            <div className={`px-5 py-4 flex items-center justify-between ${isDark ? "bg-gray-800" : "bg-white"}`}>
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
                </svg>
                <span className={isDark ? "text-gray-400" : "text-gray-500"}>{studentCount} students</span>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${color.badge}`}>View Sessions →</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function SessionList({ cls, isDark, onBack }: { cls: any; isDark: boolean; onBack: () => void }) {
  const { data: schedules = [], isLoading } = useGetClassSchedulesQuery(cls.id, { skip: !cls.id });

  const getCleanTime = (t: any) => {
    if (!t) return "";
    const s = String(t);
    return s.includes("T") ? s.split("T")[1].substring(0, 5) : s.substring(0, 5);
  };

  const formatDate = (d: string) => {
    if (!d) return "N/A";
    const [y, m, day] = d.split("-").map(Number);
    return new Date(y, m - 1, day).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  };

  const extractUrl = (text: any) => {
    if (!text) return "";
    const match = String(text).match(/https?:\/\/[^\s]+/);
    if (match) return match[0];
    const cleaned = String(text).trim();
    if (cleaned.startsWith("www.") || cleaned.includes("zoom.us") || cleaned.includes("meet.google")) {
      return "https://" + cleaned;
    }
    return cleaned;
  };

  const handleJoin = (rawUrl: string) => {
    const url = extractUrl(rawUrl);
    if (!url || !url.startsWith("http")) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const sorted = [...schedules].sort((a: any, b: any) => {
    const da = typeof a.schedule_date === "string" ? a.schedule_date.split("T")[0] : a.schedule_date;
    const db = typeof b.schedule_date === "string" ? b.schedule_date.split("T")[0] : b.schedule_date;
    return new Date(da).getTime() - new Date(db).getTime();
  });

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className={`p-2.5 rounded-xl transition-all ${isDark ? "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700" : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm"}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{cls.class_name}</h2>
          <p className={`text-sm mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            {cls.subprograms?.subprogram_name || "Online Sessions"}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-24 rounded-2xl animate-pulse ${isDark ? "bg-gray-800" : "bg-gray-100"}`} />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className={`flex flex-col items-center justify-center min-h-[300px] rounded-3xl border-2 border-dashed ${isDark ? "border-gray-700 text-gray-500" : "border-gray-200 text-gray-400"}`}>
          <svg className="w-14 h-14 mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-lg font-semibold">No sessions scheduled</p>
          <p className="text-sm mt-1 opacity-60">Sessions for this class will appear here once created by admin</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((schedule: any) => {
            const dateStr = typeof schedule.schedule_date === "string"
              ? schedule.schedule_date.split("T")[0].split(" ")[0]
              : schedule.schedule_date;
            const st = getCleanTime(schedule.start_time);
            const et = getCleanTime(schedule.end_time);
            const hasLink = !!schedule.zoom_link;
            const isGoogle = schedule.zoom_link?.includes("meet.google.com");

            return (
              <div
                key={schedule.id}
                className={`rounded-2xl p-5 border flex flex-col sm:flex-row sm:items-center gap-4 transition-all ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100 shadow-sm"}`}
              >
                {/* Date block */}
                <div className={`flex-shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center font-bold ${isDark ? "bg-gray-900 text-white" : "bg-[#010080]/5 text-[#010080]"}`}>
                  <span className="text-xs uppercase tracking-wider opacity-60">
                    {dateStr ? new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { month: "short" }) : "—"}
                  </span>
                  <span className="text-2xl leading-none">
                    {dateStr ? new Date(dateStr + "T00:00:00").getDate() : "—"}
                  </span>
                </div>

                {/* Session info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <SessionStatus dateString={dateStr} startTime={schedule.start_time} endTime={schedule.end_time} />
                    {hasLink && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isGoogle ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}>
                        {isGoogle ? "Google Meet" : "Zoom"}
                      </span>
                    )}
                  </div>
                  <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{formatDate(dateStr)}</p>
                  {(st || et) && (
                    <p className={`text-sm mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      {st}{st && et && " – "}{et}
                    </p>
                  )}
                  {schedule.description && (
                    <p className={`text-sm mt-1 truncate ${isDark ? "text-gray-500" : "text-gray-400"}`}>{schedule.description}</p>
                  )}
                </div>

                {/* Join button */}
                <div className="flex-shrink-0">
                  {hasLink ? (
                    <button
                      onClick={() => handleJoin(schedule.zoom_link)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#010080] hover:bg-blue-800 text-white text-sm font-semibold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-md shadow-blue-900/20"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Join
                    </button>
                  ) : (
                    <span className={`text-xs px-4 py-2 rounded-xl border ${isDark ? "border-gray-700 text-gray-600" : "border-gray-200 text-gray-400"}`}>
                      No link set
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TeacherOnlineSessionsPage() {
  const { isDark } = useDarkMode();
  const { data: classes = [], isLoading } = useGetTeacherClassesQuery();
  const [selectedClass, setSelectedClass] = useState<any>(null);

  const bg = isDark ? "bg-gray-900" : "bg-gray-100";

  return (
    <div className={`min-h-screen transition-colors pt-4 pb-20 w-full px-6 sm:px-10 ${bg}`}>
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className={`p-3 rounded-2xl ${isDark ? "bg-blue-500/10" : "bg-[#010080]/5"}`}>
          <svg className={`w-7 h-7 ${isDark ? "text-blue-400" : "text-[#010080]"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h1 className={`text-3xl font-bold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
            {selectedClass ? "Class Sessions" : "Online Sessions"}
          </h1>
          <p className={`text-sm mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            {selectedClass
              ? `Showing sessions for ${selectedClass.class_name}`
              : "Select a class to view and join its online sessions"}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-48 rounded-2xl animate-pulse ${isDark ? "bg-gray-800" : "bg-gray-200"}`} />
          ))}
        </div>
      ) : selectedClass ? (
        <SessionList cls={selectedClass} isDark={isDark} onBack={() => setSelectedClass(null)} />
      ) : (
        <ClassGrid classes={classes} isDark={isDark} onSelect={setSelectedClass} />
      )}
    </div>
  );
}
