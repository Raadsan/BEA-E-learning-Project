"use client";

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useGetStudentLocationsQuery } from '@/lib/api/studentApi';
import {
    CHART_CARD_CLASS,
    ChartCanvas,
    ChartEmpty,
    ChartError,
    ChartFilterSelect,
    ChartHeader,
    ChartLoading,
} from '@/components/dashboard/chartShared';
import { getDynamicBarSize, useChartContainer } from '@/hooks/useChartContainer';

const StudentLocationsMap = ({ programs = [], classes = [] }) => {
    const [selectedProgram, setSelectedProgram] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const { ref: chartRef, width: chartWidth } = useChartContainer();

    const { data: locations = [], isLoading, isError } = useGetStudentLocationsQuery({
        program_id: selectedProgram || undefined,
        class_id: selectedClass || undefined
    });

    const chartData = [...locations]
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    const barSize = getDynamicBarSize(chartWidth, chartData.length || 1, 1);
    const yAxisWidth = Math.min(140, Math.max(72, ...chartData.map((d) => (d.country?.length || 0) * 7)));

    return (
        <div className={CHART_CARD_CLASS}>
            <ChartHeader
                title="Student Locations"
                icon={<span className="text-xl">🌍</span>}
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
                            {programs.map((program) => (
                                <option key={program.id} value={program.id}>
                                    {program.title}
                                </option>
                            ))}
                        </ChartFilterSelect>
                        <ChartFilterSelect
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            disabled={!selectedProgram}
                            className={!selectedProgram ? 'opacity-50 cursor-not-allowed' : ''}
                        >
                            <option value="">{selectedProgram ? 'All Classes' : 'Select Program First'}</option>
                            {classes
                                .filter(cls => !selectedProgram || cls.program_id === parseInt(selectedProgram))
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
                ) : isError ? (
                    <ChartError message="Failed to load location data" />
                ) : chartData.length === 0 ? (
                    <ChartEmpty message="No location data available" />
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={chartData}
                            margin={{ top: 5, right: 20, left: 4, bottom: 5 }}
                            barCategoryGap="12%"
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="country"
                                type="category"
                                width={yAxisWidth}
                                tick={{ fill: '#4b5563', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    borderRadius: '8px',
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                                cursor={{ fill: 'rgba(243, 244, 246, 0.5)' }}
                            />
                            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={barSize}>
                                {chartData.map((entry, index) => {
                                    const colors = ['#010080', '#18178a', '#4b47a4', '#f95150', '#f40606'];
                                    return (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={colors[index % colors.length]}
                                        />
                                    );
                                })}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </ChartCanvas>
        </div>
    );
};

export default StudentLocationsMap;
