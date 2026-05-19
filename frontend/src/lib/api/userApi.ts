import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/constants";

export const userApi = createApi({
    reducerPath: "userApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}`,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) {
                headers.set("authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ["User"],
    endpoints: (builder) => ({
        getUsers: builder.query({
            query: () => "/users",
            providesTags: ["User"],
        }),
        bulkActionUsers: builder.mutation({
            query: ({ userIds, action }) => ({
                url: "/users/bulk-action",
                method: "POST",
                body: { userIds, action },
            }),
            invalidatesTags: ["User"],
        }),
    }),
});

export const { useGetUsersQuery, useBulkActionUsersMutation } = userApi;
