import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const courseTimelineApi = createApi({
    reducerPath: 'courseTimelineApi',
    baseQuery: fetchBaseQuery({
        baseUrl: '${API_URL}/course-timeline',
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['CourseTimeline'],
    endpoints: (builder) => ({
        getTimelines: builder.query({
            query: () => '/',
            providesTags: ['CourseTimeline'],
        }),
        getTimeline: builder.query({
            query: (id) => `/${id}`,
            providesTags: ['CourseTimeline'],
        }),
    }),
});

export const {
    useGetTimelinesQuery,
    useGetTimelineQuery,
} = courseTimelineApi;
