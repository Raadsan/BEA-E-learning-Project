"use client";

import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useDarkMode } from "@/context/ThemeContext";
import { policyWebsitePath, isSystemPolicy } from "@/constants/policies";
import { useGetPoliciesQuery } from "@/lib/api/policyApi";

type PolicyCatalogProps = {
  basePath: string;
  title?: string;
  description?: string;
  showWebsiteLink?: boolean;
  showAll?: boolean;
  /** Only show the 6 BEA system policies (website, student, teacher) */
  systemOnly?: boolean;
};

export default function PolicyCatalog({
  basePath,
  title = "Policies",
  description = "Read all official BEA policies.",
  showWebsiteLink = false,
  showAll = false,
  systemOnly = false,
}: PolicyCatalogProps) {
  const { isDark } = useDarkMode();
  const { data: policies = [], isLoading } = useGetPoliciesQuery(
    showAll ? { all: true } : systemOnly ? { systemOnly: true } : undefined
  );

  const visiblePolicies = policies.filter((p) => (showAll ? true : p.status === "active"));

  return (
    <div>
      {(title || description) && (
        <div className="mb-8">
          {title && <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{title}</h1>}
          {description && (
            <p className={`text-sm mt-1 max-w-3xl ${isDark ? "text-gray-400" : "text-gray-500"}`}>{description}</p>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      ) : visiblePolicies.length === 0 ? (
        <div className={`p-8 rounded-xl border text-center ${isDark ? "bg-gray-800 border-gray-700 text-gray-400" : "bg-white border-gray-200 text-gray-500"}`}>
          No policies available.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visiblePolicies.map((policy) => (
            <div
              key={policy.id}
              className={`flex flex-col rounded-2xl border p-6 transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow-sm"
              }`}
            >
              {showAll && (
                <div className="mb-4 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-2">
                    {isSystemPolicy(policy.slug) && (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#010080]/10 text-[#010080]">
                        System
                      </span>
                    )}
                    {!isSystemPolicy(policy.slug) && (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gray-200 text-gray-600">
                        Custom
                      </span>
                    )}
                  </div>
                  {policy.status === "inactive" && (
                    <span className="text-[10px] font-bold uppercase text-red-500">Inactive</span>
                  )}
                </div>
              )}
              <h2 className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>{policy.title}</h2>
              <p className={`text-sm flex-1 mb-5 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                {policy.description || "No description."}
              </p>
              <Link
                href={`${basePath}/${policy.slug}`}
                className="w-full text-center py-2.5 rounded-xl bg-[#010080] text-white text-sm font-bold hover:bg-blue-900 transition-colors"
              >
                Read Full Policy
              </Link>
              {showWebsiteLink && isSystemPolicy(policy.slug) && (
                <Link
                  href={policyWebsitePath(policy.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full text-center py-2 mt-2 text-xs font-semibold rounded-lg border transition-colors ${
                    isDark ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Open on Website ↗
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
