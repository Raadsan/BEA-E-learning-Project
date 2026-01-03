"use client";

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
    isUpdatingIelts
}) {
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
                                <div>
                                    <label htmlFor="full_name" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
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
                                        className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'
                                            }`}
                                    />
                                </div>
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
                                        className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'
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
                                        className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'
                                            }`}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="gender" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                        Gender
                                    </label>
                                    <select
                                        id="gender"
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-600'
                                            }`}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
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
                                        className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-600'
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
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-600'
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
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required={!editingStudent}
                                        placeholder={editingStudent ? "Leave blank to keep current" : "Enter password"}
                                        className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'
                                            }`}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="confirmPassword" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                        Confirm {editingStudent ? 'New ' : ''}Password {!editingStudent && <span className="text-red-500">*</span>}
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        required={!editingStudent || !!formData.password}
                                        placeholder="Confirm password"
                                        className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'
                                            }`}
                                    />
                                </div>
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
                                            className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-600'
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
                                            className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-600'
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
                                            className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-600'
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
                            disabled={isCreating || isUpdating || isUpdatingIelts}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isCreating || isUpdating ? "Saving..." : editingStudent ? "Update Student" : "Add Student"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
