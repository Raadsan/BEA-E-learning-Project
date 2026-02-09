import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/constants";

export const newsletterApi = createApi({
    reducerPath: "newsletterApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}",
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) {
                headers.set("authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ["Newsletters"],
    endpoints: (builder) => ({
        getSubscribers: builder.query({
            query: () => "/newsletter/subscribers",
            providesTags: ["Newsletters"],
        }),
        deleteSubscriber: builder.mutation({
            query: (id) => ({
                url: `/newsletter/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Newsletters"],
        }),
    }),
});

export const {
    useGetSubscribersQuery,
    useDeleteSubscriberMutation,
} = newsletterApi;
