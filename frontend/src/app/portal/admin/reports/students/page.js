"use client";

import { useState, useMemo, useEffect } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import {
    useGetStudentStatsQuery,
    useGetProgramDistributionQuery,
    useGetSubprogramDistributionQuery,
    useGetPerformanceOverviewQuery,
    useGetDetailedStudentListQuery,
    useLazyGetDetailedStudentListQuery,
    useGetAttendanceAnalyticsQuery,
    useGetAssignmentCompletionAnalyticsQuery,
    useGetConsolidatedStatsQuery
} from "@/redux/api/reportApi";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useGetSubprogramsByProgramIdQuery } from "@/redux/api/subprogramApi";
import { useGetClassesBySubprogramIdQuery } from "@/redux/api/classApi";
import Link from "next/link";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import DataTable from "@/components/DataTable";

// Brand Colors
const brandColors = ["#010080", "#4b47a4", "#18178a", "#f40606", "#f95150"];

// Modal component for full report preview
const ReportModal = ({ isOpen, onClose, data, onPrint, onExport, isDark, title }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className={`w-full max-w-7xl max-h-[90vh] flex flex-col rounded-2xl shadow-xl overflow-hidden border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                {/* Modal Header */}
                <div className={`p-6 border-b flex items-center justify-between ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                    <div>
                        <h2 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {title || "Student Information Report"}
                        </h2>
                        <p className={`text-[10px] font-medium mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Comprehensive student database summary including regular and IELTS/TOEFL streams
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
                        <table className="w-full text-left text-xs border-collapse table-fixed" style={{ minWidth: "1400px" }}>
                            <thead className="sticky top-0 z-10">
                                <tr className={`${isDark ? 'bg-white text-gray-900' : 'bg-[#010080] text-white'}`}>
                                    <th className="w-32 px-4 py-4 uppercase font-bold tracking-wider border-b border-gray-100 dark:border-gray-700">ID</th>
                                    <th className="w-60 px-4 py-4 uppercase font-bold tracking-wider border-b border-gray-100 dark:border-gray-700">Full Name</th>
                                    <th className="w-24 px-4 py-4 uppercase font-bold tracking-wider border-b border-gray-100 dark:border-gray-700 text-center">Sex</th>
                                    <th className="w-20 px-4 py-4 uppercase font-bold tracking-wider border-b border-gray-100 dark:border-gray-700 text-center">Age</th>
                                    <th className="w-64 px-4 py-4 uppercase font-bold tracking-wider border-b border-gray-100 dark:border-gray-700">Email</th>
                                    <th className="w-40 px-4 py-4 uppercase font-bold tracking-wider border-b border-gray-100 dark:border-gray-700">Phone</th>
                                    <th className="w-40 px-4 py-4 uppercase font-bold tracking-wider border-b border-gray-100 dark:border-gray-700">Country</th>
                                    <th className="w-40 px-4 py-4 uppercase font-bold tracking-wider border-b border-gray-100 dark:border-gray-700">City</th>
                                    <th className="w-48 px-4 py-4 uppercase font-bold tracking-wider border-b border-gray-100 dark:border-gray-700">Program</th>
                                    <th className="w-56 px-4 py-4 uppercase font-bold tracking-wider border-b border-gray-100 dark:border-gray-700">Sub-Program</th>
                                    <th className="w-48 px-4 py-4 uppercase font-bold tracking-wider border-b border-gray-100 dark:border-gray-700">Class</th>
                                    <th className="w-24 px-4 py-4 uppercase font-bold tracking-wider border-b border-gray-100 dark:border-gray-700 text-center">Att%</th>
                                    <th className="w-24 px-4 py-4 uppercase font-bold tracking-wider border-b border-gray-100 dark:border-gray-700 text-center">Score%</th>
                                    <th className="w-32 px-4 py-4 uppercase font-bold tracking-wider border-b border-gray-100 dark:border-gray-700">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {data.map((student, idx) => (
                                    <tr
                                        key={student.student_id || idx}
                                        className={`${idx % 2 === 0 ? 'bg-white dark:bg-[#1a2035]' : 'bg-gray-50/50 dark:bg-[#252b40]'} hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors`}
                                    >
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 truncate">{student.student_id}</td>
                                        <td className="px-4 py-3 font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 truncate">{student.full_name}</td>
                                        <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">{student.sex || '-'}</td>
                                        <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">{student.age || '-'}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 truncate">{student.email}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 truncate">{student.phone || '-'}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 truncate">{student.residency_country || '-'}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 truncate">{student.residency_city || '-'}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 truncate">{student.chosen_program}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 font-medium truncate">{student.subprogram_name || student.chosen_subprogram || 'N/A'}</td>
                                        <td className={`px-4 py-3 font-medium border-b border-gray-100 dark:border-gray-800 truncate ${!student.class_name || student.class_name === 'Unassigned' ? 'text-red-500 italic' : 'text-gray-900 dark:text-gray-300'}`}>
                                            {!student.class_name || student.class_name === 'Unassigned' ? 'Not Assigned' : student.class_name}
                                        </td>
                                        <td className="px-4 py-3 text-center border-b border-gray-100 dark:border-gray-800 font-bold">{student.attendance_rate}%</td>
                                        <td className="px-4 py-3 text-center border-b border-gray-100 dark:border-gray-800 font-bold">{student.overall_average}%</td>
                                        <td className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${['approved', 'Active'].includes(student.status) ? 'bg-green-100 text-green-700' :
                                                ['pending', 'Pending'].includes(student.status) ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                {student.status}
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
                    <span>BEA E-Learning System • Combined Registry</span>
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

export default function StudentReportsPage() {
    const { isDark } = useDarkMode();

    // Filters & States
    const [selectedProgram, setSelectedProgram] = useState("");
    const [selectedProgramId, setSelectedProgramId] = useState("");
    const [selectedSubprogram, setSelectedSubprogram] = useState("");
    const [selectedClass, setSelectedClass] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 100;
    const [sortConfig, setSortConfig] = useState({ key: 'registration_date', direction: 'desc' });
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportModalTitle, setReportModalTitle] = useState("Student Information Report");
    const [reportStudents, setReportStudents] = useState([]);

    const [triggerFetchAll, { isLoading: isFetchingFullReport }] = useLazyGetDetailedStudentListQuery();

    // Dynamic Data for Filters
    const { data: programsData } = useGetProgramsQuery();
    const programs = programsData?.programs || programsData || [];

    const { data: subprogramsData, isFetching: isFetchingSubs } = useGetSubprogramsByProgramIdQuery(selectedProgramId, { skip: !selectedProgramId });
    const subprograms = subprogramsData || [];

    const { data: classesData, isFetching: isFetchingClasses } = useGetClassesBySubprogramIdQuery(selectedSubprogram, { skip: !selectedSubprogram });
    const classes = classesData || [];

    // Dashboard Data
    const queryParams = useMemo(() => {
        const p = {};
        if (selectedProgram) p.program = selectedProgram;
        if (selectedClass) p.class_id = selectedClass;
        return p;
    }, [selectedProgram, selectedClass]);

    const { data: statsData, isLoading: statsLoading } = useGetStudentStatsQuery(queryParams);
    const stats = statsData?.data || statsData || {};

    const { data: programDistResp } = useGetProgramDistributionQuery(queryParams);
    const programDist = programDistResp?.data || programDistResp || [];

    const { data: consolidatedResp } = useGetConsolidatedStatsQuery(queryParams);
    const consolidated = consolidatedResp?.data || consolidatedResp || {};

    const { data: completionResp } = useGetAssignmentCompletionAnalyticsQuery({
        program: selectedProgram,
        class_id: selectedClass
    });
    const completionDataRaw = completionResp?.data || completionResp || [];
    const completionData = completionDataRaw.map(item => ({
        name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
        value: parseInt(item.count)
    }));

    const { data: detailedStudentsData, isLoading: studentsLoading } = useGetDetailedStudentListQuery({
        program: selectedProgram,
        subprogram_id: selectedSubprogram,
        class_id: selectedClass,
        search: searchTerm,
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
        sort_by: sortConfig.key,
        order: sortConfig.direction
    });

    const students = detailedStudentsData?.data?.students || detailedStudentsData?.students || [];

    // Dashboard Configuration (Icons + 3-column Layout)
    const allSummaryBoxes = [
        {
            label: "Total Students",
            val: stats.totalStudents,
            sub: "Regular + IELTS/TOEFL",
            icon: (
                <svg className="w-6 h-6 text-[#010080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            id: 'total'
        },
        {
            label: "Pending Approval",
            val: stats.pendingStudents,
            sub: "Awaiting review",
            icon: (
                <svg className="w-6 h-6 text-[#f95150]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            id: 'pending'
        },
        {
            label: "Assigned to Class",
            val: stats.assignedToClass,
            sub: "Students in active classes",
            icon: (
                <svg className="w-6 h-6 text-[#4b47a4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
            id: 'assigned'
        },
        {
            label: "High Performers",
            val: stats.highPerformers,
            sub: "Score ≥ 80% (Assignments)",
            icon: (
                <svg className="w-6 h-6 text-[#f40606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
                </svg>
            ),
            id: 'performers'
        },
        {
            label: "New (This Week)",
            val: stats.lastWeekRegistrations,
            sub: "Latest enrollments",
            icon: (
                <svg className="w-6 h-6 text-[#010080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            id: 'new'
        }
    ];

    const summaryBoxes = allSummaryBoxes.filter(box => {
        // Hide Assigned for Proficiency Test
        if (selectedProgram === 'Proficiency Test' && box.id === 'assigned') return false;

        // Show High Performers ONLY for Proficiency Test
        if (box.id === 'performers' && selectedProgram !== 'Proficiency Test') return false;

        return true;
    });

    const enrollmentTrend = consolidated.enrollment || [];
    const genderData = (consolidated.gender || []).filter(g => g.name !== 'Unknown' && g.name !== 'unknown');
    const statusData = (consolidated.status || []).filter(s => s.name !== 'Paid' && s.name !== 'paid');

    // Chart Themes
    const chartGridColor = isDark ? '#374151' : '#f1f1f1';
    const chartLabelColor = isDark ? '#9CA3AF' : '#6B7280';

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
        setSearchTerm("");
    };

    const handleOpenFullReport = async (isProgramReport = false) => {
        try {
            const { data: fullData } = await triggerFetchAll({
                limit: 5000,
                program: selectedProgram,
                subprogram_id: selectedSubprogram,
                class_id: selectedClass,
                sort_by: 'full_name',
                order: 'asc'
            });

            const rawList = fullData?.data?.students || fullData?.students || [];
            if (rawList.length > 0) {
                setReportStudents(rawList);
                setReportModalTitle(isProgramReport ? `Program Report: ${selectedProgram}` : "Full Student Report");
                setIsReportModalOpen(true);
            } else {
                // Show toast if no data?
                // showToast("No students found for report", "info");
            }
        } catch (err) {
            console.error("Failed to fetch full report:", err);
        }
    };

    const handleExportCSV = (dataToExport) => {
        const headers = ['ID', 'Name', 'Sex', 'Age', 'Email', 'Phone', 'Country', 'City', 'Program', 'Subprogram', 'Class', 'Attendance', 'Score', 'Status'];
        const rows = dataToExport.map(s => [
            s.student_id, s.full_name, s.sex || '-', s.age || '-', s.email, s.phone || '-',
            s.residency_country || '-', s.residency_city || '-', s.chosen_program,
            s.subprogram_name || s.chosen_subprogram || '-', s.class_name || 'Not Assigned',
            `${s.attendance_rate}%`, `${s.overall_average}%`, s.status
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BEA_Full_Report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const columns = [
        {
            key: "full_name",
            label: "Student Info",
            render: (val, row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                        {val?.charAt(0)}
                    </div>
                    <div>
                        <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{val}</p>
                        <p className="text-[10px] text-gray-500">{row.student_id}</p>
                    </div>
                </div>
            )
        },
        { key: "chosen_program", label: "Program" },
        { key: "subprogram_name", label: "Sub-Program", render: (val) => val || "N/A" },
        { key: "class_name", label: "Class", render: (val) => val || "Unassigned" },
        {
            key: "attendance_rate",
            label: "Att%",
            className: "text-center",
            render: (val) => <span className="font-bold">{val}%</span>
        },
        {
            key: "overall_average",
            label: "Score%",
            className: "text-center",
            render: (val) => (
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${val >= 80 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {val}%
                </span>
            )
        },
        {
            key: "status",
            label: "Status",
            render: (val) => (
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${['approved', 'Active'].includes(val) ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {val}
                </span>
            )
        }
    ];

    return (
        <div className={`flex-1 min-w-0 flex flex-col px-4 sm:px-8 py-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-[1800px] mx-auto w-full space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <h1 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Student Reports
                        </h1>
                        <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Unified Student Registry & Performance Dashboard
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleOpenFullReport(true)}
                            disabled={isFetchingFullReport || !selectedProgram}
                            className={`${isDark ? 'bg-blue-900/50 hover:bg-blue-900/70 text-blue-200 border border-blue-800' : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200'} px-6 py-3 rounded-lg flex items-center gap-2 transition-all font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            {isFetchingFullReport && selectedProgram ? 'Generating...' : 'Generate Program Report'}
                        </button>
                        <button
                            onClick={() => handleOpenFullReport(false)}
                            disabled={isFetchingFullReport}
                            className={`${isDark ? 'bg-white hover:bg-gray-100 text-gray-900 border-none' : 'bg-[#010080] hover:bg-[#010080]/90 text-white'} px-6 py-3 rounded-lg flex items-center gap-2 transition-all font-bold shadow-md disabled:opacity-70`}
                        >
                            {isFetchingFullReport && !selectedProgram ? 'Generating...' : 'Generate Full Report'}
                        </button>
                    </div>
                </div>

                {/* Hierarchical Filters */}
                <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-500 mb-2">Search Registry</label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Name, ID, or Email..."
                                className={`w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white'}`}
                            />
                        </div>
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

                {/* 6 Summary Boxes - 4-column Grid Layout */}
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

                {/* Charts Grid - 2 per row, Equal Width */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Enrollment Trend */}
                    <div className={`p-8 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                        <h3 className="text-sm font-bold mb-8 uppercase tracking-widest text-[#010080]">Enrollment Trend</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={enrollmentTrend}>
                                    <defs>
                                        <linearGradient id="colorEnroll" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#010080" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#010080" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                                    <XAxis dataKey="month" tick={{ fill: chartLabelColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: chartLabelColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                    <Area type="monotone" dataKey="students" stroke="#010080" strokeWidth={3} fillOpacity={1} fill="url(#colorEnroll)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Sex Distribution */}
                    <div className={`p-8 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                        <h3 className="text-sm font-bold mb-8 uppercase tracking-widest text-[#18178a]">Sex Distribution</h3>
                        <div className="h-[300px] flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={genderData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value">
                                        {genderData.map((e, idx) => (
                                            <Cell key={idx} fill={e.name === 'Male' ? '#010080' : '#f95150'} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Program Enrollment */}
                    <div className={`p-8 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                        <h3 className="text-sm font-bold mb-8 uppercase tracking-widest text-[#4b47a4]">Program Enrollment</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={programDist}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                                    <XAxis dataKey="name" tick={{ fill: chartLabelColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: chartLabelColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="students" fill="#010080" radius={[4, 4, 0, 0]}>
                                        {programDist.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={brandColors[index % brandColors.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Student Completion Rate */}
                    <div className={`p-8 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                        <h3 className="text-sm font-bold mb-8 uppercase tracking-widest text-[#4b47a4]">Student Completion Rate</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={completionData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                                        {completionData.map((e, idx) => <Cell key={idx} fill={brandColors[idx % brandColors.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Approval Status Distribution */}
                    <div className={`p-8 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                        <h3 className="text-sm font-bold mb-8 uppercase tracking-widest text-[#010080]">Approval Status</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={statusData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chartGridColor} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" tick={{ fill: chartLabelColor, fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.name === 'Approved' ? '#010080' : '#f95150'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>

                {/* Detailed Table */}
                <DataTable
                    title="Unified Student Performance Registry"
                    columns={columns}
                    data={students}
                    showAddButton={false}
                    isDark={isDark}
                />

                <ReportModal
                    isOpen={isReportModalOpen}
                    onClose={() => setIsReportModalOpen(false)}
                    data={reportStudents}
                    onPrint={() => window.print()}
                    onExport={() => handleExportCSV(reportStudents)}
                    isDark={isDark}
                    title={reportModalTitle}
                />
            </div>
        </div>
    );
}
