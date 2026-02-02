"use client";

import { useState, useMemo, useEffect } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import DataTable from "@/components/DataTable";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useGetTimetableQuery } from "@/redux/api/timetableApi";
import { useGetEventsQuery } from "@/redux/api/eventApi";
import { useGetAcademicCalendarQuery } from "@/redux/api/academicCalendarApi";
import { useGetStudentReviewsQuery, useGetTeachersToReviewQuery } from "@/redux/api/reviewApi";
import { useGetAssignmentsQuery } from "@/redux/api/assignmentApi";
import { useGetSubprogramsByProgramIdQuery } from "@/redux/api/subprogramApi";
import { useCreateNotificationMutation } from "@/redux/api/notificationApi";
import { useToast } from "@/components/Toast";
import { timelineData, parseDate } from "@/data/timelineData";

const CountdownCircle = ({ value, label, max, color, isDark }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / max) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex items-center justify-center">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="transparent"
            stroke={isDark ? "#374151" : "#E5E7EB"}
            strokeWidth="6"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={circumference}
            style={{ strokeDashoffset: offset }}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <span className={`absolute text-3xl font-bold ${isDark ? "text-white" : "text-[#010080]"}`}>
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>{label}</span>
    </div>
  );
};

const TermCountdown = ({ isDark }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, label: "" });

  const termData = useMemo(() => {
    return timelineData.map(term => ({
      serial: term.termSerial,
      start: parseDate(term.startDate).toISOString().split('T')[0],
      end: parseDate(term.endDate).toISOString().split('T')[0]
    }));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      let targetDate = null;
      let label = "";

      for (const term of termData) {
        const startDate = new Date(term.start);
        const endDate = new Date(term.end);

        if (now < startDate) {
          targetDate = startDate;
          label = `${term.serial} Starts In`;
          break;
        } else if (now < endDate) {
          targetDate = endDate;
          label = `${term.serial} Ends In`;
          break;
        }
      }

      if (targetDate) {
        const difference = targetDate - now;
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
          label
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [termData]);

  if (!timeLeft.label) return null;

  return (
    <div className={`mb-12 p-8 rounded-3xl shadow-xl border ${isDark ? "bg-[#1f2937]/50 border-gray-700 backdrop-blur-md" : "bg-white border-gray-100"}`}>
      <div className="flex flex-col items-center gap-8">
        <h2 className={`text-xl font-bold tracking-wider uppercase ${isDark ? "text-blue-400" : "text-[#010080]"}`}>
          {timeLeft.label}
        </h2>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          <CountdownCircle value={timeLeft.days} label="Days" max={30} color="#A855F7" isDark={isDark} />
          <CountdownCircle value={timeLeft.hours} label="Hours" max={24} color="#EF4444" isDark={isDark} />
          <CountdownCircle value={timeLeft.minutes} label="Minutes" max={60} color="#A855F7" isDark={isDark} />
          <CountdownCircle value={timeLeft.seconds} label="Seconds" max={60} color="#EF4444" isDark={isDark} />
        </div>
      </div>
    </div>
  );
};

export default function TermCycleInfoPage() {
  const { isDark } = useDarkMode();
  const { showToast } = useToast();

  const { data: user } = useGetCurrentUserQuery();
  const subprogramId = user?.chosen_subprogram || user?.subprogram_id;
  const programId = user?.program_id || user?.chosen_program_id || user?.chosen_program;

  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('en-US', { month: 'long' }));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [nextSubprogramId, setNextSubprogramId] = useState("");

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const years = [2025, 2026, 2027, 2028, 2029, 2030];

  // 1. Term End Check
  const termEnded = useMemo(() => {
    const lastTerm = timelineData[timelineData.length - 1];
    if (!lastTerm) return false;
    return new Date() > parseDate(lastTerm.endDate);
  }, []);

  // 2. Pass Check (Success Rate >= 50%)
  const { data: assignments = [] } = useGetAssignmentsQuery({ subprogram_id: subprogramId }, { skip: !subprogramId });
  const hasPassed = useMemo(() => {
    if (!assignments || assignments.length === 0) return false;
    const totalEarned = assignments.reduce((sum, a) => sum + (Number(a.score) || 0), 0);
    const totalPossible = assignments.reduce((sum, a) => sum + (Number(a.total_points) || 0), 0);
    return totalPossible > 0 && (totalEarned / totalPossible) >= 0.5;
  }, [assignments]);

  // 3. Teacher Evaluated Student Check
  const { data: studentReviews = [] } = useGetStudentReviewsQuery(user?.student_id || user?.id, { skip: !user });
  const teacherEvaluated = useMemo(() => {
    return studentReviews.length > 0;
  }, [studentReviews]);

  // 4. Student Evaluated Teacher Check
  const { data: teachersToReview = [] } = useGetTeachersToReviewQuery(undefined, { skip: !user });
  const studentEvaluated = useMemo(() => {
    return (teachersToReview || []).length === 0;
  }, [teachersToReview]);

  const { data: availableSubprograms = [] } = useGetSubprogramsByProgramIdQuery(programId, { skip: !programId || !showRequestModal });
  const [createNotification] = useCreateNotificationMutation();

  // For specific range events (holidays, etc)
  const monthIndex = months.indexOf(selectedMonth);
  const startOfMonth = new Date(selectedYear, monthIndex, 1).toISOString().split('T')[0];
  const endOfMonth = new Date(selectedYear, monthIndex + 1, 0).toISOString().split('T')[0];

  const { data: weeklyTimetable = [], isLoading: timetableLoading } = useGetTimetableQuery(subprogramId, {
    skip: !subprogramId
  });

  const { data: events = [], isLoading: eventsLoading } = useGetEventsQuery({
    subprogramId,
    start: startOfMonth,
    end: endOfMonth
  }, {
    skip: !subprogramId
  });

  const { data: academicCalendar = [], isLoading: calendarLoading } = useGetAcademicCalendarQuery({
    subprogramId,
    month: selectedMonth,
    year: selectedYear
  }, {
    skip: !subprogramId
  });

  const { calendarRows, gridDays } = useMemo(() => {
    const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"];
    const maxWeeks = 4;
    const rows = [];

    for (let w = 1; w <= maxWeeks; w++) {
      const row = { id: w, week: `Week ${w}` };
      days.forEach(d => row[d] = "-");

      academicCalendar.forEach(entry => {
        if (entry.week_number === w && days.includes(entry.day)) {
          row[entry.day] = entry.activity_title;
        }
      });
      rows.push(row);
    }

    return { calendarRows: rows, gridDays: days };
  }, [academicCalendar]);

  const calendarColumns = useMemo(() => [
    {
      key: "week",
      label: "Weeks",
      width: "100px",
      render: (cellValue, row) => <span className="font-extrabold text-[#010080] dark:text-blue-400">{row.week}</span>
    },
    ...gridDays.map(day => ({
      key: day,
      label: day,
      render: (cellValue, row) => (
        <div className="py-2">
          {row[day] !== "-" ? (
            <p className="font-bold leading-tight text-gray-900 dark:text-white text-sm">
              {row[day]}
            </p>
          ) : (
            <span className="text-gray-300 dark:text-gray-600 italic text-xs">-</span>
          )}
        </div>
      )
    }))
  ], [gridDays]);

  const specificEvents = useMemo(() => {
    return events.map(event => ({
      ...event,
      displayDate: new Date(event.event_date).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric'
      }),
      dayName: new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'long' })
    }));
  }, [events]);

  const handleRequestCourse = async () => {
    if (!nextSubprogramId) {
      showToast("Please select a subprogram", "error");
      return;
    }
    setRequestLoading(true);
    try {
      // 1. Formal Request Record
      await createLevelUpRequest({
        requested_subprogram_id: nextSubprogramId
      }).unwrap();

      // 2. Alert Admin (Notification)
      await createNotification({
        user_id: null, // Broadcast to admins
        type: 'course_request',
        title: `[LEVEL UP] ${user?.full_name} Ready for Next Level`,
        message: `Student ${user?.full_name} (${user?.student_id}) has completed their current term and is requesting promotion to: ${availableSubprograms.find(s => s.id == nextSubprogramId)?.subprogram_name}.`,
        metadata: {
          student_id: user?.student_id,
          requested_subprogram_id: nextSubprogramId,
          source: 'student_level_up_request'
        }
      }).unwrap();

      showToast("Level-up request submitted successfully!", "success");
      setShowRequestModal(false);
    } catch (err) {
      console.error("Request error:", err);
      showToast(err?.data?.error || "Failed to submit request", "error");
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors pt-12 w-full px-6 sm:px-10 pb-20 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className={`text-3xl font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              Term Cycle Information
            </h1>
            <p className={`text-base font-normal ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Access your academic schedule and term progress.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className={`px-3 py-2 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/10 ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-700'}`}
              >
                {months.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className={`px-3 py-2 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/10 ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-700'}`}
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Term Countdown Timer - Only show if academic plan is created for this month */}
        {!calendarLoading && (academicCalendar || []).length > 0 && (
          <TermCountdown isDark={isDark} />
        )}

        {/* Weekly Schedule Grid */}
        <div className="mb-12">
          <DataTable
            title={`Weekly Academic Plan - ${selectedMonth} ${selectedYear}`}
            columns={calendarColumns}
            data={calendarRows}
            showAddButton={false}
            isLoading={timetableLoading || eventsLoading || calendarLoading}
            emptyMessage="No academic plan scheduled for this month."
          />
        </div>

        {/* Holiday / Special Events Section */}
        {specificEvents.length > 0 && (
          <div className={`mb-12 rounded-3xl overflow-hidden border shadow-xl ${isDark ? "bg-red-900/10 border-red-900/20" : "bg-red-50/30 border-red-100/50"}`}>
            <div className="p-6 border-b border-red-100 dark:border-red-900/20">
              <h3 className={`text-lg font-bold flex items-center gap-3 ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Holidays & Important Dates
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {specificEvents.map(event => (
                <div key={event.id} className={`p-4 rounded-2xl border flex items-center gap-4 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'}`}>
                  <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                    <span className="text-xs font-bold uppercase tracking-tighter">{event.displayDate.split(" ")[0]}</span>
                    <span className="text-xl font-black">{event.displayDate.split(" ")[1]}</span>
                  </div>
                  <div>
                    <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{event.title}</h4>
                    <p className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{event.dayName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className={`mt-12 text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
          * Specific holiday dates may vary based on lunar sightings for Eid celebrations.
          <br />
          * Weekly classes follow the pattern established by the administration.
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRequestModal(false)} />
          <div className={`relative w-full max-w-md rounded-2xl shadow-2xl p-8 border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
            <h2 className="text-2xl font-bold mb-4">Request Next Level</h2>
            <p className="opacity-70 mb-6 text-sm">
              Congratulations on completing your current term! Please select the next subprogram you wish to join.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-2">Target Level</label>
                <select
                  value={nextSubprogramId}
                  onChange={(e) => setNextSubprogramId(e.target.value)}
                  className={`w-full p-4 rounded-xl border outline-none transition-all focus:border-blue-500 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                >
                  <option value="">Select Level</option>
                  {(availableSubprograms || []).filter(s => s.id != subprogramId).map(s => (
                    <option key={s.id} value={s.id}>{s.subprogram_name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className={`flex-1 py-3 rounded-xl font-bold ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestCourse}
                  disabled={requestLoading || !nextSubprogramId}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
                >
                  {requestLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

