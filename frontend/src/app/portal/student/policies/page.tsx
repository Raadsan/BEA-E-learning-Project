"use client";

import { useDarkMode } from "@/context/ThemeContext";
import StudentPageHeader from "@/components/student/StudentPageHeader";
import PolicyCatalog from "@/components/policies/PolicyCatalog";

export default function StudentPoliciesPage() {
  const { isDark } = useDarkMode();
  const bg = isDark ? "bg-[#03002e]" : "bg-gray-50";

  return (
    <div className={`min-h-screen transition-colors pt-4 w-full px-6 sm:px-10 pb-20 ${bg}`}>
      <StudentPageHeader
        title="Policies"
        description="Official BEA policies — read the full documents that apply to all learners."
      />
      <PolicyCatalog basePath="/portal/student/policies" />
    </div>
  );
}
