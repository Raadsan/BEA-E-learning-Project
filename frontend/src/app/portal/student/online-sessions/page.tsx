"use client";

import { useState, useMemo } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import StudentPageHeader from "@/components/student/StudentPageHeader";
import { useGetCurrentUserQuery } from "@/lib/api/authApi";
import { useGetClassQuery, useGetClassSchedulesQuery } from "@/lib/api/classApi";
import { useToast } from "@/components/Toast";

export default function OnlineSessionsPage() {
  const { isDark } = useDarkMode();
  const { showToast } = useToast();
  const { data: user, isLoading: userLoading } = useGetCurrentUserQuery();

  // Fetch student's class
  const { data: classData, isLoading: classLoading } = useGetClassQuery(
    user?.class_id,
    { skip: !user?.class_id }
  );

  const studentClass = classData;

  // Fetch schedules for student's class
  const { data: schedulesData = [], isLoading: schedulesLoading } = useGetClassSchedulesQuery(
    user?.class_id,
    { skip: !user?.class_id }
  );

  const loading = userLoading || classLoading || schedulesLoading;

  // Helper function to get session status
  const getSessionStatus = (dateString, startTime, endTime) => {
    if (!dateString) return "Scheduled";

    const now = new Date();
    const [year, month, day] = dateString.split('-').map(Number);

    // If no times are set, just check the date
    if (!startTime && !endTime) {
      const sessionDate = new Date(year, month - 1, day);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (sessionDate < today) {
        return "Completed";
      } else if (sessionDate > today) {
        return "Scheduled";
      }
      return "Active";
    }

    const [startHours, startMinutes] = startTime ? startTime.split(':').map(Number) : [0, 0];
    const [endHours, endMinutes] = endTime ? endTime.split(':').map(Number) : [23, 59];

    const startDateTime = new Date(year, month - 1, day, startHours, startMinutes, 0);
    const endDateTime = new Date(year, month - 1, day, endHours, endMinutes, 0);

    if (now >= startDateTime && now <= endDateTime) {
      return "Active";
    } else if (now > endDateTime) {
      return "Completed";
    }

    return "Scheduled";
  };

  const getCleanTime = (timeStr) => {
    if (!timeStr) return "";
    const str = String(timeStr);
    if (str.includes('T')) {
      const parts = str.split('T')[1];
      return parts ? parts.substring(0, 5) : "";
    }
    return str.substring(0, 5);
  };

  const { upcomingSessions, pastSessions } = useMemo(() => {
    if (!schedulesData || schedulesData.length === 0 || !studentClass) {
      return { upcomingSessions: [], pastSessions: [] };
    }

    const now = new Date();
    const upcoming = [];
    const past = [];

    schedulesData.forEach((schedule) => {
      const dateStr = typeof schedule.schedule_date === 'string'
        ? schedule.schedule_date.split('T')[0].split(' ')[0]
        : schedule.schedule_date;

      const [year, month, day] = dateStr.split('-').map(Number);
      const cleanStartTime = getCleanTime(schedule.start_time);
      const cleanEndTime = getCleanTime(schedule.end_time);

      let sessionEndDateTime = new Date(year, month - 1, day, 23, 59, 59);
      if (cleanEndTime) {
        const [endHours, endMinutes] = cleanEndTime.split(':').map(Number);
        sessionEndDateTime = new Date(year, month - 1, day, endHours, endMinutes, 0);
      } else if (cleanStartTime) {
        const [startHours, startMinutes] = cleanStartTime.split(':').map(Number);
        sessionEndDateTime = new Date(year, month - 1, day, startHours + 1, startMinutes, 0);
      }

      const sessionData = {
        id: schedule.id || schedule._id,
        date: dateStr,
        startTime: cleanStartTime,
        endTime: cleanEndTime,
        zoomLink: schedule.zoom_link,
        classId: schedule.class_id,
        className: studentClass.class_name || "Class",
        description: schedule.description || "",
        status: getSessionStatus(dateStr, cleanStartTime, cleanEndTime),
      };

      if (sessionEndDateTime >= now) {
        upcoming.push(sessionData);
      } else {
        past.push(sessionData);
      }
    });

    upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { upcomingSessions: upcoming, pastSessions: past };
  }, [schedulesData, studentClass]);

  // Extract clean HTTP/HTTPS URL from potentially messy string (e.g. copied calendar invite)
  const extractUrl = (text) => {
    if (!text) return "";
    const match = String(text).match(/https?:\/\/[^\s]+/);
    if (match) return match[0];
    const cleaned = String(text).trim();
    if (cleaned.startsWith("www.") || cleaned.includes("zoom.us") || cleaned.includes("meet.google")) {
      return "https://" + cleaned;
    }
    return cleaned;
  };

  // Direct join in new tab – no embedded view
  const handleJoin = (session) => {
    const raw = session?.zoomLink;
    const url = extractUrl(raw);
    if (!url || !url.startsWith("http")) {
      showToast("No valid meeting link available for this session.", "error");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
    showToast(`Opening ${session.className} session...`, "success");
  };

  const bg = isDark ? "bg-gray-900" : "bg-gray-100";

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return timeString;
  };

  if (loading) {
    return (
      <div className={`min-h-screen transition-colors ${bg}`}>
        <div className="py-6 text-center">
          <div className={`p-6 rounded-xl shadow ${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
            <p className={isDark ? "text-gray-300" : "text-gray-600"}>Loading online sessions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors pt-4 w-full px-6 sm:px-10 pb-20 ${bg}`}>
      <div className="w-full">
        <StudentPageHeader
          title="Online Sessions"
          description="View and join your scheduled online class sessions."
          actions={studentClass ? (
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${isDark ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-[#010080]"}`}>
              Class: {studentClass.class_name}
            </span>
          ) : undefined}
        />

        {upcomingSessions.length > 0 && (
          <div className="mb-8">
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
              Upcoming Sessions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingSessions.map((session) => {
                const isActive = session.status === "Active";
                const isScheduled = session.status === "Scheduled";

                return (
                  <div
                    key={session.id}
                    className={`relative rounded-2xl overflow-hidden shadow-xl transition-all duration-300 border-2 ${isActive
                      ? `border-green-500 ${isDark ? "bg-green-900/20" : "bg-green-50"}`
                      : `border-[#010080] ${isDark ? "bg-gray-800" : "bg-blue-50"}`
                      } hover:shadow-2xl hover:scale-[1.02]`}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                            {session.className}
                          </h3>
                          {isActive && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold">
                              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                              Active
                            </span>
                          )}
                          {isScheduled && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-semibold">
                              Scheduled
                            </span>
                          )}
                        </div>
                      </div>

                      <div className={`mb-4 p-3 rounded-lg ${isDark ? "bg-gray-700/30" : "bg-white/50"}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                            {formatDate(session.date)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                            {session.startTime && session.endTime
                              ? `${formatTime(session.startTime)} - ${formatTime(session.endTime)}`
                              : session.startTime
                                ? formatTime(session.startTime)
                                : "Time TBD"}
                          </p>
                        </div>
                      </div>

                      {session.zoomLink ? (
                        <button
                          onClick={() => handleJoin(session)}
                          className="block w-full text-center px-4 py-3 rounded-lg font-semibold transition-all bg-[#010080] hover:bg-blue-800 text-white shadow-md hover:scale-[1.02] active:scale-95"
                        >
                          🎥 Join Session
                        </button>
                      ) : (
                        <div className={`w-full text-center px-4 py-3 rounded-lg font-semibold ${isDark ? "bg-gray-700 text-gray-400" : "bg-gray-200 text-gray-500"} cursor-not-allowed`}>
                          Link Not Available
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {pastSessions.length > 0 && (
          <div>
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
              Past Sessions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastSessions.map((session) => (
                <div
                  key={session.id}
                  className={`relative rounded-2xl overflow-hidden shadow-lg border-2 border-gray-300 ${isDark ? "bg-gray-800/50" : "bg-gray-50/50"} opacity-75`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                          {session.className}
                        </h3>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-400 text-white rounded-full text-xs font-semibold">
                          Completed
                        </span>
                      </div>
                    </div>

                    <div className={`mb-4 p-3 rounded-lg ${isDark ? "bg-gray-700/30" : "bg-white/50"}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
                        </svg>
                        <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                          {formatDate(session.date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                          {session.startTime && session.endTime
                            ? `${formatTime(session.startTime)} - ${formatTime(session.endTime)}`
                            : session.startTime
                              ? formatTime(session.startTime)
                              : "Time TBD"}
                        </p>
                      </div>
                    </div>

                    <div className={`w-full text-center px-4 py-3 rounded-lg font-semibold ${isDark ? "bg-gray-700 text-gray-500" : "bg-gray-200 text-gray-500"} cursor-not-allowed`}>
                      Session Ended
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {upcomingSessions.length === 0 && pastSessions.length === 0 && (
          <div className={`p-12 rounded-xl shadow ${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"} text-center`}>
            <svg
              className="w-20 h-20 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              No Online Sessions
            </h3>
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
              {!user?.class_id
                ? "You are not assigned to a class yet."
                : "No online sessions scheduled at the moment."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
