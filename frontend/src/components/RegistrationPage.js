"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useGetSubprogramsQuery } from "@/redux/api/subprogramApi";
import { useCreateStudentMutation } from "@/redux/api/studentApi";
import { useLoginMutation } from "@/redux/api/authApi";
import { useToast } from "@/components/Toast";
import { Country, City } from "country-state-city";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import CountrySelect from "@/components/CountrySelect";

const EyeIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
);

const EyeOffIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
);

export default function RegistrationPage() {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const { data: programs = [], isLoading: programsLoading } = useGetProgramsQuery();
  const { data: subprograms = [] } = useGetSubprogramsQuery();
  const [createStudent, { isLoading: isCreating }] = useCreateStudentMutation();
  const [login] = useLoginMutation();
  const { showToast } = useToast();

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
    parent_res_city: "",
    termsAccepted: false,
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [showParentSection, setShowParentSection] = useState(false);
  const [cities, setCities] = useState([]);
  const [parentCities, setParentCities] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const formRef = useRef(null);

  // Payment specific state for Step 3
  const [paymentMethod, setPaymentMethod] = useState('waafi'); // 'waafi' or 'bank'
  const [paymentAccountNumber, setPaymentAccountNumber] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState(null); const [requiresPin, setRequiresPin] = useState(false);
  const [waafiTransactionId, setWaafiTransactionId] = useState(null);
  const [pin, setPin] = useState(''); const APPLICATION_FEE = 0.01;

  useEffect(() => {
    if (formData.residency_country) {
      const countries = Country.getAllCountries();
      const country = countries.find(c => c.name === formData.residency_country);
      if (country) {
        setCities(City.getCitiesOfCountry(country.isoCode));
      } else {
        setCities([]);
      }
    } else {
      setCities([]);
    }
  }, [formData.residency_country]);

  useEffect(() => {
    if (formData.parent_res_county) {
      const countries = Country.getAllCountries();
      const country = countries.find(c => c.name === formData.parent_res_county);
      if (country) {
        setParentCities(City.getCitiesOfCountry(country.isoCode));
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

  // Load draft if present
  useEffect(() => {
    try {
      const draft = localStorage.getItem('registrationDraft');
      if (draft) {
        const parsed = JSON.parse(draft);
        setFormData(prev => ({ ...prev, ...parsed }));
        if (parsed.chosen_program) setCurrentStep(2);
        if (parsed.currentStep) setCurrentStep(parsed.currentStep);
      }
    } catch (err) {
      // ignore
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Final submit — sends data to backend which handles Waafi payment and account creation
  const handleFinalSubmit = async () => {
    setPaymentError(null);
    setIsPaying(true);

    try {
      // Find program/subprogram titles for consistent database storage
      const chosenProgram = programs.find(p => p.id === formData.chosen_program);
      const chosenSubprogram = subprograms.find(s => s.id === formData.chosen_subprogram);

      // Prepare student data with payment info
      const studentData = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone || null,
        age: formData.age ? parseInt(formData.age) : null,
        residency_country: formData.residency_country || null,
        residency_city: formData.residency_city || null,
        chosen_program: chosenProgram ? chosenProgram.title : formData.chosen_program,
        chosen_subprogram: chosenSubprogram ? chosenSubprogram.subprogram_name : formData.chosen_subprogram,
        password: formData.password,
        gender: formData.gender || null,
        // Include parent information if applicable
        ...(showParentSection && {
          parent_name: formData.parent_name || null,
          parent_email: formData.parent_email || null,
          parent_phone: formData.parent_phone || null,
          parent_relation: formData.parent_relation || null,
          parent_res_county: formData.parent_res_county || null,
          parent_res_city: formData.parent_res_city || null,
        }),
        // Include payment information for backend processing
        payment: {
          method: paymentMethod,
          payerPhone: paymentAccountNumber.replace(/\s+/g, ''),
          amount: APPLICATION_FEE,
          program_id: formData.chosen_program
        }
      };

      console.log('🚀 Sending registration and payment request to backend...');

      // Create student account (backend will call Waafi)
      const response = await createStudent(studentData).unwrap();

      // If student creation is successful
      if (response.success || response.student) {
        showToast("Registration successful! Redirecting...", "success");

        // Try to auto-login
        try {
          await login({
            email: formData.email,
            password: formData.password
          }).unwrap();

          // Clear draft and redirect to dashboard
          localStorage.removeItem('registrationDraft');
          router.push('/portal/student');
        } catch (loginError) {
          console.error('Auto-login failed:', loginError);
          // Redirect to login page if auto-login fails
          localStorage.removeItem('registrationDraft');
          router.push('/auth/login');
        }
      } else {
        throw new Error(response.error || 'Failed to create student account');
      }
    } catch (error) {
      console.error('Registration/Payment error:', error);
      const errorMsg = error?.data?.error || error?.message || 'Failed to complete registration';
      setPaymentError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setIsPaying(false);
    }
  };

  const handleConfirmPin = async () => {
    // Placeholder for PIN confirmation logic if backend requires it separate
    // For now, assuming direct flow or not fully implemented in this refactor
    console.log("PIN confirmation logic needed");
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // If not final step: handle step-advanced behavior
    if (currentStep < 4) {
      if (formRef.current && !formRef.current.checkValidity()) {
        formRef.current.reportValidity();
        return;
      }

      // Password validation on Step 1
      if (currentStep === 1) {
        if (formData.password !== formData.confirmPassword) {
          showToast("Passwords do not match", "error");
          return;
        }
        // Basic length check or complex regex if needed
        if (formData.password.length < 6) {
          showToast("Password must be at least 6 characters", "error");
          return;
        }
      }

      const nextStep = Math.min(4, currentStep + 1);
      try {
        localStorage.setItem('registrationDraft', JSON.stringify({
          ...formData,
          currentStep: nextStep,
          payment: { method: paymentMethod, accountNumber: paymentAccountNumber }
        }));
      } catch (err) {
        // ignore
      }
      setCurrentStep(nextStep);
      return;
    }

    // If Step 4: Call handleFinalSubmit logic
    handleFinalSubmit();
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
            <h2 className="text-4xl font-serif font-bold mb-1" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
              Admission Portal
            </h2>
            <p className="text-sm text-gray-600">Complete your application in 4 simple steps</p>
          </div>

          {/* Card container with better dark mode support */}
          <div className={`rounded-xl shadow-sm border p-8 mb-6 ${isDarkMode ? 'border-[#1a1a3e] bg-[#050040]' : 'bg-white border-gray-100'}`}>
            {/* Visual Stepper (visual only) */}
            <div className="flex items-center justify-center gap-8 mb-6">
              {[1, 2, 3, 4].map((id) => {
                const labels = ['Personalize Info', 'Program', 'Payment', 'Review'];
                const done = currentStep > id;
                const active = currentStep === id;
                return (
                  <div key={id} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${done || active ? 'bg-green-500 text-white' : 'bg-white text-gray-500 border'}`} style={{ boxShadow: active ? '0 4px 10px rgba(1,0,128,0.12)' : 'none' }}>{id}</div>
                    <span className="text-xs mt-2 text-gray-600">{labels[id - 1]}</span>
                  </div>
                )
              })}
            </div>

            {/* Section Title (dynamic) */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                {currentStep === 1 ? 'Personalize Info' : currentStep === 2 ? 'Program Selection' : currentStep === 3 ? 'Payment' : 'Review'}
              </h3>
              <p className="text-sm text-gray-500">
                {currentStep === 1 && 'Please provide your personal details to begin the admission process.'}
                {currentStep === 2 && 'Choose the program you wish to apply for.'}
                {currentStep === 3 && 'Confirm your program and proceed to payment (handled after registration).'}
                {currentStep === 4 && 'Review your application before creating your account.'}
              </p>
            </div>

            {/* Registration Form (multi-step) */}
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              {/* Step 1 - Personalize Info */}
              {currentStep === 1 && (
                <div>
                  {/* Full Name - Row 1 */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 border border-gray-200 rounded-md bg-white text-gray-800 outline-none focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>

                  {/* Email - Row 2 */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Example@gmail.com"
                      className="w-full px-4 py-3 border border-gray-200 rounded-md bg-white text-gray-800 outline-none focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>

                  {/* Country & City - Row 3 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Residency Country</label>
                      <CountrySelect
                        value={formData.residency_country}
                        onChange={(val) => setFormData(prev => ({ ...prev, residency_country: val, residency_city: "" }))}
                        placeholder="Select country"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Residency City</label>
                      <div className="relative">
                        <select
                          name="residency_city"
                          value={formData.residency_city}
                          onChange={handleChange}
                          className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-md bg-white text-gray-800 outline-none appearance-none focus:ring-2 focus:ring-blue-200"
                          disabled={!formData.residency_country}
                        >
                          <option value="">select city</option>
                          {cities.map((city, idx) => (
                            <option key={`${city.name}-${idx}`} value={city.name}>{city.name}</option>
                          ))}
                        </select>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Phone & Sex - Row 4 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                      <PhoneInput
                        country={(() => {
                          if (formData.residency_country) {
                            const c = Country.getAllCountries().find(c => c.name === formData.residency_country);
                            return c ? c.isoCode.toLowerCase() : 'so';
                          }
                          return 'so';
                        })()}
                        value={formData.phone}
                        onChange={val => setFormData(prev => ({ ...prev, phone: val }))}
                        enableSearch={true}
                        separateDialCode={true}
                        inputStyle={{ width: '100%', height: '48px', fontSize: '14px', borderRadius: '0.375rem', border: '1px solid #e5e7eb', backgroundColor: 'white' }}
                        containerStyle={{ width: '100%' }}
                        buttonStyle={{ borderRadius: '0.375rem 0 0 0.375rem', border: '1px solid #e5e7eb', borderRight: 'none' }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Sex <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-md bg-white text-gray-800 outline-none appearance-none focus:ring-2 focus:ring-blue-200"
                          required
                        >
                          <option value="">Select sex</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Age (Half Width now, maybe combine with password or keep separate row?) - Row 5 */}
                  {/* Providing Age on its own row half width or grid with spacer */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        placeholder="16"
                        min="1"
                        className="w-full px-4 py-3 border border-gray-200 rounded-md bg-white text-gray-800 outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    {/* Empty div for spacing if we want Age strictly half width on a row, or we can put Password here? 
                        User asked for Age (Half), Password (Half/Full) in plan, but updated request was:
                        Row 6: Password (Half) + Confirm Password (Half)
                        So Age should be Row 5 (Half).
                    */}
                    <div className="hidden md:block"></div>
                  </div>

                  {/* Password & Confirm Password - Row 6 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Password <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Password"
                          className="w-full px-4 py-3 border border-gray-200 rounded-md bg-white text-gray-800 outline-none focus:ring-2 focus:ring-blue-200"
                          required
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
                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm Password"
                          className="w-full px-4 py-3 border border-gray-200 rounded-md bg-white text-gray-800 outline-none focus:ring-2 focus:ring-blue-200"
                          required
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

                  {/* Parent Section Trigger */}


                  {/* Parent/Guardian Section (keeps same fields and logic) */}
                  {showParentSection && (
                    <div className="pt-4 border-t border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-800 mb-4">Parent/Guardian Information</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Parent/Guardian Name</label>
                          <input
                            type="text"
                            name="parent_name"
                            value={formData.parent_name}
                            onChange={handleChange}
                            placeholder="Enter parent/guardian name"
                            className="w-full px-4 py-3 border border-gray-200 rounded-md bg-white text-gray-800 outline-none focus:ring-2 focus:ring-blue-200"
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
                            className="w-full px-4 py-3 border border-gray-200 rounded-md bg-white text-gray-800 outline-none focus:ring-2 focus:ring-blue-200"
                          />
                        </div>

                        <div className="relative">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Parent/Guardian Phone</label>
                          <PhoneInput
                            country={(() => {
                              if (formData.parent_res_county) {
                                const c = Country.getAllCountries().find(c => c.name === formData.parent_res_county);
                                return c ? c.isoCode.toLowerCase() : 'so';
                              }
                              return 'so';
                            })()}
                            value={formData.parent_phone}
                            onChange={val => setFormData(prev => ({ ...prev, parent_phone: val }))}
                            enableSearch={true}
                            separateDialCode={true}
                            inputStyle={{ width: '100%', height: '48px', fontSize: '14px', borderRadius: '0.375rem', border: '1px solid #e5e7eb', backgroundColor: 'white' }}
                            containerStyle={{ width: '100%' }}
                            buttonStyle={{ borderRadius: '0.375rem 0 0 0.375rem', border: '1px solid #e5e7eb', borderRight: 'none' }}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Relationship</label>
                          <div className="relative">
                            <select
                              name="parent_relation"
                              value={formData.parent_relation}
                              onChange={handleChange}
                              className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-md bg-white text-gray-800 outline-none appearance-none focus:ring-2 focus:ring-blue-200"
                            >
                              <option value="">Select relationship</option>
                              <option value="Father">Father</option>
                              <option value="Mother">Mother</option>
                              <option value="Guardian">Guardian</option>
                            </select>
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Parent/Guardian Residency Country</label>
                          <CountrySelect
                            value={formData.parent_res_county}
                            onChange={(val) => setFormData(prev => ({ ...prev, parent_res_county: val, parent_res_city: "" }))}
                            placeholder="Select country"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Parent/Guardian Residency City</label>
                          <div className="relative">
                            <select
                              name="parent_res_city"
                              value={formData.parent_res_city}
                              onChange={handleChange}
                              className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-md bg-white text-gray-800 outline-none appearance-none focus:ring-2 focus:ring-blue-200"
                              disabled={!formData.parent_res_county}
                            >
                              <option value="">Select city</option>
                              {parentCities.map((city, idx) => (
                                <option key={`${city.name}-${idx}`} value={city.name}>{city.name}</option>
                              ))}
                            </select>
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <hr className="my-4 border-gray-100" />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-lg text-white font-semibold transition-all duration-300 disabled:opacity-50"
                      style={{ backgroundColor: '#010080' }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2 - Program Selection */}
              {currentStep === 2 && (
                <div className="animate-fadeIn">
                  {/* <h3 className="text-xl font-bold text-gray-800 mb-1">Program Selection</h3>
                  <p className="text-sm text-gray-500 mb-8">Choose the program you wish to apply for.</p> */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {programsLoading ? (
                      <div className="col-span-full py-20 text-center text-gray-400">Loading programs...</div>
                    ) : programs && programs.length === 0 ? (
                      <div className="col-span-full py-20 text-center text-gray-400">No active programs available.</div>
                    ) : (
                      programs
                        .filter(p => p.status === 'active' && !p.title.includes('Proficiency Test') && !p.title.includes('IELTS'))
                        .map((program) => {
                          const isSelected = formData.chosen_program === program.id;
                          return (
                            <button
                              type="button"
                              key={program.id}
                              onClick={() => setFormData(prev => ({ ...prev, chosen_program: program.id }))}
                              className={`group text-left p-6 bg-white border-2 rounded-2xl transition-all duration-300 hover:shadow-lg ${isSelected
                                ? 'border-[#010080] shadow-md ring-1 ring-[#010080]/10'
                                : 'border-gray-100'
                                }`}
                            >
                              {/* Program Image Box */}
                              <div className={`h-16 w-16 mb-4 rounded-xl overflow-hidden border ${isSelected ? 'border-blue-100 bg-blue-50' : 'border-gray-100 bg-gray-50'}`}>
                                {program.image ? (
                                  <img
                                    src={`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000'}${program.image}`}
                                    alt={program.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                  </div>
                                )}
                              </div>

                              <h4 className="font-bold text-[15px] mb-2 leading-tight" style={{ color: isSelected ? '#010080' : '#010080' }}>
                                {program.title}
                              </h4>
                              <p className="text-xs text-gray-500 leading-relaxed mb-1 line-clamp-3">
                                {program.description || 'Program overview available in details.'}
                              </p>
                            </button>
                          );
                        })
                    )}
                  </div>

                  <div className="mt-12 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-8 py-3 rounded-xl bg-gray-200 text-gray-700 font-semibold text-sm transition-all hover:bg-gray-300"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={!formData.chosen_program}
                      className="px-10 py-3 rounded-xl text-white font-bold text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: '#010080' }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3 - Payment */}
              {currentStep === 3 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment Process</h3>
                  <p className="text-sm text-gray-500 mb-4">Complete the application fee payment to proceed.</p>

                  <div className="border border-blue-100 rounded-md p-4 bg-blue-50 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Application fee</p>
                        <p className="text-2xl font-semibold" style={{ color: '#010080' }}>${APPLICATION_FEE}</p>
                      </div>
                      <div className="w-12 h-12 bg-gray-200 rounded-md" />
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">Payment method <span className="text-red-500">*</span></p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('waafi')}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${paymentMethod === 'waafi' ? 'bg-blue-50 border-green-600' : 'bg-white border-gray-100'}`}
                    >
                      <div className="text-left">
                        <p className="font-bold text-[#010080]">EVC - Waafi</p>
                        <p className="text-xs text-gray-500 mt-1">Instant mobile payment</p>
                      </div>
                      <div className="text-sm font-bold text-[#010080]">${APPLICATION_FEE.toFixed(2)}</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bank')}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${paymentMethod === 'bank' ? 'bg-blue-50 border-green-600' : 'bg-white border-gray-100'}`}
                    >
                      <div className="text-left">
                        <p className="font-bold text-[#010080]">Bank Transfer</p>
                        <p className="text-xs text-gray-500 mt-1">Manual transfer (confirm later)</p>
                      </div>
                      <div className="text-sm font-bold text-[#010080]">${APPLICATION_FEE.toFixed(2)}</div>
                    </button>
                  </div>

                  {/* If EVC selected, show account number field */}
                  {paymentMethod === 'waafi' && (
                    <div className="mt-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Account Number</label>
                      <input
                        type="text"
                        placeholder="61XXXXXXX"
                        value={paymentAccountNumber}
                        onChange={(e) => setPaymentAccountNumber(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-md bg-white text-gray-800 outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  )}

                  {paymentError && <div className="text-red-600 text-sm mt-3">{paymentError}</div>}

                  <div className="mt-6 flex items-center justify-between">
                    <button type="button" onClick={() => setCurrentStep(2)} className="px-6 py-3 rounded-lg bg-gray-200 text-gray-700">Back</button>
                    <button type="submit" className="px-6 py-3 rounded-lg bg-green-600 text-white">{isPaying ? 'Processing...' : 'Pay & Continue'}</button>
                  </div>
                </div>
              )}

              {/* Step 4 - Review & Submit */}
              {currentStep === 4 && (
                <div className="animate-fadeIn">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Review and Submission</h3>
                  <p className="text-sm text-gray-500 mb-4">Please review your information before submitting your application.</p>

                  <div className="space-y-4 mb-4">
                    <div className="p-4 bg-white border rounded-lg flex items-start gap-4">
                      <div className="w-10 h-10 rounded-md flex-shrink-0" style={{ backgroundColor: '#c7d2fe' }} />
                      <div>
                        <h4 className="font-bold text-[#010080]">Personal Information</h4>
                        <p className="text-sm text-gray-600 font-medium">{formData.full_name || '-'} • {formData.email || '-'} • {formData.phone || '-'}</p>
                        <p className="text-xs text-gray-500 mt-2">{formData.residency_country ? `${formData.residency_country}, ${formData.residency_city}` : '-'}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-white border rounded-lg flex items-start gap-4">
                      <div className="w-10 h-10 rounded-md bg-green-100 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-[#010080]">Program Selection</h4>
                        <p className="text-sm text-gray-600 font-medium">{programs.find(p => p.id === formData.chosen_program)?.title || '-'}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-white border rounded-lg flex items-start gap-4">
                      <div className="w-10 h-10 rounded-md bg-red-100 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-[#010080]">Payment Information</h4>
                        <p className="text-sm text-gray-600">Payment method: {paymentMethod === 'waafi' ? 'EVC - Waafi' : 'Bank Transfer'}</p>
                        <p className="text-sm text-gray-600">Application fee: ${APPLICATION_FEE.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Account: {paymentAccountNumber || '-'}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-800">By submitting this application, you confirm that all information provided is accurate and complete. You will receive a confirmation email once your application is processed.</p>
                    </div>

                    {paymentError && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-700">Payment Error: {paymentError}</p>
                        <div className="mt-2">
                          <button onClick={() => { setCurrentStep(3); setPaymentError(null); }} className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors text-sm font-medium">Change number / Retry</button>
                        </div>
                      </div>
                    )}

                  </div>

                  <div className="flex items-center justify-between">
                    <button type="button" onClick={() => setCurrentStep(3)} className="px-6 py-3 rounded-lg bg-gray-200 text-gray-700">Back</button>
                    <div className="flex items-center gap-2">
                      {requiresPin && (
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-600">We sent a PIN to the phone number you provided — enter it below to confirm payment.</span>
                            <div className="flex items-center gap-2 mt-2">
                              <input value={pin} onChange={(e) => setPin(e.target.value)} className="px-3 py-2 border rounded-md" placeholder="Enter PIN" />
                              <button onClick={handleConfirmPin} className="px-4 py-2 rounded-md bg-blue-700 text-white">Confirm PIN</button>
                            </div>
                          </div>
                        </div>
                      )}

                      {!requiresPin && (
                        <button type="button" onClick={handleFinalSubmit} disabled={isPaying || isCreating} className="px-6 py-3 rounded-lg bg-green-600 text-white">{isPaying ? 'Processing Payment...' : (isCreating ? 'Creating Account...' : 'Submit Application')}</button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <p className="text-center text-gray-600 text-sm mt-4">Already have an account? <Link href="/login" className="font-semibold hover:underline" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>Sign in</Link></p>
            </form>
          </div>
          {/* Back to Home */}

        </div>
      </div >
    </div >
  );
}
