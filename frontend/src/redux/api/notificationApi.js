
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api';

export const notificationApi = createApi({
    reducerPath: "notificationApi",
    baseQuery: fetchBaseQuery({
        baseUrl,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ["Notifications"],
    endpoints: (builder) => ({
        getNotifications: builder.query({
            query: () => "/notifications",
            providesTags: ["Notifications"],
        }),
        createNotification: builder.mutation({
            query: (data) => ({
                url: "/notifications",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Notifications"],
        }),
        markAsRead: builder.mutation({
            query: (id) => ({
                url: `/notifications/${id}/read`,
                method: "PUT",
            }),
            invalidatesTags: ["Notifications"],
        }),
        deleteNotification: builder.mutation({
            query: (id) => ({
                url: `/notifications/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Notifications"],
        }),
    }),
});

export const {
    useGetNotificationsQuery,
    useCreateNotificationMutation,
    useMarkAsReadMutation,
    useDeleteNotificationMutation,
} = notificationApi;
