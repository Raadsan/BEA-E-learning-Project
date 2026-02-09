import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/constants";

export const attendanceApi = createApi({
    reducerPath: "attendanceApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/attendance`,
        prepareHeaders: (headers) => {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            headers.set("Content-Type", "application/json");
            return headers;
        },
    }),
    tagTypes: ["Attendance"],
    endpoints: (builder) => ({
        getAttendance: builder.query({
            query: ({ classId, date }) => `/${classId}/${date}`,
            providesTags: (result, error, { classId, date }) => [
                { type: "Attendance", id: `${classId}-${date}` },
            ],
        }),
        getAttendanceStats: builder.query({
            query: (params) => ({
                url: "/stats",
                params, // { class_id, program_id, timeFrame }
            }),
            providesTags: ["Attendance"],
        }),
        getStudentAttendance: builder.query({
            query: (studentId) => `/student/${studentId}`,
            providesTags: (result, error, studentId) => [
                { type: "Attendance", id: `student-${studentId}` },
            ],
        }),
        saveAttendance: builder.mutation({
            query: (body) => ({
                url: "/",
                method: "POST",
                body,
            }),
            invalidatesTags: (result, error, { class_id, date }) => [
                { type: "Attendance", id: `${class_id}-${date}` }
            ],
        }),
    }),
});

export const {
    useGetAttendanceQuery,
    useSaveAttendanceMutation,
    useGetAttendanceStatsQuery,
    useGetStudentAttendanceQuery
} = attendanceApi;
