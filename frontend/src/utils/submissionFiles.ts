import { resolveSubmissionFileUrl, resolveSubmissionDownloadUrl } from "@/constants";

function guessDownloadName(fileUrl: string): string {
    const base = fileUrl.split("/").pop() || "submission";
    const parts = base.split("-");
    return parts.length > 2 ? parts.slice(2).join("-") : base;
}

/** Fetch file bytes from S3 stream proxy (preferred) or authenticated download API. */
async function fetchSubmissionBlob(fileUrl: string): Promise<Blob> {
    const streamUrl = resolveSubmissionFileUrl(fileUrl);
    if (streamUrl) {
        const response = await fetch(streamUrl, { cache: "no-store" });
        if (response.ok) return response.blob();
    }

    const downloadUrl = resolveSubmissionDownloadUrl(fileUrl);
    if (!downloadUrl) throw new Error("File not found");

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const response = await fetch(downloadUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
    });
    if (!response.ok) throw new Error("File not found");
    return response.blob();
}

/** Open a student submission in a new tab (PDF, audio, video, etc.). */
export async function openSubmissionFile(fileUrl?: string | null): Promise<void> {
    if (!fileUrl) throw new Error("No file");

    const streamUrl = resolveSubmissionFileUrl(fileUrl);
    if (streamUrl) {
        window.open(streamUrl, "_blank", "noopener,noreferrer");
        return;
    }

    const blob = await fetchSubmissionBlob(fileUrl);
    const blobUrl = window.URL.createObjectURL(blob);
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
