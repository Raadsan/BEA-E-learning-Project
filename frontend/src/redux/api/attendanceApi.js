import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const attendanceApi = createApi({
    reducerPath: "attendanceApi",
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
    tagTypes: ["Attendance"],
    endpoints: (builder) => ({
        getAttendance: builder.query({
            query: ({ classId, date }) => `/${classId}/${date}`,
            providesTags: (result, error, { classId, date }) => [
                { type: "Attendance", id: `${classId}-${date}` },
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

export const { useGetAttendanceQuery, useSaveAttendanceMutation } = attendanceApi;
