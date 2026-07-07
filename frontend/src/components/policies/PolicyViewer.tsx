"use client";

import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useDarkMode } from "@/context/ThemeContext";
import PolicyPageBody from "@/components/policies/PolicyPageBody";
import { policyWebsitePath, isSystemPolicy } from "@/constants/policies";
import { useGetPolicyBySlugQuery } from "@/lib/api/policyApi";

export default function PolicyViewer({
  slug,
  backHref,
  backLabel = "Back to Policies",
  showWebsiteLink = false,
  systemOnly = false,
}: {
  slug: string;
  backHref: string;
  backLabel?: string;
  showWebsiteLink?: boolean;
  systemOnly?: boolean;
}) {
  const { isDark } = useDarkMode();
  const { data: policy, isLoading, isError } = useGetPolicyBySlugQuery(slug);

  if (systemOnly && !isSystemPolicy(slug)) {
    return (
      <div className={`p-8 rounded-xl border text-center ${isDark ? "bg-gray-800 border-gray-700 text-gray-300" : "bg-white border-gray-200"}`}>
        <p className="mb-4">Policy not found.</p>
        <Link href={backHref} className="text-[#010080] font-semibold hover:underline">
          {backLabel}
        </Link>
      </div>
    );
  }

  if (policy?.status === "inactive") {
    return (
      <div className={`p-8 rounded-xl border text-center ${isDark ? "bg-gray-800 border-gray-700 text-gray-300" : "bg-white border-gray-200"}`}>
        <p className="mb-4">This policy is not currently available.</p>
        <Link href={backHref} className="text-[#010080] font-semibold hover:underline">
          {backLabel}
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError && !policy) {
    return (
      <div className={`p-8 rounded-xl border text-center ${isDark ? "bg-gray-800 border-gray-700 text-gray-300" : "bg-white border-gray-200"}`}>
        <p className="mb-4">Policy not found.</p>
        <Link href={backHref} className="text-[#010080] font-semibold hover:underline">
          {backLabel}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={backHref}
          className={`inline-flex items-center gap-2 text-sm font-semibold hover:underline ${
            isDark ? "text-blue-300" : "text-[#010080]"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {backLabel}
        </Link>
        {showWebsiteLink && isSystemPolicy(slug) && (
          <Link
            href={policyWebsitePath(slug)}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
              isDark ? "border-gray-600 text-gray-300" : "border-gray-300 text-gray-600"
            }`}
          >
            View on Website ↗
          </Link>
        )}
      </div>

      <div className={`rounded-2xl border overflow-hidden ${isDark ? "border-gray-700 bg-[#03002e]" : "border-gray-200 bg-white"}`}>
        <PolicyPageBody slug={slug} systemOnly={systemOnly} />
      </div>
    </div>
  );
}
