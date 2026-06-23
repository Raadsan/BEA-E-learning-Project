import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Dispatch } from "@reduxjs/toolkit";
import { API_URL, DIRECT_API_URL } from "@/constants";

type AssignmentListArgs = {
    program_id?: string;
    class_id?: string;
    subprogram_id?: string;
    type?: string;
    created_by?: string | number;
};

function matchesAssignmentListFilters(
    originalArgs: AssignmentListArgs | undefined,
    assignment: { type?: string; class_id?: number | string | null; created_by?: number | string | null },
    bodyType?: string
) {
    if (originalArgs?.type && originalArgs.type !== (assignment.type || bodyType)) return false;
    if (originalArgs?.class_id && String(originalArgs.class_id) !== String(assignment.class_id ?? "")) return false;
    if (originalArgs?.created_by && String(originalArgs.created_by) !== String(assignment.created_by ?? "")) return false;
    if (originalArgs?.subprogram_id && String(originalArgs.subprogram_id) !== String((assignment as { subprogram_id?: number }).subprogram_id ?? "")) return false;
    if (originalArgs?.program_id && String(originalArgs.program_id) !== String((assignment as { program_id?: number }).program_id ?? "")) return false;
    return true;
}

function patchAssignmentsListCache(
    dispatch: Dispatch,
    body: { type: string },
    assignment: Record<string, unknown>
) {
    const enriched = { ...assignment, type: body.type };
    dispatch(
        assignmentApi.util.updateQueriesData(
            "getAssignments",
            (draft, { originalArgs }) => {
                if (!Array.isArray(draft)) return;
                if (!matchesAssignmentListFilters(originalArgs as AssignmentListArgs | undefined, enriched, body.type)) return;

                const index = draft.findIndex(
                    (item) => item.id === enriched.id && item.type === enriched.type
                );
                if (index >= 0) {
                    draft[index] = { ...draft[index], ...enriched };
                } else {
                    draft.unshift(enriched);
                }
            }
        )
    );
}

function removeAssignmentFromListCache(dispatch: Dispatch, id: number | string, type: string) {
    dispatch(
        assignmentApi.util.updateQueriesData(
            "getAssignments",
            (draft) => {
                if (!Array.isArray(draft)) return;
                const index = draft.findIndex((item) => item.id == id && item.type === type);
                if (index >= 0) draft.splice(index, 1);
            }
        )
    );
}

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
            async onQueryStarted(body, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data?.assignment) {
                        patchAssignmentsListCache(dispatch, body, data.assignment);
                    }
                } catch {
                    // invalidatesTags will refetch on failure paths
                }
            },
        }),
        updateAssignment: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/update/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["Assignments"],
            async onQueryStarted({ id, ...body }, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data?.assignment) {
                        patchAssignmentsListCache(dispatch, body, { ...data.assignment, id });
                    }
                } catch {
                    // invalidatesTags will refetch on failure paths
                }
            },
        }),
        deleteAssignment: builder.mutation({
            query: ({ id, type }) => ({
                url: `/delete/${id}?type=${type}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Assignments"],
            async onQueryStarted({ id, type }, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    removeAssignmentFromListCache(dispatch, id, type);
                } catch {
                    // invalidatesTags will refetch on failure paths
                }
            },
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
