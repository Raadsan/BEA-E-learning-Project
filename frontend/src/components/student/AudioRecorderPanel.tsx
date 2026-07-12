"use client";

import { useEffect, useRef } from "react";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";

type AudioRecorderPanelProps = {
    isDark?: boolean;
    onFileReady: (file: File | null) => void;
    maxSizeMb?: number;
    activeFile?: File | null;
    activePreviewUrl?: string | null;
};

function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AudioRecorderPanel({
    isDark = false,
    onFileReady,
    maxSizeMb = 50,
    activeFile = null,
    activePreviewUrl = null,
}: AudioRecorderPanelProps) {
    const {
        status,
        error,
        previewUrl,
        recordedFile,
        durationSec,
        start,
        stop,
        reset,
        isSupported,
    } = useAudioRecorder();

    const notifiedRef = useRef(false);

    useEffect(() => {
        if (status === "recorded" && recordedFile && !notifiedRef.current) {
            if (recordedFile.size > maxSizeMb * 1024 * 1024) {
                reset();
                return;
            }
            notifiedRef.current = true;
            onFileReady(recordedFile);
        }
        if (status === "idle") {
            notifiedRef.current = false;
        }
    }, [status, recordedFile, maxSizeMb, onFileReady, reset]);

    const displayPreview = activePreviewUrl || previewUrl;
    const displayFile = activeFile || recordedFile;
    const isAudioDisplayFile = displayFile?.type?.startsWith("audio/") ?? false;

    const handleReset = () => {
        reset();
        onFileReady(null);
    };

    return (
        <div className="space-y-4">
            {/* null = still checking after SSR hydration – show a neutral placeholder */}
            {isSupported === null && (
                <div className={`p-4 rounded-xl border animate-pulse ${isDark ? "bg-gray-900/40 border-gray-700" : "bg-blue-50/50 border-blue-100"}`}>
                    <p className={`text-xs font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                        Checking microphone support…
                    </p>
                </div>
            )}

            {isSupported === false && (
                <div className={`p-4 rounded-xl border ${isDark ? "bg-amber-900/20 border-amber-700/40" : "bg-amber-50 border-amber-200"}`}>
                    <p className={`text-sm font-semibold ${isDark ? "text-amber-300" : "text-amber-800"}`}>
                        🎙️ Microphone recording is not available in this browser.
                    </p>
                    <p className={`text-xs mt-1 ${isDark ? "text-amber-400" : "text-amber-700"}`}>
                        Please open this page in <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong> and allow microphone access when prompted.
                    </p>
                </div>
            )}

            {isSupported === true && (
                <div className={`p-6 rounded-xl border ${isDark ? "bg-gray-900/40 border-gray-700" : "bg-blue-50/50 border-blue-100"}`}>
                    <p className={`text-xs font-bold uppercase tracking-wider mb-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        Record your voice in the browser
                    </p>

                    {status === "idle" && !displayFile && (
                        <button
                            type="button"
                            onClick={start}
                            className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition-all"
                        >
                            <span className="w-3 h-3 rounded-full bg-white" />
                            Start Recording
                        </button>
                    )}

                    {status === "recording" && (
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold tabular-nums">
                                <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                                Recording {formatDuration(durationSec)}
                            </div>
                            <button
                                type="button"
                                onClick={stop}
                                className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold"
                            >
                                Stop
                            </button>
                        </div>
                    )}

                    {displayFile && displayPreview && isAudioDisplayFile && (
                        <div className="space-y-4">
                            <audio controls className="w-full" src={displayPreview} />
                            <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                {(displayFile.size / (1024 * 1024)).toFixed(2)} MB • {displayFile.name}
                            </p>
                            <button
                                type="button"
                                onClick={handleReset}
                                className={`px-5 py-2.5 rounded-xl border text-sm font-semibold ${isDark ? "border-gray-600 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                            >
                                Record Again
                            </button>
                        </div>
                    )}

                    {status === "error" && error && (
                        <p className={`text-sm ${isDark ? "text-rose-300" : "text-rose-600"}`}>{error}</p>
                    )}
                </div>
            )}
        </div>
    );
}
