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
    baseUrl: `${API_URL}/auth`,
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
  keepUnusedDataFor: 3600,
  endpoints: (builder) => ({
    // LOGIN — direct login (OTP step disabled)
    login: builder.mutation({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
      transformResponse: (response: any) => {
        if (response.success && response.token) {
          if (typeof window !== "undefined") {
            localStorage.setItem("token", response.token);
            localStorage.setItem("user", JSON.stringify(response.user));
            localStorage.setItem("userId", String(response.user?.id ?? ""));
            localStorage.setItem("userRole", response.user?.role ?? "");
          }
        }
        return response;
      },
    }),

    // VERIFY OTP — disabled (uncomment when re-enabling OTP login)
    verifyOtp: builder.mutation({
      query: (body: { otpSessionId: string; otp: string }) => ({
        url: "/verify-otp",
        method: "POST",
        body,
      }),
      transformResponse: (response: any) => {
        if (response.success && response.token) {
          if (typeof window !== "undefined") {
            localStorage.setItem("token", response.token);
            localStorage.setItem("user", JSON.stringify(response.user));
            localStorage.setItem("userId", String(response.user?.id ?? ""));
            localStorage.setItem("userRole", response.user?.role ?? "");
          }
        }
        return response;
      },
    }),

    resendOtp: builder.mutation({
      query: (body: { otpSessionId: string }) => ({
        url: "/resend-otp",
        method: "POST",
        body,
      }),
    }),

    // GET CURRENT USER
    getCurrentUser: builder.query<any, void>({
      query: () => "/me",
      providesTags: ["Auth"],
      keepUnusedDataFor: 3600,
      transformResponse: (response: any) => {
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
    logout: builder.mutation<any, void>({
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
  useVerifyOtpMutation,
  useResendOtpMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
} = authApi;

