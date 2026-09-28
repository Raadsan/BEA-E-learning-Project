import { resolveSubmissionFileUrl, resolveSubmissionDownloadUrl } from "@/constants";

function guessDownloadName(fileUrl: string): string {
    const base = fileUrl.split("/").pop() || "submission";
    const parts = base.split("-");
    return parts.length > 2 ? parts.slice(2).join("-") : base;
}

/** Fetch file bytes from S3 stream proxy (preferred) or authenticated download API. */
export async function fetchSubmissionBlob(fileUrl: string): Promise<Blob> {
    const streamUrl = resolveSubmissionFileUrl(fileUrl);
    if (streamUrl) {
        const response = await fetch(streamUrl, { cache: "no-store" });
        if (response.ok) return normalizeMediaBlob(await response.blob(), fileUrl);
    }

    const downloadUrl = resolveSubmissionDownloadUrl(fileUrl);
    if (!downloadUrl) throw new Error("File not found");

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const response = await fetch(downloadUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
    });
    if (!response.ok) throw new Error("File not found");
    return normalizeMediaBlob(await response.blob(), fileUrl);
}

/** Ensure .webm oral recordings are typed as audio so the player timer/seek work. */
function normalizeMediaBlob(blob: Blob, fileUrl: string): Blob {
    if (blob.type && blob.type !== "application/octet-stream") return blob;
    if (/\.webm(\?|$)/i.test(fileUrl)) return new Blob([blob], { type: "audio/webm" });
    if (/\.mp3(\?|$)/i.test(fileUrl)) return new Blob([blob], { type: "audio/mpeg" });
    if (/\.m4a(\?|$)/i.test(fileUrl)) return new Blob([blob], { type: "audio/mp4" });
    if (/\.wav(\?|$)/i.test(fileUrl)) return new Blob([blob], { type: "audio/wav" });
    if (/\.mp4(\?|$)/i.test(fileUrl)) return new Blob([blob], { type: "video/mp4" });
    return blob;
}

/** Open a student submission in a new tab (PDF, audio, video, etc.). */
export async function openSubmissionFile(fileUrl?: string | null): Promise<void> {
    if (!fileUrl) throw new Error("No file");

    // Always fetch via backend proxy (blob) so private S3 objects and .webm audio work
    const blob = await fetchSubmissionBlob(fileUrl);
    const blobUrl = window.URL.createObjectURL(blob);

    // Browsers often open raw .webm as a video tab — wrap audio in a simple player page
    const looksLikeWebmAudio =
        blob.type.startsWith("audio/") ||
        ((!blob.type || blob.type === "application/octet-stream") && /\.webm(\?|$)/i.test(fileUrl));

    if (looksLikeWebmAudio) {
        const pageHtml = [
            `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Oral Audio</title></head>`,
            `<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0f172a">`,
                `<audio controls autoplay preload="auto" src="${blobUrl}" style="width:min(640px,90vw)"></audio>`,
                `</body></html>`,
            ].join("");
        const page = new Blob([pageHtml], { type: "text/html" });
        const pageUrl = window.URL.createObjectURL(page);
        window.open(pageUrl, "_blank", "noopener,noreferrer");
        window.setTimeout(() => {
            window.URL.revokeObjectURL(pageUrl);
            window.URL.revokeObjectURL(blobUrl);
        }, 120_000);
        return;
    }

    window.open(blobUrl, "_blank", "noopener,noreferrer");
    window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60_000);
}

/** Download a student submission to disk. */
export async function downloadSubmissionFile(
    fileUrl?: string | null,
    downloadName?: string
): Promise<void> {
    if (!fileUrl) throw new Error("No file");

    const blob = await fetchSubmissionBlob(fileUrl);
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = downloadName || guessDownloadName(fileUrl);
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
}

/** Inline preview URL (PDF/images) with auth fallback when stream fails. */
export async function loadSubmissionPreviewUrl(fileUrl?: string | null): Promise<string> {
    const blob = await fetchSubmissionBlob(fileUrl!);
    return window.URL.createObjectURL(blob);
}
