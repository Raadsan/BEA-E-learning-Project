import React, { useMemo } from 'react';
import { XMarkIcon, PrinterIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import DataTable from './DataTable';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const FullReportTableModal = ({ isOpen, onClose, students, title, isDark }) => {
    const [isGenerating, setIsGenerating] = React.useState(false);
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
        },
        {
            key: "registration_date",
            label: "Reg. Date",
            render: (val) => val ? new Date(val).toLocaleDateString() : "-"
        }
    ];

    const generatePDF = async (action = 'download') => {
        const element = document.getElementById('full-registry-print-content');
        if (!element) return;

        setIsGenerating(true);
        try {
            // landscape A4 is 297mm x 210mm
            // at 96 DPI, 297mm = 1123px
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 1200
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const imgProps = pdf.getImageProperties(imgData);
            const pdfImageHeight = (imgProps.height * pdfWidth) / imgProps.width;

            let heightLeft = pdfImageHeight;
            let position = 0;
            let page = 1;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfImageHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, -pdfHeight * page, pdfWidth, pdfImageHeight);
                heightLeft -= pdfHeight;
                page++;
            }

            if (action === 'download') {
                pdf.save(`BEA_Full_Registry_${new Date().toISOString().split('T')[0]}.pdf`);
            } else {
                window.open(pdf.output('bloburl'), '_blank');
            }
        } catch (error) {
            console.error('PDF Generation Error:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePrint = () => generatePDF('print');

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
                s.status,
                s.registration_date ? new Date(s.registration_date).toLocaleDateString() : '-'
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
                            {isGenerating ? 'Processing...' : 'Print Report'}
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

            {/* Hidden Print Container for PDF Generation */}
            <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
                <div id="full-registry-print-content" style={{ width: '1200px', padding: '40px', backgroundColor: '#ffffff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #010080', paddingBottom: '20px', marginBottom: '20px' }}>
                        <div>
                            <h1 style={{ margin: 0, color: '#010080', fontSize: '24px', fontWeight: '900', textTransform: 'uppercase' }}>{title || "Full Student Registry Report"}</h1>
                            <p style={{ margin: '4px 0 0', color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '2px' }}>Official Academic Record List</p>
                        </div>
                        <img src="/images/headerlogo.png" style={{ height: '50px' }} alt="BEA" />
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#010080', color: '#ffffff' }}>
                                <th style={{ padding: '10px 8px', textAlign: 'left', border: '1px solid #000000' }}>ID</th>
                                <th style={{ padding: '10px 8px', textAlign: 'left', border: '1px solid #000000' }}>Name</th>
                                <th style={{ padding: '10px 8px', textAlign: 'center', border: '1px solid #000000' }}>S/A</th>
                                <th style={{ padding: '10px 8px', textAlign: 'left', border: '1px solid #000000' }}>Email/Phone</th>
                                <th style={{ padding: '10px 8px', textAlign: 'left', border: '1px solid #000000' }}>Location</th>
                                <th style={{ padding: '10px 8px', textAlign: 'left', border: '1px solid #000000' }}>Program (Class)</th>
                                <th style={{ padding: '10px 8px', textAlign: 'center', border: '1px solid #000000' }}>Att%</th>
                                <th style={{ padding: '10px 8px', textAlign: 'center', border: '1px solid #000000' }}>Score%</th>
                                <th style={{ padding: '10px 8px', textAlign: 'left', border: '1px solid #000000' }}>Status</th>
                                <th style={{ padding: '10px 8px', textAlign: 'left', border: '1px solid #000000' }}>Reg.Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((s, idx) => (
                                <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                                    <td style={{ padding: '10px 8px', border: '1px solid #e5e7eb', fontWeight: 'bold' }}>{s.student_id}</td>
                                    <td style={{ padding: '10px 8px', border: '1px solid #e5e7eb', fontWeight: '600' }}>{s.full_name}</td>
                                    <td style={{ padding: '10px 8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                                        {s.sex}/{s.age}
                                    </td>
                                    <td style={{ padding: '10px 8px', border: '1px solid #e5e7eb', fontSize: '10px' }}>
                                        <div>{s.email}</div>
                                        <div style={{ color: '#6b7280' }}>{s.phone}</div>
                                    </td>
                                    <td style={{ padding: '10px 8px', border: '1px solid #e5e7eb', fontSize: '10px' }}>
                                        {s.residency_country}, {s.residency_city}
                                    </td>
                                    <td style={{ padding: '10px 8px', border: '1px solid #e5e7eb' }}>
                                        <div style={{ fontWeight: 'bold' }}>{s.chosen_program}</div>
                                        <div style={{ fontSize: '10px', color: '#6b7280' }}>{s.subprogram_name || '-'} / {s.class_name || 'Unassigned'}</div>
                                    </td>
                                    <td style={{ padding: '10px 8px', border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: 'bold' }}>{s.attendance_rate}%</td>
                                    <td style={{ padding: '10px 8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                                        <span style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: s.overall_average >= 80 ? '#d1fae5' : '#dbeafe', color: s.overall_average >= 80 ? '#065f46' : '#1e40af', fontWeight: 'bold' }}>
                                            {s.overall_average}%
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px 8px', border: '1px solid #e5e7eb', fontSize: '10px', fontWeight: 'bold' }}>{s.status}</td>
                                    <td style={{ padding: '10px 8px', border: '1px solid #e5e7eb', fontSize: '10px' }}>
                                        {s.registration_date ? new Date(s.registration_date).toLocaleDateString() : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '20px', color: '#9ca3af', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                        <span>Total Students: {students.length}</span>
                        <span>Generated: {new Date().toLocaleString()}</span>
                    </div>
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
