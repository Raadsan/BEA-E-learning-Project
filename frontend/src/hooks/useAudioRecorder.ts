"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type AudioRecorderStatus = "idle" | "recording" | "recorded" | "error";

function pickSupportedMimeType(): string {
    if (typeof window === "undefined" || typeof MediaRecorder === "undefined") return "";
    const candidates = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/ogg;codecs=opus",
        "audio/ogg",
    ];
    return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

function extensionForMime(mime: string): string {
    if (mime.includes("mp4")) return "m4a";
    if (mime.includes("ogg")) return "ogg";
    return "webm";
}

export function useAudioRecorder() {
    const [status, setStatus] = useState<AudioRecorderStatus>("idle");
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [recordedFile, setRecordedFile] = useState<File | null>(null);
    const [durationSec, setDurationSec] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const startTimeRef = useRef(0);

    const stopStream = useCallback(() => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
    }, []);

    const clearTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const reset = useCallback(() => {
        clearTimer();
        stopStream();
        mediaRecorderRef.current = null;
        chunksRef.current = [];
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setRecordedFile(null);
        setDurationSec(0);
        setError(null);
        setStatus("idle");
    }, [clearTimer, previewUrl, stopStream]);

    const start = useCallback(async () => {
        if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
            setError("Your browser does not support microphone recording.");
            setStatus("error");
            return;
        }
        if (typeof MediaRecorder === "undefined") {
            setError("Recording is not supported in this browser. Please use Chrome.");
            setStatus("error");
            return;
        }

        try {
            reset();
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const mimeType = pickSupportedMimeType();
            const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
            chunksRef.current = [];

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) chunksRef.current.push(event.data);
            };

            recorder.onstop = () => {
                clearTimer();
                stopStream();
                const type = recorder.mimeType || mimeType || "audio/webm";
                const blob = new Blob(chunksRef.current, { type });
                const ext = extensionForMime(type);
                const file = new File([blob], `voice-recording-${Date.now()}.${ext}`, { type });
                const url = URL.createObjectURL(blob);
                setPreviewUrl(url);
                setRecordedFile(file);
                setStatus("recorded");
            };

            mediaRecorderRef.current = recorder;
            recorder.start(200);
            startTimeRef.current = Date.now();
            timerRef.current = setInterval(() => {
                setDurationSec(Math.floor((Date.now() - startTimeRef.current) / 1000));
            }, 500);
            setError(null);
            setStatus("recording");
        } catch {
            stopStream();
            setError("Microphone access was denied. Allow the microphone in your browser settings.");
            setStatus("error");
        }
    }, [clearTimer, reset, stopStream]);

    const stop = useCallback(() => {
        if (mediaRecorderRef.current?.state === "recording") {
            mediaRecorderRef.current.stop();
        }
    }, []);

    useEffect(() => () => {
        clearTimer();
        stopStream();
        if (previewUrl) URL.revokeObjectURL(previewUrl);
    }, [clearTimer, previewUrl, stopStream]);

    return {
        status,
        error,
        previewUrl,
        recordedFile,
        durationSec,
        start,
        stop,
        reset,
        isSupported: typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined",
    };
}
