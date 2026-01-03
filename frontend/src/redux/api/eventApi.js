import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const eventApi = createApi({
    reducerPath: 'eventApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:5000/api/events',
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Events'],
    endpoints: (builder) => ({
        getEvents: builder.query({
            query: ({ subprogramId, start, end }) => `/${subprogramId}?start=${start}&end=${end}`,
            providesTags: ['Events'],
        }),
        createEvent: builder.mutation({
            query: (eventData) => ({
                url: '/',
                method: 'POST',
                body: eventData,
            }),
            invalidatesTags: ['Events'],
        }),
        updateEvent: builder.mutation({
            query: ({ id, ...eventData }) => ({
                url: `/${id}`,
                method: 'PUT',
                body: eventData,
            }),
            invalidatesTags: ['Events'],
        }),
        deleteEvent: builder.mutation({
            query: (id) => ({
                url: `/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Events'],
        }),
    }),
});

export const {
    useGetEventsQuery,
    useCreateEventMutation,
    useUpdateEventMutation,
    useDeleteEventMutation,
} = eventApi;
