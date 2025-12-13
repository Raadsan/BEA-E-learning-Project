import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const studentApi = createApi({
  reducerPath: "studentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/students",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Students"],
  endpoints: (builder) => ({
    // GET ALL students
    getStudents: builder.query({
      query: () => "/",
      providesTags: ["Students"],
      transformResponse: (response) => {
        if (response.success) {
          return response.students;
        }
        return response;
      },
    }),

    // GET SINGLE student
    getStudent: builder.query({
      query: (id) => `/${id}`,
      providesTags: (id) => [{ type: "Students", id }],
      transformResponse: (response) => {
        if (response.success) {
          return response.student;
        }
        return response;
      },
    }),

    // CREATE student
    createStudent: builder.mutation({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Students"],
    }),

    // UPDATE student
    updateStudent: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Students"],
    }),

    // DELETE student
    deleteStudent: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Students"],
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useGetStudentQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
} = studentApi;

