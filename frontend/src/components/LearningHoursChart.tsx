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

    const tickAngle = chartWidth < 420 && chartData.length > 6 ? -35 : 0;

    return (
        <div className={CHART_CARD_CLASS}>
            <ChartHeader
                title="Learning Hours"
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
                            <option value="Daily">Today</option>
                            <option value="Weekly">Weekly</option>
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
                        <AreaChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: tickAngle ? 18 : 0 }}>
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
                                tick={{ fill: '#6b7280', fontSize: 11 }}
                                angle={tickAngle}
                                textAnchor={tickAngle ? "end" : "middle"}
                                height={tickAngle ? 50 : 30}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                width={36}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    borderRadius: '8px',
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
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
            </ChartCanvas>

            {chartData.length > 0 && (
                <div className={`${CHART_FOOTER_CLASS} grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4`}>
                    <div className="text-center p-3 sm:p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Total Hours</p>
                        <p className="text-xl sm:text-2xl font-bold text-[#010080]">
                            {chartData.reduce((sum, item) => sum + (item.hours || 0), 0)}
                        </p>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Avg Hours/Day</p>
                        <p className="text-xl sm:text-2xl font-bold text-[#010080]">
                            {(chartData.reduce((sum, item) => sum + (item.hours || 0), 0) / chartData.length).toFixed(1)}
                        </p>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Peak Day</p>
                        <p className="text-xl sm:text-2xl font-bold text-[#010080] truncate px-1">
                            {chartData.reduce((max, item) => item.hours > max.hours ? item : max, chartData[0])?.name || 'N/A'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LearningHoursChart;
