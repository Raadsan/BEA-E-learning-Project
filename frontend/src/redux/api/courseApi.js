import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/constants";

export const courseApi = createApi({
  reducerPath: "courseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/courses`,
    prepareHeaders: (headers) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Courses"],
  endpoints: (builder) => ({
    getCourses: builder.query({
      query: () => "/",
      providesTags: ["Courses"],
    }),
    getCoursesBySubprogramId: builder.query({
      query: (subprogramId) => `/subprogram/${subprogramId}`,
      providesTags: ["Courses"],
    }),
    getCourse: builder.query({
      query: (id) => `/${id}`,
      providesTags: (id) => [{ type: "Courses", id }],
    }),
    createCourse: builder.mutation({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Courses"],
    }),
    updateCourse: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Courses"],
    }),
    deleteCourse: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Courses"],
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useGetCoursesBySubprogramIdQuery,
  useGetCourseQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
} = courseApi;

