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

export const UPLOADS_URL =
  typeof window !== "undefined" ? "/uploads" : `${serverBackendOrigin}/uploads`;

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

const mediaOrigin =
  typeof window !== "undefined" ? window.location.origin : serverBackendOrigin;

/** Build a browser-openable URL for a student submission file. */
export const resolveSubmissionFileUrl = (fileUrl?: string | null) => {
  if (!fileUrl) return null;
  if (fileUrl.startsWith("http")) return fileUrl;
  if (fileUrl.startsWith("/")) {
    return typeof window !== "undefined" ? fileUrl : `${serverBackendOrigin}${fileUrl}`;
  }
  return `${UPLOADS_URL}/${fileUrl}`;
};

export const resolveMediaUrl = (url: string | null | undefined) => {
  if (!url) return null;

  if (
    url.startsWith("http://178.18.241.5:7004") ||
    url.startsWith("http://localhost:5000") ||
    url.startsWith("http://localhost:7004") ||
    url.startsWith("http://127.0.0.1:7004")
  ) {
    return url.replace(
      /http:\/\/(localhost:(5000|7004)|127\.0\.0\.1:7004|178\.18\.241\.5:7004)/,
      mediaOrigin
    );
  }

  if (url.startsWith("http")) {
    return url;
  }

  if (url.startsWith("/")) {
    return typeof window !== "undefined" ? url : `${serverBackendOrigin}${url}`;
  }

  return `${UPLOADS_URL}/${url}`;
};
