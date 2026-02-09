import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const sessionRequestApi = createApi({
    reducerPath: 'sessionRequestApi',
    baseQuery: fetchBaseQuery({
        baseUrl: '${API_URL}',
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
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
