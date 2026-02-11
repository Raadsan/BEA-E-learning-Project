import React from 'react';
import { PrinterIcon, XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const SectionHeader = ({ title }) => (
    <div className="bg-[#010080] text-[#ffffff] px-4 py-2 mt-6 mb-4 print:mt-4 print:mb-2">
        <h3 className="text-[12px] font-black uppercase tracking-[0.1em]">{title}</h3>
    </div>
);

const TableLabel = ({ children, className = "" }) => (
    <td className={`bg-[#e0f2fe] border border-[#d1d5db] px-3 py-1.5 text-[10px] font-bold text-[#010080] uppercase tracking-wider w-1/4 ${className}`}>
        {children}
    </td>
);

const TableValue = ({ children, colSpan = 1, className = "" }) => (
    <td colSpan={colSpan} className={`border border-[#d1d5db] px-3 py-1.5 text-[11px] font-medium text-[#111827] ${className}`}>
        {children}
    </td>
);

const OfficialReportModal = ({ isOpen, onClose, data, student, summary, performance, isDark }) => {
    const [isGenerating, setIsGenerating] = React.useState(false);

    if (!isOpen) return null;

    const feedback = data?.feedback || {};

    const skillCategories = [
        "Listening", "Speaking", "Reading", "Writing",
        "Grammar", "Vocabulary", "Pronunciation"
    ];

    const skillData = skillCategories.map(cat => ({
        category: cat,
        average: performance?.find(p => p.category.toLowerCase() === cat.toLowerCase())?.average || 0
    }));

    const generatePDF = async (action = 'download') => {
        const element = document.getElementById('tabular-report-content');
        if (!element) return;

        setIsGenerating(true);

        // precise A4 dimensions in px (at 96 DPI)
        // A4 is 210mm x 297mm.
        // at 2x scale (used by html2canvas below), we need to work with scaled dimensions or logical dimensions.
        // Let's allow html2canvas to capture the full scrolling height.
        // We will then digitally "cut" the image into A4 pages.

        try {
            // 1. Clone the element to manipulate it for printing (inserting spacers) without affecting the view
            const clone = element.cloneNode(true);
            clone.style.width = '800px'; // Ensure fixed width for consistency
            clone.style.height = 'auto';
            clone.style.position = 'absolute';
            clone.style.top = '-9999px';
            clone.style.left = '-9999px';
            document.body.appendChild(clone);

            // 2. Smart Pagination: Insert breaks
            // Ratio of A4 (297/210) ~ 1.414
            // Content width is fixed at 800px.
            // Full Page Height in layout pixels = 800 * (297/210) ≈ 1131px
            const PAGE_FULL_HEIGHT = 1131; // Exact height where PDF page cut will happen
            const PAGE_SAFE_HEIGHT = 1050; // Threshold to trigger a break (leaving ~80px margin)

            // Start offset at 48px (3rem) because the wrapper has p-12 padding.
            // This aligns the content tracking with the visual top of the container.
            let currentOffset = 48;

            // Get all direct children (sections) of the wrapper
            // Since we cloned the wrapper itself (which has the ID), the clone IS the wrapper
            const wrapper = clone;
            const children = Array.from(wrapper.children);

            // Find the header element to clone later
            const headerElement = wrapper.querySelector('.report-header');

            children.forEach((child) => {
                const style = window.getComputedStyle(child);
                const marginTop = parseFloat(style.marginTop);
                const marginBottom = parseFloat(style.marginBottom);
                const totalHeight = child.offsetHeight + marginTop + marginBottom;

                // If adding this child exceeds the safe area...
                if (currentOffset + totalHeight > PAGE_SAFE_HEIGHT) {
                    // Calculate spacer to fill exactly to the end of the page
                    const spacerHeight = PAGE_FULL_HEIGHT - currentOffset;

                    if (spacerHeight > 0) {
                        const spacer = document.createElement('div');
                        spacer.style.height = `${spacerHeight}px`;
                        spacer.className = 'print-spacer';
                        wrapper.insertBefore(spacer, child);
                    }

                    // On the new page, we want to repeat the header
                    // But we also need to account for the padding that Page 1 has!
                    // Page 1 has 48px padding.
                    // If we start Page 2 at 0px, the header will be at the very top.
                    // To match Page 1, we should add a spacer or margin equal to the padding BEFORE the header.

                    if (headerElement) {
                        // User requested "move to the top", so we remove the extra padding spacer.
                        // We just insert the header directly at the top of the new page.

                        const headerClone = headerElement.cloneNode(true);
                        // No extra margin needed, it keeps the classes from the original header (mb-8 etc)
                        wrapper.insertBefore(headerClone, child);

                        // New page starts with header height + this child
                        // headerClone.offsetHeight includes border + padding, but NOT margin
                        // We need to account for the margin (mb-8 = 2rem = 32px)
                        currentOffset = headerClone.offsetHeight + 32 + totalHeight;
                    } else {
                        // Reset current height for new page, starting with margins/padding but we removed padding spacer
                        // So effectively 0 or just margin
                        currentOffset = totalHeight;
                    }

                } else {
                    currentOffset += totalHeight;
                }
            });

            // 3. Generate Canvas from Clone
            const canvas = await html2canvas(clone, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 800
            });

            // Clean up clone
            document.body.removeChild(clone);

            // 4. Generate PDF
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
            const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

            const imgProps = pdf.getImageProperties(imgData);
            const pdfImageHeight = (imgProps.height * pdfWidth) / imgProps.width;

            let heightLeft = pdfImageHeight;
            let position = 0;
            let page = 1;

            // Add first page
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfImageHeight);
            heightLeft -= pdfHeight;

            // Add additional pages if needed
            while (heightLeft > 0) {
                position = heightLeft - pdfImageHeight; // This positions the top of the image off-canvas upwards
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, -297 * page, pdfWidth, pdfImageHeight);
                heightLeft -= pdfHeight;
                page++;
            }

            if (action === 'download') {
                pdf.save(`BEA_Progress_Report_${student?.full_name?.replace(/\s+/g, '_') || 'Student'}.pdf`);
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
    const handleDownload = () => generatePDF('download');

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm no-print">
            <div className={`w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col rounded-2xl shadow-2xl border ${isDark ? 'bg-[#1f2937] border-[#374151]' : 'bg-[#ffffff] border-[#e5e7eb]'}`}>
                {/* Header Control Panel */}
                <div className="p-4 border-b flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#eff6ff] rounded-lg">
                            <PrinterIcon className="w-5 h-5 text-[#010080]" />
                        </div>
                        <div>
                            <h2 className={`font-black text-sm uppercase tracking-tight ${isDark ? 'text-[#ffffff]' : 'text-[#111827]'}`}>Official Report Preview</h2>
                            <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest leading-none">A4 Portrait Transcripts</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* <button
                            onClick={handleDownload}
                            disabled={isGenerating}
                            className="flex items-center gap-2 bg-[#ffffff] text-[#010080] border border-[#010080] px-4 py-2 rounded-xl hover:bg-[#f9fafb] transition-all shadow-sm text-xs font-black uppercase disabled:opacity-50"
                        >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                            {isGenerating ? 'Saving...' : 'Download PDF'}
                        </button> */}
                        <button
                            onClick={handlePrint}
                            disabled={isGenerating}
                            className="flex items-center gap-2 bg-[#010080] text-[#ffffff] px-4 py-2 rounded-xl hover:bg-[#1e1b4b] transition-all shadow-lg hover:shadow-[#1e1b4b33] text-xs font-black uppercase disabled:opacity-50"
                        >
                            <PrinterIcon className="w-4 h-4" />
                            Print Result
                        </button>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-[#374151] text-[#9ca3af]' : 'hover:bg-[#f3f4f6] text-[#6b7280]'}`}
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Modal Body / Report Content */}
                <div className="flex-1 overflow-auto p-12 bg-[#f9fafb] print-container">
                    <div className="report-content-wrapper max-w-[800px] mx-auto bg-[#ffffff] border border-[#e5e7eb] p-12 print:border-none print:p-0" id="tabular-report-content" style={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}>
                        {/* Logo/Header */}
                        <div className="report-header flex justify-between items-center mb-8 pb-6 border-b-2 border-[#010080]">
                            <div className="text-left">
                                <h1 className="text-2xl font-black text-[#010080] leading-none mb-1">ESL Student Progress Report</h1>
                                <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.3em]">Official Performance Record</p>
                            </div>
                            <div className="text-right">
                                <img src="/images/headerlogo.png" alt="BEA Academy" className="h-16 w-auto" />
                            </div>
                        </div>

                        {/* Section 1: Student Information */}
                        <div className="mb-4">
                            <SectionHeader title="1. Student Information" />
                            <table className="w-full border-collapse border border-[#d1d5db]">
                                <tbody>
                                    <tr>
                                        <TableLabel>Student Name</TableLabel>
                                        <TableValue colSpan={3} className="uppercase font-bold">{student?.full_name}</TableValue>
                                    </tr>
                                    <tr>
                                        <TableLabel>Student ID</TableLabel>
                                        <TableValue>{student?.student_id}</TableValue>
                                        <TableLabel>Course Level</TableLabel>
                                        <TableValue>{student?.program_name}</TableValue>
                                    </tr>
                                    <tr>
                                        <TableLabel>Instructor</TableLabel>
                                        <TableValue>{student?.instructor_name}</TableValue>
                                        <TableLabel>Reporting Period</TableLabel>
                                        <TableValue>{data?.studentInfo?.reportingPeriod || "Overall"}</TableValue>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* 2. Overall Progress Summary (Tabular) */}
                        <div className="mb-4">
                            <SectionHeader title="2. Overall Progress Summary" />
                            <table className="w-full border-collapse border border-[#d1d5db]">
                                <tbody>
                                    <tr>
                                        <TableLabel>Attendance Rate</TableLabel>
                                        <TableValue className="text-lg font-black">{summary?.attendance_rate}%</TableValue>
                                        <TableLabel>CEFR Level</TableLabel>
                                        <TableValue className="text-lg font-black text-[#010080]">{data?.progressSummary?.cefrLevel || "A1"}</TableValue>
                                    </tr>
                                    <tr>
                                        <TableLabel>Assignment Completion</TableLabel>
                                        <TableValue className="text-lg font-black">{summary?.completion_rate}%</TableValue>
                                        <TableLabel>Evaluation Status</TableLabel>
                                        <TableValue className="text-[10px] font-bold uppercase tracking-tight text-[#6b7280]">Global Scale Standard</TableValue>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* 3. Skill Performance (Tabular) */}
                        <div className="mb-4">
                            <SectionHeader title="3. Academic Skills Assessment" />
                            <table className="w-full border-collapse border border-[#d1d5db]">
                                <thead>
                                    <tr className="bg-[#f3f4f6] text-[#010080] text-[9px] font-black uppercase tracking-widest border border-[#d1d5db]">
                                        <th className="px-3 py-2 text-left w-1/2">Skill Category</th>
                                        <th className="px-3 py-2 text-center">Achievement (%)</th>
                                        <th className="px-3 py-2 text-center">Evaluation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {skillData.map((skill, idx) => (
                                        <tr key={idx} className="border border-[#d1d5db]">
                                            <td className="px-3 py-2 text-[11px] font-bold text-[#374151] uppercase">{skill.category}</td>
                                            <td className="px-3 py-2 text-center text-[12px] font-black">{Math.round(skill.average)}%</td>
                                            <td className="px-3 py-2 text-center text-[10px] font-bold uppercase overflow-hidden">
                                                <div className="flex justify-center gap-1">
                                                    {[20, 40, 60, 80, 100].map(threshold => (
                                                        <div
                                                            key={threshold}
                                                            className={`w-4 h-2 rounded-sm ${skill.average >= threshold ? 'bg-[#010080]' : 'bg-[#e5e7eb]'}`}
                                                        ></div>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* 4. Final Exam Score */}
                        <div className="mb-4">
                            <SectionHeader title="4. Final Exam" />
                            <table className="w-full border-collapse border border-[#d1d5db]">
                                <tbody>
                                    <tr>
                                        <TableLabel className="w-1/2">Final Exam Percentage</TableLabel>
                                        <TableValue className="text-6xl font-black text-[#010080] text-center w-1/2 py-6">
                                            <span className="font-black">{data?.examResult || summary?.overall_gpa || 0}%</span>
                                        </TableValue>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* 5. Teacher's Feedback (Unified Tabular) */}
                        <div className="mb-4">
                            <SectionHeader title="5. Teacher's Feedback & Recommendations" />
                            <table className="w-full border-collapse border border-[#d1d5db]">
                                <tbody>
                                    <tr className="align-top">
                                        <TableLabel className="py-4">General Comments</TableLabel>
                                        <TableValue className="p-4 italic font-serif leading-relaxed h-24">
                                            {feedback.comments || feedback.comment || "N/A"}
                                        </TableValue>
                                    </tr>
                                    <tr className="align-top">
                                        <TableLabel>Key Strengths</TableLabel>
                                        <TableValue className="p-3">
                                            <ul className="list-disc pl-4 space-y-1">
                                                {feedback.strengths ? feedback.strengths.split('\n').map((s, i) => <li key={i}>{s}</li>) : <li>N/A</li>}
                                            </ul>
                                        </TableValue>
                                    </tr>
                                    <tr className="align-top">
                                        <TableLabel>Weaknesses</TableLabel>
                                        <TableValue className="p-3">
                                            <ul className="list-disc pl-4 space-y-1">
                                                {feedback.weaknesses ? feedback.weaknesses.split('\n').map((s, i) => <li key={i}>{s}</li>) : <li>N/A</li>}
                                            </ul>
                                        </TableValue>
                                    </tr>
                                    <tr className="align-top">
                                        <TableLabel>Areas for Improvement</TableLabel>
                                        <TableValue className="p-3">
                                            <ul className="list-disc pl-4 space-y-1">
                                                {feedback.improvements ? feedback.improvements.split('\n').map((s, i) => <li key={i}>{s}</li>) : <li>N/A</li>}
                                            </ul>
                                        </TableValue>
                                    </tr>
                                    <tr className="align-top">
                                        <TableLabel>Recommendations</TableLabel>
                                        <TableValue className="p-3">
                                            <ul className="list-disc pl-4 space-y-1">
                                                {feedback.recommendations ? feedback.recommendations.split('\n').map((s, i) => <li key={i}>{s}</li>) : <li>N/A</li>}
                                            </ul>
                                        </TableValue>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* 6. Overall Evaluation */}
                        <div className="mb-4">
                            <SectionHeader title="6. Final Evaluation" />
                            <table className="w-full border-collapse border border-[#dbeafe]">
                                <tbody>
                                    <tr className="bg-[#ffffff]">
                                        <td className="p-4 text-center border-2 border-[#010080] w-1/2">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#010080] opacity-60 block mb-1">Total Academic Grade</span>
                                            <div className="text-3xl font-black italic text-[#010080]">{summary?.overall_gpa || 0}%</div>
                                        </td>
                                        <td className="p-4 text-center border-2 border-[#010080] w-1/2">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#010080] opacity-60 block mb-1">Promotion Level</span>
                                            <div className="text-2xl font-black text-[#010080]">{summary?.overall_gpa >= 60 ? (data?.progressSummary?.cefrLevel || "PASS") : "RETAKE"}</div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* 7. Signatures */}
                        <div className="mt-12 pt-8 border-t-2 border-dashed border-[#f3f4f6] flex justify-between gap-10 px-4">
                            <div className="text-center flex-1">
                                <div className="border-b border-[#d1d5db] h-10 mb-2"></div>
                                <p className="text-[9px] font-bold text-[#9ca3af] uppercase tracking-widest mb-1">Instructor Name</p>
                                <p className="text-[11px] font-black text-[#010080]">{student?.instructor_name}</p>
                            </div>
                            <div className="text-center flex-1">
                                <div className="border-b border-[#d1d5db] h-10 mb-2"></div>
                                <p className="text-[9px] font-bold text-[#9ca3af] uppercase tracking-widest mb-1">Academic Director / Date</p>
                                <p className="text-[11px] font-black text-[#010080]">{new Date().toLocaleDateString('en-GB')}</p>
                            </div>
                            <div className="text-center flex-1">
                                <div className="border-b border-[#d1d5db] h-10 mb-2"></div>
                                <p className="text-[9px] font-bold text-[#9ca3af] uppercase tracking-widest mb-1">Academy Principal</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CSS for print */}
                <style jsx global>{`
          @media print {
            /* Fallback for native printing */
            .no-print { display: none !important; }
            body { background: #ffffff !important; }
            .report-content-wrapper { 
              border: none !important; 
              box-shadow: none !important; 
              padding: 0 !important;
            }
          }
        `}</style>
            </div>
        </div>
    );
};

export default OfficialReportModal;
