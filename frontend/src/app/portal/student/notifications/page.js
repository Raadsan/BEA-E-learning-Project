"use client";

import { useState } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetNotificationsQuery, useMarkAsReadMutation } from "@/redux/api/notificationApi";
import Image from "next/image";

export default function StudentNotificationsPage() {
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
    <div className={`min-h-[calc(100vh-80px)] transition-colors w-full px-8 py-6 pb-20 ${bg}`}>
      <div className="w-full">
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
          <div className={`text-center py-12 rounded-xl ${cardBg} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <svg className={`w-12 h-12 mx-auto mb-4 ${textSub}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.032 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
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
                  {/* Icon/Avatar Placeholder */}
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${notification.type === 'session_change_response' ? 'bg-blue-600' :
                        notification.type === 'freezing_response' ? 'bg-amber-500' : 'bg-purple-600'}`}>
                      {notification.type === 'session_change_response' || notification.type === 'freezing_response' ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.032 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      ) : (
                        (notification.title || "A").charAt(0).toUpperCase()
                      )}
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`font-semibold text-base truncate ${textMain}`}>
                        Academy System
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

      {/* Detail Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeModal}>
          <div
            className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${modalBg} transform transition-all border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
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
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl ${selectedNotification.type === 'session_change_response' ? 'bg-blue-600' :
                      selectedNotification.type === 'freezing_response' ? 'bg-amber-500' : 'bg-purple-600'}`}>
                    {selectedNotification.type === 'session_change_response' || selectedNotification.type === 'freezing_response' ? (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.032 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    ) : (
                      (selectedNotification.title || "A").charAt(0).toUpperCase()
                    )}
                  </div>
                </div>
                <div>
                  <h4 className={`text-lg font-semibold ${textMain}`}>{selectedNotification.title}</h4>
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

                      const renderField = (label, value, key) => (
                        <div key={key} className={`p-3 rounded-lg border ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'}`}>
                          <span className={`text-xs font-medium uppercase block mb-1 ${textSub}`}>{label}</span>
                          <span className={`font-semibold ${textMain}`}>{value}</span>
                        </div>
                      );

                      return (
                        <>
                          {metadata.status && renderField("Status", metadata.status.toUpperCase(), "status")}
                          {metadata.requestId && renderField("Request ID", `#${metadata.requestId}`, "reqId")}
                          {metadata.startDate && renderField("Start Date", metadata.startDate, "start")}
                          {metadata.endDate && renderField("End Date", metadata.endDate, "end")}
                          {metadata.adminResponse && <div className="col-span-2">{renderField("Academy Note", metadata.adminResponse, "note")}</div>}
                        </>
                      );
                    } catch (e) {
                      return null;
                    }
                  })()}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className={`px-6 py-4 border-t flex justify-end ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
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
