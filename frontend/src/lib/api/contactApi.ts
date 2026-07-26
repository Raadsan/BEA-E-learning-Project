import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/constants";

export const contactApi = createApi({
    reducerPath: "contactApi",
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
    tagTypes: ["Contacts", "ContactPage"],
    endpoints: (builder) => ({
        getContacts: builder.query<any, void>({
            query: () => "/contact",
            providesTags: ["Contacts"],
        }),
        deleteContact: builder.mutation({
            query: (id) => ({
                url: `/contact/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Contacts"],
        }),
        getContactPage: builder.query<any, void>({
            query: () => "/contact/page-content",
            providesTags: ["ContactPage"],
        }),
        updateContactPage: builder.mutation<any, any>({
            query: (body) => ({ url: "/contact/page-content", method: "PUT", body }),
            invalidatesTags: ["ContactPage"],
        }),
    }),
});

export const {
    useGetContactsQuery,
    useDeleteContactMutation,
    useGetContactPageQuery,
    useUpdateContactPageMutation,
} = contactApi;
