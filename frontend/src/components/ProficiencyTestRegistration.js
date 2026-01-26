"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { useTheme } from "@/context/ThemeContext";
import { useRegisterCandidateMutation } from "@/redux/api/proficiencyTestStudentsApi";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useLoginMutation } from "@/redux/api/authApi";

import { Country, City } from "country-state-city";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import CountrySelect from "@/components/CountrySelect";

export default function ProficiencyTestRegistration() {
    const { isDarkMode } = useTheme();
    const router = useRouter();
    const { showToast } = useToast();
    const [registerCandidate, { isLoading: isCreating }] = useRegisterCandidateMutation();
    const [login] = useLoginMutation();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        country: "",
        city: "",
        phone: "",
        sex: "",
        age: "",
        password: "",
        confirmPassword: "",
        educational_level: "",
        reason_essay: "",
    });

    const [cities, setCities] = useState([]);
    const [currentStep, setCurrentStep] = useState(1);
    const formRef = useRef(null);

    // Payment state
    const [paymentMethod, setPaymentMethod] = useState('mwallet_account');
    const [paymentAccountNumber, setPaymentAccountNumber] = useState('');
    const [isPaying, setIsPaying] = useState(false);
    const [paymentError, setPaymentError] = useState(null);

    // Password Visibility
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Fetch programs for dynamic pricing
    const { data: programs } = useGetProgramsQuery();
    const proficiencyProgram = programs?.find(p => p.title.toLowerCase().trim() === 'proficiency test');

    // Calculate fee: Price - Discount (default to 20 if not found)
    const APPLICATION_FEE = proficiencyProgram
        ? Math.max(0, parseFloat(proficiencyProgram.price || 0) - parseFloat(proficiencyProgram.discount || 0))
        : 20.00;


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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const validateStep = () => {
        if (currentStep === 1) {
            if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.phone || !formData.sex || !formData.age) {
                showToast("Please fill in all required fields", 'error');
                return false;
            }
            if (formData.password !== formData.confirmPassword) {
                showToast("Passwords do not match", 'error');
                return false;
            }
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
            if (!passwordRegex.test(formData.password)) {
                showToast("Password must be at least 6 characters and include uppercase, lowercase, number, and symbol", 'error');
                return false;
            }
        }
        if (currentStep === 2) {
            if (!formData.educational_level) {
                showToast("Please select your education level", 'error');
                return false;
            }
        }
        if (currentStep === 3) {
            if (!formData.reason_essay || formData.reason_essay.length < 50) {
                showToast("Please provide a statement of at least 50 characters", 'error');
                return false;
            }
        }
        return true;
    };

    const handleNextStep = (e) => {
        e.preventDefault();
        if (validateStep()) {
            setCurrentStep((prev) => Math.min(prev + 1, 5));
        }
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const handleFinalSubmit = async () => {
        setPaymentError(null);
        setIsPaying(true);

        try {
            const payload = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                residency_country: formData.country,
                residency_city: formData.city,
                sex: formData.sex,
                age: parseInt(formData.age),
                educational_level: formData.educational_level,
                reason_essay: formData.reason_essay,
                status: "Pending",
                payment_status: "paid", // Auto-confirm for now or integrate real payment
                chosen_program: "Proficiency Test",
                payment: {
                    method: paymentMethod,
                    amount: APPLICATION_FEE,
                    payerPhone: paymentAccountNumber.replace(/\s+/g, ''),
                }
            };



            const response = await registerCandidate(payload).unwrap();

            if (response) {
                showToast("Registration successful! Redirecting...", 'success');
                // Auto-login attempt
                try {
                    await login({ email: formData.email, password: formData.password }).unwrap();
                    router.push('/portal/student');
                } catch (e) {
                    router.push('/auth/login');
                }
            }
        } catch (err) {
            setPaymentError(err.data?.error || err.message || 'Registration failed');
            showToast(err.data?.error || "Registration failed", 'error');
        } finally {
            setIsPaying(false);
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
                </div>

                <div className="relative z-10 text-center px-12">
                    <div className="mb-8">
                        <Image src="/images/footerlogo.png" alt="BEA Logo" width={280} height={100} className="mx-auto" />
                    </div>
                    <h1 className="text-4xl font-serif font-bold text-white mb-4">Proficiency Certification</h1>
                    <p className="text-blue-200 text-lg leading-relaxed max-w-md mx-auto">
                        Get certified for your English proficiency with our globally recognized standards.
                    </p>
                    <div className="mt-12 space-y-4 text-left max-w-sm mx-auto">
                        <div className="flex items-center gap-3 text-white">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <span className="text-sm">Official Certification</span>
                        </div>
                        <div className="flex items-center gap-3 text-white">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <span className="text-sm">Comprehensive Assessment</span>
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
                        <h2 className="text-4xl font-serif font-bold mb-1" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>Proficiency Registration</h2>
                        <p className="text-sm text-gray-600">Secure Your Certificate - 5 Simple Steps</p>
                    </div>

                    <div className={`bg-white rounded-xl shadow-sm border p-8 mb-6 ${isDarkMode ? 'border-[#1a1a3e] bg-[#050040]' : 'border-gray-100'}`}>

                        {/* Visual Stepper */}
                        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
                            {[1, 2, 3, 4, 5].map((id) => {
                                const labels = ['Personal', 'Education', 'Intent', 'Payment', 'Review'];
                                const done = currentStep > id;
                                const active = currentStep === id;
                                return (
                                    <div key={id} className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${done || active ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-500 border'
                                            }`} style={{ boxShadow: active ? '0 4px 10px rgba(22,163,74,0.12)' : 'none' }}>
                                            {currentStep > id ? "✓" : id}
                                        </div>
                                        <span className="text-[9px] mt-2 text-gray-600 truncate max-w-[60px] text-center">{labels[id - 1]}</span>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800">
                                {currentStep === 1 ? 'Personal Information' :
                                    currentStep === 2 ? 'Educational Background' :
                                        currentStep === 3 ? 'Statement of Intent' :
                                            currentStep === 4 ? 'Payment' : 'Review'}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {currentStep === 1 && 'Please provide your details exactly as shown on your ID.'}
                                {currentStep === 2 && 'Select your highest level of education.'}
                                {currentStep === 3 && 'Briefly explain why you need this certificate.'}
                                {currentStep === 4 && 'Complete the registration fee payment.'}
                                {currentStep === 5 && 'Review and submit your application.'}
                            </p>
                        </div>

                        <form ref={formRef} onSubmit={handleNextStep} className="space-y-4">

                            {/* Step 1: Personal Info (Identical to IELTS) */}
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
                                                country={(() => {
                                                    if (formData.country) {
                                                        const c = Country.getAllCountries().find(c => c.name === formData.country);
                                                        return c ? c.isoCode.toLowerCase() : 'us';
                                                    }
                                                    return 'us';
                                                })()}
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
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Program Selection</label>
                                            <input type="text" value="Proficiency Test" readOnly className="w-full px-4 py-3 border border-gray-200 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed font-medium" />
                                        </div>
                                    </div>


                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Password <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    placeholder="Min 6 chars + Upper/Lower/Num/Sym"
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-blue-100"
                                                    required
                                                />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                    {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    placeholder="••••••"
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-blue-100"
                                                    required
                                                />
                                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                    {showConfirmPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex justify-end">
                                        <button type="submit" className="px-8 py-3 rounded-lg text-white font-semibold transition-all hover:opacity-90 active:scale-95" style={{ backgroundColor: '#010080' }}>Next Step</button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Educational Background */}
                            {currentStep === 2 && (
                                <div className="animate-fadeIn space-y-6">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Highest Educational Level <span className="text-red-500">*</span></label>
                                    <div className="space-y-3">
                                        {['High School Diploma', 'Undergraduate', 'Postgraduate Diploma', 'Postgraduate', 'None'].map((level) => (
                                            <button type="button" key={level} onClick={() => setFormData(prev => ({ ...prev, educational_level: level }))} className={`w-full text-left flex items-center p-4 border rounded-xl cursor-pointer transition-all hover:bg-blue-50 ${formData.educational_level === level ? "border-[#010080] bg-blue-50 ring-1 ring-[#010080]" : "border-gray-200 bg-white"
                                                }`}>
                                                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${formData.educational_level === level ? "border-[#010080]" : "border-gray-300"}`}>
                                                    {formData.educational_level === level && <div className="w-2.5 h-2.5 rounded-full bg-[#010080]" />}
                                                </div>
                                                <span className="block text-sm font-medium text-gray-700">{level}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mt-8 flex justify-between items-center">
                                        <button type="button" onClick={handleBack} className="px-6 py-3 rounded-lg bg-gray-200 text-gray-700 font-semibold text-sm transition-all hover:bg-gray-300">Back</button>
                                        <button type="submit" className="px-8 py-3 rounded-lg text-white font-semibold transition-all hover:opacity-90 active:scale-95" style={{ backgroundColor: '#010080' }}>Next Step</button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Intent Essay */}
                            {currentStep === 3 && (
                                <div className="animate-fadeIn space-y-4">
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-2">
                                        <h4 className="text-sm font-bold text-[#010080] mb-1">Why do you need this certificate?</h4>
                                        <p className="text-xs text-gray-600">Please write a brief statement explaining your reasons (e.g., University admission, Job application). This is required for administrative review.</p>
                                    </div>
                                    <textarea
                                        name="reason_essay"
                                        value={formData.reason_essay}
                                        onChange={handleChange}
                                        rows={10}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 text-sm leading-relaxed"
                                        placeholder="I am applying for..."
                                    />
                                    <div className="flex justify-between text-xs text-gray-400">
                                        <span>Minimum 50 characters</span>
                                        <span>{formData.reason_essay.length} chars</span>
                                    </div>
                                    <div className="mt-8 flex justify-between items-center">
                                        <button type="button" onClick={handleBack} className="px-6 py-3 rounded-lg bg-gray-200 text-gray-700 font-semibold text-sm transition-all hover:bg-gray-300">Back</button>
                                        <button type="submit" className="px-8 py-3 rounded-lg text-white font-semibold transition-all hover:opacity-90 active:scale-95" style={{ backgroundColor: '#010080' }}>Next Step</button>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Payment */}
                            {currentStep === 4 && (
                                <div className="animate-fadeIn space-y-6">
                                    <div className="border border-blue-100 rounded-lg p-4 bg-blue-50 mb-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-600">Registration Fee</p>
                                                <p className="text-2xl font-bold" style={{ color: '#010080' }}>${APPLICATION_FEE.toFixed(2)}</p>
                                            </div>
                                            <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center text-2xl shadow-sm">💳</div>
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
                                                <p className="text-xs text-gray-500 mt-1">Manual transfer</p>
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

                                    <div className="mt-8 flex justify-between items-center">
                                        <button type="button" onClick={handleBack} className="px-6 py-3 rounded-lg bg-gray-200 text-gray-700 font-semibold text-sm transition-all hover:bg-gray-300">Back</button>
                                        <button type="submit" className="px-8 py-3 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition-colors shadow-md">Next Step</button>
                                    </div>
                                </div>
                            )}

                            {/* Step 5: Review */}
                            {currentStep === 5 && (
                                <div className="animate-fadeIn">
                                    <h4 className="font-bold text-lg text-gray-800 border-b pb-2 mb-4">Application Summary</h4>

                                    <div className="space-y-4 mb-4">
                                        <div className="p-4 bg-white border rounded-lg flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-md flex-shrink-0" style={{ backgroundColor: '#c7d2fe' }} />
                                            <div>
                                                <h4 className="font-bold text-[#010080] text-sm">Personal Information</h4>
                                                <p className="text-sm text-gray-600 font-medium">{formData.firstName} {formData.lastName}</p>
                                                <p className="text-xs text-gray-500">{formData.email} • {formData.phone}</p>
                                                <p className="text-xs text-gray-500">{formData.country}, {formData.city}</p>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-white border rounded-lg flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-md bg-green-100 flex-shrink-0" />
                                            <div>
                                                <h4 className="font-bold text-[#010080] text-sm">Education & Intent</h4>
                                                <p className="text-sm text-gray-600 font-medium">{formData.educational_level}</p>
                                                <p className="text-xs text-gray-500 italic mt-1 line-clamp-2">"{formData.reason_essay}"</p>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-white border rounded-lg flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-md bg-red-100 flex-shrink-0" />
                                            <div>
                                                <h4 className="font-bold text-[#010080] text-sm">Payment Information</h4>
                                                <p className="text-sm text-gray-600">Method: {paymentMethod === 'bank' ? 'Bank Transfer' : 'EVC - Waafi'}</p>
                                                <p className="text-sm text-gray-600 font-bold">Fee: ${APPLICATION_FEE.toFixed(2)}</p>
                                                <p className="text-xs text-gray-500">Account: {paymentAccountNumber || '-'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 flex gap-3 items-start">
                                        <span className="text-yellow-600 text-lg">⚠️</span>
                                        <p className="text-xs text-yellow-800 leading-snug pt-1">
                                            By clicking submit, you confirm that all details are correct. You will be redirected to the student dashboard upon success.
                                        </p>
                                    </div>

                                    <div className="mt-8 flex justify-between items-center">
                                        <button type="button" onClick={handleBack} className="px-6 py-3 rounded-lg bg-gray-200 text-gray-700 font-semibold text-sm transition-all hover:bg-gray-300">Back</button>
                                        <button
                                            type="button"
                                            onClick={handleFinalSubmit}
                                            disabled={isPaying || isCreating}
                                            className="px-8 py-3 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition-colors shadow-md disabled:opacity-50"
                                        >
                                            {isPaying ? 'Processing...' : (isCreating ? 'Creating Account...' : 'Submit Application')}
                                        </button>
                                    </div>
                                </div>
                            )}

                        </form>
                    </div>
                    <p className="text-center text-gray-500 text-sm">
                        Already registered? <Link href="/auth/login" className="font-bold hover:underline" style={{ color: '#010080' }}>Sign In</Link>
                    </p>
                </div>
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
