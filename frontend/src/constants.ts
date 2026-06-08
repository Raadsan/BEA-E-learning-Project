const envApiUrl = (process.env.NEXT_PUBLIC_API_URL || "").trim();

const defaultApiBaseUrl =
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:7004`
    : "http://localhost:7004";

const rawApiUrl = (envApiUrl || defaultApiBaseUrl).trim();
const cleanApiUrl = rawApiUrl.endsWith("/") ? rawApiUrl.slice(0, -1) : rawApiUrl;

// Ensure API_BASE_URL is the root domain without /api
export const API_BASE_URL = cleanApiUrl.replace(/\/api$/, "");
export const API_URL = `${API_BASE_URL}/api`;
export const UPLOADS_URL = `${API_BASE_URL}/uploads`;

/**
 * Resolves a media URL to an absolute URL, handling relative paths
 * and fixing legacy development localhost URLs.
 */
/** Build a browser-openable URL for a student submission file. */
export const resolveSubmissionFileUrl = (fileUrl?: string | null) => {
    if (!fileUrl) return null;
    if (fileUrl.startsWith("http")) return fileUrl;
    if (fileUrl.startsWith("/")) return `${API_BASE_URL}${fileUrl}`;
    return `${UPLOADS_URL}/${fileUrl}`;
};

export const resolveMediaUrl = (url) => {
    if (!url) return null;

    // Case 1: Legacy localhost URL from DB
    if (
        url.startsWith('http://178.18.241.5:7004') ||
        url.startsWith('http://localhost:5000') ||
        url.startsWith('http://localhost:7004')
    ) {
        return url.replace(/http:\/\/(localhost:(5000|7004)|178\.18\.241\.5:7004)/, API_BASE_URL);
    }

    // Case 2: Already an absolute external URL
    if (url.startsWith('http')) {
        return url;
    }

    // Case 3: Relative path (e.g., /uploads/...)
    return `${API_BASE_URL}${url}`;
};
