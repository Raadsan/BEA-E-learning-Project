"use client";

export default function ClassForm({
    isOpen,
    onClose,
    editingClass,
    formData,
    handleInputChange,
    handleSubmit,
    isDark,
    isCreating,
    isUpdating,
    programs,
    filteredSubprograms,
    teachers
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
            <div
                className="absolute inset-0 backdrop-blur-sm"
                onClick={onClose}
            />

            <div
                className={`relative rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`sticky top-0 z-10 border-b px-6 py-5 flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-[#010080]'}`}>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        {editingClass ? "Update Class Details" : "Create New Class"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-[#010080] transition-colors p-1 border-2 border-gray-100 rounded-md hover:border-[#010080]/20"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={`p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-80px)] ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="program_id" className="block text-sm font-semibold mb-2 text-gray-700">
                                Program <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="program_id"
                                name="program_id"
                                value={formData.program_id}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-[#f0f7ff] text-gray-900 transition-all font-medium placeholder:text-gray-400"
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
                            <label htmlFor="subprogram_id" className="block text-sm font-semibold mb-2 text-gray-700">
                                Subprogram <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="subprogram_id"
                                name="subprogram_id"
                                value={formData.subprogram_id}
                                onChange={handleInputChange}
                                disabled={!formData.program_id}
                                className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-[#f0f7ff] text-gray-900 transition-all font-medium ${!formData.program_id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <option value="">Select Subprogram</option>
                                {filteredSubprograms.map((sub) => (
                                    <option key={sub.id} value={sub.id}>
                                        {sub.subprogram_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="teacher_id" className="block text-sm font-semibold mb-2 text-gray-700">
                                Assign Teacher
                            </label>
                            <select
                                id="teacher_id"
                                name="teacher_id"
                                value={formData.teacher_id}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-[#f0f7ff] text-gray-900 transition-all font-medium placeholder:text-gray-400"
                            >
                                <option value="">Select Teacher (Optional)</option>
                                {teachers.map((teacher) => (
                                    <option key={teacher.id} value={teacher.id}>
                                        {teacher.full_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="type" className="block text-sm font-semibold mb-2 text-gray-700">
                                Class Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-[#f0f7ff] text-gray-900 transition-all font-medium placeholder:text-gray-400"
                            >
                                <option value="morning">Morning</option>
                                <option value="afternoon">Afternoon</option>
                                <option value="night">Night</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="class_name" className="block text-sm font-semibold mb-2 text-gray-700">
                                Class Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="class_name"
                                name="class_name"
                                value={formData.class_name}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter class name"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-[#f0f7ff] text-gray-900 transition-all font-medium placeholder:text-gray-400"
                            />
                        </div>
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
                            placeholder="Enter class description"
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-[#f0f7ff] text-gray-900 transition-all font-medium placeholder:text-gray-400"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
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
                            className="px-8 py-2.5 bg-[#2563eb] text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50"
                        >
                            {isCreating || isUpdating ? "Processing..." : editingClass ? "Save Changes" : "Create Class"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
