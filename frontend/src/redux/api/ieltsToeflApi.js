import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const getToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("token");
    }
    return null;
};

export const ieltsToeflApi = createApi({
    reducerPath: "ieltsToeflApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:5000/api/ielts-toefl",
        prepareHeaders: (headers) => {
            const token = getToken();
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ["IELTS_TOEFL"],
    endpoints: (builder) => ({
        getIeltsToeflStudents: builder.query({
            query: () => "/",
            providesTags: ["IELTS_TOEFL"],
            transformResponse: (response) => {
                // Ensure we return the array of students
                return response.students || [];
            }
        }),
        getIeltsToeflStudent: builder.query({
            query: (id) => `/${id}`,
            providesTags: (result, error, id) => [{ type: "IELTS_TOEFL", id }],
        }),
        createIeltsToeflStudent: builder.mutation({
            query: (body) => ({
                url: "/",
                method: "POST",
                body,
            }),
            invalidatesTags: ["IELTS_TOEFL"],
        }),
        updateIeltsToeflStudent: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["IELTS_TOEFL"],
        }),
        deleteIeltsToeflStudent: builder.mutation({
            query: (id) => ({
                url: `/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["IELTS_TOEFL"],
        }),
    }),
});

export const {
    useGetIeltsToeflStudentsQuery,
    useGetIeltsToeflStudentQuery,
    useCreateIeltsToeflStudentMutation,
    useUpdateIeltsToeflStudentMutation,
    useDeleteIeltsToeflStudentMutation,
} = ieltsToeflApi;
