"use client";

import React, { useState } from 'react';
import { useGetTopStudentsQuery } from '@/redux/api/studentApi';

const StarStudentsList = ({ programs = [], classes = [] }) => {
    const [selectedProgram, setSelectedProgram] = useState('');
    const [selectedClass, setSelectedClass] = useState('');

    // Mock data for a "perfect" look
    const students = [
        { id: 1, rank: 1, full_name: "Ahmed Ali", email: "ahmed.ali@example.com", program_name: "General English", class_name: "Level 1A", attendance_rate: 98, avg_assignment_score: 95 },
        { id: 2, rank: 2, full_name: "Fatima Omar", email: "fatima.o@example.com", program_name: "Academic Writing", class_name: "Advanced", attendance_rate: 96, avg_assignment_score: 92 },
        { id: 3, rank: 3, full_name: "Mohamed Hassan", email: "m.hassan@example.com", program_name: "IELTS Prep", class_name: "Morning", attendance_rate: 95, avg_assignment_score: 90 },
        { id: 4, rank: 4, full_name: "Sara Abdi", email: "sara.abdi@example.com", program_name: "Digital Literacy", class_name: "Basic", attendance_rate: 100, avg_assignment_score: 88 },
        { id: 5, rank: 5, full_name: "Zahra Ahmed", email: "zahra@example.com", program_name: "Professional Skills", class_name: "Evening", attendance_rate: 92, avg_assignment_score: 87 },
    ];

    const isLoading = false;

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex flex-col mb-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4">⭐ Star Students - Top 10</h3>
                <div className="flex gap-2 mb-4">
                    <select
                        value={selectedProgram}
                        onChange={(e) => setSelectedProgram(e.target.value)}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 hover:bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                        <option value="">All Programs</option>
                        {programs.length > 0 ? (
                            programs.map((program) => (
                                <option key={program.id} value={program.id}>
                                    {program.title}
                                </option>
                            ))
                        ) : (
                            <option disabled>No Programs Available</option>
                        )}
                    </select>
                    <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 hover:bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                        <option value="">All Classes</option>
                        {classes.length > 0 ? (
                            classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.class_name}
                                </option>
                            ))
                        ) : (
                            <option disabled>No Classes Available</option>
                        )}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <p className="text-gray-400">Loading...</p>
                    </div>
                ) : students.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <p className="text-gray-400">No students found</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rank</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Program</th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Attendance</th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Avg Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, index) => (
                                <tr
                                    key={student.id}
                                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                >
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            {index < 3 ? (
                                                <span className="text-2xl">
                                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                                </span>
                                            ) : (
                                                <span className="text-sm font-medium text-gray-600 w-8 text-center">
                                                    #{student.rank}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div>
                                            <p className="font-medium text-gray-900">{student.full_name}</p>
                                            <p className="text-xs text-gray-500">{student.email}</p>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div>
                                            <p className="text-sm text-gray-700">{student.program_name || 'N/A'}</p>
                                            <p className="text-xs text-gray-500">{student.class_name || 'No class'}</p>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <div className="inline-flex items-center gap-2">
                                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-green-500 h-2 rounded-full"
                                                    style={{ width: `${student.attendance_rate || 0}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                {student.attendance_rate || 0}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${student.avg_assignment_score >= 80
                                            ? 'bg-green-100 text-green-800'
                                            : student.avg_assignment_score >= 60
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {student.avg_assignment_score ? student.avg_assignment_score.toFixed(1) : 'N/A'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default StarStudentsList;
