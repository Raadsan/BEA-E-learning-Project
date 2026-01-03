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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            <div
                className={`relative rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`sticky top-0 z-10 border-b px-6 py-4 flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                    <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'
                        }`}>
                        {editingProgram ? "Edit Program" : "Add New Program"}
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

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-semibold mb-2 text-gray-700">
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
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-[#f0f7ff] text-gray-900 transition-all font-medium placeholder:text-gray-400"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-semibold mb-2 text-gray-700">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                            rows={4}
                            placeholder="Enter program description"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-[#f0f7ff] text-gray-900 transition-all font-medium placeholder:text-gray-400 resize-none"
                        />
                    </div>

                    <div>
                        <label htmlFor="image" className="block text-sm font-semibold mb-2 text-gray-700">
                            Image
                        </label>
                        <input
                            type="file"
                            id="image"
                            name="image"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-[#f0f7ff] text-gray-900 transition-all font-medium"
                        />
                        {imagePreview && (
                            <div className="mt-2 w-32 h-32 relative">
                                <Image
                                    src={imagePreview}
                                    alt="Preview"
                                    fill
                                    className="object-cover rounded"
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <label htmlFor="video" className="block text-sm font-semibold mb-2 text-gray-700">
                            Video
                        </label>
                        <input
                            type="file"
                            id="video"
                            name="video"
                            accept="video/*"
                            onChange={handleFileChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-[#f0f7ff] text-gray-900 transition-all font-medium"
                        />
                        {videoPreview && (
                            <div className="mt-2 w-full max-w-md">
                                <video
                                    src={videoPreview}
                                    controls
                                    className="w-full rounded"
                                    preload="metadata"
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="price" className="block text-sm font-semibold mb-2 text-gray-700">
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
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-[#f0f7ff] text-gray-900 transition-all font-medium placeholder:text-gray-400"
                            />
                        </div>

                        <div>
                            <label htmlFor="discount" className="block text-sm font-semibold mb-2 text-gray-700">
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
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-[#f0f7ff] text-gray-900 transition-all font-medium placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    {!editingProgram && (
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
                    )}

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
                            {isCreating || isUpdating ? "Processing..." : editingProgram ? "Save Changes" : "Add Program"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
