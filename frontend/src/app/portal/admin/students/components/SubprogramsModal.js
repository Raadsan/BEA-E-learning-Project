"use client";

import { useGetSubprogramsQuery } from "@/redux/api/subprogramApi";

export default function SubprogramsModal({ program, onClose, isDark }) {
    const { data: allSubprograms, isLoading, isError } = useGetSubprogramsQuery();
    const subprograms = allSubprograms ? allSubprograms.filter(s => s.program_id === program.id) : [];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                aria-hidden="true"
                onClick={onClose}
            />

            <div
                className={`relative rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4 border-2 ${isDark ? 'bg-gray-800/95 border-gray-600' : 'bg-white/95 border-gray-300'
                    }`}
                onClick={(e) => e.stopPropagation()}
                style={{ pointerEvents: 'auto', backdropFilter: 'blur(2px)' }}
            >
                <div className={`sticky top-0 border-b px-6 py-4 flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                    <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'
                        }`}>
                        Subprograms for {program.name}
                    </h2>
                    <button
                        onClick={onClose}
                        className={`transition-colors ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-4 bg-gray-50">
                    {isLoading ? (
                        <div className="text-center py-8">
                            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading subprograms...</p>
                        </div>
                    ) : isError ? (
                        <div className="text-center py-8">
                            <p className="text-red-600 dark:text-red-400">Error loading subprograms</p>
                        </div>
                    ) : !subprograms || subprograms.length === 0 ? (
                        <div className="text-center py-8">
                            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No subprograms found for this program.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {subprograms.map((subprogram) => (
                                <div
                                    key={subprogram.id}
                                    className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                                        }`}
                                >
                                    <h3 className={`font-semibold text-lg mb-2 ${isDark ? 'text-white' : 'text-gray-900'
                                        }`}>
                                        {subprogram.subprogram_name}
                                    </h3>
                                    <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                        {subprogram.description || 'No description'}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${subprogram.status === 'active'
                                            ? isDark
                                                ? 'bg-green-900/30 text-green-300 border border-green-700'
                                                : 'bg-green-100 text-green-800'
                                            : isDark
                                                ? 'bg-gray-700 text-gray-400 border border-gray-600'
                                                : 'bg-gray-200 text-gray-600'
                                            }`}>
                                            {subprogram.status === 'active' ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
