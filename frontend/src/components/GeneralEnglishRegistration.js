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

const courseLevels = [
  { value: "a1", label: "A1 - Beginner" },
  { value: "a2", label: "A2 - Elementary" },
  { value: "a2plus", label: "A2+ - Pre-Intermediate" },
  { value: "b1", label: "B1 - Intermediate" },
  { value: "b1plus", label: "B1+ - Intermediate Plus" },
  { value: "b2", label: "B2 - Upper-Intermediate" },
  { value: "c1", label: "C1 - Advanced" },
  { value: "c2", label: "C2 - Advanced Plus" },
];

export default function GeneralEnglishRegistration({ isOpen, onClose, selectedLevel = "" }) {
  const { isDarkMode } = useTheme();
  const [cities, setCities] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    country: '',
    city: '',
    courseLevel: selectedLevel,
    bookingDate: '',
    bookingTime: '',
    termsAccepted: false
  });

  // Update course level when selectedLevel prop changes
  useEffect(() => {
    if (selectedLevel) {
      setFormData(prev => ({ ...prev, courseLevel: selectedLevel }));
    }
  }, [selectedLevel]);

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
    console.log('8-Level General English Registration:', formData);
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white">
            8-Level General English Registration
          </h1>
          <p className="text-blue-200 text-sm mt-1">Fill in your details to enroll</p>
        </div>

        {/* Course Information Notice */}
        <div className="mx-6 mt-6">
          <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-blue-50 border border-blue-200' : 'bg-amber-50 border border-amber-200'}`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className={`w-5 h-5 mt-0.5 ${isDarkMode ? 'text-blue-400' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className={`text-sm font-semibold mb-1 ${isDarkMode ? '' : 'text-amber-800'}`} style={isDarkMode ? { color: '#010080' } : {}}>Important Information</h4>
                <ul className={`text-xs leading-relaxed space-y-1 ${isDarkMode ? '' : 'text-amber-700'}`} style={isDarkMode ? { color: '#000000' } : {}}>
                  <li>• Classes are held <strong>Monday to Saturday</strong></li>
                  <li>• Each session is <strong>2 hours</strong> long</li>
                  <li>• Payment is required before the first class</li>
                  <li>• Books and materials will be provided</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Section 1: Personal Information */}
          <div className="border-b border-gray-200 pb-5">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-700">1</span>
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
                <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Age" min="5" max="100" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none text-gray-800 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
                <div className="relative">
                  <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none text-gray-800 text-sm bg-white appearance-none cursor-pointer" required>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
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

          {/* Section 2: Course & Booking */}
          <div className="pb-5">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-700">2</span>
              Course & Booking
            </h3>

            {/* Course Level */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Course Level</label>
              <div className="relative">
                <select name="courseLevel" value={formData.courseLevel} onChange={handleChange} className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none text-gray-800 text-sm bg-white appearance-none cursor-pointer" required>
                  <option value="">Select level</option>
                  {courseLevels.map((level) => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </span>
              </div>
            </div>

            {/* Booking Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Booking Date</label>
                <input 
                  type="date" 
                  name="bookingDate" 
                  value={formData.bookingDate} 
                  onChange={handleChange} 
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none text-gray-800 text-sm bg-white" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Booking Time</label>
                <div className="relative">
                  <select 
                    name="bookingTime" 
                    value={formData.bookingTime} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none text-gray-800 text-sm bg-white appearance-none cursor-pointer" 
                    required
                  >
                    <option value="">Select time</option>
                    <option value="08:00">08:00 AM</option>
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                    <option value="17:00">05:00 PM</option>
                    <option value="18:00">06:00 PM</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </span>
                </div>
              </div>
            </div>
          </div>

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

