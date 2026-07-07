import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/constants";

export const tutorialApi = createApi({
    reducerPath: "tutorialApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/tutorials`,
        prepareHeaders: (headers) => {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;
        },
    }),
    tagTypes: ["Tutorials"],
    endpoints: (builder) => ({
        getTutorials: builder.query<any, boolean | void>({
            query: (all = false) => (all ? "/?all=true" : "/"),
            providesTags: ["Tutorials"],
        }),
        getTutorialById: builder.query({
            query: (id) => `/${id}`,
            providesTags: (_r, _e, id) => [{ type: "Tutorials", id }],
        }),
        createTutorial: builder.mutation({
            query: (body) => ({ url: "/", method: "POST", body }),
            invalidatesTags: ["Tutorials"],
        }),
        updateTutorial: builder.mutation({
            query: ({ id, ...body }) => ({ url: `/${id}`, method: "PUT", body }),
            invalidatesTags: ["Tutorials"],
        }),
        deleteTutorial: builder.mutation({
            query: (id) => ({ url: `/${id}`, method: "DELETE" }),
            invalidatesTags: ["Tutorials"],
        }),
    }),
});

export const {
    useGetTutorialsQuery,
    useGetTutorialByIdQuery,
    useCreateTutorialMutation,
    useUpdateTutorialMutation,
    useDeleteTutorialMutation,
} = tutorialApi;
