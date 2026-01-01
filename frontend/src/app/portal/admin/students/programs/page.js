"use client";

import { useState, useMemo } from "react";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";
import { useGetStudentsQuery } from "@/redux/api/studentApi";
import { useGetIeltsToeflStudentsQuery } from "@/redux/api/ieltsToeflApi";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useGetClassesQuery } from "@/redux/api/classApi";
import { useDarkMode } from "@/context/ThemeContext";

export default function ProgramStudentsPage() {
    const { isDark } = useDarkMode();
    const [selectedProgramId, setSelectedProgramId] = useState(null);

    // Fetch Data
    const { data: globalPrograms = [], isLoading: isProgramsLoading } = useGetProgramsQuery();
    const { data: regularStudents = [], isLoading: isRegularLoading } = useGetStudentsQuery();
    const { data: ieltsStudents = [], isLoading: isIeltsLoading } = useGetIeltsToeflStudentsQuery();
    const { data: classes = [] } = useGetClassesQuery();

    // Combine Students
    const allStudents = useMemo(() => {
        // Format regular students
        const regular = regularStudents.map(s => ({
            ...s,
            type: 'regular',
            studentName: s.full_name, // normalize name
            programName: s.chosen_program,
            status: s.approval_status
        }));

        // Format IELTS students
        const ielts = ieltsStudents.map(s => ({
            ...s,
            type: 'ielts',
            studentName: `${s.firstName} ${s.lastName}`,
            programName: s.examType, // "IELTS" or "TOEFL" usually, or linked program title?
            // IELTS students in DB might have chosen_program set to "IELTS & TOFEL Preparation" or similar.
            // We generally rely on examType or check logic.
            // For consistency with regular students, let's map it if possible.
            // Usually the program title in DB is "IELTS & TOFEL Preparation".
            status: s.status
        }));

        return [...regular, ...ielts];
    }, [regularStudents, ieltsStudents]);

    // Set default selected program when programs load
    useMemo(() => {
        if (globalPrograms.length > 0 && !selectedProgramId) {
            setSelectedProgramId(globalPrograms[0].id);
        }
    }, [globalPrograms, selectedProgramId]);

    // Filter students by selected program
    const filteredStudents = useMemo(() => {
        if (!selectedProgramId) return [];

        const selectedProgram = globalPrograms.find(p => p.id === selectedProgramId);
        if (!selectedProgram) return [];

        const programTitle = selectedProgram.title;

        return allStudents.filter(student => {
            // Check if student's program matches the selected program title
            // For IELTS students, we might need specific logic if their program name differs
            // but usually "IELTS & TOFEL Preparation" is the key.

            // Strict matching on program name or fuzzy?
            // Let's assume strict equality on the stored program name string.

            // Note: IELTS students might have "IELTS" or "TOEFL" in 'examType' but their 'chosen_program' 
            // might be consistent if they registered via the main flow, or we might need to infer it.
            // If student.type === 'ielts', they belong to 'IELTS & TOFEL Preparation'.

            if (student.type === 'ielts' && programTitle === 'IELTS & TOFEL Preparation') {
                return true;
            }

            return student.programName === programTitle && student.status === 'approved';
        });
    }, [allStudents, selectedProgramId, globalPrograms]);


    const columns = [
        {
            key: "studentName",
            label: "Full Name",
        },
        {
            key: "email",
            label: "Email",
        },
        {
            key: "phone",
            label: "Phone",
            render: (row) => row.phone || "N/A",
        },
        {
            key: "programName",
            label: "Program",
        },

        {
            key: "status",
            label: "Status",
            render: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status === 'approved' || row.status === 'Verified'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }`}>
                    {row.status || 'Pending'}
                </span>
            )
        }
    ];

    if (isProgramsLoading) {
        return (
            <>
                <AdminHeader />
                <main className="flex-1 overflow-y-auto bg-gray-50 mt-20 p-6">
                    <div className="flex justify-center items-center h-64">Loading Programs...</div>
                </main>
            </>
        );
    }

    return (
        <>
            <AdminHeader />
            <main className="flex-1 overflow-y-auto bg-gray-50 mt-20 transition-colors">
                <div className="w-full px-8 py-6">

                    <div className="mb-6">
                        <h1 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Program Students</h1>

                        {/* Tabs */}
                        <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
                            {globalPrograms.map(program => (
                                <button
                                    key={program.id}
                                    onClick={() => setSelectedProgramId(program.id)}
                                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${selectedProgramId === program.id
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : isDark
                                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                        }`}
                                >
                                    {program.title}
                                </button>
                            ))}
                        </div>
                    </div>

                    <DataTable
                        title={globalPrograms.find(p => p.id === selectedProgramId)?.title || "Students"}
                        columns={columns}
                        data={filteredStudents}
                        showAddButton={false}
                        searchPlaceholder="Search students..."
                    />
                </div>
            </main>
        </>
    );
}
