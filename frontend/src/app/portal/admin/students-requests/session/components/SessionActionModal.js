"use client";

import { useState, useEffect } from "react";

export default function SessionActionModal({
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
    classes = [],
    allStudents = [],
    subprograms = [],
    programs = [],
    shifts = [],
    selectedClassId,
    setSelectedClassId,
}) {
    const [selectedLevelId, setSelectedLevelId] = useState("");
    const [selectedShiftName, setSelectedShiftName] = useState("");
    const [selectedSessionType, setSelectedSessionType] = useState("");

    const studentDetail = allStudents.find(s => s.student_id === request?.student_id) || {};

    // Reset internal state when modal opens/type changes
    useEffect(() => {
        if (isOpen && modalType === 'choose') {
            setSelectedLevelId("");
            setSelectedShiftName("");
            setSelectedSessionType("");
            setSelectedClassId("");
            setAdminNote("");
        }
    }, [isOpen, modalType]);

    // Automatic Selection Logic when switching to Approve
    useEffect(() => {
        if (isOpen && modalType === 'approve' && request && classes.length > 0) {
            const studentProgramName = request.program_name || studentDetail.chosen_program;
            const targetSubName = request.subprogram_name || studentDetail.chosen_subprogram_name;
            const reqShift = request.requested_shift_name;
            const reqSess = request.requested_class_type || request.requested_session_type;

            // 1. Try to find an exact matching class
            const exactMatch = classes.find(c => {
                const programMatch = c.program_name === studentProgramName;
                const subprogramMatch = c.subprogram_name === targetSubName;
                const shiftMatch = c.shift_name?.toLowerCase() === reqShift?.toLowerCase();
                const sessionMatch = c.shift_session?.toLowerCase() === reqSess?.toLowerCase();
                return programMatch && subprogramMatch && shiftMatch && sessionMatch;
            });

            if (exactMatch) {
                setSelectedLevelId(exactMatch.subprogram_id?.toString() || "");
                setSelectedShiftName(exactMatch.shift_name || "");
                setSelectedSessionType(exactMatch.shift_session || "");
                setSelectedClassId(exactMatch.id?.toString() || "");
            } else {
                // 2. If no exact class match, at least try to match the Level/Shift/Session if they exist in the UI options
                const levelMatch = subprograms.find(l => l.subprogram_name === targetSubName);
                if (levelMatch) {
                    setSelectedLevelId(levelMatch.id.toString());

                    // Cascade: set Shift/Session if they are valid for this level
                    if (reqShift) setSelectedShiftName(reqShift);
                    if (reqSess) setSelectedSessionType(reqSess);
                }
            }
        }
    }, [isOpen, modalType, request, classes, studentDetail, subprograms]);

    if (!isOpen || !request) return null;

    const isChoose = modalType === 'choose';
    const isApprove = modalType === 'approve';
    const isReject = modalType === 'reject';
    const isView = modalType === 'view';

    // Cascading Filter Logic
    const studentProgramName = request.program_name || studentDetail.chosen_program;
    const studentProgram = programs.find(p => p.title === studentProgramName);

    const availableLevels = studentProgram ? subprograms.filter(sp => sp.program_id === studentProgram.id) : [];

    // Classes filtered by student program and selected level
    // We check program match either by title or subprogram relationship
    const shiftsForLevel = selectedLevelId ? classes.filter(cls => cls.subprogram_id == selectedLevelId) : [];
    const uniqueShiftNames = [...new Set(shiftsForLevel.map(cls => cls.shift_name))].filter(Boolean);

    const sessionsForShift = selectedShiftName ? shiftsForLevel.filter(cls => cls.shift_name === selectedShiftName) : [];
    const availableSessions = [...new Set(sessionsForShift.map(cls => cls.shift_session))].filter(Boolean);

    const filteredClasses = selectedSessionType ? sessionsForShift.filter(cls => cls.shift_session === selectedSessionType) : [];

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full ${isView ? 'max-w-2xl' : 'max-w-md'} rounded-2xl shadow-2xl overflow-hidden border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-900'}`} onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <h3 className="text-lg text-[#010080] dark:text-white">
                        {isChoose ? 'Session Change Request' : isView ? 'Student Details' : isApprove ? 'Assign to Class' : 'Reject Request'}
                    </h3>
                    <button onClick={onClose} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[75vh]">
                    {isChoose ? (
                        <div className="space-y-6 py-4">
                            <div className="text-center space-y-2">
                                <p className="text-[10px] text-blue-600 uppercase tracking-widest">Action Required</p>
                                <h4 className="text-xl">{request.student_name}</h4>
                                <p className="text-sm text-gray-400 px-4 leading-relaxed">This student needs a session change. Review the details below to approve or reject.</p>
                            </div>

                            <div className={`p-5 rounded-2xl border-2 border-dashed shadow-sm ${isDark ? 'bg-blue-900/10 border-blue-800' : 'bg-[#f7fafe] border-blue-100'}`}>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-blue-100 dark:border-blue-900/20 pb-2 mb-2">
                                        <span>Current Session</span>
                                        <span className="text-blue-600">Requested</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="text-left">
                                            <p className="text-xs text-gray-600 dark:text-gray-300">{request.current_shift_name || "N/A"}</p>
                                            <p className="text-[10px] text-gray-400">{request.current_session_type}</p>
                                        </div>
                                        <div className="text-blue-400">
                                            <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-blue-700 dark:text-blue-400">{request.requested_shift_name || "N/A"}</p>
                                            <p className="text-[10px] text-blue-500">{request.requested_class_type || request.requested_session_type}</p>
                                        </div>
                                    </div>
                                    {request.reason && (
                                        <div className="mt-4 pt-3 border-t border-blue-100/50 dark:border-blue-900/20">
                                            <p className="text-[10px] text-gray-400 uppercase mb-1">Reason</p>
                                            <p className="text-xs italic text-gray-600 dark:text-gray-400 leading-relaxed">"{request.reason}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : isApprove ? (
                        <div className="space-y-4">
                            <div className={`p-4 rounded-xl border ${isDark ? 'bg-blue-900/10 border-blue-800' : 'bg-blue-50/50 border-blue-100'}`}>
                                <p className="text-[10px] text-gray-500 uppercase mb-2">Requested Session</p>
                                <p className="text-sm text-blue-600">{request.requested_shift_name} - {request.requested_class_type}</p>
                            </div>

                            <div className="space-y-5 pt-2">
                                <div>
                                    <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-2">1. Select Class Type (Level)</label>
                                    <select value={selectedLevelId} onChange={(e) => { setSelectedLevelId(e.target.value); setSelectedShiftName(""); setSelectedSessionType(""); setSelectedClassId(""); }}
                                        className={`w-full px-4 py-2 text-sm border-2 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                                        <option value="">Select Level</option>
                                        {availableLevels.map(lvl => <option key={lvl.id} value={lvl.id}>{lvl.subprogram_name}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-2">2. Shift</label>
                                        <select value={selectedShiftName} disabled={!selectedLevelId} onChange={(e) => { setSelectedShiftName(e.target.value); setSelectedSessionType(""); setSelectedClassId(""); }}
                                            className={`w-full px-4 py-2 text-sm border-2 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 transition-all ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                                            <option value="">Select Shift</option>
                                            {uniqueShiftNames.map(name => <option key={name} value={name}>{name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-2">3. Session</label>
                                        <select value={selectedSessionType} disabled={!selectedShiftName} onChange={(e) => { setSelectedSessionType(e.target.value); setSelectedClassId(""); }}
                                            className={`w-full px-4 py-2 text-sm border-2 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 transition-all ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                                            <option value="">Select Session</option>
                                            {availableSessions.map(sess => <option key={sess} value={sess}>{sess}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-2">4. Final Class Placement</label>
                                    <select value={selectedClassId} disabled={!selectedSessionType} onChange={(e) => setSelectedClassId(e.target.value)}
                                        className={`w-full px-4 py-2.5 text-sm border-2 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-blue-400' : 'bg-white border-gray-200 text-blue-600'}`}>
                                        <option value="">Select a class</option>
                                        {filteredClasses.map(cls => <option key={cls.id} value={cls.id}>{cls.class_name}</option>)}
                                    </select>
                                    {filteredClasses.length === 0 && selectedSessionType && (
                                        <p className="text-[10px] text-red-500 mt-2 italic px-1">No active classes found for this selection.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : isReject ? (
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex gap-3">
                                <div className="text-red-500 pt-1">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                </div>
                                <div>
                                    <p className="text-xs text-red-600 uppercase tracking-wider">Note Required</p>
                                    <p className="text-xs text-red-800 leading-relaxed">Please provide a reason to the student why this request is being denied.</p>
                                </div>
                            </div>
                            <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="Enter rejection details here..." rows={5}
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`} />
                        </div>
                    ) : isView ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-5">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                    {request.student_name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="text-xl">{request.student_name}</h4>
                                    <p className="text-sm text-gray-500">{request.student_email}</p>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl border bg-gray-50 dark:bg-gray-800/50">
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-4">ENROLLMENT CONTEXT</p>
                                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                                    <div><p className="text-[10px] text-gray-400 uppercase">Program</p><p className="text-sm">{request.program_name || "-"}</p></div>
                                    <div><p className="text-[10px] text-gray-400 uppercase">Subprogram</p><p className="text-sm">{request.subprogram_name || "-"}</p></div>
                                    <div><p className="text-[10px] text-gray-400 uppercase">Current Session</p><p className="text-sm">{request.current_shift_name} - {request.current_session_type}</p></div>
                                    <div><p className="text-[10px] text-gray-400 uppercase font-sans">Requested Change</p><p className="text-sm text-blue-600">{request.requested_shift_name} - {request.requested_class_type}</p></div>
                                </div>
                            </div>

                            <div className="p-5 border border-dashed rounded-2xl bg-white dark:bg-gray-800/30">
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">Student Reason</p>
                                <p className="text-sm italic text-gray-700 dark:text-gray-300 leading-relaxed">"{request.reason || 'No specific reason provided'}"</p>
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className={`p-6 flex gap-3 border-t ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50/50 border-gray-100'}`}>
                    <button onClick={onClose} className={`px-6 py-2.5 text-sm rounded-xl border-2 transition-all ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-white shadow-sm'}`}>Cancel</button>
                    {isChoose && (
                        <>
                            <button onClick={() => setModalType('reject')} className="px-6 py-2.5 text-sm text-red-600 border-2 border-red-100 bg-red-50 rounded-xl hover:bg-red-100 transition-all ml-auto">Reject</button>
                            <button onClick={() => setModalType('approve')} className="px-6 py-2.5 text-sm text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all">Approve</button>
                        </>
                    )}
                    {(isApprove || isReject) && (
                        <button disabled={isUpdating || (isApprove && !selectedClassId) || (isReject && !adminNote)}
                            onClick={() => handleAction(isApprove ? 'approved' : 'rejected', isApprove ? selectedClassId : null)}
                            className={`flex-1 px-6 py-2.5 text-sm text-white rounded-xl shadow-lg transition-all active:scale-[0.98] ${isApprove ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20' : 'bg-red-600 hover:bg-red-700 shadow-red-500/20'} disabled:opacity-50`}>
                            {isUpdating ? 'Saving...' : isApprove ? 'Assign & Approve' : 'Confirm Rejection'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
