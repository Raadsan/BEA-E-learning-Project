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
    PrinterIcon
} from "@heroicons/react/24/outline";

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

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#010080] border-t-transparent"></div>
            </div>
        );
    }

    const attendanceRate = summary?.attendance_rate || 0;
    const overallGPA = summary?.overall_gpa || 0;

    // CEFR Mapping
    const getCEFRLevel = (score) => {
        if (score >= 90) return { level: "C2", desc: "Proficient" };
        if (score >= 80) return { level: "C1", desc: "Advanced" };
        if (score >= 70) return { level: "B2", desc: "Upper Intermediate" };
        if (score >= 60) return { level: "B1", desc: "Intermediate" };
        if (score >= 50) return { level: "A2", desc: "Elementary" };
        return { level: "A1", desc: "Beginner" };
    };

    const cefr = getCEFRLevel(overallGPA);

    const handlePrint = () => {
        const printContent = document.getElementById('printable-report-content').innerHTML;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>BEA - Student Progress Report</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        @media print {
                            .no-print { display: none; }
                            body { -webkit-print-color-adjust: exact; }
                        }
                    </style>
                </head>
                <body class="bg-white p-10 font-sans">
                    ${printContent}
                    <div class="mt-20 border-t pt-10 grid grid-cols-2 gap-20 px-10">
                        <div class="text-center">
                            <div class="border-b-2 border-dashed border-gray-400 w-full mb-2 h-10"></div>
                            <p class="font-bold text-[#010080]">Academic Director</p>
                        </div>
                        <div class="text-center">
                            <div class="border-b-2 border-dashed border-gray-400 w-full mb-2 h-10"></div>
                            <p class="font-bold text-[#010080]">School Principal</p>
                        </div>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

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
                <span className="text-[#f40606] font-black text-lg">{val}%</span>
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
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-tighter">Graded</span>
            )
        }
    ];

    return (
        <div className="w-full">
            {/* Header Controls */}
            <div className="flex justify-between items-center mb-8 no-print">
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Student Progress Report
                </h2>
                <div className="flex items-center gap-4">
                    {periods.length > 0 && (
                        <select
                            value={selectedPeriod}
                            onChange={(e) => onPeriodChange(e.target.value)}
                            className={`px-4 py-2.5 rounded-xl border font-bold text-sm ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-[#010080]'} focus:outline-none focus:ring-2 focus:ring-[#010080]/20 transition-all`}
                        >
                            <option value="">Full History</option>
                            {periods.map(p => (
                                <option key={p.period} value={p.period}>{p.label}</option>
                            ))}
                        </select>
                    )}
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-[#010080] text-white px-6 py-2.5 rounded-xl hover:bg-blue-900 transition-all shadow-lg hover:shadow-blue-900/20 font-medium"
                    >
                        <PrinterIcon className="w-5 h-5" />
                        Print Official Report
                    </button>
                </div>
            </div>

            <div id="printable-report-content">
                {/* 1. Top Identification Row */}
                <div className={`grid grid-cols-1 md:grid-cols-5 gap-4 mb-8`}>
                    {[
                        { label: "Student Name", value: student.full_name, icon: <UserIcon className="w-5 h-5" /> },
                        { label: "Student ID", value: student.student_id ? `#${student.student_id}` : 'N/A', icon: <DocumentTextIcon className="w-5 h-5" /> },
                        { label: "Program", value: student.program_name || 'N/A', icon: <AcademicCapIcon className="w-5 h-5" /> },
                        { label: "Level", value: student.subprogram_name || 'N/A', icon: <ArrowTrendingUpIcon className="w-5 h-5" /> },
                        {
                            label: "Reporting Period",
                            value: selectedPeriod ? (periods.find(p => p.period === selectedPeriod)?.label) : "All Time",
                            icon: <CalendarIcon className="w-5 h-5 text-red-500" />
                        }
                    ].map((item, i) => (
                        <div key={i} className={`p-4 rounded-2xl border transition-all ${isDark ? 'bg-[#06102b] border-[#07203c]' : 'bg-white border-gray-100 shadow-sm'}`}>
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-[#010080]'}`}>
                                    {item.icon}
                                </div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{item.label}</p>
                            </div>
                            <p className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-[#010080]'}`}>
                                {item.value}
                            </p>
                        </div>
                    ))}
                </div>

                {/* 2. Main Analytics Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Attendance Circular Gauge */}
                    <div className={`p-8 rounded-3xl border ${isDark ? 'bg-[#06102b] border-[#07203c]' : 'bg-white border-gray-100 shadow-sm'}`}>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#010080]'}`}>Attendance Rate</h3>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${attendanceRate >= 80 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                {attendanceRate >= 80 ? 'Excellent' : 'Action Required'}
                            </div>
                        </div>

                        <div className="h-[250px] relative flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: "Attended", value: attendanceRate },
                                            { name: "Missing", value: 100 - attendanceRate }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={90}
                                        startAngle={225}
                                        endAngle={-45}
                                        paddingAngle={0}
                                        dataKey="value"
                                    >
                                        <Cell fill={BRAND_COLOR} strokeWidth={0} />
                                        <Cell fill={isDark ? "#07203c" : "#f1f5f9"} strokeWidth={0} />
                                        <Label
                                            value={`${attendanceRate}%`}
                                            position="center"
                                            className="text-4xl font-bold"
                                            fill={isDark ? "#fff" : "#010080"}
                                            style={{ fontSize: '32px', fontWeight: '800' }}
                                        />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Overall Performance Circular Gauge */}
                    <div className={`p-8 rounded-3xl border ${isDark ? 'bg-[#06102b] border-[#07203c]' : 'bg-white border-gray-100 shadow-sm'}`}>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#010080]'}`}>Overall Performance</h3>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${overallGPA >= 70 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                GPA: {overallGPA}%
                            </div>
                        </div>

                        <div className="h-[250px] relative flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: "Score", value: overallGPA },
                                            { name: "Remaining", value: 100 - overallGPA }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={90}
                                        startAngle={225}
                                        endAngle={-45}
                                        paddingAngle={0}
                                        dataKey="value"
                                    >
                                        <Cell fill={ACCENT_RED} strokeWidth={0} />
                                        <Cell fill={isDark ? "#07203c" : "#f1f5f9"} strokeWidth={0} />
                                        <Label
                                            value={`${overallGPA}%`}
                                            position="center"
                                            className="text-4xl font-bold"
                                            fill={isDark ? "#fff" : "#f40606"}
                                            style={{ fontSize: '32px', fontWeight: '800' }}
                                        />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* 3. Skill & CEFR Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* CEFR Level Badge */}
                    <div className={`p-8 rounded-3xl border flex flex-col items-center justify-center text-center ${isDark ? 'bg-[#06102b] border-[#07203c]' : 'bg-white border-gray-100 shadow-sm'}`}>
                        <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center mb-4 ${isDark ? 'border-blue-500/20 bg-blue-500/5' : 'border-[#010080]/10 bg-blue-50'}`}>
                            <span className="text-4xl font-black text-[#010080]">{cefr.level}</span>
                        </div>
                        <h4 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-[#010080]'}`}>{cefr.desc}</h4>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">CEFR Proficiency Level</p>
                    </div>

                    {/* Skill breakdown horizontal bars */}
                    <div className={`lg:col-span-2 p-8 rounded-3xl border ${isDark ? 'bg-[#06102b] border-[#07203c]' : 'bg-white border-gray-100 shadow-sm'}`}>
                        <div className="flex items-center gap-3 mb-8">
                            <ChartBarIcon className="w-6 h-6 text-[#f40606]" />
                            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#010080]'}`}>Skill Performance Breakdown</h3>
                        </div>

                        <div className="space-y-6">
                            {performance.map((skill, i) => (
                                <div key={i}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className={`text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{skill.category}</span>
                                        <span className="text-sm font-bold text-[#010080]">{skill.average}%</span>
                                    </div>
                                    <div className={`h-3 w-full rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                        <div
                                            className="h-full rounded-full transition-all duration-1000"
                                            style={{
                                                width: `${skill.average}%`,
                                                backgroundColor: i % 2 === 0 ? BRAND_COLOR : ACCENT_RED
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 4. Feedback Section */}
                {recentFeedback.length > 0 && (
                    <div className={`p-8 rounded-3xl border mb-8 ${isDark ? 'bg-[#06102b] border-[#07203c]' : 'bg-white border-gray-100 shadow-sm'}`}>
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
