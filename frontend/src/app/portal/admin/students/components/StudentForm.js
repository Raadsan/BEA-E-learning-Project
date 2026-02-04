"use client";
import { useState, useEffect } from "react";

import { Country } from "country-state-city";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import CountrySelect from '@/components/CountrySelect';

export default function StudentForm({
    isOpen,
    onClose,
    editingStudent,
    formData,
    handleInputChange,
    setFormData,
    handleSubmit,
    isDark,
    programs,
    cities,
    showParentInfo,
    parentCities,
    viewingPayments,
    isCreating,
    isUpdating,
    isUpdatingIelts,
    isCreatingIelts,
    paymentPackages = []
}) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isUploadingFile, setIsUploadingFile] = useState(false);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploadingFile(true);
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
            const token = localStorage.getItem("token");
            const res = await fetch(`${baseUrl}/api/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formDataUpload
            });

            const data = await res.json();
            if (res.ok && data.url) {
                setFormData(prev => ({ ...prev, certificate_document: data.url }));
            } else {
                alert(data.error || "Upload failed");
            }
        } catch (err) {
            console.error("Upload error:", err);
            alert("Failed to upload file");
        } finally {
            setIsUploadingFile(false);
        }
    };

    // Auto-calculate funding amount
    useEffect(() => {
        if (!formData.chosen_program) return;

        const selectedProgram = programs.find(p => p.title === formData.chosen_program);
        const programPrice = selectedProgram ? Number(selectedProgram.price) : 0;

        let calculatedAmount = formData.funding_amount;

        if (formData.funding_status === "Paid") {
            calculatedAmount = programPrice.toString();
        } else if (formData.funding_status === "Full Scholarship") {
            calculatedAmount = "0";
        } else if (formData.funding_status === "Partial Scholarship") {
            if (formData.scholarship_percentage) {
                const percentage = Number(formData.scholarship_percentage) || 0;
                calculatedAmount = (programPrice * (1 - percentage / 100)).toFixed(2);
            }
        } else if (formData.funding_status === "Sponsorship") {
            if (formData.sponsorship_package) {
                const pkg = paymentPackages.find(p => p.package_name === formData.sponsorship_package);
                const duration = pkg ? Number(pkg.duration_months) : 1;
                calculatedAmount = (programPrice * duration).toFixed(2);
            }
        }

        // Only update if it actually changed and we have valid data
        if (calculatedAmount !== formData.funding_amount) {
            setFormData(prev => ({ ...prev, funding_amount: calculatedAmount }));
        }
    }, [
        formData.chosen_program,
        formData.funding_status,
        formData.sponsorship_package,
        formData.scholarship_percentage,
        programs,
        paymentPackages,
        setFormData
    ]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                aria-hidden="true"
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
                        {editingStudent ? "Edit Student" : "Add New Student"}
                    </h2>
                    <button
                        onClick={onClose}
                        className={`transition-colors ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[85vh]">
                    <div className="p-6 space-y-6 flex-grow overflow-y-auto">
                        {/* Student Information Section */}
                        <div className={`p-5 rounded-xl border-2 ${isDark ? 'bg-gray-700/20 border-gray-700' : 'bg-blue-50/30 border-blue-100'
                            }`}>
                            <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-blue-400' : 'text-blue-600'
                                }`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Student Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                {/* Row 1: Name | Email */}
                                {(editingStudent?.type === 'ielts' || (formData.chosen_program && (formData.chosen_program.toUpperCase().includes("IELTS") || formData.chosen_program.toUpperCase().includes("TOEFL")))) ? (
                                    <>
                                        <div>
                                            <label htmlFor="first_name" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                First Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="first_name"
                                                name="first_name"
                                                value={formData.first_name || ""}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Enter first name"
                                                className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'}`}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="last_name" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Last Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="last_name"
                                                name="last_name"
                                                value={formData.last_name || ""}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Enter last name"
                                                className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'}`}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div>
                                        <label htmlFor="full_name" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="full_name"
                                            name="full_name"
                                            value={formData.full_name}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Enter full name"
                                            className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'}`}
                                        />
                                    </div>
                                )}
                                <div>
                                    <label htmlFor="email" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="example@gmail.com"
                                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'
                                            }`}
                                    />
                                </div>

                                {/* Row 2: Age | Gender */}
                                <div>
                                    <label htmlFor="age" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                        Age
                                    </label>
                                    <input
                                        type="number"
                                        id="age"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleInputChange}
                                        min="1"
                                        placeholder="Enter age"
                                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'
                                            }`}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="sex" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                        Sex
                                    </label>
                                    <select
                                        id="sex"
                                        name="sex"
                                        value={formData.sex}
                                        onChange={handleInputChange}
                                        required
                                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-600'
                                            }`}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>

                                {/* Row 2.5: DOB | POB */}
                                <div>
                                    <label htmlFor="date_of_birth" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Date of Birth
                                    </label>
                                    <input
                                        type="date"
                                        id="date_of_birth"
                                        name="date_of_birth"
                                        value={formData.date_of_birth}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'}`}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="place_of_birth" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Place of Birth
                                    </label>
                                    <input
                                        type="text"
                                        id="place_of_birth"
                                        name="place_of_birth"
                                        value={formData.place_of_birth}
                                        onChange={handleInputChange}
                                        placeholder="City of birth"
                                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'}`}
                                    />
                                </div>

                                {/* Row 3: Country | City */}
                                <div>
                                    <label htmlFor="residency_country" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                        Residency Country
                                    </label>
                                    <CountrySelect
                                        value={formData.residency_country}
                                        onChange={(value) => {
                                            handleInputChange({ target: { name: 'residency_country', value } });
                                            handleInputChange({ target: { name: 'residency_city', value: '' } });
                                        }}
                                        isDark={isDark}
                                        placeholder="Select Country"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="residency_city" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                        Residency City
                                    </label>
                                    <select
                                        id="residency_city"
                                        name="residency_city"
                                        value={formData.residency_city}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-600'
                                            }`}
                                        disabled={!formData.residency_country}
                                    >
                                        <option value="">Select City</option>
                                        {cities.map((city) => (
                                            <option key={city.name} value={city.name}>{city.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Row 4: Phone | Program */}
                                <div>
                                    <label htmlFor="phone" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                        Phone Number
                                    </label>
                                    <PhoneInput
                                        country={(() => {
                                            if (formData.residency_country) {
                                                const c = Country.getAllCountries().find(c => c.name === formData.residency_country);
                                                return c ? c.isoCode.toLowerCase() : 'us';
                                            }
                                            return 'us';
                                        })()}
                                        enableSearch={true}
                                        separateDialCode={false}
                                        value={formData.phone}
                                        onChange={phone => setFormData(prev => ({ ...prev, phone }))}
                                        inputStyle={{
                                            width: '100%',
                                            height: '46px',
                                            fontSize: '16px',
                                            borderRadius: '0.75rem',
                                            border: 'none',
                                            backgroundColor: 'transparent',
                                            color: isDark ? '#60a5fa' : '#2563eb',
                                            paddingLeft: '48px'
                                        }}
                                        containerStyle={{
                                            width: '100%',
                                            border: '1px solid',
                                            borderColor: isDark ? '#4b5563' : '#e5e7eb',
                                            borderRadius: '0.75rem',
                                            backgroundColor: isDark ? '#1f2937' : 'white',
                                            boxShadow: 'none'
                                        }}
                                        buttonStyle={{
                                            border: 'none',
                                            backgroundColor: 'transparent',
                                            borderRadius: '0.75rem 0 0 0.75rem',
                                            paddingLeft: '12px',
                                            paddingRight: '0px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            color: isDark ? '#60a5fa' : '#2563eb',
                                            fontSize: '16px',
                                            cursor: 'default',
                                            width: '40px'
                                        }}
                                        dropdownStyle={{
                                            color: 'black',
                                            borderRadius: '0.75rem',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="chosen_program" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                        Chosen Program
                                    </label>
                                    <select
                                        id="chosen_program"
                                        name="chosen_program"
                                        value={formData.chosen_program}
                                        onChange={(e) => {
                                            handleInputChange(e);
                                            // Reset sponsorship package if program changes
                                            setFormData(prev => ({ ...prev, sponsorship_package: "" }));
                                        }}
                                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-600'
                                            }`}
                                    >
                                        <option value="">Select Program</option>
                                        {programs.map((program) => (
                                            <option key={program.id} value={program.title}>
                                                {program.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Row 5: Password | Confirm Password */}
                                <div>
                                    <label htmlFor="password" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                        {editingStudent ? 'New Password' : 'Password'} {!editingStudent && <span className="text-red-500">*</span>}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            required={!editingStudent}
                                            placeholder={editingStudent ? "Leave blank to keep current" : "Enter password"}
                                            className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'
                                                }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="confirmPassword" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                        Confirm {editingStudent ? 'New ' : ''}Password {!editingStudent && <span className="text-red-500">*</span>}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            required={!editingStudent || !!formData.password}
                                            placeholder={editingStudent ? "Repeat new password" : "Repeat password"}
                                            className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'
                                                }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* IELTS / TOEFL Specific Details */}
                        {formData.chosen_program && (formData.chosen_program.toUpperCase().includes("IELTS") || formData.chosen_program.toUpperCase().includes("TOEFL")) && (
                            <div className={`p-5 rounded-xl border-2 ${isDark ? 'bg-indigo-900/10 border-indigo-700/30' : 'bg-indigo-50/30 border-indigo-100'
                                }`}>
                                <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-indigo-400' : 'text-indigo-600'
                                    }`}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    IELTS / TOEFL Assessment Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                    <div>
                                        <label htmlFor="verification_method" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                            }`}>
                                            Verification Method
                                        </label>
                                        <select
                                            id="verification_method"
                                            name="verification_method"
                                            value={formData.verification_method}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500' : 'bg-white border-gray-200 text-gray-900 focus:border-indigo-600'
                                                }`}
                                        >
                                            <option value="Proficiency Exam">Take Proficiency Exam</option>
                                            <option value="Certificate">Have Certificate</option>
                                        </select>
                                    </div>

                                    {formData.verification_method === 'Certificate' ? (
                                        <>
                                            <div>
                                                <label htmlFor="certificate_institution" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                                    }`}>
                                                    Certificate Institution
                                                </label>
                                                <input
                                                    type="text"
                                                    id="certificate_institution"
                                                    name="certificate_institution"
                                                    value={formData.certificate_institution}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g., British Council, IDP"
                                                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-600'
                                                        }`}
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="certificate_date" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                                    }`}>
                                                    Certificate Date
                                                </label>
                                                <input
                                                    type="date"
                                                    id="certificate_date"
                                                    name="certificate_date"
                                                    value={formData.certificate_date}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500' : 'bg-white border-gray-200 text-gray-900 focus:border-indigo-600'
                                                        }`}
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                                    }`}>
                                                    Upload Certificate Document (PDF/Image)
                                                </label>
                                                <div className="flex items-center gap-4">
                                                    <input
                                                        type="file"
                                                        id="certificate_document"
                                                        onChange={handleFileUpload}
                                                        accept=".pdf,image/*"
                                                        className="hidden"
                                                    />
                                                    <label
                                                        htmlFor="certificate_document"
                                                        className={`px-4 py-2 rounded-lg cursor-pointer border-2 border-dashed transition-all flex items-center gap-2 ${isDark
                                                            ? 'bg-gray-800 border-gray-600 text-gray-400 hover:border-indigo-500 hover:text-indigo-400'
                                                            : 'bg-gray-50 border-gray-300 text-gray-500 hover:border-indigo-600 hover:text-indigo-600'
                                                            }`}
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                        </svg>
                                                        {isUploadingFile ? "Uploading..." : formData.certificate_document ? "Change Document" : "Select File"}
                                                    </label>
                                                    {formData.certificate_document && (
                                                        <span className="text-sm text-green-500 flex items-center gap-1">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            Uploaded: {formData.certificate_document.split('/').pop()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="md:col-span-2">
                                            <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-600'}`}>
                                                <div className="flex items-center gap-3">
                                                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <p className="text-sm">
                                                        Students opting for the **Proficiency Exam** will be contacted by the admissions team to schedule their test date and time.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Funding Information Section */}
                        <div className={`p-5 rounded-xl border-2 ${isDark ? 'bg-green-900/10 border-green-700/30' : 'bg-green-50/30 border-green-100'
                            }`}>
                            <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-green-400' : 'text-green-600'
                                }`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Funding Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <div>
                                    <label htmlFor="funding_status" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                        Funding Status
                                    </label>
                                    <select
                                        id="funding_status"
                                        name="funding_status"
                                        value={formData.funding_status}
                                        onChange={(e) => {
                                            handleInputChange(e);
                                            // Reset sponsorship package if switching funding status
                                            if (e.target.value !== 'Sponsorship') {
                                                setFormData(prev => ({ ...prev, sponsorship_package: "" }));
                                            }
                                        }}
                                        className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-green-500' : 'bg-white border-gray-200 text-gray-900 focus:border-green-600'
                                            }`}
                                    >
                                        <option value="Paid">Paid</option>
                                        <option value="Full Scholarship">Full Scholarship</option>
                                        <option value="Partial Scholarship">Partial Scholarship</option>
                                        <option value="Sponsorship">Sponsorship</option>
                                    </select>
                                </div>

                                {formData.funding_status === 'Sponsorship' && (
                                    <>
                                        <div>
                                            <label htmlFor="sponsor_name" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                                }`}>
                                                Sponsor Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="sponsor_name"
                                                name="sponsor_name"
                                                value={formData.sponsor_name || ''}
                                                onChange={handleInputChange}
                                                required={formData.funding_status === 'Sponsorship'}
                                                placeholder="Enter sponsor name"
                                                className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-green-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-600'
                                                    }`}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="sponsorship_package" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                                }`}>
                                                Sponsorship Package <span className="text-red-500">*</span>
                                                {!formData.chosen_program && <span className="text-[10px] font-normal ml-2 text-orange-500">(Select Program First)</span>}
                                            </label>
                                            <select
                                                id="sponsorship_package"
                                                name="sponsorship_package"
                                                value={formData.sponsorship_package}
                                                onChange={handleInputChange}
                                                disabled={!formData.chosen_program}
                                                required={formData.funding_status === 'Sponsorship'}
                                                className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-green-500' : 'bg-white border-gray-200 text-gray-900 focus:border-green-600'
                                                    } ${!formData.chosen_program ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <option value="">{formData.chosen_program ? "Select Package" : "--- Select Program First ---"}</option>
                                                {paymentPackages
                                                    .filter(pkg => pkg.programs?.some(prog => prog.title === formData.chosen_program))
                                                    .map((pkg) => (
                                                        <option key={pkg.id} value={pkg.package_name}>
                                                            {pkg.package_name} ({pkg.duration_months} Months)
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="funding_amount" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                                }`}>
                                                Amount Paid ($)
                                            </label>
                                            <input
                                                type="number"
                                                id="funding_amount"
                                                name="funding_amount"
                                                value={formData.funding_amount}
                                                onChange={handleInputChange}
                                                required={formData.funding_status === 'Sponsorship'}
                                                placeholder="Enter amount"
                                                className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-green-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-600'
                                                    }`}
                                            />
                                        </div>
                                    </>
                                )}

                                {formData.funding_status === 'Paid' && (
                                    <>
                                        <div>
                                            <label htmlFor="funding_amount" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                                }`}>
                                                Amount Paid ($)
                                            </label>
                                            <input
                                                type="number"
                                                id="funding_amount"
                                                name="funding_amount"
                                                value={formData.funding_amount}
                                                onChange={handleInputChange}
                                                required={formData.funding_status === 'Paid'}
                                                placeholder="Enter amount"
                                                className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-green-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-600'
                                                    }`}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="funding_month" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                                }`}>
                                                Month Paid For
                                            </label>
                                            <input
                                                type="text"
                                                id="funding_month"
                                                name="funding_month"
                                                value={formData.funding_month}
                                                onChange={handleInputChange}
                                                required={formData.funding_status === 'Paid'}
                                                placeholder="e.g., January 2026"
                                                className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-green-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-600'
                                                    }`}
                                            />
                                        </div>
                                    </>
                                )}

                                {formData.funding_status === 'Partial Scholarship' && (
                                    <>
                                        <div>
                                            <label htmlFor="scholarship_percentage" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                                }`}>
                                                Scholarship Percentage (%)
                                            </label>
                                            <input
                                                type="number"
                                                id="scholarship_percentage"
                                                name="scholarship_percentage"
                                                value={formData.scholarship_percentage}
                                                onChange={handleInputChange}
                                                required={formData.funding_status === 'Partial Scholarship'}
                                                min="1"
                                                max="99"
                                                placeholder="Enter percentage"
                                                className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-green-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-600'
                                                    }`}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="funding_amount" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                                }`}>
                                                Amount Paid ($)
                                            </label>
                                            <input
                                                type="number"
                                                id="funding_amount"
                                                name="funding_amount"
                                                value={formData.funding_amount}
                                                onChange={handleInputChange}
                                                placeholder="Enter amount paid"
                                                className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-green-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-600'
                                                    }`}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="funding_month" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                                }`}>
                                                Month Paid For
                                            </label>
                                            <input
                                                type="text"
                                                id="funding_month"
                                                name="funding_month"
                                                value={formData.funding_month}
                                                onChange={handleInputChange}
                                                placeholder="e.g., January 2026"
                                                className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-green-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-600'
                                                    }`}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Payment Summary Section (If viewing/editing) */}
                        {editingStudent && viewingPayments && (
                            <div className={`p-5 rounded-xl border-2 ${isDark ? 'bg-yellow-900/10 border-yellow-700/30' : 'bg-yellow-50 border-yellow-100'
                                }`}>
                                <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${isDark ? 'text-yellow-400' : 'text-yellow-600'
                                    }`}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Payment Summary
                                </h3>
                                <p className={isDark ? 'text-gray-200' : 'text-gray-800'}>
                                    {viewingPayments.length === 0
                                        ? "This student has no recorded payments yet."
                                        : (() => {
                                            const totalPaid = viewingPayments
                                                .filter(p => p.status === 'paid' || p.status === 'completed')
                                                .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
                                            return `This student has paid a total of $${totalPaid.toFixed(2)} so far.`;
                                        })()}
                                </p>
                            </div>
                        )}

                        {/* Parent Information Section */}
                        {showParentInfo && (
                            <div className={`p-5 rounded-xl border-2 ${isDark ? 'bg-purple-900/10 border-purple-700/30' : 'bg-purple-50/30 border-purple-100'
                                }`}>
                                <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-purple-400' : 'text-purple-600'
                                    }`}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Parent/Guardian Information
                                    <span className="text-xs font-normal opacity-70 ml-2">(Required for students under 18)</span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                    {/* Row 1: Name | Email */}
                                    <div>
                                        <label htmlFor="parent_name" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                            }`}>
                                            Parent Name
                                        </label>
                                        <input
                                            type="text"
                                            id="parent_name"
                                            name="parent_name"
                                            value={formData.parent_name}
                                            onChange={handleInputChange}
                                            placeholder="Enter parent full name"
                                            className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-600'
                                                }`}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="parent_email" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                            }`}>
                                            Parent Email
                                        </label>
                                        <input
                                            type="email"
                                            id="parent_email"
                                            name="parent_email"
                                            value={formData.parent_email}
                                            onChange={handleInputChange}
                                            placeholder="parent@example.com"
                                            className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-600'
                                                }`}
                                        />
                                    </div>

                                    {/* Row 2: Phone | Relation */}
                                    <div>
                                        <label htmlFor="parent_phone" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                            }`}>
                                            Parent Phone Number
                                        </label>
                                        <PhoneInput
                                            country={(() => {
                                                if (formData.parent_res_county) {
                                                    const c = Country.getAllCountries().find(c => c.name === formData.parent_res_county);
                                                    return c ? c.isoCode.toLowerCase() : 'us';
                                                }
                                                return 'us';
                                            })()}
                                            enableSearch={true}
                                            separateDialCode={false}
                                            value={formData.parent_phone}
                                            onChange={phone => setFormData(prev => ({ ...prev, parent_phone: phone }))}
                                            inputStyle={{
                                                width: '100%',
                                                height: '46px',
                                                fontSize: '16px',
                                                borderRadius: '0.75rem',
                                                border: 'none',
                                                backgroundColor: 'transparent',
                                                color: isDark ? '#60a5fa' : '#2563eb',
                                                paddingLeft: '48px'
                                            }}
                                            containerStyle={{
                                                width: '100%',
                                                border: '1px solid',
                                                borderColor: isDark ? '#4b5563' : '#e5e7eb',
                                                borderRadius: '0.75rem',
                                                backgroundColor: isDark ? '#1f2937' : 'white',
                                                boxShadow: 'none'
                                            }}
                                            buttonStyle={{
                                                border: 'none',
                                                backgroundColor: 'transparent',
                                                borderRadius: '0.75rem 0 0 0.75rem',
                                                paddingLeft: '12px',
                                                paddingRight: '0px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                color: isDark ? '#60a5fa' : '#2563eb',
                                                fontSize: '16px',
                                                cursor: 'default',
                                                width: '40px'
                                            }}
                                            dropdownStyle={{
                                                color: 'black',
                                                borderRadius: '0.75rem',
                                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="parent_relation" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                            }`}>
                                            Parent Relation
                                        </label>
                                        <input
                                            type="text"
                                            id="parent_relation"
                                            name="parent_relation"
                                            value={formData.parent_relation}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Father, Mother, Guardian"
                                            className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-600'
                                                }`}
                                        />
                                    </div>

                                    {/* Row 3: Residency Country | Residency City */}
                                    <div>
                                        <label htmlFor="parent_res_county" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                            }`}>
                                            Parent Residency Country
                                        </label>
                                        <CountrySelect
                                            value={formData.parent_res_county}
                                            onChange={(value) => {
                                                handleInputChange({ target: { name: 'parent_res_county', value } });
                                                handleInputChange({ target: { name: 'parent_res_city', value: '' } });
                                            }}
                                            isDark={isDark}
                                            placeholder="Select Country"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="parent_res_city" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                            }`}>
                                            Parent Residency City
                                        </label>
                                        <select
                                            id="parent_res_city"
                                            name="parent_res_city"
                                            value={formData.parent_res_city}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-purple-500' : 'bg-white border-gray-200 text-gray-900 focus:border-purple-600'
                                                }`}
                                            disabled={!formData.parent_res_county}
                                        >
                                            <option value="">Select City</option>
                                            {parentCities.map((city, index) => (
                                                <option key={`${city.name}-${index}`} value={city.name}>{city.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Sticky Footer for Buttons */}
                    <div className={`sticky bottom-0 z-20 px-6 py-4 border-t flex justify-end gap-3 ${isDark
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-white border-gray-200'
                        }`}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 border rounded-lg transition-colors ${isDark
                                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isCreating || isUpdating || isUpdatingIelts || isCreatingIelts}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isCreating || isUpdating || isCreatingIelts ? "Saving..." : editingStudent ? "Update Student" : "Add Student"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const EyeIcon = ({ size = 20 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
);

const EyeOffIcon = ({ size = 20 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
);
