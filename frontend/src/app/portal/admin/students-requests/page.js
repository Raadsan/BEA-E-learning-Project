"use client";

import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetSessionRequestsQuery } from "@/redux/api/sessionRequestApi";
import { useGetFreezingRequestsQuery } from "@/redux/api/freezingApi";

export default function AdminStudentsRequestsPage() {
    const { isDark } = useDarkMode();
    const { data: sessionRequests = [], isLoading: sessionLoading } = useGetSessionRequestsQuery();
    const { data: freezingRequests = [], isLoading: freezingLoading } = useGetFreezingRequestsQuery();

    const sessionColumns = [
        {
            key: "student_name", label: "Student", width: "250px",
            render: (row) => (
                <div>
                    <div className="font-medium text-gray-900 dark:text-white uppercase font-bold">{row.student_name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{row.student_email}</div>
                </div>
            ),
        },
        { key: "current_class_name", label: "Current Class", width: "150px" },
        {
            key: "requested_session_type", label: "Requested Session", width: "180px",
            render: (row) => (
                <div className="font-medium text-sm text-blue-600 dark:text-blue-400">{row.requested_session_type}</div>
            ),
        },
        {
            key: "status", label: "Status", width: "120px",
            render: (row) => (
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${row.status === 'approved' ? 'bg-green-100 text-green-700' :
                        row.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                    }`}>
                    {row.status}
                </span>
            )
        },
    ];

    const freezingColumns = [
        {
            key: "student_name", label: "Student", width: "250px",
            render: (row) => (
                <div>
                    <div className="font-medium text-gray-900 dark:text-white uppercase font-bold">{row.student_name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{row.student_email}</div>
                </div>
            ),
        },
        { key: "duration", label: "Duration", width: "150px", render: (row) => <span>{row.duration} Days</span> },
        { key: "start_date", label: "Start Date", width: "150px", render: (row) => <span>{new Date(row.start_date).toLocaleDateString()}</span> },
        {
            key: "status", label: "Status", width: "120px",
            render: (row) => (
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${row.status === 'approved' ? 'bg-green-100 text-green-700' :
                        row.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                    }`}>
                    {row.status}
                </span>
            )
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
            <AdminHeader />
            <main className="pt-24 px-4 md:px-8 pb-8">
                <div className="max-w-7xl mx-auto space-y-12">
                    <section>
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-[#010080] dark:text-white">Admin: Session Change Requests</h2>
                            <p className="text-gray-500 text-sm">Overview of all student session change requests.</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                            <DataTable
                                columns={sessionColumns}
                                data={sessionRequests}
                                isLoading={sessionLoading}
                                showAddButton={false}
                            />
                        </div>
                    </section>

                    <section>
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-[#010080] dark:text-white">Admin: Freezing Requests</h2>
                            <p className="text-gray-500 text-sm">Overview of all student freezing requests.</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                            <DataTable
                                columns={freezingColumns}
                                data={freezingRequests}
                                isLoading={freezingLoading}
                                showAddButton={false}
                            />
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
