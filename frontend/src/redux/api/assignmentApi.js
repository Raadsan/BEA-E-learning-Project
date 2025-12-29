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
            headers.set("Content-Type", "application/json");
            return headers;
        },
    }),
    tagTypes: ["Assignments"],
    endpoints: (builder) => ({
        getAssignments: builder.query({
            query: ({ program_id, class_id } = {}) => {
                const params = new URLSearchParams();
                if (program_id) params.append("program_id", program_id);
                if (class_id) params.append("class_id", class_id);
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
            query: (id) => ({
                url: `/delete/${id}`,
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
} = assignmentApi;
