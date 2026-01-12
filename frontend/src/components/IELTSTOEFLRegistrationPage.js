"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useCreateIeltsToeflStudentMutation } from "@/redux/api/ieltsToeflApi";
import { useLoginMutation } from "@/redux/api/authApi";
import { useToast } from "@/components/Toast";
import { Country, City } from "country-state-city";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import CountrySelect from "@/components/CountrySelect";

export default function IELTSTOEFLRegistrationPage() {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const { data: programs = [], isLoading: programsLoading } = useGetProgramsQuery();
  const [createIeltsStudent, { isLoading: isCreating }] = useCreateIeltsToeflStudentMutation();
  const [login] = useLoginMutation();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    age: "",
    sex: "",
    country: "",
    city: "",
    chosen_program: "",
    password: "",
    confirmPassword: "",
    examType: "",
    hasCertificate: "", // 'yes' or 'no'
    certificateInstitution: "",
    certificateDate: "",
    certificateDocument: "",
    examBookingDate: "",
    examBookingTime: "",
    termsAccepted: false,
  });

  const [cities, setCities] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const formRef = useRef(null);

  // Payment specific state for Step 3
  const [paymentMethod, setPaymentMethod] = useState('mwallet_account'); // 'mwallet_account' (EVC) or 'bank'
  const [paymentAccountNumber, setPaymentAccountNumber] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [requiresPin, setRequiresPin] = useState(false);
  const [waafiTransactionId, setWaafiTransactionId] = useState(null);
  const [pin, setPin] = useState('');

  const selectedProgramObj = programs.find(p => p.title === formData.chosen_program);
  const programPrice = selectedProgramObj ? parseFloat(selectedProgramObj.price || 0) : 0;
  const programDiscount = selectedProgramObj ? parseFloat(selectedProgramObj.discount || 0) : 0;
  const APPLICATION_FEE = Math.max(0, programPrice - programDiscount);

  // Update cities when country changes
  useEffect(() => {
    if (formData.country) {
      const countries = Country.getAllCountries();
      const country = countries.find(c => c.name === formData.country);

      if (country) {
        setCities(City.getCitiesOfCountry(country.isoCode));
      } else {
        setCities([]);
      }
    } else {
      setCities([]);
    }
  }, [formData.country]);

  // Set default program when programs are loaded (IELTS/TOEFL)
  useEffect(() => {
    if (programs && Array.isArray(programs) && programs.length > 0) {
      const ieltsProgram = programs.find(p => p.title.toLowerCase().includes('ielts'));
      if (ieltsProgram && !formData.chosen_program) {
        setFormData(prev => ({ ...prev, chosen_program: ieltsProgram.title }));
      }
    }
  }, [programs]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      const fileName = files[0]?.name || '';
      setFormData(prev => ({
        ...prev,
        [name]: fileName
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
      }));
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (currentStep < 4) {
      if (formRef.current && !formRef.current.reportValidity()) {
        formRef.current.reportValidity();
        return;
      }

      // Password validation on step 1
      if (currentStep === 1) {
        if (formData.password !== formData.confirmPassword) {
          showToast("Passwords do not match", "error");
          return;
        }
        if (formData.password.length < 6) {
          showToast("Password must be at least 6 characters", "error");
          return;
        }
      }

      // Verification validation on step 2
      if (currentStep === 2) {
        if (!formData.hasCertificate) {
          showToast("Please choose a verification method", "error");
          return;
        }
        if (!formData.examType) {
          showToast("Please select an exam type", "error");
          return;
        }
      }

      setCurrentStep(prev => prev + 1);
    }
  };

  const handleFinalSubmit = async () => {
    setPaymentError(null);
    setIsPaying(true);

    try {
      const requestId = `req_${Date.now()}`;
      const invoiceId = `inv_${Date.now()}`;

      // Simulate or call Waafi API if method is 'mwallet_account'
      if (paymentMethod === 'mwallet_account') {
        const payload = {
          schemaVersion: "1.0",
          requestId: requestId,
          timestamp: new Date().toISOString(),
          channelName: "WEB",
          serviceName: "API_PURCHASE",
          serviceParams: {
            merchantUid: "M0910291",
            apiUserId: "1000416",
            apiKey: "API-675418888AHX",
            paymentMethod: "mwallet_account",
            payerInfo: { accountNo: paymentAccountNumber.replace(/\s+/g, '') },
            transactionInfo: {
              referenceId: requestId,
              invoiceId: invoiceId,
              amount: APPLICATION_FEE,
              currency: "USD",
              description: `Application fee for ${formData.chosen_program}`
            }
          }
        };

        const res = await fetch('https://api.waafipay.net/asm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-MERCHANT-ID': 'M0910291' },
          body: JSON.stringify(payload),
        });

        const response = await res.json();
        if (response.responseCode === '2001' || response.responseMsg === 'SUCCESS' || (response.serviceParams && response.serviceParams.status === 'SUCCESS')) {
          const transactionId = response.serviceParams?.transactionId || `WAAFI_${requestId}`;
          await handleSaveStudent(transactionId, response);
        } else {
          throw new Error(response.responseMsg || 'Payment failed');
        }
      } else {
        // Bank transfer - save with a placeholder or manual status
        await handleSaveStudent(`BANK_${requestId}`, { method: 'bank' });
      }
    } catch (err) {
      setPaymentError(err.message);
      showToast(`Payment Error: ${err.message}`, "error");
    } finally {
      setIsPaying(false);
    }
  };

  const handleSaveStudent = async (transactionId, paymentInfo) => {
    try {
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        chosen_program: formData.chosen_program,
        age: parseInt(formData.age),
        sex: formData.sex.charAt(0).toUpperCase() + formData.sex.slice(1).toLowerCase(),
        residency_country: formData.country,
        residency_city: formData.city,
        exam_type: formData.examType.toUpperCase(),
        verification_method: formData.hasCertificate === 'yes' ? 'Certificate' : 'Exam Booking',
        certificate_institution: formData.certificateInstitution || null,
        certificate_date: formData.certificateDate || null,
        certificate_document: formData.certificateDocument || null,
        exam_booking_date: formData.examBookingDate || null,
        exam_booking_time: formData.examBookingTime || null,
        payment: {
          method: paymentMethod,
          transactionId: transactionId,
          amount: APPLICATION_FEE,
          payerPhone: paymentAccountNumber,
          status: paymentMethod === 'bank' ? 'pending' : 'completed'
        }
      };

      const response = await createIeltsStudent(payload).unwrap();
      if (response.success || response.student) {
        showToast("Registration successful! Redirecting...", "success");
        // Attempt auto-login
        try {
          await login({ email: formData.email, password: formData.password }).unwrap();
          router.push('/portal/student');
        } catch (e) {
          router.push('/login');
        }
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error) {
      showToast(error.message || 'Error completing registration', 'error');
    }
  };

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'bg-[#03002e]' : 'bg-gray-50'}`}>
      {/* Left Side - Brand Section */}
      <div className="hidden md:flex md:w-1/2 fixed left-0 top-0 h-screen items-center justify-center overflow-hidden" style={{ backgroundColor: '#010080' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 border-2 border-white rounded-full"></div>
          <div className="absolute top-1/3 right-10 w-20 h-20 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-1/3 left-20 w-24 h-24 border-2 border-white rounded-full"></div>
          <div className="absolute top-2/3 left-1/3 w-36 h-36 border-2 border-white rounded-full"></div>
        </div>

        <div className="relative z-10 text-center px-12">
          <div className="mb-8">
            <Image src="/images/footerlogo.png" alt="BEA Logo" width={280} height={100} className="mx-auto" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-white mb-4">IELTS & TOEFL Prep</h1>
          <p className="text-blue-200 text-lg leading-relaxed max-w-md mx-auto">
            Achieve your desired score with our expert-led preparation programs.
          </p>
          <div className="mt-12 space-y-4 text-left max-w-sm mx-auto">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <span className="text-sm">Comprehensive study materials</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <span className="text-sm">Mock exams & feedback</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full md:w-1/2 md:ml-[50%] min-h-screen flex flex-col p-4 sm:p-6 md:p-8 lg:p-12 bg-gray-50 overflow-y-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4 self-start">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          <span className="text-sm font-medium">Go Back</span>
        </button>

        <div className="w-full max-w-xl py-6 mx-auto flex-grow flex flex-col justify-center">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-serif font-bold mb-1" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>Admission Portal</h2>
            <p className="text-sm text-gray-600">IELTS & TOEFL Registration - 4 Simple Steps</p>
          </div>

          <div className={`bg-white rounded-xl shadow-sm border p-8 mb-6 ${isDarkMode ? 'border-[#1a1a3e] bg-[#050040]' : 'border-gray-100'}`}>
            {/* Visual Stepper - Matching RegistrationPage Green Theme */}
            <div className="flex items-center justify-center gap-4 sm:gap-8 mb-8">
              {[1, 2, 3, 4].map((id) => {
                const labels = ['Personalize Info', 'Verification', 'Payment', 'Review'];
                const done = currentStep > id;
                const active = currentStep === id;
                return (
                  <div key={id} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${done || active ? 'bg-green-500 text-white shadow-md' : 'bg-white text-gray-500 border'}`} style={{ boxShadow: active ? '0 4px 10px rgba(1,0,128,0.12)' : 'none' }}>{id}</div>
                    <span className="text-[10px] mt-2 text-gray-600 truncate max-w-[60px] text-center">{labels[id - 1]}</span>
                  </div>
                )
              })}
            </div>

            {/* Section Title (dynamic) */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                {currentStep === 1 ? 'Personalize Info' : currentStep === 2 ? 'Verification Method' : currentStep === 3 ? 'Payment' : 'Review'}
              </h3>
              <p className="text-sm text-gray-500">
                {currentStep === 1 && 'Please provide your personal details to begin the registration process.'}
                {currentStep === 2 && 'Choose your English proficiency verification method.'}
                {currentStep === 3 && 'Complete the application fee payment.'}
                {currentStep === 4 && 'Review your information before submitting.'}
              </p>
            </div>

            <form ref={formRef} onSubmit={handleNextStep} className="space-y-4">
              {/* Step 1 - Personal Information */}
              {currentStep === 1 && (
                <div className="animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">First Name <span className="text-red-500">*</span></label>
                      <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First name" className="w-full px-4 py-3 border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-blue-100" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name <span className="text-red-500">*</span></label>
                      <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last name" className="w-full px-4 py-3 border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-blue-100" required />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Example@gmail.com" className="w-full px-4 py-3 border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-blue-100" required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                      <CountrySelect value={formData.country} onChange={(val) => setFormData(prev => ({ ...prev, country: val, city: "" }))} placeholder="Select country" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                      <div className="relative">
                        <select name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-blue-100 appearance-none bg-white" required disabled={!formData.country}>
                          <option value="">Select city</option>
                          {cities.map((city, idx) => <option key={idx} value={city.name}>{city.name}</option>)}
                        </select>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                      <PhoneInput
                        country="so"
                        value={formData.phone}
                        onChange={val => setFormData(prev => ({ ...prev, phone: val }))}
                        enableSearch={true}
                        separateDialCode={true}
                        inputStyle={{ width: '100%', height: '48px', fontSize: '14px', borderRadius: '0.375rem', border: 'none', backgroundColor: 'transparent' }}
                        containerStyle={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '0.375rem', backgroundColor: 'white' }}
                        buttonStyle={{ border: 'none', backgroundColor: 'transparent', borderRadius: '0.375rem 0 0 0.375rem' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Sex <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <select name="sex" value={formData.sex} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-blue-100 appearance-none bg-white" required>
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                      <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="18" className="w-full px-4 py-3 border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-blue-100" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Program</label>
                      <input type="text" value={formData.chosen_program} readOnly className="w-full px-4 py-3 border border-gray-200 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Password <span className="text-red-500">*</span></label>
                      <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••" className="w-full px-4 py-3 border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-blue-100" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                      <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••" className="w-full px-4 py-3 border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-blue-100" required />
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button type="submit" className="px-8 py-3 rounded-lg text-white font-semibold transition-all hover:opacity-90 active:scale-95" style={{ backgroundColor: '#010080' }}>Next Step</button>
                  </div>
                </div>
              )}

              {/* Step 2 - English Proficiency Verification */}
              {currentStep === 2 && (
                <div className="animate-fadeIn space-y-6">
                  <div className="rounded-xl p-4 bg-amber-50 border border-amber-100">
                    <p className="text-xs text-amber-800 leading-relaxed font-medium">
                      Admission Requirement: Provide an advanced level English proficiency certificate or diploma. If you don't have one, you will need to take our proficiency exam.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Option 1: Certificate */}
                    <div className={`border rounded-xl transition-all ${formData.hasCertificate === 'yes' ? 'border-[#010080] ring-1 ring-[#010080]/10' : 'border-gray-200'}`}>
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, hasCertificate: 'yes', examBookingDate: '', examBookingTime: '' }))} className={`w-full p-4 flex items-center justify-between rounded-t-xl transition-colors ${formData.hasCertificate === 'yes' ? 'bg-[#010080] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                        <span className="flex items-center gap-3">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span className="text-sm font-bold">I Have a Certificate</span>
                        </span>
                        <svg className={`w-4 h-4 transition-transform ${formData.hasCertificate === 'yes' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      {formData.hasCertificate === 'yes' && (
                        <div className="p-4 border-t border-gray-100 space-y-4 bg-gray-50 rounded-b-xl">
                          <div>
                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Upload Document</label>
                            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-white transition-colors">
                              <div className="text-gray-400 flex flex-col items-center">
                                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                <span className="text-[10px] font-semibold">{formData.certificateDocument || 'Select PDF, JPG or PNG'}</span>
                              </div>
                              <input type="file" name="certificateDocument" className="hidden" onChange={handleChange} />
                            </label>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Institution</label>
                              <input type="text" name="certificateInstitution" value={formData.certificateInstitution} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm outline-none" placeholder="e.g. British Council" required />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Date Obtained</label>
                              <input type="date" name="certificateDate" value={formData.certificateDate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm outline-none" required />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Option 2: Exam */}
                    <div className={`border rounded-xl transition-all ${formData.hasCertificate === 'no' ? 'border-[#010080] ring-1 ring-[#010080]/10' : 'border-gray-200'}`}>
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, hasCertificate: 'no', certificateInstitution: '', certificateDate: '', certificateDocument: '' }))} className={`w-full p-4 flex items-center justify-between rounded-t-xl transition-colors ${formData.hasCertificate === 'no' ? 'bg-[#010080] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                        <span className="flex items-center gap-3">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <span className="text-sm font-bold">Take Proficiency Exam</span>
                        </span>
                        <svg className={`w-4 h-4 transition-transform ${formData.hasCertificate === 'no' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      {formData.hasCertificate === 'no' && (
                        <div className="p-4 border-t border-gray-100 space-y-4 bg-gray-50 rounded-b-xl">
                          <p className="text-[11px] text-gray-500">Book a date for your assessment exam at our center.</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Exam Date</label>
                              <input type="date" name="examBookingDate" value={formData.examBookingDate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm outline-none" required />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Preferred Time</label>
                              <select name="examBookingTime" value={formData.examBookingTime} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm outline-none bg-white appearance-none" required>
                                <option value="">Select Time</option>
                                <option value="09:00 AM">09:00 AM</option>
                                <option value="11:00 AM">11:00 AM</option>
                                <option value="02:00 PM">02:00 PM</option>
                                <option value="04:00 PM">04:00 PM</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Exam Preparation For <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-2 gap-4">
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, examType: 'ielts' }))} className={`py-4 px-6 border rounded-xl font-bold transition-all ${formData.examType === 'ielts' ? 'bg-blue-50 border-[#010080] text-[#010080]' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>IELTS</button>
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, examType: 'toefl' }))} className={`py-4 px-6 border rounded-xl font-bold transition-all ${formData.examType === 'toefl' ? 'bg-blue-50 border-[#010080] text-[#010080]' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>TOEFL</button>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-between items-center">
                    <button type="button" onClick={() => setCurrentStep(1)} className="px-6 py-3 rounded-lg bg-gray-200 text-gray-700 font-semibold text-sm transition-all hover:bg-gray-300">Back</button>
                    <button type="submit" className="px-8 py-3 rounded-lg text-white font-semibold transition-all hover:opacity-90 shadow-md active:scale-95" style={{ backgroundColor: '#010080' }}>Next Step</button>
                  </div>
                </div>
              )}

              {/* Step 3 - Payment */}
              {currentStep === 3 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment Process</h3>
                  <p className="text-sm text-gray-500 mb-4">Complete the application fee payment to proceed.</p>

                  <div className="border border-blue-100 rounded-lg p-4 bg-blue-50 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Application fee</p>
                        <p className="text-2xl font-bold" style={{ color: '#010080' }}>${APPLICATION_FEE.toFixed(2)}</p>
                      </div>
                      <div className="w-12 h-12 bg-gray-200 rounded-md" />
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 font-medium">Payment method <span className="text-red-500">*</span></p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('mwallet_account')}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${paymentMethod === 'mwallet_account' ? 'bg-blue-50 border-green-600' : 'bg-white border-gray-100'}`}
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

                  {paymentMethod === 'mwallet_account' && (
                    <div className="mt-4 animate-fadeIn">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Account Number</label>
                      <input
                        type="text"
                        value={paymentAccountNumber}
                        onChange={(e) => setPaymentAccountNumber(e.target.value)}
                        placeholder="61XXXXXXX"
                        className="w-full px-4 py-3 border border-gray-200 rounded-md bg-white text-gray-800 outline-none focus:ring-2 focus:ring-blue-200"
                        required
                      />
                    </div>
                  )}

                  {paymentError && <div className="text-red-600 text-sm mt-3 font-medium">{paymentError}</div>}

                  <div className="mt-6 flex items-center justify-between">
                    <button type="button" onClick={() => setCurrentStep(2)} className="px-6 py-3 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">Back</button>
                    <button type="submit" className="px-6 py-3 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition-colors shadow-md">Pay & Continue</button>
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
                        <p className="text-sm text-gray-600 font-medium">{formData.firstName} {formData.lastName} • {formData.email} • {formData.phone || '-'}</p>
                        <p className="text-xs text-gray-500 mt-1">{formData.country}, {formData.city}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-white border rounded-lg flex items-start gap-4">
                      <div className="w-10 h-10 rounded-md bg-green-100 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-[#010080]">Program Selection</h4>
                        <p className="text-sm text-gray-600 font-medium">{formData.chosen_program} ({formData.examType.toUpperCase()})</p>
                      </div>
                    </div>

                    <div className="p-4 bg-white border rounded-lg flex items-start gap-4">
                      <div className="w-10 h-10 rounded-md bg-red-100 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-[#010080]">Payment Information</h4>
                        <p className="text-sm text-gray-600">Payment method: {paymentMethod === 'bank' ? 'Bank Transfer' : 'EVC - Waafi'}</p>
                        <p className="text-sm text-gray-600">Application fee: ${APPLICATION_FEE.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Account: {paymentAccountNumber || '-'}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-[#1a5f49]">By submitting this application, you confirm that all information provided is accurate and complete. You will receive a confirmation email once your application is processed.</p>
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

                  <div className="flex items-center justify-between mt-6">
                    <button type="button" onClick={() => setCurrentStep(3)} className="px-6 py-3 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">Back</button>
                    <button
                      type="button"
                      onClick={handleFinalSubmit}
                      disabled={isPaying || isCreating}
                      className="px-6 py-3 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition-colors shadow-md disabled:opacity-50"
                    >
                      {isPaying ? 'Processing Payment...' : (isCreating ? 'Creating Account...' : 'Submit Application')}
                    </button>
                  </div>
                </div>
              )}

            </form>
          </div>

          <p className="text-center text-gray-500 text-sm">
            Already registered? <Link href="/login" className="font-bold hover:underline" style={{ color: '#010080' }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
