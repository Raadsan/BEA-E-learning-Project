const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Ensure API_BASE_URL is the root domain without /api
export const API_BASE_URL = rawApiUrl.replace(/\/api$/, "");
export const API_URL = `${API_BASE_URL}/api`;
export const UPLOADS_URL = `${API_BASE_URL}/uploads`;
