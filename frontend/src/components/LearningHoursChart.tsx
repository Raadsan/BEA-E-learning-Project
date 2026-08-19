"use client";

import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useGetAdminLearningHoursQuery } from '@/lib/api/learningHoursApi';
import {
    CHART_CARD_CLASS,
    CHART_FOOTER_CLASS,
    ChartCanvas,
    ChartFilterSelect,
    ChartHeader,
    ChartLoading,
} from '@/components/dashboard/chartShared';
import { useChartContainer } from '@/hooks/useChartContainer';

const CustomLearningHoursTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-[#0b1033] text-white p-3.5 rounded-2xl shadow-2xl border border-[#010080]/60 text-xs min-w-[150px] space-y-1.5 backdrop-blur-md">
                <div className="font-bold text-sm text-blue-100 mb-1 border-b border-blue-800/40 pb-1 flex justify-between items-center">
                    <span>{label || data.name}</span>
                    {data.dayOfWeek && <span className="text-[10px] uppercase text-blue-300 font-semibold">{data.dayOfWeek}</span>}
                </div>
                <div className="flex items-center justify-between gap-3 text-blue-100">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#010080]"></span>
                        Learning Hours:
                    </span>
                    <span className="font-bold text-white text-sm">{data.hours} hrs</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-indigo-200">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#4b47a4]"></span>
                        Delivered Sessions:
                    </span>
                    <span className="font-bold text-white text-sm">{data.sessions || 0}</span>
                </div>
                <div className="flex items-center justify-between gap-3 pt-1 border-t border-blue-800/30 text-[11px] text-gray-300">
                    <span>Students Attended:</span>
                    <span className="font-bold text-emerald-400">{data.students || 0}</span>
                </div>
            </div>
        );
    }
    return null;
};

const LearningHoursChart = ({ programs = [], classes = [] }) => {
    const [selectedProgram, setSelectedProgram] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [timeFrame, setTimeFrame] = useState('Weekly');
    const { ref: chartRef, width: chartWidth } = useChartContainer();

    const { data: chartData = [], isLoading } = useGetAdminLearningHoursQuery({
        class_id: selectedClass || undefined,
        program_id: selectedProgram || undefined,
        timeFrame
    });

    const tickAngle = chartWidth < 420 && chartData.length > 6 ? -25 : 0;

    return (
        <div className={CHART_CARD_CLASS}>
            <ChartHeader
                title="Learning Hours"
                subtitle="TOTAL HOURS & SESSIONS DELIVERED"
                filters={
                    <>
                        <ChartFilterSelect
                            value={selectedProgram}
                            onChange={(e) => {
                                setSelectedProgram(e.target.value);
                                setSelectedClass('');
                            }}
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
                        </ChartFilterSelect>
                        <ChartFilterSelect
                            value={timeFrame}
                            onChange={(e) => setTimeFrame(e.target.value)}
                        >
                            <option value="Weekly">All Recent Sessions</option>
                            <option value="Daily">Today</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Yearly">Yearly</option>
                        </ChartFilterSelect>
                        <ChartFilterSelect
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                        >
                            <option value="">All Classes</option>
                            {classes
                                .filter(cls => !selectedProgram || cls.program_id == selectedProgram)
                                .map((cls) => (
                                    <option key={cls.id} value={cls.id}>
                                        {cls.class_name}
                                    </option>
                                ))}
                        </ChartFilterSelect>
                    </>
                }
            />

            <ChartCanvas chartRef={chartRef}>
                {isLoading ? (
                    <ChartLoading />
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 16, right: 16, left: -10, bottom: 8 }}>
                            <defs>
                                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#010080" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#010080" stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 500 }}
                                dy={8}
                                angle={tickAngle}
                                textAnchor={tickAngle ? "end" : "middle"}
                                height={tickAngle ? 42 : 30}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                width={36}
                                allowDecimals={false}
                            />
                            <Tooltip content={<CustomLearningHoursTooltip />} />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                align="center"
                                iconType="circle"
                                wrapperStyle={{ paddingTop: '14px', fontSize: 12, fontWeight: 600 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="hours"
                                stroke="#010080"
                                strokeWidth={2.5}
                                fillOpacity={1}
                                fill="url(#colorHours)"
                                name="Learning Hours"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </ChartCanvas>

            {chartData.length > 0 && (
                <div className={`${CHART_FOOTER_CLASS} grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4`}>
                    <div className="text-center p-3 sm:p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Total Hours</p>
                        <p className="text-xl sm:text-2xl font-bold text-[#010080]">
                            {chartData.reduce((sum, item) => sum + (item.hours || 0), 0)} hrs
                        </p>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Delivered Sessions</p>
                        <p className="text-xl sm:text-2xl font-bold text-[#010080]">
                            {chartData.reduce((sum, item) => sum + (item.sessions || 0), 0)}
                        </p>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Peak Day</p>
                        <p className="text-xl sm:text-2xl font-bold text-[#010080] truncate px-1">
                            {chartData.reduce((max, item) => (item.hours || 0) > (max.hours || 0) ? item : max, chartData[0])?.name || 'N/A'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LearningHoursChart;
