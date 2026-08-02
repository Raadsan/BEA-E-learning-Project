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
        getExpiredPayments: builder.query<any[], void>({
            query: () => '/expired',
            providesTags: ['Payments'],
            transformResponse: (response: any) => response?.accessStudents || response?.expiredPayments || [],
        }),
        extendExpiredPayment: builder.mutation<any, { studentId: string; quantity: number; unit: string }>({
            query: ({ studentId, quantity, unit }) => ({
                url: `/expired/${encodeURIComponent(studentId)}/extend`,
                method: 'PATCH',
                body: { quantity, unit },
            }),
            invalidatesTags: ['Payments'],
        }),
        updatePaymentAccessExpiry: builder.mutation<any, { studentId: string; expiryDate: string }>({
            query: ({ studentId, expiryDate }) => ({ url: `/expired/${encodeURIComponent(studentId)}/expiry`, method: 'PATCH', body: { expiryDate } }),
            invalidatesTags: ['Payments'],
        }),
        revokePaymentAccess: builder.mutation<any, { studentId: string }>({
            query: ({ studentId }) => ({ url: `/expired/${encodeURIComponent(studentId)}/access`, method: 'DELETE' }),
            invalidatesTags: ['Payments'],
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
    useGetExpiredPaymentsQuery,
    useExtendExpiredPaymentMutation,
    useUpdatePaymentAccessExpiryMutation,
    useRevokePaymentAccessMutation,
    useCreateEvcPaymentMutation,
    useCreateBankPaymentMutation,
    useCreateWaafiPaymentMutation
} = paymentApi;
