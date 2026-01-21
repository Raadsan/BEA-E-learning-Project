"use client";

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
                className={`relative rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4 border-2 ${isDark ? 'bg-gray-800/95 border-gray-600' : 'bg-white/95 border-gray-300'
                    }`}
                onClick={(e) => e.stopPropagation()}
                style={{ pointerEvents: 'auto', backdropFilter: 'blur(2px)' }}
            >
                <div className={`sticky top-0 border-b px-6 py-4 flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                    <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'
                        }`}>
                        Student Profile: {viewingStudent.full_name}
                    </h2>
                    <button
                        onClick={onClose}
                        className={`transition-colors ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Personal Information Section */}
                    <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-blue-50/50 border-blue-200'
                        }`}>
                        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'
                            }`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Full Name</label>
                                <p className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {viewingStudent.full_name || 'N/A'}
                                </p>
                            </div>
                            <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Email</label>
                                <p className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                                    {viewingStudent.email || 'N/A'}
                                </p>
                            </div>
                            <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Phone</label>
                                <p className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                                    {viewingStudent.phone || 'N/A'}
                                </p>
                            </div>
                            <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Age</label>
                                <p className={`text-base font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                    {viewingStudent.age || 'N/A'} {viewingStudent.age ? 'years' : ''}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Location Information Section */}
                    <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-purple-50/50 border-purple-200'
                        }`}>
                        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'
                            }`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Location Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Country</label>
                                <p className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                                    {viewingStudent.residency_country || 'N/A'}
                                </p>
                            </div>
                            <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                                    }`}>City</label>
                                <p className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                                    {viewingStudent.residency_city || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Academic Information Section */}
                    <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-green-50/50 border-green-200'
                        }`}>
                        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'
                            }`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            Academic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Program</label>
                                <p className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {viewingStudent.chosen_program || 'Not assigned'}
                                </p>
                            </div>
                            <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Subprogram</label>
                                <p className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                                    {viewingStudent.chosen_subprogram && viewingStudent.chosen_subprogram.trim() !== "" && viewingStudent.chosen_subprogram !== "null"
                                        ? viewingStudent.chosen_subprogram
                                        : 'Not assigned'}
                                </p>
                            </div>
                            {viewingStudent.sponsor_name && (
                                <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'} md:col-span-2`}>
                                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Sponsor Name</label>
                                    <p className={`text-base font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                        {viewingStudent.sponsor_name}
                                    </p>
                                </div>
                            )}

                            {/* IELTS/TOEFL Assessment Details */}
                            {viewingStudent.chosen_program && (viewingStudent.chosen_program.toUpperCase().includes("IELTS") || viewingStudent.chosen_program.toUpperCase().includes("TOEFL")) && (
                                <>
                                    <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                        <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                                            }`}>Verification Method</label>
                                        <p className={`text-base font-medium ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                            {viewingStudent.verification_method || 'N/A'}
                                        </p>
                                    </div>
                                    {viewingStudent.verification_method === 'Certificate' && (
                                        <>
                                            <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                                <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                                                    }`}>Institution</label>
                                                <p className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                                                    {viewingStudent.certificate_institution || 'N/A'}
                                                </p>
                                            </div>
                                            <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                                <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                                                    }`}>Certificate Date</label>
                                                <p className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                                                    {viewingStudent.certificate_date ? new Date(viewingStudent.certificate_date).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </div>
                                            {viewingStudent.certificate_document && (
                                                <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'} md:col-span-2`}>
                                                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                                                        }`}>Certificate Document</label>
                                                    <a
                                                        href={viewingStudent.certificate_document.startsWith('http') ? viewingStudent.certificate_document : `${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000'}${viewingStudent.certificate_document}`}
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

                    {/* Parent/Guardian Information Section - Only show if age < 18 */}
                    {viewingStudent.age && parseInt(viewingStudent.age) < 18 && (
                        <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-orange-50/50 border-orange-200'
                            }`}>
                            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'
                                }`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                Parent/Guardian Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Parent Name</label>
                                    <p className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                                        {viewingStudent.parent_name || 'N/A'}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Parent Email</label>
                                    <p className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                                        {viewingStudent.parent_email || 'N/A'}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Parent Phone</label>
                                    <p className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                                        {viewingStudent.parent_phone || 'N/A'}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Relation</label>
                                    <p className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                                        {viewingStudent.parent_relation || 'N/A'}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Parent Country</label>
                                    <p className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                                        {viewingStudent.parent_res_county || 'N/A'}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Parent City</label>
                                    <p className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                                        {viewingStudent.parent_res_city || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payment Information Section */}
                    <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-indigo-50/50 border-indigo-200'}`}>
                        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Payment Information
                        </h3>
                        {viewingPayments && viewingPayments.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Total Paid */}
                                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Paid</label>
                                    <p className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                        ${viewingPayments
                                            .filter(p => p.status === 'paid' || p.status === 'completed')
                                            .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
                                            .toFixed(2)}
                                    </p>
                                </div>
                                {/* Payment Method */}
                                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Payment Method</label>
                                    <p className={`text-base font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                                        {[...new Set(viewingPayments.map(p => p.payment_method).filter(Boolean))].join(', ') || 'N/A'}
                                    </p>
                                </div>
                                {/* Total Payments */}
                                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Payments</label>
                                    <p className={`text-base font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                                        {viewingPayments.length} payment{viewingPayments.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                No payment records found for this student.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
