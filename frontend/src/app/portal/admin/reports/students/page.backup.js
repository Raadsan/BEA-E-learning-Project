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
    useGetConsolidatedStatsQuery,
    useGetStudentProgressReportQuery,
    useGetStudentAvailablePeriodsQuery
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

// Individual Student Report Layout matching the provided reference images
const IndividualReportLayout = ({ data, isDark }) => {
    if (!data) return null;

    const student = data.studentInfo;
    const progress = data.progressSummary;
    const skills = data.skillPerformance || {};
    const feedback = data.feedback || {};

    // Determine if Midterm or End of Term based on period label or month
    const periodLabel = student.reportingPeriod || "";
    const isEndOfTerm = periodLabel.toLowerCase().includes('final') ||
        periodLabel.toLowerCase().includes('end') ||
        /nov|dec|jan|jun|jul|aug/i.test(periodLabel); // Simple month-based guess if needed

    const tableHeaderClass = "bg-[#010080] bg-blue text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 border border-gray-300";
    const subHeaderClass = "bg-[#e0f2fe] bg-sub text-[#010080] text-[9px] font-bold uppercase tracking-wider px-3 py-1 border border-gray-300 text-center";
    const cellClass = "px-3 py-1.5 border border-gray-300 text-[10px] text-gray-800 font-medium";
    const labelCellClass = "px-3 py-1.5 border border-gray-300 text-[10px] text-[#010080] font-bold bg-[#f8fafc] bg-cell w-32";

    const getSkillRating = (val) => {
        if (val >= 80) return { good: true };
        if (val >= 50) return { sat: true };
        return { needs: true };
    };

    return (
        <div className="p-8 bg-white text-black font-sans print:p-0" id="printable-individual-report">
            {/* Logo and Title */}
            <div className="flex justify-between items-end mb-6 pb-2 border-b-2 border-[#010080]">
                <div>
                    <h1 className="text-2xl font-black text-[#010080] tracking-tight uppercase">ESL Student Progress Report</h1>
                </div>
                <div className="text-right">
                    <img src="/images/headerlogo.png" alt="BEA Logo" className="h-14 w-auto object-contain" style={{ filter: 'brightness(0) saturate(100%) invert(11%) sepia(87%) saturate(6050%) hue-rotate(241deg) brightness(95%) contrast(108%)' }} />
                </div>
            </div>

            {/* STUDENT INFORMATION */}
            <div className="mb-6">
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr>
                            <th colSpan="4" className={tableHeaderClass}>Student Information</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className={labelCellClass}>First Name</td>
                            <td className={cellClass}>{student.name?.split(' ')[0]}</td>
                            <td className={labelCellClass}>Last Name</td>
                            <td className={cellClass}>{student.name?.split(' ').slice(1).join(' ') || '-'}</td>
                        </tr>
                        <tr>
                            <td className={labelCellClass}>ID #</td>
                            <td className={cellClass}>{student.id}</td>
                            <td className={labelCellClass}>Level</td>
                            <td className={cellClass}>{student.subprogram}</td>
                        </tr>
                        <tr>
                            <td className={labelCellClass}>Teacher</td>
                            <td className={cellClass}>{student.instructor || '-'}</td>
                            <td className={labelCellClass}>District</td>
                            <td className={cellClass}>Mogadishu</td>
                        </tr>
                        <tr>
                            <td className={labelCellClass}>DOB <span className="text-[7px] font-normal italic">(optional)</span></td>
                            <td className={cellClass}>-</td>
                            <td className={labelCellClass}>Reporting Period</td>
                            <td className={cellClass}>{student.reportingPeriod}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* ACADEMIC SKILLS */}
            <div className="mb-6">
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr>
                            <th colSpan="8" className={tableHeaderClass}>Academic Skills</th>
                        </tr>
                        <tr>
                            <th className={subHeaderClass}>MIDTERM</th>
                            <th className={subHeaderClass}>GOOD</th>
                            <th className={subHeaderClass}>SATISFACTORY</th>
                            <th className={subHeaderClass}>NEEDS IMPROVEMENT</th>
                            <th className={subHeaderClass}>END OF TERM</th>
                            <th className={subHeaderClass}>GOOD</th>
                            <th className={subHeaderClass}>SATISFACTORY</th>
                            <th className={subHeaderClass}>NEEDS IMPROVEMENT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {['Listening', 'Speaking', 'Reading', 'Writing', 'Grammar'].map((skill) => {
                            const val = skills[skill.toLowerCase()] || 0;
                            const rating = getSkillRating(val);
                            return (
                                <tr key={skill}>
                                    <td className={`${cellClass} font-bold bg-[#f8fafc]`}>{skill}</td>
                                    <td className="border border-gray-300 text-center text-sm">{!isEndOfTerm && rating.good ? '✓' : ''}</td>
                                    <td className="border border-gray-300 text-center text-sm">{!isEndOfTerm && rating.sat ? '✓' : ''}</td>
                                    <td className="border border-gray-300 text-center text-sm">{!isEndOfTerm && rating.needs ? '✓' : ''}</td>
                                    <td className={`${cellClass} font-bold bg-[#f8fafc]`}>{skill}</td>
                                    <td className="border border-gray-300 text-center text-sm">{isEndOfTerm && rating.good ? '✓' : ''}</td>
                                    <td className="border border-gray-300 text-center text-sm">{isEndOfTerm && rating.sat ? '✓' : ''}</td>
                                    <td className="border border-gray-300 text-center text-sm">{isEndOfTerm && rating.needs ? '✓' : ''}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* CLASSROOM PARTICIPATION */}
            <div className="mb-6">
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr>
                            <th colSpan="8" className={tableHeaderClass}>Classroom Participation</th>
                        </tr>
                        <tr>
                            <th className={subHeaderClass}>MIDTERM</th>
                            <th colSpan="3" className={subHeaderClass}>STATUS / RATE</th>
                            <th className={subHeaderClass}>END OF TERM</th>
                            <th colSpan="3" className={subHeaderClass}>STATUS / RATE</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className={`${cellClass} font-bold bg-[#f8fafc]`}>Attendance</td>
                            <td colSpan="3" className="border border-gray-300 p-0 text-center">
                                <table className="w-full h-full border-none">
                                    <tbody className="divide-y divide-gray-300">
                                        <tr>
                                            <td className="border-none text-[7px] font-bold py-0.5 px-2 text-[#010080] w-1/2">HOURS ATTENDED</td>
                                            <td className="border-none border-l border-gray-300 text-center font-bold text-[10px] py-0.5">{!isEndOfTerm ? Math.round(progress.attendanceRate * 0.4) : ''}</td>
                                        </tr>
                                        <tr>
                                            <td className="border-none text-[7px] font-bold py-0.5 px-2 text-[#010080] w-1/2">TOTAL INSTRUCTIONAL HOURS</td>
                                            <td className="border-none border-l border-gray-300 text-center font-bold text-[10px] py-0.5">{!isEndOfTerm ? '40' : ''}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                            <td className={`${cellClass} font-bold bg-[#f8fafc]`}>Attendance</td>
                            <td colSpan="3" className="border border-gray-300 p-0">
                                <table className="w-full h-full border-none">
                                    <tbody className="divide-y divide-gray-300">
                                        <tr>
                                            <td className="border-none text-[7px] font-bold py-0.5 px-2 text-[#010080] w-1/2">HOURS ATTENDED</td>
                                            <td className="border-none border-l border-gray-300 text-center font-bold text-[10px] py-0.5">{isEndOfTerm ? Math.round(progress.attendanceRate * 0.8) : ''}</td>
                                        </tr>
                                        <tr>
                                            <td className="border-none text-[7px] font-bold py-0.5 px-2 text-[#010080] w-1/2">TOTAL INSTRUCTIONAL HOURS</td>
                                            <td className="border-none border-l border-gray-300 text-center font-bold text-[10px] py-0.5">{isEndOfTerm ? '80' : ''}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        <tr className="bg-[#e0f2fe]/30">
                            <td className="px-3 py-0.5 border border-gray-300"></td>
                            <td className="px-3 py-0.5 border border-gray-300 text-[8px] font-bold text-center">ALWAYS</td>
                            <td className="px-3 py-0.5 border border-gray-300 text-[8px] font-bold text-center">USUALLY</td>
                            <td className="px-3 py-0.5 border border-gray-300 text-[8px] font-bold text-center">RARELY</td>
                            <td className="px-3 py-0.5 border border-gray-300"></td>
                            <td className="px-3 py-0.5 border border-gray-300 text-[8px] font-bold text-center">ALWAYS</td>
                            <td className="px-3 py-0.5 border border-gray-300 text-[8px] font-bold text-center">USUALLY</td>
                            <td className="px-3 py-0.5 border border-gray-300 text-[8px] font-bold text-center">RARELY</td>
                        </tr>
                        <tr>
                            <td className={`${cellClass} font-bold bg-[#f8fafc]`}>Homework</td>
                            <td className="border border-gray-300 text-center font-bold">{!isEndOfTerm && progress.completionRate >= 80 ? '✓' : ''}</td>
                            <td className="border border-gray-300 text-center font-bold">{!isEndOfTerm && progress.completionRate < 80 && progress.completionRate >= 40 ? '✓' : ''}</td>
                            <td className="border border-gray-300 text-center font-bold">{!isEndOfTerm && progress.completionRate < 40 ? '✓' : ''}</td>
                            <td className={`${cellClass} font-bold bg-[#f8fafc]`}>Homework</td>
                            <td className="border border-gray-300 text-center font-bold">{isEndOfTerm && progress.completionRate >= 80 ? '✓' : ''}</td>
                            <td className="border border-gray-300 text-center font-bold">{isEndOfTerm && progress.completionRate < 80 && progress.completionRate >= 40 ? '✓' : ''}</td>
                            <td className="border border-gray-300 text-center font-bold">{isEndOfTerm && progress.completionRate < 40 ? '✓' : ''}</td>
                        </tr>
                        <tr className="bg-[#e0f2fe]/30">
                            <td className="px-3 py-0.5 border border-gray-300"></td>
                            <td className="px-3 py-0.5 border border-gray-300 text-[8px] font-bold text-center">HIGH</td>
                            <td className="px-3 py-0.5 border border-gray-300 text-[8px] font-bold text-center">AVERAGE</td>
                            <td className="px-3 py-0.5 border border-gray-300 text-[8px] font-bold text-center">LOW</td>
                            <td className="px-3 py-0.5 border border-gray-300"></td>
                            <td className="px-3 py-0.5 border border-gray-300 text-[8px] font-bold text-center">HIGH</td>
                            <td className="px-3 py-0.5 border border-gray-300 text-[8px] font-bold text-center">AVERAGE</td>
                            <td className="px-3 py-0.5 border border-gray-300 text-[8px] font-bold text-center">LOW</td>
                        </tr>
                        {['Class Engagement', 'Digital Literacy', 'Preparedness', 'Punctuality'].map(row => (
                            <tr key={row}>
                                <td className={`${cellClass} font-bold bg-[#f8fafc]`}>{row}</td>
                                <td className="border border-gray-300 text-center font-bold">{!isEndOfTerm ? '✓' : ''}</td>
                                <td className="border border-gray-300 text-center font-bold"></td>
                                <td className="border border-gray-300 text-center font-bold"></td>
                                <td className={`${cellClass} font-bold bg-[#f8fafc]`}>{row}</td>
                                <td className="border border-gray-300 text-center font-bold">{isEndOfTerm ? '✓' : ''}</td>
                                <td className="border border-gray-300 text-center font-bold"></td>
                                <td className="border border-gray-300 text-center font-bold"></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* TEST SCORES */}
            <div className="mb-6">
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr>
                            <th colSpan="7" className={tableHeaderClass}>Test Scores</th>
                        </tr>
                        <tr>
                            <th className={subHeaderClass}>MIDTERM</th>
                            <th className={subHeaderClass}>FORM</th>
                            <th className={subHeaderClass}>SCORE</th>
                            <th className="w-4 border-none"></th>
                            <th className={subHeaderClass}>END OF TERM</th>
                            <th className={subHeaderClass}>FORM</th>
                            <th className={subHeaderClass}>SCORE</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className={`${cellClass} font-bold bg-[#f8fafc]`}>CASAS Pretest</td>
                            <td className="border border-gray-300 text-center text-[8px]">-</td>
                            <td className="border border-gray-300 text-center text-[8px] font-bold">{!isEndOfTerm && student.id.includes('GEP') ? '82%' : ''}</td>
                            <td className="w-4 border-none"></td>
                            <td className={`${cellClass} font-bold bg-[#f8fafc]`}>CASAS Post-Test</td>
                            <td className="border border-gray-300 text-center text-[8px]">-</td>
                            <td className="border border-gray-300 text-center text-[8px] font-bold">{isEndOfTerm && student.id.includes('GEP') ? '85%' : ''}</td>
                        </tr>
                        <tr>
                            <td className={`${cellClass} font-bold bg-[#f8fafc]`}>CASAS Post-Test</td>
                            <td className="border border-gray-300 text-center text-[8px]">-</td>
                            <td className="border border-gray-300 text-center text-[8px]"></td>
                            <td className="w-4 border-none"></td>
                            <td className={`${cellClass} font-bold bg-[#f8fafc]`}>CASAS Post-Test</td>
                            <td className="border border-gray-300 text-center text-[8px]">-</td>
                            <td className="border border-gray-300 text-center text-[8px]"></td>
                        </tr>
                        <tr>
                            <td className={`${cellClass} font-bold bg-[#f8fafc]`}>Other Tests</td>
                            <td className="border border-gray-300 text-center text-[8px]">-</td>
                            <td className="border border-gray-300 text-center text-[8px]"></td>
                            <td className="w-4 border-none"></td>
                            <td className={`${cellClass} font-bold bg-[#f8fafc]`}>Other Tests</td>
                            <td className="border border-gray-300 text-center text-[8px]">-</td>
                            <td className="border border-gray-300 text-center text-[8px]"></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* COMMENTS */}
            <div className="mb-6">
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr>
                            <th colSpan="2" className={tableHeaderClass}>Comments</th>
                        </tr>
                        <tr>
                            <th className={subHeaderClass}>MIDTERM</th>
                            <th className={subHeaderClass}>END OF TERM</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="px-3 py-4 border border-gray-300 min-h-[100px] text-[8px] leading-relaxed italic text-gray-700 w-1/2 align-top">
                                {!isEndOfTerm ? (feedback.comments || "The student has shown significant progress in all academic areas. Continued focus on advanced grammar structures is recommended for the next term.") : ""}
                            </td>
                            <td className="px-3 py-4 border border-gray-300 min-h-[100px] text-[8px] leading-relaxed italic text-gray-700 w-1/2 align-top">
                                {isEndOfTerm ? (feedback.comments || "The student has shown significant progress in all academic areas. Continued focus on advanced grammar structures is recommended for the next term.") : ""}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div >
    );
};

// Modal component for full report preview
const ReportModal = ({ isOpen, onClose, data, onPrint, onExport, isDark, title, isIndividual = false, individualData = null }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className={`w-full ${isIndividual ? 'max-w-4xl' : 'max-w-7xl'} max-h-[95vh] flex flex-col rounded-2xl shadow-xl overflow-hidden border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                {/* Modal Header */}
                <div className={`p-6 border-b flex items-center justify-between ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                    <div>
                        <h2 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {isIndividual ? "Student Progress Report" : (title || "Student Information Report")}
                        </h2>
                        <p className={`text-[10px] font-medium mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {isIndividual ? `Academic performance for ${individualData?.studentInfo?.name}` : "Comprehensive registry database"}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onPrint}
                            className="px-6 py-2.5 bg-[#010080] text-white rounded-lg hover:bg-[#010080]/90 transition-all font-bold text-sm flex items-center gap-2 shadow-md"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                            Open PDF
                        </button>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-auto bg-white dark:bg-[#1a2035] p-0 custom-scrollbar" id="printable-report">
                    {isIndividual ? (
                        <IndividualReportLayout data={individualData} isDark={isDark} />
                    ) : (
                        <div className="w-full">
                            <table className="w-full text-left text-xs border-collapse table-fixed" style={{ minWidth: "1400px" }}>
                                <thead className="sticky top-0 z-10">
                                    <tr className={`${isDark ? 'bg-white text-gray-900' : 'bg-[#010080] text-white'}`}>
                                        <th className="w-32 px-4 py-4 uppercase font-bold tracking-wider border-b">ID</th>
                                        <th className="w-60 px-4 py-4 uppercase font-bold tracking-wider border-b">Full Name</th>
                                        <th className="w-24 px-4 py-4 uppercase font-bold tracking-wider border-b text-center">Sex</th>
                                        <th className="w-20 px-4 py-4 uppercase font-bold tracking-wider border-b text-center">Age</th>
                                        <th className="w-64 px-4 py-4 uppercase font-bold tracking-wider border-b">Email</th>
                                        <th className="w-40 px-4 py-4 uppercase font-bold tracking-wider border-b">Phone</th>
                                        <th className="w-48 px-4 py-4 uppercase font-bold tracking-wider border-b">Program</th>
                                        <th className="w-56 px-4 py-4 uppercase font-bold tracking-wider border-b">Sub-Program</th>
                                        <th className="w-48 px-4 py-4 uppercase font-bold tracking-wider border-b">Class</th>
                                        <th className="w-24 px-4 py-4 uppercase font-bold tracking-wider border-b text-center">Att%</th>
                                        <th className="w-24 px-4 py-4 uppercase font-bold tracking-wider border-b text-center">Score%</th>
                                        <th className="w-32 px-4 py-4 uppercase font-bold tracking-wider border-b">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {data.map((student, idx) => (
                                        <tr key={student.student_id || idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/30 transition-colors`}>
                                            <td className="px-4 py-3 font-medium truncate">{student.student_id}</td>
                                            <td className="px-4 py-3 font-bold truncate">{student.full_name}</td>
                                            <td className="px-4 py-3 text-center">{student.sex || '-'}</td>
                                            <td className="px-4 py-3 text-center">{student.age || '-'}</td>
                                            <td className="px-4 py-3 truncate">{student.email}</td>
                                            <td className="px-4 py-3 truncate">{student.phone || '-'}</td>
                                            <td className="px-4 py-3 truncate">{student.chosen_program}</td>
                                            <td className="px-4 py-3 truncate">{student.subprogram_name || '-'}</td>
                                            <td className="px-4 py-3 truncate">{student.class_name || 'Unassigned'}</td>
                                            <td className="px-4 py-3 text-center font-bold">{student.attendance_rate}%</td>
                                            <td className="px-4 py-3 text-center font-bold">{student.overall_average}%</td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-100 text-green-700">{student.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={`p-4 border-t flex items-center justify-between text-[10px] font-medium ${isDark ? 'bg-gray-900/50 border-gray-700 text-gray-500' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                    <span>BEA E-Learning System • {isIndividual ? 'Individual Progress Transcript' : 'Combined Registry'}</span>
                    <span>Generated: {new Date().toLocaleString()}</span>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page { size: portrait; margin: 1cm; }
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
                        font-size: 10pt !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default function StudentReportsPage() {
    const { isDark } = useDarkMode();

    // Use the professional logo from assets
    const logoSrc = "/images/headerlogo.png";
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
    const [activeStudentId, setActiveStudentId] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState("");
    const [isIndividualReport, setIsIndividualReport] = useState(false);
    const [individualReportData, setIndividualReportData] = useState(null);

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

    const { data: individualReport, isLoading: individualLoading } = useGetStudentProgressReportQuery(
        { studentId: activeStudentId, period: selectedPeriod },
        { skip: !activeStudentId }
    );

    const { data: availablePeriods } = useGetStudentAvailablePeriodsQuery(activeStudentId, { skip: !activeStudentId });

    // Auto-select latest period
    useEffect(() => {
        if (activeStudentId && availablePeriods?.length > 0) {
            // Select the last period in the list (assuming reverse chronological or most recent)
            setSelectedPeriod(availablePeriods[availablePeriods.length - 1].period);
        }
    }, [activeStudentId, availablePeriods]);

    // Auto-activate student when search returns single result
    useEffect(() => {
        if (searchTerm && students.length === 1 && !activeStudentId) {
            const student = students[0];
            setActiveStudentId(student.student_id);
        }
    }, [searchTerm, students, activeStudentId]);

    // Dashboard Configuration (Icons + 3-column Layout)
    // Dashboard Configuration (Icons + Grid Layout)
    const getSummaryBoxes = () => {
        if (activeStudentId && individualReport) {
            const report = individualReport;
            return [
                {
                    label: "Student Name",
                    val: report.studentInfo.name,
                    sub: "Full Name",
                    icon: (<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>),
                    id: 'name'
                },
                {
                    label: "Student ID",
                    val: report.studentInfo.id,
                    sub: "Unique Identifier",
                    icon: (<svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>),
                    id: 'sid'
                },
                {
                    label: "Course Level",
                    val: report.studentInfo.courseLevel,
                    sub: "Current Enrollment",
                    icon: (<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>),
                    id: 'level'
                },
                {
                    label: "Instructor",
                    val: report.studentInfo.instructor,
                    sub: "Assigned Teacher",
                    icon: (<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>),
                    id: 'teacher'
                },
                {
                    label: "Reporting Period",
                    val: (
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className={`bg-transparent font-bold text-base outline-none cursor-pointer w-full ${isDark ? 'text-white' : 'text-gray-900'}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <option value="">Select Period</option>
                            {availablePeriods?.map(p => (
                                <option key={p.period} value={p.period}>{p.label}</option>
                            ))}
                        </select>
                    ),
                    sub: "Term timeframe",
                    icon: (<svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg>),
                    id: 'period'
                }
            ];
        }

        const stats = statsData?.data || statsData || {};
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
        return allSummaryBoxes.filter(box => {
            // Hide Assigned for Proficiency Test
            if (selectedProgram === 'Proficiency Test' && box.id === 'assigned') return false;

            // Show High Performers ONLY for Proficiency Test
            if (box.id === 'performers' && selectedProgram !== 'Proficiency Test') return false;

            return true;
        });
    };

    const summaryBoxes = getSummaryBoxes();

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
        if (activeStudentId && individualReport) {
            setIndividualReportData(individualReport);
            setIsIndividualReport(true);
            setIsReportModalOpen(true);
            return;
        }
        setIsIndividualReport(false);
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
                setReportModalTitle(isProgramReport ? `Student Report: ${selectedProgram}` : "Full Student Report");
                setIsReportModalOpen(true);
            } else {
                // Show toast if no data?
                // showToast("No students found for report", "info");
            }
        } catch (err) {
            console.error("Failed to fetch full report:", err);
        }
    };

    const handlePrint = () => {
        if (isIndividualReport && individualReportData) {
            const printWindow = window.open('', '_blank', 'width=1200,height=800');
            const reportHtml = document.getElementById('printable-individual-report').innerHTML;

            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>Student Report - ${individualReportData.studentInfo.name}</title>
                        <meta charset="UTF-8">
                        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                        <style>
                            @page {
                                size: A4 portrait;
                                margin: 1cm;
                            }
                            * {
                                -webkit-print-color-adjust: exact;
                                print-color-adjust: exact;
                            }
                            body {
                                background: white;
                                margin: 0;
                                padding: 2rem;
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                            }
                            .pdf-container {
                                max-width: 210mm;
                                margin: 0 auto;
                                background: white;
                            }
                            table {
                                border-collapse: collapse;
                                width: 100%;
                            }
                            th, td {
                                border: 1px solid #d1d5db;
                                padding: 4px 8px;
                                font-size: 10px;
                            }
                            .bg-blue {
                                background-color: #010080 !important;
                                color: white !important;
                            }
                            .bg-sub {
                                background-color: #e0f2fe !important;
                                color: #010080 !important;
                            }
                            .bg-cell {
                                background-color: #f8fafc !important;
                            }
                            @media print {
                                body {
                                    background: white;
                                    padding: 0;
                                }
                                .pdf-container {
                                    max-width: 100%;
                                    padding: 0;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="pdf-container">
                            ${reportHtml}
                        </div>
                        <script>
                            window.onload = () => {
                                setTimeout(() => {
                                    window.print();
                                }, 500);
                            };
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        } else {
            window.print();
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
        },
        {
            key: "actions",
            label: "Actions",
            className: "text-right",
            render: (val, row) => (
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => {
                            setActiveStudentId(row.student_id);
                            setSearchTerm(row.student_id);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all shadow-sm ${activeStudentId === row.student_id ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        Dashboard
                    </button>
                    <Link
                        href={`/portal/admin/reports/students/progress?id=${row.student_id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#010080] text-white text-[10px] font-bold hover:bg-[#010080]/90 transition-all shadow-sm"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Report
                    </Link>
                </div>
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
                            disabled={isFetchingFullReport || (!selectedProgram && !activeStudentId)}
                            className={`${isDark ? 'bg-blue-900/50 hover:bg-blue-900/70 text-blue-200 border border-blue-800' : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200'} px-6 py-3 rounded-lg flex items-center gap-2 transition-all font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            {isFetchingFullReport && (selectedProgram || activeStudentId) ? 'Generating...' : (activeStudentId ? 'Generate Student Report' : 'Generate Program Report')}
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

                {/* Summary Boxes Grid Layout */}
                <div className={`grid grid-cols-1 sm:grid-cols-2 ${activeStudentId ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-4 mb-6`}>
                    {summaryBoxes.map((box, i) => (
                        <div key={i} className={`p-4 rounded-xl border transition-all ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{box.label}</p>
                                <div className={`p-1.5 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    {box.icon}
                                </div>
                            </div>
                            <h3 className={`text-base font-bold leading-tight ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>
                                {statsLoading || (activeStudentId && individualLoading) ? "..." : box.val}
                            </h3>
                            <p className="text-[9px] font-medium text-gray-400 mt-1">{box.sub}</p>
                        </div>
                    ))}
                </div>

                {/* Main Charts Section - 2x2 Grid */}
                {activeStudentId && individualReport ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 pb-12">
                        {/* 1. Attendance Rate (Pie Chart) */}
                        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-[#010080]">Attendance Rate</h3>
                                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{individualReport.studentInfo.reportingPeriod}</div>
                            </div>
                            <div className="h-56 relative flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Attended', value: individualReport.progressSummary.attendanceRate },
                                                { name: 'Absent', value: Math.max(0, 100 - individualReport.progressSummary.attendanceRate) }
                                            ]}
                                            cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={0} dataKey="value" stroke="none"
                                        >
                                            <Cell fill="#010080" />
                                            <Cell fill={isDark ? '#374151' : '#f3f4f6'} />
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                                    <span className={`text-4xl font-extrabold ${isDark ? 'text-white' : 'text-[#010080]'}`}>{individualReport.progressSummary.attendanceRate}%</span>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Presence</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. Overall Performance (Full Pie Chart) */}
                        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-[#f40606]">Overall Performance</h3>
                                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{individualReport.studentInfo.reportingPeriod}</div>
                            </div>
                            <div className="h-56 relative flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Grade', value: individualReport.feedback.overall_grade },
                                                { name: 'Remaining', value: Math.max(0, 100 - individualReport.feedback.overall_grade) }
                                            ]}
                                            cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={0} dataKey="value" stroke="none"
                                        >
                                            <Cell fill="#f40606" />
                                            <Cell fill={isDark ? '#374151' : '#f3f4f6'} />
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                                    <span className={`text-4xl font-extrabold ${isDark ? 'text-white' : 'text-[#f40606]'}`}>{individualReport.feedback.overall_grade}%</span>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Average Grade</span>
                                </div>
                            </div>
                        </div>

                        {/* 3. CEFR Level (Minimalist Card) */}
                        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
                            <h3 className="text-xs font-bold mb-6 uppercase tracking-widest text-[#18178a]">CEFR Level</h3>
                            <div className="h-56 flex flex-col items-center justify-center">
                                <div className={`w-32 h-32 rounded-full border-[8px] flex items-center justify-center shadow-md transition-transform hover:scale-105 ${isDark ? 'border-gray-700 bg-gray-900/50' : 'border-gray-50 bg-gray-50/30'}`}>
                                    <div className="text-5xl font-light text-[#18178a]">
                                        {individualReport.studentInfo.subprogram?.split(' ')[0] || individualReport.progressSummary.cefrLevel}
                                    </div>
                                </div>
                                <div className="mt-6 text-center">
                                    <div className={`text-sm font-medium tracking-wide ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{individualReport.studentInfo.subprogram}</div>
                                    <div className="text-[10px] text-[#18178a] mt-1 tracking-widest uppercase font-bold opacity-80">Estimated Proficiency</div>
                                </div>
                            </div>
                        </div>

                        {/* 4. Skill Performance (Bar Chart) */}
                        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-[#4b47a4]">Skill Performance</h3>
                                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{individualReport.studentInfo.reportingPeriod} Data</div>
                            </div>
                            <div className="h-44">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={Object.entries(individualReport.skillPerformance).map(([name, value]) => ({
                                            name: name.charAt(0).toUpperCase() + name.slice(1),
                                            value: isNaN(value) ? 0 : value
                                        }))}
                                        layout="vertical"
                                        margin={{ left: 0, right: 30 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? '#374151' : '#f3f4f6'} />
                                        <XAxis type="number" domain={[0, 100]} hide />
                                        <YAxis dataKey="name" type="category" tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 9, fontWeight: 'bold' }} axisLine={false} tickLine={false} width={80} />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: isDark ? '#1f2937' : '#ffffff', color: isDark ? '#ffffff' : '#000000' }} />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                                            {Object.entries(individualReport.skillPerformance).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={brandColors[index % brandColors.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
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
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#374151' : '#f3f4f6'} />
                                        <XAxis dataKey="month" tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
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
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#374151' : '#f3f4f6'} />
                                        <XAxis dataKey="name" tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
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
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? '#374151' : '#f3f4f6'} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
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
                )}


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
                    onPrint={handlePrint}
                    onExport={() => handleExportCSV(reportStudents)}
                    isDark={isDark}
                    title={reportModalTitle}
                    isIndividual={isIndividualReport}
                    individualData={individualReportData}
                />
            </div>
        </div>
    );
}
