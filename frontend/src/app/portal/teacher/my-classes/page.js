"use client";

import React, { useState } from "react";
import TeacherHeader from "../TeacherHeader";
import { useGetTeacherClassesQuery, useGetTeacherProgramsQuery } from "@/redux/api/teacherApi";
import { useGetStudentsQuery } from "@/redux/api/studentApi"; // Import students query
import { useDarkMode } from "@/context/ThemeContext";
import DataTable from "@/components/DataTable"; // Import DataTable

// Reusable Card Component specifically for this page
const InfoCard = ({ title, subtitle, details, footer, isDark, type }) => (
    <div className={`rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
        <div className={`h-2 w-full ${type === 'class' ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
        <div className="p-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{subtitle}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${type === 'class'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                    }`}>
                    {type === 'class' ? 'Active Class' : 'Program'}
                </span>
            </div>

            <div className="space-y-3 mb-6">
                {details.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <span className={`p-1.5 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} text-gray-500`}>
                            {item.icon}
                        </span>
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.text}</span>
                    </div>
                ))}
            </div>

            {footer && (
                <div className={`pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-50'}`}>
                    {footer}
                </div>
            )}
        </div>
    </div>
);

export default function MyClassesPage() {
    const { isDark } = useDarkMode();
    const [activeTab, setActiveTab] = useState('classes'); // 'classes' or 'programs'
    const [selectedClass, setSelectedClass] = useState(null); // State for selected class details

    // Fetch Data
    const { data: classesData, isLoading: classesLoading } = useGetTeacherClassesQuery();
    const { data: programsData, isLoading: programsLoading } = useGetTeacherProgramsQuery();
    const { data: studentsData } = useGetStudentsQuery(); // Fetch all students

    const classes = Array.isArray(classesData) ? classesData : [];
    const programs = Array.isArray(programsData) ? programsData : [];
    const allStudents = studentsData?.students || (Array.isArray(studentsData) ? studentsData : []);

    // Helper to get students for a specific class
    const getClassStudents = (classId) => {
        return allStudents.filter(student => String(student.class_id) === String(classId));
    };

    // Columns for the student table
    const studentColumns = [
        { label: "Full Name", key: "full_name" },
        { label: "Email", key: "email" },
        { label: "Phone", key: "phone" },
        {
            label: "Status",
            key: "status",
            render: (row) => (
                <span className={`px-2 py-1 rounded text-xs font-semibold ${row.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                    {row.status || 'Active'}
                </span>
            )
        }
    ];

    if (selectedClass) {
        const classStudents = getClassStudents(selectedClass.id);

        return (
            <>
                <TeacherHeader />
                <main className="flex-1 overflow-y-auto mt-6 bg-gray-50 dark:bg-gray-900 transition-colors min-h-screen">
                    <div className="container mx-auto px-4 md:px-8 py-8">
                        <button
                            onClick={() => setSelectedClass(null)}
                            className="mb-6 flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Back to Classes
                        </button>

                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{selectedClass.class_name}</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                {selectedClass.course_title} • {selectedClass.program_name}
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                            <DataTable
                                title={`Students (${classStudents.length})`}
                                columns={studentColumns}
                                data={classStudents}
                                showAddButton={false} // Read-only view for now
                            />
                        </div>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <TeacherHeader />
            <main className="flex-1 overflow-y-auto mt-6 bg-gray-50 dark:bg-gray-900 transition-colors min-h-screen">
                <div className="container mx-auto px-4 md:px-8 py-8">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Classes</h1>
                            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                View and manage all your assigned classes and programs.
                            </p>
                        </div>
                    </div>

                    {/* Content Section */}
                    {activeTab === 'classes' ? (
                        <div className="space-y-6">
                            {classesLoading ? (
                                <div className="flex justify-center py-20">
                                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                                </div>
                            ) : classes.length === 0 ? (
                                <div className={`text-center py-20 rounded-xl border-2 border-dashed ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                    <p className="text-gray-500">No classes assigned yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {classes.map((cls) => (
                                        <InfoCard
                                            key={cls.id}
                                            isDark={isDark}
                                            type="class"
                                            title={cls.class_name}
                                            subtitle={cls.course_title}
                                            details={[
                                                {
                                                    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                                                    text: cls.schedule || "Schedule not set"
                                                },
                                                {
                                                    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 0 011-1h2a1 0 011 1v5m-4 0h4" /></svg>,
                                                    text: `${cls.program_name} - ${cls.subprogram_name}` || "Unknown Program"
                                                },
                                                ...(cls.description ? [{
                                                    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                                                    text: cls.description
                                                }] : [])
                                            ]}
                                            footer={
                                                <button
                                                    onClick={() => setSelectedClass(cls)}
                                                    className={`w-full py-2 rounded-lg text-sm font-medium border transition-colors ${isDark
                                                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                                        }`}>
                                                    View Class Details
                                                </button>
                                            }
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {programsLoading ? (
                                <div className="flex justify-center py-20">
                                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                                </div>
                            ) : programs.length === 0 ? (
                                <div className={`text-center py-20 rounded-xl border-2 border-dashed ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                    <p className="text-gray-500">No programs assigned yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {programs.map((prog) => (
                                        <InfoCard
                                            key={prog.subprogram_id || prog.id} // prefer subprogram_id as keys for uniqueness in this view
                                            isDark={isDark}
                                            type="program"
                                            title={prog.subprogram_name}
                                            subtitle={prog.title || "Main Program"}
                                            details={[
                                                {
                                                    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
                                                    text: "Subprogram Curriculum"
                                                },
                                                {
                                                    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                                                    text: `Status: ${prog.status || 'Active'}`
                                                },
                                            ]}
                                            footer={
                                                <button className={`w-full py-2 rounded-lg text-sm font-medium border transition-colors ${isDark
                                                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                                    }`}>
                                                    View Program Materials
                                                </button>
                                            }
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
