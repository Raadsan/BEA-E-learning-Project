import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from "@/constants";

export const eventApi = createApi({
    reducerPath: 'eventApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/events`,
        prepareHeaders: (headers) => {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
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
