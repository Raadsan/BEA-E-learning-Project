"use client";

import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Country } from 'country-state-city';
import CountrySelect from '@/components/CountrySelect';

export default function TeacherForm({
    isOpen,
    onClose,
    editingTeacher,
    formData,
    setFormData,
    handleInputChange,
    handleSubmit,
    isDark,
    isCreating,
    isUpdating,
    cities = []
}) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
            <div
                className={`relative rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header - Sticky */}
                <div className={`sticky top-0 z-10 border-b px-6 py-4 flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                    <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {editingTeacher ? "Edit Teacher" : "Add New Teacher"}
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

                {/* Form Content - Scrollable */}
                <form id="teacherForm" onSubmit={handleSubmit} className="flex flex-col h-full max-h-[calc(90vh-120px)]">
                    <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
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
                                    placeholder="e.g. John Doe"
                                    className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'
                                        }`}
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="email@example.com"
                                    className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'
                                        }`}
                                />
                            </div>

                            <div>
                                <label className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Phone Number
                                </label>
                                <PhoneInput
                                    country={(() => {
                                        if (formData.country) {
                                            const c = Country.getAllCountries().find(c => c.name === formData.country);
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
                                        border: '2px solid',
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
                                <label htmlFor="country" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Country
                                </label>
                                <CountrySelect
                                    value={formData.country}
                                    onChange={(val) => setFormData(prev => ({ ...prev, country: val, city: "" }))}
                                    isDark={isDark}
                                    placeholder="Select country"
                                />
                            </div>

                            <div>
                                <label htmlFor="city" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    City
                                </label>
                                <div className="relative">
                                    <select
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        disabled={!formData.country}
                                        className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500 bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27none%27%20viewBox%3D%270%200%2024%2024%27%20stroke%3D%27%239ca3af%27%3E%3Cpath%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%20stroke-width%3D%272%27%20d%3D%27M19%209l-7%207-7-7%27%2F%3E%3C%2Fsvg%3E")] bg-[length:1.25rem_1.25rem] bg-[right_1rem_center] bg-no-repeat' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-600 bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27none%27%20viewBox%3D%270%200%2024%2024%27%20stroke%3D%27%236b7280%27%3E%3Cpath%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%20stroke-width%3D%272%27%20d%3D%27M19%209l-7%207-7-7%27%2F%3E%3C%2Fsvg%3E")] bg-[length:1.25rem_1.25rem] bg-[right_1rem_center] bg-no-repeat'
                                            }`}
                                    >
                                        <option value="">Select city</option>
                                        {cities.map((city, idx) => (
                                            <option key={idx} value={city.name}>{city.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="hire_date" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Hire Date
                                </label>
                                <input
                                    type="date"
                                    id="hire_date"
                                    name="hire_date"
                                    value={formData.hire_date}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-600'
                                        }`}
                                />
                            </div>

                            <div>
                                <label htmlFor="specialization" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Specialization
                                </label>
                                <input
                                    type="text"
                                    id="specialization"
                                    name="specialization"
                                    value={formData.specialization}
                                    onChange={handleInputChange}
                                    placeholder="e.g. English Professor"
                                    className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'
                                        }`}
                                />
                            </div>

                            <div>
                                <label htmlFor="highest_qualification" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Highest Qualification
                                </label>
                                <input
                                    type="text"
                                    id="highest_qualification"
                                    name="highest_qualification"
                                    value={formData.highest_qualification}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Master's Degree"
                                    className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'
                                        }`}
                                />
                            </div>

                            <div>
                                <label htmlFor="years_experience" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Years of Experience
                                </label>
                                <input
                                    type="number"
                                    id="years_experience"
                                    name="years_experience"
                                    value={formData.years_experience}
                                    onChange={handleInputChange}
                                    min="0"
                                    className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-600'
                                        }`}
                                />
                            </div>

                            <div>
                                <label htmlFor="portfolio_link" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Portfolio Link
                                </label>
                                <input
                                    type="url"
                                    id="portfolio_link"
                                    name="portfolio_link"
                                    value={formData.portfolio_link}
                                    onChange={handleInputChange}
                                    placeholder="https://..."
                                    className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'
                                        }`}
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {editingTeacher ? "New Password (optional)" : "Password *"}
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required={!editingTeacher}
                                    placeholder="••••••••"
                                    className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'
                                        }`}
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Confirm Password {editingTeacher ? "(optional)" : "*"}
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    required={!editingTeacher || !!formData.password}
                                    placeholder="••••••••"
                                    className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'
                                        }`}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="skills" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Skills
                                </label>
                                <textarea
                                    id="skills"
                                    name="skills"
                                    value={formData.skills}
                                    onChange={handleInputChange}
                                    rows={2}
                                    placeholder="e.g. Project Management, Teaching..."
                                    className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'
                                        }`}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="bio" className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Bio
                                </label>
                                <textarea
                                    id="bio"
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder="Enter a brief biography..."
                                    className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'
                                        }`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer - Sticky */}
                    <div className={`sticky bottom-0 z-10 border-t px-6 py-4 flex items-center justify-end gap-3 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        }`}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 border-2 rounded-xl font-semibold transition-all ${isDark
                                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isCreating || isUpdating}
                            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isCreating || isUpdating ? "Saving..." : editingTeacher ? "Update Teacher" : "Add Teacher"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
