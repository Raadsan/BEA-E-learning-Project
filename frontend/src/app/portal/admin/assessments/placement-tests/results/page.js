"use client";

import { useRouter } from "next/navigation";

import DataTable from "@/components/DataTable";
import { useGetAllPlacementResultsQuery } from "@/redux/api/placementTestApi";

export default function PlacementResultsPage() {
    const router = useRouter();
    const { data: results, isLoading, error } = useGetAllPlacementResultsQuery();

    const columns = [
        {
            key: "student_name",
            label: "Student Name",
        },
        {
            key: "submitted_at",
            label: "Test Date",
            render: (val) => new Date(val).toLocaleDateString(),
        },
        {
            key: "percentage",
            label: "Score",
            render: (val, row) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 dark:text-white">
                        {Math.round(val)}%
                    </span>
                    {row.status === 'pending_review' && (
                        <span className="text-[10px] text-yellow-600 font-bold uppercase tracking-tight">Partial</span>
                    )}
                </div>
            ),
        },
        {
            key: "recommended_level",
            label: "Level",
            render: (val) => {
                const level = val;

                if (!level) return <span className="text-xs text-gray-400 font-medium italic">Evaluating...</span>;

                const levelColors = {
                    "Advanced": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
                    "Intermediate": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                    "Beginner": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                };
                return (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${levelColors[level] || "bg-gray-100 text-gray-800"}`}>
                        {level}
                    </span>
                );
            },
        },
        {
            key: "recommended_course",
            label: "Recommended Course",
            render: (_, row) => {
                const level = row.recommended_level;
                if (!level) return <span className="text-gray-400">-</span>;
                return `${level} English`;
            }
        },
        {
            key: "status",
            label: "Status",
            render: (val) => {
                const isPending = val === 'pending_review';
                return (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isPending ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {isPending ? 'Pending Review' : (val || 'Completed')}
                    </span>
                )
            },
        },
        {
            key: "actions",
            label: "Actions",
            render: (_, row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => router.push(`/portal/admin/assessments/placement-tests/results/${row.id}`)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="View Details"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </button>
                    <button
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
                        title="Download Report"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </button>
                </div>
            ),
        },
    ];

    return (
        <>
            <main className="flex-1 overflow-y-auto bg-gray-50 transition-colors min-h-screen">
                <div className="w-full px-8 py-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Placement Test Results</h1>
                        <p className="text-sm text-gray-500 mt-1">Monitor student performance and level assignments.</p>
                    </div>

                    <DataTable
                        columns={columns}
                        data={results || []}
                        isLoading={isLoading}
                        showAddButton={false}
                    />
                </div>
            </main>
        </>
    );
}
