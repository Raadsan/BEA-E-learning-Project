"use client";

import { useEffect, useState } from "react";

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
    subprograms = [],
    selectedClassId,
    setSelectedClassId
}) {
    const [selectedSubprogramId, setSelectedSubprogramId] = useState("");

    useEffect(() => {
        if (!isOpen || !student) return;

        const chosen = student.chosen_subprogram?.toString() || "";
        const matchedSubprogram = subprograms.find(
            (sp) => String(sp.id) === chosen || sp.subprogram_name === chosen
        );

        setSelectedSubprogramId(matchedSubprogram ? String(matchedSubprogram.id) : "");
        setSelectedClassId?.("");
    }, [isOpen, student?.id, student?.chosen_subprogram, setSelectedClassId]);

    if (!isOpen || !student) return null;

    const classesForSubprogram = selectedSubprogramId
        ? classes.filter((cls) => String(cls.subprogram_id) === String(selectedSubprogramId))
        : classes;

    const selectClass = (e) => {
        setSelectedClassId(e.target.value);
    };

    const selectSubprogram = (e) => {
        setSelectedSubprogramId(e.target.value);
        setSelectedClassId("");
    };

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

                    {onApprove && setSelectedClassId && (
                        <div className="mb-6 space-y-4">
                            {student.chosen_program && (
                                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Program: <span className={`font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{student.chosen_program}</span>
                                </p>
                            )}

                            <div className="space-y-2">
                                <label className={`block text-xs font-bold uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Select Subprogram (Optional)
                                </label>
                                {subprograms.length === 0 ? (
                                    <p className={`text-sm px-3 py-2 rounded-lg border ${isDark ? 'bg-amber-900/20 border-amber-700 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                                        No subprograms available for this program.
                                    </p>
                                ) : (
                                    <select
                                        value={selectedSubprogramId}
                                        onChange={selectSubprogram}
                                        className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                    >
                                        <option value="">No Subprogram</option>
                                        {subprograms.map((sp) => (
                                            <option key={sp.id} value={sp.id}>{sp.subprogram_name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {selectedSubprogramId && (
                                <div className="space-y-2">
                                    <label className={`block text-xs font-bold uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Assign to Class (Optional)
                                    </label>
                                    {classesForSubprogram.length === 0 ? (
                                        <p className={`text-sm px-3 py-2 rounded-lg border ${isDark ? 'bg-amber-900/20 border-amber-700 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                                            No classes available for this subprogram.
                                        </p>
                                    ) : (
                                        <select
                                            value={selectedClassId || ""}
                                            onChange={selectClass}
                                            className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                        >
                                            <option value="">No Class Assigned</option>
                                            {classesForSubprogram.map((cls) => (
                                                <option key={cls.id} value={cls.id}>{cls.class_name}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            )}

                            {!selectedSubprogramId && classesForSubprogram.length > 0 && (
                                <div className="space-y-2">
                                    <label className={`block text-xs font-bold uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Assign to Class (Optional)
                                    </label>
                                    <select
                                        value={selectedClassId || ""}
                                        onChange={selectClass}
                                        className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                    >
                                        <option value="">No Class Assigned</option>
                                        {classesForSubprogram.map((cls) => (
                                            <option key={cls.id} value={cls.id}>{cls.class_name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
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
