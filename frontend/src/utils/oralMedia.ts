/** Resolve oral assignment media kind without treating audio/webm as video. */

export type OralMediaKind = "audio" | "video" | "image";

type ResolveOralMediaInput = {
  url?: string | null;
  mimeType?: string | null;
  submissionKind?: string | null;
  mediaType?: string | null;
};

function normalizeKind(value?: string | null): OralMediaKind | null {
  if (!value) return null;
  const v = String(value).toLowerCase().trim();
  if (v === "audio" || v.startsWith("audio/")) return "audio";
  if (v === "video" || v.startsWith("video/")) return "video";
  if (v === "image" || v.startsWith("image/")) return "image";
  return null;
}

export function resolveOralMediaKind(input: ResolveOralMediaInput): OralMediaKind {
  const fromKind =
    normalizeKind(input.submissionKind) ||
    normalizeKind(input.mediaType) ||
    normalizeKind(input.mimeType);
  if (fromKind) return fromKind;

  const url = input.url || "";
  if (/\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(url)) return "image";
  // Explicit video containers (do NOT treat .webm alone as video — audio recordings use webm)
  if (/\.(mp4|mov|avi|mkv)$/i.test(url)) return "video";
  if (/\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(url)) return "audio";
  if (/\.webm$/i.test(url)) return "audio";
  return "audio";
}

export function parseSubmissionContentMeta(content?: string | null) {
  if (!content || typeof content !== "string") return {};
  try {
    const parsed = JSON.parse(content);
    if (!parsed || typeof parsed !== "object") return {};
    return {
      submissionKind: parsed.submissionKind || parsed.mediaType || null,
      mimeType: parsed.mimeType || null,
      originalName: parsed.originalName || null,
    };
  } catch {
    return {};
  }
}
