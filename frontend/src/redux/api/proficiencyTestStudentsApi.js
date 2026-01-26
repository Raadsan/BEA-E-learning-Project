import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const proficiencyTestStudentsApi = createApi({
    reducerPath: "proficiencyTestStudentsApi",
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
        prepareHeaders: (headers) => {
            const user = JSON.parse(localStorage.getItem("user"));
            if (user && user.token) {
                headers.set("Authorization", `Bearer ${user.token}`);
            }
            return headers;
        },
    }),
    tagTypes: ["Candidates"],
    endpoints: (builder) => ({
        getCandidates: builder.query({
            query: () => "/api/proficiency-test-students/all",
            providesTags: ["Candidates"],
        }),
        registerCandidate: builder.mutation({
            query: (data) => ({
                url: "/api/proficiency-test-students/register",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Candidates"],
        }),
        updateCandidateStatus: builder.mutation({
            query: ({ id, status }) => ({
                url: `/api/proficiency-test-students/status/${id}`,
                method: "PATCH",
                body: { status },
            }),
            invalidatesTags: ["Candidates"],
        }),
        updateCandidate: builder.mutation({
            query: ({ id, data }) => ({
                url: `/api/proficiency-test-students/update/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Candidates"],
        }),
        extendCandidateDeadline: builder.mutation({

            query: ({ id, durationMinutes }) => ({
                url: `/api/proficiency-test-students/extend/${id}`,
                method: "PATCH",
                body: { durationMinutes },
            }),
            invalidatesTags: ["Candidates"],
        }),
        deleteCandidate: builder.mutation({
            query: (id) => ({
                url: `/api/proficiency-test-students/delete/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Candidates"],
        }),
    }),
});

export const {
    useGetCandidatesQuery,
    useRegisterCandidateMutation,
    useUpdateCandidateStatusMutation,
    useUpdateCandidateMutation,
    useExtendCandidateDeadlineMutation,

    useDeleteCandidateMutation,
} = proficiencyTestStudentsApi;
