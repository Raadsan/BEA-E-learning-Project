"use client";

import Image from "next/image";
import { useGetSubprogramsByProgramIdQuery } from "@/redux/api/subprogramApi";

export default function ViewProgramModal({ program, onClose, isDark }) {
    const { data: subprograms, isLoading, isError } = useGetSubprogramsByProgramIdQuery(program?.id, {
        skip: !program?.id
    });

    if (!program) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            <div
                className={`relative rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`sticky top-0 z-10 border-b px-6 py-4 flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                    <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'
                        }`}>
                        Program Details: {program.title}
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

                <div className="p-6 space-y-6">
                    {/* Program Information */}
                    <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-blue-50/50 border-blue-200'
                        }`}>
                        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'
                            }`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Basic Information
                        </h3>
                        <div className="space-y-4">
                            <div className={`p-4 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Title</label>
                                <p className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {program.title}
                                </p>
                            </div>
                            <div className={`p-4 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Description</label>
                                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {program.description}
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Status</label>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${program.status === 'active'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                        }`}>
                                        {program.status}
                                    </span>
                                </div>
                                <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                    <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Pricing</label>
                                    <p className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        Price: ${parseFloat(program.price).toFixed(2)}
                                        {parseFloat(program.discount) > 0 && (
                                            <span className="ml-2 text-green-600 text-sm font-medium">
                                                (Discount: -${parseFloat(program.discount).toFixed(2)})
                                            </span>
                                        )}
                                        <span className="ml-2 text-blue-600">
                                            Total: ${(parseFloat(program.price) - parseFloat(program.discount)).toFixed(2)}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* Visuals */}
                        {(program.image || program.video) && (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {program.image && (
                                    <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                        <label className={`block text-xs font-semibold mb-2 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                                            }`}>Image</label>
                                        <div className="relative h-48 w-full rounded overflow-hidden">
                                            <Image src={program.image} alt={program.title} fill className="object-cover" />
                                        </div>
                                    </div>
                                )}
                                {program.video && (
                                    <div className={`p-3 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                        <label className={`block text-xs font-semibold mb-2 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'
                                            }`}>Video</label>
                                        <video src={program.video} controls className="w-full h-48 object-cover rounded" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Subprograms Section */}
                    <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-purple-50/50 border-purple-200'
                        }`}>
                        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'
                            }`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            Associated Subprograms
                        </h3>
                        {isLoading ? (
                            <div className="text-center py-8">
                                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading subprograms...</p>
                            </div>
                        ) : isError ? (
                            <div className="text-center py-8">
                                <p className="text-red-600 dark:text-red-400">Error loading subprograms</p>
                            </div>
                        ) : !subprograms || subprograms.length === 0 ? (
                            <div className={`p-6 text-center rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No subprograms found for this program.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {subprograms.map((subprogram) => (
                                    <div
                                        key={subprogram.id}
                                        className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800/50 border-gray-600' : 'bg-white border-gray-200'
                                            } hover:shadow-md transition-shadow`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {subprogram.subprogram_name}
                                            </h4>
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${subprogram.status === 'active'
                                                ? isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'
                                                : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {subprogram.status}
                                            </span>
                                        </div>
                                        <p className={`text-sm line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {subprogram.description || 'No description available'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
