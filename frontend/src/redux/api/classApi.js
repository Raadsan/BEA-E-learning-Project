import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const classApi = createApi({
  reducerPath: "classApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/classes",
    prepareHeaders: (headers) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Classes", "ClassSchedules"],
  endpoints: (builder) => ({
    getClasses: builder.query({
      query: () => "/",
      providesTags: ["Classes"],
    }),
    getClassesByCourseId: builder.query({
      query: (courseId) => `/course/${courseId}`,
      providesTags: ["Classes"],
    }),
    getClass: builder.query({
      query: (id) => `/${id}`,
      providesTags: (id) => [{ type: "Classes", id }],
    }),
    createClass: builder.mutation({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Classes"],
    }),
    updateClass: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Classes"],
    }),
    deleteClass: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Classes"],
    }),
    // Class Schedule endpoints
    getClassSchedules: builder.query({
      query: (classId) => `/${classId}/schedules`,
      providesTags: (classId) => [{ type: "ClassSchedules", id: classId }],
    }),
    getAllClassSchedules: builder.query({
      query: () => "/all-schedules",
      providesTags: ["ClassSchedules"],
    }),
    createClassSchedule: builder.mutation({
      query: ({ classId, ...body }) => ({
        url: `/${classId}/schedules`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { classId }) => [
        { type: "ClassSchedules", id: classId },
        "ClassSchedules",
        "Classes"
      ],
    }),
    updateClassSchedule: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/schedules/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["ClassSchedules", "Classes"],
    }),
    deleteClassSchedule: builder.mutation({
      query: (id) => ({
        url: `/schedules/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ClassSchedules", "Classes"],
    }),
    getStudentSchedules: builder.query({
      query: () => "/student/schedules",
      providesTags: ["ClassSchedules"],
    }),
  }),
});

export const {
  useGetClassesQuery,
  useGetClassesByCourseIdQuery,
  useGetClassQuery,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
  useGetClassSchedulesQuery,
  useGetAllClassSchedulesQuery,
  useCreateClassScheduleMutation,
  useUpdateClassScheduleMutation,
  useDeleteClassScheduleMutation,
  useGetStudentSchedulesQuery,
} = classApi;

