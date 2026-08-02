"use client";

import { useRef, useState } from "react";
import { resolveMediaUrl } from "@/constants";

type TutorialItem = {
  title?: string;
  description?: string;
  media_type?: string;
  media_url?: string;
};

export default function TutorialMediaPlayer({
  item,
  className = "",
  autoPlay = false,
  showFullscreenButton = true,
}: {
  item: TutorialItem;
  className?: string;
  autoPlay?: boolean;
  showFullscreenButton?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const src = resolveMediaUrl(item.media_url);
  const isAudio = item.media_type === "audio";
  const isImage = item.media_type === "image";
  const isDocument = item.media_type === "document";

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } else {
        await el.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch {
      setIsFullscreen((prev) => !prev);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-xl overflow-hidden ${isFullscreen ? "w-screen h-screen flex items-center justify-center" : ""} ${className}`}
      onDoubleClick={toggleFullscreen}
    >
      {isDocument ? (
        <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 bg-white p-8 text-center"><svg className="h-16 w-16 text-[#010080]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V7l-5-5H7a2 2 0 00-2 2v15a2 2 0 002 2z" /></svg><p className="font-semibold text-gray-800">{item.title || "Document"}</p><a href={src} target="_blank" rel="noreferrer" className="rounded-lg bg-[#010080] px-5 py-2.5 font-semibold text-white">Open / Download Document</a></div>
      ) : isImage ? (
        <img src={src} alt={item.title || "Tutorial image"} className="max-h-[75vh] w-full object-contain" />
      ) : isAudio ? (
        <div className="w-full p-8 md:p-12 flex flex-col items-center justify-center gap-6 min-h-[180px]">
          <div className="w-20 h-20 rounded-full bg-[#010080]/30 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55A4 4 0 1014 17V7h4V3h-6z" />
            </svg>
          </div>
          <audio controls autoPlay={autoPlay} className="w-full max-w-lg" src={src}>
            Your browser does not support audio playback.
          </audio>
        </div>
      ) : (
        <video
          controls
          autoPlay={autoPlay}
          playsInline
          className={`w-full bg-black ${isFullscreen ? "h-full max-h-screen object-contain" : "max-h-[70vh] object-contain"}`}
          src={src}
        >
          Your browser does not support video playback.
        </video>
      )}

      {showFullscreenButton && (
        <button
          type="button"
          onClick={toggleFullscreen}
          className="absolute top-3 right-3 z-10 px-3 py-1.5 rounded-lg bg-black/60 text-white text-xs font-bold hover:bg-black/80 flex items-center gap-1.5 backdrop-blur-sm"
          title="Fullscreen"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          Fullscreen
        </button>
      )}
    </div>
  );
}
