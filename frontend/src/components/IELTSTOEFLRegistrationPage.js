"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";
import { useCreateIeltsToeflStudentMutation } from "@/redux/api/ieltsToeflApi";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useToast, Toast } from "@/components/Toast"; // Import Toast component and hook

// Countries data for dynamic city selection
const countriesData = {
  somalia: { name: "Somalia", cities: ["Mogadishu", "Hargeisa", "Kismayo", "Baidoa", "Bosaso", "Merca", "Beledweyne", "Galkayo", "Jowhar", "Afgooye"] },
  ethiopia: { name: "Ethiopia", cities: ["Addis Ababa", "Dire Dawa", "Mekelle", "Gondar", "Hawassa", "Bahir Dar", "Jimma", "Dessie", "Jijiga", "Harar"] },
  kenya: { name: "Kenya", cities: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Malindi", "Garissa", "Kitale", "Nyeri"] },
  djibouti: { name: "Djibouti", cities: ["Djibouti City", "Ali Sabieh", "Tadjoura", "Obock", "Dikhil", "Arta"] },
  uganda: { name: "Uganda", cities: ["Kampala", "Gulu", "Lira", "Mbarara", "Jinja", "Mbale", "Mukono", "Masaka", "Kasese", "Hoima"] },
  tanzania: { name: "Tanzania", cities: ["Dar es Salaam", "Dodoma", "Mwanza", "Arusha", "Mbeya", "Zanzibar City", "Tanga", "Morogoro", "Kigoma", "Tabora"] },
};

export default function IELTSTOEFLRegistrationPage() {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const [cities, setCities] = useState([]);
  const [createIeltsStudent, { isLoading }] = useCreateIeltsToeflStudentMutation();
  const { data: programsData, isLoading: programsLoading } = useGetProgramsQuery();
  const { toast, showToast, hideToast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: '',
    country: '',
    city: '',
    chosen_program: '', // Will be set to first program from database
    examType: '',
    hasCertificate: '',
    certificateInstitution: '',
    certificateDate: '',
    certificateDocument: '', // To store filename
    examBookingDate: '',
    examBookingTime: '',
    termsAccepted: false
  });

  // Update cities when country changes
  useEffect(() => {
    if (formData.country && countriesData[formData.country]) {
      setCities(countriesData[formData.country].cities);
      setFormData(prev => ({ ...prev, city: '' }));
    } else {
      setCities([]);
    }
  }, [formData.country]);

  // Set default program when programs are loaded
  useEffect(() => {
    if (programsData && Array.isArray(programsData) && programsData.length > 0) {
      // Robustly find the IELTS program (case-insensitive)
      const ieltsProgram = programsData.find(p => p.title.toLowerCase().includes('ielts'));

      // If found and not currently set, or set to something else, force it
      if (ieltsProgram && formData.chosen_program !== ieltsProgram.title) {
        setFormData(prev => ({ ...prev, chosen_program: ieltsProgram.title }));
      }
    }
  }, [programsData, formData.chosen_program]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'file') {
      // Handle file input - just store filename for now as backend doesn't support upload yet
      const fileName = files[0]?.name || '';
      setFormData(prev => ({
        ...prev,
        certificateDocument: fileName
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.examType) {
      showToast("Please select an exam type", "error");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    if (formData.password.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }
    if (!formData.hasCertificate && !formData.examBookingDate) {
      // If no certificate, must book exam (unless logic allows otherwise, but form implies one or other)
      // Actually the UI forces selection via accordion
    }

    try {
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        chosen_program: formData.chosen_program,
        age: parseInt(formData.age),
        gender: formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1), // Capitalize
        residency_country: countriesData[formData.country]?.name || formData.country,
        residency_city: formData.city.charAt(0).toUpperCase() + formData.city.slice(1), // Capitalize city if needed
        exam_type: formData.examType.toUpperCase(),
        verification_method: formData.hasCertificate === 'yes' ? 'Certificate' : 'Exam Booking',
        certificate_institution: formData.certificateInstitution || null,
        certificate_date: formData.certificateDate || null,
        certificate_document: formData.certificateDocument || null,
        exam_booking_date: formData.examBookingDate || null,
        exam_booking_time: formData.examBookingTime || null,
      };

      await createIeltsStudent(payload).unwrap();
      showToast("Registration submitted successfully!", "success");

      // Wait a bit before redirecting
      setTimeout(() => {
        router.push('/website/programs/ielts-toefl');
      }, 2000);

    } catch (err) {
      console.error("Registration Error:", err);
      showToast(err?.data?.message || "Registration failed. Please try again.", "error");
    }
  };

  return (
    <div className={`min-h-screen py-12 ${isDarkMode ? 'bg-[#03002e]' : 'bg-gray-50'}`}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
          duration={toast.duration}
        />
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="p-6 text-center rounded-t-2xl mb-6" style={{ background: 'linear-gradient(to right, #010080, #0000b3)' }}>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
              </svg>
            </div>
            <h1 className="text-2xl font-serif font-bold text-white">
              IELTS & TOEFL Registration
            </h1>
            <p className="text-blue-200 text-sm mt-1">Complete your registration for exam preparation</p>
          </div>

          {/* Main Content Card */}
          <div className={`rounded-2xl shadow-2xl overflow-hidden ${isDarkMode ? 'bg-[#050040]' : 'bg-white'}`}>
            {/* Admission Requirement Notice */}
            <div className="mx-6 mt-6">
              <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-blue-50 border border-blue-200' : 'bg-amber-50 border border-amber-200'}`}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg className={`w-5 h-5 mt-0.5 ${isDarkMode ? 'text-blue-400' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className={`text-sm font-semibold mb-1 ${isDarkMode ? '' : 'text-amber-800'}`} style={isDarkMode ? { color: '#010080' } : {}}>Admission Requirement</h4>
                    <p className={`text-xs leading-relaxed space-y-1 ${isDarkMode ? '' : 'text-amber-700'}`} style={isDarkMode ? { color: '#000000' } : {}}>
                      To be admitted in our IELTS and TOEFL preparation course, all students should provide an <strong>advanced level English proficiency certificate</strong> or an <strong>English diploma</strong> from a highly respected educational institution. If you don&apos;t have one, you will need to take our proficiency exam.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              {/* Section 1: Personal Information */}
              <div className="border-b border-gray-200 pb-5">
                <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: '#010080' }}>1</span>
                  Personal Information
                </h3>

                {/* Name Row */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={`block text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>First Name</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First name" className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none text-sm ${isDarkMode ? 'bg-[#040030] border-gray-600 text-white' : 'border-gray-300 text-gray-800'}`} required />
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Last Name</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last name" className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none text-sm ${isDarkMode ? 'bg-[#040030] border-gray-600 text-white' : 'border-gray-300 text-gray-800'}`} required />
                  </div>
                </div>

                {/* Email */}
                <div className="mb-4">
                  <label className={`block text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none text-sm ${isDarkMode ? 'bg-[#040030] border-gray-600 text-white' : 'border-gray-300 text-gray-800'}`} required />
                </div>

                {/* Phone */}
                <div className="mb-4">
                  <label className={`block text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Phone</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+252 61-*******" className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none text-sm ${isDarkMode ? 'bg-[#040030] border-gray-600 text-white' : 'border-gray-300 text-gray-800'}`} required />
                </div>

                {/* Password */}
                <div className="mb-4">
                  <label className={`block text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Create a password" className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none text-sm ${isDarkMode ? 'bg-[#040030] border-gray-600 text-white' : 'border-gray-300 text-gray-800'}`} required minLength="6" />
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Minimum 6 characters</p>
                </div>

                {/* Confirm Password */}
                <div className="mb-4">
                  <label className={`block text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Confirm Password</label>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm your password" className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none text-sm ${isDarkMode ? 'bg-[#040030] border-gray-600 text-white' : 'border-gray-300 text-gray-800'}`} required />
                </div>

                {/* Age & Gender */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={`block text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Age</label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Age" min="16" max="100" className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none text-sm ${isDarkMode ? 'bg-[#040030] border-gray-600 text-white' : 'border-gray-300 text-gray-800'}`} required />
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Gender</label>
                    <div className="relative">
                      <select name="gender" value={formData.gender} onChange={handleChange} className={`w-full px-4 py-3 pr-10 border rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none text-sm appearance-none cursor-pointer ${isDarkMode ? 'bg-[#040030] border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`} required>
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                      <span className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Country & City */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Country</label>
                    <div className="relative">
                      <select name="country" value={formData.country} onChange={handleChange} className={`w-full px-4 py-3 pr-10 border rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none text-sm appearance-none cursor-pointer ${isDarkMode ? 'bg-[#040030] border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`} required>
                        <option value="">Select country</option>
                        {Object.entries(countriesData).map(([key, data]) => (
                          <option key={key} value={key}>{data.name}</option>
                        ))}
                      </select>
                      <span className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>City</label>
                    <div className="relative">
                      <select name="city" value={formData.city} onChange={handleChange} className={`w-full px-4 py-3 pr-10 border rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none text-sm appearance-none cursor-pointer ${isDarkMode ? 'bg-[#040030] border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`} required disabled={!formData.country}>
                        <option value="">Select city</option>
                        {cities.map((city) => (
                          <option key={city} value={city.toLowerCase()}>{city}</option>
                        ))}
                      </select>
                      <span className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Program Selection */}
                <div>
                  <label className={`block text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Select Program</label>
                  <div className="relative">
                    <select
                      name="chosen_program"
                      value={formData.chosen_program}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 pr-10 border rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none text-sm appearance-none cursor-not-allowed bg-gray-100 dark:bg-gray-800 ${isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'}`}
                      required
                      disabled
                    >
                      <option value="">Select a program</option>
                      {programsLoading ? (
                        <option disabled>Loading programs...</option>
                      ) : (
                        Array.isArray(programsData) && programsData.map((program) => (
                          <option key={program.id} value={program.title}>
                            {program.title}
                          </option>
                        ))
                      )}
                    </select>
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: Certificate Question */}
              <div className="pb-5">
                <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: '#010080' }}>2</span>
                  English Proficiency Verification
                </h3>

                {/* Stacked Row Options */}
                <div className="space-y-3">
                  {/* Option 1: I Have Certificate */}
                  <div
                    className="rounded-xl overflow-hidden"
                    style={{ border: formData.hasCertificate === 'yes' ? '2px solid #010080' : '1px solid #e5e7eb' }}
                  >
                    {/* Clickable Header */}
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        hasCertificate: prev.hasCertificate === 'yes' ? '' : 'yes',
                        examBookingDate: '',
                        examBookingTime: ''
                      }))}
                      className={`w-full py-4 px-4 flex items-center justify-between transition-all duration-200 ${formData.hasCertificate === 'yes'
                        ? 'text-white'
                        : isDarkMode ? 'bg-[#040030] text-gray-200 hover:bg-[#050040]' : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      style={formData.hasCertificate === 'yes' ? { backgroundColor: '#010080' } : {}}
                    >
                      <span className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${formData.hasCertificate === 'yes' ? 'bg-white/20' : isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                          }`}>
                          <svg className={`w-5 h-5 ${formData.hasCertificate === 'yes' ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <span className="font-semibold text-sm">I Have a Certificate</span>
                          <p className={`text-xs ${formData.hasCertificate === 'yes' ? 'text-blue-200' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Upload your English proficiency certificate
                          </p>
                        </div>
                      </span>
                      <svg className={`w-5 h-5 transition-transform duration-300 ${formData.hasCertificate === 'yes' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Expandable Content */}
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${formData.hasCertificate === 'yes' ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                      <div className={`p-4 border-t space-y-4 ${isDarkMode ? 'bg-[#040030] border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                        {/* Document Upload */}
                        <div>
                          <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Upload Certificate Document</label>
                          <label className={`flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${isDarkMode ? 'border-gray-600 bg-[#030020] hover:bg-[#040030]' : 'border-gray-300 bg-white hover:bg-gray-50'}`}>
                            <div className="flex flex-col items-center justify-center">
                              <svg className={`w-6 h-6 mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {formData.certificateDocument ? (
                                  <span className={`font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{formData.certificateDocument}</span>
                                ) : (
                                  <>
                                    <span className={`font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Click to upload</span> (PDF, JPG, PNG)
                                  </>
                                )}
                              </p>
                            </div>
                            <input type="file" name="certificateDocument" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} className="hidden" />
                          </label>
                        </div>

                        {/* College Name & Date - Parallel */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={`block text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>College/Institution</label>
                            <input
                              type="text"
                              name="certificateInstitution"
                              value={formData.certificateInstitution}
                              onChange={handleChange}
                              placeholder="e.g. British Council"
                              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none text-sm ${isDarkMode ? 'bg-[#030020] border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                              required={formData.hasCertificate === 'yes'}
                            />
                          </div>
                          <div>
                            <label className={`block text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Date Obtained</label>
                            <input
                              type="date"
                              name="certificateDate"
                              value={formData.certificateDate}
                              onChange={handleChange}
                              max={new Date().toISOString().split('T')[0]}
                              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none text-sm ${isDarkMode ? 'bg-[#030020] border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                              required={formData.hasCertificate === 'yes'}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Option 2: Take Proficiency Exam */}
                  <div
                    className="rounded-xl overflow-hidden"
                    style={{ border: formData.hasCertificate === 'no' ? '2px solid #010080' : '1px solid #e5e7eb' }}
                  >
                    {/* Clickable Header */}
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        hasCertificate: prev.hasCertificate === 'no' ? '' : 'no',
                        certificateInstitution: '',
                        certificateDate: ''
                      }))}
                      className={`w-full py-4 px-4 flex items-center justify-between transition-all duration-200 ${formData.hasCertificate === 'no'
                        ? 'text-white'
                        : isDarkMode ? 'bg-[#040030] text-gray-200 hover:bg-[#050040]' : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      style={formData.hasCertificate === 'no' ? { backgroundColor: '#010080' } : {}}
                    >
                      <span className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${formData.hasCertificate === 'no' ? 'bg-white/20' : isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                          }`}>
                          <svg className={`w-5 h-5 ${formData.hasCertificate === 'no' ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <span className="font-semibold text-sm">Take Proficiency Exam</span>
                          <p className={`text-xs ${formData.hasCertificate === 'no' ? 'text-blue-200' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Book a date for your assessment exam
                          </p>
                        </div>
                      </span>
                      <svg className={`w-5 h-5 transition-transform duration-300 ${formData.hasCertificate === 'no' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Expandable Content */}
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${formData.hasCertificate === 'no' ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                      <div className={`p-4 border-t space-y-4 ${isDarkMode ? 'bg-[#040030] border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Please select a date and time for your English proficiency assessment exam.</p>

                        {/* Exam Date & Time - Parallel */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={`block text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Exam Date</label>
                            <input
                              type="date"
                              name="examBookingDate"
                              value={formData.examBookingDate}
                              onChange={handleChange}
                              min={new Date().toISOString().split('T')[0]}
                              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none text-sm ${isDarkMode ? 'bg-[#030020] border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                              required={formData.hasCertificate === 'no'}
                            />
                          </div>
                          <div>
                            <label className={`block text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Exam Time</label>
                            <div className="relative">
                              <select
                                name="examBookingTime"
                                value={formData.examBookingTime}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 pr-10 border rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none text-sm appearance-none cursor-pointer ${isDarkMode ? 'bg-[#030020] border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                                required={formData.hasCertificate === 'no'}
                              >
                                <option value="">Select time</option>
                                <option value="08:00">08:00 AM</option>
                                <option value="09:00">09:00 AM</option>
                                <option value="10:00">10:00 AM</option>
                                <option value="11:00">11:00 AM</option>
                                <option value="14:00">02:00 PM</option>
                                <option value="15:00">03:00 PM</option>
                                <option value="16:00">04:00 PM</option>
                              </select>
                              <span className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Exam Type */}
              <div className="pb-5 border-b border-gray-200">
                <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: '#010080' }}>3</span>
                  Exam Type
                </h3>
                <div className="relative">
                  <select name="examType" value={formData.examType} onChange={handleChange} className={`w-full px-4 py-3 pr-10 border rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none text-sm appearance-none cursor-pointer ${isDarkMode ? 'bg-[#040030] border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`} required>
                    <option value="">Select exam type</option>
                    <option value="ielts">IELTS</option>
                    <option value="toefl">TOEFL</option>
                  </select>
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 rounded-xl text-white font-semibold text-lg transition-all duration-300 hover:opacity-90 hover:shadow-lg flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                style={{ backgroundColor: '#010080' }}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Submit Registration'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
