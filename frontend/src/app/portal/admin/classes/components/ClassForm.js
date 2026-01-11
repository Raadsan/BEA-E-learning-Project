"use client";

import React, { useState, useEffect, useMemo } from "react";

export default function ClassForm({
    isOpen,
    onClose,
    editingClass,
    formData,
    handleInputChange,
    handleSubmit,
    isDark,
    isCreating,
    isUpdating,
    programs,
    filteredSubprograms,
    teachers,
    shifts
}) {
    if (!isOpen) return null;

    // Group shifts by name to allow side-by-side selection if needed, 
    // but the user asked for "side by side shift and session dropdowns". 
    // In our DB, one Shift record has both name and session.
    // I will show two dropdowns: one for Shift Name, and then filter the Sessions.

    const [selectedShiftName, setSelectedShiftName] = useState("");

    // Initialize selectedShiftName when editing or when shifts load
    useEffect(() => {
        if (formData.shift_id && shifts.length > 0) {
            const currentShift = shifts.find(s => s.id == formData.shift_id);
            if (currentShift) {
                setSelectedShiftName(currentShift.shift_name);
            }
        } else if (!formData.shift_id) {
            setSelectedShiftName("");
        }
    }, [formData.shift_id, shifts]);

    const uniqueShiftNames = useMemo(() => {
        const names = shifts.map(s => s.shift_name);
        return [...new Set(names)];
    }, [shifts]);

    const handleShiftNameChange = (e) => {
        const name = e.target.value;
        setSelectedShiftName(name);
        // When shift name changes, clear the specific shift_id (session)
        handleInputChange({ target: { name: "shift_id", value: "" } });
    };

    const sessionsForSelectedName = useMemo(() => {
        if (!selectedShiftName) return [];
        return shifts.filter(s => s.shift_name === selectedShiftName);
    }, [shifts, selectedShiftName]);

    const selectedShiftDetails = useMemo(() => {
        if (!formData.shift_id) return null;
        return shifts.find(s => s.id == formData.shift_id);
    }, [shifts, formData.shift_id]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
            <div
                className="absolute inset-0 backdrop-blur-sm"
                onClick={onClose}
            />

            <div
                className={`relative rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Simplified Header - No blue background */}
                <div className={`sticky top-0 z-10 border-b px-6 py-5 flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        {editingClass ? "Update Class Details" : "Create New Class"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={`p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-80px)] ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Program Selection */}
                        <div>
                            <label htmlFor="program_id" className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Program <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="program_id"
                                name="program_id"
                                value={formData.program_id}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-[#f0f7ff] border-gray-200 text-gray-900'
                                    }`}
                            >
                                <option value="">Select Program</option>
                                {programs.map((program) => (
                                    <option key={program.id} value={program.id}>
                                        {program.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Subprogram Selection */}
                        <div>
                            <label htmlFor="subprogram_id" className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Subprogram <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="subprogram_id"
                                name="subprogram_id"
                                value={formData.subprogram_id}
                                onChange={handleInputChange}
                                disabled={!formData.program_id}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium ${!formData.program_id ? 'opacity-50 cursor-not-allowed' : ''
                                    } ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-[#f0f7ff] border-gray-200 text-gray-900'}`}
                            >
                                <option value="">Select Subprogram</option>
                                {filteredSubprograms.map((sub) => (
                                    <option key={sub.id} value={sub.id}>
                                        {sub.subprogram_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Side-by-Side Shift and Session */}
                        <div>
                            <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Class Shift <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedShiftName}
                                onChange={handleShiftNameChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-[#f0f7ff] border-gray-200 text-gray-900'
                                    }`}
                            >
                                <option value="">Select Shift</option>
                                {uniqueShiftNames.map(name => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Session <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="shift_id"
                                value={formData.shift_id}
                                onChange={handleInputChange}
                                disabled={!selectedShiftName}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium ${!selectedShiftName ? 'opacity-50 cursor-not-allowed' : ''
                                    } ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-[#f0f7ff] border-gray-200 text-gray-900'}`}
                            >
                                <option value="">Select Session</option>
                                {sessionsForSelectedName.map(s => (
                                    <option key={s.id} value={s.id}>{s.session_type}</option>
                                ))}
                            </select>
                        </div>

                        {selectedShiftDetails && (
                            <div className="md:col-span-2">
                                <div className={`flex items-center gap-4 px-4 py-3 rounded-lg border ${isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-100'}`}>
                                    <div className="flex-1 flex items-center justify-around text-center">
                                        <div>
                                            <p className={`text-[10px] uppercase tracking-wider font-bold mb-0.5 ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>Shift Name</p>
                                            <p className={`font-bold ${isDark ? 'text-white' : 'text-blue-900'}`}>{selectedShiftDetails.shift_name}</p>
                                        </div>
                                        <div className={`w-px h-8 ${isDark ? 'bg-blue-500/20' : 'bg-blue-200'}`} />
                                        <div>
                                            <p className={`text-[10px] uppercase tracking-wider font-bold mb-0.5 ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>Session</p>
                                            <p className={`font-bold ${isDark ? 'text-white' : 'text-blue-900'}`}>{selectedShiftDetails.session_type}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Full-width Teacher Assignment */}
                        <div className="md:col-span-2">
                            <label htmlFor="teacher_id" className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Assign Teacher
                            </label>
                            <select
                                id="teacher_id"
                                name="teacher_id"
                                value={formData.teacher_id}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-[#f0f7ff] border-gray-200 text-gray-900'
                                    }`}
                            >
                                <option value="">Select Teacher (Optional)</option>
                                {teachers.map((teacher) => (
                                    <option key={teacher.id} value={teacher.id}>
                                        {teacher.full_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Class Name */}
                        <div className="md:col-span-2">
                            <label htmlFor="class_name" className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Class Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="class_name"
                                name="class_name"
                                value={formData.class_name}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter class name"
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500' : 'bg-[#f0f7ff] border-gray-200 text-gray-900 placeholder:text-gray-400'
                                    }`}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Enter class description"
                            rows={3}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium resize-none ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500' : 'bg-[#f0f7ff] border-gray-200 text-gray-900 placeholder:text-gray-400'
                                }`}
                        />
                    </div>

                    {/* Footer Actions */}
                    <div className={`flex justify-end gap-3 pt-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-6 py-2.5 border rounded-xl font-semibold transition-all hover:bg-gray-50 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-white border-gray-200 text-gray-600'
                                }`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isCreating || isUpdating}
                            className="px-8 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-500/10 active:scale-95 disabled:opacity-50"
                        >
                            {isCreating || isUpdating ? "Processing..." : editingClass ? "Save Changes" : "Create Class"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
