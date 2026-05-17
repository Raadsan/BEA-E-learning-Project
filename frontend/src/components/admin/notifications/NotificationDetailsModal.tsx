"use client";

import Image from "next/image";
import { API_BASE_URL } from "@/constants";

export default function NotificationDetailsModal({
    isOpen,
    onClose,
    notification,
    isDark,
    formatDate
}) {
    if (!isOpen || !notification) return null;

    const textMain = isDark ? "text-white" : "text-gray-900";
    const textSub = isDark ? "text-gray-400" : "text-gray-500";
    const modalBg = isDark ? "bg-gray-800" : "bg-white";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div
                className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${modalBg} transform transition-all scale-100 border-2 ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className={`sticky top-0 z-10 px-6 py-4 border-b flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <h3 className={`text-xl font-bold ${textMain}`}>Notification Details</h3>
                    <button onClick={onClose} className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${textSub}`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-shrink-0">
                            {notification.sender_image ? (
                                <Image
                                    src={`${API_BASE_URL}${notification.sender_image}`}
                                    alt={notification.sender_name || "User"}
                                    width={64}
                                    height={64}
                                    className="w-16 h-16 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                                    {(notification.sender_name || "S").charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div>
                            <h4 className={`text-lg font-semibold ${textMain}`}>{notification.sender_name}</h4>
                            <p className={`text-sm ${textSub}`}>{formatDate(notification.created_at)}</p>
                        </div>
                    </div>

                    <div className={`p-4 rounded-lg mb-6 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <h5 className={`text-sm font-semibold mb-2 uppercase tracking-wide ${textSub}`}>Message</h5>
                        <p className={`whitespace-pre-wrap ${textMain}`}>{notification.message}</p>
                    </div>

                    {/* Metadata Grid */}
                    {notification.metadata && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {(() => {
                                try {
                                    const metadata = typeof notification.metadata === 'string'
                                        ? JSON.parse(notification.metadata)
                                        : notification.metadata;

                                    // Helper to render a field if it exists
                                    const renderField = (label, value, key) => (
                                        <div key={key} className={`p-3 rounded-lg border ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'}`}>
                                            <span className={`text-xs font-medium uppercase block mb-1 ${textSub}`}>{label}</span>
                                            <span className={`font-semibold ${textMain}`}>{value}</span>
                                        </div>
                                    );

                                    return (
                                        <>
                                            {/* Custom Display for Session Change Fields */}
                                            {metadata.currentSession && renderField("Current Class", metadata.currentClassName || metadata.currentSession, "curr-shared")}
                                            {metadata.requestedSession && renderField("Requested Session", metadata.requestedClassName || metadata.requestedSession, "req-shared")}
                                            {metadata.reason && <div key="reason-container" className="col-span-2">{renderField("Reason", metadata.reason, "reason-field")}</div>}

                                            {/* Fallback for other fields which we haven't manually handled above */}
                                            {Object.entries(metadata).map(([key, value]) => {
                                                if (['currentSession', 'currentClassName', 'requestedSession', 'requestedClassName', 'reason', 'studentName', 'studentEmail', 'requestedClassId', 'from_admin', 'target_user_id'].includes(key)) return null;
                                                return renderField(key.replace(/([A-Z])/g, ' $1').trim(), value, key);
                                            })}
                                        </>
                                    );
                                } catch (e) {
                                    return <p className="text-red-500 text-sm">Error parsing details</p>;
                                }
                            })()}
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className={`px-6 py-4 border-t flex justify-end gap-3 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
