"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import DataTable from "@/components/DataTable";
import LoadingSpinner from "@/components/LoadingSpinner";
import Modal from "@/components/Modal";
import { useGetAllPaymentsQuery } from "@/lib/api/paymentApi";
import { useGetProgramsQuery } from "@/lib/api/programApi";
import { useDarkMode } from "@/context/ThemeContext";
import { usePagePermissions } from "@/hooks/usePagePermissions";
import { downloadPaymentReceipt, printPaymentReceipt } from "@/utils/paymentReceipt";

function formatMethod(method?: string) {
    const m = (method || "").toLowerCase();
    if (m.includes("waafi") || m.includes("mwallet")) return "WAAFI";
    if (m === "evc") return "EVC";
    if (m === "bank") return "BANK";
    return (method || "N/A").toUpperCase();
}

export default function PaymentHistoryPage() {
    const { isDark } = useDarkMode();
    const { canView } = usePagePermissions("payments", "payment_history");

    const [searchTerm, setSearchTerm] = useState("");
    const [methodFilter, setMethodFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<any>(null);

    const queryParams = useMemo(() => ({
        search: searchTerm || undefined,
        method: methodFilter || undefined,
        status: statusFilter || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
    }), [searchTerm, methodFilter, statusFilter, fromDate, toDate]);

    const { data: payments = [], isLoading, isError } = useGetAllPaymentsQuery(queryParams);
    const { data: programs = [] } = useGetProgramsQuery();

    const programIdToTitleMap = useMemo(() => programs.reduce((acc: Record<string, string>, program: any) => {
        if (program.id) acc[String(program.id)] = program.title;
        return acc;
    }, {}), [programs]);

    const tableRows = useMemo(() => payments.map((row: any) => {
        const programLabel = row.program_name && !Number.isNaN(Number(row.program_name))
            ? programIdToTitleMap[String(row.program_name)] || row.program_name
            : row.program_name || row.package_name || "Subscription";

        return {
            ...row,
            student_name: row.student_name || `Student #${row.student_id || "?"}`,
            program_name: programLabel,
            payment_method: row.method,
            payment_date: row.created_at,
            transaction_id: row.provider_transaction_id,
            search_blob: [
                row.student_name,
                row.student_id,
                row.method,
                row.status,
                programLabel,
                row.package_name,
                row.provider_transaction_id,
                row.payer_phone,
                row.created_at ? new Date(row.created_at).toLocaleDateString() : "",
            ].filter(Boolean).join(" ").toLowerCase(),
        };
    }), [payments, programIdToTitleMap]);

    const studentPayments = useMemo(() => {
        if (!selectedStudent?.student_id) return [];
        return tableRows.filter((p: any) => p.student_id === selectedStudent.student_id);
    }, [selectedStudent, tableRows]);

    const stats = useMemo(() => ({
        total: tableRows.length,
        completed: tableRows.filter((p: any) => p.status === "completed" || p.status === "paid").length,
        pending: tableRows.filter((p: any) => p.status === "pending").length,
        totalRevenue: tableRows
            .filter((p: any) => p.status === "completed" || p.status === "paid")
            .reduce((sum: number, p: any) => sum + parseFloat(p.amount || 0), 0)
            .toFixed(2),
    }), [tableRows]);

    const receiptRow = (row: any) => ({
        ...row,
        payment_method: row.method,
        transaction_id: row.provider_transaction_id,
        payment_date: row.created_at,
    });

    const columns = [
        {
            key: "student_name",
            label: "Student Name",
            render: (_: any, row: any) => (
                <button
                    type="button"
                    onClick={() => setSelectedStudent(row)}
                    className="text-left font-semibold text-[#010080] hover:underline dark:text-blue-400"
                    title="View all payments for this student"
                >
                    {row.student_name}
                </button>
            ),
        },
        {
            key: "program_name",
            label: "Program / Package",
            render: (_: any, row: any) => (
                <div>
                    <div>{row.program_name}</div>
                    {row.package_name && row.package_name !== row.program_name && (
                        <div className="text-[10px] text-gray-500">{row.package_name}</div>
                    )}
                </div>
            ),
        },
        {
            key: "amount",
            label: "Amount",
            render: (_: any, row: any) => (
                <span className="font-semibold text-green-600 dark:text-green-400">
                    ${Number(row.amount || 0).toFixed(2)}
                </span>
            ),
        },
        {
            key: "payment_method",
            label: "Method",
            render: (_: any, row: any) => (
                <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                    {formatMethod(row.method)}
                </span>
            ),
        },
        {
            key: "status",
            label: "Status",
            render: (_: any, row: any) => {
                const status = row.status || "pending";
                const isPaid = status === "completed" || status === "paid";
                return (
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${isPaid
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                        {isPaid ? "Paid" : status}
                    </span>
                );
            },
        },
        {
            key: "transaction_id",
            label: "Transaction ID",
            render: (_: any, row: any) => (
                <span className="text-xs font-mono text-gray-500">{row.provider_transaction_id || "—"}</span>
            ),
        },
        {
            key: "payment_date",
            label: "Date",
            render: (_: any, row: any) => row.created_at
                ? new Date(row.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                : "N/A",
        },
        {
            key: "actions",
            label: "Receipt",
            render: (_: any, row: any) => canView ? (
                <div className="flex gap-1">
                    <button
                        type="button"
                        onClick={() => printPaymentReceipt(receiptRow(row))}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                        title="Print receipt"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={() => downloadPaymentReceipt(receiptRow(row))}
                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                        title="Download receipt"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </button>
                </div>
            ) : null,
        },
    ];

    if (isLoading) {
        return (
            <main className={`flex-1 overflow-y-auto ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
                <div className="h-full flex items-center justify-center"><LoadingSpinner /></div>
            </main>
        );
    }

    if (isError) {
        return (
            <main className="flex-1 overflow-y-auto bg-gray-50">
                <div className="w-full px-6 py-6 text-center text-red-600">Error loading payments. Please try again.</div>
            </main>
        );
    }

    return (
        <>
            <main className={`flex-1 overflow-y-auto ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
                <div className="w-full px-6 py-6">
                    <div className="mb-6">
                        <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Payment History</h1>
                        <p className={`mt-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            Search transactions, download receipts, and view all payments per student
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {[
                            { label: "Total Payments", value: stats.total },
                            { label: "Completed", value: stats.completed },
                            { label: "Pending", value: stats.pending },
                            { label: "Total Revenue", value: `$${stats.totalRevenue}` },
                        ].map((card) => (
                            <div key={card.label} className={`p-4 rounded-lg border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>{card.label}</p>
                                <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{card.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className={`p-4 rounded-xl border mb-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                        <div className="xl:col-span-2">
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Search</label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Name, ID, method, date, transaction..."
                                className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? "bg-gray-900 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Method</label>
                            <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)} className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? "bg-gray-900 border-gray-600 text-white" : "bg-white border-gray-300"}`}>
                                <option value="">All methods</option>
                                <option value="waafi">WAAFI</option>
                                <option value="evc">EVC</option>
                                <option value="bank">Bank</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Status</label>
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? "bg-gray-900 border-gray-600 text-white" : "bg-white border-gray-300"}`}>
                                <option value="">All statuses</option>
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">From</label>
                                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? "bg-gray-900 border-gray-600 text-white" : "bg-white border-gray-300"}`} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">To</label>
                                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? "bg-gray-900 border-gray-600 text-white" : "bg-white border-gray-300"}`} />
                            </div>
                        </div>
                    </div>

                    <div className={`rounded-lg border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                        <DataTable columns={columns} data={tableRows} showAddButton={false} rowsPerPage={15} />
                    </div>
                </div>
            </main>

            <Modal
                isOpen={!!selectedStudent}
                onClose={() => setSelectedStudent(null)}
                title={selectedStudent ? `Payments — ${selectedStudent.student_name}` : "Student Payments"}
                size="lg"
            >
                {selectedStudent && (
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-sm text-gray-500">Student ID: <strong>{selectedStudent.student_id}</strong></p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Total paid:{" "}
                                    <strong>
                                        ${studentPayments
                                            .filter((p: any) => p.status === "paid" || p.status === "completed")
                                            .reduce((s: number, p: any) => s + Number(p.amount || 0), 0)
                                            .toFixed(2)}
                                    </strong>
                                </p>
                            </div>
                            {selectedStudent.student_id && (
                                <Link
                                    href={`/portal/admin/students/${selectedStudent.student_id}`}
                                    className="text-sm font-semibold text-[#010080] hover:underline"
                                >
                                    Open student profile →
                                </Link>
                            )}
                        </div>

                        <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-3 py-2 text-left">Date</th>
                                        <th className="px-3 py-2 text-left">Amount</th>
                                        <th className="px-3 py-2 text-left">Method</th>
                                        <th className="px-3 py-2 text-left">Status</th>
                                        <th className="px-3 py-2 text-left">Receipt</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentPayments.length === 0 ? (
                                        <tr><td colSpan={5} className="px-3 py-6 text-center text-gray-500">No payments found</td></tr>
                                    ) : studentPayments.map((p: any) => (
                                        <tr key={p.id} className="border-t dark:border-gray-700">
                                            <td className="px-3 py-2">{p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}</td>
                                            <td className="px-3 py-2 font-semibold">${Number(p.amount || 0).toFixed(2)}</td>
                                            <td className="px-3 py-2">{formatMethod(p.method)}</td>
                                            <td className="px-3 py-2">{p.status}</td>
                                            <td className="px-3 py-2">
                                                <button type="button" onClick={() => downloadPaymentReceipt(receiptRow(p))} className="text-[#010080] text-xs font-bold hover:underline">
                                                    Download
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
}
