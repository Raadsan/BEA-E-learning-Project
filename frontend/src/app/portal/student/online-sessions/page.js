"use client";

import { useState, useMemo } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useGetClassQuery, useGetClassSchedulesQuery } from "@/redux/api/classApi";
import { useToast } from "@/components/Toast";

export default function OnlineSessionsPage() {
  const { isDark } = useDarkMode();
  const { showToast } = useToast();
  const { data: user, isLoading: userLoading } = useGetCurrentUserQuery();
  const [activeMeeting, setActiveMeeting] = useState(null);

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

      let sessionEndDateTime = new Date(year, month - 1, day, 23, 59, 59);
      if (schedule.end_time) {
        const [endHours, endMinutes] = schedule.end_time.split(':').map(Number);
        sessionEndDateTime = new Date(year, month - 1, day, endHours, endMinutes, 0);
      } else if (schedule.start_time) {
        const [startHours, startMinutes] = schedule.start_time.split(':').map(Number);
        sessionEndDateTime = new Date(year, month - 1, day, startHours + 1, startMinutes, 0);
      }

      const sessionData = {
        id: schedule.id || schedule._id,
        date: dateStr,
        startTime: schedule.start_time || "",
        endTime: schedule.end_time || "",
        zoomLink: schedule.zoom_link,
        classId: schedule.class_id,
        className: studentClass.class_name || "Class",
        description: schedule.description || "",
        status: getSessionStatus(dateStr, schedule.start_time || "", schedule.end_time || ""),
      };

      if (sessionEndDateTime >= now) {
        upcoming.push(sessionData);
      } else {
        past.push(sessionData);
      }
    });

    upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
    past.sort((a, b) => new Date(b.date) - new Date(a.date));

    return { upcomingSessions: upcoming, pastSessions: past };
  }, [schedulesData, studentClass]);

  // Helper function to handle Zoom/Meet link transformations
  const getEmbeddableUrl = (url) => {
    if (!url) return "";

    // Zoom Link Transformation
    if (url.includes("zoom.us/j/")) {
      // Convert standard join link to web client format
      // https://zoom.us/j/MEETING_ID -> https://zoom.us/wc/join/MEETING_ID
      return url.replace("/j/", "/wc/join/");
    }

    return url;
  };

  const handleOpenInWindow = (url) => {
    if (!url) return;

    const width = window.innerWidth * 0.9;
    const height = window.innerHeight * 0.9;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    window.open(
      url,
      "OnlineSession",
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
    );
    showToast("Opening session in a dedicated window...", "info");
  };

  const handleJoinMeeting = (session) => {
    setActiveMeeting(session);
    showToast(`Joining ${session.className} session...`, "success");
  };

  const handleBackToSessions = () => {
    setActiveMeeting(null);
  };

  const bg = isDark ? "bg-gray-900" : "bg-gray-100";

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return timeString.substring(0, 5);
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

  if (activeMeeting) {
    const embedUrl = getEmbeddableUrl(activeMeeting.zoomLink);
    const isGoogleMeet = activeMeeting.zoomLink?.includes("meet.google.com");
    const isZoom = activeMeeting.zoomLink?.includes("zoom.us");

    // We prioritize the feeling of STAYING INSIDE by keeping the Sidebar/Header
    // and showing a premium "Press to Enter" state for blocked providers.
    const blocksEmbedding = isGoogleMeet || isZoom;

    return (
      <div className={`min-h-screen transition-colors pt-12 w-full px-6 sm:px-10 pb-20 ${bg}`}>
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          <div className="mb-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToSessions}
                className={`p-2 rounded-xl transition-all ${isDark ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-white hover:bg-gray-100 text-gray-900 border border-gray-200 shadow-sm"}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className={`text-3xl font-bold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                  {activeMeeting.className}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="flex h-2 w-2 rounded-full bg-green-500 animate-ping"></span>
                  <p className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Session is Live • Instructor: {studentClass?.teacher_name || "Assigned Teacher"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={`flex-1 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 ${isDark ? "border-gray-800 bg-gray-900" : "border-white bg-[#f8fafc]"} relative flex flex-col items-center justify-center min-h-[68vh]`}>
            {blocksEmbedding ? (
              <div className="text-center p-12 max-w-2xl relative z-10">
                <div className="mb-10 relative inline-block">
                  <div className="w-40 h-40 bg-gradient-to-br from-[#010080] to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(1,0,128,0.4)] transition-transform hover:scale-105 duration-500">
                    {isGoogleMeet ? (
                      <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    ) : (
                      <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21 7.2L16 11V7a1 1 0 00-1-1H3a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-4l5 3.8a.5.5 0 00.8-.4V7.6a.5.5 0 00-.8-.4z" />
                      </svg>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-green-500 rounded-full border-4 border-gray-900 flex items-center justify-center">
                    <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
                  </div>
                </div>

                <h2 className={`text-4xl font-extrabold mb-5 ${isDark ? "text-white" : "text-gray-900"} tracking-tight`}>
                  Enter the Classroom
                </h2>

                <p className={`mb-12 ${isDark ? "text-gray-400" : "text-gray-600"} text-xl font-medium max-w-lg mx-auto leading-relaxed`}>
                  This session is hosted on **{isGoogleMeet ? "Google Meet" : "Zoom"}**.
                  Click below to open the secure classroom view while keeping your BEA student portal active.
                </p>

                <div className="space-y-6">
                  <button
                    onClick={() => handleOpenInWindow(activeMeeting.zoomLink)}
                    className="w-full sm:w-auto px-16 py-6 bg-[#010080] text-white rounded-[2rem] font-bold text-2xl transition-all hover:scale-[1.04] hover:shadow-[0_25px_60px_-15px_rgba(1,0,128,0.5)] active:scale-95 flex items-center justify-center gap-4 group"
                  >
                    <span>Join Session Now</span>
                    <svg className="w-8 h-8 group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>

                  <div>
                    <a
                      href={activeMeeting.zoomLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:underline ${isDark ? "text-gray-500 hover:text-white" : "text-gray-400 hover:text-[#010080]"}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Use standard browser tab
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <iframe
                  src={embedUrl}
                  className="w-full h-full border-none"
                  allow="camera; microphone; fullscreen; display-capture; autoplay"
                  title="Online Session Meeting"
                ></iframe>

                <div className="absolute top-6 right-6 group">
                  <button
                    onClick={() => handleOpenInWindow(activeMeeting.zoomLink)}
                    className={`p-4 rounded-2xl shadow-2xl border transition-all transform hover:scale-110 active:scale-95 ${isDark ? "bg-gray-800/90 border-gray-700 text-white" : "bg-white/90 border-gray-200 text-[#010080]"} backdrop-blur-xl`}
                    title="Pop out to integrated window"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                </div>
              </>
            )}

            {/* Background Decorative Elements */}
            <div className={`absolute top-0 left-0 w-64 h-64 bg-[#010080] opacity-[0.03] blur-[100px] pointer-events-none`}></div>
            <div className={`absolute bottom-0 right-0 w-96 h-96 bg-blue-500 opacity-[0.03] blur-[120px] pointer-events-none`}></div>
          </div>

          <div className={`mt-8 flex items-center justify-between p-6 rounded-3xl ${isDark ? "bg-gray-800/40 border-gray-800" : "bg-white border-gray-100 shadow-sm"} border`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>System Integration Policy</h3>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"} mt-0.5`}>
                  Zoom and Google Meet prohibit direct embedding for security. We've optimized this window to provide the best possible performance while staying synced with your progress.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors pt-12 w-full px-6 sm:px-10 pb-20 ${bg}`}>
      <div className="w-full">
        <div className="mb-12">
          <h1 className={`text-4xl font-bold mb-4 tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
            Online Sessions
          </h1>
          <p className={`text-lg font-medium opacity-60 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            View and join your scheduled online class sessions.
            {studentClass && (
              <span className="ml-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold">
                Class: {studentClass.class_name}
              </span>
            )}
          </p>
        </div>

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

                      {session.zoomLink && isActive ? (
                        <button
                          onClick={() => handleJoinMeeting(session)}
                          className="block w-full text-center px-4 py-3 rounded-lg font-semibold transition-colors bg-green-500 hover:bg-green-600 text-white shadow-md"
                        >
                          🎥 Join Live Session
                        </button>
                      ) : (
                        <div className={`w-full text-center px-4 py-3 rounded-lg font-semibold ${isDark ? "bg-gray-700 text-gray-400" : "bg-gray-200 text-gray-500"} cursor-not-allowed`}>
                          {session.zoomLink ? "Session Not Started" : "Link Not Available"}
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
