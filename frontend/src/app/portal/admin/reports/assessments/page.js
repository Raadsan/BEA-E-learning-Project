"use client";

import React, { useState, useMemo } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import {
    useGetAssessmentStatsQuery,
    useGetAssessmentDistributionQuery,
    useGetRecentAssessmentsQuery,
    useGetAssessmentGenderStatsQuery,
    useGetClassAssessmentActivityQuery,
    useGetDetailedStudentListQuery
} from "@/redux/api/reportApi";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useGetSubprogramsByProgramIdQuery } from "@/redux/api/subprogramApi";
import { useGetClassesBySubprogramIdQuery } from "@/redux/api/classApi";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import DataTable from "@/components/DataTable";

// Brand Colors
const brandColors = ["#010080", "#4b47a4", "#18178a", "#f40606", "#f95150"];
const GENDER_COLORS = { Male: "#010080", Female: "#f40606", Unknown: "#999" };

// Modal component for full report preview (Ported from students/page.js)
const ReportModal = ({ isOpen, onClose, data, onPrint, onExport, isDark, title }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className={`w-full max-w-7xl max-h-[90vh] flex flex-col rounded-2xl shadow-xl overflow-hidden border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                {/* Modal Header */}
                <div className={`p-6 border-b flex items-center justify-between ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                    <div>
                        <h2 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {title || "Student Performance Report"}
                        </h2>
                        <p className={`text-[10px] font-medium mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Detailed grade report grouped by program
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onPrint}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border transition-all ${isDark ? 'bg-gray-700 hover:bg-gray-600 border-gray-600 text-white' : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-700'
                                }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            Print
                        </button>
                        <button
                            onClick={onExport}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all bg-[#010080] hover:bg-[#010080]/90 text-white shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Export CSV
                        </button>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                {/* Modal Body with Horizontal Scroll */}
                <div className="flex-1 overflow-auto bg-white dark:bg-[#1a2035] p-0 custom-scrollbar" id="printable-report">
                    <div className="w-full">
                        <table className="w-full text-left text-xs border-collapse table-fixed" style={{ minWidth: "1200px" }}>
                            <thead className="sticky top-0 z-10">
                                <tr className={`${isDark ? 'bg-white text-gray-900' : 'bg-[#010080] text-white'}`}>
                                    <th className="w-32 px-4 py-4 uppercase font-bold tracking-wider border-b border-gray-100 dark:border-gray-700">ID</th>
                                    <th className="w-60 px-4 py-4 uppercase font-bold tracking-wider border-b border-gray-100 dark:border-gray-700">Full Name</th>
                                    <th className="w-48 px-4 py-4 uppercase font-bold tracking-wider border-b border-gray-100 dark:border-gray-700">Program</th>
                                    <th className="w-48 px-4 py-4 uppercase font-bold tracking-wider border-b border-gray-100 dark:border-gray-700">Class</th>
                                    <th className="w-24 px-4 py-4 uppercase font-bold tracking-wider border-b border-gray-100 dark:border-gray-700 text-center">Score%</th>
                                    <th className="w-32 px-4 py-4 uppercase font-bold tracking-wider border-b border-gray-100 dark:border-gray-700">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {[...data].sort((a, b) => (a.chosen_program || "").localeCompare(b.chosen_program || "")).map((student, idx) => (
                                    <tr
                                        key={student.student_id || idx}
                                        className={`${idx % 2 === 0 ? 'bg-white dark:bg-[#1a2035]' : 'bg-gray-50/50 dark:bg-[#252b40]'} hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors`}
                                    >
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 truncate">{student.student_id}</td>
                                        <td className="px-4 py-3 font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 truncate">{student.student_name || student.full_name}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 truncate">{student.chosen_program}</td>
                                        <td className={`px-4 py-3 font-medium border-b border-gray-100 dark:border-gray-800 truncate ${!student.class_name ? 'text-red-500 italic' : 'text-gray-900 dark:text-gray-300'}`}>
                                            {student.class_name || student.subprogram_title || 'Not Assigned'}
                                        </td>
                                        <td className="px-4 py-3 text-center border-b border-gray-100 dark:border-gray-800 font-bold">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${parseFloat(student.overall_average) >= 80 ? 'bg-green-100 text-green-700' : parseFloat(student.overall_average) >= 50 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                                {student.overall_average ? `${parseFloat(student.overall_average).toFixed(1)}%` : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${['approved', 'Active'].includes(student.status) ? 'bg-green-100 text-green-700' :
                                                ['pending', 'Pending'].includes(student.status) ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                {student.status || 'Active'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className={`p-4 border-t flex items-center justify-between text-[10px] font-medium ${isDark ? 'bg-gray-900/50 border-gray-700 text-gray-500' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                    <div className="flex items-center gap-8">
                        <span>Total Records: {data.length}</span>
                        <span>Generated: {new Date().toLocaleString()}</span>
                    </div>
                    <span>BEA E-Learning System • Grade Report</span>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page { size: landscape; margin: 0.5cm; }
                    body * { visibility: hidden !important; }
                    #printable-report, #printable-report * { visibility: visible !important; }
                    #printable-report {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        background: white !important;
                        color: black !important;
                        padding: 0 !important;
                        font-size: 6pt !important;
                    }
                    table { table-layout: fixed !important; width: 100% !important; border-collapse: collapse !important; }
                    th, td { border: 0.1pt solid #ccc !important; padding: 2pt !important; -webkit-print-color-adjust: exact; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                    th { background-color: #010080 !important; color: white !important; font-weight: bold !important; }
                }
            `}</style>
        </div>
    );
};

export default function AssessmentReportsPage() {
    const { isDark } = useDarkMode();

    // Filters
    const [selectedProgram, setSelectedProgram] = useState("");
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [selectedProgramId, setSelectedProgramId] = useState("");
    const [selectedSubprogram, setSelectedSubprogram] = useState("");
    const [selectedClass, setSelectedClass] = useState("");

    // Dynamic Data for Filters
    const { data: programsData } = useGetProgramsQuery();
    const programs = programsData?.programs || programsData || [];

    const { data: subprogramsData, isFetching: isFetchingSubs } = useGetSubprogramsByProgramIdQuery(selectedProgramId, { skip: !selectedProgramId });
    const subprograms = subprogramsData || [];

    const { data: classesData, isFetching: isFetchingClasses } = useGetClassesBySubprogramIdQuery(selectedSubprogram, { skip: !selectedSubprogram });
    const classes = classesData || [];

    // Query Params
    const queryParams = useMemo(() => {
        const p = {};
        if (selectedProgram) p.program = selectedProgram;
        if (selectedClass) p.class_id = selectedClass;
        return p;
    }, [selectedProgram, selectedClass]);

    // Fetch Report Data
    const { data: statsData, isLoading: statsLoading } = useGetAssessmentStatsQuery(queryParams);
    const stats = statsData || {};

    const { data: distData, isLoading: distLoading } = useGetAssessmentDistributionQuery(queryParams);
    const scoreDistribution = distData || [];

    // Gender Stats
    const { data: genderData } = useGetAssessmentGenderStatsQuery(queryParams);

    // Detailed Student List for Modal
    const { data: detailedStudentsData, isLoading: isLoadingStudents } = useGetDetailedStudentListQuery({ program: selectedProgram });
    const studentListData = detailedStudentsData?.data?.students || detailedStudentsData?.students || [];

    const handleExportCSV = (dataToExport) => {
        const headers = ['ID', 'Name', 'Program', 'Class', 'Score', 'Status'];
        const rows = dataToExport.map(s => [
            s.student_id, s.student_name || s.full_name, s.chosen_program,
            s.class_name || s.subprogram_title || 'Not Assigned',
            `${s.overall_average}%`, s.status
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BEA_Grade_Report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const formatChartData = (data) => {
        if (!data) return [];
        return [
            { name: 'Male', value: data.male },
            { name: 'Female', value: data.female },
            { name: 'Unknown', value: data.unknown }
        ].filter(item => item.value >= 0); // Keep 0s or filter? Keeping 0s helps chart stability but maybe filter if 0. Let's keep structure.
    };

    const placementGender = formatChartData(genderData?.placement);
    const proficiencyGender = formatChartData(genderData?.proficiency);

    const getTotal = (data) => data.reduce((acc, curr) => acc + curr.value, 0);

    // Class Activity
    const { data: classActivityData } = useGetClassAssessmentActivityQuery(queryParams);
    const classActivity = classActivityData || [];

    const { data: recentData, isLoading: recentLoading } = useGetRecentAssessmentsQuery();
    const recentAssessments = recentData || [];

    // Chart Data Processing
    // Score Distribution (Grouped by Type)
    const processedDistribution = useMemo(() => {
        if (!scoreDistribution) return [];
        // Group by range_name
        const groups = {};
        const ranges = ['0-20', '21-40', '41-60', '61-80', '81-100'];

        // Initialize placeholders
        ranges.forEach(r => {
            groups[r] = { range_name: r, 'Placement Test': 0, 'Proficiency Test': 0, 'Assignment': 0 };
        });

        scoreDistribution.forEach(item => {
            if (groups[item.range_name]) {
                groups[item.range_name][item.type] = item.count;
            }
        });

        return Object.values(groups);
    }, [scoreDistribution]);


    // Handlers
    const handleProgramChange = (e) => {
        const val = e.target.value;
        const prog = programs.find(p => p.title === val || p.id == val);
        setSelectedProgram(prog?.title || "");
        setSelectedProgramId(prog?.id || "");
        setSelectedSubprogram("");
        setSelectedClass("");
    };

    const handleClearFilters = () => {
        setSelectedProgram("");
        setSelectedProgramId("");
        setSelectedSubprogram("");
        setSelectedClass("");
    };

    // Chart Themes
    const chartGridColor = isDark ? '#374151' : '#f1f1f1';
    const chartLabelColor = isDark ? '#9CA3AF' : '#6B7280';

    // Summary Boxes
    const summaryBoxes = [
        {
            label: "Total Created",
            val: stats.totalAssessments || 0,
            sub: "Assignments & Tests",
            icon: (
                <svg className="w-6 h-6 text-[#010080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            )
        },
        {
            label: "Total Submissions",
            val: stats.totalSubmissions || 0,
            sub: "Graded Submissions",
            icon: (
                <svg className="w-6 h-6 text-[#4b47a4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )
        },
        {
            label: "Average Score",
            val: `${stats.avgScore || 0}%`,
            sub: "Overall Performance",
            icon: (
                <svg className="w-6 h-6 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            )
        },
        {
            label: "Pending Grading",
            val: stats.pendingGrading || 0,
            sub: "Needs Attention",
            icon: (
                <svg className="w-6 h-6 text-[#f40606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        }
    ];

    // Table Columns
    const columns = [
        {
            label: "Title",
            key: "title",
            render: (val, row) => (
                <div>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{val}</span>
                    <span className="block text-[10px] text-gray-400 font-normal">{new Date(row.due_date).toLocaleDateString()}</span>
                </div>
            )
        },
        {
            label: "Type",
            key: "type",
            render: (val) => (
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${val === 'Assignment' ? 'bg-purple-100 text-purple-700' : val === 'Placement Test' ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-700'}`}>
                    {val}
                </span>
            )
        },
        { label: "Class", key: "class_name" },
        { label: "Submissions", key: "submissions" },
        {
            label: "Avg Score",
            key: "avg_score",
            render: (val) => (
                <span className={`font-bold ${val >= 80 ? 'text-green-600' : val >= 50 ? 'text-blue-600' : 'text-red-500'}`}>
                    {Math.round(val || 0)}%
                </span>
            )
        }
    ];

    return (
        <div className={`flex-1 min-w-0 flex flex-col px-4 sm:px-8 py-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-[1800px] mx-auto w-full space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            Assessment Reports
                        </h1>
                        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Detailed insights into student performance and assessment distribution
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowStudentModal(true)}
                            className={`${isDark ? 'bg-white hover:bg-gray-100 text-gray-900 border-none' : 'bg-[#010080] hover:bg-[#010080]/90 text-white'} px-6 py-3 rounded-lg flex items-center gap-2 transition-all font-bold shadow-md disabled:opacity-70`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            View Student Performance
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-500 mb-2">1. Select Program</label>
                            <select
                                value={selectedProgram}
                                onChange={handleProgramChange}
                                className={`w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white'}`}
                            >
                                <option value="">Select All Programs</option>
                                {programs.map(p => <option key={p.id} value={p.title}>{p.title}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-500 mb-2">2. Select Sub-Program</label>
                            <select
                                value={selectedSubprogram}
                                onChange={(e) => { setSelectedSubprogram(e.target.value); setSelectedClass(""); }}
                                disabled={!selectedProgramId || isFetchingSubs}
                                className={`w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white'}`}
                            >
                                <option value="">{isFetchingSubs ? 'Loading...' : 'Select All Subprograms'}</option>
                                {subprograms.map(s => <option key={s.id} value={s.id}>{s.subprogram_name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-500 mb-2">3. Select Class</label>
                            <div className="flex gap-2">
                                <select
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    disabled={!selectedSubprogram || isFetchingClasses}
                                    className={`flex-1 px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white'}`}
                                >
                                    <option value="">{isFetchingClasses ? 'Loading...' : 'Select All Classes'}</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
                                </select>
                                <button
                                    onClick={handleClearFilters}
                                    className={`px-4 py-2 rounded-lg border font-bold text-xs transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {summaryBoxes.map((box, i) => (
                        <div key={i} className={`p-8 rounded-2xl border transition-all hover:shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{box.label}</p>
                                <div className={`p-2 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    {box.icon}
                                </div>
                            </div>
                            <h3 className={`text-4xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {statsLoading ? "..." : box.val}
                            </h3>
                            <p className="text-[10px] font-medium text-gray-400 mt-3">{box.sub}</p>
                        </div>
                    ))}
                </div>

                {/* Charts Section - 2x2 Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 1. Score Distribution (Comparison) */}
                    <div className={`p-8 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                        <h3 className="text-sm font-bold mb-8 uppercase tracking-widest text-[#010080]">Score Comparison (Placement vs Proficiency)</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={processedDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                                    <XAxis dataKey="range_name" tick={{ fill: chartLabelColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: chartLabelColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                                    <Bar dataKey="Placement Test" fill="#010080" radius={[4, 4, 0, 0]} name="Placement" barSize={20} />
                                    <Bar dataKey="Proficiency Test" fill="#f40606" radius={[4, 4, 0, 0]} name="Proficiency" barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 3. Placement Gender */}
                    {getTotal(placementGender) > 0 && (
                        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Placement Test Gender</h3>
                                <span className={`text-xs font-bold px-2 py-1 rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                    Total: {getTotal(placementGender)}
                                </span>
                            </div>
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={placementGender} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {placementGender.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={GENDER_COLORS[entry.name]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center flex-wrap gap-4 text-[10px] mt-4">
                                {placementGender.map((entry, index) => (
                                    <span key={index} className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: GENDER_COLORS[entry.name] }}></span>
                                        {entry.name} ({entry.value})
                                    </span>
                                ))}
                                {placementGender.length === 0 && <span className="text-gray-400">No data available</span>}
                            </div>
                        </div>
                    )}

                    {/* 1b. Assignment Score Distribution */}
                    <div className={`p-8 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                        <h3 className="text-sm font-bold mb-8 uppercase tracking-widest text-[#4b47a4]">Assignment Grade Distribution</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={processedDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                                    <XAxis dataKey="range_name" tick={{ fill: chartLabelColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: chartLabelColor, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="Assignment" fill="#4b47a4" radius={[4, 4, 0, 0]} name="Assignment" barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 4. Proficiency Gender */}
                    {getTotal(proficiencyGender) > 0 && (
                        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Proficiency Test Gender</h3>
                                <span className={`text-xs font-bold px-2 py-1 rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                    Total: {getTotal(proficiencyGender)}
                                </span>
                            </div>
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={proficiencyGender} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {proficiencyGender.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={GENDER_COLORS[entry.name]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center flex-wrap gap-4 text-[10px] mt-4">
                                {proficiencyGender.map((entry, index) => (
                                    <span key={index} className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: GENDER_COLORS[entry.name] }}></span>
                                        {entry.name} ({entry.value})
                                    </span>
                                ))}
                                {proficiencyGender.length === 0 && <span className="text-gray-400">No data available</span>}
                            </div>

                        </div>
                    )}

                    {/* 2. Class Activity */}
                    <div className={`p-8 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                        <h3 className="text-sm font-bold mb-8 uppercase tracking-widest text-[#4b47a4]">Assignments by Class (Top 10)</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={classActivity} layout="vertical" margin={{ left: 50 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chartGridColor} />
                                    <XAxis type="number" tick={{ fill: chartLabelColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis dataKey="class_name" type="category" width={100} tick={{ fill: chartLabelColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="count" fill="#4b47a4" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>


                </div>

                {/* Recent Assessments Table */}
                <div className="mt-8">
                    <DataTable
                        title="Recent Assessments"
                        columns={columns}
                        data={recentAssessments}
                        showAddButton={false}
                    />
                </div>
            </div>

            {/* Student Performance Modal - Replaced with Advanced ReportModal */}
            <ReportModal
                isOpen={showStudentModal}
                onClose={() => setShowStudentModal(false)}
                data={studentListData}
                onPrint={() => window.print()}
                onExport={() => handleExportCSV(studentListData)}
                isDark={isDark}
                title="Student Performance Overview"
            />
        </div>
    );
}
