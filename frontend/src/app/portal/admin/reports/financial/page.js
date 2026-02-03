"use client";

import { useState, useMemo } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import {
    useGetPaymentStatsQuery,
    useGetPaymentDistributionQuery,
    useGetDetailedPaymentListQuery,
    useLazyGetDetailedPaymentListQuery
} from "@/redux/api/reportApi";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import DataTable from "@/components/DataTable";

// Brand Colors
const brandColors = ["#010080", "#4b47a4", "#18178a", "#f40606", "#f95150"];

// Modal component for full report preview
const ReportModal = ({ isOpen, onClose, data, onPrint, onExport, isDark, title }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className={`w-full max-w-7xl max-h-[90vh] flex flex-col rounded-2xl shadow-xl overflow-hidden border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                {/* Modal Header */}
                <div className={`p-6 border-b flex items-center justify-between ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                    <div>
                        <h2 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {title || "Payment Information Report"}
                        </h2>
                        <p className={`text-[10px] font-medium mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Comprehensive financial summary of all course payments and registrations
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onPrint}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border transition-all ${isDark ? 'bg-gray-700 hover:bg-gray-600 border-gray-600 text-white' : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-700'
                                }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            Print
                        </button>
                        <button
                            onClick={onExport}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all bg-[#010080] hover:bg-[#010080]/90 text-white shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Export CSV
                        </button>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                {/* Modal Body with Horizontal Scroll */}
                <div className="flex-1 overflow-auto bg-white dark:bg-[#1a2035] p-0 custom-scrollbar" id="printable-report">
                    <div className="w-full">
                        <table className="w-full text-left text-xs border-collapse table-fixed" style={{ minWidth: "1200px" }}>
                            <thead className="sticky top-0 z-10">
                                <tr className={`${isDark ? 'bg-white text-gray-900' : 'bg-[#010080] text-white'}`}>
                                    <th className="w-32 px-4 py-4 uppercase font-bold tracking-wider border-b border-gray-100 dark:border-gray-700">Student ID</th>
                                    <th className="w-60 px-4 py-4 uppercase font-bold tracking-wider border-b border-gray-100 dark:border-gray-700">Student Name</th>
                                    <th className="w-48 px-4 py-4 uppercase font-bold tracking-wider border-b border-gray-100 dark:border-gray-700">Program</th>
                                    <th className="w-32 px-4 py-4 uppercase font-bold tracking-wider border-b border-gray-100 dark:border-gray-700 text-center">Amount</th>
                                    <th className="w-40 px-4 py-4 uppercase font-bold tracking-wider border-b border-gray-100 dark:border-gray-700">Method</th>
                                    <th className="w-48 px-4 py-4 uppercase font-bold tracking-wider border-b border-gray-100 dark:border-gray-700">Transaction ID</th>
                                    <th className="w-32 px-4 py-4 uppercase font-bold tracking-wider border-b border-gray-100 dark:border-gray-700">Status</th>
                                    <th className="w-40 px-4 py-4 uppercase font-bold tracking-wider border-b border-gray-100 dark:border-gray-700">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {data.map((payment, idx) => (
                                    <tr
                                        key={payment.id || idx}
                                        className={`${idx % 2 === 0 ? 'bg-white dark:bg-[#1a2035]' : 'bg-gray-50/50 dark:bg-[#252b40]'} hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors`}
                                    >
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 truncate">{payment.student_id}</td>
                                        <td className="px-4 py-3 font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 truncate">{payment.student_name}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 truncate">{payment.program}</td>
                                        <td className="px-4 py-3 text-center text-gray-900 dark:text-white font-bold border-b border-gray-100 dark:border-gray-800">${payment.amount}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 capitalize">{payment.payment_method}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 truncate">{payment.transaction_id || '-'}</td>
                                        <td className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 whitespace-nowrap">
                                            {new Date(payment.payment_date).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className={`p-4 border-t flex items-center justify-between text-[10px] font-medium ${isDark ? 'bg-gray-900/50 border-gray-700 text-gray-500' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                    <div className="flex items-center gap-8">
                        <span>Total Transactions: {data.length}</span>
                        <span>Total Amount: ${data.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0).toFixed(2)}</span>
                        <span>Generated: {new Date().toLocaleString()}</span>
                    </div>
                    <span>BEA E-Learning System • Financial Registry</span>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page { size: landscape; margin: 0.5cm; }
                    body * { visibility: hidden !important; }
                    #printable-report, #printable-report * { visibility: visible !important; }
                    #printable-report {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        background: white !important;
                        color: black !important;
                        padding: 0 !important;
                        font-size: 6pt !important;
                    }
                    table { table-layout: fixed !important; width: 100% !important; border-collapse: collapse !important; }
                    th, td { border: 0.1pt solid #ccc !important; padding: 2pt !important; -webkit-print-color-adjust: exact; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                    th { background-color: #010080 !important; color: white !important; font-weight: bold !important; }
                }
            `}</style>
        </div>
    );
};

export default function PaymentReportsPage() {
    const { isDark } = useDarkMode();

    // Filters & States
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedMethod, setSelectedMethod] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportPayments, setReportPayments] = useState([]);

    const [triggerFetchAll, { isLoading: isFetchingFullReport }] = useLazyGetDetailedPaymentListQuery();

    // Data Queries
    const { data: stats, isLoading: statsLoading } = useGetPaymentStatsQuery();
    const { data: distribution, isLoading: distLoading } = useGetPaymentDistributionQuery();
    const { data: detailedData, isLoading: listLoading } = useGetDetailedPaymentListQuery({
        status: selectedStatus,
        method: selectedMethod,
        search: searchTerm,
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage
    });

    const paymentsList = detailedData?.payments || [];
    const revenueTrend = stats?.trend || [];
    const byMethod = distribution?.byMethod || [];
    const byProgram = distribution?.byProgram || [];

    // Dashboard Boxes
    const summaryBoxes = [
        {
            label: "Total Revenue",
            val: `$${stats?.totalRevenue?.toLocaleString() || 0}`,
            sub: "Successful payments",
            icon: (
                <svg className="w-6 h-6 text-[#010080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            label: "Pending Amount",
            val: `$${stats?.pendingRevenue?.toLocaleString() || 0}`,
            sub: "Awaiting confirmation",
            icon: (
                <svg className="w-6 h-6 text-[#f95150]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            label: "Total Transactions",
            val: stats?.totalTransactions || 0,
            sub: "All statuses combined",
            icon: (
                <svg className="w-6 h-6 text-[#4b47a4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            )
        },
        {
            label: "Success Rate",
            val: `${stats?.totalTransactions > 0 ? Math.round((stats?.successfulTransactions / stats?.totalTransactions) * 100) : 0}%`,
            sub: "Conversion completion",
            icon: (
                <svg className="w-6 h-6 text-[#f40606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        }
    ];

    // Chart Themes
    const chartGridColor = isDark ? '#374151' : '#f1f1f1';
    const chartLabelColor = isDark ? '#9CA3AF' : '#6B7280';

    // Handlers
    const handleOpenFullReport = async () => {
        try {
            const { data: fullData } = await triggerFetchAll({
                limit: 5000,
                status: selectedStatus,
                method: selectedMethod,
                search: searchTerm
            });

            if (fullData?.payments?.length > 0) {
                setReportPayments(fullData.payments);
                setIsReportModalOpen(true);
            }
        } catch (err) {
            console.error("Failed to fetch full report:", err);
        }
    };

    const handleExportCSV = (dataToExport) => {
        const headers = ['Student ID', 'Student Name', 'Program', 'Amount', 'Method', 'Transaction ID', 'Status', 'Date'];
        const rows = dataToExport.map(p => [
            p.student_id, p.student_name, p.program, p.amount, p.payment_method, p.transaction_id || '-', p.status, p.payment_date
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BEA_Payment_Report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const columns = [
        {
            key: "student_name",
            label: "Student",
            render: (val, row) => (
                <div>
                    <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{val}</p>
                    <p className="text-[10px] text-gray-500">{row.student_id}</p>
                </div>
            )
        },
        { key: "program", label: "Program" },
        {
            key: "amount",
            label: "Amount",
            className: "text-center",
            render: (val) => <span className="font-bold text-blue-600 dark:text-blue-400">${val}</span>
        },
        { key: "payment_method", label: "Method", className: "capitalize" },
        { key: "transaction_id", label: "Transaction ID", render: (val) => val || "-" },
        {
            key: "status",
            label: "Status",
            render: (val) => (
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${val === 'completed' ? 'bg-green-100 text-green-700' : val === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {val}
                </span>
            )
        },
        {
            key: "payment_date",
            label: "Date",
            render: (val) => new Date(val).toLocaleDateString()
        }
    ];

    return (
        <div className={`flex-1 min-w-0 flex flex-col px-4 sm:px-8 py-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-[1800px] mx-auto w-full space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <h1 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Payment Reports
                        </h1>
                        <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Financial analytics and detailed transaction auditing
                        </p>
                    </div>
                    <button
                        onClick={handleOpenFullReport}
                        disabled={isFetchingFullReport}
                        className={`${isDark ? 'bg-white hover:bg-gray-100 text-gray-900' : 'bg-[#010080] hover:bg-[#010080]/90 text-white'} px-6 py-3 rounded-lg flex items-center gap-2 transition-all font-bold shadow-md disabled:opacity-70`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        {isFetchingFullReport ? 'Generating...' : 'Generate Full Financial Report'}
                    </button>
                </div>

                {/* Filters */}
                <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black uppercase text-gray-500 mb-2">Search Transactions</label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Name, ID, or Transaction Code..."
                                className={`w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white'}`}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-500 mb-2">Payment Status</label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className={`w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white'}`}
                            >
                                <option value="">All Statuses</option>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-500 mb-2">Payment Method</label>
                            <select
                                value={selectedMethod}
                                onChange={(e) => setSelectedMethod(e.target.value)}
                                className={`w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white'}`}
                            >
                                <option value="">All Methods</option>
                                <option value="waafi">Waafi</option>
                                <option value="bank">Bank Transfer</option>
                                <option value="edahab">eDahab</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Summary Boxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {summaryBoxes.map((box, i) => (
                        <div key={i} className={`p-8 rounded-2xl border transition-all hover:shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{box.label}</p>
                                <div className={`p-2 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    {box.icon}
                                </div>
                            </div>
                            <h3 className={`text-4xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {statsLoading ? "..." : box.val}
                            </h3>
                            <p className="text-[10px] font-medium text-gray-400 mt-3">{box.sub}</p>
                        </div>
                    ))}
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Trend */}
                    <div className={`p-8 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                        <h3 className="text-sm font-bold mb-8 uppercase tracking-widest text-[#010080]">Revenue Growth Trend</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueTrend}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#010080" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#010080" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                                    <XAxis dataKey="month" tick={{ fill: chartLabelColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: chartLabelColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                    <Area type="monotone" dataKey="revenue" stroke="#010080" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Revenue by Program */}
                    <div className={`p-8 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                        <h3 className="text-sm font-bold mb-8 uppercase tracking-widest text-[#18178a]">Revenue by Program</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={byProgram}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                                    <XAxis dataKey="name" tick={{ fill: chartLabelColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: chartLabelColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="value" fill="#010080" radius={[4, 4, 0, 0]}>
                                        {byProgram.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={brandColors[index % brandColors.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Revenue by Payment Method */}
                    <div className={`p-8 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                        <h3 className="text-sm font-bold mb-8 uppercase tracking-widest text-[#4b47a4]">Payment Method share</h3>
                        <div className="h-[300px] flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={byMethod} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value">
                                        {byMethod.map((e, idx) => (
                                            <Cell key={idx} fill={brandColors[idx % brandColors.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Detailed Table */}
                <DataTable
                    title="Transaction Log & Audit"
                    columns={columns}
                    data={paymentsList}
                    showAddButton={false}
                    isDark={isDark}
                />

                <ReportModal
                    isOpen={isReportModalOpen}
                    onClose={() => setIsReportModalOpen(false)}
                    data={reportPayments}
                    onPrint={() => window.print()}
                    onExport={() => handleExportCSV(reportPayments)}
                    isDark={isDark}
                />
            </div>
        </div>
    );
}
