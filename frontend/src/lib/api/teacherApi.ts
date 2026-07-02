import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/constants";

export const teacherApi = createApi({
  reducerPath: "teacherApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/teachers`,
    prepareHeaders: (headers) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Teachers", "Attendance"],
  endpoints: (builder) => ({
    getTeacherDashboardStats: builder.query({
      query: ({ month, year }: { month?: string | number; year?: string | number } = {}) => {
        const params = new URLSearchParams();
        if (month) params.append("month", month.toString());
        if (year) params.append("year", year.toString());
        const queryStr = params.toString();
        return `/dashboard/stats${queryStr ? `?${queryStr}` : ""}`;
      },
      providesTags: ["Teachers"],
    }),
    getTeacherClasses: builder.query<any, void>({
      query: () => "/classes",
      providesTags: ["Teachers"],
    }),
    getTeacherPrograms: builder.query<any, void>({
      query: () => "/programs",
      providesTags: ["Teachers"],
    }),
    getAttendance: builder.query({
      query: ({ classId, date }) => `../attendance/${classId}/${date}`,
    }),
    saveAttendance: builder.mutation({
      query: (body) => ({
        url: "../attendance",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Attendance"],
    }),
    getAttendanceReport: builder.query({
      query: (params?: { from_date?: string; to_date?: string; class_name?: string; status?: string }) => ({
        url: "../attendance/report",
        params,
      }),
    }),
    getTeachers: builder.query<any, void>({
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
    bulkActionTeachers: builder.mutation({
      query: (body) => ({
        url: "/bulk-action",
        method: "POST",
        body,
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
  useBulkActionTeachersMutation,
  useGetTeacherDashboardStatsQuery,
  useGetTeacherClassesQuery,
  useGetTeacherProgramsQuery,
  useGetAttendanceQuery,
  useSaveAttendanceMutation,
  useGetAttendanceReportQuery,
} = teacherApi;

