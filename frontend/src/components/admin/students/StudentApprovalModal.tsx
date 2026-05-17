"use client";

export default function StudentApprovalModal({
    isOpen,
    onClose,
    student,
    onApprove,
    onReject,
    isApproving,
    isRejecting,
    isDark,
    classes = [],
    selectedClassId,
    setSelectedClassId
}) {
    if (!isOpen || !student) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className={`relative w-full max-w-md rounded-xl shadow-2xl overflow-hidden border-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                }`}>
                <div className={`sticky top-0 z-10 px-6 py-4 border-b flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                    <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Student Approval
                    </h3>
                    <button
                        onClick={onClose}
                        className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-600'
                            }`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div>
                            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{student.full_name}</p>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{student.email}</p>
                        </div>
                    </div>

                    <div className={`p-4 rounded-lg mb-6 text-sm border ${isDark ? 'bg-gray-700/30 border-gray-600 text-gray-300' : 'bg-blue-50/50 border-blue-100 text-blue-800'
                        }`}>
                        <p>Give him approve or reject for this student application.</p>
                    </div>

                    {/* Class Selection Dropdown (Added for integrated approval) */}
                    {onApprove && setSelectedClassId && (
                        <div className="mb-6 space-y-2">
                            <label className={`block text-xs font-bold uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Assign to Class (Optional)
                            </label>
                            <select
                                value={selectedClassId || ""}
                                onChange={(e) => setSelectedClassId(e.target.value)}
                                className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                            >
                                <option value="">No Class Assigned</option>
                                {classes.map(cls => (
                                    <option key={cls.id} value={cls.id}>{cls.class_name} ({cls.program_name})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={() => onReject(student)}
                            disabled={isRejecting}
                            className="flex-1 px-4 py-2.5 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            Reject
                        </button>
                        <button
                            onClick={() => onApprove(student)}
                            disabled={isApproving}
                            className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            Approve
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
