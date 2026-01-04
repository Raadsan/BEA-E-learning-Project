"use client";

import Image from "next/image";

export default function ProgramForm({
    isOpen,
    onClose,
    editingProgram,
    formData,
    handleInputChange,
    handleFileChange,
    handleSubmit,
    isDark,
    isCreating,
    isUpdating,
    imagePreview,
    videoPreview
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
                <div className={`sticky top-0 z-10 border-b px-6 py-5 flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        {editingProgram ? "Update Program Details" : "Create New Program"}
                    </h2>
                    <button
                        onClick={onClose}
                        className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'} transition-colors p-1`}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={`p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-80px)] ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <div>
                        <label htmlFor="title" className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter program title"
                            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                            rows={3}
                            placeholder="Enter program description"
                            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="image" className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Image
                            </label>
                            <input
                                type="file"
                                id="image"
                                name="image"
                                accept="image/*"
                                onChange={handleFileChange}
                                className={`w-full px-4 py-2 text-sm border rounded-lg focus:outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                            />
                            {imagePreview && (
                                <div className="mt-2 w-20 h-20 relative">
                                    <Image src={imagePreview} alt="Preview" fill className="object-cover rounded-lg border shadow-sm" />
                                </div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="video" className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Video
                            </label>
                            <input
                                type="file"
                                id="video"
                                name="video"
                                accept="video/*"
                                onChange={handleFileChange}
                                className={`w-full px-4 py-2 text-sm border rounded-lg focus:outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                            />
                            {videoPreview && (
                                <div className="mt-2 text-xs text-blue-500 font-medium">Video selected</div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="price" className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Price ($)
                            </label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                step="0.01"
                                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                            />
                        </div>

                        <div>
                            <label htmlFor="discount" className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Discount ($)
                            </label>
                            <input
                                type="number"
                                id="discount"
                                name="discount"
                                value={formData.discount}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                step="0.01"
                                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                            />
                        </div>
                    </div>

                    {!editingProgram && (
                        <div>
                            <label htmlFor="status" className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                required
                                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 rounded-lg transition-colors border ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'}`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isCreating || isUpdating}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {isCreating || isUpdating ? "Processing..." : editingProgram ? "Update Program" : "Create Program"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
