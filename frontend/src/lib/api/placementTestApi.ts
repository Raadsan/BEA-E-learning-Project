import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/constants";

const getToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("token");
    }
    return null;
};

export const placementTestApi = createApi({
    reducerPath: "placementTestApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/placement-tests`,
        prepareHeaders: (headers) => {
            const token = getToken();
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ["PlacementTest", "PlacementResult"],
    endpoints: (builder) => ({
        getPlacementTests: builder.query<any, void>({
            query: () => "/",
            providesTags: ["PlacementTest"],
        }),
        getPlacementTestById: builder.query({
            query: (id) => `/${id}`,
            providesTags: (result, error, id) => [{ type: "PlacementTest", id }],
        }),
        submitPlacementTest: builder.mutation({
            query: (data) => ({
                url: "/submit",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["PlacementResult"],
        }),
        startPlacementTest: builder.mutation({
            query: (data) => ({
                url: "/start",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["PlacementResult"],
        }),
        unlockPlacementAttempt: builder.mutation({
            query: (attemptId) => ({
                url: `/attempts/${attemptId}/lock`,
                method: "DELETE",
            }),
            invalidatesTags: ["PlacementResult"],
        }),
        getStudentPlacementResults: builder.query({
            query: (studentId) => `/results/${studentId}`,
            providesTags: ["PlacementResult"],
        }),
        getPlacementLockStatus: builder.query<any, string>({
            query: (studentId) => `/lock-status/${studentId}`,
            providesTags: ["PlacementResult"],
        }),
        getAllPlacementResults: builder.query<any, void>({
            query: () => "/results/all",
            providesTags: ["PlacementResult"],
        }),
        gradePlacementTest: builder.mutation({
            query: ({ resultId, essayMarks, oralReviewMarks, feedbackFile, recommendedLevel }) => ({
                url: `/results/${resultId}/grade`,
                method: "PUT",
                body: {
                    essay_marks: essayMarks,
                    oral_review_marks: oralReviewMarks,
                    feedback_file: feedbackFile,
                    recommended_level: recommendedLevel,
                    status: "completed",
                },
            }),
            invalidatesTags: ["PlacementResult"],
        }),
        createPlacementTest: builder.mutation({
            query: (newTest) => ({
                url: "/",
                method: "POST",
                body: newTest,
            }),
            invalidatesTags: ["PlacementTest"],
        }),
        updatePlacementTest: builder.mutation({
            query: ({ id, ...updatedTest }) => ({
                url: `/${id}`,
                method: "PUT",
                body: updatedTest,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: "PlacementTest", id }, "PlacementTest"],
        }),
        deletePlacementTest: builder.mutation({
            query: (id) => ({
                url: `/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["PlacementTest"],
        }),
        deletePlacementResult: builder.mutation({
            query: (resultId) => ({
                url: `/results/${resultId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["PlacementResult"],
        }),
    }),
});

export const {
    useGetPlacementTestsQuery,
    useGetPlacementTestByIdQuery,
    useSubmitPlacementTestMutation,
    useStartPlacementTestMutation,
    useUnlockPlacementAttemptMutation,
    useGetStudentPlacementResultsQuery,
    useGetPlacementLockStatusQuery,
    useGetAllPlacementResultsQuery,
    useGradePlacementTestMutation,
    useCreatePlacementTestMutation,
    useUpdatePlacementTestMutation,
    useDeletePlacementTestMutation,
    useDeletePlacementResultMutation,
} = placementTestApi;
