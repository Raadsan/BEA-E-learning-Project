import axios from "axios";

const getBaseURL = () => {
  // 1. Prioritize environment variable from .env.local
  if (process.env.NEXT_PUBLIC_API_URL) {
    const envUrl = process.env.NEXT_PUBLIC_API_URL.trim();
    if (envUrl) {
      if (!envUrl.endsWith("/api")) {
        return envUrl.endsWith("/") ? `${envUrl}api` : `${envUrl}/api`;
      }
      return envUrl;
    }
  }

  // 2. Client-side dynamic detection fallback
  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:7004/api`;
  }

  // 3. Server-side default
  return "http://127.0.0.1:7004/api";
};

export const BASE_URL = getBaseURL();
export const UPLOAD_URL = BASE_URL.replace(/\/api\/?$/, "/uploads");

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach Bearer token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes("login")) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
      }
    }

    if (error.message === "Network Error") {
      console.error("❌ Backend server is unreachable at:", BASE_URL);
    }

    return Promise.reject(error);
  }
);

export default api;
