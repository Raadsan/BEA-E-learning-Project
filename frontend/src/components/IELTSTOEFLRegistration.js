"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

// Countries data for dynamic city selection
const countriesData = {
  somalia: { name: "Somalia", cities: ["Mogadishu", "Hargeisa", "Kismayo", "Baidoa", "Bosaso", "Merca", "Beledweyne", "Galkayo", "Jowhar", "Afgooye"] },
  ethiopia: { name: "Ethiopia", cities: ["Addis Ababa", "Dire Dawa", "Mekelle", "Gondar", "Hawassa", "Bahir Dar", "Jimma", "Dessie", "Jijiga", "Harar"] },
  kenya: { name: "Kenya", cities: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Malindi", "Garissa", "Kitale", "Nyeri"] },
  djibouti: { name: "Djibouti", cities: ["Djibouti City", "Ali Sabieh", "Tadjoura", "Obock", "Dikhil", "Arta"] },
  uganda: { name: "Uganda", cities: ["Kampala", "Gulu", "Lira", "Mbarara", "Jinja", "Mbale", "Mukono", "Masaka", "Kasese", "Hoima"] },
  tanzania: { name: "Tanzania", cities: ["Dar es Salaam", "Dodoma", "Mwanza", "Arusha", "Mbeya", "Zanzibar City", "Tanga", "Morogoro", "Kigoma", "Tabora"] },
};

export default function IELTSTOEFLRegistration({ isOpen, onClose }) {
  const { isDarkMode } = useTheme();
  const [cities, setCities] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: '',
    sex: '',
    country: '',
    city: '',
    examType: '',
    hasCertificate: '',
    certificateInstitution: '',
    certificateDate: '',
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('IELTS/TOEFL Registration:', formData);
    alert('Registration submitted successfully!');
    onClose();
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {/* Header */}
        <div className="p-6 text-center" style={{ background: 'linear-gradient(to right, #010080, #0000b3)' }}>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white">
            IELTS & TOEFL Registration
          </h1>
          <p className="text-blue-200 text-sm mt-1">Complete your registration for exam preparation</p>
        </div>

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
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: '#010080' }}>1</span>
              Personal Information
            </h3>

            {/* Name Row */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">First Name</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First name" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none text-gray-800 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last name" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none text-gray-800 text-sm" required />
              </div>
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none text-gray-800 text-sm" required />
            </div>

            {/* Phone */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+252 61-*******" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none text-gray-800 text-sm" required />
            </div>

            {/* Age & Gender */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Age</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Age" min="16" max="100" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none text-gray-800 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Sex</label>
                <div className="relative">
                  <select name="sex" value={formData.sex} onChange={handleChange} className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none text-gray-800 text-sm bg-white appearance-none cursor-pointer" required>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </span>
                </div>
              </div>
            </div>

            {/* Country & City */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Country</label>
                <div className="relative">
                  <select name="country" value={formData.country} onChange={handleChange} className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none text-gray-800 text-sm bg-white appearance-none cursor-pointer" required>
                    <option value="">Select country</option>
                    {Object.entries(countriesData).map(([key, data]) => (
                      <option key={key} value={key}>{data.name}</option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                <div className="relative">
                  <select name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none text-gray-800 text-sm bg-white appearance-none cursor-pointer" required disabled={!formData.country}>
                    <option value="">Select city</option>
                    {cities.map((city) => (
                      <option key={city} value={city.toLowerCase()}>{city}</option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Certificate Question */}
          <div className="pb-5">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: '#010080' }}>2</span>
              English Proficiency Verification
            </h3>

            {/* Stacked Row Options */}
            <div className="space-y-3">
              {/* Option 1: I Have Certificate */}
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: formData.hasCertificate === 'yes' ? '2px' : '1px solid #e5e7eb' }}
              >
                {/* Clickable Header */}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    hasCertificate: prev.hasCertificate === 'yes' ? '' : 'yes',
                    // Clear exam booking data when selecting certificate
                    examBookingDate: '',
                    examBookingTime: ''
                  }))}
                  className={`w-full py-4 px-4 flex items-center justify-between transition-all duration-200 ${formData.hasCertificate === 'yes'
                      ? 'text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  style={formData.hasCertificate === 'yes' ? { backgroundColor: '#010080' } : {}}
                >
                  <span className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${formData.hasCertificate === 'yes' ? 'bg-white/20' : 'bg-gray-100'
                      }`}>
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <span className="font-semibold text-sm">I Have a Certificate</span>
                      <p className={`text-xs ${formData.hasCertificate === 'yes' ? 'text-blue-200' : 'text-gray-500'}`}>
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
                  <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-4">
                    {/* Document Upload */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Certificate Document</label>
                      <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-xs text-gray-500"><span className="font-semibold text-gray-700">Click to upload</span> (PDF, JPG, PNG)</p>
                        </div>
                        <input type="file" name="certificateDocument" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} className="hidden" />
                      </label>
                    </div>

                    {/* College Name & Date - Parallel */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">College/Institution</label>
                        <input
                          type="text"
                          name="certificateInstitution"
                          value={formData.certificateInstitution}
                          onChange={handleChange}
                          placeholder="e.g. British Council"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none text-gray-800 text-sm bg-white"
                          required={formData.hasCertificate === 'yes'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Date Obtained</label>
                        <input
                          type="date"
                          name="certificateDate"
                          value={formData.certificateDate}
                          onChange={handleChange}
                          max={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none text-gray-800 text-sm bg-white"
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
                style={{ border: formData.hasCertificate === 'no' ? '2px' : '1px solid #e5e7eb' }}
              >
                {/* Clickable Header */}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    hasCertificate: prev.hasCertificate === 'no' ? '' : 'no',
                    // Clear certificate data when selecting exam
                    certificateInstitution: '',
                    certificateDate: ''
                  }))}
                  className={`w-full py-4 px-4 flex items-center justify-between transition-all duration-200 ${formData.hasCertificate === 'no'
                      ? 'text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  style={formData.hasCertificate === 'no' ? { backgroundColor: '#010080' } : {}}
                >
                  <span className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${formData.hasCertificate === 'no' ? 'bg-white/20' : 'bg-gray-100'
                      }`}>
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <span className="font-semibold text-sm">Take Proficiency Exam</span>
                      <p className={`text-xs ${formData.hasCertificate === 'no' ? 'text-blue-200' : 'text-gray-500'}`}>
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
                  <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-4">
                    <p className="text-xs text-gray-600">Please select a date and time for your English proficiency assessment exam.</p>

                    {/* Exam Date & Time - Parallel */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Exam Date</label>
                        <input
                          type="date"
                          name="examBookingDate"
                          value={formData.examBookingDate}
                          onChange={handleChange}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none text-gray-800 text-sm bg-white"
                          required={formData.hasCertificate === 'no'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Exam Time</label>
                        <div className="relative">
                          <select
                            name="examBookingTime"
                            value={formData.examBookingTime}
                            onChange={handleChange}
                            className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none text-gray-800 text-sm bg-white appearance-none cursor-pointer"
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
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
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

          {/* Terms */}
          {/* <div className="flex items-start gap-2">
              <input 
                type="checkbox" 
                name="termsAccepted" 
                checked={formData.termsAccepted} 
                onChange={handleChange} 
                className="mt-1 w-4 h-4 rounded border-gray-300 text-gray-800 focus:ring-gray-500" 
                required 
              />
              <span className="text-sm text-gray-600">
                I accept the <Link href="/terms" className="text-gray-800 hover:underline font-medium">Terms</Link> and <Link href="/privacy" className="text-gray-800 hover:underline font-medium">Privacy Policy</Link>
              </span>
            </div> */}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 rounded-xl text-white font-semibold text-lg transition-all duration-300 hover:opacity-90 hover:shadow-lg"
            style={{ backgroundColor: '#010080' }}
          >
            Submit Registration
          </button>
        </form>
      </div>
    </div>
  );
}

