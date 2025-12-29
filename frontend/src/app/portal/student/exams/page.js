"use client";

import Link from "next/link";
import { useDarkMode } from "@/context/ThemeContext";

export default function ExamsPage() {
  const { isDark } = useDarkMode();
  const bg = isDark ? "bg-gray-900" : "bg-gray-100";
  const card = isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900";

  return (
    <div className={`min-h-screen ${bg}`}>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className={`p-6 rounded-xl shadow ${card}`}>
          <h1 className="text-2xl font-bold mb-2">Exams & Tests</h1>
          <p className={isDark ? "text-gray-300" : "text-gray-600"}>
            Access your placement and proficiency tests.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ExamCard
            title="Placement Test"
            description="Check your current English level and get placed in the right class."
            href="/portal/student/placement-test"
          />
          <ExamCard
            title="Proficiency Test"
            description="Take a full proficiency exam and review your detailed results."
            href="/portal/student/proficiency-test"
          />
        </div>
      </div>
    </div>
  );
}

function ExamCard({ title, description, href }) {
  return (
    <div className="p-5 rounded-xl bg-white shadow border border-gray-200 flex flex-col justify-between">
      <div>
        <h2 className="text-lg font-semibold mb-2 text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div className="mt-4">
        <Link
          href={href}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          Open
        </Link>
      </div>
    </div>
  );
}





