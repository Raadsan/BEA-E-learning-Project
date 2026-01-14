"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

export default function ResetPasswordPage() {
    const router = useRouter();
    const params = useParams();
    const token = params?.token;

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
        if (!passwordRegex.test(password)) {
            setError("Password must be at least 6 characters and include uppercase, lowercase, number, and symbol (@$!%*?&)");
            return;
        }

        try {
            const res = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });
            const data = await res.json();

            if (data.success) {
                setSubmitted(true);
                setTimeout(() => {
                    router.push("/login");
                }, 3000);
            } else {
                setError(data.error || "Failed to reset password");
            }
        } catch (err) {
            console.error("Error:", err);
            setError("Something went wrong. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Image/Brand Section */}
            <div
                className="hidden md:flex md:w-1/2 relative items-center justify-center"
                style={{ backgroundColor: '#010080' }}
            >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full"></div>
                    <div className="absolute bottom-20 right-20 w-48 h-48 border-2 border-white rounded-full"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 text-center px-12">
                    <div className="mb-8">
                        <Image
                            src="/images/footerlogo.png"
                            alt="BEA Logo"
                            width={280}
                            height={100}
                            className="mx-auto"
                        />
                    </div>
                    <h1 className="text-4xl font-serif font-bold text-white mb-4">
                        Reset Your Password
                    </h1>
                    <p className="text-blue-200 text-lg leading-relaxed max-w-md mx-auto">
                        Create a new, strong password to secure your account.
                    </p>
                </div>
            </div>

            {/* Right Side - Reset Password Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 bg-gray-50">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="md:hidden text-center mb-6">
                        <Image
                            src="/images/headerlogo.png"
                            alt="BEA Logo"
                            width={180}
                            height={60}
                            className="mx-auto"
                        />
                    </div>

                    {!submitted ? (
                        <>
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-serif font-bold mb-2" style={{ color: '#010080' }}>
                                    New Password
                                </h2>
                                <p className="text-gray-600">
                                    Please enter your new password below.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Password Field */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-4 pr-12 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                            required
                                            placeholder="Min 6 chars + Upper/Lower/Num/Sym"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password Field */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full pl-4 pr-12 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                            required
                                            placeholder="Re-enter your password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="w-full py-4 rounded-xl text-white font-semibold text-lg transition-all duration-300 hover:opacity-90 hover:shadow-lg transform hover:-translate-y-0.5"
                                    style={{ backgroundColor: '#010080' }}
                                >
                                    Reset Password
                                </button>
                            </form>
                        </>
                    ) : (
                        /* Success Message */
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-serif font-bold mb-4" style={{ color: '#010080' }}>
                                Password Reset!
                            </h2>
                            <p className="text-gray-600 mb-8">
                                Your password has been successfully updated. You will be redirected to the login page shortly.
                            </p>
                            <Link
                                href="/login"
                                className="inline-block px-8 py-3 rounded-lg text-white font-semibold transition-colors hover:opacity-90"
                                style={{ backgroundColor: '#010080' }}
                            >
                                Go to Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const EyeIcon = ({ size = 24 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
);

const EyeOffIcon = ({ size = 24 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45( -5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
);
