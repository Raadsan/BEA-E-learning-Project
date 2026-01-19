"use client";

import { useRouter } from "next/navigation";

import DataTable from "@/components/DataTable";
import { useGetAllProficiencyResultsQuery } from "@/redux/api/proficiencyTestApi";

export default function ProficiencyTestResultsPage() {
    const router = useRouter();
    const { data: results, isLoading, error } = useGetAllProficiencyResultsQuery();

    const columns = [
        {
            key: "student_name",
            label: "Student Name",
            render: (row) => row.name || row.full_name || "Unknown Student"
        },
        {
            key: "submitted_at",
            label: "Test Date",
            render: (row) => new Date(row.submitted_at || row.created_at).toLocaleDateString(),
        },
        {
            key: "score",
            label: "Score",
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 dark:text-white">
                        {row.score !== null ? `${row.score} / ${row.total_points || row.total_questions || 0}` : "N/A"}
                    </span>
                    {row.percentage !== null && (
                        <span className="text-xs text-gray-500">
                            {Math.round(row.percentage)}%
                        </span>
                    )}
                </div>
            ),
        },
        {
            key: "recommended_level",
            label: "Level",
            render: (row) => {
                const level = row.recommended_level;

                if (!level) return <span className="text-xs text-gray-400 font-medium italic">-</span>;

                const levelColors = {
                    "Advanced": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
                    "Intermediate": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                    "Standard": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                };
                return (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${levelColors[level] || "bg-gray-100 text-gray-800"}`}>
                        {level}
                    </span>
                );
            },
        },
        {
            key: "status",
            label: "Status",
            render: (row) => {
                const status = row.status;
                const isPending = status === 'pending';
                const statusStyles = {
                    pending: 'bg-yellow-100 text-yellow-800',
                    graded: 'bg-green-100 text-green-800',
                    reviewed: 'bg-blue-100 text-blue-800',
                    completed: 'bg-green-100 text-green-800'
                };

                return (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
                        {status === 'pending' ? 'Pending Review' : (status.charAt(0).toUpperCase() + status.slice(1))}
                    </span>
                )
            },
        },
        {
            key: "actions",
            label: "Actions",
            render: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => router.push(`/portal/admin/assessments/proficiency-tests/results/${row.id}`)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="View Details"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </button>
                </div>
            ),
        },
    ];

    return (
        <main className="flex-1 overflow-y-auto bg-gray-50 transition-colors min-h-screen">
            <div className="w-full px-8 py-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Proficiency Test Results</h1>
                    <p className="text-sm text-gray-500 mt-1">Monitor student proficiency levels and grade essay submissions.</p>
                </div>

                <DataTable
                    columns={columns}
                    data={results || []}
                    isLoading={isLoading}
                    showAddButton={false}
                />
            </div>
        </main>
    );
}
