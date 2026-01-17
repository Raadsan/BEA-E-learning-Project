"use client";

import React, { useState, useEffect } from "react";

import { useGetTeacherQuery, useUpdateTeacherMutation } from "@/redux/api/teacherApi";
import { useDarkMode } from "@/context/ThemeContext";
import { useToast } from "@/components/Toast";
import Image from "next/image";

export default function TeacherProfilePage() {
    const { isDark } = useDarkMode();
    const { showToast } = useToast();
    const [isEditing, setIsEditing] = useState(false);

    // Get teacher ID from localStorage
    const teacherId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

    const { data: teacherData, isLoading, refetch } = useGetTeacherQuery(teacherId, {
        skip: !teacherId,
    });

    const [updateTeacher, { isLoading: isUpdating }] = useUpdateTeacherMutation();

    // Helper to extract teacher object safely
    const currentTeacher = teacherData?.teacher || teacherData;

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
        if (currentTeacher) {
            setFormData({
                full_name: currentTeacher.full_name || "",
                email: currentTeacher.email || "",
                phone: currentTeacher.phone || "",
                country: currentTeacher.country || "",
                city: currentTeacher.city || "",
                specialization: currentTeacher.specialization || "",
                highest_qualification: currentTeacher.highest_qualification || "",
                years_experience: currentTeacher.years_experience || "",
                bio: currentTeacher.bio || "",
                portfolio_link: currentTeacher.portfolio_link || "",
                skills: currentTeacher.skills || "",
            });
        }
    }, [currentTeacher]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { email, ...updateData } = formData; // Exclude email from update
            await updateTeacher({ id: teacherId, ...updateData }).unwrap();
            showToast("Profile updated successfully!", "success");
            setIsEditing(false);
            refetch();
        } catch (error) {
            console.error("Failed to update profile:", error);
            showToast("Failed to update profile. Please try again.", "error");
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (currentTeacher) {
            setFormData({
                full_name: currentTeacher.full_name || "",
                email: currentTeacher.email || "",
                phone: currentTeacher.phone || "",
                country: currentTeacher.country || "",
                city: currentTeacher.city || "",
                specialization: currentTeacher.specialization || "",
                highest_qualification: currentTeacher.highest_qualification || "",
                years_experience: currentTeacher.years_experience || "",
                bio: currentTeacher.bio || "",
                portfolio_link: currentTeacher.portfolio_link || "",
                skills: currentTeacher.skills || "",
            });
        }
    };

    const getInitials = (name) => {
        return name?.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
    };

    if (isLoading) {
        return (
            <div className={`flex-1 min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                </div>
            </div>
        );
    }

    // Determine role/title context
    const teacherRole = currentTeacher?.city
        ? `Teacher • ${currentTeacher.city}`
        : "Teacher";

    return (
        <div className={`flex-1 min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className={`flex-1 overflow-y-auto pb-20 ${isDark ? "bg-[#0f172a]" : "bg-gray-50"}`}>
                <div className="mx-auto px-6 sm:px-10 py-8">

                    {/* Main Profile Card */}
                    <div className={`rounded-2xl shadow-xl overflow-hidden backdrop-blur-md border ${isDark ? "bg-slate-800/90 border-slate-700" : "bg-white/95 border-gray-100"}`}>

                        <div className="p-6 sm:p-8">
                            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">

                                {/* Avatar */}
                                <div className="relative">
                                    <div className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold shadow-2xl border-4 ${isDark ? "bg-slate-700 text-blue-400 border-slate-800" : "bg-blue-50 text-blue-600 border-white"}`}>
                                        {currentTeacher?.profile_picture ? (
                                            <img src={currentTeacher.profile_picture} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            getInitials(currentTeacher?.full_name || "TC")
                                        )}
                                    </div>
                                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white dark:border-slate-800 rounded-full"></div>
                                </div>

                                {/* Name & Basic Info */}
                                <div className="flex-1 text-center sm:text-left mb-2">
                                    <h1 className={`text-3xl font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                                        {currentTeacher?.full_name || "Teacher"}
                                    </h1>
                                    <p className={`text-sm font-medium flex items-center justify-center sm:justify-start gap-2 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                                        <BriefcaseIcon className="w-4 h-4" />
                                        {teacherRole}
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

                            {/* Left Column: Contact & Personal */}
                            <div className="lg:col-span-1 space-y-6">
                                <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                                    Contact & Location
                                </h3>

                                {isEditing ? (
                                    <>
                                        <div className="space-y-4">
                                            <div>
                                                <label className={`text-xs font-medium mb-1 block ${isDark ? "text-slate-400" : "text-gray-500"}`}>Full Name</label>
                                                <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-gray-300"}`} />
                                            </div>
                                            <div>
                                                <label className={`text-xs font-medium mb-1 block ${isDark ? "text-slate-400" : "text-gray-500"}`}>Phone Number</label>
                                                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-gray-300"}`} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className={`text-xs font-medium mb-1 block ${isDark ? "text-slate-400" : "text-gray-500"}`}>City</label>
                                                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-gray-300"}`} />
                                                </div>
                                                <div>
                                                    <label className={`text-xs font-medium mb-1 block ${isDark ? "text-slate-400" : "text-gray-500"}`}>Country</label>
                                                    <input type="text" name="country" value={formData.country} onChange={handleInputChange} className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-gray-300"}`} />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <InfoItem icon={<MailIcon />} label="Email Address" value={currentTeacher?.email} isDark={isDark} />
                                        <InfoItem icon={<PhoneIcon />} label="Phone Number" value={currentTeacher?.phone} isDark={isDark} />
                                        <InfoItem icon={<MapPinIcon />} label="Location" value={[currentTeacher?.city, currentTeacher?.country].filter(Boolean).join(", ")} isDark={isDark} />
                                    </>
                                )}
                            </div>

                            {/* Right Column: Professional Details */}
                            <div className="lg:col-span-2 space-y-6">
                                <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                                    Professional Information
                                </h3>

                                {isEditing ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className={`text-xs font-medium mb-1 block ${isDark ? "text-slate-400" : "text-gray-500"}`}>Specialization</label>
                                                <input type="text" name="specialization" value={formData.specialization} onChange={handleInputChange} className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-gray-300"}`} />
                                            </div>
                                            <div>
                                                <label className={`text-xs font-medium mb-1 block ${isDark ? "text-slate-400" : "text-gray-500"}`}>Qualification</label>
                                                <input type="text" name="highest_qualification" value={formData.highest_qualification} onChange={handleInputChange} className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-gray-300"}`} />
                                            </div>
                                            <div>
                                                <label className={`text-xs font-medium mb-1 block ${isDark ? "text-slate-400" : "text-gray-500"}`}>Years Experience</label>
                                                <input type="number" name="years_experience" value={formData.years_experience} onChange={handleInputChange} className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-gray-300"}`} />
                                            </div>
                                            <div>
                                                <label className={`text-xs font-medium mb-1 block ${isDark ? "text-slate-400" : "text-gray-500"}`}>Portfolio Link</label>
                                                <input type="url" name="portfolio_link" value={formData.portfolio_link} onChange={handleInputChange} placeholder="https://" className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-gray-300"}`} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={`text-xs font-medium mb-1 block ${isDark ? "text-slate-400" : "text-gray-500"}`}>Skills</label>
                                            <input type="text" name="skills" value={formData.skills} onChange={handleInputChange} placeholder="e.g. React, English Literature" className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-gray-300"}`} />
                                        </div>
                                        <div>
                                            <label className={`text-xs font-medium mb-1 block ${isDark ? "text-slate-400" : "text-gray-500"}`}>Bio</label>
                                            <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows={3} className={`w-full px-3 py-2 rounded-lg border text-sm resize-none ${isDark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-gray-300"}`} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <DetailCard icon={<BookIcon />} label="Specialization" value={currentTeacher?.specialization} isDark={isDark} accentColor="blue" />
                                            <DetailCard icon={<AcademicCapIcon />} label="Qualification" value={currentTeacher?.highest_qualification} isDark={isDark} accentColor="purple" />
                                            <DetailCard icon={<ClockIcon />} label="Experience" value={currentTeacher?.years_experience ? `${currentTeacher.years_experience} Years` : "N/A"} isDark={isDark} accentColor="orange" />
                                            <DetailCard icon={<GlobeIcon />} label="Portfolio" value={currentTeacher?.portfolio_link ? <a href={currentTeacher.portfolio_link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View Portfolio</a> : "N/A"} isDark={isDark} accentColor="green" />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {currentTeacher?.skills && (
                                                <div className={`p-5 rounded-xl border transition-all hover:shadow-md ${isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-gray-100 shadow-sm"}`}>
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className={`p-2 rounded-lg ${isDark ? "bg-teal-900/20 text-teal-400" : "bg-teal-50 text-teal-600"}`}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                                                        </div>
                                                        <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-gray-400"}`}>Skills & Expertise</h4>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {currentTeacher.skills.split(',').map((skill, i) => (
                                                            <span key={i} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isDark ? "bg-slate-700/50 text-slate-200 border border-slate-600 hover:bg-slate-700" : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"}`}>
                                                                {skill.trim()}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className={`p-5 rounded-xl border transition-all hover:shadow-md ${isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-gray-100 shadow-sm"}`}>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className={`p-2 rounded-lg ${isDark ? "bg-indigo-900/20 text-indigo-400" : "bg-indigo-50 text-indigo-600"}`}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                                                    </div>
                                                    <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-gray-400"}`}>Biography</h4>
                                                </div>
                                                <p className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-gray-600"}`}>
                                                    {currentTeacher?.bio || "No biography provided yet."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Subcomponents
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

function DetailCard({ icon, label, value, isDark, accentColor }) {
    const colors = {
        blue: isDark ? "bg-blue-900/20 text-blue-400" : "bg-blue-50 text-blue-600",
        green: isDark ? "bg-green-900/20 text-green-400" : "bg-green-50 text-green-600",
        purple: isDark ? "bg-purple-900/20 text-purple-400" : "bg-purple-50 text-purple-600",
        orange: isDark ? "bg-orange-900/20 text-orange-400" : "bg-orange-50 text-orange-600",
    }[accentColor] || (isDark ? "bg-slate-700 text-slate-300" : "bg-gray-100 text-gray-600");

    return (
        <div className={`p-4 rounded-xl border transition-all hover:shadow-md ${isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-gray-100 shadow-sm"}`}>
            <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${colors}`}>
                    {icon}
                </div>
                <span className={`text-xs font-bold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-gray-400"}`}>
                    {label}
                </span>
            </div>
            <div className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                {value || "N/A"}
            </div>
        </div>
    );
}

// Icons
const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
);
const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
);
const MapPinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
);
const BriefcaseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
);
const BookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>
);
const AcademicCapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
);
const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);
const GlobeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" x2="22" y1="12" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
);
const EditIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
);
