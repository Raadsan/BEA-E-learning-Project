"use client";

import { useState, useEffect } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetCurrentUserQuery } from "@/lib/api/authApi";
import { useUpdateTeacherMutation } from "@/lib/api/teacherApi";
import { useToast } from "@/components/Toast";
import Loader from "@/components/Loader";
import Image from "next/image";
import { resolveProfileImageUrl } from "@/constants";

export default function TeacherSettingsPage() {
  const { isDark } = useDarkMode();
  const { showToast } = useToast();
  const { data: authData, isLoading, refetch } = useGetCurrentUserQuery();
  const [updateTeacher, { isLoading: isUpdating }] = useUpdateTeacherMutation();

  const user = authData?.user;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    specialization: "",
    country: "",
    city: "",
    bio: "",
    password: "",
    confirmPassword: "",
  });

  const [imagePreview, setImagePreview] = useState(null);

  // Initialize form data when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        specialization: user.specialization || "",
        country: user.country || "",
        city: user.city || "",
        bio: user.bio || "",
        password: "",
        confirmPassword: "",
      });
      if (user.profile_picture) {
        setImagePreview(resolveProfileImageUrl(user.profile_picture) || "");
      }
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password fields if changing password
    if (formData.password) {
      if (formData.password !== formData.confirmPassword) {
        showToast("Passwords do not match", "error");
        return;
      }
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
      if (!passwordRegex.test(formData.password)) {
        showToast("Password must be at least 6 characters and include uppercase, lowercase, number, and symbol", "error");
        return;
      }
    }

    try {
      const updateData: any = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        specialization: formData.specialization,
        country: formData.country,
        city: formData.city,
        bio: formData.bio,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      await updateTeacher({ id: user.id, ...updateData }).unwrap();
      showToast("Profile updated successfully!", "success");
      setIsEditing(false);
      refetch();

      // Clear password fields
      setFormData(prev => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
    } catch (error) {
      console.error("Failed to update profile:", error);
      showToast(error?.data?.error || "Failed to update profile", "error");
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        specialization: user.specialization || "",
        country: user.country || "",
        city: user.city || "",
        bio: user.bio || "",
        password: "",
        confirmPassword: "",
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className={`flex-1 min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Loader />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors pt-12 w-full px-6 sm:px-10 pb-20 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="w-full">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 tracking-tight text-gray-900 dark:text-white">
            Teacher Settings
          </h1>
          <p className="text-lg font-medium text-gray-500 dark:text-gray-400 mt-1">
            Manage your teacher profile and change your password
          </p>
        </div>

        <div className={`rounded-lg shadow-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          {/* Profile Header */}
          <div className="h-32 bg-gradient-to-r from-blue-700 to-[#010080]"></div>

          <div className="px-8 py-6">
            <div className="flex items-end -mt-20 mb-6">
              <div className={`w-32 h-32 rounded-full border-4 overflow-hidden ${isDark ? 'border-gray-800' : 'border-white'} shadow-lg bg-gray-200 flex items-center justify-center`}>
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Profile"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-4xl font-bold text-gray-400">
                    {user?.full_name?.charAt(0) || "T"}
                  </div>
                )}
              </div>

              <div className="ml-6 flex-1">
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {user?.full_name}
                </h2>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Teacher Account
                </p>
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-[#010080] hover:bg-[#010080]/90 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit Profile
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Teacher Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${isEditing
                        ? `focus:ring-2 focus:ring-[#010080] ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`
                        : `${isDark ? 'bg-gray-750 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'} cursor-not-allowed`
                        }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${isEditing
                        ? `focus:ring-2 focus:ring-[#010080] ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`
                        : `${isDark ? 'bg-gray-750 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'} cursor-not-allowed`
                        }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${isEditing
                        ? `focus:ring-2 focus:ring-[#010080] ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`
                        : `${isDark ? 'bg-gray-750 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'} cursor-not-allowed`
                        }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Specialization
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${isEditing
                        ? `focus:ring-2 focus:ring-[#010080] ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`
                        : `${isDark ? 'bg-gray-750 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'} cursor-not-allowed`
                        }`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Address & Bio
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${isEditing
                        ? `focus:ring-2 focus:ring-[#010080] ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`
                        : `${isDark ? 'bg-gray-750 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'} cursor-not-allowed`
                        }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${isEditing
                        ? `focus:ring-2 focus:ring-[#010080] ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`
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
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={4}
                    className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${isEditing
                      ? `focus:ring-2 focus:ring-[#010080] ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`
                      : `${isDark ? 'bg-gray-750 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'} cursor-not-allowed`
                      }`}
                  />
                </div>
              </div>

              {isEditing && (
                <div>
                  <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Change Password
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        New Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Leave blank to keep current"
                        className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-[#010080] ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm new password"
                        className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-[#010080] ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {isEditing && (
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className={`px-6 py-2.5 rounded-lg font-semibold transition-colors ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="bg-[#010080] hover:bg-[#010080]/90 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isUpdating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
