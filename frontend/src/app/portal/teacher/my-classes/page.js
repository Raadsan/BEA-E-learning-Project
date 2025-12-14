"use client";

import React from "react";
import DataTable from "@/components/DataTable";
import { useGetTeacherClassesQuery } from "@/redux/api/teacherApi";
import TeacherHeader from "../TeacherHeader";

export default function MyClassesPage() {
    const { data: classes, isLoading } = useGetTeacherClassesQuery();

    const columns = [
        { key: "class_name", label: "Class Name" },
        { key: "program_name", label: "Program" },
        { key: "subprogram_name", label: "Subprogram" },
        { key: "course_title", label: "Course" },
        { key: "schedule", label: "Schedule" },
    ];

    const handleAddClick = () => {
        // Navigate to add class or show modal (if needed, but usually teachers don't add classes?)
        // For now, assume teachers view their assigned classes.
        console.log("Add class clicked");
    };

    return (
        <>
            <TeacherHeader />
            <main className="flex-1 overflow-y-auto p-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">My Classes</h1>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <DataTable
                        title="Assigned Classes"
                        columns={columns}
                        data={classes || []}
                        onAddClick={null} // Hide add button for now as teachers might not add classes themselves
                        showAddButton={false}
                    />
                )}
            </main>
        </>
    );
}
