
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from "@/constants";

export const levelUpApi = createApi({
    reducerPath: 'levelUpApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/level-up-requests`,
        prepareHeaders: (headers) => {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['LevelUpRequest'],
    endpoints: (builder) => ({
        createLevelUpRequest: builder.mutation({
            query: (data) => ({
                url: '/',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['LevelUpRequest'],
        }),
        getLevelUpRequests: builder.query({
            query: () => '/all',
            providesTags: ['LevelUpRequest'],
        }),
        getMyLevelUpRequests: builder.query({
            query: () => '/my-requests',
            providesTags: ['LevelUpRequest'],
        }),
        checkLevelUpEligibility: builder.query({
            query: () => '/check-eligibility',
            providesTags: ['LevelUpRequest'],
        }),
        updateLevelUpRequestStatus: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/${id}/status`,
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
