"use client";

import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useGetSexDistributionQuery } from '@/redux/api/studentApi';

const COLORS = {
    'Male': '#3b82f6',
    'Female': '#ec4899',
    'Not Specified': '#6b7280'
};

const SexDistributionChart = ({ programs = [], classes = [] }) => {
    const [selectedProgram, setSelectedProgram] = useState('');
    const [selectedClass, setSelectedClass] = useState('');

    const { data: sexData, isLoading } = useGetSexDistributionQuery({
        program_id: selectedProgram,
        class_id: selectedClass
    });

    const chartData = sexData || [];

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex flex-col mb-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Sex</h3>
                <div className="flex gap-2 mb-4 flex-wrap">
                    <select
                        value={selectedProgram}
                        onChange={(e) => {
                            setSelectedProgram(e.target.value);
                            setSelectedClass(''); // Reset class
                        }}
                        className="w-full sm:w-auto px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 hover:bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
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
                    </select>
                    <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full sm:w-auto px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 hover:bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                        <option value="">All Classes</option>
                        {classes
                            .filter(cls => !selectedProgram || cls.program_id == selectedProgram)
                            .map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.class_name}
                                </option>
                            ))
                        }
                    </select>
                </div>
            </div>

            <div className="h-[350px] w-full">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400">Loading...</p>
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400">No data available</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                label={({ sex, percentage }) => `${sex}: ${percentage}%`}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="count"
                                nameKey="sex"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[entry.sex] || COLORS['Not Specified']} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value, name, props) => [
                                    `${value} students (${props.payload.percentage}%)`,
                                    props.payload.sex
                                ]}
                            />
                            <Legend
                                layout="vertical"
                                verticalAlign="top"
                                align="right"
                                wrapperStyle={{ marginRight: '100px', marginTop: '70px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>

        </div>
    );
};

export default SexDistributionChart;
