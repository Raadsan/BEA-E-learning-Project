"use client";
import { useState } from "react";
import { TECHNICAL_ADMIN_PERMISSION_OPTIONS } from "@/constants/adminPermissions";

export default function AdminForm({
    isOpen,
    onClose,
    editingAdmin,
    formData,
    handleInputChange,
    handlePermissionToggle,
    handleSubmit,
    isDark,
    isCreating,
    isUpdating
}) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    if (!isOpen) return null;

    const isTechnicalAdmin = formData.role === "technical";

    return (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 bg-black/50">
            <div className={`rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-2xl border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-blue-100 text-gray-900'}`} onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="text-xl font-extrabold tracking-tight">
                        {editingAdmin ? 'Edit Admin Member' : 'Add New Admin Member'}
                    </h3>
                    <button onClick={onClose} className={`p-1 rounded-xl transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-blue-50/50 border-blue-100'}`}>
                        <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-[#010080]'}`}>
                            Admin Information
                        </h3>

                        <div className="space-y-4">
                            {/* Full Name field (replaced First/Last Name) */}
                            <div>
                                <label className={`block text-sm font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name || ""}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-blue-200 text-blue-900'}`}
                                    placeholder="Enter full name (e.g. John Doe)"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-sm font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Username *
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username || ""}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-blue-200 text-blue-900'}`}
                                        placeholder="Enter unique username"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className={`block text-sm font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email || ""}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-blue-200 text-blue-900'}`}
                                        placeholder="Enter email address"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Admin Role selector */}
                                <div>
                                    <label className={`block text-sm font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Admin Role *
                                    </label>
                                    <select
                                        name="role"
                                        value={formData.role || "super"}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-blue-200 text-blue-900'}`}
                                    >
                                        <option value="super">Super Admin</option>
                                        <option value="technical">Technical Admin</option>
                                    </select>
                                </div>

                                {/* Status Selector (Only for editing) */}
                                {editingAdmin && (
                                    <div>
                                        <label className={`block text-sm font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Status
                                        </label>
                                        <select
                                            name="status"
                                            value={formData.status || "active"}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-blue-200 text-blue-900'}`}
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Password Fields - Deprived if Technical Admin */}
                            {isTechnicalAdmin ? (
                                <div className="space-y-4 mt-2">
                                    <div className={`p-4 rounded-xl border flex items-start gap-3 ${isDark ? 'bg-blue-950/40 border-blue-900/60 text-blue-300' : 'bg-blue-50 border-blue-100 text-blue-800'}`}>
                                        <svg className="w-5 h-5 mt-0.5 shrink-0 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div className="text-xs font-semibold leading-relaxed">
                                            Technical Admins cannot set their own password. A temporary password will be emailed to them automatically.
                                        </div>
                                    </div>

                                    <div>
                                        <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Portal Permissions *
                                        </label>
                                        <p className={`text-xs mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Select only the sections this Technical Admin can access after login.
                                        </p>
                                        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 rounded-xl border max-h-56 overflow-y-auto ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-white border-blue-100'}`}>
                                            {TECHNICAL_ADMIN_PERMISSION_OPTIONS.map((option) => {
                                                const checked = (formData.permissions || []).includes(option.key);
                                                return (
                                                    <label
                                                        key={option.key}
                                                        className={`flex items-center gap-2 text-sm cursor-pointer rounded-lg px-2 py-1.5 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-blue-50'}`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={() => handlePermissionToggle(option.key)}
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>{option.label}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={`block text-sm font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {editingAdmin ? 'New Password (optional)' : 'Password *'}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={formData.password || ""}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-blue-200 text-blue-900'}`}
                                                placeholder={editingAdmin ? "Keep current" : "Enter password"}
                                                required={!editingAdmin}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className={`block text-sm font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {editingAdmin ? 'Confirm New Password' : 'Confirm Password *'}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                name="confirmPassword"
                                                value={formData.confirmPassword || ""}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-blue-200 text-blue-900'}`}
                                                placeholder={editingAdmin ? "Confirm new password" : "Repeat password"}
                                                required={!editingAdmin || !!formData.password}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 border-t pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-5 py-2.5 border rounded-xl font-bold transition-all ${isDark ? 'border-gray-600 hover:bg-gray-700 text-gray-300' : 'border-gray-300 hover:bg-gray-50 text-gray-600'}`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isCreating || isUpdating}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all font-bold shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                        >
                            {isCreating || isUpdating ? 'Saving...' : (editingAdmin ? 'Update Admin' : 'Create Admin')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const EyeIcon = ({ size = 24 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
);

const EyeOffIcon = ({ size = 24 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
);
