export type WritingTaskRequirements = {
    text: string;
    attachment_url?: string | null;
    attachment_name?: string | null;
};

export function parseWritingTaskRequirements(
    raw?: string | null,
    submissionFormat?: string | null
): WritingTaskRequirements {
    let text = "";
    let attachment_url = submissionFormat || null;
    let attachment_name: string | null = null;

    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === "object" && ("text" in parsed || "attachment_url" in parsed)) {
                text = String(parsed.text || "");
                attachment_url = parsed.attachment_url || attachment_url;
                attachment_name = parsed.attachment_name || null;
            } else {
                text = raw;
            }
        } catch {
            text = raw;
        }
    }

    if (attachment_url && !attachment_name) {
        attachment_name = attachment_url.split("/").pop() || "Attachment";
    }

    return { text, attachment_url, attachment_name };
}

export function buildWritingTaskRequirements(
    text: string,
    attachmentUrl?: string | null,
    attachmentName?: string | null
): string {
    if (!attachmentUrl) return text || "";
    return JSON.stringify({
        text: text || "",
        attachment_url: attachmentUrl,
        attachment_name: attachmentName || null,
    });
}
