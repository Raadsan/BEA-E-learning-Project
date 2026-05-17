import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/constants";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE || `${API_URL}`;

export const notificationApi = createApi({
    reducerPath: "notificationApi",
    baseQuery: fetchBaseQuery({
        baseUrl,
        prepareHeaders: (headers) => {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
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
        sendTestReminderEmail: builder.mutation({
            query: (data) => ({
                url: "/notifications/test-reminder",
                method: "POST",
                body: data,
            }),
        }),
    }),
});

export const {
    useGetNotificationsQuery,
    useCreateNotificationMutation,
    useMarkAsReadMutation,
    useDeleteNotificationMutation,
    useSendTestReminderEmailMutation,
} = notificationApi;
