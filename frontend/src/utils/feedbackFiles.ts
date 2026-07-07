import { openSubmissionFile, downloadSubmissionFile } from "./submissionFiles";

/** Writing-task grades may embed the file path inside feedback text. */
export function parseEmbeddedFeedbackFile(feedback?: string | null): {
    text: string;
    fileUrl: string | null;
    fileName: string | null;
} {
    if (!feedback) return { text: "", fileUrl: null, fileName: null };

    const match = feedback.match(/(?:^|\n\n?)Feedback file:\s*(\S+)/i);
    if (!match) return { text: feedback.trim(), fileUrl: null, fileName: null };

    const fileUrl = match[1].trim();
    const text = feedback.replace(/\n?\n?Feedback file:\s*\S+/i, "").trim();
    const fileName = fileUrl.split("/").pop() || "feedback";

    return { text, fileUrl, fileName };
}

export function resolveFeedbackFileUrl(
    feedback?: string | null,
    feedbackFileUrl?: string | null
): string | null {
    return feedbackFileUrl || parseEmbeddedFeedbackFile(feedback).fileUrl;
}

export function isPdfFileUrl(fileUrl?: string | null): boolean {
    if (!fileUrl) return false;
    return /\.pdf($|\?|#)/i.test(fileUrl);
}

export function isWordFileUrl(fileUrl?: string | null): boolean {
    if (!fileUrl) return false;
    return /\.(doc|docx)($|\?|#)/i.test(fileUrl);
}

/** PDF opens in browser; Word and other files download. */
export async function openOrDownloadFeedbackFile(
    fileUrl: string,
    fileName?: string | null
): Promise<"open" | "download"> {
    const name = fileName || fileUrl.split("/").pop() || "feedback";
    if (isPdfFileUrl(fileUrl)) {
        await openSubmissionFile(fileUrl);
        return "open";
    }
    await downloadSubmissionFile(fileUrl, name);
    return "download";
}
