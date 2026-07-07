"use client";

import { useDarkMode } from "@/context/ThemeContext";

export default function PolicyHtmlContent({
  content,
  title,
}: {
  content: string;
  title?: string;
}) {
  const { isDark } = useDarkMode();

  return (
    <article className={`p-6 sm:p-10 ${isDark ? "text-gray-100" : "text-gray-800"}`}>
      {title && (
        <h1 className={`text-2xl sm:text-3xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-900"}`}>
          {title}
        </h1>
      )}
      <div
        className={`policy-html space-y-4 text-base leading-relaxed [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:text-[#010080] [&_a]:underline ${isDark ? "[&_h1]:text-white [&_h2]:text-white [&_h3]:text-white" : ""}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </article>
  );
}
