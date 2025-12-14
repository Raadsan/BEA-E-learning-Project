import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const placementTestApi = createApi({
    reducerPath: 'placementTestApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:5000/api',
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['PlacementTest'],
    endpoints: (builder) => ({
        getPlacementTests: builder.query({
            query: () => '/placement-tests',
            providesTags: ['PlacementTest'],
        }),
        getPlacementTestById: builder.query({
            query: (id) => `/placement-tests/${id}`,
            providesTags: (result, error, id) => [{ type: 'PlacementTest', id }],
        }),
        createPlacementTest: builder.mutation({
            query: (newTest) => ({
                url: '/placement-tests',
                method: 'POST',
                body: newTest,
            }),
            invalidatesTags: ['PlacementTest'],
        }),
        updatePlacementTest: builder.mutation({
            query: ({ id, ...updatedTest }) => ({
                url: `/placement-tests/${id}`,
                method: 'PUT',
                body: updatedTest,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'PlacementTest', id }, 'PlacementTest'],
        }),
        deletePlacementTest: builder.mutation({
            query: (id) => ({
                url: `/placement-tests/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['PlacementTest'],
        }),
    }),
});

export const {
    useGetPlacementTestsQuery,
    useGetPlacementTestByIdQuery,
    useCreatePlacementTestMutation,
    useUpdatePlacementTestMutation,
    useDeletePlacementTestMutation,
} = placementTestApi;
