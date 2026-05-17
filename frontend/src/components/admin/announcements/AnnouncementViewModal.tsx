"use client";

export default function AnnouncementViewModal({
    isOpen,
    onClose,
    announcement,
    isDark
}) {
    if (!isOpen || !announcement) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
            <div className="absolute inset-0 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full max-w-2xl p-6 rounded-lg shadow-xl ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`} onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold">{announcement.title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="space-y-4">
                    <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                        <p className="text-sm font-semibold mb-2 opacity-75 uppercase tracking-wide">Content</p>
                        <p className="whitespace-pre-wrap">{announcement.content}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/30' : 'bg-blue-50'}`}>
                            <p className="text-xs font-semibold opacity-75 uppercase">Target Audience</p>
                            <p className="font-medium">{announcement.target_audience}</p>
                        </div>
                        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/30' : 'bg-blue-50'}`}>
                            <p className="text-xs font-semibold opacity-75 uppercase">Status</p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${announcement.status === "Published"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                }`}>
                                {announcement.status}
                            </span>
                        </div>
                        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/30' : 'bg-blue-50'}`}>
                            <p className="text-xs font-semibold opacity-75 uppercase">Publish Date</p>
                            <p className="font-medium">{announcement.publish_date ? new Date(announcement.publish_date).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/30' : 'bg-blue-50'}`}>
                            <p className="text-xs font-semibold opacity-75 uppercase">Views</p>
                            <p className="font-medium">{announcement.views || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 rounded-lg transition-colors ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
