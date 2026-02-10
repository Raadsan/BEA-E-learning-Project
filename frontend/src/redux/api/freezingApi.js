
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from "@/constants";

export const freezingApi = createApi({
    reducerPath: 'freezingApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}`,
        prepareHeaders: (headers) => {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['FreezingRequest'],
    endpoints: (builder) => ({
        createFreezingRequest: builder.mutation({
            query: (data) => ({
                url: '/freezing-requests/create',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['FreezingRequest'],
        }),
        getFreezingRequests: builder.query({
            query: () => '/freezing-requests/all',
            providesTags: ['FreezingRequest'],
        }),
        getMyFreezingRequests: builder.query({
            query: () => '/freezing-requests/my',
            providesTags: ['FreezingRequest'],
        }),
        updateFreezingRequestStatus: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/freezing-requests/status/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['FreezingRequest'],
        }),
    }),
});

export const {
    useCreateFreezingRequestMutation,
    useGetFreezingRequestsQuery,
    useGetMyFreezingRequestsQuery,
    useUpdateFreezingRequestStatusMutation
} = freezingApi;
