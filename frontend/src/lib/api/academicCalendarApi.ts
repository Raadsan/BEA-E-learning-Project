import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/constants";

export const academicCalendarApi = createApi({
    reducerPath: "academicCalendarApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/timetables`,
        prepareHeaders: (headers) => {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            headers.set("Content-Type", "application/json");
            return headers;
        },
    }),
    tagTypes: ["AcademicCalendar"],
    endpoints: (builder) => ({
        // Get academic calendar for a subprogram with optional month and year
        getAcademicCalendar: builder.query({
            query: ({ subprogramId, month, year }) => {
                let url = `/weekly/${subprogramId}`;
                const params = new URLSearchParams();
                if (month) params.append("month", month);
                if (year) params.append("year", year);
                const queryString = params.toString();
                return queryString ? `${url}?${queryString}` : url;
            },
            providesTags: (result, error, { subprogramId }) => [
                { type: 'AcademicCalendar', id: subprogramId }
            ],
        }),

        // Create a new calendar entry
        createCalendarEntry: builder.mutation({
            query: (data) => ({
                url: '/weekly',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'AcademicCalendar', id: arg.subprogram_id }
            ],
        }),

        // Update a calendar entry
        updateCalendarEntry: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/weekly/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'AcademicCalendar', id: arg.subprogram_id }
            ],
        }),

        // Delete a calendar entry
        deleteCalendarEntry: builder.mutation({
            query: ({ id, subprogram_id }) => ({
                url: `/weekly/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'AcademicCalendar', id: arg.subprogram_id }
            ],
        }),

        // Bulk create calendar entries
        bulkCreateCalendarEntries: builder.mutation({
            query: (data) => ({
                url: '/weekly/bulk',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'AcademicCalendar', id: arg.entries[0]?.subprogram_id }
            ],
        }),

        // Delete all weekly entries for a subprogram
        deleteAllBySubprogram: builder.mutation({
            query: (subprogramId) => ({
                url: `/weekly/subprogram/${subprogramId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, subprogramId) => [
                { type: 'AcademicCalendar', id: subprogramId }
            ],
        }),
    }),
});

export const {
    useGetAcademicCalendarQuery,
    useCreateCalendarEntryMutation,
    useUpdateCalendarEntryMutation,
    useDeleteCalendarEntryMutation,
    useBulkCreateCalendarEntriesMutation,
    useDeleteAllBySubprogramMutation,
} = academicCalendarApi;
