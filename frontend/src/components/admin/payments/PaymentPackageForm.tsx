"use client";

import Modal from "@/components/Modal";

export default function PaymentPackageForm({
    isOpen,
    onClose,
    editingPackage,
    formData,
    handleInputChange,
    handleSubmit,
    isDark,
    isLoading,
    closeOnClickOutside = true
}) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingPackage ? "Edit Payment Package" : "Create New Payment Package"}
            size="md"
            closeOnClickOutside={closeOnClickOutside}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Package Name
                    </label>
                    <input
                        type="text"
                        name="package_name"
                        value={formData.package_name}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-[#010080] outline-none transition-all`}
                        placeholder="e.g., Monthly VIP Package"
                    />
                </div>

                <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="4"
                        className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-[#010080] outline-none transition-all`}
                        placeholder="Points-based description (e.g., • Full Access\n• 24/7 Support)..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Duration (Months)
                        </label>
                        <input
                            type="number"
                            name="duration_months"
                            value={formData.duration_months}
                            onChange={handleInputChange}
                            required
                            min="1"
                            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-[#010080] outline-none transition-all`}
                            placeholder="e.g., 3"
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Status
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-[#010080] outline-none transition-all`}
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className={`px-4 py-2 rounded-lg border ${isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-600 hover:bg-gray-50'} transition-all`}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 bg-[#010080] text-white rounded-lg hover:bg-blue-900 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                            </>
                        ) : (
                            editingPackage ? "Update Package" : "Create Package"
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
