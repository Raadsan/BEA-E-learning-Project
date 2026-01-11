"use client";

import React from "react";

const ShiftConfirmationModal = ({
    isOpen,
    onClose,
    title,
    message,
    onConfirm,
    isLoading,
    confirmButtonColor = "red",
    isDark,
}) => {
    if (!isOpen) return null;

    const getButtonStyles = () => {
        switch (confirmButtonColor) {
            case "red":
                return "bg-red-600 hover:bg-red-700 shadow-red-200";
            case "blue":
                return "bg-blue-600 hover:bg-blue-700 shadow-blue-200";
            default:
                return "bg-gray-600 hover:bg-gray-700 shadow-gray-200";
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className={`relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden transform transition-all ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
                <div className="p-6 text-center">
                    <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 ${confirmButtonColor === 'red' ? 'bg-red-100' : 'bg-blue-100'}`}>
                        {confirmButtonColor === 'red' ? (
                            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        ) : (
                            <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </div>

                    <h3 className="text-xl font-bold mb-2">{title}</h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {message}
                    </p>
                </div>

                <div className={`px-6 py-4 flex flex-col gap-2 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`w-full py-3 rounded-xl text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${getButtonStyles()} disabled:opacity-50`}
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Processing...</span>
                            </>
                        ) : (
                            "Confirm"
                        )}
                    </button>
                    <button
                        onClick={onClose}
                        className={`w-full py-3 rounded-xl font-bold transition-all ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShiftConfirmationModal;
