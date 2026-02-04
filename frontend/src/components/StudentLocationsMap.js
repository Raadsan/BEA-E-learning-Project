"use client";

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useGetStudentLocationsQuery } from '@/redux/api/studentApi';

const StudentLocationsMap = ({ programs = [], classes = [] }) => {
    const [selectedProgram, setSelectedProgram] = useState('');
    const [selectedClass, setSelectedClass] = useState('');

    const { data: locations = [], isLoading, isError } = useGetStudentLocationsQuery({
        program_id: selectedProgram || undefined,
        class_id: selectedClass || undefined
    });

    // Sort locations by count desc and take top 10 for cleaner chart
    const chartData = [...locations]
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex flex-col mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-lg font-bold text-[#010080] flex items-center gap-2">
                        <span className="text-xl">🌍</span> Student Locations
                    </h3>
                    <div className="flex gap-2">
                        <select
                            value={selectedProgram}
                            onChange={(e) => {
                                setSelectedProgram(e.target.value);
                                setSelectedClass(''); // Reset class on program change
                            }}
                            className="w-full md:w-auto px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 hover:bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="">All Programs</option>
                            {programs.map((program) => (
                                <option key={program.id} value={program.id}>
                                    {program.title}
                                </option>
                            ))}
                        </select>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            disabled={!selectedProgram}
                            className={`w-full md:w-auto px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer transition-colors
                                ${!selectedProgram ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-50 hover:bg-white text-gray-700'}`}
                        >
                            <option value="">{selectedProgram ? 'All Classes' : 'Select Program First'}</option>
                            {classes
                                .filter(cls => !selectedProgram || cls.program_id === parseInt(selectedProgram))
                                .map((cls) => (
                                    <option key={cls.id} value={cls.id}>
                                        {cls.class_name}
                                    </option>
                                ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="h-[400px] w-full">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#010080]"></div>
                    </div>
                ) : isError ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-red-500">Failed to load location data</p>
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400">No location data available</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={chartData}
                            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="country"
                                type="category"
                                width={100}
                                tick={{ fill: '#4b5563', fontSize: 13 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    borderRadius: '8px',
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                                cursor={{ fill: 'rgba(243, 244, 246, 0.5)' }}
                            />
                            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                {chartData.map((entry, index) => {
                                    // Cycle through provided palette
                                    const colors = ['#010080', '#18178a', '#4b47a4', '#f95150', '#f40606'];
                                    return (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={colors[index % colors.length]}
                                        />
                                    );
                                })}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default StudentLocationsMap;
