"use client";

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useGetStudentLocationsQuery } from '@/redux/api/studentApi';

const StudentLocationsMap = ({ programs = [] }) => {
    const [selectedProgram, setSelectedProgram] = useState('');

    // Mock data for a "perfect" look
    const locationData = [
        { country: 'Somalia', city: 'Mogadishu', student_count: 150 },
        { country: 'Somalia', city: 'Hargeisa', student_count: 85 },
        { country: 'Kenya', city: 'Nairobi', student_count: 45 },
        { country: 'Ethiopia', city: 'Addis Ababa', student_count: 30 },
        { country: 'Turkey', city: 'Istanbul', student_count: 25 },
        { country: 'United Kingdom', city: 'London', student_count: 20 },
        { country: 'United States', city: 'Columbus', student_count: 15 },
    ];

    const isLoading = false;
    const locations = locationData || [];

    // Group by country for bar chart
    const countryData = locations.reduce((acc, loc) => {
        const existing = acc.find(item => item.country === loc.country);
        if (existing) {
            existing.count += loc.student_count;
        } else {
            acc.push({ country: loc.country, count: loc.student_count });
        }
        return acc;
    }, []).sort((a, b) => b.count - a.count).slice(0, 10);

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex flex-col mb-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4">🌍 Student Locations</h3>
                <div className="flex gap-2 mb-4">
                    <select
                        value={selectedProgram}
                        onChange={(e) => setSelectedProgram(e.target.value)}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 hover:bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
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
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-400">Loading...</p>
                </div>
            ) : locations.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-400">No location data available</p>
                </div>
            ) : (
                <>
                    {/* Bar Chart */}
                    <div className="h-[300px] w-full mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={countryData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                <YAxis
                                    type="category"
                                    dataKey="country"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    width={90}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={[0, 8, 8, 0]} name="Students" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* City Details */}
                    {/* <div className="max-h-64 overflow-y-auto">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Cities</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {locations.map((loc, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{loc.city || 'Unknown'}</p>
                                        <p className="text-xs text-gray-500">{loc.country}</p>
                                    </div>
                                    <span className="text-sm font-bold text-blue-600">{loc.student_count}</span>
                                </div>
                            ))}
                        </div>
                    </div> */}
                </>
            )}
        </div>
    );
};

export default StudentLocationsMap;
