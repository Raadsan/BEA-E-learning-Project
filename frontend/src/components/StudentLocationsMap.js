"use client";

import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useDarkMode } from "@/context/ThemeContext";

// Simple coordinate mapping for demo purposes (0-100% scale)
const COUNTRY_COORDINATES = {
    'Somalia': { x: 62, y: 58 },
    'Kenya': { x: 60, y: 63 },
    'Ethiopia': { x: 60, y: 56 },
    'Turkey': { x: 55, y: 38 },
    'United Kingdom': { x: 48, y: 28 },
    'UK': { x: 48, y: 28 },
    'United States': { x: 20, y: 38 },
    'USA': { x: 20, y: 38 },
    'Canada': { x: 20, y: 20 },
    'Djibouti': { x: 61, y: 55 },
    'Uganda': { x: 58, y: 63 },
    'Tanzania': { x: 60, y: 68 },
    'India': { x: 70, y: 45 },
    'China': { x: 78, y: 38 },
    'Australia': { x: 85, y: 75 },
    'Germany': { x: 50, y: 30 },
    'France': { x: 48, y: 31 },
    'Netherlands': { x: 49, y: 29 },
    'Sweden': { x: 51, y: 22 },
    'Norway': { x: 50, y: 22 },
    'Saudi Arabia': { x: 58, y: 45 },
    'UAE': { x: 60, y: 44 },
    'Yemen': { x: 59, y: 48 },
    'Egypt': { x: 55, y: 42 },
};

const StudentLocationsMap = ({ programs = [], students = [] }) => {
    const [selectedProgram, setSelectedProgram] = useState('');
    const { isDark } = useDarkMode();

    // Process Data
    const processedData = useMemo(() => {
        // Handle students array whether it's direct array or { students: [] }
        const studentsList = Array.isArray(students) ? students : (students?.students || []);

        // Filter by program if selected
        const filteredStudents = selectedProgram
            ? studentsList.filter(s => s.chosen_program == selectedProgram)
            : studentsList;

        // Aggregate by country
        const countryCounts = filteredStudents.reduce((acc, student) => {
            // Check residency_country or fallback
            let country = student.residency_country || student.country || 'Unknown';
            // Normalize country names if needed here
            if (country) country = country.trim();
            else return acc;

            if (!acc[country]) {
                acc[country] = { country, count: 0, x: 0, y: 0 };
            }
            acc[country].count += 1;

            // Add coordinates if known
            if (COUNTRY_COORDINATES[country]) {
                acc[country].x = COUNTRY_COORDINATES[country].x;
                acc[country].y = COUNTRY_COORDINATES[country].y;
            }

            return acc;
        }, {});

        // Convert to array and sort
        return Object.values(countryCounts)
            .sort((a, b) => b.count - a.count)
            .filter(item => item.country !== 'Unknown' && item.country !== '');
    }, [students, selectedProgram]);

    return (
        <div className={`p-6 rounded-xl shadow-md border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} h-full flex flex-col`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    🌍 Student Locations
                </h3>
                <select
                    value={selectedProgram}
                    onChange={(e) => setSelectedProgram(e.target.value)}
                    className={`px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-700'
                        }`}
                >
                    <option value="">All Programs</option>
                    {programs.length > 0 && programs.map((program) => (
                        <option key={program.id} value={program.id}>
                            {program.title}
                        </option>
                    ))}
                </select>
            </div>

            {processedData.length === 0 ? (
                <div className={`flex-1 flex items-center justify-center min-h-[300px] border-2 border-dashed rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="text-center">
                        <span className="text-4xl block mb-2">🗺️</span>
                        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>No location data available</p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-8 flex-1">
                    {/* Map Visualization */}
                    <div className="flex-1 relative min-h-[300px] h-[300px] rounded-xl overflow-hidden">

                        {/* Map Image Background */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <img
                                src="/images/map.png"
                                alt="World Map"
                                className="w-full h-full object-contain opacity-50 dark:opacity-30"
                            />
                        </div>

                        {/* Pins */}
                        {processedData.map((item, index) => (
                            item.x > 0 && (
                                <div
                                    key={index}
                                    className="absolute group flex flex-col items-center justify-end cursor-pointer"
                                    style={{ left: `${item.x}%`, top: `${item.y}%`, transform: 'translate(-50%, -100%)' }}
                                >
                                    {/* Pin Icon */}
                                    <div className="relative hover:scale-125 transition-transform duration-300">
                                        <svg
                                            width="24"
                                            height="32"
                                            viewBox="0 0 24 32"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="drop-shadow-md"
                                        >
                                            <path
                                                d="M12 0C5.37258 0 0 5.37258 0 12C0 20.25 12 32 12 32C12 32 24 20.25 24 12C24 5.37258 18.6274 0 12 0Z"
                                                fill={
                                                    index === 0 ? '#3b82f6' :
                                                        index === 1 ? '#8b5cf6' :
                                                            index === 2 ? '#10b981' :
                                                                '#f43f5e'
                                                }
                                            />
                                            <circle cx="12" cy="12" r="4" fill="white" />
                                        </svg>
                                    </div>

                                    {/* Tooltip */}
                                    <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                        <div className={`text-xs px-2 py-1 rounded shadow-lg font-medium transform translate-y-1 ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
                                            }`}>
                                            {item.country}: {item.count}
                                        </div>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>

                    {/* Bar Chart */}
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={processedData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? "#374151" : "#f0f0f0"} />
                                <XAxis type="number" hide />
                                <YAxis
                                    type="category"
                                    dataKey="country"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                                    width={70}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDark ? '#1f2937' : '#fff',
                                        borderRadius: '8px',
                                        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                                        color: isDark ? '#fff' : '#000'
                                    }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                                    {processedData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={
                                            index === 0 ? '#3b82f6' :
                                                index === 1 ? '#8b5cf6' :
                                                    index === 2 ? '#10b981' :
                                                        '#f43f5e'
                                        } />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentLocationsMap;
