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
    isDark,
    allStudents = []
}) {
    if (!isOpen || !request) return null;

    // Find full student details
    const studentDetail = allStudents.find(s => s.student_id === request.student_id) || {};

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50">
            <div
                className="absolute inset-0 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className={`relative w-full ${modalType === 'view' ? 'max-w-3xl' : 'max-w-md'} rounded-2xl shadow-2xl overflow-hidden border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-900'}`} onClick={(e) => e.stopPropagation()}>
                <div className={`sticky top-0 z-10 px-6 py-4 border-b flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <h3 className="text-xl font-bold text-[#010080] dark:text-white">
                        {modalType === 'view' ? 'Student Details' : (modalType === 'approve' ? 'Approve' : 'Reject') + ' Freezing Request'}
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

                <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
                    {modalType === 'view' ? (
                        <div className="space-y-6">
                            {/* Profile Header */}
                            <div className="flex items-center gap-5 px-2">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-[#e6f0ff] text-[#2563eb]'}`}>
                                    {request.student_name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="space-y-1">
                                    <h4 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{request.student_name}</h4>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{request.student_email}</p>
                                </div>
                            </div>

                            {/* Section: PERSONAL INFORMATION */}
                            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-700/20 border-gray-700' : 'bg-white border-gray-100 shadow-sm shadow-black/5'}`}>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-6">PERSONAL INFORMATION</p>
                                <div className="grid grid-cols-3 gap-y-6 gap-x-4">
                                    <div>
                                        <p className="text-[11px] font-semibold text-gray-400 uppercase mb-1.5">Student ID</p>
                                        <p className="text-sm font-bold text-[#2563eb]">{studentDetail.student_id || request.student_id || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold text-gray-400 uppercase mb-1.5">Full Name</p>
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{request.student_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold text-gray-400 uppercase mb-1.5">Age</p>
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{studentDetail.age || "34"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold text-gray-400 uppercase mb-1.5">Sex</p>
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{studentDetail.sex || "Female"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold text-gray-400 uppercase mb-1.5">Country</p>
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{studentDetail.residency_country || studentDetail.country || "Somalia"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold text-gray-400 uppercase mb-1.5">City</p>
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{studentDetail.residency_city || studentDetail.city || "Mogadishu"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Section: PROGRAM INFORMATION */}
                            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-blue-900/10 border-blue-900/30' : 'bg-[#f0f7ff] border-blue-50 shadow-sm shadow-blue-900/5'}`}>
                                <p className="text-[11px] font-bold text-[#2563eb] uppercase tracking-widest mb-6">PROGRAM INFORMATION</p>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-4">
                                    <div className="col-span-2 lg:col-span-1">
                                        <p className="text-[11px] font-semibold text-gray-400 uppercase mb-1.5">Program</p>
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{studentDetail.chosen_program || "Generic Program"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold text-gray-400 uppercase mb-1.5">Subprogram</p>
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{studentDetail.chosen_subprogram_name || studentDetail.chosen_subprogram || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold text-gray-400 uppercase mb-1.5">Class</p>
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{studentDetail.class_name || "N/A"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Section: REGISTRATION */}
                            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-700/20 border-gray-700' : 'bg-white border-gray-100 shadow-sm shadow-black/5'}`}>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-6">REGISTRATION</p>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-[11px] font-semibold text-gray-400 uppercase mb-1.5">Status</p>
                                        <span className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${studentDetail.approval_status === 'approved'
                                            ? 'bg-green-100 text-green-700 border border-green-200'
                                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                                            }`}>
                                            {studentDetail.approval_status || "Active"}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold text-gray-400 uppercase mb-1.5">Registration Date</p>
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                                            {studentDetail.created_at ? new Date(studentDetail.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Dec 31, 2025"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Section: FREEZING DETAILS */}
                            <div className={`p-4 rounded-xl border border-dashed ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase">Freezing Request Info</p>
                                    <span className={`text-[10px] font-bold uppercase font-sans ${request.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                                        Request {request.status}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Freezing Period</p>
                                        <p className="text-xs font-bold text-blue-600">
                                            {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Academy Note</p>
                                        <p className="text-xs font-medium italic">
                                            {request.admin_response || (request.status === 'approved' ? 'Request approved.' : 'Request rejected.')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className={`p-4 rounded-xl border-2 ${isDark ? 'bg-blue-900/10 border-blue-800' : 'bg-blue-50 border-blue-100'}`}>
                                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Student</p>
                                <p className="font-bold text-lg">{request.student_name}</p>
                                <div className="mt-3 flex justify-between items-center bg-white/50 dark:bg-black/20 p-2 rounded-lg">
                                    <span className="text-xs font-medium text-gray-500">Freezing Period:</span>
                                    <span className="text-xs font-bold text-blue-600 uppercase">
                                        {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {modalType === 'approve' ? 'Academy Note (Optional)' : 'Reason for Rejection'}
                                </label>
                                <textarea
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    placeholder={modalType === 'approve' ? "Instructions or feedback for the student..." : "Provide a reason for the student..."}
                                    rows={4}
                                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-800'}`}
                                    required={modalType === 'reject'}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className={`p-6 flex justify-end gap-3 border-t ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <button
                        onClick={onClose}
                        className={`px-10 py-2.5 text-sm font-bold border-2 rounded-xl transition-all ${modalType === 'view' ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50' : isDark ? 'hover:bg-gray-700 text-gray-300 border-gray-600' : 'hover:bg-gray-200 text-gray-700 border-gray-300'}`}
                    >
                        {modalType === 'view' ? 'Close' : 'Cancel'}
                    </button>
                    {modalType !== 'view' && (
                        <button
                            disabled={isUpdating || (modalType === 'reject' && !adminNote)}
                            onClick={() => handleAction(modalType === 'approve' ? 'approved' : 'rejected')}
                            className={`px-8 py-2.5 text-sm font-bold text-white rounded-xl transition-all shadow-lg active:scale-[0.98] ${modalType === 'approve'
                                ? 'bg-green-600 hover:bg-green-700 shadow-green-500/20'
                                : 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isUpdating ? 'Processing...' : (modalType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
