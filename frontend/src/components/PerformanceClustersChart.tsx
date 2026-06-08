"use client";

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useGetPerformanceClustersQuery } from '@/lib/api/assignmentApi';
import {
    CHART_CARD_CLASS,
    CHART_FOOTER_CLASS,
    ChartCanvas,
    ChartEmpty,
    ChartError,
    ChartFilterSelect,
    ChartHeader,
    ChartLoading,
} from '@/components/dashboard/chartShared';
import { getDynamicBarSize, useChartContainer } from '@/hooks/useChartContainer';

const COLORS = {
    'High': '#010080',
    'Average': '#4b47a4',
    'Low': '#f40606'
};

const PerformanceClustersChart = ({ programs = [], classes = [] }) => {
    const [selectedProgram, setSelectedProgram] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const { ref: chartRef, width: chartWidth } = useChartContainer();

    const { data: apiData = [], isLoading, isError } = useGetPerformanceClustersQuery({
        program_id: selectedProgram || undefined,
        class_id: selectedClass || undefined
    });

    const chartData = apiData;
    const barSize = getDynamicBarSize(chartWidth, chartData.length || 3, 1);

    return (
        <div className={CHART_CARD_CLASS}>
            <ChartHeader
                title="Student Performance Clusters"
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
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            disabled={!selectedProgram}
                            className={!selectedProgram ? 'opacity-50 cursor-not-allowed' : ''}
                        >
                            <option value="">
                                {!selectedProgram ? "Select a Program First" : "All Classes"}
                            </option>
                            {classes.length > 0 ? (
                                classes
                                    .filter(cls => cls.program_id == selectedProgram)
                                    .map((cls) => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.class_name}
                                        </option>
                                    ))
                            ) : (
                                <option disabled>No Classes Available</option>
                            )}
                        </ChartFilterSelect>
                    </>
                }
            />

            <ChartCanvas chartRef={chartRef}>
                {isLoading ? (
                    <ChartLoading />
                ) : isError ? (
                    <ChartError message="Failed to load performance data" />
                ) : chartData.length === 0 ? (
                    <ChartEmpty message="No performance data available" />
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 16, left: 0, bottom: 5 }} barCategoryGap="18%">
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="category"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 12 }}
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
                                formatter={(value, _name, props) => [
                                    `${value} students (${props.payload.percentage}%)`,
                                    'Count'
                                ]}
                            />
                            <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={barSize}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[entry.category] || '#ccc'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </ChartCanvas>

            <div className={`${CHART_FOOTER_CLASS} flex justify-center gap-4 sm:gap-6 flex-wrap`}>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded shrink-0" style={{ backgroundColor: COLORS['High'] }} />
                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">High (80%+)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded shrink-0" style={{ backgroundColor: COLORS['Average'] }} />
                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Average (60-79%)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded shrink-0" style={{ backgroundColor: COLORS['Low'] }} />
                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Low (&lt;60%)</span>
                </div>
            </div>
        </div>
    );
};

export default PerformanceClustersChart;
