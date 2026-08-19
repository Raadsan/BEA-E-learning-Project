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
} from 'recharts';
import { useGetAttendanceStatsQuery } from '@/lib/api/attendanceApi';
import {
    CHART_CARD_CLASS,
    CHART_FOOTER_CLASS,
    ChartCanvas,
    ChartEmpty,
    ChartFilterSelect,
    ChartHeader,
    ChartLoading,
} from '@/components/dashboard/chartShared';
import { useChartContainer } from '@/hooks/useChartContainer';

const CustomAttendanceTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-[#0b1033] text-white p-3.5 rounded-2xl shadow-2xl border border-[#010080]/60 text-xs min-w-[160px] space-y-1.5 backdrop-blur-md">
                <div className="font-bold text-sm text-blue-100 mb-1 border-b border-blue-800/40 pb-1 flex justify-between items-center">
                    <span>{label || data.name}</span>
                    {data.dayOfWeek && <span className="text-[10px] uppercase text-blue-300 font-semibold">{data.dayOfWeek}</span>}
                </div>
                <div className="flex items-center justify-between gap-3 text-blue-100">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#010080]"></span>
                        Attended:
                    </span>
                    <span className="font-bold text-white text-sm">{data.attended} hrs</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-red-100">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#f40606]"></span>
                        Absent:
                    </span>
                    <span className="font-bold text-white text-sm">{data.absent} hrs</span>
                </div>
                {data.percentage !== undefined && (
                    <div className="flex items-center justify-between gap-3 pt-1 border-t border-blue-800/30 text-[11px]">
                        <span className="text-gray-300">Rate:</span>
                        <span className="font-bold text-emerald-400">{data.percentage}%</span>
                    </div>
                )}
            </div>
        );
    }
    return null;
};

const WeeklyAttendanceChart = ({ programs = [], classes = [] }) => {
    const [selectedProgram, setSelectedProgram] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [timeFrame, setTimeFrame] = useState('Weekly');
    const { ref: chartRef, width: chartWidth } = useChartContainer();

    const { data: statsData, isLoading } = useGetAttendanceStatsQuery({
        class_id: selectedClass || undefined,
        program_id: selectedProgram || undefined,
        timeFrame
    });

    const processedData = statsData || [];
    const tickAngle = chartWidth < 420 && processedData.length > 5 ? -25 : 0;

    return (
        <div className={CHART_CARD_CLASS}>
            <ChartHeader
                title="Weekly Class Attendance Overview"
                subtitle="ATTENDANCE AND ABSENCE TRACKING OVER TIME"
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
                            <option value="Daily">Daily</option>
                            <option value="Today">Today</option>
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
                ) : processedData.length === 0 ? (
                    <ChartEmpty message="No attendance data available" />
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={processedData}
                            margin={{ top: 16, right: 20, left: -10, bottom: 8 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 500 }}
                                dy={8}
                                interval={0}
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
                            <Tooltip content={<CustomAttendanceTooltip />} />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                align="center"
                                iconType="circle"
                                wrapperStyle={{ paddingTop: '14px', fontSize: 12, fontWeight: 600 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="attended"
                                name="Attended"
                                stroke="#010080"
                                strokeWidth={2.5}
                                dot={{ r: 4.5, fill: '#fff', stroke: '#010080', strokeWidth: 2 }}
                                activeDot={{ r: 6.5, fill: '#010080', stroke: '#fff', strokeWidth: 2 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="absent"
                                name="Absent"
                                stroke="#f40606"
                                strokeWidth={2.5}
                                dot={{ r: 4.5, fill: '#fff', stroke: '#f40606', strokeWidth: 2 }}
                                activeDot={{ r: 6.5, fill: '#f40606', stroke: '#fff', strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </ChartCanvas>

            {processedData.length > 0 && (
                <div className={`${CHART_FOOTER_CLASS} grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4`}>
                    <div className="text-center p-3 sm:p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">Total Attended</p>
                        <p className="text-xl sm:text-2xl font-bold text-[#010080] dark:text-blue-400">
                            {processedData.reduce((sum, item) => sum + (item.attended || 0), 0)} <span className="text-sm font-normal text-gray-500">hrs</span>
                        </p>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-red-50/50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/30">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">Total Absent</p>
                        <p className="text-xl sm:text-2xl font-bold text-[#f40606] dark:text-red-400">
                            {processedData.reduce((sum, item) => sum + (item.absent || 0), 0)} <span className="text-sm font-normal text-gray-500">hrs</span>
                        </p>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">Overall Rate</p>
                        <p className="text-xl sm:text-2xl font-bold text-[#010080] dark:text-blue-400">
                            {(() => {
                                const totalAtt = processedData.reduce((sum, item) => sum + (item.attended || 0), 0);
                                const totalAbs = processedData.reduce((sum, item) => sum + (item.absent || 0), 0);
                                const total = totalAtt + totalAbs;
                                return total > 0 ? `${((totalAtt / total) * 100).toFixed(1)}%` : '0%';
                            })()}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeeklyAttendanceChart;
