import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const getToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("token");
    }
    return null;
};

export const paymentApi = createApi({
    reducerPath: "paymentApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:5000/api/payments",
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
            transformResponse: (response) => {
                if (response.success) {
                    return response.payments;
                }
                return response;
            },
        }),
        getAllPayments: builder.query({
            query: () => `/`,
            providesTags: ["Payments"],
            transformResponse: (response) => {
                if (response.success) {
                    return response.payments;
                }
                return response;
            },
        }),
        createEvcPayment: builder.mutation({
            query: (body) => ({
                url: "/evc",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Payments"],
        }),
        createBankPayment: builder.mutation({
            query: (body) => ({
                url: "/bank",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Payments"],
        }),
        createWaafiPayment: builder.mutation({
            query: (body) => ({
                url: "/waafi",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Payments"],
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
