"use client";

import { useDarkMode } from "@/context/ThemeContext";
import PolicyCatalog from "@/components/policies/PolicyCatalog";

export default function TeacherPoliciesPage() {
  const { isDark } = useDarkMode();

  return (
    <div className={`min-h-screen transition-colors p-6 md:p-8 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <PolicyCatalog
        basePath="/portal/teacher/policies"
        title="Policies"
        description="Official BEA policies — read the full documents."
      />
    </div>
  );
}
