"use client";

export default function AdminForm({
    isOpen,
    onClose,
    editingAdmin,
    formData,
    handleInputChange,
    handleSubmit,
    isDark,
    isCreating,
    isUpdating
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 bg-black/50">
            <div className={`rounded-lg p-6 w-full max-w-2xl mx-4 shadow-xl ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`} onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="text-xl font-bold">
                        {editingAdmin ? 'Edit Admin' : 'Add New Admin'}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={`p-6 rounded-lg border mb-6 ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-blue-50/50 border-blue-100'}`}>
                        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            Admin Information
                        </h3>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>First Name *</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-blue-200 text-blue-900'}`}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Last Name *</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-blue-200 text-blue-900'}`}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Username *</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-blue-200 text-blue-900'}`}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-blue-200 text-blue-900'}`}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {editingAdmin ? 'Password (leave blank to keep current)' : 'Password *'}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-blue-200 text-blue-900'}`}
                                    required={!editingAdmin}
                                    minLength={6}
                                />
                            </div>

                            <div>
                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {editingAdmin ? 'Confirm New Password' : 'Confirm Password *'}
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-blue-200 text-blue-900'}`}
                                    required={!editingAdmin || !!formData.password}
                                    minLength={6}
                                />
                            </div>

                            {editingAdmin && (
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-blue-200 text-blue-900'}`}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 border rounded-lg transition-colors ${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isCreating || isUpdating}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-bold"
                        >
                            {isCreating || isUpdating ? 'Saving...' : (editingAdmin ? 'Update Admin' : 'Create Admin')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
