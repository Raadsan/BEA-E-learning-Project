"use client";

import { useState, useEffect, useRef } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import DataTable from "@/components/DataTable";
import { useToast } from "@/components/Toast";
import Image from "next/image";

export default function TestimonialsPage() {
    const { isDark } = useDarkMode();
    const { showToast } = useToast();
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState(null);
    const [testimonialToDelete, setTestimonialToDelete] = useState(null);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        student_name: "",
        student_role: "",
        quote: "",
        image_url: "",
        rating: 5,
        is_active: true
    });

    // Fetch testimonials
    const fetchTestimonials = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch("${API_URL}/testimonials/admin", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("Failed to fetch testimonials");
            const data = await response.json();
            setTestimonials(data);
        } catch (err) {
            console.error("Error fetching testimonials:", err);
            showToast("Failed to load testimonials", "error");
            setTestimonials([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTestimonials();
    }, []);

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // Handle File Upload
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // basic validation
        if (!file.type.startsWith('image/')) {
            showToast("Please upload an image file", "error");
            return;
        }

        try {
            setIsUploading(true);
            const token = localStorage.getItem("token");
            const formDataUpload = new FormData();
            formDataUpload.append('file', file);

            const response = await fetch("${API_URL}/uploads", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formDataUpload,
            });

            if (!response.ok) throw new Error("Upload failed");

            const data = await response.json();
            // Prefix with full URL for absolute path if needed, 
            // but the components handle relative `/uploads/...` paths
            setFormData(prev => ({
                ...prev,
                image_url: `http://localhost:5000${data.url}`
            }));

            showToast("Photo uploaded successfully!", "success");
        } catch (err) {
            console.error("Upload error:", err);
            showToast("Failed to upload photo", "error");
        } finally {
            setIsUploading(false);
        }
    };

    // Open modal for create
    const handleCreate = () => {
        setEditingTestimonial(null);
        setFormData({
            student_name: "",
            student_role: "",
            quote: "",
            image_url: "",
            rating: 5,
            is_active: true
        });
        setShowModal(true);
    };

    // Open modal for edit
    const handleEdit = (testimonial) => {
        setEditingTestimonial(testimonial);
        setFormData({
            student_name: testimonial.student_name,
            student_role: testimonial.student_role || "",
            quote: testimonial.quote,
            image_url: testimonial.image_url || "",
            rating: testimonial.rating || 5,
            is_active: testimonial.is_active === 1 || testimonial.is_active === true
        });
        setShowModal(true);
    };

    // Submit form (create or update)
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");
            const url = editingTestimonial
                ? `${API_URL}/testimonials/${editingTestimonial.id}`
                : "${API_URL}/testimonials";

            const method = editingTestimonial ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to save testimonial");
            }

            showToast(editingTestimonial ? "Testimonial updated successfully!" : "Testimonial created successfully!", "success");
            setShowModal(false);
            fetchTestimonials();
        } catch (err) {
            showToast(err.message, "error");
        }
    };

    // Open delete confirmation modal
    const handleDeleteClick = (testimonial) => {
        setTestimonialToDelete(testimonial);
        setShowDeleteModal(true);
    };

    // Confirm and execute delete
    const confirmDelete = async () => {
        if (!testimonialToDelete) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/testimonials/${testimonialToDelete.id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("Failed to delete testimonial");

            showToast("Testimonial deleted successfully!", "success");
            setShowDeleteModal(false);
            setTestimonialToDelete(null);
            fetchTestimonials();
        } catch (err) {
            showToast(err.message, "error");
        }
    };

    // DataTable columns configuration
    const columns = [
        {
            key: "image",
            label: "Photo",
            width: "80px",
            render: (_, row) => (
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-gray-200">
                    {row.image_url ? (
                        <img
                            src={row.image_url}
                            alt={row.student_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(row.student_name);
                            }}
                        />
                    ) : (
                        <span className="text-blue-600 font-bold text-xs">{row.student_name.substring(0, 2).toUpperCase()}</span>
                    )}
                </div>
            )
        },
        { key: "student_name", label: "Student Name", width: "200px" },
        { key: "student_role", label: "Role", width: "200px" },
        {
            key: "quote",
            label: "Quote",
            width: "400px",
            render: (value) => (
                <p className="line-clamp-2 text-sm italic text-gray-600 dark:text-gray-400">"{value}"</p>
            )
        },
        {
            key: "is_active",
            label: "Status",
            width: "120px",
            render: (value) => (
                <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${value ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                >
                    {value ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            width: "120px",
            render: (_, row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleEdit(row)}
                        className="text-blue-600 p-1 hover:bg-blue-50 rounded"
                        title="Edit"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                        </svg>
                    </button>
                    <button
                        onClick={() => handleDeleteClick(row)}
                        className="text-red-600 p-1 hover:bg-red-50 rounded"
                        title="Delete"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                    </button>
                </div>
            ),
        },
    ];

    if (loading) {
        return (
            <main className="flex-1 p-6 text-center text-gray-600">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4">Loading testimonials...</p>
            </main>
        );
    }

    return (
        <>
            <main className="flex-1 bg-gray-50">
                <div className="w-full px-8 py-6">
                    <DataTable
                        title="Student Testimonials Management"
                        columns={columns}
                        data={testimonials}
                        onAddClick={handleCreate}
                        showAddButton={true}
                        emptyMessage="No testimonials found."
                    />
                </div>
            </main>

            {/* Modal for Create/Edit */}
            {showModal && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowModal(false)}
                    />
                    <div
                        className={`relative rounded-xl shadow-lg w-full max-w-2xl overflow-hidden border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                            }`}
                    >
                        {/* Modal Header */}
                        <div className={`border-b px-6 py-4 flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                            }`}>
                            <h2 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                {editingTestimonial ? "Edit Testimonial" : "Add New Testimonial"}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className={`transition-colors ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Student Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="student_name"
                                            value={formData.student_name}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="e.g. Mohamed"
                                            className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'
                                                }`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Role / Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="student_role"
                                            value={formData.student_role}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="e.g. IELTS Student"
                                            className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'
                                                }`}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Student Photo
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden bg-gray-50/50 ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
                                                {formData.image_url ? (
                                                    <div className="relative w-full h-full group">
                                                        <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({ ...prev, image_url: "" }))}
                                                            className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleFileUpload}
                                                    className="hidden"
                                                    accept="image/*"
                                                />
                                                <button
                                                    type="button"
                                                    disabled={isUploading}
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${isDark
                                                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                                        : 'bg-white border-2 border-gray-100 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {isUploading ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent animate-spin rounded-full"></div>
                                                            Uploading...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 8l-4-4m0 0L8 8m4-4v12" />
                                                            </svg>
                                                            {formData.image_url ? "Change Photo" : "Upload Photo"}
                                                        </>
                                                    )}
                                                </button>
                                                <p className="mt-1.5 text-xs text-gray-500">JPG or PNG. Max 5MB.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Rating <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex gap-2 py-3 px-4 border-2 rounded-xl border-transparent">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                                                    className={`transition-all duration-200 hover:scale-125 focus:outline-none`}
                                                >
                                                    <svg
                                                        className={`w-8 h-8 ${star <= formData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                                                        viewBox="0 0 24 24"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                                    </svg>
                                                </button>
                                            ))}
                                            <span className={`ml-3 text-sm font-medium self-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                ({formData.rating} stars)
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Quote <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="quote"
                                        value={formData.quote}
                                        onChange={handleInputChange}
                                        required
                                        rows="4"
                                        placeholder="Enter the student's testimonial quote here..."
                                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'
                                            }`}
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="is_active" className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Show on Homepage
                                    </label>
                                </div>
                            </div>

                            <div className={`mt-6 pt-6 border-t flex justify-end gap-3 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className={`px-4 py-2 border-2 rounded-xl font-medium transition-all ${isDark
                                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
                                >
                                    {editingTestimonial ? "Update" : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* custom Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowDeleteModal(false)}
                    />
                    <div
                        className={`relative rounded-xl shadow-lg p-8 max-w-md w-full border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                            }`}
                    >
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                                <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className={`text-2xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Delete Testimonial</h3>
                            <p className={`text-sm mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Are you sure you want to delete the testimonial from <span className="font-medium text-red-600">"{testimonialToDelete?.student_name}"</span>? This action cannot be undone.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className={`flex-1 px-4 py-3 border-2 rounded-xl font-medium transition-all ${isDark
                                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-red-500/30"
                                >
                                    Delete Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
