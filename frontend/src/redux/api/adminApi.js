import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/constants";

export const adminApi = createApi({
    reducerPath: "adminApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/admins",
        prepareHeaders: (headers) => {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ["Admins", "Auth"],
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
            query: (data) => {
                let id;
                let body;

                if (data instanceof FormData) {
                    id = data.get("id");
                    body = data;
                } else {
                    const { id: dataId, ...rest } = data;
                    id = dataId;
                    body = rest;
                }

                return {
                    url: `/${id}`,
                    method: "PUT",
                    body,
                };
            },
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
