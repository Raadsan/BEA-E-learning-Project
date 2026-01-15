"use client";

import { useState } from "react";
import { useDarkMode } from "@/context/ThemeContext";

export default function MyCertificationPage() {
  const { isDark } = useDarkMode();
  const [certifications] = useState([]);

  const bg = isDark ? "bg-gray-900" : "bg-gray-100";
  const card = isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900";

  return (
    <div className={`min-h-screen transition-colors pt-12 w-full px-6 sm:px-10 pb-20 ${bg}`}>
      <div className="w-full">
        <div className={`mb-6 p-6 rounded-xl shadow ${card}`}>
          <h1 className="text-2xl font-bold mb-2">My Certification</h1>
          <p className={isDark ? "text-gray-300" : "text-gray-600"}>
            View and download your earned certificates and achievements.
          </p>
        </div>

        {certifications.length === 0 ? (
          <div className={`p-6 rounded-xl shadow ${card} text-center`}>
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
              No certifications earned yet. Complete courses to earn certificates!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certifications.map((cert) => (
              <div key={cert.id} className={`p-6 rounded-xl shadow ${card} border-2 border-[#010080]`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {cert.courseName}
                    </h3>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      {cert.certificateType || "Completion Certificate"}
                    </p>
                  </div>
                  <svg className="w-12 h-12 text-[#010080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <p className={`text-sm mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Issued on: {cert.issuedDate ? new Date(cert.issuedDate).toLocaleDateString() : "N/A"}
                </p>
                <button className="w-full px-4 py-2 bg-[#010080] text-white rounded-lg text-sm font-medium hover:bg-[#0200a0] transition-colors">
                  Download Certificate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

