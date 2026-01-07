"use client";

export default function SessionActionModal({
    isOpen,
    onClose,
    request,
    modalType,
    adminNote,
    setAdminNote,
    handleAction,
    isUpdating,
    isDark,
    classes = [],
    allStudents = [],
    selectedClassId,
    setSelectedClassId,
    selectedType,
    setSelectedType
}) {
    if (!isOpen || !request) return null;

    // Find full student details from allStudents
    const studentDetail = allStudents.find(s => s.student_id === request.student_id) || {};

    // Filter classes by student's program and selected type
    const programClasses = classes.filter(c => c.program_name === studentDetail.chosen_program);
    const filteredClasses = programClasses.filter(c => !selectedType || c.type?.toLowerCase() === selectedType.toLowerCase());

    const isApprove = modalType === 'approve';
    const isView = modalType === 'view';

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className={`relative w-full ${isApprove ? 'max-w-lg' : isView ? 'max-w-3xl' : 'max-w-md'} rounded-2xl shadow-2xl overflow-hidden border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-900'}`} onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className={`sticky top-0 z-10 px-6 py-4 border-b flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <h3 className="text-xl font-bold text-[#010080] dark:text-white">
                        {isView ? 'Student Details' : (isApprove ? 'Approve Request' : 'Reject Session Request')}
                    </h3>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {isApprove ? (
                        <>
                            {/* Student Info Card */}
                            <div className={`p-5 rounded-2xl border-2 ${isDark ? 'bg-blue-900/10 border-blue-800' : 'bg-blue-50/50 border-blue-100'}`}>
                                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                                    <div>
                                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Student Name</p>
                                        <p className="font-bold text-base">{request.student_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Email Address</p>
                                        <p className="font-medium text-gray-600 dark:text-gray-400 truncate" title={request.student_email}>{request.student_email}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Current Class</p>
                                        <p className="font-bold text-blue-600 dark:text-blue-400">{request.current_class_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Current Shift</p>
                                        <p className="font-bold text-blue-600 dark:text-blue-400 capitalize">{request.current_class_type || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Target Program */}
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Target Program:</p>
                                <p className="text-base font-bold text-gray-900 dark:text-white uppercase">
                                    {studentDetail.chosen_program || "Generic Program"}
                                </p>
                            </div>

                            {/* Class Type Selection */}
                            <div>
                                <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                                    Select Class Type
                                </label>
                                <div className="flex gap-3">
                                    {['morning', 'afternoon', 'night'].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => {
                                                setSelectedType(type);
                                                setSelectedClassId("");
                                            }}
                                            className={`flex-1 px-4 py-2.5 rounded-xl border-2 font-bold transition-all ${selectedType === type
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30'
                                                : isDark
                                                    ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                                                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Class Selection */}
                            <div>
                                {!selectedType ? (
                                    <div className={`p-4 rounded-xl border-2 border-dashed ${isDark ? 'bg-blue-900/10 border-blue-800' : 'bg-blue-50/50 border-blue-200'}`}>
                                        <p className="text-center text-sm text-blue-600 dark:text-blue-400 font-medium">
                                            Please select a class type above to view available classes.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                            Available Classes
                                        </label>
                                        <select
                                            value={selectedClassId}
                                            onChange={(e) => setSelectedClassId(e.target.value)}
                                            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200 bg-white text-gray-800'}`}
                                        >
                                            <option value="">Select a class</option>
                                            {filteredClasses.map((cls) => (
                                                <option key={cls.id} value={cls.id}>
                                                    {cls.class_name} — {cls.subprogram_name || 'General'}
                                                </option>
                                            ))}
                                        </select>
                                    </>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                    Approval Note (Optional)
                                </label>
                                <textarea
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    placeholder="Any instructions for the student..."
                                    rows={2}
                                    className={`w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                                />
                            </div>
                        </>
                    ) : isView ? (
                        /* View Flow - Redesigned to match "Student Details" image */
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
                                        <p className="text-[11px] font-semibold text-gray-400 uppercase mb-1.5">Gender</p>
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{studentDetail.gender || "Female"}</p>
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
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{request.requested_class_name || "N/A"}</p>
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

                            {/* Section: REQUEST DETAILS (Minimal & integrated) */}
                            <div className={`p-4 rounded-xl border border-dashed ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase">Change Request Info</p>
                                    <span className={`text-[10px] font-bold uppercase font-sans ${request.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                                        Request {request.status}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        <span className="font-bold text-gray-500">Requested:</span> {request.requested_session_type}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 italic">"{request.reason}"</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Rejection Flow */
                        <>
                            <div className={`p-4 rounded-xl border-2 ${isDark ? 'bg-red-900/10 border-red-800' : 'bg-red-50 border-red-100'}`}>
                                <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">Rejecting Request for</p>
                                <p className="font-bold text-lg">{request.student_name}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                    Reason for Rejection <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    placeholder="Please provide a reason for the rejection..."
                                    rows={4}
                                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500/50 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                                    required
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className={`p-6 flex justify-end gap-3 border-t ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <button
                        onClick={onClose}
                        className={`px-10 py-2.5 text-sm font-bold rounded-xl border-2 transition-all ${isView ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50' : isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                    >
                        {isView ? 'Close' : 'Cancel'}
                    </button>
                    {!isView && (
                        <button
                            disabled={isUpdating || (isApprove && !selectedClassId) || (!isApprove && !adminNote)}
                            onClick={() => handleAction(isApprove ? 'approved' : 'rejected', isApprove ? selectedClassId : null)}
                            className={`flex-1 px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-all shadow-lg active:scale-[0.98] ${isApprove
                                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
                                : 'bg-red-600 hover:bg-red-700 shadow-red-500/25'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isUpdating ? 'Processing...' : (isApprove ? 'Assign Class' : 'Reject Request')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
