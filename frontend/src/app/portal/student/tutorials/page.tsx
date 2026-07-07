"use client";

import { useDarkMode } from "@/context/ThemeContext";
import StudentPageHeader from "@/components/student/StudentPageHeader";
import TutorialBrowseGrid from "@/components/tutorials/TutorialBrowseGrid";
import { useGetTutorialsQuery } from "@/lib/api/tutorialApi";

export default function StudentTutorialsPage() {
  const { isDark } = useDarkMode();
  const { data: tutorials = [], isLoading } = useGetTutorialsQuery(false);

  return (
    <div className={`min-h-screen transition-colors pt-4 w-full px-6 sm:px-10 pb-20 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <StudentPageHeader
        title="Tutorials"
        description="Watch video and audio guides to help you use the platform and improve your learning."
      />
      <TutorialBrowseGrid
        tutorials={tutorials}
        isLoading={isLoading}
        emptyMessage="No tutorials available at the moment. Check back soon!"
      />
    </div>
  );
}
