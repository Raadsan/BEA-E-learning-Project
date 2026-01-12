import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Get token from localStorage
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export const studentApi = createApi({
  reducerPath: "studentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/students",
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
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

    // APPROVE student
    approveStudent: builder.mutation({
      query: (id) => ({
        url: `/${id}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: ["Students"],
    }),

    // REJECT student
    rejectStudent: builder.mutation({
      query: (id) => ({
        url: `/${id}/reject`,
        method: "PATCH",
      }),
      invalidatesTags: ["Students"],
    }),

    // GET STUDENT PROGRESS
    getStudentProgress: builder.query({
      query: () => "/progress",
      providesTags: ["Students"],
      transformResponse: (response) => {
        if (response.success) {
          return response.students;
        }
        return response;
      },
    }),

    // GET SEX DISTRIBUTION
    getSexDistribution: builder.query({
      query: ({ program_id, class_id } = {}) => {
        const params = new URLSearchParams();
        if (program_id) params.append("program_id", program_id);
        if (class_id) params.append("class_id", class_id);
        return `/sex-distribution?${params.toString()}`;
      },
      providesTags: ["Students"],
      transformResponse: (response) => {
        if (response.success) {
          return response.data;
        }
        return response;
      },
    }),

    // GET TOP STUDENTS
    getTopStudents: builder.query({
      query: ({ limit = 10, program_id, class_id } = {}) => {
        const params = new URLSearchParams();
        params.append("limit", limit);
        if (program_id) params.append("program_id", program_id);
        if (class_id) params.append("class_id", class_id);
        return `/top-students?${params.toString()}`;
      },
      providesTags: ["Students"],
      transformResponse: (response) => {
        if (response.success) {
          return response.students;
        }
        return response;
      },
    }),

    // GET STUDENT LOCATIONS
    getStudentLocations: builder.query({
      query: ({ program_id } = {}) => {
        const params = new URLSearchParams();
        if (program_id) params.append("program_id", program_id);
        return `/locations?${params.toString()}`;
      },
      providesTags: ["Students"],
      transformResponse: (response) => {
        if (response.success) {
          return response.locations;
        }
        return response;
      },
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useGetStudentQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useApproveStudentMutation,
  useRejectStudentMutation,
  useGetStudentProgressQuery,
  useGetSexDistributionQuery,
  useGetTopStudentsQuery,
  useGetStudentLocationsQuery,
} = studentApi;

