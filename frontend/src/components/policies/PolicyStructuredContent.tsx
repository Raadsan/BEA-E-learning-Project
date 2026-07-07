"use client";

import { useDarkMode } from "@/context/ThemeContext";
import type { StructuredPolicyContent } from "@/utils/policyContent";

export default function PolicyStructuredContent({
  title,
  description,
  content,
}: {
  title?: string | null;
  description?: string | null;
  content: StructuredPolicyContent;
}) {
  const { isDark } = useDarkMode();

  return (
    <div className={`${isDark ? "bg-[#03002e]" : "bg-gray-50"}`}>
      <section
        className="relative flex items-center justify-center overflow-hidden px-6 py-12 sm:px-10"
        style={{
          background: isDark
            ? "linear-gradient(135deg, #03002e 0%, #050040 50%, #03002e 100%)"
            : "linear-gradient(135deg, #1a237e 0%, #311b92 50%, #b71c1c 100%)",
        }}
      >
        <div className="w-full max-w-5xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 mb-5">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
            {content.policyName || title || "Policy"}
          </h1>
          {title && content.policyName !== title && (
            <p className="text-sm sm:text-base uppercase tracking-[0.2em] text-white/80">
              {title}
            </p>
          )}
        </div>
      </section>

      {description && (
        <section className={`py-10 sm:py-14 ${isDark ? "bg-[#03002e]" : "bg-white"}`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`rounded-2xl p-6 sm:p-8 md:p-10 shadow-lg border-l-4 border-green-600 ${isDark ? "bg-[#050040]" : "bg-white"}`}>
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${isDark ? "bg-green-600/20" : "bg-green-100"}`}>
                  <svg className={`w-6 h-6 ${isDark ? "text-green-400" : "text-green-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className={`text-xl sm:text-2xl font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                    Policy Overview
                  </h2>
                  <p className={`text-base sm:text-lg leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    {description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className={`py-10 sm:py-14 pb-16 sm:pb-20 ${isDark ? "bg-[#04003a]" : "bg-gray-50"}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8 sm:space-y-10">
            {content.sections.map((section, index) => (
              <section
                key={section.id}
                className={`rounded-2xl overflow-hidden shadow-lg ${isDark ? "bg-[#050040]" : "bg-white"}`}
              >
                <div
                  className="px-6 sm:px-8 py-5 sm:py-6 flex items-center gap-4"
                  style={{
                    background: isDark
                      ? "linear-gradient(90deg, #03002e 0%, #050040 100%)"
                      : "linear-gradient(90deg, #010080 0%, #3949ab 100%)",
                  }}
                >
                  <div className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center ${isDark ? "bg-white/10" : "bg-white/20"}`}>
                    <span className="text-white text-lg sm:text-xl font-bold">{section.numberLabel?.trim() || index + 1}</span>
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      {(section.numberLabel?.trim() || index + 1) + ". "} {section.title}
                    </h2>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <p className={`text-base sm:text-lg whitespace-pre-wrap leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    {section.body}
                  </p>
                  {section.note?.trim() && (
                    <div className={`mt-5 rounded-xl border-l-4 p-4 ${isDark ? "bg-[#03002e] border-amber-400 text-amber-100" : "bg-amber-50 border-amber-500 text-amber-900"}`}>
                      <p className="text-sm font-semibold mb-1">Note</p>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{section.note}</p>
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
