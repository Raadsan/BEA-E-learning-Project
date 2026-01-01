"use client";

import { useState } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetNotificationsQuery, useMarkAsReadMutation, useDeleteNotificationMutation } from "@/redux/api/notificationApi";
import Image from "next/image";

import AdminHeader from "@/components/AdminHeader";

export default function NotificationsPage() {
    const { isDark } = useDarkMode();
    const { data: notifications = [], isLoading } = useGetNotificationsQuery(undefined, { pollingInterval: 10000 });
    const [markAsRead] = useMarkAsReadMutation();

    // State for selected notification (Modal)
    const [selectedNotification, setSelectedNotification] = useState(null);

    const handleViewNotification = (notification) => {
        setSelectedNotification(notification);
        if (!notification.is_read) {
            markAsRead(notification.id);
        }
    };

    const closeModal = () => {
        setSelectedNotification(null);
    };



    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.round(diffMs / 60000);
        const diffHrs = Math.round(diffMs / 3600000);
        const diffDays = Math.round(diffMs / 86400000);

        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (diffMins < 1) return `Just now (${timeStr})`;
        if (diffMins < 60) return `${diffMins}m ago (${timeStr})`;
        if (diffHrs < 24) return `Today at ${timeStr}`;
        if (diffDays === 1) return `Yesterday at ${timeStr}`;
        if (diffDays < 7) return `${date.toLocaleDateString([], { weekday: 'short' })} at ${timeStr}`;

        return `${date.toLocaleDateString()} at ${timeStr}`;
    };

    const bg = isDark ? "bg-gray-900" : "bg-gray-50";
    const cardBg = isDark ? "bg-gray-800" : "bg-white";
    const textMain = isDark ? "text-white" : "text-gray-900";
    const textSub = isDark ? "text-gray-400" : "text-gray-500";
    const hoverBg = isDark ? "hover:bg-gray-700" : "hover:bg-gray-50";
    const modalBg = isDark ? "bg-gray-800" : "bg-white";

    return (
        <div className={`min-h-screen flex flex-col transition-colors ${bg}`}>
            <AdminHeader />

            <main className="flex-1 overflow-y-auto pt-20">
                <div className="w-full px-8 py-6">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className={`text-3xl font-bold ${textMain}`}>Notifications</h1>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                            {notifications.filter(n => !n.is_read).length} Unread
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center p-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className={`text-center py-12 rounded-xl ${cardBg} shadow-sm`}>
                            <svg className={`w-12 h-12 mx-auto mb-4 ${textSub}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <p className={`${textSub}`}>No notifications yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleViewNotification(notification)}
                                    className={`
                                        relative rounded-xl shadow-sm transition-all duration-200 cursor-pointer overflow-hidden border
                                        ${cardBg} ${hoverBg} 
                                        ${!notification.is_read ? (isDark ? 'border-l-4 border-l-blue-500 border-gray-700' : 'border-l-4 border-l-blue-500 border-gray-200') : (isDark ? 'border-gray-700' : 'border-gray-200')}
                                    `}
                                >
                                    <div className="flex items-center p-4 gap-4">
                                        {/* Avatar */}
                                        <div className="flex-shrink-0">
                                            {notification.sender_image ? (
                                                <Image
                                                    src={`http://localhost:5000${notification.sender_image}`}
                                                    alt={notification.sender_name || "User"}
                                                    width={48}
                                                    height={48}
                                                    className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                                    {(notification.sender_name || "S").charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>

                                        {/* Content Preview */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className={`font-semibold text-base truncate ${textMain}`}>
                                                    {notification.sender_name || "System"}
                                                    <span className={`ml-2 font-normal text-sm ${textSub}`}>
                                                        {notification.title}
                                                    </span>
                                                </h3>
                                                <span className={`text-xs whitespace-nowrap ${textSub}`}>
                                                    {formatDate(notification.created_at)}
                                                </span>
                                            </div>
                                            <p className={`truncate text-sm ${textSub} mt-0.5 pr-8`}>
                                                {notification.message}
                                            </p>
                                        </div>


                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Modal Overlay */}
            {selectedNotification && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeModal}>
                    <div
                        className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${modalBg} transform transition-all scale-100 border-2 ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className={`sticky top-0 z-10 px-6 py-4 border-b flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <h3 className={`text-xl font-bold ${textMain}`}>Notification Details</h3>
                            <button onClick={closeModal} className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${textSub}`}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex-shrink-0">
                                    {selectedNotification.sender_image ? (
                                        <Image
                                            src={`http://localhost:5000${selectedNotification.sender_image}`}
                                            alt={selectedNotification.sender_name || "User"}
                                            width={64}
                                            height={64}
                                            className="w-16 h-16 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                                            {(selectedNotification.sender_name || "S").charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className={`text-lg font-semibold ${textMain}`}>{selectedNotification.sender_name}</h4>
                                    <p className={`text-sm ${textSub}`}>{formatDate(selectedNotification.created_at)}</p>
                                </div>
                            </div>

                            <div className={`p-4 rounded-lg mb-6 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                <h5 className={`text-sm font-semibold mb-2 uppercase tracking-wide ${textSub}`}>Message</h5>
                                <p className={`whitespace-pre-wrap ${textMain}`}>{selectedNotification.message}</p>
                            </div>

                            {/* Metadata Grid */}
                            {selectedNotification.metadata && (
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    {(() => {
                                        try {
                                            const metadata = typeof selectedNotification.metadata === 'string'
                                                ? JSON.parse(selectedNotification.metadata)
                                                : selectedNotification.metadata;

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
                                                        if (['currentSession', 'currentClassName', 'requestedSession', 'requestedClassName', 'reason', 'studentName', 'studentEmail', 'requestedClassId'].includes(key)) return null;
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
                                onClick={closeModal}
                                className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
