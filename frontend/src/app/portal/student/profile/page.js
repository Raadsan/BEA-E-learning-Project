"use client";

import { useState, useEffect, useRef } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useUpdateStudentMutation } from "@/redux/api/studentApi";
import { useToast } from "@/components/Toast";
import Loader from "@/components/Loader";

export default function StudentProfilePage() {
  const { isDark } = useDarkMode();
  const { showToast } = useToast();
  const { data: user, isLoading, refetch } = useGetCurrentUserQuery();
  const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    residency_country: "",
    residency_city: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        phone: user.phone || "",
        residency_country: user.residency_country || "",
        residency_city: user.residency_city || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      // Reset image state when user data refreshes
      setSelectedImage(null);
      setImagePreview(null);
    }
  }, [user]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        showToast("New passwords do not match", "error");
        return;
      }
      if (!formData.currentPassword) {
        showToast("Current password is required to set a new password", "error");
        return;
      }
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
      if (!passwordRegex.test(formData.newPassword)) {
        showToast("New password must be at least 6 characters and include uppercase, lowercase, number, and symbol", "error");
        return;
      }
    }

    try {
      const submitData = new FormData();
      submitData.append("id", user.id || user.student_id);
      submitData.append("phone", formData.phone);
      submitData.append("residency_country", formData.residency_country);
      submitData.append("residency_city", formData.residency_city);

      if (formData.newPassword) {
        submitData.append("currentPassword", formData.currentPassword);
        submitData.append("password", formData.newPassword);
      }

      if (selectedImage) {
        submitData.append("profile_picture", selectedImage);
      }

      await updateStudent(submitData).unwrap();
      showToast("Profile updated successfully!", "success");
      setIsEditing(false);
      refetch();

      // Clear passwords and image selection after success
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Failed to update profile:", error);
      showToast(error?.data?.message || "Failed to update profile", "error");
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        phone: user.phone || "",
        residency_country: user.residency_country || "",
        residency_city: user.residency_city || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSelectedImage(null);
      setImagePreview(null);
    }
    setIsEditing(false);
  };

  const getInitials = (name) => {
    return name?.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
  };

  if (isLoading) {
    return (
      <div className={`flex-1 min-h-screen flex flex-col items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors pt-12 w-full px-6 sm:px-10 pb-20 ${isDark ? "bg-[#0f172a]" : "bg-gray-50"}`}>
      <div className="w-full">

        {/* Main Profile Card */}
        <div className={`rounded-2xl shadow-xl overflow-hidden backdrop-blur-md border ${isDark ? "bg-slate-800/90 border-slate-700" : "bg-white/95 border-gray-100"}`}>

          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">

              {/* Avatar */}
              <div className="relative group">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <div
                  className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold shadow-2xl border-4 overflow-hidden relative ${isDark ? "bg-slate-700 text-blue-400 border-slate-800" : "bg-blue-600 text-white border-white"} ${isEditing ? "cursor-pointer" : ""}`}
                  onClick={() => isEditing && fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : user?.profile_picture ? (
                    <img src={user.profile_picture.startsWith('http') ? user.profile_picture : `http://localhost:5000${user.profile_picture}`} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    getInitials(user?.full_name || "ST")
                  )}

                  {isEditing && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <CameraIcon className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
                {/* <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white dark:border-slate-800 rounded-full z-10"></div> */}
              </div>

              {/* Name & Basic Info */}
              <div className="flex-1 text-center sm:text-left mb-2">
                <h1 className={`text-3xl font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                  {user?.full_name}
                </h1>
                <p className={`text-sm font-medium flex items-center justify-center sm:justify-start gap-2 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                  <UserIcon className="w-4 h-4" />
                  Student Account
                </p>
              </div>

              {/* Edit Button */}
              <div className="flex gap-3">
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${isDark ? "bg-slate-700 hover:bg-slate-600 text-white border border-slate-600" : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm"}`}>
                    <EditIcon className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button onClick={handleCancel} className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${isDark ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-700"}`}>
                      Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={isUpdating} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all disabled:opacity-50 flex items-center gap-2">
                      {isUpdating ? "Saving..." : "Save Changes"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className={`h-px w-full ${isDark ? "bg-slate-700" : "bg-gray-100"}`}></div>

          {/* Details Grid */}
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column: Contact */}
            <div className="lg:col-span-1 space-y-6">
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                Contact Information
              </h3>

              <InfoItem icon={<MailIcon />} label="Email Address" value={user?.email} isDark={isDark} />

              {isEditing ? (
                <>
                  <div>
                    <label className={`text-xs font-medium mb-1.5 block ${isDark ? "text-slate-400" : "text-gray-500"}`}>Phone Number</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={`w-full px-4 py-3 rounded-lg border text-sm transition-all focus:ring-2 focus:ring-blue-500/20 ${isDark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-gray-300"}`} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`text-xs font-medium mb-1.5 block ${isDark ? "text-slate-400" : "text-gray-500"}`}>Country</label>
                      <input type="text" name="residency_country" value={formData.residency_country} onChange={handleInputChange} className={`w-full px-4 py-3 rounded-lg border text-sm transition-all focus:ring-2 focus:ring-blue-500/20 ${isDark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-gray-300"}`} />
                    </div>
                    <div>
                      <label className={`text-xs font-medium mb-1.5 block ${isDark ? "text-slate-400" : "text-gray-500"}`}>City</label>
                      <input type="text" name="residency_city" value={formData.residency_city} onChange={handleInputChange} className={`w-full px-4 py-3 rounded-lg border text-sm transition-all focus:ring-2 focus:ring-blue-500/20 ${isDark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-gray-300"}`} />
                    </div>
                  </div>

                </>
              ) : (
                <>
                  <InfoItem icon={<PhoneIcon />} label="Phone Number" value={user?.phone} isDark={isDark} />
                  <InfoItem
                    icon={<MapPinIcon />}
                    label="Location"
                    value={[user?.residency_city, user?.residency_country].filter(Boolean).join(", ")}
                    isDark={isDark}
                  />
                </>
              )}
            </div>

            {/* Right Column: Academic Details (Read Only) */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                Academic Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailCard
                  icon={<BookIcon />}
                  label="Enrolled Program"
                  value={user?.program_name || user?.chosen_program}
                  subValue={user?.subprogram_name}
                  isDark={isDark}
                  accentColor="blue"
                />

                <DetailCard
                  icon={<ShieldIcon />}
                  label="Account Status"
                  value={user?.approval_status || "Pending"}
                  isDark={isDark}
                  accentColor={user?.approval_status === "approved" ? "green" : "yellow"}
                />

                <DetailCard
                  icon={<HashIcon />}
                  label="Student ID"
                  value={user?.id || "N/A"}
                  isDark={isDark}
                  accentColor="purple"
                />

                <DetailCard
                  icon={<CalendarIcon />}
                  label="Joined Date"
                  value={user?.created_at ? user.created_at.split(' ')[0] : "N/A"}
                  isDark={isDark}
                  accentColor="orange"
                />
              </div>

              {isEditing && (
                <div className="pt-6 border-t border-slate-700">
                  <h4 className={`text-sm font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Change Password (Optional)</h4>
                  <div className="space-y-4">
                    <div>
                      <label className={`text-xs font-medium mb-1.5 block ${isDark ? "text-slate-400" : "text-gray-500"}`}>Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          placeholder="Current password"
                          className={`w-full px-4 py-3 rounded-lg border text-sm transition-all focus:ring-2 focus:ring-blue-500/20 ${isDark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-gray-300"}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`text-xs font-medium mb-1.5 block ${isDark ? "text-slate-400" : "text-gray-500"}`}>New Password</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            placeholder="Min 6 chars + symbols"
                            className={`w-full px-4 py-3 rounded-lg border text-sm transition-all focus:ring-2 focus:ring-blue-500/20 ${isDark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-gray-300"}`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showNewPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className={`text-xs font-medium mb-1.5 block ${isDark ? "text-slate-400" : "text-gray-500"}`}>Confirm Password</label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Confirm password"
                            className={`w-full px-4 py-3 rounded-lg border text-sm transition-all focus:ring-2 focus:ring-blue-500/20 ${isDark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-gray-300"}`}
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
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

// --- Subcomponents ---

function InfoItem({ icon, label, value, isDark }) {
  return (
    <div className="flex items-start gap-4">
      <div className={`p-2.5 rounded-lg shrink-0 ${isDark ? "bg-slate-700/50 text-slate-300" : "bg-gray-50 text-gray-500"}`}>
        {icon}
      </div>
      <div>
        <p className={`text-xs font-medium mb-0.5 ${isDark ? "text-slate-400" : "text-gray-500"}`}>{label}</p>
        <p className={`text-sm font-semibold break-all ${isDark ? "text-slate-200" : "text-gray-900"}`}>{value || "Not Set"}</p>
      </div>
    </div>
  );
}

function DetailCard({ icon, label, value, subValue, isDark, accentColor }) {
  const colors = {
    blue: isDark ? "bg-blue-900/20 text-blue-400" : "bg-blue-50 text-blue-600",
    green: isDark ? "bg-green-900/20 text-green-400" : "bg-green-50 text-green-600",
    yellow: isDark ? "bg-yellow-900/20 text-yellow-400" : "bg-yellow-50 text-yellow-600",
    purple: isDark ? "bg-purple-900/20 text-purple-400" : "bg-purple-50 text-purple-600",
    orange: isDark ? "bg-orange-900/20 text-orange-400" : "bg-orange-50 text-orange-600",
  }[accentColor] || (isDark ? "bg-slate-700 text-slate-300" : "bg-gray-100 text-gray-600");

  return (
    <div className={`p-4 rounded-xl border transition-all hover:shadow-md ${isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-gray-100 shadow-sm"
      }`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${colors}`}>
          {icon}
        </div>
        <span className={`text-xs font-bold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-gray-400"}`}>
          {label}
        </span>
      </div>
      <div className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
        {value || "N/A"}
      </div>
      {subValue && (
        <div className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
          {subValue}
        </div>
      )}
    </div>
  );
}

// --- Icons (SVGs) ---

const UserIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);

const MailIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
);

const PhoneIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
);

const MapPinIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
);

const BookIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>
);

const ShieldIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /></svg>
);

const HashIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="9" y2="9" /><line x1="4" x2="20" y1="15" y2="15" /><line x1="10" x2="8" y1="3" y2="21" /><line x1="16" x2="14" y1="3" y2="21" /></svg>
);

const CalendarIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
);

const EditIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
);

const EyeIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
);

const EyeOffIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
);

const CameraIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
);
