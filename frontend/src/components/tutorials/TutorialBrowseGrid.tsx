"use client";

import { useState } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import TutorialPreviewOverlay from "./TutorialPreviewOverlay";

type TutorialItem = {
  id: number;
  title: string;
  description?: string;
  media_type?: string;
  media_url?: string;
  status?: string;
};

export default function TutorialBrowseGrid({
  tutorials = [],
  isLoading = false,
  emptyMessage = "No tutorials available yet.",
}: {
  tutorials?: TutorialItem[];
  isLoading?: boolean;
  emptyMessage?: string;
}) {
  const { isDark } = useDarkMode();
  const [previewItem, setPreviewItem] = useState<TutorialItem | null>(null);
  const [search, setSearch] = useState("");

  const filtered = tutorials.filter((t) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return [t.title, t.description, t.media_type].join(" ").toLowerCase().includes(q);
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tutorials..."
          className={`w-full max-w-md px-4 py-2 rounded-lg border text-sm ${
            isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"
          }`}
        />
      </div>

      {filtered.length === 0 ? (
        <div
          className={`text-center py-20 rounded-2xl border border-dashed ${
            isDark ? "border-gray-700 text-gray-400" : "border-gray-300 text-gray-500"
          }`}
        >
          {emptyMessage}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`group flex flex-col rounded-2xl border overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 ${
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow-sm"
              }`}
            >
              <button
                type="button"
                onClick={() => setPreviewItem(item)}
                className={`relative aspect-video w-full flex items-center justify-center ${
                  isDark ? "bg-gray-900" : "bg-gradient-to-br from-[#010080]/10 to-blue-100"
                }`}
              >
                {item.media_type === "audio" ? (
                  <div className="flex flex-col items-center gap-2 text-[#010080]">
                    <svg className="w-14 h-14 opacity-80" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55A4 4 0 1014 17V7h4V3h-6z" />
                    </svg>
                    <span className="text-xs font-bold uppercase tracking-wider">Audio</span>
                  </div>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                    <div className="relative z-10 w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                      <svg className="w-8 h-8 text-[#010080] ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </>
                )}
                <span
                  className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    item.media_type === "audio" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {item.media_type || "video"}
                </span>
              </button>

              <div className="flex flex-col flex-1 p-5">
                <h3 className={`font-bold text-lg mb-2 line-clamp-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                  {item.title}
                </h3>
                <p className={`text-sm flex-1 line-clamp-3 mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  {item.description || "No description"}
                </p>
                <button
                  type="button"
                  onClick={() => setPreviewItem(item)}
                  className="w-full py-2.5 text-sm font-bold rounded-xl bg-[#010080] text-white hover:bg-blue-900 transition-colors"
                >
                  Watch Tutorial
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <TutorialPreviewOverlay item={previewItem} onClose={() => setPreviewItem(null)} />
    </>
  );
}
