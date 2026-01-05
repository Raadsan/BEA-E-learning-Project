"use client";

import { useState, useMemo, useEffect } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import DataTable from "@/components/DataTable";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useGetTimetableQuery } from "@/redux/api/timetableApi";
import { useGetEventsQuery } from "@/redux/api/eventApi";

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

  const termData = useMemo(() => [
    { serial: "BEA-01", start: "2026-01-31", end: "2026-02-25" },
    { serial: "BEA-02", start: "2026-03-07", end: "2026-04-08" },
    { serial: "BEA-03", start: "2026-04-18", end: "2026-05-06" },
    { serial: "BEA-04", start: "2026-05-16", end: "2026-06-10" },
    { serial: "BEA-05", start: "2026-06-20", end: "2026-07-18" },
    { serial: "BEA-06", start: "2026-07-25", end: "2026-08-12" },
    { serial: "BEA-07", start: "2026-08-22", end: "2026-09-16" },
    { serial: "BEA-08", start: "2026-09-23", end: "2026-10-21" },
    { serial: "BEA-09", start: "2026-10-31", end: "2026-11-25" },
    { serial: "BEA-10", start: "2026-12-05", end: "2026-12-30" },
  ], []);

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

  const { data: user } = useGetCurrentUserQuery();
  const subprogramId = user?.chosen_subprogram;

  const [currentDate, setCurrentDate] = useState(new Date());

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];

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

  const timetableEntries = useMemo(() => {
    if (!subprogramId) return [];

    const sessions = [];

    // 1. Add Specific Events
    events.forEach(event => {
      const dateObj = new Date(event.event_date);
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
      const displayDate = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      sessions.push({
        id: `event-${event.id}`,
        date: event.event_date,
        displayDate,
        day: dayName,
        type: event.type === 'exam' ? "Exam" : (event.type === 'holiday' ? 'Holiday' : 'Event'),
        subject: event.title || "Event",
        teacher_name: "-",
        isEvent: true
      });
    });

    // 2. Add Weekly Recurring Classes
    weeklyTimetable.forEach(cls => {
      let displayDate = "Weekly Pattern";
      if (cls.date) {
        const dateObj = new Date(cls.date);
        displayDate = dateObj.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      }

      sessions.push({
        id: `class-${cls.id}`,
        date: cls.date || null,
        displayDate,
        day: cls.day,
        type: cls.type || "Class",
        subject: cls.subject,
        teacher_name: cls.teacher_name || "Unassigned",
        isEvent: false
      });
    });

    // Sort by day and then by date if present
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return sessions.sort((a, b) => {
      const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      if (dayDiff !== 0) return dayDiff;
      if (a.date && b.date) return new Date(a.date) - new Date(b.date);
      return 0;
    });
  }, [weeklyTimetable, events, subprogramId]);

  const timetableColumns = [
    {
      key: "date",
      label: "Date",
      render: (row) => {
        const isWeekly = row.displayDate === "Weekly Pattern";
        return (
          <span className={`font-bold ${isWeekly ? 'text-gray-400 text-[10px] uppercase tracking-wider' : 'text-black dark:text-white'}`}>
            {row.displayDate}
          </span>
        );
      }
    },
    {
      key: "day",
      label: "Day",
      render: (row) => <span className="font-semibold text-gray-900 dark:text-white uppercase text-xs tracking-wider">{row.day}</span>
    },
    {
      key: "type",
      label: "Type",
      render: (row) => {
        let colorClass = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
        if (row.type === 'Holiday') colorClass = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
        if (row.type === 'Exam' || row.type === 'exam') colorClass = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";

        // Weekly Class Types
        if (row.type === 'Lecture') colorClass = "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300";
        if (row.type === 'Lab') colorClass = "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300";
        if (row.type === 'Tutorial') colorClass = "bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300";

        return (
          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${colorClass}`}>
            {row.type}
          </span>
        );
      }
    },
    {
      key: "subject",
      label: "Subject",
      render: (row) => <span className="font-medium text-gray-900 dark:text-white">{row.subject}</span>
    },
    {
      key: "teacher_name",
      label: "Teacher / Note",
      render: (row) => {
        if (row.isEvent) {
          return (
            <span className="text-gray-400 text-xs italic font-medium uppercase tracking-tighter">
              {row.type === 'Holiday' ? 'Holiday - No Class' : 'School Event'}
            </span>
          );
        }
        return <span className="text-gray-500 text-sm font-medium">{row.teacher_name}</span>
      }
    },
  ];

  return (
    <div className={`min-h-screen transition-colors pt-12 w-full px-6 sm:px-10 pb-20 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="w-full">
        {/* Header */}
        <div className="mb-12">
          <h1 className={`text-4xl font-bold mb-4 tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
            Term Cycle Information
          </h1>
          <p className={`text-lg font-medium opacity-60 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Your subprogram's academic schedule and important dates.
          </p>
        </div>

        {/* Term Countdown Timer */}
        <TermCountdown isDark={isDark} />

        {/* Dynamic Timetable - Replacing the old static cycles table */}
        <DataTable
          title="Academic Timetable"
          columns={timetableColumns}
          data={timetableEntries}
          showAddButton={false}
          isLoading={timetableLoading || eventsLoading}
        />

        {/* Footer Note */}
        <div className={`mt-12 text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
          * Specific holiday dates may vary based on lunar sightings for Eid celebrations.
          <br />
          * Weekly classes follow the pattern established by the administration.
        </div>
      </div>
    </div>
  );
}
