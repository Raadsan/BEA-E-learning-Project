"use client";

import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useGetSexDistributionQuery } from '@/lib/api/studentApi';
import {
    CHART_CARD_CLASS,
    ChartCanvas,
    ChartEmpty,
    ChartFilterSelect,
    ChartHeader,
    ChartLoading,
} from '@/components/dashboard/chartShared';
import { getDynamicPieRadius, useChartContainer } from '@/hooks/useChartContainer';

const COLORS = {
    'Male': '#010080',
    'Female': '#f95150',
    'Not Specified': '#18178a'
};

const SexDistributionChart = ({ programs = [], classes = [] }) => {
    const [selectedProgram, setSelectedProgram] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const { ref: chartRef, width: chartWidth, height: chartHeight } = useChartContainer();

    const { data: sexData, isLoading } = useGetSexDistributionQuery({
        program_id: selectedProgram,
        class_id: selectedClass
    });

    const chartData = sexData || [];
    const outerRadius = getDynamicPieRadius(chartWidth, chartHeight);
    const isCompact = chartWidth < 480;

    return (
        <div className={CHART_CARD_CLASS}>
            <ChartHeader
                title="Sex"
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
                ) : chartData.length === 0 ? (
                    <ChartEmpty />
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy={isCompact ? "45%" : "50%"}
                                labelLine={!isCompact}
                                label={isCompact ? false : ((entry: { sex: string; percentage: number }) => `${entry.sex}: ${entry.percentage}%`)}
                                outerRadius={outerRadius}
                                fill="#8884d8"
                                dataKey="count"
                                nameKey="sex"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[entry.sex] || COLORS['Not Specified']} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value, _name, props) => [
                                    `${value} students (${props.payload.percentage}%)`,
                                    props.payload.sex
                                ]}
                            />
                            <Legend
                                layout={isCompact ? "horizontal" : "vertical"}
                                verticalAlign={isCompact ? "bottom" : "middle"}
                                align={isCompact ? "center" : "right"}
                                wrapperStyle={isCompact ? { paddingTop: 8 } : { paddingRight: 12 }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </ChartCanvas>
        </div>
    );
};

export default SexDistributionChart;
