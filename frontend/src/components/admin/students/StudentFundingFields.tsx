"use client";

import { mapPackagePrograms } from "@/utils/studentPayment";

export default function StudentFundingFields({
  formData,
  setFormData,
  handleInputChange,
  isDark,
  paymentPackages = [],
}) {
  const packages = paymentPackages.map(mapPackagePrograms);

  return (
    <div className={`p-5 rounded-xl border-2 ${isDark ? "bg-green-900/10 border-green-700/30" : "bg-green-50/30 border-green-100"}`}>
      <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDark ? "text-green-400" : "text-green-600"}`}>
        Funding / Scholarship
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <label className={`block text-sm font-semibold mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            Funding Status
          </label>
          <select
            name="funding_status"
            value={formData.funding_status || "Paid"}
            onChange={(e) => {
              handleInputChange(e);
              if (e.target.value !== "Sponsorship") {
                setFormData((prev) => ({ ...prev, sponsorship_package: "" }));
              }
            }}
            className={`w-full px-4 py-2.5 border-2 rounded-xl ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200"}`}
          >
            <option value="Paid">Paid</option>
            <option value="Full Scholarship">Full Scholarship</option>
            <option value="Partial Scholarship">Partial Scholarship / Discount</option>
            <option value="Sponsorship">Sponsorship</option>
          </select>
        </div>

        {["Paid", "Partial Scholarship", "Full Scholarship"].includes(formData.funding_status) && (
          <div>
            <label className={`block text-sm font-semibold mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Months Covered</label>
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

        {formData.funding_status === "Partial Scholarship" && (
          <div>
            <label className={`block text-sm font-semibold mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              Scholarship / Discount (%)
            </label>
            <input
              type="number"
              name="scholarship_percentage"
              value={formData.scholarship_percentage || ""}
              onChange={handleInputChange}
              min="1"
              max="99"
              placeholder="e.g. 25"
              className={`w-full px-4 py-3 border-2 rounded-xl ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200"}`}
            />
          </div>
        )}

        {formData.funding_status === "Sponsorship" && (
          <>
            <div>
              <label className={`block text-sm font-semibold mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Sponsor Name</label>
              <input
                type="text"
                name="sponsor_name"
                value={formData.sponsor_name || ""}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border-2 rounded-xl ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200"}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-semibold mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Package</label>
              <select
                name="sponsorship_package"
                value={formData.sponsorship_package || ""}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border-2 rounded-xl ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200"}`}
              >
                <option value="">Select Package</option>
                {packages
                  .filter((pkg) => pkg.programs?.some((prog) => prog.title === formData.chosen_program))
                  .map((pkg) => (
                    <option key={pkg.id} value={pkg.package_name}>
                      {pkg.package_name} ({pkg.duration_months} Months)
                    </option>
                  ))}
              </select>
            </div>
          </>
        )}

        <div>
          <label className={`block text-sm font-semibold mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Amount ($)</label>
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
          <label className={`block text-sm font-semibold mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Month Paid For</label>
          <input
            type="text"
            name="funding_month"
            value={formData.funding_month || ""}
            onChange={handleInputChange}
            placeholder="e.g. January 2026"
            className={`w-full px-4 py-3 border-2 rounded-xl ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200"}`}
          />
        </div>
      </div>
    </div>
  );
}
