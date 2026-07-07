"use client";

import { use } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import PolicyViewer from "@/components/policies/PolicyViewer";

export default function AdminPolicyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { isDark } = useDarkMode();

  return (
    <div className={`min-h-screen transition-colors p-6 md:p-8 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <PolicyViewer
        slug={slug}
        backHref="/portal/admin/communication/policies"
        backLabel="Back to Policies"
        showWebsiteLink={false}
      />
    </div>
  );
}
