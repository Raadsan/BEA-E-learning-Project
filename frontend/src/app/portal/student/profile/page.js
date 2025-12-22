"use client";

import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useDarkMode } from "@/context/ThemeContext";

export default function StudentProfilePage() {
  const { isDark } = useDarkMode();
  const { data: user, isLoading } = useGetCurrentUserQuery();

  if (isLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-gray-900" : "bg-gray-100"
        }`}
      >
        <p className={isDark ? "text-gray-300" : "text-gray-700"}>
          Loading your profile...
        </p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors ${
        isDark ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      <div className="max-w-4xl mx-auto p-6">
        <div
          className={`mb-6 p-6 rounded-xl shadow ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h1
            className={`text-2xl font-bold mb-2 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Profile
          </h1>
          <p className={isDark ? "text-gray-300" : "text-gray-600"}>
            Review your personal and contact information.
          </p>
        </div>

        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
            isDark ? "text-gray-200" : "text-gray-800"
          }`}
        >
          <ProfileField label="Full Name" value={user?.full_name} />
          <ProfileField label="Email" value={user?.email} />
          <ProfileField label="Phone" value={user?.phone} />
          <ProfileField label="Country" value={user?.residency_country} />
          <ProfileField label="City" value={user?.residency_city} />
          <ProfileField label="Program" value={user?.chosen_program} />
          <ProfileField
            label="Approval Status"
            value={user?.approval_status || "pending"}
          />
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, value }) {
  return (
    <div className="p-4 rounded-lg bg-white/60 shadow-sm border border-gray-200">
      <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
        {label}
      </div>
      <div className="text-sm text-gray-900">{value || "Not provided"}</div>
    </div>
  );
}


