
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const levelUpApi = createApi({
    reducerPath: 'levelUpApi',
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
    tagTypes: ['LevelUpRequest'],
    endpoints: (builder) => ({
        createLevelUpRequest: builder.mutation({
            query: (data) => ({
                url: '/level-up-requests',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['LevelUpRequest'],
        }),
        getLevelUpRequests: builder.query({
            query: () => '/level-up-requests/all',
            providesTags: ['LevelUpRequest'],
        }),
        getMyLevelUpRequests: builder.query({
            query: () => '/level-up-requests/my-requests',
            providesTags: ['LevelUpRequest'],
        }),
        checkLevelUpEligibility: builder.query({
            query: () => '/level-up-requests/check-eligibility',
            providesTags: ['LevelUpRequest'],
        }),
        updateLevelUpRequestStatus: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/level-up-requests/${id}/status`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['LevelUpRequest'],
        }),
    }),
});

export const {
    useCreateLevelUpRequestMutation,
    useGetLevelUpRequestsQuery,
    useGetMyLevelUpRequestsQuery,
    useCheckLevelUpEligibilityQuery,
    useUpdateLevelUpRequestStatusMutation
} = levelUpApi;
