import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/constants";
import { authApi } from "./authApi";

const getToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("token");
    }
    return null;
};

export const paymentApi = createApi({
    reducerPath: "paymentApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/payments`,
        prepareHeaders: (headers) => {
            const token = getToken();
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ["Payments"],
    endpoints: (builder) => ({
        getStudentPayments: builder.query({
            query: (studentId) => `/student/${studentId}`,
            providesTags: ["Payments"],
            transformResponse: (response: any) => {
                if (response.success) {
                    return response.payments;
                }
                return response;
            },
        }),
        getAllPayments: builder.query<any, Record<string, string> | void>({
            query: (params) => {
                const searchParams = new URLSearchParams();
                if (params) {
                    Object.entries(params).forEach(([key, value]) => {
                        if (value) searchParams.set(key, value);
                    });
                }
                const qs = searchParams.toString();
                return qs ? `/?${qs}` : `/`;
            },
            providesTags: ["Payments"],
            transformResponse: (response: any) => {
                if (response?.success && response.payments) {
                    return response.payments;
                }
                if (Array.isArray(response)) return response;
                return [];
            },
        }),
        createEvcPayment: builder.mutation({
            query: (body) => ({
                url: "/evc",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Payments"],
            async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(authApi.util.invalidateTags(["Auth"]));
                } catch {
                    // no-op
                }
            },
        }),
        createBankPayment: builder.mutation({
            query: (body) => ({
                url: "/bank",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Payments"],
            async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(authApi.util.invalidateTags(["Auth"]));
                } catch {
                    // no-op
                }
            },
        }),
        createWaafiPayment: builder.mutation({
            query: (body) => ({
                url: "/waafi",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Payments"],
            async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(authApi.util.invalidateTags(["Auth"]));
                } catch {
                    // no-op
                }
            },
        }),
    }),
});

export const {
    useGetStudentPaymentsQuery,
    useGetAllPaymentsQuery,
    useCreateEvcPaymentMutation,
    useCreateBankPaymentMutation,
    useCreateWaafiPaymentMutation
} = paymentApi;
