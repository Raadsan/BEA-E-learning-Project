"use client";

const ReadField = ({ label, value, isDark, colorClass = "", span = false, fullWidth = false }: {
    label: string;
    value?: string | number | null;
    isDark: boolean;
    colorClass?: string;
    span?: boolean;
    fullWidth?: boolean;
}) => (
    <div className={span ? "md:col-span-2" : fullWidth ? "w-full" : ""}>
        <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {label}
        </label>
        <input
            type="text"
            readOnly
            value={value !== undefined && value !== null && value !== '' ? String(value) : 'N/A'}
            className={`w-full px-3 py-2 rounded-md border text-sm font-medium outline-none cursor-default select-all
                ${isDark
                    ? 'bg-gray-800/60 border-gray-600 text-gray-100'
                    : 'bg-gray-50 border-gray-200 text-gray-900'}
                ${colorClass}`}
        />
    </div>
);

const ReadTextarea = ({ label, value, isDark }: {
    label: string;
    value?: string | null;
    isDark: boolean;
}) => (
    <div>
        <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {label}
        </label>
        <textarea
            readOnly
            value={value || 'N/A'}
            rows={3}
            className={`w-full px-3 py-2 rounded-md border text-sm leading-relaxed outline-none cursor-default resize-none select-all
                ${isDark
                    ? 'bg-gray-800/60 border-gray-600 text-gray-100'
                    : 'bg-gray-50 border-gray-200 text-gray-700'}`}
        />
    </div>
);

export default function TeacherViewModal({
    isOpen,
    onClose,
    teacher,
    isDark,
    getAssignedClasses
}) {
    if (!isOpen || !teacher) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            <div
                className={`relative rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`sticky top-0 z-10 border-b px-6 py-4 flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Teacher Profile: {teacher.full_name}
                    </h2>
                    <button
                        onClick={onClose}
                        className={`transition-colors ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">

                    {/* Personal Information */}
                    <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-blue-50/50 border-blue-200'}`}>
                        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ReadField label="Full Name" value={teacher.full_name} isDark={isDark} />
                            <ReadField label="Email" value={teacher.email} isDark={isDark} />
                            <ReadField label="Phone" value={teacher.phone} isDark={isDark} />
                            <ReadField label="Country" value={teacher.country} isDark={isDark} />
                            <ReadField label="City" value={teacher.city} isDark={isDark} />
                            <ReadField label="Hire Date" value={teacher.hire_date ? new Date(teacher.hire_date).toLocaleDateString() : null} isDark={isDark} />
                            <ReadField
                                label="Status"
                                value={teacher.status ? teacher.status.charAt(0).toUpperCase() + teacher.status.slice(1) : null}
                                isDark={isDark}
                                colorClass={teacher.status === 'active'
                                    ? (isDark ? 'text-green-400' : 'text-green-700')
                                    : (isDark ? 'text-red-400' : 'text-red-600')}
                            />
                        </div>
                    </div>

                    {/* Professional Information */}
                    <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-purple-50/50 border-purple-200'}`}>
                        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Professional Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ReadField label="Specialization" value={teacher.specialization} isDark={isDark} />
                            <ReadField label="Highest Qualification" value={teacher.highest_qualification} isDark={isDark} />
                            <ReadField
                                label="Years of Experience"
                                value={teacher.years_experience !== undefined && teacher.years_experience !== null ? `${teacher.years_experience} years` : null}
                                isDark={isDark}
                                colorClass={isDark ? 'text-blue-300' : 'text-blue-700'}
                            />
                            <div>
                                <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Portfolio Link
                                </label>
                                {teacher.portfolio_link ? (
                                    <a
                                        href={teacher.portfolio_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-1 text-sm underline ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} break-all`}
                                    >
                                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                        {teacher.portfolio_link}
                                    </a>
                                ) : (
                                    <input
                                        type="text"
                                        readOnly
                                        value="N/A"
                                        className={`w-full px-3 py-2 rounded-md border text-sm font-medium outline-none cursor-default ${isDark ? 'bg-gray-800/60 border-gray-600 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bio & Skills */}
                    <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-green-50/50 border-green-200'}`}>
                        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Additional Information
                        </h3>
                        <div className="space-y-4">
                            <ReadTextarea label="Bio" value={teacher.bio} isDark={isDark} />
                            <ReadField label="Skills" value={teacher.skills} isDark={isDark} fullWidth />
                        </div>
                    </div>

                    {/* Assigned Classes */}
                    <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-orange-50/50 border-orange-200'}`}>
                        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            Assigned Classes
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-blue-600/30 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                                {getAssignedClasses(teacher.id).length}
                            </span>
                        </h3>

                        {getAssignedClasses(teacher.id).length === 0 ? (
                            <div className={`p-6 text-center rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    No classes assigned to this teacher.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {getAssignedClasses(teacher.id).map((classItem) => (
                                    <div
                                        key={classItem.id}
                                        className={`p-4 rounded-lg border transition-all hover:shadow-lg ${isDark
                                            ? 'bg-gradient-to-br from-gray-800/80 to-gray-700/80 border-gray-600 hover:border-gray-500'
                                            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-blue-300'}`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <h4 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {classItem.class_name || 'N/A'}
                                            </h4>
                                            <div className={`w-2 h-2 rounded-full ${classItem.course_title ? 'bg-green-500' : 'bg-gray-400'}`} />
                                        </div>
                                        <div className="space-y-3">
                                            <ReadField label="Course / Subprogram" value={classItem.subprogram_name || classItem.course_title} isDark={isDark} />
                                            <ReadField label="Program" value={classItem.program_name} isDark={isDark} />
                                        </div>
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
