"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/Modal";

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
                const levelMatch = subprograms.find(l => l.subprogram_name === targetSubName);
                if (levelMatch) {
                    setSelectedLevelId(levelMatch.id.toString());
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

    const getTitle = () => {
        if (isChoose) return 'Session Change Request';
        if (isView) return 'Student Details';
        if (isApprove) return 'Assign to Class';
        if (isReject) return 'Reject Request';
        return '';
    };

    const studentProgramName = request.program_name || studentDetail.chosen_program;
    const studentProgram = programs.find(p => p.title === studentProgramName);
    const availableLevels = studentProgram ? subprograms.filter(sp => sp.program_id === studentProgram.id) : [];
    const shiftsForLevel = selectedLevelId ? classes.filter(cls => cls.subprogram_id == selectedLevelId) : [];
    const uniqueShiftNames = [...new Set(shiftsForLevel.map(cls => cls.shift_name))].filter(Boolean);
    const sessionsForShift = selectedShiftName ? shiftsForLevel.filter(cls => cls.shift_name === selectedShiftName) : [];
    const availableSessions = [...new Set(sessionsForShift.map(cls => cls.shift_session))].filter(Boolean);
    const filteredClasses = selectedSessionType ? sessionsForShift.filter(cls => cls.shift_session === selectedSessionType) : [];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={getTitle()}
            size={isView ? "lg" : "md"}
        >
            <div className={`space-y-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {isChoose ? (
                    <div className="space-y-5">
                        <div className={`p-5 rounded-xl border flex gap-4 ${isDark ? 'bg-blue-900/10 border-blue-900/30' : 'bg-[#eff6ff] border-[#dbeafe]'}`}>
                            <div className="text-blue-500 shrink-0">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <div className="space-y-1">
                                <h4 className={`font-bold ${isDark ? 'text-blue-400' : 'text-blue-900'}`}>{request.student_name}</h4>
                                <p className={`text-sm ${isDark ? 'text-blue-200/70' : 'text-blue-800'}`}>
                                    Requested change from <strong>{request.current_shift_name || "N/A"}</strong> to <strong>{request.requested_shift_name}</strong>.
                                </p>
                                {request.reason && (
                                    <p className={`text-xs italic mt-2 ${isDark ? 'text-blue-400/60' : 'text-blue-600'}`}>
                                        "{request.reason}"
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : isApprove ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className={`p-3 rounded-lg border bg-gray-50 dark:bg-gray-800/50 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Current Session</p>
                                <p className="text-sm font-medium">
                                    {request.current_shift_name || "N/A"} - {request.current_session_type}
                                </p>
                            </div>
                            <div className={`p-3 rounded-lg border bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800`}>
                                <p className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-bold mb-1">Requested Session</p>
                                <p className="text-sm font-bold text-blue-800 dark:text-blue-300">
                                    {request.requested_shift_name} - {request.requested_class_type}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-2">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">1. Select Class Type (Level)</label>
                                <select value={selectedLevelId} onChange={(e) => { setSelectedLevelId(e.target.value); setSelectedShiftName(""); setSelectedSessionType(""); setSelectedClassId(""); }}
                                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                                    <option value="">Select Level</option>
                                    {availableLevels.map(lvl => <option key={lvl.id} value={lvl.id}>{lvl.subprogram_name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">2. Shift</label>
                                    <select value={selectedShiftName} disabled={!selectedLevelId} onChange={(e) => { setSelectedShiftName(e.target.value); setSelectedSessionType(""); setSelectedClassId(""); }}
                                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                                        <option value="">Select Shift</option>
                                        {uniqueShiftNames.map(name => <option key={name} value={name}>{name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">3. Session</label>
                                    <select value={selectedSessionType} disabled={!selectedShiftName} onChange={(e) => { setSelectedSessionType(e.target.value); setSelectedClassId(""); }}
                                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                                        <option value="">Select Session</option>
                                        {availableSessions.map(sess => <option key={sess} value={sess}>{sess}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">4. Final Class Placement</label>
                                <select value={selectedClassId} disabled={!selectedSessionType} onChange={(e) => setSelectedClassId(e.target.value)}
                                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 ${isDark ? 'bg-gray-700 border-gray-600 font-medium' : 'bg-white border-gray-300 font-medium'}`}>
                                    <option value="">Select a class</option>
                                    {filteredClasses.map(cls => <option key={cls.id} value={cls.id}>{cls.class_name}</option>)}
                                </select>
                                {filteredClasses.length === 0 && selectedSessionType && (
                                    <p className="text-xs text-red-500 mt-1 italic">No active classes found for this selection.</p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : isReject ? (
                    <div className="space-y-4">
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 flex gap-3">
                            <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            <div>
                                <p className="text-sm font-semibold text-red-800 dark:text-red-400">Note Required</p>
                                <p className="text-xs text-red-700 dark:text-red-300/80">Please explain to the student why this request is being denied.</p>
                            </div>
                        </div>
                        <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="Enter rejection reason..." rows={4}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-red-500 outline-none ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`} />
                    </div>
                ) : isView ? (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                {request.student_name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold">{request.student_name}</h4>
                                <p className="text-sm text-gray-500">{request.student_email}</p>
                            </div>
                        </div>

                        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                            <div className="grid grid-cols-2 gap-4">
                                <div><p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Program</p><p className="text-sm font-medium">{request.program_name || "-"}</p></div>
                                <div><p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Level</p><p className="text-sm font-medium">{request.subprogram_name || "-"}</p></div>
                                <div><p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Current Session</p><p className="text-sm font-medium">{request.current_shift_name} - {request.current_session_type}</p></div>
                                <div><p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5 text-blue-500">Requested Change</p><p className="text-sm font-bold text-blue-600">{request.requested_shift_name} - {request.requested_class_type}</p></div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Student Reason</p>
                            <p className="text-sm italic text-gray-700 dark:text-gray-300 leading-relaxed p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                                "{request.reason || 'No specific reason provided'}"
                            </p>
                        </div>
                    </div>
                ) : null}

                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
                    {isChoose ? (
                        <>
                            <button onClick={() => setModalType('reject')} className="flex-1 px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all">
                                Reject
                            </button>
                            <button onClick={() => setModalType('approve')} className="flex-1 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all">
                                Approve
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={onClose} className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-[#f1f5f9] text-[#475569] hover:bg-gray-200'}`}>
                                Cancel
                            </button>
                            {(isApprove || isReject) && (
                                <button disabled={isUpdating || (isApprove && !selectedClassId) || (isReject && !adminNote)}
                                    onClick={() => handleAction(isApprove ? 'approved' : 'rejected', isApprove ? selectedClassId : null)}
                                    className={`px-8 py-2.5 text-sm font-medium text-white rounded-lg shadow-sm transition-all ${isApprove ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'} disabled:opacity-50`}>
                                    {isUpdating ? 'Saving...' : isApprove ? 'Assign & Approve' : 'Confirm Rejection'}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
}
