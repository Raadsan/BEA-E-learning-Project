import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from "@/constants";

export const courseTimelineApi = createApi({
    reducerPath: 'courseTimelineApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/course-timeline`,
        prepareHeaders: (headers) => {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
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
