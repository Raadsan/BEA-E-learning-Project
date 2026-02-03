"use client";

import { useState, useEffect } from "react";
import { useGetSubprogramsQuery } from "@/redux/api/subprogramApi";
import { useGetClassesBySubprogramIdQuery } from "@/redux/api/classApi";

export default function LevelUpActionModal({
    isOpen,
    onClose,
    request,
    modalType,
    setModalType,
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
        skip: !selectedSubprogram
    });

    useEffect(() => {
        if (request && (modalType === 'approve' || modalType === 'choose')) {
            setSelectedSubprogram(request.requested_subprogram_id);
            // Don't auto-reset class if it was already selected
        }
    }, [request, modalType]);

    if (!isOpen || !request) return null;

    const isChoose = modalType === 'choose';
    const isApprove = modalType === 'approve';
    const isReject = modalType === 'reject';
    const isView = modalType === 'view';

    const onConfirm = () => {
        if (isApprove) {
            handleAction('approved', {
                new_subprogram_id: selectedSubprogram,
                new_class_id: selectedClass
            });
        } else {
            handleAction('rejected');
        }
    };

    const getTitle = () => {
        if (isChoose) return 'Level Up Request';
        if (isView) return 'Request Details';
        if (isApprove) return 'Assign to Class';
        if (isReject) return 'Reject Request';
        return '';
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50">
            <div className="absolute inset-0 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full ${isView ? 'max-w-2xl' : 'max-w-md'} rounded-2xl shadow-2xl overflow-hidden border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-900'}`} onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-[#010080]'}`}>
                        {getTitle()}
                    </h3>
                    <button onClick={onClose} className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
                    {isChoose ? (
                        <div className="space-y-5">
                            <div className={`p-5 rounded-xl border flex gap-4 ${isDark ? 'bg-blue-900/10 border-blue-900/30' : 'bg-[#eff6ff] border-[#dbeafe]'}`}>
                                <div className="text-blue-500 shrink-0">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="space-y-1">
                                    <h4 className={`font-bold ${isDark ? 'text-blue-400' : 'text-blue-900'}`}>{request.student_name}</h4>
                                    <p className={`text-sm ${isDark ? 'text-blue-200/70' : 'text-blue-800'}`}>
                                        Requested Level Up to <strong className="font-bold underline">{request.requested_subprogram_name}</strong>.
                                    </p>
                                    {request.description && (
                                        <div className={`mt-3 p-3 rounded-lg text-xs italic ${isDark ? 'bg-blue-900/20 text-blue-300' : 'bg-white/50 text-blue-700'}`}>
                                            "{request.description}"
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (isApprove || isReject || isView) ? (
                        <>
                            {/* Student Info Card */}
                            <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-700/20 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                        {request.student_name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{request.student_name}</p>
                                        <p className="text-xs text-gray-500">{request.student_id}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <p className="text-gray-400 font-bold uppercase mb-1">Target Level</p>
                                        <p className="font-bold text-blue-600 dark:text-blue-400">{request.requested_subprogram_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 font-bold uppercase mb-1">Requested On</p>
                                        <p className="font-bold">{new Date(request.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            {isView && (
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Student's Reason</p>
                                    <div className={`p-4 rounded-xl border italic text-sm ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                        {request.description || "No description provided."}
                                    </div>
                                </div>
                            )}

                            {isApprove && (
                                <div className="space-y-4">
                                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                                        <p className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-bold mb-1">Assign to Class</p>
                                        <p className="text-sm font-bold text-blue-800 dark:text-blue-300">
                                            Please select the final class placement for the student.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">1. Confirm Level</label>
                                        <select
                                            value={selectedSubprogram}
                                            onChange={(e) => setSelectedSubprogram(e.target.value)}
                                            className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                                        >
                                            <option value="">Select Level</option>
                                            {subprograms.map(sub => (
                                                <option key={sub.id} value={sub.id}>{sub.subprogram_name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">2. Final Class Placement</label>
                                        <select
                                            value={selectedClass}
                                            onChange={(e) => setSelectedClass(e.target.value)}
                                            disabled={!selectedSubprogram || isLoadingClasses}
                                            className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} disabled:opacity-50`}
                                        >
                                            <option value="">{isLoadingClasses ? "Loading classes..." : "Select a class"}</option>
                                            {classes.map(cls => (
                                                <option key={cls.id} value={cls.id}>{cls.class_name}</option>
                                            ))}
                                        </select>
                                        {!isLoadingClasses && selectedSubprogram && classes.length === 0 && (
                                            <p className="text-[10px] text-red-500 mt-1 font-medium italic">No active classes found for this level.</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Academy Note (Optional)</label>
                                        <textarea
                                            value={adminNote}
                                            onChange={(e) => setAdminNote(e.target.value)}
                                            placeholder="Feedback for the student..."
                                            rows={2}
                                            className={`w-full px-4 py-3 border-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                                        />
                                    </div>
                                </div>
                            )}

                            {isReject && (
                                <div className="space-y-4">
                                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 flex gap-3">
                                        <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        <div>
                                            <p className="text-sm font-semibold text-red-800 dark:text-red-400">Note Required</p>
                                            <p className="text-xs text-red-700 dark:text-red-300/80">Please explain to the student why this request is being denied.</p>
                                        </div>
                                    </div>
                                    <textarea
                                        value={adminNote}
                                        onChange={(e) => setAdminNote(e.target.value)}
                                        placeholder="Enter rejection reason..."
                                        rows={4}
                                        className={`w-full px-4 py-3 border-2 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                                        required
                                    />
                                </div>
                            )}

                            {isView && request.status !== 'pending' && (
                                <div className="pt-2">
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Admin Response</p>
                                    <div className={`p-4 rounded-xl border text-sm ${isDark ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-green-50 border-green-100 text-green-800'}`}>
                                        {request.admin_response || "No response provided."}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : null}
                </div>

                <div className={`p-6 flex justify-end gap-3 border-t ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'}`}>
                    {isChoose ? (
                        <>
                            <button
                                onClick={() => { setAdminNote(""); setModalType('reject'); }}
                                className="flex-1 px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-95">
                                Reject
                            </button>
                            <button onClick={() => { setAdminNote(""); setModalType('approve'); }}
                                className="flex-1 px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                                Approve
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={onClose} className={`px-5 py-2.5 text-sm font-bold border-2 rounded-xl transition-all ${isDark ? 'hover:bg-gray-700 text-gray-300 border-gray-600' : 'hover:bg-gray-100 text-gray-700 border-gray-300'}`}>
                                {isView ? 'Close' : 'Cancel'}
                            </button>
                            {(isApprove || isReject) && (
                                <button
                                    disabled={isUpdating || (isReject && !adminNote) || (isApprove && !selectedClass)}
                                    onClick={onConfirm}
                                    className={`px-8 py-2.5 text-sm font-bold text-white rounded-xl transition-all shadow-lg active:scale-[0.98] ${isApprove ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20' : 'bg-red-600 hover:bg-red-700 shadow-red-500/20'} disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {isUpdating ? 'Saving...' : (isApprove ? 'Assign & Approve' : 'Confirm Rejection')}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
