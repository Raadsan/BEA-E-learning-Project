import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from "@/constants";

export const sessionRequestApi = createApi({
    reducerPath: 'sessionRequestApi',
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
    tagTypes: ['SessionRequest'],
    endpoints: (builder) => ({
        createSessionRequest: builder.mutation({
            query: (data) => ({
                url: '/session-requests',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['SessionRequest'],
        }),
        getSessionRequests: builder.query({
            query: () => '/session-requests',
            providesTags: ['SessionRequest'],
        }),
        getMySessionRequests: builder.query({
            query: () => '/session-requests/my-requests',
            providesTags: ['SessionRequest'],
        }),
        updateSessionRequestStatus: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/session-requests/${id}/status`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['SessionRequest'],
        }),
    }),
});

export const { useCreateSessionRequestMutation, useGetSessionRequestsQuery, useGetMySessionRequestsQuery, useUpdateSessionRequestStatusMutation } = sessionRequestApi;
