"use client";

import { useRouter } from "next/navigation";

import DataTable from "@/components/DataTable";
import { useGetClassesQuery } from "@/redux/api/classApi";

export default function OnlineSessionsPage() {
    const router = useRouter();
    const { data: classes = [], isLoading, isError, error } = useGetClassesQuery();

    const handleViewSessions = (classItem) => {
        router.push(`/portal/admin/learning-resources/sessions/${classItem.id}`);
    };

    const columns = [
        {
            key: "class_name",
            label: "Class Name",
        },
        {
            key: "teacher_name",
            label: "Teacher",
            render: (_, row) => row.teacher_name || "Unassigned",
        },
        {
            key: "program_name",
            label: "Program",
            render: (_, row) => row.program_name || "N/A",
        },
        {
            key: "subprogram_name",
            label: "Subprogram",
            render: (_, row) => row.subprogram_name || "N/A",
        },
        {
            key: "shift_info",
            label: "Shift & Schedule",
            render: (_, row) => (
                row.shift_name ? (
                    <div className="flex flex-col text-xs">
                        <span className="font-bold text-blue-600">{row.shift_name}</span>
                        <span className="text-gray-500">{row.shift_start?.substring(0, 5)} - {row.shift_end?.substring(0, 5)}</span>
                    </div>
                ) : <span className="text-gray-400">No shift</span>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (_, row) => (
                <button
                    onClick={() => handleViewSessions(row)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-900 transition-colors px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded-md text-sm font-medium"
                    title="View Sessions"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Sessions
                </button>
            ),
        },
    ];

    if (isLoading) {
        return (
            <>
                <main className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="w-full px-8 py-6">
                        <div className="text-center py-12">
                            <p className="text-gray-600">Loading classes...</p>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    if (isError) {
        return (
            <>
                <main className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="w-full px-8 py-6">
                        <div className="text-center py-12">
                            <p className="text-red-600">Error loading classes: {error?.data?.error || "Unknown error"}</p>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <main className="flex-1 overflow-y-auto bg-gray-50 transition-colors">
                <div className="w-full px-8 py-6">
                    <DataTable
                        title="Online Session Links - Select Class"
                        columns={columns}
                        data={classes}
                        showAddButton={false}
                    />
                </div>
            </main>
        </>
    );
}

