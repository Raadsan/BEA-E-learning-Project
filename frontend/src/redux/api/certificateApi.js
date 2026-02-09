import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/constants";

export const certificateApi = createApi({
    reducerPath: "certificateApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/certificates`,
        prepareHeaders: (headers) => {
            const token = typeof window !== `undefined" ? localStorage.getItem("token") : null;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ["Certificates"],
    endpoints: (builder) => ({
        getCertificates: builder.query({
            query: () => "/",
            providesTags: ["Certificates"],
        }),
        getCertificateByTarget: builder.query({
            query: ({ target_type, target_id }) => `/target/${target_type}/${target_id}`,
            providesTags: (result, error, { target_id }) => [{ type: "Certificates", id: target_id }],
        }),
        getIssuedCertificates: builder.query({
            query: () => "/issued",
            providesTags: ["Certificates"],
        }),
        getMyIssuedCertificates: builder.query({
            query: () => "/my-issued",
            providesTags: ["Certificates"],
        }),
        upsertCertificate: builder.mutation({
            query: (data) => ({
                url: "/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Certificates"],
        }),
        deleteCertificate: builder.mutation({
            query: (id) => ({
                url: `/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Certificates"],
        }),
    }),
});

export const {
    useGetCertificatesQuery,
    useGetCertificateByTargetQuery,
    useGetIssuedCertificatesQuery,
    useGetMyIssuedCertificatesQuery,
    useUpsertCertificateMutation,
    useDeleteCertificateMutation,
} = certificateApi;
