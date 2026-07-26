"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ChartCanvas, ChartEmpty } from '@/components/dashboard/chartShared';
import { getDynamicBarSize, useChartContainer } from '@/hooks/useChartContainer';

const COLORS = ['#f40606', '#010080', '#4b47a4', '#f95150', '#18178a'];

const ProgramPieChart = ({ data, unit = "Students" }) => {
    const { ref: chartRef, width: chartWidth } = useChartContainer();

    const chartData = data.map(item => ({
        ...item,
        count: item.studentCount !== undefined ? item.studentCount : item.value
    }));

    if (chartData.length === 0) {
        return <ChartEmpty />;
    }

    const barSize = getDynamicBarSize(chartWidth, chartData.length, 1);
    const shortLabel = (value: string) => value.length > 16 ? `${value.slice(0, 14)}...` : value;

    return (
        <ChartCanvas chartRef={chartRef} className="h-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{ top: 16, right: 12, left: 0, bottom: 0 }}
                    barCategoryGap="18%"
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 11 }}
                        dy={10}
                        interval={0}
                        angle={0}
                        textAnchor="middle"
                        height={40}
                        tickFormatter={shortLabel}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        width={36}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                        itemStyle={{ color: '#374151', fontWeight: 600 }}
                        formatter={(value) => [`${value} ${unit}`, 'Enrolled']}
                        cursor={{ fill: '#F3F4F6' }}
                    />
                    <Legend
                        verticalAlign="top"
                        height={32}
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ fontSize: 12 }}
                    />
                    <Bar
                        dataKey="count"
                        name={`${unit} Enrolled`}
                        radius={[4, 4, 0, 0]}
                        barSize={barSize}
                    >
                        {chartData.map((entry, index) => {
                            const PROGRAM_COLORS: Record<string, string> = { 'English2': '#010080', 'Muzamil': '#f40606' };
                            const color = PROGRAM_COLORS[entry.name] || COLORS[index % COLORS.length];
                            return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </ChartCanvas>
    );
};

export default ProgramPieChart;
