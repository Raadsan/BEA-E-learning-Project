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
    tagTypes: ["Contacts", "ContactPage", "Support"],
    endpoints: (builder) => ({
        getMySupportRequests: builder.query<any[], void>({ query: () => "/contact/support/mine", providesTags: ["Support"] }),
        getSupportRequests: builder.query<any[], void>({ query: () => "/contact/support/admin", providesTags: ["Support"] }),
        createSupportRequest: builder.mutation<any, any>({ query: (body) => ({ url: "/contact/support", method: "POST", body }), invalidatesTags: ["Support"] }),
        replySupportRequest: builder.mutation<any, { id: number; reply: string }>({ query: ({ id, reply }) => ({ url: `/contact/support/${id}/reply`, method: "PATCH", body: { reply } }), invalidatesTags: ["Support"] }),
        deleteSupportRequest: builder.mutation<any, number | string>({ query: (id) => ({ url: `/contact/support/${id}`, method: "DELETE" }), invalidatesTags: ["Support"] }),
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
    useGetMySupportRequestsQuery,
    useGetSupportRequestsQuery,
    useCreateSupportRequestMutation,
    useReplySupportRequestMutation,
    useDeleteSupportRequestMutation,
} = contactApi;
