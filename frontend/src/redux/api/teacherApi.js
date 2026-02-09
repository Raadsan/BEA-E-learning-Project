import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/constants";

export const teacherApi = createApi({
  reducerPath: "teacherApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/teachers`,
    prepareHeaders: (headers) => {
      const token = typeof window !== `undefined" ? localStorage.getItem("token") : null;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Teachers"],
  endpoints: (builder) => ({
    getTeacherDashboardStats: builder.query({
      query: ({ month, year } = {}) => {
        const params = new URLSearchParams();
        if (month) params.append("month", month);
        if (year) params.append("year", year);
        const queryStr = params.toString();
        return `/dashboard/stats${queryStr ? `?${queryStr}` : ""}`;
      },
      providesTags: ["Teachers"],
    }),
    getTeacherClasses: builder.query({
      query: () => "/classes",
      providesTags: ["Teachers"],
    }),
    getTeacherPrograms: builder.query({
      query: () => "/programs",
      providesTags: ["Teachers"],
    }),
    getAttendance: builder.query({
      query: ({ classId, date }) => `${API_URL}/attendance/${classId}/${date}`,
    }),
    saveAttendance: builder.mutation({
      query: (body) => ({
        url: "${API_URL}/attendance",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Attendance"],
    }),
    getAttendanceReport: builder.query({
      query: () => "${API_URL}/attendance/report",
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
      query: (data) => {
        let id;
        let body;

        if (data instanceof FormData) {
          id = data.get("id");
          body = data;
        } else {
          const { id: dataId, ...rest } = data;
          id = dataId;
          body = rest;
        }

        return {
          url: `/${id}`,
          method: "PUT",
          body,
        };
      },
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
  useGetTeacherProgramsQuery,
  useGetAttendanceQuery,
  useSaveAttendanceMutation,
  useGetAttendanceReportQuery,
} = teacherApi;

