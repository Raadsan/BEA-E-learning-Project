import { useState, useMemo, useEffect } from "react";
import { useGetTimelinesQuery } from "@/redux/api/courseTimelineApi";
import { useGetAcademicCalendarQuery } from "@/redux/api/academicCalendarApi";

const CountdownCircle = ({ value, label, max, color, isDark }) => {
    const radius = 32; // Slightly smaller for dashboard
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / max) * circumference;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative flex items-center justify-center">
                {/* Background Circle */}
                <svg className="w-20 h-20 transform -rotate-90">
                    <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        fill="transparent"
                        stroke={isDark ? "#374151" : "#E5E7EB"}
                        strokeWidth="5"
                    />
                    {/* Progress Circle */}
                    <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        fill="transparent"
                        stroke={color}
                        strokeWidth="5"
                        strokeDasharray={circumference}
                        style={{ strokeDashoffset: offset }}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-linear"
                    />
                </svg>
                <span className={`absolute text-xl font-bold ${isDark ? "text-white" : "text-[#010080]"}`}>
                    {String(value).padStart(2, '0')}
                </span>
            </div>
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-500"}`}>{label}</span>
        </div>
    );
};

const DashboardTermCounter = ({ isDark, user }) => {
    const { data: dbTimelines = [], isLoading } = useGetTimelinesQuery();

    // Get current date info for calendar check (Memoized to prevent instability)
    const { currentMonth, currentYear } = useMemo(() => {
        const d = new Date();
        return {
            currentMonth: d.toLocaleString('en-US', { month: 'long' }),
            currentYear: d.getFullYear()
        };
    }, []); // Only calculate once on mount or if we wanted to sync with daily changes

    const subprogramId = user?.chosen_subprogram || user?.subprogram_id;

    // Fetch Academic Calendar to check if classes are scheduled
    const { data: academicCalendar, isLoading: calendarLoading } = useGetAcademicCalendarQuery(
        useMemo(() => ({ subprogramId, month: currentMonth, year: currentYear }), [subprogramId, currentMonth, currentYear]),
        { skip: !subprogramId }
    );

    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, label: "", termSerial: "" });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const termData = useMemo(() => {
        if (!dbTimelines || dbTimelines.length === 0) return [];
        // Helper to parse "DD/MM/YYYY" to Date object
        const parseDateStr = (dateStr) => {
            if (!dateStr) return null;
            if (dateStr.includes('-')) return new Date(dateStr); // already YYYY-MM-DD
            const [day, month, year] = dateStr.split('/');
            return new Date(`${year}-${month}-${day}`);
        };

        return dbTimelines.map(term => {
            const start = parseDateStr(term.start_date || term.startDate);
            const end = parseDateStr(term.end_date || term.endDate);
            if (end) end.setHours(23, 59, 59, 999); // Include full end day
            return {
                serial: term.term_serial || term.termSerial,
                start,
                end
            };
        }).filter(t => t.start && t.end);
    }, [dbTimelines]);

    useEffect(() => {
        if (!mounted || isLoading) return;

        if (termData.length === 0) {
            setTimeLeft(prev => {
                if (prev.label === "No Active Cycle") return prev;
                return { days: 0, hours: 0, minutes: 0, seconds: 0, label: "No Active Cycle", termSerial: "" };
            });
            return;
        }

        const updateTimer = () => {
            const now = new Date();
            let targetTerm = null;
            let mode = "waiting"; // "active" or "waiting"

            // 1. Check if there's an ACTIVE term (Now is between start and end)
            const active = termData.find(term => now >= term.start && now <= term.end);

            if (active) {
                targetTerm = active;
                mode = "active";
            } else {
                // 2. No active term, look for the NEXT upcoming term
                const upcoming = termData
                    .filter(term => term.start > now)
                    .sort((a, b) => a.start - b.start);

                if (upcoming.length > 0) {
                    targetTerm = upcoming[0];
                    mode = "waiting";
                }
            }

            if (targetTerm) {
                const difference = mode === "active" ? targetTerm.end.getTime() - now.getTime() : 0;

                setTimeLeft(prev => {
                    const newDays = difference > 0 ? Math.floor(difference / (1000 * 60 * 60 * 24)) : 0;
                    const newHours = difference > 0 ? Math.floor((difference / (1000 * 60 * 60)) % 24) : 0;
                    const newMinutes = difference > 0 ? Math.floor((difference / 1000 / 60) % 60) : 0;
                    const newSeconds = difference > 0 ? Math.floor((difference / 1000) % 60) : 0;
                    const newLabel = mode === "active" ? "Ends In" : "Next Start";
                    const newTermSerial = targetTerm.serial;

                    if (prev.days === newDays &&
                        prev.hours === newHours &&
                        prev.minutes === newMinutes &&
                        prev.seconds === newSeconds &&
                        prev.label === newLabel &&
                        prev.termSerial === newTermSerial) {
                        return prev;
                    }

                    return {
                        days: newDays,
                        hours: newHours,
                        minutes: newMinutes,
                        seconds: newSeconds,
                        label: newLabel,
                        termSerial: newTermSerial
                    };
                });
            } else {
                setTimeLeft(prev => {
                    if (prev.label === "No Active Cycle") return prev;
                    return { days: 0, hours: 0, minutes: 0, seconds: 0, label: "No Active Cycle", termSerial: "" };
                });
            }
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);

        return () => clearInterval(timer);
    }, [termData, mounted, isLoading]);

    if (!mounted || isLoading) return null;
    // If no label (init) or explicitly "No Active Cycle", hide. 
    // But if it's "No Scheduled Classes" (our new state), we SHOW it as zero.
    if (!timeLeft.label || timeLeft.label === "No Active Cycle") return null;

    return (
        <div className={`mb-8 w-full h-full p-6 rounded-2xl shadow-lg border relative overflow-hidden ${isDark ? "bg-[#0f172a] border-gray-800" : "bg-white border-blue-100"}`}>
            {/* Background Decoration */}
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10 ${isDark ? 'bg-blue-400' : 'bg-blue-600'}`}></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>
                        <span className={`w-2 h-2 rounded-full animate-pulse ${timeLeft.label === "No Scheduled Classes" ? "bg-red-500" : "bg-blue-500"}`}></span>
                        Term Cycle Information
                    </div>
                    <h2 className={`text-2xl font-bold mb-1 ${isDark ? "text-white" : "text-[#010080]"}`}>
                        {timeLeft.termSerial}
                    </h2>
                    <p className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {timeLeft.label === "No Scheduled Classes" ? "No Timetable Assigned" : `Cycle ${timeLeft.label}`}
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                    <CountdownCircle value={timeLeft.days} label="Days" max={30} color={timeLeft.label === "No Scheduled Classes" ? "#9CA3AF" : "#A855F7"} isDark={isDark} />
                    <CountdownCircle value={timeLeft.hours} label="Hours" max={24} color={timeLeft.label === "No Scheduled Classes" ? "#9CA3AF" : "#EF4444"} isDark={isDark} />
                    <CountdownCircle value={timeLeft.minutes} label="Minutes" max={60} color={timeLeft.label === "No Scheduled Classes" ? "#9CA3AF" : "#3B82F6"} isDark={isDark} />
                    <CountdownCircle value={timeLeft.seconds} label="Seconds" max={60} color={timeLeft.label === "No Scheduled Classes" ? "#9CA3AF" : "#10B981"} isDark={isDark} />
                </div>
            </div>
        </div>
    );
};

export default DashboardTermCounter;
