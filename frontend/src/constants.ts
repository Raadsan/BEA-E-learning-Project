const envApiUrl = (process.env.NEXT_PUBLIC_API_URL || "").trim();

const serverBackendOrigin = (() => {
  const raw = envApiUrl || "http://127.0.0.1:7004";
  return raw.replace(/\/api\/?$/, "");
})();

/** Browser uses same-origin `/api` (proxied by Next.js). SSR uses direct backend URL. */
export const API_BASE_URL =
  typeof window !== "undefined" ? "" : serverBackendOrigin;

export const API_URL =
  typeof window !== "undefined" ? "/api" : `${serverBackendOrigin}/api`;

const clientBackendOrigin =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL || `${window.location.protocol}//${window.location.hostname}:7004`)
        .trim()
        .replace(/\/api\/?$/, "")
    : serverBackendOrigin;

/** Multipart uploads must hit the backend directly — Next.js rewrites break FormData. */
export const DIRECT_API_URL =
  typeof window !== "undefined"
    ? `${clientBackendOrigin}/api`
    : `${serverBackendOrigin}/api`;

export const UPLOAD_ENDPOINT = `${DIRECT_API_URL}/uploads`;

/** Normalize any stored file reference to a stream API ref. */
const toStreamRef = (storedValue?: string | null): string | null => {
  if (!storedValue) return null;
  const value = storedValue.trim();
  if (!value) return null;

  if (value.startsWith("http")) return value;

  // Keep full storage path (bea_uploads/... or uploads/...) for backend resolution
  return value.replace(/^\//, "");
};

/** Backend stream URL — returns direct S3/remote URLs as-is, and routes local/legacy files through stream API. */
export const resolveStreamUrl = (storedValue?: string | null): string | null => {
  if (!storedValue) return null;
  const value = storedValue.trim();
  if (!value) return null;

  // Direct AWS S3 URL or external URL -> load directly from cloud/CDN
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  // Local or legacy relative path -> stream through backend
  const ref = value.replace(/^\//, "");
  if (!ref) return null;

  const encoded = encodeURIComponent(ref);
  if (typeof window !== "undefined") {
    return `/api/files/stream/${encoded}`;
  }
  return `${serverBackendOrigin}/api/files/stream/${encoded}`;
};

/** Images, videos, materials, program media. */
export const resolveMediaUrl = (url: string | null | undefined) => resolveStreamUrl(url);

/** Profile pictures and avatars. */
export const resolveProfileImageUrl = (url: string | null | undefined) => resolveStreamUrl(url);

/** Student submission files (view / play in browser). */
export const resolveSubmissionFileUrl = (fileUrl?: string | null) => resolveStreamUrl(fileUrl);

/** Download submission — authenticated API (streams from S3 via backend). */
export const resolveSubmissionDownloadUrl = (fileUrl?: string | null) => {
  if (!fileUrl) return null;

  const apiBase = typeof window !== "undefined" ? "/api" : `${serverBackendOrigin}/api`;

  if (fileUrl.startsWith("http")) {
    return `${apiBase}/files/download/${encodeURIComponent(fileUrl)}`;
  }

  const ref = toStreamRef(fileUrl);
  if (!ref) return null;
  return `${apiBase}/files/download/${encodeURIComponent(ref)}`;
};

/** Alias — any file/image/video/audio URL for web + portal. */
export const resolveFileUrl = resolveMediaUrl;

/** @deprecated Use resolveStreamUrl */
export const UPLOADS_URL =
  typeof window !== "undefined" ? "/api/files/stream" : `${serverBackendOrigin}/api/files/stream`;

/** @deprecated Use resolveStreamUrl */
export const toS3PublicUrl = resolveStreamUrl;
