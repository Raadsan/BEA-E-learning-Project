import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const timetableApi = createApi({
    reducerPath: "timetableApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:5000/api/timetables",
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
    useGetTimetableQuery,
    useCreateEntryMutation,
    useUpdateEntryMutation,
    useDeleteEntryMutation,
} = timetableApi;
