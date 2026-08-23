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
            <div className="bg-[#0b1033] text-white p-3.5 rounded-2xl shadow-2xl border border-[#010080]/60 text-xs min-w-[170px] space-y-1.5 backdrop-blur-md">
                <div className="font-bold text-sm text-blue-100 mb-1 border-b border-blue-800/40 pb-1 flex justify-between items-center">
                    <span>{label || data.name}</span>
                    {data.dayOfWeek && <span className="text-[10px] uppercase text-blue-300 font-semibold">{data.dayOfWeek}</span>}
                </div>
                <div className="flex items-center justify-between gap-3 text-emerald-300">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
                        Attended (Present):
                    </span>
                    <span className="font-bold text-white text-sm">{data.attended || 0} hrs</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-red-300">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#f40606]"></span>
                        Absent:
                    </span>
                    <span className="font-bold text-white text-sm">{data.absent || 0} hrs</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-amber-300">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
                        Excused (Cudurdaar):
                    </span>
                    <span className="font-bold text-white text-sm">{data.excused || 0} hrs</span>
                </div>
                {data.percentage !== undefined && (
                    <div className="flex items-center justify-between gap-3 pt-1 border-t border-blue-800/30 text-[11px]">
                        <span className="text-gray-300">Presence Rate:</span>
                        <span className="font-bold text-emerald-400">{data.percentage}%</span>
                    </div>
                )}
            </div>
        );
    }
    return null;
};

const WeeklyAttendanceChart = ({ programs = [], classes = [] }: { programs?: any[]; classes?: any[] }) => {
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
                title="Class Attendance Breakdown"
                subtitle="PRESENT, ABSENT, AND EXCUSED ALLOCATION OVER TIME"
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
                            <option value="Weekly">Recent Sessions</option>
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
                    <ChartEmpty message="No attendance data recorded yet" />
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
                                name="Present (Attended)"
                                stroke="#10b981"
                                strokeWidth={2.5}
                                dot={{ r: 4.5, fill: '#fff', stroke: '#10b981', strokeWidth: 2 }}
                                activeDot={{ r: 6.5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
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
                            <Line
                                type="monotone"
                                dataKey="excused"
                                name="Excused (Cudurdaar)"
                                stroke="#f59e0b"
                                strokeWidth={2.5}
                                dot={{ r: 4.5, fill: '#fff', stroke: '#f59e0b', strokeWidth: 2 }}
                                activeDot={{ r: 6.5, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </ChartCanvas>

            {processedData.length > 0 && (
                <div className={`${CHART_FOOTER_CLASS} grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4`}>
                    <div className="text-center p-3 sm:p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider mb-1">Present</p>
                        <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                            {processedData.reduce((sum: number, item: any) => sum + (item.attended || 0), 0)} <span className="text-xs font-normal text-gray-500">hrs</span>
                        </p>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-red-50/50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/30">
                        <p className="text-[11px] text-red-700 dark:text-red-300 font-bold uppercase tracking-wider mb-1">Absent</p>
                        <p className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-400">
                            {processedData.reduce((sum: number, item: any) => sum + (item.absent || 0), 0)} <span className="text-xs font-normal text-gray-500">hrs</span>
                        </p>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/30">
                        <p className="text-[11px] text-amber-700 dark:text-amber-300 font-bold uppercase tracking-wider mb-1">Excused</p>
                        <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
                            {processedData.reduce((sum: number, item: any) => sum + (item.excused || 0), 0)} <span className="text-xs font-normal text-gray-500">hrs</span>
                        </p>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                        <p className="text-[11px] text-blue-700 dark:text-blue-300 font-bold uppercase tracking-wider mb-1">Presence Rate</p>
                        <p className="text-xl sm:text-2xl font-black text-[#010080] dark:text-blue-400">
                            {(() => {
                                const totalAtt = processedData.reduce((sum: number, item: any) => sum + (item.attended || 0), 0);
                                const totalAbs = processedData.reduce((sum: number, item: any) => sum + (item.absent || 0), 0);
                                const totalExc = processedData.reduce((sum: number, item: any) => sum + (item.excused || 0), 0);
                                const total = totalAtt + totalAbs + totalExc;
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
