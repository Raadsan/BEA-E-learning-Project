"use client";

export default function AssignTeacherModal({
    isOpen,
    onClose,
    selectedClass,
    teachers,
    onAssign,
    isUpdating,
    isDark
}) {
    if (!isOpen || !selectedClass) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
            <div
                className="absolute inset-0 backdrop-blur-sm"
                onClick={onClose}
            />

            <div
                className={`relative rounded-xl shadow-2xl w-full max-w-md overflow-hidden border-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 z-10 px-6 py-5 border-b flex items-center justify-between bg-[#010080] text-white">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Assign Teacher
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-1 border-2 border-white/20 rounded-md hover:border-white/40"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="px-6 pt-4">
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Class: <span className="font-bold text-[#010080] dark:text-blue-400">{selectedClass.class_name}</span>
                    </p>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const teacherId = e.target.teacher_id.value ? parseInt(e.target.teacher_id.value) : null;
                        onAssign(teacherId);
                    }}
                    className="p-6 space-y-4"
                >
                    <div>
                        <label htmlFor="assign_teacher_id" className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Select Instructor
                        </label>
                        <select
                            id="assign_teacher_id"
                            name="teacher_id"
                            defaultValue={selectedClass.teacher_id || ""}
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-[#010080] transition-all appearance-none cursor-pointer ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900 shadow-inner'}`}
                        >
                            <option value="">No teacher assigned</option>
                            {teachers.map((teacher) => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.full_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`flex-1 px-4 py-3 rounded-xl border-2 font-bold transition-all ${isDark
                                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300'}`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="flex-[2] px-4 py-3 bg-[#2563eb] text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 active:scale-95 disabled:opacity-50"
                        >
                            {isUpdating ? "Assigning..." : "Save Assignment"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
