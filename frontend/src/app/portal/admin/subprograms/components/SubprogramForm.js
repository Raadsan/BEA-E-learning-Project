"use client";

export default function SubprogramForm({
    isOpen,
    onClose,
    editingSubprogram,
    formData,
    handleInputChange,
    handleSubmit,
    isDark,
    programs,
    isCreating,
    isUpdating
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className={`relative w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden border-2 transition-all ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className={`sticky top-0 z-10 px-6 py-4 border-b flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {editingSubprogram ? "Edit Subprogram" : "Add New Subprogram"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-[#010080] transition-colors p-1 border-2 border-gray-100 rounded-md hover:border-[#010080]/20"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="subprogram_name" className="block text-sm font-semibold mb-2 text-gray-700">
                            Subprogram Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="subprogram_name"
                            name="subprogram_name"
                            value={formData.subprogram_name}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter subprogram name"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-[#f0f7ff] text-gray-900 transition-all font-medium placeholder:text-gray-400"
                        />
                    </div>

                    <div>
                        <label htmlFor="program_id" className="block text-sm font-semibold mb-2 text-gray-700">
                            Program <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="program_id"
                            name="program_id"
                            value={formData.program_id}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-[#f0f7ff] text-gray-900 transition-all font-medium"
                        >
                            <option value="">Select Program</option>
                            {programs.map((program) => (
                                <option key={program.id} value={program.id}>
                                    {program.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-semibold mb-2 text-gray-700">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={4}
                            placeholder="Enter subprogram description"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-[#f0f7ff] text-gray-900 transition-all font-medium resize-none placeholder:text-gray-400"
                        />
                    </div>

                    <div>
                        <label htmlFor="status" className="block text-sm font-semibold mb-2 text-gray-700">
                            Status <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-[#f0f7ff] text-gray-900 transition-all font-medium"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 border border-gray-200 rounded-xl font-semibold transition-all hover:bg-gray-50 text-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isCreating || isUpdating}
                            className="px-8 py-2.5 bg-[#2563eb] text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-500/10 active:scale-95 disabled:opacity-50"
                        >
                            {isCreating || isUpdating ? "Processing..." : editingSubprogram ? "Save Changes" : "Add Subprogram"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
