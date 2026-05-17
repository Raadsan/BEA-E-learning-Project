"use client";

export default function AdminConfirmationModal({
    isOpen,
    onClose,
    title,
    message,
    onConfirm,
    isLoading,
    isDark
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50">
            <div
                className="absolute inset-0 backdrop-blur-sm"
                onClick={() => !isLoading && onClose()}
            />
            <div className={`relative w-full max-w-md rounded-xl shadow-2xl overflow-hidden border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50/50 border-gray-200'}`}>
                    <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {title}
                    </h3>
                    <button
                        onClick={() => !isLoading && onClose()}
                        className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                        disabled={isLoading}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    <p className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {message}
                    </p>

                    <div className="flex justify-end gap-3 mt-8">
                        <button
                            onClick={onClose}
                            className={`px-4 py-2 rounded-lg border font-medium transition-colors ${isDark
                                ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center px-6"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </>
                            ) : "Confirm"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
