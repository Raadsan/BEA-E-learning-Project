"use client";

export default function FreezingActionModal({
    isOpen,
    onClose,
    request,
    modalType,
    adminNote,
    setAdminNote,
    handleAction,
    isUpdating,
    isDark
}) {
    if (!isOpen || !request) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50">
            <div
                className="absolute inset-0 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className={`relative w-full max-w-md rounded-xl shadow-2xl overflow-hidden border-2 transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-900'}`} onClick={(e) => e.stopPropagation()}>
                <div className={`sticky top-0 z-10 px-6 py-4 border-b flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <h3 className="text-lg font-bold">
                        {modalType === 'approve' ? 'Approve' : 'Reject'} Freezing Request
                    </h3>
                    <button
                        onClick={onClose}
                        className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className={`p-4 rounded-lg border-2 ${isDark ? 'bg-blue-900/10 border-blue-800' : 'bg-blue-100 border-blue-200'}`}>
                        <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Student</p>
                        <p className="font-semibold">{request.student_name}</p>
                        <div className="mt-2 flex justify-between items-center text-sm">
                            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Period:</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                                {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {modalType === 'approve' ? 'Academy Note (Optional)' : 'Reason for Rejection'}
                        </label>
                        <textarea
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            placeholder={modalType === 'approve' ? "Instructions or feedback for the student..." : "Provide a reason for the student..."}
                            rows={4}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                            required={modalType === 'reject'}
                        />
                    </div>
                </div>

                <div className={`p-6 flex justify-end gap-3 border-t ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50/50 border-gray-200'}`}>
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-700'}`}
                    >
                        Cancel
                    </button>
                    <button
                        disabled={isUpdating || (modalType === 'reject' && !adminNote)}
                        onClick={() => handleAction(modalType === 'approve' ? 'approved' : 'rejected')}
                        className={`px-6 py-2 text-sm font-bold text-white rounded-lg transition-all shadow-lg ${modalType === 'approve'
                            ? 'bg-green-600 hover:bg-green-700 shadow-green-500/20'
                            : 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isUpdating ? 'Processing...' : (modalType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection')}
                    </button>
                </div>
            </div>
        </div>
    );
}
