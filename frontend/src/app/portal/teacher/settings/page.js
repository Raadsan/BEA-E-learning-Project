"use client";

import React, { useState, useEffect } from "react";
import TeacherHeader from "../TeacherHeader";
import { useGetTeacherQuery, useUpdateTeacherMutation } from "@/redux/api/teacherApi";
import { useDarkMode } from "@/context/ThemeContext";

export default function SettingsPage() {
    const { isDark } = useDarkMode();
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });
    const [isEditing, setIsEditing] = useState(false); // Track edit mode

    // Get teacher ID from localStorage
    const teacherId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

    const { data: teacherData, isLoading, refetch } = useGetTeacherQuery(teacherId, {
        skip: !teacherId,
    });

    const [updateTeacher, { isLoading: isUpdating }] = useUpdateTeacherMutation();

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        country: "",
        city: "",
        specialization: "",
        highest_qualification: "",
        years_experience: "",
        bio: "",
        portfolio_link: "",
        skills: "",
    });

    useEffect(() => {
        console.log("Teacher Data:", teacherData); // Debug log

        if (teacherData) {
            // Handle both direct object and nested response formats
            const teacher = teacherData.teacher || teacherData;

            setFormData({
                full_name: teacher.full_name || "",
                email: teacher.email || "",
                phone: teacher.phone || "",
                country: teacher.country || "",
                city: teacher.city || "",
                specialization: teacher.specialization || "",
                highest_qualification: teacher.highest_qualification || "",
                years_experience: teacher.years_experience || "",
                bio: teacher.bio || "",
                portfolio_link: teacher.portfolio_link || "",
                skills: teacher.skills || "",
            });
        }
    }, [teacherData]);

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateClick = () => {
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        // Reset form to original data
        if (teacherData) {
            const teacher = teacherData.teacher || teacherData;
            setFormData({
                full_name: teacher.full_name || "",
                email: teacher.email || "",
                phone: teacher.phone || "",
                country: teacher.country || "",
                city: teacher.city || "",
                specialization: teacher.specialization || "",
                highest_qualification: teacher.highest_qualification || "",
                years_experience: teacher.years_experience || "",
                bio: teacher.bio || "",
                portfolio_link: teacher.portfolio_link || "",
                skills: teacher.skills || "",
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const { email, ...updateData } = formData; // Exclude email from update
            await updateTeacher({ id: teacherId, ...updateData }).unwrap();
            showToast("Profile updated successfully!", "success");
            setIsEditing(false); // Exit edit mode after save
            refetch();
        } catch (error) {
            console.error("Failed to update profile:", error);
            showToast("Failed to update profile. Please try again.", "error");
        }
    };

    const getInputClassName = (isEmailField = false) => {
        const baseClass = "w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500";

        if (isEmailField || !isEditing) {
            return `${baseClass} ${isDark
                ? 'bg-gray-900 border-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed'}`;
        }

        return `${baseClass} ${isDark
            ? 'bg-gray-700 border-gray-600 text-white'
            : 'bg-white border-gray-300 text-gray-900'}`;
    };

    if (isLoading) {
        return (
            <>
                <TeacherHeader />
                <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors min-h-screen pt-24">
                    <div className="flex justify-center items-center h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    </div>
                </main>
            </>
        );
    }

    // Debug: Show if no teacher data
    if (!teacherData && !isLoading) {
        return (
            <>
                <TeacherHeader />
                <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors min-h-screen">
                    <div className="w-full px-8 py-6 pt-24">
                        <div className={`rounded-xl shadow-md p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                            <h2 className="text-xl font-semibold text-red-600 mb-4">Unable to Load Profile</h2>
                            <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                                Teacher ID: {teacherId || "Not found"}
                            </p>
                            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Please check the browser console for more details.
                            </p>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <TeacherHeader />
            <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors min-h-screen">
                <div className="w-full px-8 py-6 pt-24">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Profile Settings</h1>
                        <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {isEditing ? "Edit your profile information" : "View your profile information"}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className={`rounded-xl shadow-md p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                        {/* Personal Information Section */}
                        <div className="mb-8">
                            <h2 className={`text-xl font-semibold mb-6 pb-2 border-b ${isDark ? 'text-white border-gray-700' : 'text-gray-800 border-gray-200'}`}>
                                Personal Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Full Name */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        required
                                        className={getInputClassName()}
                                    />
                                </div>

                                {/* Email (Always Read-only) */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Email (Cannot be changed)
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        disabled
                                        className={getInputClassName(true)}
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
                                        value={formData.phone}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className={getInputClassName()}
                                    />
                                </div>

                                {/* Country */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className={getInputClassName()}
                                    />
                                </div>

                                {/* City */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className={getInputClassName()}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Professional Information Section */}
                        <div className="mb-8">
                            <h2 className={`text-xl font-semibold mb-6 pb-2 border-b ${isDark ? 'text-white border-gray-700' : 'text-gray-800 border-gray-200'}`}>
                                Professional Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Specialization */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Specialization
                                    </label>
                                    <input
                                        type="text"
                                        name="specialization"
                                        value={formData.specialization}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className={getInputClassName()}
                                    />
                                </div>

                                {/* Highest Qualification */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Highest Qualification
                                    </label>
                                    <input
                                        type="text"
                                        name="highest_qualification"
                                        value={formData.highest_qualification}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className={getInputClassName()}
                                    />
                                </div>

                                {/* Years of Experience */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Years of Experience
                                    </label>
                                    <input
                                        type="number"
                                        name="years_experience"
                                        value={formData.years_experience}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        min="0"
                                        className={getInputClassName()}
                                    />
                                </div>

                                {/* Portfolio Link */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Portfolio Link
                                    </label>
                                    <input
                                        type="url"
                                        name="portfolio_link"
                                        value={formData.portfolio_link}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        placeholder="https://"
                                        className={getInputClassName()}
                                    />
                                </div>

                                {/* Skills */}
                                <div className="md:col-span-2">
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Skills (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        name="skills"
                                        value={formData.skills}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        placeholder="e.g., JavaScript, React, Node.js"
                                        className={getInputClassName()}
                                    />
                                </div>

                                {/* Bio */}
                                <div className="md:col-span-2">
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Bio
                                    </label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        rows="4"
                                        placeholder="Tell us about yourself..."
                                        className={`${getInputClassName()} resize-none`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4">
                            {isEditing ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={handleCancelClick}
                                        className={`px-6 py-2 rounded-lg border transition-colors ${isDark
                                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isUpdating}
                                        className={`px-6 py-2 rounded-lg text-white transition-colors ${isUpdating
                                            ? 'bg-blue-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                            } flex items-center gap-2`}
                                    >
                                        {isUpdating && (
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        )}
                                        {isUpdating ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleUpdateClick}
                                    className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                                >
                                    Update Profile
                                </button>
                            )}
                        </div>
                    </form>

                    {/* Hire Date Info */}
                    {(teacherData?.hire_date || teacherData?.teacher?.hire_date) && (
                        <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-blue-50'}`}>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                <span className="font-medium">Hire Date:</span> {new Date(teacherData?.hire_date || teacherData?.teacher?.hire_date).toLocaleDateString()}
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ show: false, message: "", type: "success" })}
                />
            )}
        </>
    );
}
