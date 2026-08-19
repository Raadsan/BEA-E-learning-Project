"use client";

import React, { useState, useMemo } from 'react';
import { useGetTopStudentsQuery } from '@/lib/api/studentApi';
import DataTable from './DataTable';
import { CHART_FILTER_SELECT_CLASS } from '@/components/dashboard/chartShared';

const StarStudentsList = ({ programs = [], classes = [] }) => {
    const [selectedProgram, setSelectedProgram] = useState('');
    const [selectedClass, setSelectedClass] = useState('');

    const { data: students = [], isLoading, isError } = useGetTopStudentsQuery({
        limit: 10,
        program_id: selectedProgram || undefined,
        class_id: selectedClass || undefined
    });

    const rankedStudents = useMemo(() => {
        const list = Array.isArray(students) ? students : [];
        return list.slice(0, 10).map((student, idx) => ({
            ...student,
            rank: idx + 1
        }));
    }, [students]);

    const getRankBadge = (rank: number) => {
        switch (rank) {
            case 1:
                return <span className="bg-yellow-100 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-300 text-xs font-bold px-2.5 py-1 rounded-md border border-yellow-300 dark:border-yellow-700/50 inline-flex items-center gap-1 shadow-xs">🥇 1st</span>;
            case 2:
                return <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-600 inline-flex items-center gap-1 shadow-xs">🥈 2nd</span>;
            case 3:
                return <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-bold px-2.5 py-1 rounded-md border border-amber-300 dark:border-amber-700/50 inline-flex items-center gap-1 shadow-xs">🥉 3rd</span>;
            default:
                return <span className="bg-blue-50 dark:bg-blue-950/30 text-[#010080] dark:text-blue-300 text-xs font-bold px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-800 inline-flex items-center justify-center min-w-[42px] shadow-xs">{rank}th</span>;
        }
    };

    const columns = [
        {
            label: "Rank",
            key: "rank",
            width: "90px",
            render: (value, row, globalIndex) => {
                const rankNum = row.rank || (typeof globalIndex === 'number' ? globalIndex + 1 : 1);
                return getRankBadge(rankNum);
            }
        },
        {
            label: "Student Name",
            key: "full_name",
            render: (value, row) => (
                <div className="flex flex-col">
                    <span className="text-black dark:text-white font-medium">{value}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{row.email}</span>
                </div>
            )
        },
        {
            label: "Program / Class",
            key: "program_name",
            render: (value, row) => (
                <div className="flex flex-col">
                    <span className="text-black dark:text-gray-200">{value || '-'}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{row.class_name || row.subprogram_name || '-'}</span>
                </div>
            )
        },
        {
            label: "Attendance",
            key: "attendance_rate",
            className: "text-center",
            render: (value) => {
                const num = Number(value || 0);
                const display = num % 1 === 0 ? num.toFixed(0) : num.toFixed(1);
                return (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                        ${num >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300' :
                            num >= 75 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300' : 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300'}`}>
                        {display}%
                    </span>
                );
            }
        },
        {
            label: "Avg. Score",
            key: "avg_assignment_score",
            className: "text-center",
            render: (value, row) => {
                const num = value !== undefined && value !== null ? Number(value) : Number(row.average_score || 0);
                const display = num % 1 === 0 ? num.toFixed(0) : num.toFixed(1);
                return (
                    <span className="font-bold text-[#010080] dark:text-blue-400">
                        {display}%
                    </span>
                );
            }
        }
    ];

    const filters = (
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className={CHART_FILTER_SELECT_CLASS}
            >
                <option value="">All Programs</option>
                {programs.map((program) => (
                    <option key={program.id} value={program.id}>{program.title}</option>
                ))}
            </select>
            <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className={CHART_FILTER_SELECT_CLASS}
            >
                <option value="">All Classes</option>
                {classes
                    .filter(cls => !selectedProgram || cls.program_id == selectedProgram)
                    .map((cls) => (
                        <option key={cls.id} value={cls.id}>{cls.class_name}</option>
                    ))}
            </select>
        </div>
    );

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#010080]"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 flex justify-center items-center h-64">
                <p className="text-[#f40606]">Failed to load top students.</p>
            </div>
        );
    }

    return (
        <DataTable
            title="🌟 Star Students"
            columns={columns}
            data={rankedStudents}
            customHeaderLeft={filters}
            showAddButton={false}
            rowsPerPage={5}
            emptyMessage="No top students found."
        />
    );
};

export default StarStudentsList;
