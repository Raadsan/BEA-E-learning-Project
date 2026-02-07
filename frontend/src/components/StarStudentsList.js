"use client";

import React, { useState } from 'react';
import { useGetTopStudentsQuery } from '@/redux/api/studentApi';
import DataTable from './DataTable';

const StarStudentsList = ({ programs = [], classes = [] }) => {
    const [selectedProgram, setSelectedProgram] = useState('');
    const [selectedClass, setSelectedClass] = useState('');

    // We fetch more than 10 to allow DataTable pagination to handle it if we want client-side pagination
    // OR we can rely on API limit. For now, let's fetch a decent batch (e.g., 50) and let DataTable pagination handle it.
    const { data: students = [], isLoading, isError } = useGetTopStudentsQuery({
        limit: 50,
        program_id: selectedProgram || undefined,
        class_id: selectedClass || undefined
    });

    const getRankBadge = (index) => {
        // Index is 0-based from the data array
        const rank = index + 1;
        switch (rank) {
            case 1: return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded border border-yellow-200">🥇 1st</span>;
            case 2: return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded border border-gray-200">🥈 2nd</span>;
            case 3: return <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded border border-orange-200">🥉 3rd</span>;
            default: return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded border border-blue-200">{rank}th</span>;
        }
    };

    const columns = [
        {
            label: "Rank",
            key: "rank",
            width: "100px",
            render: (_, __, index) => getRankBadge(index)
        },
        {
            label: "Student Name",
            key: "full_name",
            render: (value, row) => (
                <div className="flex flex-col">
                    <span className="text-black">{value}</span>
                    <span className="text-xs text-gray-500">{row.email}</span>
                </div>
            )
        },
        {
            label: "Program / Class",
            key: "program_name",
            render: (value, row) => (
                <div className="flex flex-col">
                    <span className="text-black">{value || '-'}</span>
                    <span className="text-xs text-gray-500">{row.class_name || row.subprogram_name || '-'}</span>
                </div>
            )
        },
        {
            label: "Attendance",
            key: "attendance_rate",
            className: "text-center",
            render: (value) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold
                    ${(value || 0) >= 90 ? 'bg-green-100 text-green-800' :
                        (value || 0) >= 75 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                    {Math.round(value || 0)}%
                </span>
            )
        },
        {
            label: "Avg. Score",
            key: "avg_assignment_score", // Fallback to average_score handled in render if needed or data mapping
            className: "text-center",
            render: (value, row) => (
                <span className="font-bold text-[#010080]">
                    {Math.round(value || row.average_score || 0)}%
                </span>
            )
        }
    ];

    const filters = (
        <div className="flex gap-2">
            <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 hover:bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
                <option value="">All Programs</option>
                {programs.map((program) => (
                    <option key={program.id} value={program.id}>{program.title}</option>
                ))}
            </select>
            <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 hover:bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.class_name}</option>
                ))}
            </select>
        </div>
    );

    if (isLoading) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#010080]"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex justify-center items-center h-64">
                <p className="text-[#f40606]">Failed to load top students.</p>
            </div>
        );
    }

    return (
        <DataTable
            title={
                <span className="text-lg font-bold text-[#010080] flex items-center gap-2">
                    <span className="text-xl">🌟</span> Star Students
                </span>
            }
            columns={columns}
            data={students}
            customHeaderLeft={filters}
            showAddButton={false}
            emptyMessage="No top students found."
        />
    );
};

export default StarStudentsList;
