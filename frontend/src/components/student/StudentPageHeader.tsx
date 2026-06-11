"use client";

import type { ReactNode } from "react";
import { useDarkMode } from "@/context/ThemeContext";

type StudentPageHeaderProps = {
  title: string;
  description?: string;
  className?: string;
  actions?: ReactNode;
};

export default function StudentPageHeader({
  title,
  description,
  className = "",
  actions,
}: StudentPageHeaderProps) {
  const { isDark } = useDarkMode();

  return (
    <div className={`mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        <h1 className={`text-4xl font-bold mb-4 ${isDark ? "text-white" : "text-[#010080]"}`}>
          {title}
        </h1>
        {description ? (
          <p className={`text-lg ${isDark ? "text-gray-400" : "text-black"}`}>
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
