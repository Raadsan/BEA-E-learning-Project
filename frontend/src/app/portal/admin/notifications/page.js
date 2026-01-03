"use client";

import { useState } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetNotificationsQuery, useMarkAsReadMutation } from "@/redux/api/notificationApi";
import Image from "next/image";
import AdminHeader from "@/components/AdminHeader";
import NotificationDetailsModal from "./components/NotificationDetailsModal";

export default function NotificationsPage() {
    const { isDark } = useDarkMode();
    const { data: notifications = [], isLoading } = useGetNotificationsQuery(undefined, { pollingInterval: 10000 });
    const [markAsRead] = useMarkAsReadMutation();

    const [selectedNotification, setSelectedNotification] = useState(null);

    const handleViewNotification = (notification) => {
        setSelectedNotification(notification);
        if (!notification.is_read) markAsRead(notification.id);
    };

    const closeModal = () => setSelectedNotification(null);

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

    const textMain = isDark ? "text-white" : "text-gray-900";
    const textSub = isDark ? "text-gray-400" : "text-gray-500";
    const bg = isDark ? "bg-gray-900" : "bg-gray-50";

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
                        <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
                    ) : notifications.length === 0 ? (
                        <div className={`text-center py-12 rounded-xl shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                            <svg className={`w-12 h-12 mx-auto mb-4 ${textSub}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                            <p className={`${textSub}`}>No notifications yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {notifications.map((notification) => (
                                <div key={notification.id} onClick={() => handleViewNotification(notification)} className={`relative rounded-xl shadow-sm transition-all duration-200 cursor-pointer overflow-hidden border ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} ${!notification.is_read ? 'border-l-4 border-l-blue-500' : ''} ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                    <div className="flex items-center p-4 gap-4">
                                        <div className="flex-shrink-0">
                                            {notification.sender_image ? (
                                                <Image src={`http://localhost:5000${notification.sender_image}`} alt={notification.sender_name || "User"} width={48} height={48} className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-600" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">{(notification.sender_name || "S").charAt(0).toUpperCase()}</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className={`font-semibold text-base truncate ${textMain}`}>{notification.sender_name || "System"} <span className={`ml-2 font-normal text-sm ${textSub}`}>{notification.title}</span></h3>
                                                <span className={`text-xs whitespace-nowrap ${textSub}`}>{formatDate(notification.created_at)}</span>
                                            </div>
                                            <p className={`truncate text-sm ${textSub} mt-0.5 pr-8`}>{notification.message}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <NotificationDetailsModal isOpen={!!selectedNotification} onClose={closeModal} notification={selectedNotification} isDark={isDark} formatDate={formatDate} />
        </div>
    );
}
