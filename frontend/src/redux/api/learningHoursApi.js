import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const learningHoursApi = createApi({
    reducerPath: "learningHoursApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:5000/api/attendance",
        prepareHeaders: (headers) => {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            headers.set("Content-Type", "application/json");
            return headers;
        },
    }),
    tagTypes: ["LearningHours"],
    endpoints: (builder) => ({
        getLearningHours: builder.query({
            query: ({ program_id, class_id, timeFrame = 'Weekly' } = {}) => {
                const params = new URLSearchParams();
                if (program_id) params.append("program_id", program_id);
                if (class_id) params.append("class_id", class_id);
                if (timeFrame) params.append("timeFrame", timeFrame);
                return `/learning-hours?${params.toString()}`;
            },
            providesTags: ["LearningHours"],
        }),
        getLearningHoursSummary: builder.query({
            query: ({ program_id, class_id } = {}) => {
                const params = new URLSearchParams();
                if (program_id) params.append("program_id", program_id);
                if (class_id) params.append("class_id", class_id);
                return `/learning-hours/summary?${params.toString()}`;
            },
            providesTags: ["LearningHours"],
        }),
        getAdminLearningHours: builder.query({
            query: ({ program_id, class_id, timeFrame = 'Weekly' } = {}) => {
                const params = new URLSearchParams();
                if (program_id) params.append("program_id", program_id);
                if (class_id) params.append("class_id", class_id);
                if (timeFrame) params.append("timeFrame", timeFrame);
                return `/learning-hours/admin?${params.toString()}`;
            },
            providesTags: ["LearningHours"],
        }),
    }),
});

export const {
    useGetLearningHoursQuery,
    useGetLearningHoursSummaryQuery,
    useGetAdminLearningHoursQuery,
} = learningHoursApi;
