"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useGetPaymentPackagesQuery } from "@/redux/api/paymentPackageApi";
import { useToast } from "@/components/Toast";
import Link from "next/link";

export default function UpgradePaymentPage() {
    const { isDark } = useDarkMode();
    const router = useRouter();
    const { showToast } = useToast();
    const { data: user } = useGetCurrentUserQuery();
    const { data: packages = [] } = useGetPaymentPackagesQuery();

    // Filter packages strictly matching student's program
    const studentPackages = packages.map(pkg => {
        const progMatch = pkg.programs?.find(p => p.title === user?.chosen_program);
        if (!progMatch) return null;
        return {
            ...pkg,
            studentPrice: progMatch.price ? parseFloat(progMatch.price) * (pkg.duration_months || 1) : 0
        };
    }).filter(Boolean)
        .sort((a, b) => (a.duration_months || 0) - (b.duration_months || 0));

    const handleUpgradeClick = (pkg) => {
        localStorage.setItem("selectedUpgradePackage", JSON.stringify(pkg));
        router.push("/portal/student/payments/upgrade/checkout");
    };

    return (
        <div className={`min-h-screen transition-colors pt-12 pb-20 w-full px-6 sm:px-10 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="w-full">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                    <div className="flex-1">
                        <Link
                            href="/portal/student/payments"
                            className="inline-flex items-center gap-2 text-sm text-black mb-4 hover:underline"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to History
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight mb-1">Upgrade Packages</h1>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Choose your renewal cycle for <span className={`${isDark ? 'text-blue-400 font-semibold' : 'text-black font-semibold'}`}>{user?.chosen_program}</span>
                        </p>
                    </div>
                </div>

                {/* Packages Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {studentPackages.map((pkg) => (
                        <div
                            key={pkg.id}
                            className={`relative flex flex-col p-8 rounded-2xl border transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700 hover:border-blue-500/50' : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                                }`}
                        >
                            <div className="mb-6">
                                <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {pkg.package_name}
                                </h3>

                                {/* Main Pricing Display: $120/6month (Big Price) */}
                                <div className="flex items-baseline gap-1 mt-6">
                                    <span className={`text-5xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                                        ${pkg.studentPrice.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                                    </span>
                                    <span className={`text-lg font-medium opacity-50`}>
                                        /{pkg.duration_months}month
                                    </span>
                                </div>
                            </div>

                            {/* Features List */}
                            <div className={`flex-1 mb-8 space-y-4 border-t border-b py-6 ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                                {(pkg.description || "• Standard access\n• Study materials\n• Academic support").split('\n').filter(line => line.trim()).map((line, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <div className="mt-1 flex-shrink-0">
                                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <span className={`text-sm opacity-80`}>
                                            {line.replace(/^[•*-]\s*/, '').trim()}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleUpgradeClick(pkg)}
                                className={`w-full py-4 rounded-xl font-normal uppercase tracking-wider text-xs transition-all ${isDark ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-[#010080] text-white hover:bg-blue-900 shadow-sm'
                                    }`}
                            >
                                UPGRADE PAYMENT
                            </button>
                        </div>
                    ))}

                    {studentPackages.length === 0 && (
                        <div className="col-span-full py-20 text-center opacity-40 italic">
                            No upgrade packages available for {user?.chosen_program} at this time.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
