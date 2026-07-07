"use client";

import { use } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import PolicyViewer from "@/components/policies/PolicyViewer";

export default function StudentPolicyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { isDark } = useDarkMode();
  const bg = isDark ? "bg-[#03002e]" : "bg-gray-50";

  return (
    <div className={`min-h-screen transition-colors pt-4 w-full px-6 sm:px-10 pb-20 ${bg}`}>
      <PolicyViewer slug={slug} backHref="/portal/student/policies" backLabel="Back to Policies" />
    </div>
  );
}
