"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import {
    useGetStudentPaymentsQuery,
    useCreateEvcPaymentMutation,
    useCreateWaafiPaymentMutation,
    useCreateBankPaymentMutation
} from "@/redux/api/paymentApi";
import { useToast } from "@/components/Toast";
import Link from "next/link";

export default function CheckoutPage() {
    const { isDark } = useDarkMode();
    const router = useRouter();
    const { showToast } = useToast();
    const { data: user } = useGetCurrentUserQuery();
    const { data: payments = [] } = useGetStudentPaymentsQuery(user?.id, { skip: !user?.id });

    const [createEvc] = useCreateEvcPaymentMutation();
    const [createWaafi] = useCreateWaafiPaymentMutation();
    const [createBank] = useCreateBankPaymentMutation();

    const [selectedPackage, setSelectedPackage] = useState(null);
    const [method, setMethod] = useState("waafi"); // Default to Waafi
    const [phone, setPhone] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("selectedUpgradePackage");
        if (stored) {
            setSelectedPackage(JSON.parse(stored));
        } else {
            router.push("/portal/student/payments/upgrade");
        }
    }, [router]);

    const handleWalletFill = () => {
        if (payments && payments.length > 0) {
            const lastPayment = payments[0];
            setPhone(lastPayment.account_number || "");
            setMethod(lastPayment.method?.toLowerCase() || "evc");
            showToast("Wallet details restored!", "success");
        } else {
            showToast("No previous payment record found.", "info");
        }
    };

    const handlePayment = async () => {
        if (!selectedPackage) return;
        if (!phone) {
            showToast("Please enter your mobile number", "error");
            return;
        }

        setIsProcessing(true);
        try {
            const payload = {
                student: { id: user.id || user.student_id, email: user.email },
                programId: selectedPackage.id,
                amount: selectedPackage.studentPrice,
                accountNumber: phone
            };

            const res = await createWaafi({
                payerPhone: phone,
                amount: selectedPackage.studentPrice,
                programId: selectedPackage.id,
                studentEmail: user.email,
                description: `${selectedPackage.package_name} for ${user.full_name}`
            }).unwrap();

            if (res.success) {
                showToast("Payment submitted! Awaiting verification.", "success");
                localStorage.removeItem("selectedUpgradePackage");
                router.push("/portal/student/payments");
            }
            if (res.requiresPin) {
                showToast("Please enter the PIN on your phone to complete payment.", "info");
                setIsProcessing(false);
                return;
            }
        } catch (err) {
            showToast(err?.data?.error || "Payment failed", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    if (!selectedPackage) return null;

    return (
        <div className={`min-h-screen transition-colors pt-12 pb-20 w-full px-6 sm:px-10 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="max-w-2xl mx-auto">
                <Link
                    href="/portal/student/payments/upgrade"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 mb-8 hover:text-blue-600 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Selection
                </Link>

                <div className="space-y-10">
                    {/* Contact Information */}
                    <section>
                        <h2 className="text-lg font-semibold mb-4">Contact information</h2>
                        <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                            <div className="flex justify-between items-center">
                                <span className="text-sm opacity-60">Email</span>
                                <span className="text-sm font-medium">{user?.email}</span>
                            </div>
                        </div>
                    </section>

                    {/* Payment Method - Stripe/Cursor Style */}
                    <section>
                        <h2 className="text-lg font-semibold">Payment method</h2>

                        <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                            {/* WAAFI */}
                            <div
                                className={`transition-all duration-300 ${isDark ? 'bg-blue-900/10' : 'bg-blue-50/30'}`}
                            >
                                <div className={`flex items-center justify-between p-5`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center border-blue-600`}>
                                            <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-emerald-500 rounded text-white font-bold text-[10px]">WAF</div>
                                            <span className="text-sm font-medium">Waafi Mobile</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-5 pb-5">
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="Enter Waafi Number (061XXXXXXX)"
                                        className={`w-full px-4 py-3 rounded-lg border outline-none transition-all text-sm font-medium ${isDark ? 'bg-gray-900 border-gray-700 focus:border-blue-500' : 'bg-gray-50 border-gray-200 focus:border-blue-600'}`}
                                        autoFocus
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Subscribe Button & Disclaimer */}
                    <section className="pt-6">
                        <button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className={`w-full py-4 rounded-xl text-sm font-normal uppercase tracking-widest transition-all ${isProcessing ? 'opacity-50 grayscale' : ''
                                } bg-[#010080] hover:bg-blue-900 text-white`}
                        >
                            {isProcessing ? 'Processing...' : 'Pay Now'}
                        </button>

                        <p className="text-[11px] text-center opacity-40 mt-6 leading-relaxed">
                            By paying, you agree to BEA's terms of service and academic policies.
                            <br className="hidden sm:block" /> Powered by <span className="font-semibold">BEA Payment Gateway</span> | <Link href="/terms-and-conditions" className="hover:underline">Terms</Link> | <Link href="/website/data-policy" className="hover:underline">Privacy</Link>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
