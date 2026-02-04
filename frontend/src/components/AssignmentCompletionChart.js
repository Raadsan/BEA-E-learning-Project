"use client";

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useGetAssignmentStatsQuery } from '@/redux/api/assignmentApi';

const AssignmentCompletionChart = ({ programs = [], classes = [], students = [] }) => {
    const [selectedProgram, setSelectedProgram] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');

    const { data: apiData = [], isLoading, isError } = useGetAssignmentStatsQuery({
        program_id: selectedProgram || undefined,
        class_id: selectedClass || undefined,
        student_id: selectedStudent || undefined
    });

    // Filter students based on selected class
    const filteredStudents = selectedClass
        ? students.filter(student => student.class_id == selectedClass)
        : [];

    // Transform API data or use as is (API returns { type, completionRate, avgScore })
    // Mapping keys to friendly names for XAxis if needed, or stick to 'type'
    const chartData = apiData.map(item => ({
        ...item,
        // Format type label (e.g., 'writing_task' -> 'Writing Task')
        label: item.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }));

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex flex-col mb-4">
                <h3 className="text-lg font-bold text-[#010080] mb-4">Assignment & Classwork Completion Rate</h3>
                <div className="flex gap-2 mb-4 flex-wrap">
                    <select
                        value={selectedProgram}
                        onChange={(e) => {
                            setSelectedProgram(e.target.value);
                            setSelectedClass('');
                            setSelectedStudent('');
                        }}
                        className="w-full sm:w-auto px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 hover:bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
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
                        onChange={(e) => {
                            setSelectedClass(e.target.value);
                            setSelectedStudent('');
                        }}
                        disabled={!selectedProgram}
                        className={`w-full sm:w-auto px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 ${!selectedProgram ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white cursor-pointer'}`}
                    >
                        <option value="">
                            {!selectedProgram ? "Select a Program First" : "Select a Class"}
                        </option>
                        {classes.length > 0 ? (
                            classes
                                .filter(cls => cls.program_id == selectedProgram)
                                .map((cls) => (
                                    <option key={cls.id} value={cls.id}>
                                        {cls.class_name}
                                    </option>
                                ))
                        ) : (
                            <option disabled>No Classes Available</option>
                        )}
                    </select>

                    {/* Student Dropdown - Only visible when a Class is selected */}
                    {selectedClass && (
                        <select
                            value={selectedStudent}
                            onChange={(e) => setSelectedStudent(e.target.value)}
                            className="w-full sm:w-auto px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 hover:bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="">All Students</option>
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student) => (
                                    <option key={student.id} value={student.id}>
                                        {student.full_name || student.name}
                                    </option>
                                ))
                            ) : (
                                <option disabled>No Students Found</option>
                            )}
                        </select>
                    )}
                </div>
            </div>

            <div className="h-[300px] w-full">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#010080]"></div>
                    </div>
                ) : isError ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-red-500">Failed to load assignment data</p>
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400">No assignment data available</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    borderRadius: '8px',
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                            <Legend />
                            {/* Brand Color #010080 for Completion Rate */}
                            <Bar dataKey="completionRate" fill="#010080" name="Completion Rate (%)" radius={[8, 8, 0, 0]} />
                            {/* Brand Color #f40606 (Red) or #4b47a4 (Purple) for Average Score - Using #f40606 for better contrast/brand usage */}
                            <Bar dataKey="avgScore" fill="#f40606" name="Average Score" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default AssignmentCompletionChart;
