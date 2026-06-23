"use client";

import { useMemo } from "react";
import { mapPackagePrograms } from "@/utils/studentPayment";
import {
  mergeFundingStatus,
  splitFundingStatus,
  type DiscountType,
  type PaymentType,
} from "@/utils/studentFundingForm";

export default function StudentFundingFields({
  formData,
  setFormData,
  handleInputChange,
  isDark,
  paymentPackages = [],
}) {
  const packages = paymentPackages.map(mapPackagePrograms);

  const { paymentType, discountType } = useMemo(
    () => splitFundingStatus(formData.funding_status, formData.scholarship_percentage),
    [formData.funding_status, formData.scholarship_percentage]
  );

  const applyFunding = (
    nextPayment: PaymentType,
    nextDiscount: DiscountType,
    scholarshipPct = formData.scholarship_percentage
  ) => {
    const merged = mergeFundingStatus(nextPayment, nextDiscount, scholarshipPct);
    setFormData((prev) => ({
      ...prev,
      funding_status: merged.funding_status,
      scholarship_percentage:
        merged.scholarship_percentage === null ? "" : merged.scholarship_percentage,
      ...(nextPayment !== "Sponsorship" ? { sponsorship_package: "" } : {}),
      ...(nextDiscount === "none" && nextPayment === "Paid"
        ? { scholarship_percentage: "" }
        : {}),
    }));
  };

  const isPaid = paymentType === "Paid";

  return (
    <div className="space-y-5">
      {/* Payment */}
      <div
        className={`p-5 rounded-xl border-2 ${isDark ? "bg-green-900/10 border-green-700/30" : "bg-green-50/30 border-green-100"}`}
      >
        <h3
          className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDark ? "text-green-400" : "text-green-600"}`}
        >
          Payment
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <label
              className={`block text-sm font-semibold mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              Payment Type
            </label>
            <select
              value={paymentType}
              onChange={(e) => {
                const next = e.target.value as PaymentType;
                applyFunding(next, next === "Sponsorship" ? "none" : discountType);
              }}
              className={`w-full px-4 py-2.5 border-2 rounded-xl ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200"}`}
            >
              <option value="Paid">Paid</option>
              <option value="Sponsorship">Sponsorship</option>
            </select>
          </div>

          {isPaid && (
            <div>
              <label
                className={`block text-sm font-semibold mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}
              >
                Months Covered
              </label>
              <select
                name="paid_months"
                value={formData.paid_months || "1"}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border-2 rounded-xl ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200"}`}
              >
                <option value="1">1 Month</option>
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
              </select>
            </div>
          )}

          {isPaid && (
            <>
              <div>
                <label
                  className={`block text-sm font-semibold mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  Amount ($)
                </label>
                <input
                  type="number"
                  name="funding_amount"
                  value={formData.funding_amount || ""}
                  onChange={handleInputChange}
                  placeholder="Auto-calculated if empty"
                  className={`w-full px-4 py-3 border-2 rounded-xl ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200"}`}
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-semibold mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  Month Paid For
                </label>
                <input
                  type="text"
                  name="funding_month"
                  value={formData.funding_month || ""}
                  onChange={handleInputChange}
                  placeholder="e.g. January 2026"
                  className={`w-full px-4 py-3 border-2 rounded-xl ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200"}`}
                />
              </div>
            </>
          )}

          {paymentType === "Sponsorship" && (
            <>
              <div>
                <label
                  className={`block text-sm font-semibold mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  Sponsor Name
                </label>
                <input
                  type="text"
                  name="sponsor_name"
                  value={formData.sponsor_name || ""}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200"}`}
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-semibold mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  Package
                </label>
                <select
                  name="sponsorship_package"
                  value={formData.sponsorship_package || ""}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 border-2 rounded-xl ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200"}`}
                >
                  <option value="">Select Package</option>
                  {packages
                    .filter((pkg) =>
                      pkg.programs?.some((prog) => prog.title === formData.chosen_program)
                    )
                    .map((pkg) => (
                      <option key={pkg.id} value={pkg.package_name}>
                        {pkg.package_name} ({pkg.duration_months} Months)
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label
                  className={`block text-sm font-semibold mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  Amount ($)
                </label>
                <input
                  type="number"
                  name="funding_amount"
                  value={formData.funding_amount || ""}
                  onChange={handleInputChange}
                  placeholder="Auto-calculated if empty"
                  className={`w-full px-4 py-3 border-2 rounded-xl ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200"}`}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Scholarship / Discount — only for Paid students */}
      {isPaid && (
        <div
          className={`p-5 rounded-xl border-2 ${isDark ? "bg-amber-900/10 border-amber-700/30" : "bg-amber-50/30 border-amber-100"}`}
        >
          <h3
            className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDark ? "text-amber-400" : "text-amber-600"}`}
          >
            Scholarship / Discount
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label
                className={`block text-sm font-semibold mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}
              >
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={(e) => {
                  const next = e.target.value as DiscountType;
                  applyFunding("Paid", next);
                }}
                className={`w-full px-4 py-2.5 border-2 rounded-xl ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200"}`}
              >
                <option value="none">No discount</option>
                <option value="partial">Partial discount (%)</option>
                <option value="full">Full scholarship (100%)</option>
              </select>
            </div>

            {discountType === "partial" && (
              <div>
                <label
                  className={`block text-sm font-semibold mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  Discount Percentage (%)
                </label>
                <input
                  type="number"
                  name="scholarship_percentage"
                  value={formData.scholarship_percentage || ""}
                  onChange={(e) => {
                    handleInputChange(e);
                    applyFunding("Paid", "partial", e.target.value);
                  }}
                  min="1"
                  max="99"
                  placeholder="e.g. 25"
                  className={`w-full px-4 py-3 border-2 rounded-xl ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200"}`}
                />
              </div>
            )}

            {discountType === "full" && (
              <div
                className={`md:col-span-2 text-sm rounded-xl px-4 py-3 border ${isDark ? "border-green-800 bg-green-900/20 text-green-300" : "border-green-200 bg-green-50 text-green-700"}`}
              >
                Full scholarship — student pays $0 on upgrades.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
