"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetCurrentUserQuery } from "@/lib/api/authApi";
import { useGetPaymentPackagesQuery } from "@/lib/api/paymentPackageApi";
import { getStudentUpgradePackages, isStudentSubscriptionActive } from "@/utils/studentPayment";
import StudentPageHeader from "@/components/student/StudentPageHeader";
import Loader from "@/components/Loader";

export default function UpgradePaymentPage() {
  const { isDark } = useDarkMode();
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useGetCurrentUserQuery();
  const { data: packages = [], isLoading: packagesLoading } = useGetPaymentPackagesQuery();

  const isPaid = isStudentSubscriptionActive(user);

  const [expandedPkgId, setExpandedPkgId] = useState<number | null>(null);

  const studentPackages = useMemo(
    () => getStudentUpgradePackages(packages, user),
    [packages, user]
  );

  const handleUpgradeClick = (pkg: { id: number }) => {
    localStorage.setItem("selectedUpgradePackage", JSON.stringify(pkg));
    router.push("/portal/student/payments/upgrade/checkout");
  };

  if (userLoading || packagesLoading) {
    return (
      <div className={`min-h-screen pt-4 w-full px-6 sm:px-10 pb-20 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
        <Loader fullPage />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors pt-4 pb-20 w-full px-6 sm:px-10 ${
        isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="w-full">
        <Link
          href="/portal/student/payments"
          className="inline-flex items-center gap-2 text-sm mb-4 hover:underline text-[#010080]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to History
        </Link>

        {!isPaid && (
          <div className="mb-8 rounded-xl p-6 bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200 text-amber-950">
            <p className="text-xs font-bold uppercase tracking-wider mb-1">Payment expired</p>
            <p className="text-sm font-medium">
              Your access has ended. Choose a package below to renew and unlock your courses again.
            </p>
          </div>
        )}

        <StudentPageHeader
          title="Upgrade Packages"
          description={`Choose your renewal cycle for ${user?.chosen_program || "your program"}.`}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {studentPackages.map((pkg) => {
            const isExpanded = expandedPkgId === pkg.id;
            const descriptionLines = (pkg.description || "• Standard access\n• Study materials\n• Academic support")
              .split("\n")
              .filter((line) => line.trim());
            const visibleLines = isExpanded ? descriptionLines : descriptionLines.slice(0, 5);
            const hasMore = descriptionLines.length > 5;

            return (
              <div
                key={pkg.id}
                className={`relative flex flex-col p-8 rounded-2xl border transition-all duration-500 min-h-[500px] ${
                  isDark
                    ? "bg-gray-800 border-gray-700 hover:border-blue-500/50"
                    : "bg-white border-gray-200 hover:border-blue-100 shadow-sm"
                } hover:-translate-y-2 hover:shadow-2xl hover:z-10`}
              >
                <div className="mb-6">
                  <h3 className={`text-xl font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                    {pkg.package_name}
                  </h3>

                  <div className="flex items-baseline gap-1 mt-6">
                    <span className={`text-5xl font-bold ${isDark ? "text-white" : "text-black"}`}>
                      ${pkg.studentPrice.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                    </span>
                    <span className="text-lg font-medium opacity-50">/{pkg.duration_months} month</span>
                  </div>
                  {pkg.hasPackageDiscount && (
                    <p className="text-sm text-amber-600 mt-2 font-semibold">
                      Package discount applied (regular ${pkg.basePrice.toFixed(2)})
                    </p>
                  )}
                  {pkg.hasScholarshipDiscount && (
                    <p className="text-sm text-green-600 mt-2 font-semibold">
                      Scholarship/discount applied (was ${pkg.packagePrice.toFixed(2)})
                    </p>
                  )}
                </div>

                <div
                  className={`flex-1 mb-8 space-y-4 border-t border-b py-6 ${
                    isDark ? "border-gray-700" : "border-gray-100"
                  }`}
                >
                  {visibleLines.map((line, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                        {line.replace(/^[•*-]\s*/, "").trim()}
                      </span>
                    </div>
                  ))}

                  {hasMore && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedPkgId(isExpanded ? null : pkg.id);
                      }}
                      className="text-xs font-bold text-[#010080] dark:text-blue-400 hover:underline flex items-center gap-1 mt-2"
                    >
                      {isExpanded ? (
                        <>
                          Show Less
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </>
                      ) : (
                        <>
                          See More
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleUpgradeClick(pkg)}
                  className={`w-full py-4 rounded-xl font-normal uppercase tracking-wider text-xs transition-all ${
                    isDark
                      ? "bg-blue-600 text-white hover:bg-blue-500"
                      : "bg-[#010080] text-white hover:bg-blue-900 shadow-sm"
                  }`}
                >
                  {isPaid ? "Upgrade Payment" : "Renew Access"}
                </button>
              </div>
            );
          })}

          {studentPackages.length === 0 && (
            <div className="col-span-full py-16 text-center space-y-3">
              <p className={`text-lg font-semibold ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                No packages found for your program
              </p>
              <p className="text-sm opacity-60 max-w-md mx-auto">
                Program: <strong>{user?.chosen_program || "Not set"}</strong>. Ask admin to assign
                payment packages to this program.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
