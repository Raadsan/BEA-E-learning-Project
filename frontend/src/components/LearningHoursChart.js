"use client";

import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useGetAdminLearningHoursQuery } from '@/redux/api/learningHoursApi';

const LearningHoursChart = ({ programs = [], classes = [] }) => {
    const [selectedProgram, setSelectedProgram] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [timeFrame, setTimeFrame] = useState('Weekly');

    const { data: chartData = [], isLoading } = useGetAdminLearningHoursQuery({
        class_id: selectedClass || undefined,
        program_id: selectedProgram || undefined,
        timeFrame
    });

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex flex-col mb-4">
                <h3 className="text-lg font-bold text-[#010080] mb-4">Learning Hours</h3>
                <div className="flex gap-2 mb-4 flex-wrap">
                    <select
                        value={selectedProgram}
                        onChange={(e) => {
                            setSelectedProgram(e.target.value);
                            setSelectedClass(''); // Reset class selection
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
                        value={timeFrame}
                        onChange={(e) => setTimeFrame(e.target.value)}
                        className="w-full sm:w-auto px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 hover:bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                        <option value="Daily">Today</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Yearly">Yearly</option>
                    </select>
                    <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full sm:w-auto px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 hover:bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                        <option value="">All Classes</option>
                        {classes
                            .filter(cls => !selectedProgram || cls.program_id == selectedProgram)
                            .map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.class_name}
                                </option>
                            ))
                        }
                    </select>
                </div>
            </div>

            <div className="h-[300px] w-full">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#010080]"></div>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#010080" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#010080" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="name"
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
                            <Area
                                type="monotone"
                                dataKey="hours"
                                stroke="#010080"
                                fillOpacity={1}
                                fill="url(#colorHours)"
                                name="Learning Hours"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Summary */}
            {chartData.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Total Hours</p>
                        <p className="text-2xl font-bold text-[#010080]">
                            {chartData.reduce((sum, item) => sum + (item.hours || 0), 0)}
                        </p>
                    </div>
                    <div className="text-center p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Avg Hours/Day</p>
                        <p className="text-2xl font-bold text-[#010080]">
                            {(chartData.reduce((sum, item) => sum + (item.hours || 0), 0) / chartData.length).toFixed(1)}
                        </p>
                    </div>
                    <div className="text-center p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Peak Day</p>
                        <p className="text-2xl font-bold text-[#010080]">
                            {chartData.reduce((max, item) => item.hours > max.hours ? item : max, chartData[0])?.name || 'N/A'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LearningHoursChart;
