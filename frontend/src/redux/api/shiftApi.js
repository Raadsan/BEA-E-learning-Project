import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const shiftApi = createApi({
    reducerPath: "shiftApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:5000/api/shifts",
        prepareHeaders: (headers) => {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            headers.set("Content-Type", "application/json");
            return headers;
        },
    }),
    tagTypes: ["Shift"],
    endpoints: (builder) => ({
        getShifts: builder.query({
            query: () => "/",
            providesTags: ["Shift"],
        }),
        getShift: builder.query({
            query: (id) => `/${id}`,
            providesTags: (result, error, id) => [{ type: "Shift", id }],
        }),
        createShift: builder.mutation({
            query: (newShift) => ({
                url: "/",
                method: "POST",
                body: newShift,
            }),
            invalidatesTags: ["Shift"],
        }),
        updateShift: builder.mutation({
            query: ({ id, ...patch }) => ({
                url: `/${id}`,
                method: "PUT",
                body: patch,
            }),
            invalidatesTags: (result, error, { id }) => ["Shift", { type: "Shift", id }],
        }),
        deleteShift: builder.mutation({
            query: (id) => ({
                url: `/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Shift"],
        }),
    }),
});

export const {
    useGetShiftsQuery,
    useGetShiftQuery,
    useCreateShiftMutation,
    useUpdateShiftMutation,
    useDeleteShiftMutation,
} = shiftApi;
