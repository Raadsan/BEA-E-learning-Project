import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const assignmentApi = createApi({
    reducerPath: "assignmentApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:5000/api/assignments",
        prepareHeaders: (headers) => {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ["Assignments"],
    endpoints: (builder) => ({
        getAssignments: builder.query({
            query: ({ program_id, class_id, subprogram_id, type, created_by } = {}) => {
                const params = new URLSearchParams();
                if (program_id) params.append("program_id", program_id);
                if (class_id) params.append("class_id", class_id);
                if (subprogram_id) params.append("subprogram_id", subprogram_id);
                if (type) params.append("type", type);
                if (created_by) params.append("created_by", created_by);
                return `/?${params.toString()}`;
            },
            providesTags: ["Assignments"],
        }),
        getAssignmentStats: builder.query({
            query: ({ program_id, class_id, timeFrame } = {}) => {
                const params = new URLSearchParams();
                if (program_id) params.append("program_id", program_id);
                if (class_id) params.append("class_id", class_id);
                if (timeFrame) params.append("timeFrame", timeFrame);
                return `/stats?${params.toString()}`;
            },
            providesTags: ["Assignments"],
        }),
        getPerformanceClusters: builder.query({
            query: ({ program_id, class_id } = {}) => {
                const params = new URLSearchParams();
                if (program_id) params.append("program_id", program_id);
                if (class_id) params.append("class_id", class_id);
                return `/performance-clusters?${params.toString()}`;
            },
            providesTags: ["Assignments"],
        }),
        createAssignment: builder.mutation({
            query: (body) => ({
                url: "/create",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Assignments"],
        }),
        updateAssignment: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/update/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["Assignments"],
        }),
        deleteAssignment: builder.mutation({
            query: ({ id, type }) => ({
                url: `/delete/${id}?type=${type}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Assignments"],
        }),
        submitAssignment: builder.mutation({
            query: (body) => ({
                url: "/submit",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Assignments"],
        }),
        getAssignmentSubmissions: builder.query({
            query: ({ id, type }) => `/submissions/${id}?type=${type}`,
            providesTags: ["Assignments"],
        }),
        getAllSubmissions: builder.query({
            query: ({ type, subprogram_id, program_id, class_id } = {}) => {
                const params = new URLSearchParams();
                if (type) params.append("type", type);
                if (subprogram_id) params.append("subprogram_id", subprogram_id);
                if (program_id) params.append("program_id", program_id);
                if (class_id) params.append("class_id", class_id);
                return `/all-submissions?${params.toString()}`;
            },
            providesTags: ["Assignments"],
        }),
        gradeSubmission: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/grade/${id}`,
                method: "PUT",
                body: formData,
            }),
            invalidatesTags: ["Assignments"],
        }),
    }),
});

export const {
    useGetAssignmentsQuery,
    useGetAssignmentStatsQuery,
    useGetPerformanceClustersQuery,
    useCreateAssignmentMutation,
    useUpdateAssignmentMutation,
    useDeleteAssignmentMutation,
    useSubmitAssignmentMutation,
    useGetAssignmentSubmissionsQuery,
    useGetAllSubmissionsQuery,
    useGradeSubmissionMutation,
} = assignmentApi;
