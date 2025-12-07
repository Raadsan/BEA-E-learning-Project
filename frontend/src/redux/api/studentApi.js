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
    }),

    // GET SINGLE student
    getStudent: builder.query({
      query: (id) => `/${id}`,
      providesTags: (id) => [{ type: "Students", id }],
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useGetStudentQuery,
} = studentApi;

