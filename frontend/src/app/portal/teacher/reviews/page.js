"use client";

import { useState } from "react";
import { useGetClassesQuery } from "@/redux/api/classApi";
import { useGetStudentsByClassQuery } from "@/redux/api/studentApi";
import TeacherReviewForm from "@/components/ReviewFlows/TeacherReviewForm";
import DataTable from "@/components/DataTable";

export default function TeacherReviewsPage() {
    const { data: classes = [], isLoading: classesLoading } = useGetClassesQuery();

    // State for hierarchical selection
    const [selectedProgram, setSelectedProgram] = useState("");
    const [selectedSubprogram, setSelectedSubprogram] = useState("");
    const [selectedClassId, setSelectedClassId] = useState(null);

    // Derived lists based on selection
    const programs = [...new Set(classes.map(c => c.program_name).filter(Boolean))];

    const subprograms = [...new Set(classes
        .filter(c => c.program_name === selectedProgram)
        .map(c => c.subprogram_name)
        .filter(Boolean)
    )];

    const filteredClasses = classes.filter(c =>
        c.program_name === selectedProgram &&
        c.subprogram_name === selectedSubprogram
    );

    // Fetch students only when a class is selected
    const {
        data: students = [],
        isLoading: studentsLoading,
        refetch: refetchStudents
    } = useGetStudentsByClassQuery(selectedClassId, {
        skip: !selectedClassId
    });

    // Handlers
    const handleProgramChange = (e) => {
        setSelectedProgram(e.target.value);
        setSelectedSubprogram("");
        setSelectedClassId(null);
    };

    const handleSubprogramChange = (e) => {
        setSelectedSubprogram(e.target.value);
        setSelectedClassId(null);
    };

    const columns = [
       
        { key: "student_id", label: "Student ID", sortable: true },
         { key: "full_name", label: "Student Name", sortable: true },
        { key: "sex", label: "Gender", sortable: true },
        {
            key: "actions",
            label: "Action",
            render: (_, student) => (
                <TeacherReviewForm
                    student={student}
                    classId={selectedClassId}
                    termSerial="2026-1"
                    onComplete={refetchStudents}
                />
            ),
            sortable: false
        }
    ];

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Student Reviews</h1>

            {/* Filters Container */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* 1. Program Selection */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        1. Select Program
                    </label>
                    <select
                        className="w-full p-3 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all"
                        onChange={handleProgramChange}
                        value={selectedProgram}
                        disabled={classesLoading}
                    >
                        <option value="">-- Choose Program --</option>
                        {programs.map((prog) => (
                            <option key={prog} value={prog}>
                                {prog}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 2. Subprogram Selection */}
                <div>
                    <label className={`block text-sm font-semibold mb-2 ${!selectedProgram ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        2. Select Level/Subprogram
                    </label>
                    <select
                        className="w-full p-3 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        onChange={handleSubprogramChange}
                        value={selectedSubprogram}
                        disabled={!selectedProgram}
                    >
                        <option value="">-- Choose Level --</option>
                        {subprograms.map((sub) => (
                            <option key={sub} value={sub}>
                                {sub}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 3. Class Selection */}
                <div>
                    <label className={`block text-sm font-semibold mb-2 ${!selectedSubprogram ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        3. Select Class
                    </label>
                    <select
                        className="w-full p-3 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        value={selectedClassId || ""}
                        disabled={!selectedSubprogram}
                    >
                        <option value="">-- Choose Class --</option>
                        {filteredClasses.map((cls) => (
                            <option key={cls.id} value={cls.id}>
                                {cls.class_name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Students Table */}
            {selectedClassId ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <DataTable
                        title={`Students in ${classes.find(c => c.id == selectedClassId)?.class_name}`}
                        columns={columns}
                        data={students}
                        isLoading={studentsLoading}
                        searchPlaceholder="Search students..."
                        showAddButton={false}
                    />
                </div>
            ) : (
                <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <div className="max-w-xs mx-auto text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No Class Selected</h3>
                        <p className="text-sm">Please use the filters above to select a class and start reviewing students.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
