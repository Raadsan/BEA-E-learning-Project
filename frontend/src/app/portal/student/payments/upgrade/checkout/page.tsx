"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetCurrentUserQuery } from "@/lib/api/authApi";
import {
    useGetStudentPaymentsQuery,
    useCreateEvcPaymentMutation,
    useCreateWaafiPaymentMutation,
    useCreateBankPaymentMutation
} from "@/lib/api/paymentApi";
import { useToast } from "@/components/Toast";
import Link from "next/link";

export default function CheckoutPage() {
    const { isDark } = useDarkMode();
    const router = useRouter();
    const { showToast } = useToast();
    const { data: user, refetch: refetchUser } = useGetCurrentUserQuery();
    const { data: payments = [] } = useGetStudentPaymentsQuery(user?.id, { skip: !user?.id });

    const [createEvc] = useCreateEvcPaymentMutation();
    const [createWaafi] = useCreateWaafiPaymentMutation();
    const [createBank] = useCreateBankPaymentMutation();

    const [selectedPackage, setSelectedPackage] = useState(null);
    const [method, setMethod] = useState("waafi"); // 'waafi' | 'bank'
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

    if (!selectedPackage) return null;

    const amountDue = Number(selectedPackage.studentPrice || 0);
    const isFree = amountDue <= 0;

    const handlePayment = async () => {
        if (!selectedPackage || isProcessing) return;
        const amountDue = Number(selectedPackage.studentPrice || 0);
        if (!isFree && !phone) {
            showToast("Please enter your mobile number", "error");
            return;
        }

        setIsProcessing(true);
        try {
            if (method === "bank") {
                // Bank Transfer – submit reference and wait for admin confirmation
                const res = await createBank({
                    amount: amountDue,
                    packageId: selectedPackage.id,
                    studentEmail: user.email,
                    description: `${selectedPackage.package_name} for ${user.full_name}`,
                }).unwrap();
                showToast(
                    res.message || "Bank transfer request submitted. Admin will confirm your payment shortly.",
                    "success"
                );
                localStorage.removeItem("selectedUpgradePackage");
                router.push("/portal/student/payments");
                return;
            }

            const res = await createWaafi({
                payerPhone: phone || "000000000",
                amount: amountDue,
                packageId: selectedPackage.id,
                programId: selectedPackage.id,
                studentEmail: user.email,
                description: `${selectedPackage.package_name} for ${user.full_name}`
            }).unwrap();

            if (res.success) {
                await refetchUser();
                const months = res.monthsAdded || selectedPackage.duration_months;
                const until = res.paidUntil
                    ? new Date(res.paidUntil).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                    : null;
                showToast(
                    res.message ||
                        (until
                            ? `Payment successful! ${months} month(s) added. Access until ${until}.`
                            : "Payment successful! Your access has been renewed."),
                    "success"
                );
                localStorage.removeItem("selectedUpgradePackage");
                router.push("/portal/student");
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

    return (
        <div className={`min-h-screen transition-colors pt-4 pb-20 w-full px-6 sm:px-10 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
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
                    <section>
                        <h2 className="text-lg font-semibold mb-4">Order summary</h2>
                        <div className={`p-5 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                            <p className="font-semibold">{selectedPackage.package_name}</p>
                            <p className="text-sm opacity-60 mt-1">{selectedPackage.duration_months} month(s) access</p>
                            <p className={`text-3xl font-bold mt-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                ${amountDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                            {selectedPackage.hasPackageDiscount && (
                                <p className="text-sm text-amber-600 mt-2 font-medium">
                                    {selectedPackage.basePrice > 0 ? Math.round(((selectedPackage.basePrice - selectedPackage.packagePrice) / selectedPackage.basePrice) * 100) : 0}% package discount
                                </p>
                            )}
                            {selectedPackage.hasScholarshipDiscount && (
                                <p className="text-sm text-green-600 mt-2 font-medium">
                                    {selectedPackage.packagePrice > 0 ? Math.round(((selectedPackage.packagePrice - selectedPackage.studentPrice) / selectedPackage.packagePrice) * 100) : 0}% scholarship discount
                                </p>
                            )}
                            {isFree && (
                                <p className="text-sm text-green-600 mt-2 font-medium">
                                    No payment required — your scholarship covers this package.
                                </p>
                            )}
                        </div>
                    </section>

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
                    {!isFree && (
                    <section>
                        <h2 className="text-lg font-semibold">Payment method</h2>

                        <div className={`rounded-xl border overflow-hidden p-5 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                            {/* WAAFI */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-1.5 bg-emerald-500 rounded text-white font-bold text-[10px]">WAF</div>
                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Waafi Mobile</span>
                            </div>
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Enter Waafi Number (061XXXXXXX)"
                                className={`w-full px-4 py-3 rounded-lg border outline-none transition-all text-sm font-medium ${isDark ? 'bg-gray-900 border-gray-700 focus:border-blue-500 text-white' : 'bg-gray-50 border-gray-200 focus:border-blue-600'}`}
                                autoFocus
                            />
                        </div>
                    </section>
                    )}

                    {/* Subscribe Button & Disclaimer */}
                    <section className="pt-6">
                        <button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className={`w-full py-4 rounded-xl text-sm font-normal uppercase tracking-widest transition-all ${isProcessing ? 'opacity-50 grayscale' : ''
                                } bg-[#010080] hover:bg-blue-900 text-white`}
                        >
                            {isProcessing ? 'Processing...' : isFree ? 'Activate Access' : 'Pay Now'}
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
