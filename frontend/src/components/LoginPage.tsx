"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLoginMutation } from "@/lib/api/authApi";
import { redirectAfterLogin, saveAuthSession } from "@/utils/authSession";

export default function LoginPage() {
  const [login, { isLoading }] = useLoginMutation();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setLoginError("");
  };

  // OTP disabled — uncomment goToOtpPage + OTP redirect in handleSubmit to re-enable
  // const goToOtpPage = (email: string, otpSessionId: string) => {
  //   sessionStorage.setItem("bea_otp_session", otpSessionId);
  //   sessionStorage.setItem("bea_otp_email", email);
  //   router.push(
  //     `/auth/verify-otp?email=${encodeURIComponent(email)}&otpSessionId=${encodeURIComponent(otpSessionId)}`
  //   );
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
      }).unwrap();

      // OTP disabled — direct login
      // if (result.otpSessionId) {
      //   goToOtpPage(formData.email, result.otpSessionId);
      //   return;
      // }

      if (result.success && result.token && result.user) {
        saveAuthSession(result.token, result.user);
        redirectAfterLogin(result.user.role);
        return;
      }

      setLoginError("Login failed. Please try again.");
    } catch (err: any) {
      setLoginError(err?.data?.error || err?.error || "Login failed. Please try again.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10 sm:px-6">
      <div className="flex min-h-[680px] w-full max-w-xl flex-col justify-center bg-white px-6 py-10 shadow-2xl sm:px-14 sm:py-12">
          <div className="mb-7 text-center">
            <Image
              src="/images/headerlogo.png"
              alt="BEA Logo"
              width={280}
              height={135}
              className="mx-auto h-[120px] w-[250px] object-contain sm:h-[135px] sm:w-[280px]"
              priority
            />
          </div>
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-3xl font-serif font-bold mb-2 text-[#010080]">
              Sign In
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-gray-800"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-4 pr-12 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-gray-800"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 text-sm"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {loginError}
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link href="/auth/forgot-password" className="text-sm font-semibold hover:underline" style={{ color: "#010080" }}>
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl text-white font-semibold text-lg transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "#010080" }}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>

            <p className="text-center text-gray-600 text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/auth/registration" className="font-semibold hover:underline" style={{ color: "#010080" }}>
                Sign up
              </Link>
            </p>
            <p className="text-center text-gray-600 text-sm">
              Or Back to{" "}
              <Link href="/" className="font-semibold hover:underline" style={{ color: "#010080" }}>
                Home Page
              </Link>
            </p>
          </form>
      </div>
    </main>
  );
}
