"use client";

import { useState, useEffect } from "react";
import { useGetSubprogramsQuery } from "@/redux/api/subprogramApi";
import { useGetClassesBySubprogramIdQuery } from "@/redux/api/classApi";

export default function LevelUpActionModal({
    isOpen,
    onClose,
    request,
    modalType,
    adminNote,
    setAdminNote,
    handleAction,
    isUpdating,
    isDark,
}) {
    const [selectedSubprogram, setSelectedSubprogram] = useState("");
    const [selectedClass, setSelectedClass] = useState("");

    const { data: subprograms = [] } = useGetSubprogramsQuery();
    const { data: classes = [], isLoading: isLoadingClasses } = useGetClassesBySubprogramIdQuery(selectedSubprogram, {
        skip: !selectedSubprogram || modalType !== 'approve'
    });

    useEffect(() => {
        if (request && modalType === 'approve') {
            setSelectedSubprogram(request.requested_subprogram_id);
        }
    }, [request, modalType]);

    if (!isOpen || !request) return null;

    const onConfirm = () => {
        if (modalType === 'approve') {
            handleAction('approved', {
                new_subprogram_id: selectedSubprogram,
                new_class_id: selectedClass
            });
        } else {
            handleAction('rejected');
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50">
            <div className="absolute inset-0 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full ${modalType === 'view' ? 'max-w-2xl' : 'max-w-md'} rounded-2xl shadow-2xl overflow-hidden border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-900'}`} onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <h3 className="text-xl font-bold text-[#010080] dark:text-white">
                        {modalType === 'view' ? 'Level Up Request Details' : (modalType === 'approve' ? 'Approve' : 'Reject') + ' Request'}
                    </h3>
                    <button onClick={onClose} className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
                    {/* Student Info Card */}
                    <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-700/20 border-gray-700' : 'bg-blue-50 border-blue-100'}`}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-[#010080] text-white'}`}>
                                {request.student_name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-bold text-sm">{request.student_name}</p>
                                <p className="text-xs text-gray-500">{request.student_id}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                                <p className="text-gray-500 font-medium uppercase mb-1">Target Level</p>
                                <p className="font-bold text-blue-600 dark:text-blue-400">{request.requested_subprogram_name}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 font-medium uppercase mb-1">Requested On</p>
                                <p className="font-bold">{new Date(request.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Description Section */}
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Student's Reason</p>
                        <div className={`p-4 rounded-xl border italic text-sm ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                            {request.description || "No description provided."}
                        </div>
                    </div>

                    {modalType === 'approve' && (
                        <div className="space-y-4 pt-2 border-t border-dashed border-gray-600">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Confirm Subprogram</label>
                                <select
                                    value={selectedSubprogram}
                                    onChange={(e) => setSelectedSubprogram(e.target.value)}
                                    className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                                >
                                    <option value="">Select Subprogram</option>
                                    {subprograms.map(sub => (
                                        <option key={sub.id} value={sub.id}>{sub.subprogram_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Assign to Class</label>
                                <select
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    disabled={!selectedSubprogram || isLoadingClasses}
                                    className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} disabled:opacity-50`}
                                >
                                    <option value="">{isLoadingClasses ? "Loading classes..." : "Select Class"}</option>
                                    {classes.map(cls => (
                                        <option key={cls.id} value={cls.id}>{cls.class_name}</option>
                                    ))}
                                </select>
                                {!isLoadingClasses && selectedSubprogram && classes.length === 0 && (
                                    <p className="text-[10px] text-red-500 mt-1 font-medium">No active classes found for this subprogram.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {modalType !== 'view' && (
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                                {modalType === 'approve' ? 'Academy Note (Optional)' : 'Reason for Rejection'}
                            </label>
                            <textarea
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                placeholder={modalType === 'approve' ? "Feedback for the student..." : "Why is this request being rejected?"}
                                rows={3}
                                className={`w-full px-4 py-3 border-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                                required={modalType === 'reject'}
                            />
                        </div>
                    )}

                    {modalType === 'view' && request.status !== 'pending' && (
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Admin Response</p>
                            <div className={`p-4 rounded-xl border text-sm ${isDark ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-green-50 border-green-100 text-green-800'}`}>
                                {request.admin_response || "No response provided."}
                            </div>
                        </div>
                    )}
                </div>

                <div className={`p-6 flex justify-end gap-3 border-t ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <button onClick={onClose} className={`px-8 py-2.5 text-sm font-bold border-2 rounded-xl transition-all ${isDark ? 'hover:bg-gray-700 text-gray-300 border-gray-600' : 'hover:bg-gray-100 text-gray-700 border-gray-300'}`}>
                        {modalType === 'view' ? 'Close' : 'Cancel'}
                    </button>
                    {modalType !== 'view' && (
                        <button
                            disabled={isUpdating || (modalType === 'reject' && !adminNote) || (modalType === 'approve' && !selectedClass)}
                            onClick={onConfirm}
                            className={`px-8 py-2.5 text-sm font-bold text-white rounded-xl transition-all shadow-lg active:scale-[0.98] ${modalType === 'approve' ? 'bg-green-600 hover:bg-green-700 shadow-green-500/20' : 'bg-red-600 hover:bg-red-700 shadow-red-500/20'} disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isUpdating ? 'Processing...' : (modalType === 'approve' ? 'Confirm Promotion' : 'Confirm Rejection')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
