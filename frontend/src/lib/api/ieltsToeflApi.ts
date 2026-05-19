import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/constants";

export const ieltsToeflApi = createApi({
    reducerPath: "ieltsToeflApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/ielts-toefl`,
        prepareHeaders: (headers) => {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ["IELTS_TOEFL"],
    endpoints: (builder) => ({
        getIeltsToeflStudents: builder.query<any, void>({
            query: () => "/",
            providesTags: ["IELTS_TOEFL"],
            transformResponse: (response: any) => {
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
        rejectIeltsToeflStudent: builder.mutation({
            query: (id) => ({
                url: `/reject/${id}`,
                method: "POST",
            }),
            invalidatesTags: ["IELTS_TOEFL"],
        }),
        approveIeltsToeflStudent: builder.mutation({
            query: (id) => ({
                url: `/approve/${id}`,
                method: "POST",
            }),
            invalidatesTags: ["IELTS_TOEFL"],
        }),
        extendIeltsDeadline: builder.mutation({
            query: ({ id, durationMinutes }) => ({
                url: `/extend-deadline/${id}`,
                method: "POST",
                body: { durationMinutes }
            }),
            invalidatesTags: ["IELTS_TOEFL"],
        }),
        assignIeltsClass: builder.mutation({
            query: ({ id, classId }) => ({
                url: `/assign-class/${id}`,
                method: "POST",
                body: { classId }
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
    useRejectIeltsToeflStudentMutation,
    useApproveIeltsToeflStudentMutation,
    useExtendIeltsDeadlineMutation,
    useAssignIeltsClassMutation,
} = ieltsToeflApi;
