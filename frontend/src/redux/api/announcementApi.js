import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const announcementApi = createApi({
    reducerPath: "announcementApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:5000/api",
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) {
                headers.set("authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ["Announcements"],
    endpoints: (builder) => ({
        getAnnouncements: builder.query({
            query: () => "/announcements",
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
                url: `/announcements/update/${id}`,
                method: "POST",
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
    useCreateAnnouncementMutation,
    useUpdateAnnouncementMutation,
    useDeleteAnnouncementMutation,
} = announcementApi;
