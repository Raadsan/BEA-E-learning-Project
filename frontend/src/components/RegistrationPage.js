"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useCreateStudentMutation } from "@/redux/api/studentApi";
import { useLoginMutation } from "@/redux/api/authApi";

export default function RegistrationPage() {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const { data: programs = [] } = useGetProgramsQuery();
  const [createStudent, { isLoading: isCreating }] = useCreateStudentMutation();
  const [login] = useLoginMutation();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    residency_country: "",
    residency_city: "",
    chosen_program: "",
    password: "",
    parent_name: "",
    parent_email: "",
    parent_phone: "",
    parent_relation: "",
    parent_res_county: "",
    parent_res_city: "",
    termsAccepted: false,
  });

  const [showParentSection, setShowParentSection] = useState(false);
  const [cities, setCities] = useState([]);
  const [parentCities, setParentCities] = useState([]);

  const countriesData = {
    somalia: { name: "Somalia", cities: ["Mogadishu", "Hargeisa", "Kismayo", "Baidoa", "Bosaso", "Beledweyne", "Galkayo", "Burao", "Merca", "Jowhar"] },
    kenya: { name: "Kenya", cities: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Malindi", "Kitale", "Garissa", "Nyeri"] },
    ethiopia: { name: "Ethiopia", cities: ["Addis Ababa", "Dire Dawa", "Mekelle", "Gondar", "Hawassa", "Bahir Dar", "Adama", "Jimma", "Dessie", "Jijiga"] },
    djibouti: { name: "Djibouti", cities: ["Djibouti City", "Ali Sabieh", "Tadjoura", "Obock", "Dikhil", "Arta"] },
    uganda: { name: "Uganda", cities: ["Kampala", "Entebbe", "Jinja", "Gulu", "Mbarara", "Mbale", "Mukono", "Masaka", "Lira", "Arua"] },
    tanzania: { name: "Tanzania", cities: ["Dar es Salaam", "Dodoma", "Mwanza", "Arusha", "Mbeya", "Zanzibar City", "Tanga", "Morogoro", "Kigoma", "Tabora"] },
  };

  useEffect(() => {
    if (formData.residency_country) {
      // Find the country data by matching the name
      const countryEntry = Object.entries(countriesData).find(
        ([key, data]) => data.name === formData.residency_country
      );
      if (countryEntry) {
        setCities(countryEntry[1].cities);
        setFormData(prev => ({ ...prev, residency_city: "" }));
      } else {
        setCities([]);
      }
    } else {
      setCities([]);
    }
  }, [formData.residency_country]);

  useEffect(() => {
    if (formData.parent_res_county) {
      // Find the country data by matching the name
      const countryEntry = Object.entries(countriesData).find(
        ([key, data]) => data.name === formData.parent_res_county
      );
      if (countryEntry) {
        setParentCities(countryEntry[1].cities);
        setFormData(prev => ({ ...prev, parent_res_city: "" }));
      } else {
        setParentCities([]);
      }
    } else {
      setParentCities([]);
    }
  }, [formData.parent_res_county]);

  useEffect(() => {
    const age = parseInt(formData.age);
    setShowParentSection(!isNaN(age) && age < 18);
  }, [formData.age]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.termsAccepted) {
      alert("Please accept the terms and conditions to continue.");
      return;
    }

    try {
      // Prepare student data
      const studentData = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone || null,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender || null,
        residency_country: formData.residency_country || null,
        residency_city: formData.residency_city || null,
        chosen_program: formData.chosen_program || null,
        password: formData.password,
        // Parent information (only if age < 18)
        parent_name: formData.parent_name || null,
        parent_email: formData.parent_email || null,
        parent_phone: formData.parent_phone || null,
        parent_relation: formData.parent_relation || null,
        parent_res_county: formData.parent_res_county || null,
        parent_res_city: formData.parent_res_city || null,
      };

      // Create student account
      const response = await createStudent(studentData).unwrap();

      // Check if registration was successful
      if (response.success || response.student) {
        // Auto-login the student after registration
        try {
          const loginResponse = await login({
            email: formData.email,
            password: formData.password
          }).unwrap();

          if (loginResponse.success) {
            // Success - redirect to student dashboard
            alert("Account created successfully! Redirecting to your dashboard...");
            router.push("/portal/student");
          } else {
            // If auto-login fails, redirect to login page
            alert("Account created successfully! Please login to continue.");
            router.push("/auth/login");
          }
        } catch (loginError) {
          // If auto-login fails, redirect to login page
          alert("Account created successfully! Please login to continue.");
          router.push("/auth/login");
        }
      } else {
        alert(response.error || "Failed to create account. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      // Handle different error formats
      const errorMessage =
        error?.data?.error ||
        error?.data?.message ||
        error?.message ||
        "Failed to create account. Please try again.";
      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Brand Section (Fixed, Like Sign In Page) */}
      <div
        className="hidden md:flex md:w-1/2 fixed left-0 top-0 h-screen items-center justify-center"
        style={{ backgroundColor: '#010080' }}
      >
        {/* Background Circle Patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 border-2 border-white rounded-full"></div>
          <div className="absolute top-1/3 right-10 w-20 h-20 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-1/3 left-20 w-24 h-24 border-2 border-white rounded-full"></div>
          <div className="absolute top-2/3 left-1/3 w-36 h-36 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-10 left-1/2 w-28 h-28 border-2 border-white rounded-full"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-12">
          {/* Logo */}
          <div className="mb-8">
            <Image
              src="/images/footerlogo.png"
              alt="BEA Logo"
              width={280}
              height={100}
              className="mx-auto"
            />
          </div>

          {/* Welcome Text */}
          <h1 className="text-4xl font-serif font-bold text-white mb-4">
            Join BEA Today!
          </h1>
          <p className="text-blue-200 text-lg leading-relaxed max-w-md mx-auto">
            Start your journey to English mastery with our comprehensive courses designed for all levels.
          </p>

          {/* Features */}
          <div className="mt-12 space-y-4 text-left max-w-sm mx-auto">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-sm">Access 100+ interactive lessons</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-sm">Track your learning progress</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm">Watch recorded classes anytime</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-sm">Learn from expert instructors</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form (Scrollable) */}
      <div className="w-full md:w-1/2 md:ml-[50%] min-h-screen flex flex-col p-4 sm:p-6 md:p-8 lg:p-12 bg-gray-50 overflow-y-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4 self-start"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm font-medium">Go Back</span>
        </button>

        <div className="w-full max-w-xl py-6 mx-auto flex-grow flex flex-col justify-center">
          {/* Mobile Logo */}
          <div className="md:hidden text-center mb-6 sm:mb-8">
            <Image
              src="/images/headerlogo.png"
              alt="BEA Logo"
              width={180}
              height={60}
              className="mx-auto"
            />
          </div>

          {/* Form Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-2" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
              Create Account
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Fill in your details to get started
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Enter full name"
                className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 bg-white text-gray-800 text-base"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="m@example.com"
                className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 bg-white text-gray-800 text-base"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+252 61-*******"
                className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 bg-white text-gray-800 text-base"
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Enter age"
                min="1"
                className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 bg-white text-gray-800 text-base"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
              <div className="relative">
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-5 py-4 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 bg-white text-gray-800 text-base appearance-none cursor-pointer"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Residency Country */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Residency Country</label>
              <div className="relative">
                <select
                  name="residency_country"
                  value={formData.residency_country}
                  onChange={handleChange}
                  className="w-full px-5 py-4 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 bg-white text-gray-800 text-base appearance-none cursor-pointer"
                >
                  <option value="">Select country</option>
                  {Object.entries(countriesData).map(([key, data]) => (
                    <option key={key} value={data.name}>{data.name}</option>
                  ))}
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Residency City */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Residency City</label>
              <div className="relative">
                <select
                  name="residency_city"
                  value={formData.residency_city}
                  onChange={handleChange}
                  className="w-full px-5 py-4 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 bg-white text-gray-800 text-base appearance-none cursor-pointer"
                  disabled={!formData.residency_country}
                >
                  <option value="">Select city</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Chosen Program */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Chosen Program</label>
              <div className="relative">
                <select
                  name="chosen_program"
                  value={formData.chosen_program}
                  onChange={handleChange}
                  className="w-full px-5 py-4 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 bg-white text-gray-800 text-base appearance-none cursor-pointer"
                >
                  <option value="">Select Program</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.title}>{program.title}</option>
                  ))}
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password <span className="text-red-500">*</span></label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 bg-white text-gray-800 text-base"
                required
              />
            </div>

            {/* Parent/Guardian Section */}
            {showParentSection && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" style={{ color: '#010080' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Parent/Guardian Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Parent/Guardian Name</label>
                    <input
                      type="text"
                      name="parent_name"
                      value={formData.parent_name}
                      onChange={handleChange}
                      placeholder="Enter parent/guardian name"
                      className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 bg-white text-gray-800 text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Parent/Guardian Email</label>
                    <input
                      type="email"
                      name="parent_email"
                      value={formData.parent_email}
                      onChange={handleChange}
                      placeholder="parent@example.com"
                      className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 bg-white text-gray-800 text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Parent/Guardian Phone</label>
                    <input
                      type="tel"
                      name="parent_phone"
                      value={formData.parent_phone}
                      onChange={handleChange}
                      placeholder="+252 61-*******"
                      className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 bg-white text-gray-800 text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Relationship</label>
                    <div className="relative">
                      <select
                        name="parent_relation"
                        value={formData.parent_relation}
                        onChange={handleChange}
                        className="w-full px-5 py-4 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 bg-white text-gray-800 text-base appearance-none cursor-pointer"
                      >
                        <option value="">Select relationship</option>
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Guardian">Guardian</option>
                      </select>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Parent/Guardian Residency Country</label>
                    <div className="relative">
                      <select
                        name="parent_res_county"
                        value={formData.parent_res_county}
                        onChange={handleChange}
                        className="w-full px-5 py-4 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 bg-white text-gray-800 text-base appearance-none cursor-pointer"
                      >
                        <option value="">Select country</option>
                        {Object.entries(countriesData).map(([key, data]) => (
                          <option key={key} value={data.name}>{data.name}</option>
                        ))}
                      </select>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Parent/Guardian Residency City</label>
                    <div className="relative">
                      <select
                        name="parent_res_city"
                        value={formData.parent_res_city}
                        onChange={handleChange}
                        className="w-full px-5 py-4 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 bg-white text-gray-800 text-base appearance-none cursor-pointer"
                        disabled={!formData.parent_res_county}
                      >
                        <option value="">Select city</option>
                        {parentCities.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Terms */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                required
              />
              <span className="text-sm text-gray-600">
                I accept the <Link href="/terms" className="font-semibold hover:underline" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>Terms</Link> and <Link href="/privacy" className="font-semibold hover:underline" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>Privacy Policy</Link>
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isCreating}
              className="w-full py-4 rounded-xl text-white font-semibold text-lg transition-all duration-300 hover:opacity-90 hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#010080' }}
            >
              {isCreating ? "Creating Account..." : "Create Account"}
            </button>

            {/* Login Link */}
            <p className="text-center text-gray-600 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold hover:underline" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
                Sign in
              </Link>
            </p>
          </form>

          {/* Back to Home */}

        </div>
      </div>
    </div>
  );
}
