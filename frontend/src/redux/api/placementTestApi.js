import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const getToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("token");
    }
    return null;
};

export const placementTestApi = createApi({
    reducerPath: "placementTestApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:5000/api/placement-tests",
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
        getPlacementTests: builder.query({
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
        getStudentPlacementResults: builder.query({
            query: (studentId) => `/results/${studentId}`,
            providesTags: ["PlacementResult"],
        }),
        getAllPlacementResults: builder.query({
            query: () => "/results/all",
            providesTags: ["PlacementResult"],
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
    }),
});

export const {
    useGetPlacementTestsQuery,
    useGetPlacementTestByIdQuery,
    useSubmitPlacementTestMutation,
    useGetStudentPlacementResultsQuery,
    useGetAllPlacementResultsQuery,
    useCreatePlacementTestMutation,
    useUpdatePlacementTestMutation,
    useDeletePlacementTestMutation,
} = placementTestApi;
