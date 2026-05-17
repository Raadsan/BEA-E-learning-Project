"use client";
import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success', duration = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <style jsx>{`
                @keyframes slideDown {
                    from {
                        transform: translateY(-100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                .animate-slide-down {
                    animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto relative min-w-[320px] max-w-md p-4 pr-6 rounded-xl shadow-xl border animate-slide-down flex items-center gap-3 ${toast.type === 'success'
                            ? 'bg-[#f0fdf4] border-[#dcfce7] text-[#166534]' :
                            toast.type === 'error'
                                ? 'bg-[#fef2f2] border-[#fee2e2] text-[#991b1b]' :
                                'bg-[#f8fafc] border-[#e2e8f0] text-[#1e293b]'
                            }`}
                    >
                        {/* Close button at top-left */}
                        <button
                            onClick={() => removeToast(toast.id)}
                            className={`absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center border shadow-sm transition-all hover:scale-110 ${toast.type === 'success' ? 'bg-white border-green-200 text-green-500 hover:bg-green-50' :
                                toast.type === 'error' ? 'bg-white border-red-200 text-red-500 hover:bg-red-50' :
                                    'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Icon */}
                        <div className={`flex-shrink-0 ${toast.type === 'success' ? 'text-green-500' :
                            toast.type === 'error' ? 'text-red-500' :
                                'text-blue-500'
                            }`}>
                            {toast.type === 'success' ? (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            ) : toast.type === 'error' ? (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0l-1 8a1 1 0 002 0l-1-8z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>

                        {/* Message */}
                        <p className="text-sm font-semibold">{toast.message}</p>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

// Export a simple Toast component for individual use
export const Toast = ({ message, type = 'success', onClose, duration }) => {
    return (
        <div className={`fixed top-4 right-4 z-[9999] min-w-[320px] max-w-md p-4 pr-6 rounded-xl shadow-xl border flex items-center gap-3 ${type === 'success'
            ? 'bg-[#f0fdf4] border-[#dcfce7] text-[#166534]' :
            type === 'error'
                ? 'bg-[#fef2f2] border-[#fee2e2] text-[#991b1b]' :
                'bg-[#f8fafc] border-[#e2e8f0] text-[#1e293b]'
            }`}>
            {/* Close button */}
            {onClose && (
                <button
                    onClick={onClose}
                    className={`absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center border shadow-sm ${type === 'success' ? 'bg-white border-green-200 text-green-500' :
                        type === 'error' ? 'bg-white border-red-200 text-red-500' :
                            'bg-white border-gray-200 text-gray-500'
                        }`}
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}

            {/* Icon */}
            <div className={`flex-shrink-0 ${type === 'success' ? 'text-green-500' :
                type === 'error' ? 'text-red-500' :
                    'text-blue-500'
                }`}>
                {type === 'success' ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                ) : type === 'error' ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0l-1 8a1 1 0 002 0l-1-8z" clipRule="evenodd" />
                    </svg>
                )}
            </div>

            {/* Message */}
            <p className="text-sm font-semibold">{message}</p>
        </div>
    );
};
