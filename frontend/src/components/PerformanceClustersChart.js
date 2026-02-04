"use client";

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { useGetPerformanceClustersQuery } from '@/redux/api/assignmentApi';

// Semantic colors are good for performance, but user prefers "Green not Blue" where appropriate?
// Actually user said "make the design even the circles of parts green not blue".
// Here for performance, Green/Yellow/Red is standard.
// But to align with brand, maybe High = Green (#10b981), Average = #fbbf24, Low = #ef4444
// Brand colors: High = Navy, Average = Purple, Low = Red
const COLORS = {
    'High': '#010080', // Navy
    'Average': '#4b47a4', // Purple
    'Low': '#f40606'     // Red
};

const PerformanceClustersChart = ({ programs = [], classes = [] }) => {
    const [selectedProgram, setSelectedProgram] = useState('');
    const [selectedClass, setSelectedClass] = useState('');

    const { data: apiData = [], isLoading, isError } = useGetPerformanceClustersQuery({
        program_id: selectedProgram || undefined,
        class_id: selectedClass || undefined
    });

    const chartData = apiData;

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex flex-col mb-4">
                <h3 className="text-lg font-bold text-[#010080] mb-4">Student Performance Clusters</h3>
                <div className="flex gap-2 mb-4 flex-wrap">
                    <select
                        value={selectedProgram}
                        onChange={(e) => {
                            setSelectedProgram(e.target.value);
                            setSelectedClass('');
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
                        onChange={(e) => setSelectedClass(e.target.value)}
                        disabled={!selectedProgram}
                        className={`w-full sm:w-auto px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 ${!selectedProgram ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white cursor-pointer'}`}
                    >
                        <option value="">
                            {!selectedProgram ? "Select a Program First" : "All Classes"}
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
                </div>
            </div>

            <div className="h-[300px] w-full">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#010080]"></div>
                    </div>
                ) : isError ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-red-500">Failed to load performance data</p>
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400">No performance data available</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="category"
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
                                formatter={(value, name, props) => [
                                    `${value} students (${props.payload.percentage}%)`,
                                    'Count'
                                ]}
                            />
                            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[entry.category] || '#ccc'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Legend - match palette */}
            <div className="mt-4 flex justify-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS['High'] }}></div>
                    <span className="text-sm text-gray-700">High (80%+)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS['Average'] }}></div>
                    <span className="text-sm text-gray-700">Average (60-79%)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS['Low'] }}></div>
                    <span className="text-sm text-gray-700">Low (&lt;60%)</span>
                </div>
            </div>
        </div>
    );
};

export default PerformanceClustersChart;
