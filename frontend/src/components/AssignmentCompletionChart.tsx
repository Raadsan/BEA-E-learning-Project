"use client";

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useGetAssignmentStatsQuery } from '@/lib/api/assignmentApi';
import {
    CHART_CARD_CLASS,
    ChartCanvas,
    ChartEmpty,
    ChartError,
    ChartFilterSelect,
    ChartHeader,
    ChartLoading,
} from '@/components/dashboard/chartShared';
import { getAssignmentBarSize, getAssignmentCategoryGap, useChartContainer } from '@/hooks/useChartContainer';

const AssignmentCompletionChart = ({ programs = [], classes = [], students = [] }) => {
    const [selectedProgram, setSelectedProgram] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const { ref: chartRef, width: chartWidth } = useChartContainer();

    const { data: apiData = [], isLoading, isError } = useGetAssignmentStatsQuery({
        program_id: selectedProgram || undefined,
        class_id: selectedClass || undefined,
        student_id: selectedStudent || undefined
    });

    const filteredStudents = selectedClass
        ? students.filter(student => student.class_id == selectedClass)
        : [];

    const typeLabels: Record<string, string> = {
        writing_task: "Writing Task",
        exam: "Exam",
        oral_assignment: "Oral Assignment",
        course_work: "Coursework",
    };

    const chartData = apiData.map((item) => ({
        ...item,
        completionRate: Number(item.completionRate) || 0,
        avgScore: Number(item.avgScore) || 0,
        label:
            typeLabels[item.type] ||
            item.type
                .split("_")
                .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" "),
    }));

    const barSize = getAssignmentBarSize(chartWidth, chartData.length || 1);
    const barCategoryGap = getAssignmentCategoryGap(chartData.length);

    return (
        <div className={CHART_CARD_CLASS}>
            <ChartHeader
                title="Assignment & Classwork Completion Rate"
                filters={
                    <>
                        <ChartFilterSelect
                            value={selectedProgram}
                            onChange={(e) => {
                                setSelectedProgram(e.target.value);
                                setSelectedClass('');
                                setSelectedStudent('');
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
                            onChange={(e) => {
                                setSelectedClass(e.target.value);
                                setSelectedStudent('');
                            }}
                            disabled={!selectedProgram}
                            className={!selectedProgram ? 'opacity-50 cursor-not-allowed' : ''}
                        >
                            <option value="">
                                {!selectedProgram ? "Select a Program First" : "Select a Class"}
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
                        {selectedClass && (
                            <ChartFilterSelect
                                value={selectedStudent}
                                onChange={(e) => setSelectedStudent(e.target.value)}
                            >
                                <option value="">All Students</option>
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map((student) => (
                                        <option key={student.id} value={student.id}>
                                            {student.full_name || student.name}
                                        </option>
                                    ))
                                ) : (
                                    <option disabled>No Students Found</option>
                                )}
                            </ChartFilterSelect>
                        )}
                    </>
                }
            />

            <ChartCanvas chartRef={chartRef}>
                {isLoading ? (
                    <ChartLoading />
                ) : isError ? (
                    <ChartError message="Failed to load assignment data" />
                ) : chartData.length === 0 ? (
                    <ChartEmpty message="No assignment data available" />
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 20, right: 16, left: 0, bottom: 5 }}
                            barGap={0}
                            barCategoryGap={barCategoryGap}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 500 }}
                                interval={0}
                                angle={0}
                                textAnchor="middle"
                                height={35}
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
                            <Bar dataKey="completionRate" fill="#010080" name="Completion Rate (%)" barSize={barSize} radius={[8, 8, 0, 0]} />
                            <Bar dataKey="avgScore" fill="#f40606" name="Average Score" barSize={barSize} radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </ChartCanvas>
        </div>
    );
};

export default AssignmentCompletionChart;
