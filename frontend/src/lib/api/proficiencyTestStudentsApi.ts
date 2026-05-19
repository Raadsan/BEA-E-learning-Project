import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/constants";

export const proficiencyTestStudentsApi = createApi({
    reducerPath: "proficiencyTestStudentsApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/proficiency-test-students`,
        prepareHeaders: (headers) => {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ["Candidates"],
    endpoints: (builder) => ({
        getCandidates: builder.query<any, void>({
            query: () => "/all",
            providesTags: ["Candidates"],
        }),
        registerCandidate: builder.mutation({
            query: (data) => ({
                url: "/register",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Candidates"],
        }),
        updateCandidateStatus: builder.mutation({
            query: ({ id, status }) => ({
                url: `/status/${id}`,
                method: "PATCH",
                body: { status },
            }),
            invalidatesTags: ["Candidates"],
        }),
        updateCandidate: builder.mutation({
            query: ({ id, data }) => ({
                url: `/update/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Candidates"],
        }),
        extendCandidateDeadline: builder.mutation({

            query: ({ id, durationMinutes }) => ({
                url: `/extend/${id}`,
                method: "PATCH",
                body: { durationMinutes },
            }),
            invalidatesTags: ["Candidates"],
        }),
        deleteCandidate: builder.mutation({
            query: (id) => ({
                url: `/delete/${id}`,
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
