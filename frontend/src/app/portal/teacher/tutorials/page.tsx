"use client";

import { useDarkMode } from "@/context/ThemeContext";
import TutorialBrowseGrid from "@/components/tutorials/TutorialBrowseGrid";
import { useGetTutorialsQuery } from "@/lib/api/tutorialApi";

export default function TeacherTutorialsPage() {
  const { isDark } = useDarkMode();
  const { data: tutorials = [], isLoading } = useGetTutorialsQuery(false);

  return (
    <div className={`min-h-screen transition-colors p-6 md:p-8 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="mb-8">
        <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Tutorials</h1>
        <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          Video and audio guides for teachers — platform help and teaching resources.
        </p>
      </div>
      <TutorialBrowseGrid
        tutorials={tutorials}
        isLoading={isLoading}
        emptyMessage="No tutorials have been published yet."
      />
    </div>
  );
}
