"use client";
import { resolveMediaUrl } from "@/constants";
import AuditTrailSection from "@/components/admin/AuditTrailSection";
import { splitFundingStatus } from "@/utils/studentFundingForm";

const ReadField = ({ label, value, isDark, colorClass = "", span = false }: {
    label: string;
    value?: string | number | null;
    isDark: boolean;
    colorClass?: string;
    span?: boolean;
}) => (
    <div className={span ? "md:col-span-2" : ""}>
        <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {label}
        </label>
        <input
            type="text"
            readOnly
            value={value !== undefined && value !== null && value !== '' ? String(value) : 'N/A'}
            className={`w-full px-3 py-2 rounded-md border text-sm font-medium outline-none cursor-default select-all
                ${isDark
                    ? 'bg-gray-800/60 border-gray-600 text-gray-100'
                    : 'bg-gray-50 border-gray-200 text-gray-900'}
                ${colorClass}`}
        />
    </div>
);

export default function StudentViewModal({
    isOpen,
    onClose,
    viewingStudent,
    viewingPayments,
    isDark
}) {
    if (!isOpen || !viewingStudent) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div
                className="absolute inset-0 backdrop-blur-sm"
                aria-hidden="true"
                onClick={onClose}
            />

            <div
                className={`relative rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4 border-2 ${isDark ? 'bg-gray-800/95 border-gray-600' : 'bg-white/95 border-gray-300'}`}
                onClick={(e) => e.stopPropagation()}
                style={{ pointerEvents: 'auto', backdropFilter: 'blur(2px)' }}
            >
                {/* Header */}
                <div className={`sticky top-0 border-b px-6 py-4 flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Student Profile: {viewingStudent.full_name || `${viewingStudent.first_name || ''} ${viewingStudent.last_name || ''}`.trim() || 'Student'}
                    </h2>
                    <button
                        onClick={onClose}
                        className={`transition-colors ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">

                    {/* Personal Information */}
                    <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-blue-50/50 border-blue-200'}`}>
                        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ReadField label="Full Name" value={viewingStudent.full_name} isDark={isDark} />
                            <ReadField label="Email" value={viewingStudent.email} isDark={isDark} />
                            <ReadField label="Phone" value={viewingStudent.phone} isDark={isDark} />
                            <ReadField label="Age" value={viewingStudent.age ? `${viewingStudent.age} years` : null} isDark={isDark} colorClass={isDark ? 'text-blue-300' : 'text-blue-700'} />
                            <ReadField label="Date of Birth" value={viewingStudent.date_of_birth ? new Date(viewingStudent.date_of_birth).toLocaleDateString() : null} isDark={isDark} />
                            <ReadField label="Place of Birth" value={viewingStudent.place_of_birth} isDark={isDark} />
                            <ReadField label="Sex" value={viewingStudent.sex} isDark={isDark} />
                            <ReadField label="Student ID" value={viewingStudent.student_id} isDark={isDark} colorClass={isDark ? 'text-blue-300 font-bold' : 'text-blue-700 font-bold'} />
                        </div>
                    </div>

                    {/* Location Information */}
                    <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-purple-50/50 border-purple-200'}`}>
                        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Location Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ReadField label="Country" value={viewingStudent.residency_country} isDark={isDark} />
                            <ReadField label="City" value={viewingStudent.residency_city} isDark={isDark} />
                        </div>
                    </div>

                    {/* Academic Information */}
                    <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-green-50/50 border-green-200'}`}>
                        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            Academic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ReadField label="Program" value={viewingStudent.chosen_program} isDark={isDark} />
                            <ReadField
                                label="Subprogram"
                                value={
                                    viewingStudent.chosen_subprogram &&
                                    viewingStudent.chosen_subprogram.trim() !== "" &&
                                    viewingStudent.chosen_subprogram !== "null"
                                        ? viewingStudent.chosen_subprogram
                                        : null
                                }
                                isDark={isDark}
                            />
                            <ReadField label="Approval Status" value={viewingStudent.approval_status} isDark={isDark} />
                            {viewingStudent.sponsor_name && (
                                <ReadField label="Sponsor Name" value={viewingStudent.sponsor_name} isDark={isDark} colorClass={isDark ? 'text-blue-300' : 'text-blue-700'} span />
                            )}

                            {/* IELTS/TOEFL Assessment Details */}
                            {viewingStudent.chosen_program && (viewingStudent.chosen_program.toUpperCase().includes("IELTS") || viewingStudent.chosen_program.toUpperCase().includes("TOEFL")) && (
                                <>
                                    <ReadField label="Verification Method" value={viewingStudent.verification_method} isDark={isDark} colorClass={isDark ? 'text-indigo-300' : 'text-indigo-700'} />
                                    {viewingStudent.verification_method === 'Certificate' && (
                                        <>
                                            <ReadField label="Institution" value={viewingStudent.certificate_institution} isDark={isDark} />
                                            <ReadField label="Certificate Date" value={viewingStudent.certificate_date ? new Date(viewingStudent.certificate_date).toLocaleDateString() : null} isDark={isDark} />
                                            {viewingStudent.certificate_document && (
                                                <div className="md:col-span-2">
                                                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        Certificate Document
                                                    </label>
                                                    <a
                                                        href={resolveMediaUrl(viewingStudent.certificate_document) || "#"}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-500 hover:text-blue-600 flex items-center gap-2 mt-1"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        View / Download Certificate
                                                    </a>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Funding Information */}
                    <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-yellow-50/50 border-yellow-200'}`}>
                        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                            </svg>
                            Funding Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(() => {
                                const { paymentType, discountType } = splitFundingStatus(
                                    viewingStudent.funding_status,
                                    viewingStudent.scholarship_percentage
                                );
                                const discountLabel =
                                    discountType === "full"
                                        ? "Full scholarship (100%)"
                                        : discountType === "partial"
                                          ? `${viewingStudent.scholarship_percentage || "—"}%`
                                          : "No discount";
                                return (
                                    <>
                                        <ReadField label="Payment Type" value={paymentType} isDark={isDark} />
                                        <ReadField label="Scholarship / Discount" value={discountLabel} isDark={isDark} />
                                    </>
                                );
                            })()}
                            <ReadField label="Sponsorship Package" value={viewingStudent.sponsorship_package} isDark={isDark} />
                            <ReadField label="Funding Amount" value={viewingStudent.funding_amount} isDark={isDark} />
                            <ReadField label="Funding Month" value={viewingStudent.funding_month} isDark={isDark} />
                        </div>
                    </div>

                    {/* Parent/Guardian Information - Only if age < 18 */}
                    {viewingStudent.age && parseInt(viewingStudent.age) < 18 && (
                        <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-orange-50/50 border-orange-200'}`}>
                            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                Parent/Guardian Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ReadField label="Parent Name" value={viewingStudent.parent_name} isDark={isDark} />
                                <ReadField label="Parent Email" value={viewingStudent.parent_email} isDark={isDark} />
                                <ReadField label="Parent Phone" value={viewingStudent.parent_phone} isDark={isDark} />
                                <ReadField label="Relation" value={viewingStudent.parent_relation} isDark={isDark} />
                                <ReadField label="Parent Country" value={viewingStudent.parent_res_county} isDark={isDark} />
                                <ReadField label="Parent City" value={viewingStudent.parent_res_city} isDark={isDark} />
                            </div>
                        </div>
                    )}

                    {/* Payment Information */}
                    <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-indigo-50/50 border-indigo-200'}`}>
                        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Payment Information
                        </h3>
                        {viewingPayments && viewingPayments.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Paid</label>
                                    <input
                                        type="text"
                                        readOnly
                                        value={`$${viewingPayments.filter(p => p.status === 'paid' || p.status === 'completed').reduce((sum, p) => sum + (Number(p.amount) || 0), 0).toFixed(2)}`}
                                        className={`w-full px-3 py-2 rounded-md border text-sm font-bold outline-none cursor-default ${isDark ? 'bg-gray-800/60 border-gray-600 text-green-400' : 'bg-gray-50 border-gray-200 text-green-700'}`}
                                    />
                                </div>
                                <div>
                                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Payment Method</label>
                                    <input
                                        type="text"
                                        readOnly
                                        value={[...new Set(viewingPayments.map(p => p.payment_method).filter(Boolean))].join(', ') || 'N/A'}
                                        className={`w-full px-3 py-2 rounded-md border text-sm font-medium outline-none cursor-default ${isDark ? 'bg-gray-800/60 border-gray-600 text-gray-100' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                    />
                                </div>
                                <div>
                                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Payments</label>
                                    <input
                                        type="text"
                                        readOnly
                                        value={`${viewingPayments.length} payment${viewingPayments.length !== 1 ? 's' : ''}`}
                                        className={`w-full px-3 py-2 rounded-md border text-sm font-medium outline-none cursor-default ${isDark ? 'bg-gray-800/60 border-gray-600 text-gray-100' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                    />
                                </div>
                            </div>
                        ) : (
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                No payment records found for this student.
                            </p>
                        )}
                    </div>

                    <AuditTrailSection
                        record={viewingStudent}
                        isDark={isDark}
                        createdAtKey={viewingStudent.registration_date ? "registration_date" : "created_at"}
                    />

                </div>
            </div>
        </div>
    );
}
