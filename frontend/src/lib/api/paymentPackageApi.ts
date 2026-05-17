import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/constants";

export const paymentPackageApi = createApi({
    reducerPath: "paymentPackageApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/payment-packages`,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) {
                headers.set("authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ["PaymentPackage"],
    endpoints: (builder) => ({
        getPaymentPackages: builder.query({
            query: () => "/",
            providesTags: ["PaymentPackage"],
        }),
        getPaymentPackageById: builder.query({
            query: (id) => `/${id}`,
            providesTags: (result, error, id) => [{ type: "PaymentPackage", id }],
        }),
        createPaymentPackage: builder.mutation({
            query: (body) => ({
                url: "/",
                method: "POST",
                body,
            }),
            invalidatesTags: ["PaymentPackage"],
        }),
        updatePaymentPackage: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: (result, error, { id }) => ["PaymentPackage", { type: "PaymentPackage", id }],
        }),
        deletePaymentPackage: builder.mutation({
            query: (id) => ({
                url: `/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["PaymentPackage"],
        }),
        assignPackageToProgram: builder.mutation({
            query: ({ packageId, programId }) => ({
                url: `/${packageId}/assign`,
                method: "POST",
                body: { programId },
            }),
            invalidatesTags: ["PaymentPackage"],
        }),
        removePackageFromProgram: builder.mutation({
            query: ({ packageId, programId }) => ({
                url: `/${packageId}/programs/${programId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["PaymentPackage"],
        }),
    }),
});

export const {
    useGetPaymentPackagesQuery,
    useGetPaymentPackageByIdQuery,
    useCreatePaymentPackageMutation,
    useUpdatePaymentPackageMutation,
    useDeletePaymentPackageMutation,
    useAssignPackageToProgramMutation,
    useRemovePackageFromProgramMutation,
} = paymentPackageApi;
