import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const adminApi = createApi({
    reducerPath: "adminApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:5000/api/admins",
        prepareHeaders: (headers) => {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            headers.set("Content-Type", "application/json");
            return headers;
        },
    }),
    tagTypes: ["Admins"],
    endpoints: (builder) => ({
        getAdmins: builder.query({
            query: () => "/",
            providesTags: ["Admins"],
        }),
        getAdmin: builder.query({
            query: (id) => `/${id}`,
            providesTags: (result, error, id) => [{ type: "Admins", id }],
        }),
        createAdmin: builder.mutation({
            query: (body) => ({
                url: "/",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Admins"],
        }),
        updateAdmin: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: "Admins", id }, "Admins", "Auth"],
        }),
        deleteAdmin: builder.mutation({
            query: (id) => ({
                url: `/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Admins"],
        }),
    }),
});

export const {
    useGetAdminsQuery,
    useGetAdminQuery,
    useCreateAdminMutation,
    useUpdateAdminMutation,
    useDeleteAdminMutation,
} = adminApi;
