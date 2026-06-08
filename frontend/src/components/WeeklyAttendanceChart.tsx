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

const WeeklyAttendanceChart = ({ programs = [], classes = [] }) => {
    const [selectedProgram, setSelectedProgram] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [timeFrame, setTimeFrame] = useState('Daily');
    const { ref: chartRef, width: chartWidth } = useChartContainer();

    const { data: statsData, isLoading } = useGetAttendanceStatsQuery({
        class_id: selectedClass || undefined,
        program_id: selectedProgram || undefined,
        timeFrame
    });

    const processedData = React.useMemo(() => {
        if (!statsData) return [];

        if (timeFrame === 'Daily') {
            const dayMap: Record<string, string> = {
                'Monday': 'Mon', 'Tuesday': 'Tue', 'Wednesday': 'Wed', 'Thursday': 'Thu', 'Friday': 'Fri', 'Saturday': 'Sat', 'Sunday': 'Sun'
            };

            return statsData.map(item => ({
                ...item,
                name: dayMap[item.name] || item.name
            }));
        }

        return statsData;
    }, [statsData, timeFrame]);

    const tickAngle = chartWidth < 420 && processedData.length > 5 ? -35 : 0;

    return (
        <div className={CHART_CARD_CLASS}>
            <ChartHeader
                title="Weekly Class Attendance Overview"
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
                            <option value="Today">Today</option>
                            <option value="Daily">Daily (Last 7 Days)</option>
                            <option value="Weekly">Weekly (Last 3 Months)</option>
                            <option value="Monthly">Monthly (Last Year)</option>
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
                    <ChartEmpty message="No attendance data" />
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={processedData}
                            margin={{ top: 5, right: 12, left: -12, bottom: tickAngle ? 18 : 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 11 }}
                                dy={10}
                                interval={0}
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
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                formatter={(value, name) => [name === 'Attendance %' ? `${value}%` : value, name]}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                wrapperStyle={{ paddingTop: '12px', fontSize: 12 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="attended"
                                name="Students Attended"
                                stroke="#010080"
                                strokeWidth={3}
                                dot={{ r: 4, fill: 'white', stroke: '#010080', strokeWidth: 2 }}
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="absent"
                                name="Students Absent"
                                stroke="#f40606"
                                strokeWidth={3}
                                dot={{ r: 4, fill: 'white', stroke: '#f40606', strokeWidth: 2 }}
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="percentage"
                                name="Attendance %"
                                stroke="#4b47a4"
                                strokeWidth={2}
                                dot={{ r: 4, fill: 'white', stroke: '#4b47a4', strokeWidth: 2 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </ChartCanvas>

            {processedData.length > 0 && (
                <div className={`${CHART_FOOTER_CLASS} h-16 sm:h-20 w-full min-w-0`}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={processedData}>
                            <defs>
                                <linearGradient id="colorPercentage" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4b47a4" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#4b47a4" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" hide />
                            <Area type="monotone" dataKey="percentage" stroke="#4b47a4" fillOpacity={1} fill="url(#colorPercentage)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default WeeklyAttendanceChart;
