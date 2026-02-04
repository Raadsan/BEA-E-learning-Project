"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#f40606', '#010080', '#4b47a4', '#f95150', '#18178a'];

const ProgramPieChart = ({ data, unit = "Students" }) => {
    // Transform data to ensure we have the correct count accessible

    // Safety check: if data has studentCount use it, otherwise fall back to value
    const chartData = data.map(item => ({
        ...item,
        count: item.studentCount !== undefined ? item.studentCount : item.value
    }));

    if (chartData.length === 0) {
        return (
            <div className="h-full w-full flex items-center justify-center text-gray-400">
                No data available
            </div>
        );
    }

    return (
        <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 10,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 11 }}
                        dy={10}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={120} // Extra height for angled labels
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                        itemStyle={{ color: '#374151', fontWeight: 600 }}
                        formatter={(value, name) => [`${value} Students`, name]}
                        cursor={{ fill: '#F3F4F6' }}
                    />
                    <Legend
                        verticalAlign="top"
                        height={36}
                        align="right"
                        iconType="circle"
                    />
                    <Bar
                        dataKey="count"
                        name="Students Enrolled"
                        radius={[4, 4, 0, 0]}
                        barSize={40}
                    >
                        {chartData.map((entry, index) => {
                            const PROGRAM_COLORS = { 'English2': '#010080', 'Muzamil': '#f40606' };
                            const color = PROGRAM_COLORS[entry.name] || COLORS[index % COLORS.length];

                            return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ProgramPieChart;
