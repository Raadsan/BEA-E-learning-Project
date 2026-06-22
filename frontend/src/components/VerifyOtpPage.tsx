"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useVerifyOtpMutation, useResendOtpMutation } from "@/lib/api/authApi";
import { redirectAfterLogin, saveAuthSession } from "@/utils/authSession";

const OTP_LENGTH = 6;

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isDarkMode } = useTheme();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  const [email, setEmail] = useState("");
  const [otpSessionId, setOtpSessionId] = useState("");
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [info, setInfo] = useState("Enter the 6-digit code sent to your email.");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const otp = digits.join("");

  useEffect(() => {
    const sessionFromUrl = searchParams.get("otpSessionId");
    const emailFromUrl = searchParams.get("email");
    const sessionFromStorage =
      typeof window !== "undefined" ? sessionStorage.getItem("bea_otp_session") : null;
    const emailFromStorage =
      typeof window !== "undefined" ? sessionStorage.getItem("bea_otp_email") : null;

    const session = sessionFromUrl || sessionFromStorage || "";
    const resolvedEmail = emailFromUrl || emailFromStorage || "";

    if (!session || !resolvedEmail) {
      router.replace("/auth/login");
      return;
    }

    setOtpSessionId(session);
    setEmail(resolvedEmail);

    if (typeof window !== "undefined") {
      sessionStorage.setItem("bea_otp_session", session);
      sessionStorage.setItem("bea_otp_email", resolvedEmail);
    }
  }, [searchParams, router]);

  const handleDigitChange = (index: number, value: string) => {
    const char = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    setError("");

    if (char && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((ch, i) => {
      next[i] = ch;
    });
    setDigits(next);
    setError("");
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const code = otp.trim();
    if (code.length !== OTP_LENGTH) {
      setError(`Please enter the ${OTP_LENGTH}-digit verification code.`);
      return;
    }

    try {
      const result = await verifyOtp({ otpSessionId, otp: code }).unwrap();
      if (result.success && result.token && result.user) {
        sessionStorage.removeItem("bea_otp_session");
        sessionStorage.removeItem("bea_otp_email");
        saveAuthSession(result.token, result.user);
        redirectAfterLogin(result.user.role);
      }
    } catch (err: any) {
      setError(err?.data?.error || "Invalid code. Please try again.");
      setDigits(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      const result = await resendOtp({ otpSessionId }).unwrap();
      setInfo(result.message || "A new code has been sent to your email.");
      setDigits(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err?.data?.error || "Could not resend code. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex">
      <div
        className="hidden md:flex md:w-1/2 relative items-center justify-center"
        style={{ backgroundColor: "#010080" }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 border-2 border-white rounded-full"></div>
        </div>
        <div className="relative z-10 text-center px-12">
          <Image src="/images/footerlogo.png" alt="BEA Logo" width={280} height={100} className="mx-auto mb-8" />
          <h1 className="text-4xl font-serif font-bold text-white mb-4">Verify Your Email</h1>
          <p className="text-blue-200 text-lg leading-relaxed max-w-md mx-auto">
            We sent a one-time verification code to your email. Enter it below to access your portal.
          </p>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="md:hidden text-center mb-6 sm:mb-8">
            <Image src="/images/headerlogo.png" alt="BEA Logo" width={180} height={60} className="mx-auto" />
          </div>

          <div className="text-center mb-6 sm:mb-8">
            <h2
              className="text-2xl sm:text-3xl font-serif font-bold mb-2"
              style={{ color: isDarkMode ? "#ffffff" : "#010080" }}
            >
              Enter OTP Code
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Code sent to <span className="font-semibold text-gray-800">{email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {info && (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm text-center">
                {info}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
                Verification Code
              </label>
              <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-bold border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-[#010080] transition-all"
                  />
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying || otp.length !== OTP_LENGTH}
              className="w-full py-4 rounded-xl text-white font-semibold text-lg transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "#010080" }}
            >
              {isVerifying ? "Verifying..." : "Verify & Sign In"}
            </button>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
              <Link href="/auth/login" className="font-semibold hover:underline" style={{ color: "#010080" }}>
                ← Back to sign in
              </Link>
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="font-semibold hover:underline disabled:opacity-50"
                style={{ color: "#010080" }}
              >
                {isResending ? "Sending..." : "Resend code"}
              </button>
            </div>

            <p className="text-center text-gray-600 text-sm">
              Or Back to{" "}
              <Link href="/" className="font-semibold hover:underline" style={{ color: "#010080" }}>
                Home Page
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
