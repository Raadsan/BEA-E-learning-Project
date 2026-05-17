"use client";

export default function AssignClassModal({
    isOpen,
    onClose,
    assigningStudent,
    selectedClassId,
    setSelectedClassId,
    handleSubmit,
    isUpdating,
    isUpdatingIelts,
    classes,
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
                        Assign Class to {assigningStudent.full_name}
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
                    {classes.length === 0 ? (
                        <div
                            className={`p-4 rounded-lg ${isDark
                                ? "bg-yellow-900/20 border border-yellow-700"
                                : "bg-yellow-50 border-yellow-200"
                                }`}
                        >
                            <p
                                className={`text-sm ${isDark ? "text-yellow-200" : "text-yellow-800"
                                    }`}
                            >
                                There are no classes available yet. Please create classes
                                first in the Class Management page.
                            </p>
                        </div>
                    ) : (
                        <div>
                            <label
                                htmlFor="class_id"
                                className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"
                                    }`}
                            >
                                Select Class
                            </label>
                            <select
                                id="class_id"
                                name="class_id"
                                value={selectedClassId}
                                onChange={(e) => setSelectedClassId(e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark
                                    ? "bg-gray-700 border-gray-600 text-white"
                                    : "border-gray-300"
                                    }`}
                                required
                            >
                                <option value="">Select a class</option>
                                {classes.map((cls) => (
                                    <option key={cls.id} value={cls.id}>
                                        {cls.class_name} — {cls.description || "No description"}
                                    </option>
                                ))}
                            </select>
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
                            disabled={isUpdating || isUpdatingIelts || classes.length === 0}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUpdating || isUpdatingIelts ? "Assigning..." : "Save Class"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
