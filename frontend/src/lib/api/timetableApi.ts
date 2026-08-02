import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/constants";

export const timetableApi = createApi({
    reducerPath: "timetableApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/timetables`,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            headers.set("Content-Type", "application/json");
            return headers;
        },
    }),
    tagTypes: ["Timetables"],
    endpoints: (builder) => ({
        getTimelineRanges: builder.query<any[], void>({
            query: () => "/timeline-ranges",
            providesTags: [{ type: "Timetables", id: "RANGES" }],
        }),
        createTimelineRange: builder.mutation({
            query: (body) => ({ url: "/timeline-ranges", method: "POST", body }),
            invalidatesTags: [{ type: "Timetables", id: "RANGES" }],
        }),
        updateTimelineRange: builder.mutation({
            query: ({ groupId, ...body }) => ({ url: `/timeline-ranges/${groupId}`, method: "PUT", body }),
            invalidatesTags: [{ type: "Timetables", id: "RANGES" }],
        }),
        deleteTimelineRange: builder.mutation({
            query: (groupId) => ({ url: `/timeline-ranges/${groupId}`, method: "DELETE" }),
            invalidatesTags: [{ type: "Timetables", id: "RANGES" }],
        }),
        getTimelineActivities: builder.query<any[], { groupId: string; subprogramId: number }>({
            query: ({ groupId, subprogramId }) => `/timeline-ranges/${groupId}/activities/${subprogramId}`,
            providesTags: [{ type: "Timetables", id: "ACTIVITIES" }],
        }),
        createTimelineActivity: builder.mutation({
            query: (body) => ({ url: "/timeline-activities", method: "POST", body }),
            invalidatesTags: [{ type: "Timetables", id: "ACTIVITIES" }],
        }),
        updateTimelineActivity: builder.mutation({
            query: ({ id, ...body }) => ({ url: `/timeline-activities/${id}`, method: "PUT", body }),
            invalidatesTags: [{ type: "Timetables", id: "ACTIVITIES" }],
        }),
        deleteTimelineActivity: builder.mutation({
            query: (id) => ({ url: `/timeline-activities/${id}`, method: "DELETE" }),
            invalidatesTags: [{ type: "Timetables", id: "ACTIVITIES" }],
        }),
        // GET timetables for a subprogram
        getTimetable: builder.query({
            query: (subprogramId) => `/${subprogramId}`,
            providesTags: (result, error, subprogramId) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: 'Timetables', id })),
                        { type: 'Timetables', id: 'LIST' },
                    ]
                    : [{ type: 'Timetables', id: 'LIST' }],
        }),

        // CREATE timetable entry
        createEntry: builder.mutation({
            query: (data) => ({
                url: "/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [{ type: 'Timetables', id: 'LIST' }],
        }),

        // UPDATE timetable entry
        updateEntry: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Timetables', id }, { type: 'Timetables', id: 'LIST' }],
        }),

        // DELETE timetable entry
        deleteEntry: builder.mutation({
            query: (id) => ({
                url: `/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Timetables', id }, { type: 'Timetables', id: 'LIST' }],
        }),
    }),
});

export const {
    useGetTimelineRangesQuery,
    useCreateTimelineRangeMutation,
    useUpdateTimelineRangeMutation,
    useDeleteTimelineRangeMutation,
    useGetTimelineActivitiesQuery,
    useCreateTimelineActivityMutation,
    useUpdateTimelineActivityMutation,
    useDeleteTimelineActivityMutation,
    useGetTimetableQuery,
    useCreateEntryMutation,
    useUpdateEntryMutation,
    useDeleteEntryMutation,
} = timetableApi;
