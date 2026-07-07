"use client";

import { useEffect } from "react";
import TutorialMediaPlayer from "./TutorialMediaPlayer";

type TutorialItem = {
  id?: number;
  title?: string;
  description?: string;
  media_type?: string;
  media_url?: string;
};

export default function TutorialPreviewOverlay({
  item,
  onClose,
}: {
  item: TutorialItem | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-black/95 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-4 p-4 md:p-6 border-b border-white/10">
        <div className="min-w-0">
          <h2 className="text-lg md:text-2xl font-bold text-white truncate">{item.title}</h2>
          {item.description && (
            <p className="text-sm text-gray-300 mt-1 line-clamp-2 max-w-3xl">{item.description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex-shrink-0 p-2 rounded-lg text-white hover:bg-white/10"
          aria-label="Close"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 md:p-8 overflow-auto">
        <div className="w-full max-w-6xl">
          <TutorialMediaPlayer item={item} autoPlay className="w-full shadow-2xl" />
        </div>
      </div>

      <p className="text-center text-xs text-gray-500 pb-4">
        Double-click video or use Fullscreen button · Press Esc to close
      </p>
    </div>
  );
}
