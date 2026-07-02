import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL, DIRECT_API_URL } from "@/constants";

export const assignmentApi = createApi({
    reducerPath: "assignmentApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/assignments`,
        fetchFn: async (input, init) =>
            fetch(input, { ...init, cache: "no-store" }),
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
            query: ({ program_id, class_id, subprogram_id, type, created_by }: { program_id?: string; class_id?: string; subprogram_id?: string; type?: string; created_by?: string } = {}) => {
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
            query: ({ program_id, class_id, student_id, timeFrame }: { program_id?: string; class_id?: string; student_id?: string; timeFrame?: string } = {}) => {
                const params = new URLSearchParams();
                if (program_id) params.append("program_id", program_id);
                if (class_id) params.append("class_id", class_id);
                if (student_id) params.append("student_id", student_id);
                if (timeFrame) params.append("timeFrame", timeFrame);
                return `/stats?${params.toString()}`;
            },
            providesTags: ["Assignments"],
        }),
        getPerformanceClusters: builder.query({
            query: ({ program_id, class_id }: { program_id?: string; class_id?: string } = {}) => {
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
            async queryFn(body, _api, _extraOptions, fetchWithBQ) {
                if (body instanceof FormData) {
                    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
                    try {
                        const response = await fetch(`${DIRECT_API_URL}/assignments/submit`, {
                            method: "POST",
                            headers: token ? { Authorization: `Bearer ${token}` } : {},
                            body,
                            cache: "no-store",
                        });

                        const raw = await response.text();
                        let data: Record<string, unknown> | null = null;
                        if (raw) {
                            try {
                                data = JSON.parse(raw) as Record<string, unknown>;
                            } catch {
                                data = { error: raw };
                            }
                        }

                        if (!response.ok) {
                            return {
                                error: {
                                    status: response.status,
                                    data: data ?? { error: `Submission failed (${response.status})` },
                                },
                            };
                        }

                        return { data: data ?? { success: true } };
                    } catch (error) {
                        return {
                            error: {
                                status: "FETCH_ERROR",
                                error: error instanceof Error ? error.message : "Network error",
                            },
                        };
                    }
                }

                return fetchWithBQ({
                    url: "/submit",
                    method: "POST",
                    body,
                });
            },
            invalidatesTags: ["Assignments"],
        }),
        getAssignmentSubmissions: builder.query({
            query: ({ id, type }) => `/submissions/${id}?type=${type}`,
            providesTags: ["Assignments"],
        }),
        getAllSubmissions: builder.query({
            query: ({ type, subprogram_id, program_id, class_id }: { type?: string; subprogram_id?: string; program_id?: string; class_id?: string } = {}) => {
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
                url: formData instanceof FormData
                    ? `${DIRECT_API_URL}/assignments/grade/${id}`
                    : `/grade/${id}`,
                method: "PUT",
                body: formData,
            }),
            invalidatesTags: ["Assignments"],
        }),
        reopenSubmission: builder.mutation({
            query: ({ id, type, start_date, end_date }) => ({
                url: `/reopen-submission/${id}`,
                method: "PATCH",
                body: { type, start_date, end_date },
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
    useReopenSubmissionMutation,
} = assignmentApi;
