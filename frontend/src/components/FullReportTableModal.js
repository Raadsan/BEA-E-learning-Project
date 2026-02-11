import React, { useMemo } from 'react';
import { XMarkIcon, PrinterIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import DataTable from './DataTable';

const FullReportTableModal = ({ isOpen, onClose, students, title, isDark }) => {
    if (!isOpen) return null;

    const columns = [
        {
            key: "student_id",
            label: "ID",
            className: "text-xs font-bold"
        },
        {
            key: "full_name",
            label: "Student Name",
            render: (val, row) => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-[10px]">
                        {val?.charAt(0)}
                    </div>
                    <span className="font-semibold">{val}</span>
                </div>
            )
        },
        { key: "sex", label: "Sex", className: "text-center" },
        { key: "age", label: "Age", className: "text-center" },
        {
            key: "email",
            label: "Email",
            render: (val) => <span className="text-[10px] break-all">{val}</span>
        },
        { key: "phone", label: "Phone" },
        { key: "residency_country", label: "Country" },
        { key: "residency_city", label: "City" },
        { key: "chosen_program", label: "Program" },
        {
            key: "subprogram_name",
            label: "Sub-Program",
            render: (val) => val || "N/A"
        },
        {
            key: "class_name",
            label: "Class",
            render: (val) => val || "Unassigned"
        },
        {
            key: "attendance_rate",
            label: "Att%",
            className: "text-center",
            render: (val) => <span className="font-bold">{val}%</span>
        },
        {
            key: "overall_average",
            label: "Score%",
            className: "text-center",
            render: (val) => (
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${val >= 80 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {val}%
                </span>
            )
        },
        {
            key: "status",
            label: "Status",
            render: (val) => (
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${['approved', 'Active'].includes(val) ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {val}
                </span>
            )
        }
    ];

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadCSV = () => {
        const headers = columns.map(col => col.label).join(',');
        const rows = students.map(s => {
            return [
                s.student_id,
                s.full_name,
                s.sex || '-',
                s.age || '-',
                s.email,
                s.phone || '-',
                s.residency_country || '-',
                s.residency_city || '-',
                s.chosen_program,
                s.subprogram_name || 'N/A',
                s.class_name || 'Unassigned',
                `${s.attendance_rate}%`,
                `${s.overall_average}%`,
                s.status
            ].map(val => `"${val}"`).join(',');
        });

        const csvContent = [headers, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `BEA_Full_Report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm no-print">
            <div className={`w-full max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col rounded-2xl shadow-2xl border ${isDark ? 'bg-[#1f2937] border-[#374151]' : 'bg-[#ffffff] border-[#e5e7eb]'}`}>
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#eff6ff] rounded-lg">
                            <ArrowDownTrayIcon className="w-5 h-5 text-[#010080]" />
                        </div>
                        <div>
                            <h2 className={`font-black text-sm uppercase tracking-tight ${isDark ? 'text-[#ffffff]' : 'text-[#111827]'}`}>{title || "Full Student Registry Report"}</h2>
                            <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest leading-none">Complete Academic Record List</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDownloadCSV}
                            className="flex items-center gap-2 bg-[#ffffff] text-[#010080] border border-[#010080] px-3 py-2 rounded-xl hover:bg-[#f9fafb] transition-all shadow-sm text-[10px] font-black uppercase"
                        >
                            <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                            Export CSV
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 bg-[#010080] text-[#ffffff] px-3 py-2 rounded-xl hover:bg-[#1e1b4b] transition-all shadow-lg text-[10px] font-black uppercase"
                        >
                            <PrinterIcon className="w-3.5 h-3.5" />
                            Print Report
                        </button>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-[#374151] text-[#9ca3af]' : 'hover:bg-[#f3f4f6] text-[#6b7280]'}`}
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Table Container */}
                <div className="flex-1 overflow-auto p-6 bg-[#f9fafb]">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <DataTable
                            title={title || "Students Registry"}
                            columns={columns}
                            data={students}
                            showAddButton={false}
                            isDark={false} // Force light theme for the printed-like table
                            compact={true}
                            rowsPerPage={100}
                        />
                    </div>
                </div>

                {/* Footer Stats */}
                <div className={`p-4 border-t flex justify-end gap-6 text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-100'}`}>
                    <span>Total Students: {students.length}</span>
                    <span>Generated on: {new Date().toLocaleString()}</span>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    .no-print { display: none !important; }
                    body { margin: 0; padding: 0; }
                    .modal-content { position: relative !important; width: 100% !important; max-width: none !important; margin: 0 !important; }
                }
            `}</style>
        </div>
    );
};

export default FullReportTableModal;
