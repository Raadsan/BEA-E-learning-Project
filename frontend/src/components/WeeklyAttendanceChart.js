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

    // Fetch Stats
    const { data: statsData, isLoading } = useGetAttendanceStatsQuery({
        class_id: selectedClass || undefined,
        program_id: selectedProgram || undefined,
        timeFrame
    });

    // Process Data based on TimeFrame
    const processedData = React.useMemo(() => {
        if (!statsData) return [];

        // If daily, we might want to map "Monday" to "Mon" etc.
        if (timeFrame === 'Daily') {
            // Create a map for quick lookup
            const dayMap = {
                'Monday': 'Mon', 'Tuesday': 'Tue', 'Wednesday': 'Wed', 'Thursday': 'Thu', 'Friday': 'Fri', 'Saturday': 'Sat', 'Sunday': 'Sun'
            };

            // We want to ensure we show the sequence returned by API (chronological) 
            // but formatted correctly.
            return statsData.map(item => ({
                ...item,
                name: dayMap[item.name] || item.name // shorter name if daily
            }));
        }

        return statsData;
    }, [statsData, timeFrame]);

    // Fallback if empty to show an empty chart structure or message
    // But chart handles empty array nicely usually.

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-full h-full flex flex-col">
            <div className="flex flex-col mb-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Weekly Class Attendance Overview</h3>
                <div className="flex gap-2 mb-2 flex-wrap">
                    <select
                        value={selectedProgram}
                        onChange={(e) => {
                            setSelectedProgram(e.target.value);
                            setSelectedClass(''); // Reset class
                        }}
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
                        <option value="Today">Today</option>
                        <option value="Daily">Daily (Last 7 Days)</option>
                        <option value="Weekly">Weekly (Last 3 Months)</option>
                        <option value="Monthly">Monthly (Last Year)</option>
                    </select>
                    <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 hover:bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
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

            <div className="flex-1 min-h-[300px] w-full relative">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-gray-400 text-sm">Loading stats...</p>
                    </div>
                ) : processedData.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-gray-400 text-lg mb-1">No attendance data</p>
                            <p className="text-gray-400 text-sm opacity-70">Try adjusting the filters or range.</p>
                        </div>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={processedData}
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
                                interval={0} // Force show all
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
                    </ResponsiveContainer>
                )}
            </div>

            {/* Keeping the Area chart at bottom for extra visual flair as per original but mapping same data */}
            {processedData.length > 0 && (
                <div className="mt-4 h-24 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={processedData}>
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
                </div>
            )}
        </div>
    );
};

export default WeeklyAttendanceChart;
