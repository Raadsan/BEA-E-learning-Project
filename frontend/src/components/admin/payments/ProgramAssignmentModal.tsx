"use client";

import Modal from "@/components/Modal";
import { useState } from "react";

export default function ProgramAssignmentModal({
    isOpen,
    onClose,
    selectedPackage,
    programs,
    handleAssign,
    handleRemove,
    isDark,
    isAssigning,
    closeOnClickOutside = true
}) {
    const [selectedProgramId, setSelectedProgramId] = useState("");

    if (!selectedPackage) return null;

    const assignedProgramIds = selectedPackage.programs?.map(p => p.id) || [];
    const availablePrograms = programs.filter(p => !assignedProgramIds.includes(p.id));

    const onAssignClick = () => {
        if (!selectedProgramId) return;
        handleAssign(selectedPackage.id, selectedProgramId);
        setSelectedProgramId("");
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Assign Programs to ${selectedPackage.package_name}`}
            size="lg"
            closeOnClickOutside={closeOnClickOutside}
        >
            <div className="space-y-6">
                {/* Assignment Form */}
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Select Program
                        </label>
                        <select
                            value={selectedProgramId}
                            onChange={(e) => setSelectedProgramId(e.target.value)}
                            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-[#010080] outline-none transition-all`}
                        >
                            <option value="">-- Choose a Program --</option>
                            {availablePrograms.map(program => (
                                <option key={program.id} value={program.id}>
                                    {program.title}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Currently Assigned Programs */}
                <div>
                    <h4 className={`text-md font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Currently Assigned Programs
                    </h4>
                    {selectedPackage.programs && selectedPackage.programs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {selectedPackage.programs.map(program => (
                                <div
                                    key={program.id}
                                    className={`flex items-center justify-between p-3 rounded-lg border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                                >
                                    <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                        {program.title}
                                    </span>
                                    <button
                                        onClick={() => handleRemove(selectedPackage.id, program.id)}
                                        className="text-red-500 hover:text-red-700 p-1 transition-colors"
                                        title="Remove Assignment"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} italic`}>
                            No programs assigned yet.
                        </p>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t dark:border-gray-700 border-gray-100">
                    <button
                        onClick={onClose}
                        className={`px-6 py-2 rounded-lg border ${isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-600 hover:bg-gray-50'} transition-all`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onAssignClick}
                        disabled={!selectedProgramId || isAssigning}
                        className="px-8 py-2 bg-[#010080] text-white rounded-lg hover:bg-blue-900 transition-all disabled:opacity-50 font-medium"
                    >
                        {isAssigning ? "Assigning..." : "Assign"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
