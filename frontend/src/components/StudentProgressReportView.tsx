"use client";

import React, { useRef } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Label
} from "recharts";
import {
    UserIcon,
    AcademicCapIcon,
    CalendarIcon,
    ChartBarIcon,
    ArrowTrendingUpIcon,
    DocumentTextIcon,
    ClockIcon,
    CheckBadgeIcon,
    PrinterIcon,
    CodeBracketIcon,
    BookOpenIcon,
    BriefcaseIcon
} from "@heroicons/react/24/outline";
import DataTable from "./DataTable";

const BRAND_COLOR = "#010080";
const ACCENT_RED = "#f40606";


const StudentProgressReportView = ({
    student = {},
    summary = {},
    performance = [],
    submissions = [],
    recentFeedback = [],
    periods = [],
    selectedPeriod = "",
    onPeriodChange = () => { },
    isLoading = false,
    isDark = false,
    showLedger = true
}) => {
    const printRef = useRef();
    const tabularPrintRef = useRef();
    const isEndOfTerm = selectedPeriod ? (selectedPeriod.toLowerCase().includes('final') || selectedPeriod.toLowerCase().includes('end')) : false;
    const selectedPeriodLabel = selectedPeriod ? (periods.find(p => p.period === selectedPeriod)?.label || selectedPeriod) : "Overall Report";

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const attendanceRate = summary?.attendance_rate || 0;
    const overallGPA = summary?.overall_gpa || 0;

    // CEFR Mapping
    const getCEFRLevel = (score) => {
        if (score >= 95) return { level: "C2", desc: "Proficient" };
        if (score >= 90) return { level: "C1", desc: "Advanced" };
        if (score >= 85) return { level: "B2", desc: "Upper Intermediate" };
        if (score >= 75) return { level: "B1", desc: "Intermediate" };
        if (score >= 60) return { level: "A2+", desc: "Pre-Intermediate" };
        if (score >= 50) return { level: "A2", desc: "Elementary" };
        return { level: "A1", desc: "Beginner" };
    };

    const cefr = getCEFRLevel(overallGPA);


    const ledgerColumns = [
        {
            key: "created_at",
            label: "Date",
            render: (val) => new Date(val).toLocaleDateString()
        },
        {
            key: "title",
            label: "Assessment Title",
            render: (val, row) => (
                <div>
                    <p className={`font-bold ${isDark ? 'text-white' : 'text-[#010080]'}`}>{val}</p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase">{row.type}</p>
                </div>
            )
        },
        {
            key: "score",
            label: "Score",
            className: "text-center",
            render: (val) => (
                <span className="text-[#f40606] font-bold text-lg">{val}%</span>
            )
        },
        {
            key: "max_score",
            label: "Weight",
            className: "text-center",
            render: (val) => <span className="text-gray-500 font-bold">{val}pts</span>
        },
        {
            key: "status",
            label: "Status",
            className: "text-center",
            render: () => (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-tighter">Graded</span>
            )
        }
    ];

    return (
        <div className="w-full">
            {/* Header Controls */}


            <div id="printable-report-content">
                {/* 1. Top Identification Row - Horizontal Cards */}
                <div className={`grid grid-cols-1 md:grid-cols-5 gap-4 mb-8`}>
                    {[
                        { label: "STUDENT NAME", value: student.full_name || 'N/A', subLabel: 'Full Name', icon: <UserIcon className="w-5 h-5" />, type: 'text' },
                        {
                            label: "STUDENT ID",
                            value: student.student_id || 'N/A',
                            subLabel: 'Unique Identifier',
                            icon: <CodeBracketIcon className="w-5 h-5" />,
                            type: 'text'
                        },
                        { label: "COURSE LEVEL", value: student.program_name || student.subprogram_name || 'N/A', subLabel: 'Current Enrollment', icon: <BookOpenIcon className="w-5 h-5" />, type: 'text' },
                        { label: "INSTRUCTOR", value: student.instructor_name || 'N/A', subLabel: 'Assigned Teacher', icon: <BriefcaseIcon className="w-5 h-5" />, type: 'text' },
                        {
                            label: "REPORTING PERIOD",
                            value: selectedPeriod ? (periods.find(p => p.period === selectedPeriod)?.label) : "All Time",
                            subLabel: 'Term timeframe',
                            icon: <CalendarIcon className="w-5 h-5 text-red-600" />,
                            type: 'select'
                        }
                    ].map((item, i) => (
                        <div key={i} className={`p-5 rounded-xl border transition-all h-full flex flex-col justify-between ${isDark ? 'bg-[#06102b] border-[#07203c]' : 'bg-white border-gray-100 shadow-sm'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 text-gray-400`}>
                                        {item.label}
                                    </p>
                                    {item.type === 'select' ? (
                                        <div className="relative group max-w-fit">
                                            <select
                                                value={selectedPeriod}
                                                onChange={(e) => onPeriodChange(e.target.value)}
                                                className={`text-xl font-medium font-serif bg-transparent border-none outline-none cursor-pointer pr-10 appearance-none whitespace-nowrap ${isDark ? 'text-white' : 'text-gray-900'}`}
                                            >
                                                <option value="">Select Period</option>
                                                {periods.map(p => (
                                                    <option key={p.period} value={p.period}>{p.label}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <svg className={`w-5 h-5 text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className={`text-base font-bold leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {item.value}
                                        </p>
                                    )}
                                </div>
                                <div className={`p-2 rounded-lg ml-2 shrink-0 bg-gray-50 text-gray-400 ${isDark ? 'bg-opacity-10' : ''}`}>
                                    {React.cloneElement(item.icon, { className: "w-5 h-5" })}
                                </div>
                            </div>
                            <p className="text-[10px] font-medium text-gray-400">{item.subLabel}</p>
                        </div>
                    ))}
                </div>

                {/* 2. Charts Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Attendance Card */}
                    <div className={`p-6 rounded-xl border ${isDark ? 'bg-[#06102b] border-[#07203c]' : 'bg-white border-gray-100 shadow-sm'}`}>
                        <div className="flex justify-between items-center mb-12">
                            <h3 className={`text-xs font-semibold tracking-[0.2em] ${isDark ? 'text-blue-400' : 'text-[#010080]'}`}>ATTENDANCE RATE</h3>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedPeriodLabel}</span>
                        </div>

                        <div className="flex flex-col items-center justify-center py-10">
                            <h2 className={`text-6xl font-semibold mb-2 ${isDark ? 'text-blue-400' : 'text-[#010080]'}`}>
                                {summary.attendance_rate}%
                            </h2>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">PRESENCE</p>
                        </div>
                    </div>

                    {/* Performance Card */}
                    <div className={`p-6 rounded-xl border ${isDark ? 'bg-[#06102b] border-[#07203c]' : 'bg-white border-gray-100 shadow-sm'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className={`text-xs font-semibold tracking-[0.2em] ${isDark ? 'text-red-400' : 'text-[#f40606]'}`}>OVERALL PERFORMANCE</h3>
                            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{selectedPeriodLabel}</span>
                        </div>

                        <div className="flex flex-col items-center justify-center py-4">
                            <div className="w-64 h-64 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Score', value: summary.overall_gpa },
                                                { name: 'Remaining', value: Math.max(0, 100 - summary.overall_gpa) }
                                            ]}
                                            cx="50%" cy="50%"
                                            innerRadius={75}
                                            outerRadius={95}
                                            startAngle={90}
                                            endAngle={-270}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            <Cell fill="#f40606" />
                                            <Cell fill={isDark ? '#1e293b' : '#f1f5f9'} />
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-4xl font-semibold text-[#f40606]">{Math.round(summary.overall_gpa)}%</span>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">AVERAGE GRADE</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Skills & CEFR Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* CEFR Level Card */}
                    <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center ${isDark ? 'bg-[#06102b] border-[#07203c]' : 'bg-white border-gray-100 shadow-sm'}`}>
                        <div className="w-full flex justify-between items-center mb-12 text-left">
                            <h3 className={`text-xs font-bold tracking-[0.2em] ${isDark ? 'text-blue-400' : 'text-[#010080]'}`}>CEFR LEVEL</h3>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedPeriodLabel}</span>
                        </div>

                        <div className="w-40 h-40 rounded-full border-2 border-gray-50 dark:border-gray-800 flex items-center justify-center mb-6">
                            <span className={`text-5xl font-bold ${isDark ? 'text-blue-400' : 'text-[#010080]'}`}>{cefr.level}</span>
                        </div>

                        <h4 className={`text-base font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{cefr.level} - {cefr.desc}</h4>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">ESTIMATED PROFICIENCY</p>
                    </div>

                    {/* Skill Performance Card */}
                    <div className={`p-6 rounded-xl border ${isDark ? 'bg-[#06102b] border-[#07203c]' : 'bg-white border-gray-100 shadow-sm'}`}>
                        <div className="flex justify-between items-center mb-12">
                            <h3 className={`text-xs font-bold tracking-[0.2em] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>SKILL PERFORMANCE</h3>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedPeriodLabel} DATA</span>
                        </div>

                        <div className="space-y-5">
                            {performance.map((skill, i) => {
                                const colors = ['#010080', '#4b47a4', '#010080', '#f40606', '#f95150', '#010080'];
                                return (
                                    <div key={i} className="flex items-center gap-4">
                                        <span className={`w-24 text-[10px] font-bold tracking-tight ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {skill.category}
                                        </span>
                                        <div className={`flex-1 h-4 rounded-sm overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                            <div
                                                className="h-full transition-all duration-1000"
                                                style={{
                                                    width: `${Math.max(skill.average, 5)}%`,
                                                    backgroundColor: colors[i % colors.length]
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* 4. Feedback Section */}
                {recentFeedback.length > 0 && (
                    <div className={`p-6 rounded-xl border mb-8 ${isDark ? 'bg-[#06102b] border-[#07203c]' : 'bg-white border-gray-100 shadow-sm'}`}>
                        <div className="flex items-center gap-3 mb-6">
                            <CheckBadgeIcon className="w-6 h-6 text-green-500" />
                            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#010080]'}`}>Teacher Feedback</h3>
                        </div>
                        <div className="space-y-6">
                            {recentFeedback.map((fb, idx) => (
                                <div key={idx} className={`p-4 rounded-2xl ${isDark ? 'bg-[#0d1a2e]' : 'bg-gray-50'}`}>
                                    <p className={`text-sm leading-relaxed mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>"{fb.feedback || fb.comment}"</p>
                                    <div className="flex justify-between items-center text-xs font-bold text-gray-500 border-t pt-3 border-gray-200 dark:border-gray-700">
                                        <span>BY: {fb.teacher_name}</span>
                                        <span>{new Date(fb.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 5. Academic Performance Ledger (Using DataTable) */}
                {showLedger && (
                    <div className="report-ledger-container">
                        <DataTable
                            title="Academic Performance Ledger"
                            columns={ledgerColumns}
                            data={submissions}
                            showAddButton={false}
                            emptyMessage="No graded assignments found for this period."
                        />
                    </div>
                )}
            </div>

        </div>
    );
};

export default StudentProgressReportView;
