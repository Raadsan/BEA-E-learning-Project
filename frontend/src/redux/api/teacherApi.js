import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const teacherApi = createApi({
  reducerPath: "teacherApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/teachers",
    prepareHeaders: (headers) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Teachers"],
  endpoints: (builder) => ({
    getTeacherDashboardStats: builder.query({
      query: () => "/dashboard/stats",
      providesTags: ["Teachers"],
    }),
    getTeacherClasses: builder.query({
      query: () => "/classes",
      providesTags: ["Teachers"],
    }),
    getAttendance: builder.query({
      query: ({ classId, date }) => `http://localhost:5000/api/attendance/${classId}/${date}`,
    }),
    saveAttendance: builder.mutation({
      query: (body) => ({
        url: "http://localhost:5000/api/attendance",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Attendance"],
    }),
    getTeachers: builder.query({
      query: () => "/",
      providesTags: ["Teachers"],
    }),
    getTeacher: builder.query({
      query: (id) => `/${id}`,
      providesTags: (id) => [{ type: "Teachers", id }],
    }),
    createTeacher: builder.mutation({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Teachers"],
    }),
    updateTeacher: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Teachers"],
    }),
    deleteTeacher: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Teachers"],
    }),
  }),
});

export const {
  useGetTeachersQuery,
  useGetTeacherQuery,
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
  useGetTeacherDashboardStatsQuery,
  useGetTeacherClassesQuery,
  useGetAttendanceQuery,
  useSaveAttendanceMutation,
} = teacherApi;

