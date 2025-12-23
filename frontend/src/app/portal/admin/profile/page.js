"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/AdminHeader";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useUpdateAdminMutation } from "@/redux/api/adminApi";
import { useToast } from "@/components/Toast";
import Loader from "@/components/Loader";
import Image from "next/image";

export default function AdminProfilePage() {
    const router = useRouter();
    const { isDark } = useDarkMode();
    const { showToast } = useToast();
    const { data: currentAdmin, isLoading, refetch } = useGetCurrentUserQuery();
    const [updateAdmin, { isLoading: isUpdating }] = useUpdateAdminMutation();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        phone: "",
        bio: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    // Initialize form data when admin data loads
    useEffect(() => {
        if (currentAdmin) {
            setFormData({
                first_name: currentAdmin.first_name || "",
                last_name: currentAdmin.last_name || "",
                email: currentAdmin.email || "",
                phone: currentAdmin.phone || "",
                role: currentAdmin.role || "admin",
                bio: currentAdmin.bio || "",
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            if (currentAdmin.profile_image) {
                setImagePreview(`http://localhost:5000${currentAdmin.profile_image}`);
            }
        }
    }, [currentAdmin]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate password fields if changing password
        if (formData.newPassword) {
            if (formData.newPassword !== formData.confirmPassword) {
                showToast("New passwords do not match", "error");
                return;
            }
            if (!formData.currentPassword) {
                showToast("Current password is required to set a new password", "error");
                return;
            }
        }

        try {
            const updateData = {
                username: currentAdmin.username, // Keep existing username
                email: formData.email,
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone: formData.phone || "",
                bio: formData.bio || "",
            };

            if (formData.newPassword) {
                updateData.currentPassword = formData.currentPassword;
                updateData.newPassword = formData.newPassword;
                updateData.password = formData.newPassword;
            }

            // Note: Image upload will need separate endpoint or multipart/form-data support
            // For now, we'll skip the image upload in this update
            if (selectedImage) {
                showToast("Image upload feature requires backend support", "info");
            }

            await updateAdmin({ id: currentAdmin.id, ...updateData }).unwrap();
            showToast("Profile updated successfully!", "success");
            setIsEditing(false);
            refetch();

            // Clear password fields
            setFormData(prev => ({
                ...prev,
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            }));
        } catch (error) {
            console.error("Failed to update profile:", error);
            showToast(error?.data?.message || "Failed to update profile", "error");
        }
    };

    const handleCancel = () => {
        // Reset form data to current admin data
        if (currentAdmin) {
            setFormData({
                first_name: currentAdmin.first_name || "",
                last_name: currentAdmin.last_name || "",
                email: currentAdmin.email || "",
                phone: currentAdmin.phone || "",
                role: currentAdmin.role || "admin",
                bio: currentAdmin.bio || "",
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            if (currentAdmin.profile_image) {
                setImagePreview(`http://localhost:5000${currentAdmin.profile_image}`);
            }
        }
        setSelectedImage(null);
        setIsEditing(false);
    };

    if (isLoading) {
        return (
            <div className={`flex-1 min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <AdminHeader />
                <main className="flex-1 flex items-center justify-center">
                    <Loader />
                </main>
            </div>
        );
    }

    return (
        <div className={`flex-1 min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <AdminHeader />

            <main className="flex-1 overflow-y-auto pt-20">
                <div className="w-full max-w-5xl mx-auto px-8 py-6">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Admin Profile
                        </h1>
                        <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Manage your account information and settings
                        </p>
                    </div>

                    {/* Profile Card */}
                    <div className={`rounded-xl shadow-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                        {/* Cover Image / Header Section */}
                        <div className="h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>

                        <div className="px-8 py-6">
                            {/* Profile Image Section */}
                            <div className="flex items-end -mt-20 mb-6">
                                <div className="relative">
                                    <div className={`w-32 h-32 rounded-full border-4 overflow-hidden ${isDark ? 'border-gray-800' : 'border-white'} shadow-lg bg-gray-200`}>
                                        {imagePreview ? (
                                            <Image
                                                src={imagePreview}
                                                alt="Profile"
                                                width={128}
                                                height={128}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                                                <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    {isEditing && (
                                        <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-lg transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>

                                <div className="ml-6 flex-1">
                                    <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {currentAdmin?.full_name || currentAdmin?.username || "Admin User"}
                                    </h2>
                                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {currentAdmin?.role === 'superadmin' ? '👑 Super Administrator' : '🔐 Administrator'}
                                    </p>
                                </div>

                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit Profile
                                    </button>
                                )}
                            </div>

                            {/* Profile Information Form */}
                            <form onSubmit={handleSubmit}>
                                <div className="space-y-6">
                                    {/* Basic Information */}
                                    <div>
                                        <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            Basic Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* First Name */}
                                            <div>
                                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    First Name
                                                </label>
                                                <input
                                                    type="text"
                                                    name="first_name"
                                                    value={formData.first_name || ""}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditing}
                                                    className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${isEditing
                                                        ? `focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`
                                                        : `${isDark ? 'bg-gray-750 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'} cursor-not-allowed`
                                                        }`}
                                                />
                                            </div>

                                            {/* Last Name */}
                                            <div>
                                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    Last Name
                                                </label>
                                                <input
                                                    type="text"
                                                    name="last_name"
                                                    value={formData.last_name || ""}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditing}
                                                    className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${isEditing
                                                        ? `focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`
                                                        : `${isDark ? 'bg-gray-750 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'} cursor-not-allowed`
                                                        }`}
                                                />
                                            </div>

                                            {/* Email */}
                                            <div>
                                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email || ""}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditing}
                                                    className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${isEditing
                                                        ? `focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`
                                                        : `${isDark ? 'bg-gray-750 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'} cursor-not-allowed`
                                                        }`}
                                                />
                                            </div>

                                            {/* Role (Read Only) */}
                                            <div>
                                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    Role
                                                </label>
                                                <input
                                                    type="text"
                                                    name="role"
                                                    value={formData.role || "admin"}
                                                    disabled={true}
                                                    className={`w-full px-4 py-2.5 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-gray-500' : 'bg-gray-100 border-gray-200 text-gray-500'} cursor-not-allowed`}
                                                />
                                            </div>

                                            {/* Phone */}
                                            <div>
                                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    Phone
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone || ""}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditing}
                                                    placeholder="+252 61 234 5678"
                                                    className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${isEditing
                                                        ? `focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`
                                                        : `${isDark ? 'bg-gray-750 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'} cursor-not-allowed`
                                                        }`}
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Bio
                                            </label>
                                            <textarea
                                                name="bio"
                                                value={formData.bio || ""}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                rows={4}
                                                placeholder="Tell us about yourself..."
                                                className={`w-full px-4 py-2.5 rounded-lg border transition-colors resize-none ${isEditing
                                                    ? `focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`
                                                    : `${isDark ? 'bg-gray-750 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'} cursor-not-allowed`
                                                    }`}
                                            />
                                        </div>
                                    </div>

                                    {/* Change Password Section - Only show when editing */}
                                    {isEditing && (
                                        <div>
                                            <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                Change Password (Optional)
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="md:col-span-2">
                                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        Current Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        name="currentPassword"
                                                        value={formData.currentPassword}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter current password"
                                                        className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                                    />
                                                </div>

                                                <div>
                                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        New Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        name="newPassword"
                                                        value={formData.newPassword}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter new password"
                                                        className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                                    />
                                                </div>

                                                <div>
                                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        Confirm New Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        name="confirmPassword"
                                                        value={formData.confirmPassword}
                                                        onChange={handleInputChange}
                                                        placeholder="Confirm new password"
                                                        className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    {isEditing && (
                                        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                                            <button
                                                type="button"
                                                onClick={handleCancel}
                                                className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isUpdating}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                {isUpdating ? (
                                                    <>
                                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Save Changes
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </form>

                            {/* DEBUG: Temporary Data Dump to verify backend response */}
                            
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
