const rawApiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").trim();
const cleanApiUrl = rawApiUrl.endsWith("/") ? rawApiUrl.slice(0, -1) : rawApiUrl;

// Ensure API_BASE_URL is the root domain without /api
export const API_BASE_URL = cleanApiUrl.replace(/\/api$/, "");
export const API_URL = `${API_BASE_URL}/api`;
export const UPLOADS_URL = `${API_BASE_URL}/uploads`;

/**
 * Resolves a media URL to an absolute URL, handling relative paths
 * and fixing legacy development localhost URLs.
 */
export const resolveMediaUrl = (url) => {
    if (!url) return null;

    // Case 1: Legacy localhost URL from DB
    if (url.startsWith('http://localhost:5000')) {
        return url.replace('http://localhost:5000', API_BASE_URL);
    }

    // Case 2: Already an absolute external URL
    if (url.startsWith('http')) {
        return url;
    }

    // Case 3: Relative path (e.g., /uploads/...)
    return `${API_BASE_URL}${url}`;
};
