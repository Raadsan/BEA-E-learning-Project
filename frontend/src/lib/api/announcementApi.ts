import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/constants";

export const announcementApi = createApi({
    reducerPath: "announcementApi",
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
    tagTypes: ["Announcements"],
    keepUnusedDataFor: 300,
    endpoints: (builder) => ({
        getAnnouncements: builder.query<any, void>({
            query: () => "/announcements",
            providesTags: ["Announcements"],
        }),
        getTeacherAnnouncements: builder.query<any, void>({
            query: () => "/announcements/teacher",
            providesTags: ["Announcements"],
        }),
        createAnnouncement: builder.mutation({
            query: (newAnnouncement) => ({
                url: "/announcements",
                method: "POST",
                body: newAnnouncement,
            }),
            invalidatesTags: ["Announcements"],
        }),
        updateAnnouncement: builder.mutation({
            query: ({ id, ...updatedAnnouncement }) => ({
                url: `/announcements/${id}`,
                method: "PUT",
                body: updatedAnnouncement,
            }),
            invalidatesTags: ["Announcements"],
        }),
        deleteAnnouncement: builder.mutation({
            query: (id) => ({
                url: `/announcements/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Announcements"],
        }),
    }),
});

export const {
    useGetAnnouncementsQuery,
    useGetTeacherAnnouncementsQuery,
    useCreateAnnouncementMutation,
    useUpdateAnnouncementMutation,
    useDeleteAnnouncementMutation,
} = announcementApi;
