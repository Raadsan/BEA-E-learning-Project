"use client";

export default function AnnouncementForm({
    isOpen,
    onClose,
    editingAnnouncement,
    formData,
    setFormData,
    handleSubmit,
    isDark,
    isCreating,
    isUpdating,
    classes,
    students
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
            <div className="absolute inset-0 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full max-w-2xl p-6 rounded-lg shadow-xl ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`} onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">{editingAnnouncement ? "Edit Announcement" : "Create Announcement"}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Content</label>
                        <textarea
                            required
                            rows={4}
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Target Audience</label>
                            <select
                                value={formData.targetType}
                                onChange={e => setFormData({ ...formData, targetType: e.target.value })}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                            >
                                <option value="all_students">All Students</option>
                                <option value="by_class">By Class</option>
                                <option value="by_student_id">By Student ID</option>
                                <option value="all_teachers">All Teachers</option>
                                <option value="all_admins">All Admins</option>
                                {editingAnnouncement && <option value="manual">Keep Current</option>}
                            </select>
                        </div>
                        {formData.targetType === 'by_class' && (
                            <div>
                                <label className="block text-sm font-medium mb-1">Select Class</label>
                                <select
                                    required
                                    value={formData.targetId}
                                    onChange={e => setFormData({ ...formData, targetId: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                >
                                    <option value="">Select a Class</option>
                                    {classes?.map(c => (
                                        <option key={c.id} value={c.id}>{c.class_name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        {formData.targetType === 'by_student_id' && (
                            <div>
                                <label className="block text-sm font-medium mb-1">Select Student</label>
                                <select
                                    required
                                    value={formData.targetId}
                                    onChange={e => setFormData({ ...formData, targetId: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                >
                                    <option value="">Select a Student</option>
                                    {students?.map(s => (
                                        <option key={s.id} value={s.id}>{s.full_name} ({s.student_id})</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Publish Date</label>
                            <input
                                type="date"
                                required
                                value={formData.publishDate}
                                onChange={e => setFormData({ ...formData, publishDate: e.target.value })}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                            >
                                <option value="Published">Published</option>
                                <option value="Draft">Draft</option>
                                <option value="Archived">Archived</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 rounded-lg transition-colors ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isCreating || isUpdating}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all font-bold"
                        >
                            {isCreating || isUpdating ? "Saving..." : "Save Announcement"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
