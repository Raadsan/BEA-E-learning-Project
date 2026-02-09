import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/constants";

// Get token from localStorage
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/auth",
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    // LOGIN
    login: builder.mutation({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
      transformResponse: (response) => {
        if (response.success && response.token) {
          // Store token in localStorage
          if (typeof window !== "undefined") {
            localStorage.setItem("token", response.token);
            localStorage.setItem("user", JSON.stringify(response.user));
          }
        }
        return response;
      },
    }),

    // GET CURRENT USER
    getCurrentUser: builder.query({
      query: () => "/me",
      providesTags: ["Auth"],
      transformResponse: (response) => {
        if (response.success) {
          // Update localStorage with fresh user data
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(response.user));
          }
          return response.user;
        }
        return response;
      },
    }),

    // LOGOUT (client-side only)
    logout: builder.mutation({
      queryFn: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
        return { data: { success: true } };
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
} = authApi;

