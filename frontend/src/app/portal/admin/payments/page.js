"use client";

import { useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";
import { useGetAllPaymentsQuery } from "@/redux/api/paymentApi";
import { useGetStudentsQuery } from "@/redux/api/studentApi";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useDarkMode } from "@/context/ThemeContext";

export default function PaymentsPage() {
    const { isDark } = useDarkMode();
    const { data: payments = [], isLoading, isError } = useGetAllPaymentsQuery();
    const { data: students = [] } = useGetStudentsQuery();
    const { data: programs = [] } = useGetProgramsQuery();

    // Create a map of student IDs to student objects for quick lookup
    const studentMap = students.reduce((acc, student) => {
        acc[student.id] = student;
        return acc;
    }, {});

    // Create a map of program names to program objects
    const programMap = programs.reduce((acc, program) => {
        acc[program.title] = program;
        return acc;
    }, {});

    // Calculate payment statistics
    const stats = {
        total: payments.length,
        completed: payments.filter(p => p.status === 'completed' || p.status === 'paid').length,
        pending: payments.filter(p => p.status === 'pending').length,
        totalRevenue: payments
            .filter(p => p.status === 'completed' || p.status === 'paid')
            .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
            .toFixed(2),
    };

    const columns = [
        {
            key: "student_name",
            label: "Student Name",
            render: (row) => {
                const student = studentMap[row.student_id];
                return student?.full_name || `Student #${row.student_id}`;
            },
        },
        {
            key: "program",
            label: "Program",
            render: (row) => {
                const student = studentMap[row.student_id];
                const programName = student?.chosen_program || row.program_name || 'N/A';
                return <span className="text-sm">{programName}</span>;
            },
        },
        {
            key: "fee",
            label: "Fee",
            render: (row) => {
                const student = studentMap[row.student_id];
                const programName = student?.chosen_program;
                const program = programMap[programName];
                const fee = program?.price || row.amount || '0.00';
                return <span className="font-semibold text-gray-700 dark:text-gray-300">${fee}</span>;
            },
        },
        {
            key: "paid",
            label: "Paid",
            render: (row) => (
                <span className="font-semibold text-green-600 dark:text-green-400">${row.amount || '0.00'}</span>
            ),
        },
        {
            key: "payment_method",
            label: "Method",
            render: (row) => (
                <span className="uppercase text-xs font-medium px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    {row.payment_method || 'N/A'}
                </span>
            ),
        },
        {
            key: "status",
            label: "Status",
            render: (row) => {
                const status = row.status || 'pending';
                const isPaid = status === 'completed' || status === 'paid';
                return (
                    <span className={`px-3 py-1 text-xs font-medium rounded-full inline-flex items-center gap-1 ${isPaid
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800'
                            : status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800'
                        }`}>
                        {isPaid && (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                        {isPaid ? 'Paid' : status}
                    </span>
                );
            },
        },
        {
            key: "payment_date",
            label: "Date",
            render: (row) => row.payment_date ? new Date(row.payment_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }) : 'N/A',
        },
        {
            key: "actions",
            label: "Action",
            render: (row) => (
                <button
                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors p-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                    title="Download Receipt"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                </button>
            ),
        },
    ];

    if (isLoading) {
        return (
            <>
                <AdminHeader />
                <main className="flex-1 overflow-y-auto bg-gray-50 mt-20">
                    <div className="w-full px-6 py-6">
                        <div className="text-center py-12">
                            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading payments...</p>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    if (isError) {
        return (
            <>
                <AdminHeader />
                <main className="flex-1 overflow-y-auto bg-gray-50 mt-20">
                    <div className="w-full px-6 py-6">
                        <div className="text-center py-12">
                            <p className="text-red-600 dark:text-red-400">Error loading payments. Please try again.</p>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <AdminHeader />
            <main className={`flex-1 overflow-y-auto mt-20 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="w-full px-6 py-6">
                    {/* Page Header */}
                    <div className="mb-6">
                        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Payment Management
                        </h1>
                        <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            View and manage all student payments
                        </p>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Payments</p>
                                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
                                </div>
                            </div>
                        </div>

                        <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Completed</p>
                                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.completed}</p>
                                </div>
                            </div>
                        </div>

                        <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                                    <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Pending</p>
                                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.pending}</p>
                                </div>
                            </div>
                        </div>

                        <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                                    <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Revenue</p>
                                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>${stats.totalRevenue}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payments Table */}
                    <div className={`rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <DataTable
                            columns={columns}
                            data={payments}
                            searchPlaceholder="Search payments..."
                        />
                    </div>
                </div>
            </main>
        </>
    );
}
