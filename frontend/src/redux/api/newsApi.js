import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const newsApi = createApi({
    reducerPath: "newsApi",
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
    tagTypes: ["News"],
    endpoints: (builder) => ({
        getNews: builder.query({
            query: (all = false) => all ? "/news?all=true" : "/news",
            providesTags: ["News"],
        }),
        createNews: builder.mutation({
            query: (newNews) => ({
                url: "/news",
                method: "POST",
                body: newNews,
            }),
            invalidatesTags: ["News"],
        }),
        updateNews: builder.mutation({
            query: ({ id, ...updatedNews }) => ({
                url: `/news/update/${id}`,
                method: "POST",
                body: updatedNews,
            }),
            invalidatesTags: ["News"],
        }),
        deleteNews: builder.mutation({
            query: (id) => ({
                url: `/news/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["News"],
        }),
    }),
});


export const {
    useGetNewsQuery,
    useCreateNewsMutation,
    useUpdateNewsMutation,
    useDeleteNewsMutation,
} = newsApi;
