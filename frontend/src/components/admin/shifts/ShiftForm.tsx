"use client";

import React from "react";

const ShiftForm = ({
    isOpen,
    onClose,
    editingShift,
    formData,
    handleInputChange,
    handleSubmit,
    isDark,
    isCreating,
    isUpdating,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
            {/* Backdrop */}
            <div
                className="absolute inset-0 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={`relative rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border-2 transition-all transform ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header - Simplified, no background color */}
                <div className={`sticky top-0 z-10 border-b px-6 py-6 flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        {editingShift ? "Update Shift Details" : "Create New Shift"}
                    </h2>
                    <button
                        onClick={onClose}
                        className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'} transition-colors p-1`}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form - Increased padding and spacing for "add height" feel */}
                <form onSubmit={handleSubmit} className={`p-8 space-y-6 overflow-y-auto max-h-[calc(90vh-80px)] ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Shift Name Selection */}
                        <div>
                            <label htmlFor="shift_name" className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Shift Name <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="shift_name"
                                name="shift_name"
                                value={formData.shift_name}
                                onChange={handleInputChange}
                                required
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                                    }`}
                            >
                                <option value="">Select Shift</option>
                                <option value="Morning">Morning</option>
                                <option value="Afternoon">Afternoon</option>
                                <option value="Evening">Evening</option>
                            </select>
                        </div>

                        {/* Session Type Input */}
                        <div>
                            <label htmlFor="session_type" className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Session <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="session_type"
                                name="session_type"
                                value={formData.session_type}
                                onChange={handleInputChange}
                                required
                                placeholder="e.g. Session 1"
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
                                    }`}
                            />
                        </div>

                        {/* Start Time */}
                        <div>
                            <label htmlFor="start_time" className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Start Time <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                id="start_time"
                                name="start_time"
                                value={formData.start_time}
                                onChange={handleInputChange}
                                required
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                                    }`}
                            />
                        </div>

                        {/* End Time */}
                        <div>
                            <label htmlFor="end_time" className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                End Time <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                id="end_time"
                                name="end_time"
                                value={formData.end_time}
                                onChange={handleInputChange}
                                required
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                                    }`}
                            />
                        </div>
                    </div>

                    {/* Footer Actions - "Normal" buttons, no extra bold or shadow */}
                    <div className={`flex justify-end gap-3 pt-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 rounded-lg transition-colors border ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isCreating || isUpdating}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {isCreating || isUpdating ? "Processing..." : editingShift ? "Update Shift" : "Create Shift"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShiftForm;
