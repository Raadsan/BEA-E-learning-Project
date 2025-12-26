"use client";

import { useEffect, useState } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useGetClassQuery, useGetClassSchedulesQuery } from "@/redux/api/classApi";
import { useToast } from "@/components/Toast";

export default function OnlineSessionsPage() {
  const { isDark } = useDarkMode();
  const { showToast } = useToast();
  const { data: user, isLoading: userLoading } = useGetCurrentUserQuery();
  const [studentClass, setStudentClass] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch student's class
  const { data: classData, isLoading: classLoading } = useGetClassQuery(
    user?.class_id,
    { skip: !user?.class_id }
  );

  // Fetch schedules for student's class
  const { data: schedulesData = [], isLoading: schedulesLoading } = useGetClassSchedulesQuery(
    user?.class_id,
    { skip: !user?.class_id }
  );

  useEffect(() => {
    if (classData) {
      setStudentClass(classData);
    }
  }, [classData]);

  // Helper function to get session status - defined before useEffect that uses it
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
      return "Active"; // Same day but no time specified
    }
    
    // Combine date and time to create full datetime objects
    const [startHours, startMinutes, startSeconds = 0] = startTime ? startTime.split(':').map(Number) : [0, 0, 0];
    const [endHours, endMinutes, endSeconds = 0] = endTime ? endTime.split(':').map(Number) : [23, 59, 59];
    
    const startDateTime = new Date(year, month - 1, day, startHours, startMinutes, startSeconds);
    const endDateTime = new Date(year, month - 1, day, endHours, endMinutes, endSeconds);
    
    // Check if current time is between start and end
    if (now >= startDateTime && now <= endDateTime) {
      return "Active";
    } else if (now > endDateTime) {
      return "Completed";
    }
    
    // If we get here, the session is in the future
    return "Scheduled";
  };

  useEffect(() => {
    if (schedulesData && schedulesData.length > 0 && studentClass) {
      const now = new Date();
      const upcoming = [];
      const past = [];

      schedulesData.forEach((schedule) => {
        // Parse date properly to avoid timezone issues
        const dateStr = typeof schedule.schedule_date === 'string' 
          ? schedule.schedule_date.split('T')[0].split(' ')[0]
          : schedule.schedule_date;
        
        const [year, month, day] = dateStr.split('-').map(Number);
        
        // Use end time to determine if session is past
        let sessionEndDateTime = new Date(year, month - 1, day, 23, 59, 59);
        if (schedule.end_time) {
          const [endHours, endMinutes] = schedule.end_time.split(':').map(Number);
          sessionEndDateTime = new Date(year, month - 1, day, endHours, endMinutes, 0);
        } else if (schedule.start_time) {
          // If no end time but has start time, assume 1 hour duration
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

        // Categorize based on end time
        if (sessionEndDateTime >= now) {
          upcoming.push(sessionData);
        } else {
          past.push(sessionData);
        }
      });

      // Sort upcoming by date (ascending)
      upcoming.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
      });
      // Sort past by date (descending - most recent first)
      past.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
      });

      setUpcomingSessions(upcoming);
      setPastSessions(past);
      setSessions([...upcoming, ...past]);
    } else if (schedulesData && schedulesData.length === 0) {
      setUpcomingSessions([]);
      setPastSessions([]);
      setSessions([]);
    }
  }, [schedulesData, studentClass?.class_name]); // Only depend on class_name, not the whole object

  useEffect(() => {
    if (!userLoading && !classLoading && !schedulesLoading) {
      setLoading(false);
    }
  }, [userLoading, classLoading, schedulesLoading]);

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
    // Handle both HH:MM:SS and HH:MM formats
    const time = timeString.substring(0, 5);
    return time;
  };


  if (loading) {
    return (
      <div className={`min-h-screen transition-colors ${bg}`}>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className={`p-6 rounded-xl shadow ${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"} text-center`}>
              <p className={isDark ? "text-gray-300" : "text-gray-600"}>Loading online sessions...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors ${bg}`}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              Online Sessions
            </h1>
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
              View and join your scheduled online class sessions.
              {studentClass && (
                <span className="ml-2 font-semibold">
                  Class: {studentClass.class_name}
                </span>
              )}
            </p>
          </div>

          {/* Upcoming Sessions */}
          {upcomingSessions.length > 0 && (
            <div className="mb-8">
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                Upcoming Sessions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingSessions.map((session) => {
                  const status = session.status || getSessionStatus(session.date, session.startTime, session.endTime);
                  const isActive = status === "Active";
                  const isScheduled = status === "Scheduled";

                  return (
                    <div
                      key={session.id}
                      className={`relative rounded-2xl overflow-hidden shadow-xl transition-all duration-300 border-2 ${
                        isActive
                          ? `border-green-500 ${isDark ? "bg-green-900/20" : "bg-green-50"}`
                          : `border-[#010080] ${isDark ? "bg-gray-800" : "bg-blue-50"}`
                      } hover:shadow-2xl hover:scale-[1.02]`}
                    >
                      <div className="p-6">
                        {/* Status Badge */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                              {session.className}
                            </h3>
                            {status === "Active" && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold">
                                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                Active
                              </span>
                            )}
                            {status === "Scheduled" && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-semibold">
                                Scheduled
                              </span>
                            )}
                            {status === "Completed" && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-400 text-white rounded-full text-xs font-semibold">
                                Completed
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Date and Time */}
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

                        {/* Description */}
                        {session.description && (
                          <p className={`text-sm mb-4 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                            {session.description}
                          </p>
                        )}

                        {/* Zoom Link Display */}
                        {session.zoomLink && isActive ? (
                          <a
                            href={session.zoomLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full text-center px-4 py-3 rounded-lg font-semibold transition-colors bg-green-500 hover:bg-green-600 text-white"
                          >
                            🎥 Join Live Session
                          </a>
                        ) : session.zoomLink && isScheduled ? (
                          <div className={`w-full text-center px-4 py-3 rounded-lg font-semibold ${isDark ? "bg-gray-700 text-gray-400" : "bg-gray-200 text-gray-500"} cursor-not-allowed`}>
                            Session Not Started Yet
                          </div>
                        ) : !session.zoomLink ? (
                          <div className={`w-full text-center px-4 py-3 rounded-lg font-semibold ${isDark ? "bg-gray-700 text-gray-400" : "bg-gray-200 text-gray-500"} cursor-not-allowed`}>
                            Link Not Available
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Past Sessions */}
          {pastSessions.length > 0 && (
            <div className="mb-8">
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
                            {session.status || "Completed"}
                          </span>
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

                      {session.description && (
                        <p className={`text-sm mb-4 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                          {session.description}
                        </p>
                      )}

                      <div className={`w-full text-center px-4 py-3 rounded-lg font-semibold ${isDark ? "bg-gray-700 text-gray-500" : "bg-gray-200 text-gray-500"} cursor-not-allowed`}>
                        Session Ended
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Sessions */}
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
                  : "No online sessions scheduled at the moment. Check back later for updates."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
