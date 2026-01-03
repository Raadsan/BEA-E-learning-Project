"use client";

export default function AssignSubprogramModal({
    isOpen,
    onClose,
    assigningStudent,
    programs,
    allSubprograms,
    handleSubmit,
    isUpdating,
    isDark
}) {
    if (!isOpen || !assigningStudent) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                aria-hidden="true"
                onClick={onClose}
            />

            <div
                className={`relative rounded-xl shadow-2xl w-full max-w-lg overflow-y-auto border-2 ${isDark
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-100"
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className={`sticky top-0 z-10 border-b px-6 py-4 flex items-center justify-between ${isDark
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                        }`}
                >
                    <h2
                        className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"
                            }`}
                    >
                        Assign to Class
                    </h2>
                    <button
                        onClick={onClose}
                        className={`transition-colors ${isDark
                            ? "text-gray-400 hover:text-gray-200"
                            : "text-gray-400 hover:text-gray-600"
                            }`}
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="p-6 space-y-4"
                >
                    {/* Student Info Section */}
                    <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-blue-50/50 border-blue-200'}`}>
                        <div className="space-y-2">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Student ID</p>
                                    <p className={`font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{assigningStudent.student_id || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Full Name</p>
                                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{assigningStudent.full_name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Email:</span>
                                <span className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{assigningStudent.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Program:</span>
                                <span className={`text-base font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{assigningStudent.chosen_program || 'Not assigned'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Subprogram Selection */}
                    {assigningStudent.chosen_program ? (
                        <div>
                            <label
                                htmlFor="subprogram_name"
                                className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"
                                    }`}
                            >
                                Select Subprogram
                            </label>
                            {(() => {
                                const program = programs.find(
                                    (p) => p.title === assigningStudent.chosen_program
                                );
                                const programSubprograms = program
                                    ? allSubprograms.filter((sp) => sp.program_id === program.id)
                                    : [];

                                if (programSubprograms.length === 0) {
                                    return (
                                        <p
                                            className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"
                                                }`}
                                        >
                                            No subprograms available for this program.
                                        </p>
                                    );
                                }

                                return (
                                    <select
                                        id="subprogram_name"
                                        name="subprogram_name"
                                        defaultValue={assigningStudent.chosen_subprogram || ""}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark
                                            ? "bg-gray-700 border-gray-600 text-white"
                                            : "border-gray-300"
                                            }`}
                                        required
                                    >
                                        <option value="">Select a subprogram</option>
                                        {programSubprograms.map((sp) => (
                                            <option key={sp.id} value={sp.subprogram_name}>
                                                {sp.subprogram_name}
                                            </option>
                                        ))}
                                    </select>
                                );
                            })()}
                        </div>
                    ) : (
                        <div
                            className={`p-4 rounded-lg ${isDark
                                ? "bg-yellow-900/20 border border-yellow-700"
                                : "bg-yellow-50 border border-yellow-200"
                                }`}
                        >
                            <p
                                className={`text-sm ${isDark ? "text-yellow-300" : "text-yellow-800"
                                    }`}
                            >
                                Please assign a program to this student first before
                                assigning a subprogram.
                            </p>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 border rounded-lg transition-colors ${isDark
                                ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                                : "border-gray-300 text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isUpdating || !assigningStudent.chosen_program}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUpdating ? "Assigning..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
