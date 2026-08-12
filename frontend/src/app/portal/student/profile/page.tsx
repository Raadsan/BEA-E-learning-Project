"use client";

import { useState, useEffect, useRef } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetCurrentUserQuery } from "@/lib/api/authApi";
import { useUpdateStudentMutation } from "@/lib/api/studentApi";
import { useToast } from "@/components/Toast";
import Loader from "@/components/Loader";
import { resolveProfileImageUrl } from "@/constants";

export default function StudentProfilePage() {
  const { isDark } = useDarkMode();
  const { showToast } = useToast();
  const { data: authData, isLoading, refetch } = useGetCurrentUserQuery();
  const user = authData?.user || authData;
  const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    residency_country: "",
    residency_city: "",
    password: "",
    confirmPassword: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        phone: user.phone || "",
        residency_country: user.residency_country || "",
        residency_city: user.residency_city || "",
        password: "",
        confirmPassword: "",
      });
      setSelectedImage(null);
      setImagePreview(null);
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isPasswordChange = Boolean(formData.password.trim() && formData.confirmPassword.trim());
    if (isPasswordChange) {
      if (formData.password !== formData.confirmPassword) {
        showToast("Passwords do not match", "error");
        return;
      }
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
      if (!passwordRegex.test(formData.password)) {
        showToast("Password must be at least 6 characters with uppercase, lowercase, number, and symbol", "error");
        return;
      }
    }

    try {
      const submitData = new FormData();
      submitData.append("id", user.id || user.student_id);
      submitData.append("full_name", formData.full_name);
      submitData.append("phone", formData.phone);
      submitData.append("residency_country", formData.residency_country);
      submitData.append("residency_city", formData.residency_city);
      if (isPasswordChange) submitData.append("password", formData.password);
      if (selectedImage) submitData.append("profile_picture", selectedImage);

      await updateStudent(submitData).unwrap();
      showToast("Profile updated successfully!", "success");
      setIsEditing(false);
      refetch();
      setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error: any) {
      showToast(error?.data?.message || "Failed to update profile", "error");
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        phone: user.phone || "",
        residency_country: user.residency_country || "",
        residency_city: user.residency_city || "",
        password: "",
        confirmPassword: "",
      });
      setSelectedImage(null);
      setImagePreview(null);
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

  const profileSrc = imagePreview
    || (user?.profile_picture
      ? resolveProfileImageUrl(user.profile_picture)
      : null);

  const inputClass = (editing: boolean) => `w-full px-4 py-2.5 rounded-lg border transition-colors ${
    editing
      ? `focus:ring-2 focus:ring-[#010080] focus:outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`
      : `cursor-not-allowed ${isDark ? 'bg-gray-750 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'}`
  }`;

  return (
    <div className={`min-h-screen transition-colors pt-4 w-full px-6 sm:px-10 pb-20 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="w-full">
        <div className={`rounded-lg shadow-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-blue-700 to-[#010080]"></div>

          <div className="px-8 py-6">
            {/* Avatar + Name row */}
            <div className="flex items-end -mt-20 mb-6">
              <div className="relative group">
                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                <div
                  className={`w-32 h-32 rounded-full border-4 overflow-hidden ${isDark ? 'border-gray-800' : 'border-white'} shadow-lg bg-gray-200 flex items-center justify-center ${isEditing ? 'cursor-pointer' : ''}`}
                  onClick={() => isEditing && fileInputRef.current?.click()}
                >
                  {profileSrc ? (
                    <img src={profileSrc} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-4xl font-bold text-gray-400">
                      {user?.full_name?.charAt(0) || "S"}
                    </div>
                  )}
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              <div className="ml-6 flex-1">
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{user?.full_name}</h2>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Student Account</p>
                {user?.chosen_program && (
                  <p className={`text-sm mt-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{user.chosen_program}</p>
                )}
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
              {/* Personal Info */}
              <div>
                <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</label>
                    <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} disabled={!isEditing} className={inputClass(isEditing)} />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                    <input type="email" value={user?.email || ""} disabled className={inputClass(false)} />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Phone</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} disabled={!isEditing} className={inputClass(isEditing)} />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Student ID</label>
                    <input type="text" value={user?.student_id || user?.id || ""} disabled className={inputClass(false)} />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Country</label>
                    <input type="text" name="residency_country" value={formData.residency_country} onChange={handleInputChange} disabled={!isEditing} className={inputClass(isEditing)} />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>City</label>
                    <input type="text" name="residency_city" value={formData.residency_city} onChange={handleInputChange} disabled={!isEditing} className={inputClass(isEditing)} />
                  </div>
                </div>
              </div>

              {/* Academic Info (read-only) */}
              <div>
                <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Academic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Program</label>
                    <input type="text" value={user?.chosen_program || "Not Enrolled"} disabled className={inputClass(false)} />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
                    <input type="text" value={user?.approval_status || "Pending"} disabled className={inputClass(false)} />
                  </div>
                </div>
              </div>

              {/* Password Change */}
              {isEditing && (
                <div>
                  <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Change Password</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>New Password</label>
                      <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Leave blank to keep current" className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-[#010080] focus:outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`} />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Confirm Password</label>
                      <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Confirm new password" className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-[#010080] focus:outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`} />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button type="button" onClick={handleCancel} className={`px-6 py-2.5 rounded-lg font-semibold transition-colors ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}>
                    Cancel
                  </button>
                  <button type="submit" disabled={isUpdating} className="bg-[#010080] hover:bg-[#010080]/90 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
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
