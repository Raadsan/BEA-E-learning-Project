"use client";

import React, { useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';
import { useGetAttendanceStatsQuery } from '@/redux/api/attendanceApi';

const WeeklyAttendanceChart = ({ programs = [], classes = [] }) => {
    const [selectedProgram, setSelectedProgram] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [timeFrame, setTimeFrame] = useState('Daily');

    // Mock data for a "perfect" look
    const data = [
        { name: 'Mon', attended: 45, absent: 5, percentage: 90 },
        { name: 'Tue', attended: 48, absent: 2, percentage: 96 },
        { name: 'Wed', attended: 42, absent: 8, percentage: 84 },
        { name: 'Thu', attended: 50, absent: 0, percentage: 100 },
        { name: 'Fri', attended: 46, absent: 4, percentage: 92 },
        { name: 'Sat', attended: 38, absent: 2, percentage: 95 },
        { name: 'Sun', attended: 40, absent: 3, percentage: 93 },
    ];

    const isLoading = false;

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-full h-full">
            <div className="flex flex-col mb-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Weekly Class Attendance Overview</h3>
                <div className="flex gap-2 mb-2">
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
                        value={timeFrame}
                        onChange={(e) => setTimeFrame(e.target.value)}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 hover:bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                        <option value="Daily">Today</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Yearly">Yearly</option>
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

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-400">Loading stats...</p>
                        </div>
                    ) : (
                        <LineChart
                            data={data}
                            margin={{
                                top: 5,
                                right: 20,
                                left: -20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                formatter={(value, name) => [name === 'Attendance %' ? `${value}%` : value, name]}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                wrapperStyle={{ paddingTop: '20px' }}
                            />

                            <Line
                                type="monotone"
                                dataKey="attended"
                                name="Students Attended"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                dot={{ r: 4, fill: 'white', stroke: '#3b82f6', strokeWidth: 2 }}
                                activeDot={{ r: 6 }}
                            />

                            <Line
                                type="monotone"
                                dataKey="absent"
                                name="Students Absent"
                                stroke="#f97316"
                                strokeWidth={3}
                                dot={{ r: 4, fill: 'white', stroke: '#f97316', strokeWidth: 2 }}
                                activeDot={{ r: 6 }}
                            />

                            <Line
                                type="monotone"
                                dataKey="percentage"
                                name="Attendance %"
                                stroke="#60a5fa"
                                strokeWidth={2}
                                dot={{ r: 4, fill: 'white', stroke: '#60a5fa', strokeWidth: 2 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    )}
                </ResponsiveContainer>
            </div>

            <div className="mt-4 h-24 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorPercentage" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#dbeafe" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#dbeafe" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            hide
                        />
                        <Area type="monotone" dataKey="percentage" stroke="#93c5fd" fillOpacity={1} fill="url(#colorPercentage)" />
                    </AreaChart>
                </ResponsiveContainer>
                <div className="absolute right-0 top-0 flex flex-col items-end text-xs text-gray-500 pr-2">
                    {/* Static stats for now or could be calculated */}
                </div>
            </div>

        </div>
    );
};

export default WeeklyAttendanceChart;
